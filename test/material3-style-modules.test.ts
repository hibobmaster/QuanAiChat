import fs from "node:fs";
import path from "node:path";

function readStyle(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("Material 3 component styles", () => {
  const home = readStyle("app/components/home.module.scss");
  const button = readStyle("app/components/button.module.scss");
  const chat = readStyle("app/components/chat.module.scss");
  const ui = readStyle("app/components/ui-lib.module.scss");

  it("uses semantic surface roles in the app shell and sidebar", () => {
    expect(home).toContain("border-radius: 28px");
    expect(home).toContain("background-color: var(--surface)");
    expect(home).toContain("background-color: var(--surface-container)");
    expect(home).toContain("background-color: var(--primary-container)");
  });

  it("uses Material 3 button surfaces and primary text roles", () => {
    expect(button).toContain("border-radius: 18px");
    expect(button).toContain("background-color: var(--surface-container-high)");
    expect(button).toContain("color: var(--on-primary)");
    expect(button).toContain("background-color: var(--danger-container)");
  });

  it("uses roomy Material 3 chat surfaces", () => {
    expect(chat).toContain("background-color: var(--surface-container-low)");
    expect(chat).toContain("background-color: var(--surface-container-high)");
    expect(chat).toContain("background-color: var(--primary-container)");
    expect(chat).toContain("border-radius: 24px");
  });

  it("uses Material 3 shared UI surfaces", () => {
    expect(ui).toContain("background-color: var(--surface-container-high)");
    expect(ui).toContain("border-radius: 24px");
    expect(ui).toContain("box-shadow: var(--shadow-floating)");
    expect(ui).toContain("color: var(--on-surface-variant)");
  });
});
