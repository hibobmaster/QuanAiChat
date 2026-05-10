import fs from "fs";
import path from "path";

const configSource = fs.readFileSync(
  path.join(__dirname, "../app/store/config.ts"),
  "utf8",
);
const chatSource = fs.readFileSync(
  path.join(__dirname, "../app/store/chat.ts"),
  "utf8",
);
const maskSource = fs.readFileSync(
  path.join(__dirname, "../app/store/mask.ts"),
  "utf8",
);
const modelConfigBlock =
  configSource.match(/modelConfig:\s*{[\s\S]*?style:/)?.[0] ?? "";

describe("model configuration defaults", () => {
  test("uses DeepSeek v4 pro for chat and v4 flash for summary by default", () => {
    expect(modelConfigBlock).toContain('model: "deepseek-v4-pro"');
    expect(modelConfigBlock).toContain("providerName: ServiceProvider.DeepSeek");
    expect(modelConfigBlock).toContain('compressModel: "deepseek-v4-flash"');
    expect(modelConfigBlock).toContain(
      "compressProviderName: ServiceProvider.DeepSeek",
    );
  });

  test("uses temperature 1 and one million max tokens by default", () => {
    expect(modelConfigBlock).toContain("temperature: 1");
    expect(modelConfigBlock).toContain("max_tokens: 1000000");
    expect(modelConfigBlock).toContain("compressMessageLengthThreshold: 100000");
  });

  test("allows one million max tokens in the web UI validator", () => {
    expect(configSource).toContain("limitNumber(x, 0, 1000000, 1000000)");
  });

  test("does not expose deprecated penalty defaults or validators", () => {
    expect(modelConfigBlock).not.toContain("presence_penalty");
    expect(modelConfigBlock).not.toContain("frequency_penalty");
    expect(configSource).not.toContain("presence_penalty(x:");
    expect(configSource).not.toContain("frequency_penalty(x:");
  });

  test("migrates existing app config users to the current DeepSeek defaults", () => {
    expect(configSource).toContain("version: 4.7");
    expect(configSource).toContain("if (version < 4.7)");
    expect(configSource).toContain(
      'state.modelConfig.model = "deepseek-v4-pro"',
    );
    expect(configSource).toContain(
      "state.modelConfig.providerName = ServiceProvider.DeepSeek",
    );
    expect(configSource).toContain("state.modelConfig.temperature = 1");
    expect(configSource).toContain("state.modelConfig.max_tokens = 1000000");
    expect(configSource).toContain(
      "state.modelConfig.compressMessageLengthThreshold = 100000",
    );
    expect(configSource).toContain(
      'state.modelConfig.compressModel = "deepseek-v4-flash"',
    );
    expect(configSource).toContain(
      "state.modelConfig.compressProviderName = ServiceProvider.DeepSeek",
    );
  });

  test("migrates existing chat sessions and user masks to the current DeepSeek defaults", () => {
    expect(chatSource).toContain("version: 3.7");
    expect(chatSource).toContain("if (version < 3.7)");
    expect(chatSource).toContain(
      's.mask.modelConfig.model = "deepseek-v4-pro"',
    );
    expect(chatSource).toContain(
      "s.mask.modelConfig.providerName = ServiceProvider.DeepSeek",
    );
    expect(chatSource).toContain("s.mask.modelConfig.temperature = 1");
    expect(chatSource).toContain("s.mask.modelConfig.max_tokens = 1000000");
    expect(chatSource).toContain(
      "s.mask.modelConfig.compressMessageLengthThreshold = 100000",
    );
    expect(chatSource).toContain(
      's.mask.modelConfig.compressModel = "deepseek-v4-flash"',
    );
    expect(chatSource).toContain(
      "s.mask.modelConfig.compressProviderName = ServiceProvider.DeepSeek",
    );

    expect(maskSource).toContain("version: 3.2");
    expect(maskSource).toContain("if (version < 3.2)");
    expect(maskSource).toContain('m.modelConfig.model = "deepseek-v4-pro"');
    expect(maskSource).toContain(
      "m.modelConfig.providerName = ServiceProvider.DeepSeek",
    );
    expect(maskSource).toContain("m.modelConfig.temperature = 1");
    expect(maskSource).toContain("m.modelConfig.max_tokens = 1000000");
    expect(maskSource).toContain(
      "m.modelConfig.compressMessageLengthThreshold = 100000",
    );
    expect(maskSource).toContain(
      'm.modelConfig.compressModel = "deepseek-v4-flash"',
    );
    expect(maskSource).toContain(
      "m.modelConfig.compressProviderName = ServiceProvider.DeepSeek",
    );
  });
});
