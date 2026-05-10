import fs from "node:fs";
import path from "node:path";

const globalsPath = path.join(process.cwd(), "app/styles/globals.scss");
const globals = fs.readFileSync(globalsPath, "utf8");

function extractMixinBlock(name: "light" | "dark") {
  const mixinStart = globals.indexOf(`@mixin ${name}`);
  expect(mixinStart).toBeGreaterThanOrEqual(0);

  const blockStart = globals.indexOf("{", mixinStart);
  expect(blockStart).toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let index = blockStart; index < globals.length; index += 1) {
    if (globals[index] === "{") {
      depth += 1;
    }

    if (globals[index] === "}") {
      depth -= 1;

      if (depth === 0) {
        return globals.slice(blockStart + 1, index);
      }
    }
  }

  throw new Error(`Could not find end of @mixin ${name} block`);
}

const themeBlocks = [
  ["light", extractMixinBlock("light")],
  ["dark", extractMixinBlock("dark")],
] as const;

const semanticTokens = [
  "--surface:",
  "--surface-container-low:",
  "--surface-container:",
  "--surface-container-high:",
  "--primary-container:",
  "--on-primary:",
  "--on-primary-container:",
  "--on-surface:",
  "--on-surface-variant:",
  "--outline:",
  "--outline-variant:",
  "--shadow-soft:",
  "--shadow-floating:",
];

const legacyAliases = [
  "--white: var(--surface)",
  "--black: var(--on-surface)",
  "--gray: var(--surface-container-low)",
  "--second: var(--primary-container)",
  "--hover-color: var(--surface-container-high)",
  "--border-in-light: 1px solid var(--outline-variant)",
  "--theme-color: var(--surface-container-low)",
];

describe("Material 3 theme tokens", () => {
  it("defines semantic surface roles for light and dark themes", () => {
    themeBlocks.forEach(([, block]) => {
      semanticTokens.forEach((token) => {
        expect(block).toContain(token);
      });
    });
  });

  it("keeps legacy aliases mapped to the semantic roles", () => {
    themeBlocks.forEach(([, block]) => {
      legacyAliases.forEach((alias) => {
        expect(block).toContain(alias);
      });
    });
  });
});
