import {
  createDeepSeekToolResultMessages,
  createGeminiFunctionResponseContent,
  createGeminiRequestPayload,
  getDeepSeekNativeTools,
  getGeminiNativeTools,
  mergeDeepSeekToolCallDelta,
  nativeToolFunctions,
  RUN_PYTHON_TOOL_NAME,
} from "../app/client/native-tools";

describe("native provider tools", () => {
  test("exposes the sandboxed Python tool in DeepSeek's OpenAI-compatible format", () => {
    expect(getDeepSeekNativeTools()).toEqual([
      {
        type: "function",
        function: expect.objectContaining({
          name: RUN_PYTHON_TOOL_NAME,
          parameters: expect.objectContaining({
            type: "object",
            required: ["code"],
          }),
        }),
      },
    ]);
  });

  test("exposes the sandboxed Python tool in Gemini function declaration format", () => {
    expect(getGeminiNativeTools()).toEqual([
      {
        functionDeclarations: [
          expect.objectContaining({
            name: RUN_PYTHON_TOOL_NAME,
            parameters: expect.objectContaining({
              type: "object",
              required: ["code"],
            }),
          }),
        ],
      },
    ]);
  });

  test("calls the server-side Python endpoint from the native tool handler", async () => {
    const fetchMock = jest.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ output: 3 }),
    } as Response);

    await expect(
      nativeToolFunctions[RUN_PYTHON_TOOL_NAME]({ code: "1 + 2" }),
    ).resolves.toMatchObject({
      data: { output: 3 },
      status: 200,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tools/python",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "1 + 2" }),
      }),
    );
  });
});

describe("DeepSeek tool call conversion", () => {
  test("merges streamed tool call deltas by index", () => {
    const calls: any[] = [];

    mergeDeepSeekToolCallDelta(calls, {
      index: 0,
      id: "call_1",
      type: "function",
      function: { name: RUN_PYTHON_TOOL_NAME, arguments: '{"code":"' },
    });
    mergeDeepSeekToolCallDelta(calls, {
      index: 0,
      function: { arguments: '1 + 2"}' },
    });

    expect(calls).toEqual([
      {
        id: "call_1",
        type: "function",
        function: {
          name: RUN_PYTHON_TOOL_NAME,
          arguments: '{"code":"1 + 2"}',
        },
      },
    ]);
  });

  test("creates assistant and tool messages for DeepSeek follow-up requests", () => {
    expect(
      createDeepSeekToolResultMessages(
        {
          role: "assistant",
          tool_calls: [
            {
              id: "call_1",
              type: "function",
              function: {
                name: RUN_PYTHON_TOOL_NAME,
                arguments: '{"code":"1 + 2"}',
              },
            },
          ],
        },
        [
          {
            role: "tool",
            name: RUN_PYTHON_TOOL_NAME,
            tool_call_id: "call_1",
            content: '{"output":3}',
          },
        ],
      ),
    ).toEqual([
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_1",
            type: "function",
            function: {
              name: RUN_PYTHON_TOOL_NAME,
              arguments: '{"code":"1 + 2"}',
            },
          },
        ],
      },
      {
        role: "tool",
        name: RUN_PYTHON_TOOL_NAME,
        tool_call_id: "call_1",
        content: '{"output":3}',
      },
    ]);
  });
});

describe("Gemini tool call conversion", () => {
  test("adds native tool declarations to Gemini requests", () => {
    expect(
      createGeminiRequestPayload({
        contents: [{ role: "user", parts: [{ text: "calculate" }] }],
        generationConfig: { temperature: 1 },
        safetySettings: [],
      }),
    ).toMatchObject({
      tools: getGeminiNativeTools(),
    });
  });

  test("creates functionResponse content with the Gemini function call id", () => {
    expect(
      createGeminiFunctionResponseContent(
        {
          id: "call_1",
          function: {
            name: RUN_PYTHON_TOOL_NAME,
          },
        },
        '{"output":3}',
      ),
    ).toEqual({
      role: "user",
      parts: [
        {
          functionResponse: {
            id: "call_1",
            name: RUN_PYTHON_TOOL_NAME,
            response: { result: '{"output":3}' },
          },
        },
      ],
    });
  });
});
