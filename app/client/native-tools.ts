export const RUN_PYTHON_TOOL_NAME = "run_python";

type JsonObject = Record<string, unknown>;

type NativeToolResponse = {
  data: unknown;
  status: number;
  statusText?: string;
};

const RUN_PYTHON_DESCRIPTION =
  "Run short Python code in a Monty sandbox. The code has no ambient filesystem, network, or environment access. Return the final expression value.";

const RUN_PYTHON_PARAMETERS = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description:
        "Python code to execute. The final expression is returned as output.",
    },
  },
  required: ["code"],
} as const;

export function getDeepSeekNativeTools() {
  return [
    {
      type: "function",
      function: {
        name: RUN_PYTHON_TOOL_NAME,
        description: RUN_PYTHON_DESCRIPTION,
        parameters: RUN_PYTHON_PARAMETERS,
      },
    },
  ];
}

export function getGeminiNativeTools() {
  return [
    {
      functionDeclarations: [
        {
          name: RUN_PYTHON_TOOL_NAME,
          description: RUN_PYTHON_DESCRIPTION,
          parameters: RUN_PYTHON_PARAMETERS,
        },
      ],
    },
  ];
}

async function runPythonTool(args: JsonObject): Promise<NativeToolResponse> {
  const response = await fetch("/api/tools/python", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = await response.json().catch(() => response.statusText);

  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

export const nativeToolFunctions: Record<
  string,
  (args: JsonObject) => Promise<NativeToolResponse>
> = {
  [RUN_PYTHON_TOOL_NAME]: runPythonTool,
};

export function mergeDeepSeekToolCallDelta(
  calls: any[],
  delta: {
    index?: number;
    id?: string;
    type?: string;
    function?: {
      name?: string;
      arguments?: string;
    };
  },
) {
  const index = delta.index ?? calls.length;
  const current = (calls[index] ??= {
    id: delta.id,
    type: delta.type ?? "function",
    function: {
      name: "",
      arguments: "",
    },
  });

  if (delta.id) current.id = delta.id;
  if (delta.type) current.type = delta.type;
  if (delta.function?.name) current.function.name += delta.function.name;
  if (delta.function?.arguments) {
    current.function.arguments += delta.function.arguments;
  }
}

export function createDeepSeekToolResultMessages(
  toolCallMessage: {
    role: string;
    tool_calls: any[];
    reasoning_content?: string;
  },
  toolCallResult: any[],
) {
  return [
    {
      role: "assistant",
      content: null,
      ...(toolCallMessage.reasoning_content
        ? { reasoning_content: toolCallMessage.reasoning_content }
        : {}),
      tool_calls: toolCallMessage.tool_calls,
    },
    ...toolCallResult,
  ];
}

export function createGeminiRequestPayload<T extends JsonObject>(payload: T) {
  return {
    ...payload,
    tools: getGeminiNativeTools(),
  };
}

export function createGeminiFunctionResponseContent(
  tool: {
    id?: string;
    function: {
      name: string;
    };
  },
  content: string,
) {
  return {
    role: "user",
    parts: [
      {
        functionResponse: {
          ...(tool.id ? { id: tool.id } : {}),
          name: tool.function.name,
          response: {
            result: content,
          },
        },
      },
    ],
  };
}

export function createGeminiFunctionCallTool(
  functionCall: { id?: string; name: string; args?: JsonObject },
  modelContent?: unknown,
) {
  return {
    id: functionCall.id ?? `${functionCall.name}-${Date.now()}`,
    type: "function",
    function: {
      name: functionCall.name,
      arguments: JSON.stringify(functionCall.args ?? {}),
    },
    geminiModelContent: modelContent,
  };
}
