import { DEFAULT_MODELS, DEEPSEEK_SUMMARIZE_MODEL } from "../app/constant";
import * as deepseekPlatform from "../app/client/platforms/deepseek";
import { REQUEST_TIMEOUT_MS_FOR_THINKING } from "../app/constant";
import { getTimeoutMSByModel } from "../app/utils";

describe("DeepSeek default models", () => {
  const deepseekModelNames = DEFAULT_MODELS.filter(
    (model) => model.provider.providerName === "DeepSeek",
  ).map((model) => model.name);

  test("uses v4 models instead of deprecated model names", () => {
    expect(deepseekModelNames).toEqual([
      "deepseek-v4-flash",
      "deepseek-v4-pro",
    ]);
    expect(deepseekModelNames).not.toContain("deepseek-chat");
    expect(deepseekModelNames).not.toContain("deepseek-reasoner");
    expect(DEEPSEEK_SUMMARIZE_MODEL).toBe("deepseek-v4-flash");
  });
});

describe("DeepSeek request payload", () => {
  test("sets max reasoning effort for deepseek-v4-pro", () => {
    const createDeepSeekRequestPayload = (
      deepseekPlatform as {
        createDeepSeekRequestPayload?: (args: unknown) => unknown;
      }
    ).createDeepSeekRequestPayload;

    expect(typeof createDeepSeekRequestPayload).toBe("function");
    expect(
      createDeepSeekRequestPayload?.({
        messages: [{ role: "user", content: "hello" }],
        stream: true,
        modelConfig: {
          model: "deepseek-v4-pro",
          temperature: 0.5,
          presence_penalty: 0,
          frequency_penalty: 0,
          top_p: 1,
        },
      }),
    ).toMatchObject({
      model: "deepseek-v4-pro",
      thinking: {
        type: "enabled",
      },
      reasoning_effort: "max",
    });
  });

  test("does not add thinking settings for deepseek-v4-flash", () => {
    const createDeepSeekRequestPayload = (
      deepseekPlatform as {
        createDeepSeekRequestPayload?: (args: unknown) => any;
      }
    ).createDeepSeekRequestPayload;

    expect(
      createDeepSeekRequestPayload?.({
        messages: [{ role: "user", content: "hello" }],
        stream: false,
        modelConfig: {
          model: "deepseek-v4-flash",
          temperature: 0.5,
          presence_penalty: 0,
          frequency_penalty: 0,
          top_p: 1,
        },
      }),
    ).toEqual(
      expect.not.objectContaining({
        thinking: expect.anything(),
        reasoning_effort: expect.anything(),
      }),
    );
  });
});

describe("DeepSeek model timeout", () => {
  test("uses the thinking timeout for deepseek-v4-pro", () => {
    expect(getTimeoutMSByModel("deepseek-v4-pro")).toBe(
      REQUEST_TIMEOUT_MS_FOR_THINKING,
    );
  });
});
