import { ServiceProvider } from "../app/constant";
import { resolveConfiguredSummaryModel } from "../app/utils/model";
import { getSummarizeModel } from "../app/store/chat";

describe("summary model configuration", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  test("falls back to the current chat model when no summary model is configured", () => {
    expect(
      getSummarizeModel("gemini-3.1-flash-lite", ServiceProvider.Google),
    ).toEqual(["gemini-3.1-flash-lite", ServiceProvider.Google]);
  });

  test("uses the configured summary model from server metadata", () => {
    const meta = document.createElement("meta");
    meta.name = "server-config";
    meta.content = JSON.stringify({
      enabledProviders: [ServiceProvider.DeepSeek],
      summaryModel: "deepseek-v4-pro@DeepSeek",
    });
    document.head.appendChild(meta);

    expect(
      getSummarizeModel("gemini-3.1-flash-lite", ServiceProvider.Google),
    ).toEqual(["deepseek-v4-pro", ServiceProvider.DeepSeek]);
  });

  test("resolves valid summary model names to a concrete provider", () => {
    expect(
      resolveConfiguredSummaryModel(
        "deepseek-v4-pro",
        "",
        [ServiceProvider.DeepSeek],
      ),
    ).toBe("deepseek-v4-pro@DeepSeek");
  });

  test("resolves valid summary model names with provider suffix", () => {
    expect(
      resolveConfiguredSummaryModel(
        "gemini-3.1-flash-lite@Google",
        "",
        [ServiceProvider.Google],
      ),
    ).toBe("gemini-3.1-flash-lite@Google");
  });

  test("rejects unavailable summary models", () => {
    expect(
      resolveConfiguredSummaryModel(
        "deepseek-v4-pro",
        "-deepseek-v4-pro@deepseek",
        [ServiceProvider.DeepSeek],
      ),
    ).toBe("");
  });

  test("rejects unknown summary models", () => {
    expect(
      resolveConfiguredSummaryModel(
        "missing-model",
        "",
        [ServiceProvider.DeepSeek],
      ),
    ).toBe("");
  });
});
