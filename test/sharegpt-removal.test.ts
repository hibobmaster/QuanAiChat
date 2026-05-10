import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("ShareGPT export removal", () => {
  test("does not expose ShareGPT from the message exporter", () => {
    const exporter = read("app/components/exporter.tsx");
    const enLocale = read("app/locales/en.ts");
    const cnLocale = read("app/locales/cn.ts");

    expect(exporter).not.toContain("Locale.Export.Share");
    expect(exporter).not.toContain("RenderExport");
    expect(exporter).not.toContain("getClientApi");
    expect(enLocale).not.toContain("Share to ShareGPT");
    expect(cnLocale).not.toContain("分享到 ShareGPT");
  });

  test("does not keep ShareGPT API plumbing", () => {
    const api = read("app/client/api.ts");
    const nextConfig = read("next.config.mjs");

    expect(api).not.toContain("sharegpt");
    expect(api).not.toContain("shareg.pt");
    expect(nextConfig).not.toContain("sharegpt");
  });
});
