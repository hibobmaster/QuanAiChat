import fs from "fs";
import path from "path";

const configSource = fs.readFileSync(
  path.join(__dirname, "../app/store/config.ts"),
  "utf8",
);
const modelConfigBlock =
  configSource.match(/modelConfig:\s*{[\s\S]*?style:/)?.[0] ?? "";

describe("model configuration defaults", () => {
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
});
