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
  "--primary-dark: var(--primary-hover)",
  "--primary-10:",
  "--second: var(--primary-container)",
  "--hover-color: var(--surface-container-high)",
  "--bar-color:",
  "--border-in-light: 1px solid var(--outline-variant)",
  "--theme-color: var(--surface-container-low)",
  "--shadow: var(--shadow-floating)",
  "--card-shadow:",
];

function expectMixinBlockToContain(
  theme: "light" | "dark",
  block: string,
  expected: string,
) {
  if (!block.includes(expected)) {
    throw new Error(`@mixin ${theme} is missing ${expected}`);
  }
}

describe("Material 3 theme tokens", () => {
  it("defines semantic surface roles for light and dark themes", () => {
    themeBlocks.forEach(([theme, block]) => {
      semanticTokens.forEach((token) => {
        expectMixinBlockToContain(theme, block, token);
      });
    });
  });

  it("keeps legacy aliases mapped to the semantic roles", () => {
    themeBlocks.forEach(([theme, block]) => {
      legacyAliases.forEach((alias) => {
        expectMixinBlockToContain(theme, block, alias);
      });
    });
  });
});
