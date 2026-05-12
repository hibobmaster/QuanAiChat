import fs from "node:fs";
import path from "node:path";

function readProjectFile(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function collectFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if ([".git", ".next", "node_modules"].includes(entry.name)) {
        return [];
      }

      return collectFiles(fullPath);
    }

    return fullPath;
  });
}

describe("refreshed UI style stack", () => {
  const layout = readProjectFile("app/layout.tsx");
  const packageJson = JSON.parse(readProjectFile("package.json"));
  const tailwindGlobals = readProjectFile("app/globals.css");
  const uiLib = readProjectFile("app/components/ui-lib.tsx");

  it("uses a Tailwind entry with plain CSS companion styles", () => {
    expect(layout).toContain('import "./globals.css"');
    expect(layout).toContain('import "./styles/markdown.css"');
    expect(layout).toContain('import "./styles/highlight.css"');
    expect(layout).not.toContain(".scss");
    expect(tailwindGlobals).toContain('@import "tailwindcss"');
  });

  it("has removed Sass from source and package dependencies", () => {
    const scssFiles = collectFiles(process.cwd()).filter((file) =>
      file.endsWith(".scss"),
    );

    expect(scssFiles).toEqual([]);
    expect(packageJson.dependencies?.sass).toBeUndefined();
    expect(packageJson.devDependencies?.sass).toBeUndefined();
  });

  it("maps Tailwind design tokens to the existing semantic CSS variables", () => {
    [
      "--color-surface: var(--surface)",
      "--color-surface-container-low: var(--surface-container-low)",
      "--color-surface-container: var(--surface-container)",
      "--color-surface-container-high: var(--surface-container-high)",
      "--color-surface-container-highest: var(--surface-container-highest)",
      "--color-primary: var(--primary)",
      "--color-primary-hover: var(--primary-hover)",
      "--color-primary-container: var(--primary-container)",
      "--color-on-primary: var(--on-primary)",
      "--color-on-primary-container: var(--on-primary-container)",
      "--color-on-surface: var(--on-surface)",
      "--color-on-surface-variant: var(--on-surface-variant)",
      "--color-outline-variant: var(--outline-variant)",
    ].forEach((token) => {
      expect(tailwindGlobals).toContain(token);
    });
  });

  it("uses a non-Material QuanAI workbench palette", () => {
    expect(tailwindGlobals).toContain("--primary: #14737a");
    expect(tailwindGlobals).toContain("--secondary-container: #f3dfc8");
    expect(tailwindGlobals).not.toMatch(/Material\s*3/i);
  });

  it("uses Radix primitives for shared interface behavior", () => {
    [
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
    ].forEach((dependency) => {
      expect(packageJson.dependencies?.[dependency]).toBeDefined();
      expect(uiLib).toContain(dependency);
    });
  });
});
