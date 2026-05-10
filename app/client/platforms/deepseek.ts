"use client";
// azure and openai, using same models. so using same LLMApi.
import {
  ApiPath,
  DEEPSEEK_BASE_URL,
  DeepSeek,
  ServiceProvider,
} from "@/app/constant";
import { useAppConfig, useChatStore } from "@/app/store";
import { streamWithThink } from "@/app/utils/chat";
import { ChatOptions, getHeaders, LLMApi, LLMModel } from "../api";
import { getClientConfig } from "@/app/config/client";
import {
  getMessageTextContent,
  getMessageTextContentWithoutThinking,
  getTimeoutMSByModel,
} from "@/app/utils";
import { RequestPayload } from "./types";
import { fetch } from "@/app/utils/stream";
import {
  createDeepSeekToolResultMessages,
  getDeepSeekNativeTools,
  mergeDeepSeekToolCallDelta,
  nativeToolFunctions,
} from "../native-tools";

type DeepSeekModelConfig = {
  model: string;
  temperature?: number;
  top_p?: number;
};

export function createDeepSeekRequestPayload({
  messages,
  stream,
  modelConfig,
}: {
  messages: ChatOptions["messages"];
  stream?: boolean;
  modelConfig: DeepSeekModelConfig;
}): RequestPayload {
  const payload: RequestPayload = {
    messages,
    stream,
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    top_p: modelConfig.top_p,
    tools: getDeepSeekNativeTools(),
    // max_tokens: Math.max(modelConfig.max_tokens, 1024),
    // Please do not ask me why not send max_tokens, no reason, this param is just shit, I dont want to explain anymore.
  };

  if (modelConfig.model === "deepseek-v4-pro") {
    payload.thinking = {
      type: "enabled",
    };
    payload.reasoning_effort = "max";
  }

  return payload;
}

export class DeepSeekApi implements LLMApi {
  private disableListModels = true;

  path(path: string): string {
    const isApp = !!getClientConfig()?.isApp;
    const apiPath = ApiPath.DeepSeek;
    let baseUrl = isApp ? DEEPSEEK_BASE_URL : apiPath;

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }
    if (!baseUrl.startsWith("http") && !baseUrl.startsWith(ApiPath.DeepSeek)) {
      baseUrl = "https://" + baseUrl;
    }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  async chat(options: ChatOptions) {
    const messages: ChatOptions["messages"] = [];
    for (const v of options.messages) {
      if (v.role === "assistant") {
        const content = getMessageTextContentWithoutThinking(v);
        messages.push({ role: v.role, content });
      } else {
        const content = getMessageTextContent(v);
        messages.push({ role: v.role, content });
      }
    }

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
        providerName: options.config.providerName,
      },
    };

    const requestPayload = createDeepSeekRequestPayload({
      messages,
      stream: options.config.stream,
      modelConfig,
    });

    console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(DeepSeek.ChatPath);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(false, ServiceProvider.DeepSeek),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        getTimeoutMSByModel(options.config.model),
      );

      if (shouldStream) {
        let reasoningContent = "";
        return streamWithThink(
          chatPath,
          requestPayload,
          getHeaders(false, ServiceProvider.DeepSeek),
          getDeepSeekNativeTools(),
          nativeToolFunctions,
          controller,
          // parseSSE
          (text: string, runTools: any[]) => {
            const json = JSON.parse(text);
            const choices = json.choices as Array<{
              delta: {
                content: string | null;
                reasoning_content: string | null;
                tool_calls?: any[];
              };
            }>;
            const reasoning = choices[0]?.delta?.reasoning_content;
            const content = choices[0]?.delta?.content;
            const toolCalls = choices[0]?.delta?.tool_calls;

            if (Array.isArray(toolCalls)) {
              toolCalls.forEach((toolCall) =>
                mergeDeepSeekToolCallDelta(runTools, toolCall),
              );
            }

            // Skip if both content and reasoning_content are empty or null
            if (
              (!reasoning || reasoning.length === 0) &&
              (!content || content.length === 0)
            ) {
              return {
                isThinking: false,
                content: "",
              };
            }

            if (reasoning && reasoning.length > 0) {
              reasoningContent += reasoning;
              return {
                isThinking: true,
                content: reasoning,
              };
            } else if (content && content.length > 0) {
              return {
                isThinking: false,
                content: content,
              };
            }

            return {
              isThinking: false,
              content: "",
            };
          },
          (requestPayload, toolCallMessage, toolCallResult) => {
            const messages = createDeepSeekToolResultMessages(
              {
                ...toolCallMessage,
                ...(reasoningContent
                  ? { reasoning_content: reasoningContent }
                  : {}),
              },
              toolCallResult,
            );
            requestPayload.messages.push(...messages);
            reasoningContent = "";
          },
          options,
        );
      } else {
        let res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        let resJson = await res.json();
        for (let i = 0; i < 5; i += 1) {
          const message = resJson?.choices?.at(0)?.message;
          const toolCalls = message?.tool_calls;
          if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
            break;
          }

          const toolResults = await Promise.all(
            toolCalls.map(async (tool: any) => {
              const handler = nativeToolFunctions[tool.function.name];
              if (!handler) {
                return {
                  name: tool.function.name,
                  role: "tool",
                  content: `Tool ${tool.function.name} is not available`,
                  tool_call_id: tool.id,
                };
              }

              const result = await handler(
                tool.function.arguments
                  ? JSON.parse(tool.function.arguments)
                  : {},
              );
              return {
                name: tool.function.name,
                role: "tool",
                content:
                  typeof result.data === "string"
                    ? result.data
                    : JSON.stringify(result.data),
                tool_call_id: tool.id,
              };
            }),
          );

          requestPayload.messages.push(
            ...createDeepSeekToolResultMessages(
              {
                role: "assistant",
                reasoning_content: message.reasoning_content,
                tool_calls: toolCalls,
              },
              toolResults,
            ),
          );

          res = await fetch(chatPath, {
            ...chatPayload,
            body: JSON.stringify(requestPayload),
          });
          resJson = await res.json();
        }

        const message = this.extractMessage(resJson);
        options.onFinish(message, res);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
  async usage() {
    return {
      used: 0,
      total: 0,
    };
  }

  async models(): Promise<LLMModel[]> {
    return [];
  }
}
