import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("brand name and logo", () => {
  test("uses QuanAiChat for visible brand surfaces", () => {
    const files = [
      "app/layout.tsx",
      "app/components/sidebar.tsx",
      "app/components/exporter.tsx",
      "app/components/artifacts.tsx",
      "app/mcp/logger.ts",
      "public/site.webmanifest",
    ];

    for (const file of files) {
      const content = read(file);
      expect(content).toContain("QuanAiChat");
      expect(content).not.toContain("QuanQuanChat");
    }
  });

  test("uses the QuanAiChat logo asset names", () => {
    expect(fs.existsSync(path.join(root, "assets/quanai.webp"))).toBe(true);
    expect(fs.existsSync(path.join(root, "public/quanai.webp"))).toBe(true);
    expect(fs.existsSync(path.join(root, "app/favicon.ico"))).toBe(true);
    expect(read("app/layout.tsx")).toContain("/favicon.ico");
    expect(read("app/components/sidebar.tsx")).toContain("assets/quanai.webp");
  });
});
