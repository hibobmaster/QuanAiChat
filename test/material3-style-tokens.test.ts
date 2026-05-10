import fs from "node:fs";
import path from "node:path";

const globalsPath = path.join(process.cwd(), "app/styles/globals.scss");
const globals = fs.readFileSync(globalsPath, "utf8");

describe("Material 3 theme tokens", () => {
  it("defines semantic surface roles for light and dark themes", () => {
    [
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
    ].forEach((token) => {
      expect(globals).toContain(token);
    });
  });

  it("keeps legacy aliases mapped to the semantic roles", () => {
    [
      "--white: var(--surface)",
      "--black: var(--on-surface)",
      "--gray: var(--surface-container-low)",
      "--second: var(--primary-container)",
      "--hover-color: var(--surface-container-high)",
      "--border-in-light: 1px solid var(--outline-variant)",
      "--theme-color: var(--surface-container-low)",
    ].forEach((alias) => {
      expect(globals).toContain(alias);
    });
  });
});
