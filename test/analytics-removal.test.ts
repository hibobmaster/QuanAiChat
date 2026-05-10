import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("analytics integrations", () => {
  test("does not import analytics runtime packages", () => {
    const layout = read("app/layout.tsx");
    const page = read("app/page.tsx");
    const authEvents = read("app/utils/auth-settings-events.ts");

    expect(layout).not.toContain("@vercel/speed-insights");
    expect(layout).not.toContain("@next/third-parties");
    expect(page).not.toContain("@vercel/analytics");
    expect(authEvents).not.toContain("@next/third-parties");
  });

  test("does not expose analytics environment configuration", () => {
    const serverConfig = read("app/config/server.ts");
    const constants = read("app/constant.ts");

    expect(serverConfig).not.toContain("GTM_ID");
    expect(serverConfig).not.toContain("GA_ID");
    expect(serverConfig).not.toContain("gtmId");
    expect(serverConfig).not.toContain("gaId");
    expect(constants).not.toContain("DEFAULT_GA_ID");
  });

  test("does not keep analytics dependencies", () => {
    const pkg = JSON.parse(read("package.json"));

    expect(pkg.dependencies).not.toHaveProperty("@next/third-parties");
    expect(pkg.dependencies).not.toHaveProperty("@vercel/analytics");
    expect(pkg.dependencies).not.toHaveProperty("@vercel/speed-insights");
  });
});
