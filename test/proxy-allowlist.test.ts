import { resolveAllowedProxyBaseUrl } from "../app/api/proxy-allowlist";

const ORIGINAL_ALLOWED_PROXY_ORIGINS = process.env.ALLOWED_PROXY_ORIGINS;

describe("resolveAllowedProxyBaseUrl", () => {
  afterEach(() => {
    process.env.ALLOWED_PROXY_ORIGINS = ORIGINAL_ALLOWED_PROXY_ORIGINS;
  });

  test.each([
    "https://api.openai.com",
    "https://generativelanguage.googleapis.com",
    "https://api.deepseek.com",
    "https://dashscope.aliyuncs.com",
  ])("allows built-in origin %s", (origin) => {
    expect(resolveAllowedProxyBaseUrl(`${origin}/v1/chat?x=1`)).toBe(origin);
  });

  test("allows Azure OpenAI resource origins", () => {
    expect(
      resolveAllowedProxyBaseUrl(
        "https://my-resource-1.openai.azure.com/openai/deployments/chat",
      ),
    ).toBe("https://my-resource-1.openai.azure.com");
  });

  test("allows configured custom origins from ALLOWED_PROXY_ORIGINS", () => {
    process.env.ALLOWED_PROXY_ORIGINS =
      "https://proxy.example.com, https://llm.example.net/v1";

    expect(resolveAllowedProxyBaseUrl("https://llm.example.net/chat")).toBe(
      "https://llm.example.net",
    );
  });

  test.each([null, "not a url", "http://api.openai.com", "https://evil.test"])(
    "rejects %s",
    (rawBaseUrl) => {
      expect(resolveAllowedProxyBaseUrl(rawBaseUrl)).toBeNull();
    },
  );
});
