# Material 3 Surface Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign QuanAiChat with a Brand Teal, Roomy Material 3 surface system while preserving the existing chat workflow.

**Architecture:** This is a CSS-first redesign. Add source-guard Jest tests for the new global tokens and main SCSS module usage, then update the existing SCSS token layer and focused component modules without changing React state, routes, stores, or chat behavior.

**Tech Stack:** Next.js 16, React 19, Sass/SCSS modules, Jest, pnpm.

---

## File Structure

- Create `test/material3-style-tokens.test.ts`: verifies that `app/styles/globals.scss` defines Material 3 semantic surface tokens and keeps legacy aliases used by existing SCSS modules.
- Create `test/material3-style-modules.test.ts`: verifies that the main redesigned SCSS modules reference the new semantic tokens and roomier Material 3 shape values.
- Modify `app/styles/globals.scss`: introduce Brand Teal Material 3 light/dark tokens and map old variables to the new semantic roles.
- Modify `app/components/home.module.scss`: redesign app shell, sidebar, chat list items, and narrow-sidebar states.
- Modify `app/components/button.module.scss`: redesign default, primary, and danger icon buttons.
- Modify `app/components/chat.module.scss`: redesign chat transcript, message bubbles, action chips, prompt hints, input dock, and send button.
- Modify `app/components/ui-lib.module.scss`: redesign cards, lists, modals, popovers, toasts, inputs, and selectors.
- Review and lightly modify, only if visually clashing: `app/components/new-chat.module.scss`, `app/components/settings.module.scss`, `app/components/message-selector.module.scss`, `app/components/mask.module.scss`, `app/components/auth.module.scss`, `app/components/artifacts.module.scss`, and `app/components/mcp-market.module.scss`.

## Task 1: Global Material 3 Token Guard

**Files:**
- Create: `test/material3-style-tokens.test.ts`
- Modify: `app/styles/globals.scss`

- [ ] **Step 1: Write the failing token guard test**

Create `test/material3-style-tokens.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the token guard and verify it fails**

Run:

```bash
pnpm jest test/material3-style-tokens.test.ts --runInBand
```

Expected: FAIL because `app/styles/globals.scss` does not yet define tokens such as `--surface:` and `--primary-container:`.

- [ ] **Step 3: Replace the light and dark mixin token blocks**

In `app/styles/globals.scss`, replace the current `@mixin light` and `@mixin dark` token declarations with these token sets. Preserve the existing `div:not(.no-dark)>svg` rule inside `@mixin dark`.

```scss
@mixin light {
  --theme: light;

  /* Material 3 Brand Teal roles */
  --surface: #fbfcfe;
  --surface-dim: #d9dddf;
  --surface-bright: #fbfcfe;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f4f8fa;
  --surface-container: #edf5f7;
  --surface-container-high: #e6eff2;
  --surface-container-highest: #dfe9ec;
  --primary: #006a78;
  --primary-hover: #005864;
  --primary-container: #c7eaf1;
  --on-primary: #ffffff;
  --on-primary-container: #001f25;
  --secondary-container: #dceff3;
  --on-secondary-container: #0f333a;
  --on-surface: #171d1f;
  --on-surface-variant: #415154;
  --outline: #718285;
  --outline-variant: #c2d2d6;
  --danger: #ba1a1a;
  --danger-container: #ffdad6;
  --on-danger-container: #410002;

  /* legacy aliases */
  --white: var(--surface);
  --black: var(--on-surface);
  --gray: var(--surface-container-low);
  --primary-dark: var(--primary-hover);
  --primary-10: rgba(0, 106, 120, 0.12);
  --second: var(--primary-container);
  --hover-color: var(--surface-container-high);
  --bar-color: rgba(23, 29, 31, 0.18);
  --theme-color: var(--surface-container-low);

  /* elevation */
  --shadow-soft: 0 12px 32px rgba(30, 44, 48, 0.12);
  --shadow-floating: 0 18px 44px rgba(30, 44, 48, 0.16);
  --shadow: var(--shadow-floating);
  --card-shadow: 0 2px 10px rgba(30, 44, 48, 0.08);

  /* stroke */
  --border-in-light: 1px solid var(--outline-variant);
}

@mixin dark {
  --theme: dark;

  /* Material 3 Brand Teal roles */
  --surface: #101719;
  --surface-dim: #101719;
  --surface-bright: #364143;
  --surface-container-lowest: #0b1113;
  --surface-container-low: #182123;
  --surface-container: #1c2729;
  --surface-container-high: #263134;
  --surface-container-highest: #303c3f;
  --primary: #80d4e2;
  --primary-hover: #9ee8f4;
  --primary-container: #004f5a;
  --on-primary: #00363e;
  --on-primary-container: #b7ebf4;
  --secondary-container: #304a50;
  --on-secondary-container: #cce7ed;
  --on-surface: #e1e4e6;
  --on-surface-variant: #bfcbcf;
  --outline: #8a999d;
  --outline-variant: #3f4d51;
  --danger: #ffb4ab;
  --danger-container: #93000a;
  --on-danger-container: #ffdad6;

  /* legacy aliases */
  --white: var(--surface);
  --black: var(--on-surface);
  --gray: var(--surface-container-low);
  --primary-dark: var(--primary-hover);
  --primary-10: rgba(128, 212, 226, 0.16);
  --second: var(--primary-container);
  --hover-color: var(--surface-container-high);
  --bar-color: rgba(225, 228, 230, 0.18);
  --border-in-light: 1px solid var(--outline-variant);
  --theme-color: var(--surface-container-low);

  /* elevation */
  --shadow-soft: 0 12px 32px rgba(0, 0, 0, 0.24);
  --shadow-floating: 0 18px 44px rgba(0, 0, 0, 0.32);
  --shadow: var(--shadow-floating);
  --card-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  div:not(.no-dark)>svg {
    filter: invert(0.5);
  }
}
```

- [ ] **Step 4: Update global base controls**

In `app/styles/globals.scss`, adjust these selectors to use the new tokens:

```scss
body {
  background-color: var(--surface-container-low);
  color: var(--on-surface);
  margin: 0;
  padding: 0;
  height: var(--full-height);
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  touch-action: pan-x pan-y;
  overflow: hidden;

  @media only screen and (max-width: 600px) {
    background-color: var(--surface-container);
  }

  *:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
}

select {
  border: var(--border-in-light);
  padding: 12px 16px;
  border-radius: 18px;
  appearance: none;
  cursor: pointer;
  background-color: var(--surface-container-high);
  color: var(--on-surface);
  text-align: center;
}

input[type="checkbox"] {
  cursor: pointer;
  background-color: var(--surface-container-high);
  color: var(--on-surface);
  appearance: none;
  border: var(--border-in-light);
  border-radius: 6px;
  height: 18px;
  width: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

input[type="checkbox"]:checked::after {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: var(--primary);
  content: " ";
  border-radius: 3px;
}

input[type="range"] {
  appearance: none;
  background-color: var(--surface-container-high);
  color: var(--on-surface);
}

input[type="number"],
input[type="text"],
input[type="password"] {
  appearance: none;
  border-radius: 18px;
  border: var(--border-in-light);
  min-height: 40px;
  box-sizing: border-box;
  background: var(--surface-container-high);
  color: var(--on-surface);
  padding: 0 14px;
  max-width: 50%;
  font-family: inherit;
}
```

- [ ] **Step 5: Run the token guard and commit**

Run:

```bash
pnpm jest test/material3-style-tokens.test.ts --runInBand
```

Expected: PASS.

Commit:

```bash
git add app/styles/globals.scss test/material3-style-tokens.test.ts
git commit -m "test: guard Material 3 theme tokens"
```

## Task 2: Main Module Style Guards

**Files:**
- Create: `test/material3-style-modules.test.ts`
- Modify later in this plan: `app/components/home.module.scss`, `app/components/button.module.scss`, `app/components/chat.module.scss`, `app/components/ui-lib.module.scss`

- [ ] **Step 1: Write the failing module guard test**

Create `test/material3-style-modules.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the module guard and verify it fails**

Run:

```bash
pnpm jest test/material3-style-modules.test.ts --runInBand
```

Expected: FAIL because the modules still use the old compact `--white`, `--second`, and 10px radius style.

## Task 3: App Shell And Sidebar

**Files:**
- Modify: `app/components/home.module.scss`
- Test: `test/material3-style-modules.test.ts`

- [ ] **Step 1: Update the app container surface**

In `app/components/home.module.scss`, update `@mixin container`:

```scss
@mixin container {
  background-color: var(--surface);
  border: var(--border-in-light);
  border-radius: 28px;
  box-shadow: var(--shadow-floating);
  color: var(--on-surface);
  min-width: 600px;
  min-height: 370px;
  max-width: 1200px;

  display: flex;
  overflow: hidden;
  box-sizing: border-box;

  width: var(--window-width);
  height: var(--window-height);
}
```

- [ ] **Step 2: Update the sidebar surface and spacing**

In the `.sidebar` block, use:

```scss
.sidebar {
  top: 0;
  width: var(--sidebar-width);
  box-sizing: border-box;
  padding: 24px;
  background-color: var(--surface-container);
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 var(--outline-variant);
  position: relative;
  transition: width ease 0.05s;
```

Keep nested behavior in the existing `.sidebar` block, but update `.sidebar-header-bar` `margin-bottom` to `24px`.

- [ ] **Step 3: Update sidebar header and logo presentation**

In `app/components/home.module.scss`, update these blocks:

```scss
.sidebar-header {
  position: relative;
  padding-top: 12px;
  padding-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  &-narrow {
    justify-content: center;
  }
}

.sidebar-logo-image {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  object-fit: contain;
  background-color: var(--surface-container-high);
  box-shadow: var(--card-shadow);
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--on-surface);
  animation: slide-in ease 0.3s;
}

.sidebar-sub-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--on-surface-variant);
  animation: slide-in ease 0.3s;
}
```

- [ ] **Step 4: Update chat list item surfaces**

In `app/components/home.module.scss`, replace `.chat-item`, `.chat-item:hover`, `.chat-item-selected`, and `.chat-item-info` with:

```scss
.chat-item {
  padding: 14px 16px;
  background-color: var(--surface-container-high);
  border-radius: 22px;
  margin-bottom: 12px;
  box-shadow: var(--card-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  position: relative;
  content-visibility: auto;
}

.chat-item:hover {
  background-color: var(--surface-container-highest);
  transform: translateY(-1px);
}

.chat-item-selected {
  background-color: var(--primary-container);
  border-color: var(--primary);
  color: var(--on-primary-container);
}

.chat-item-info {
  display: flex;
  justify-content: space-between;
  color: var(--on-surface-variant);
  font-size: 12px;
  margin-top: 10px;
  animation: slide-in ease 0.3s;
}
```

- [ ] **Step 5: Update sidebar tail spacing**

Update `.sidebar-tail` and `.sidebar-action:not(:last-child)`:

```scss
.sidebar-tail {
  display: flex;
  justify-content: space-between;
  padding-top: 24px;
}

.sidebar-action:not(:last-child) {
  margin-right: 12px;
}
```

- [ ] **Step 6: Run the module guard**

Run:

```bash
pnpm jest test/material3-style-modules.test.ts --runInBand
```

Expected: still FAIL because button, chat, and shared UI modules are not updated yet.

- [ ] **Step 7: Commit the shell update**

Commit:

```bash
git add app/components/home.module.scss test/material3-style-modules.test.ts
git commit -m "style: apply Material 3 shell surfaces"
```

## Task 4: Buttons

**Files:**
- Modify: `app/components/button.module.scss`
- Test: `test/material3-style-modules.test.ts`

- [ ] **Step 1: Replace the icon button styles**

In `app/components/button.module.scss`, replace the file contents with:

```scss
.icon-button {
  background-color: var(--surface-container-high);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  user-select: none;
  outline: none;
  border: 1px solid transparent;
  color: var(--on-surface);
  min-height: 40px;
  box-sizing: border-box;

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.primary {
    background-color: var(--primary);
    color: var(--on-primary);

    path {
      fill: var(--on-primary) !important;
    }
  }

  &.danger {
    color: var(--danger);
    border-color: transparent;
    background-color: var(--danger-container);

    &:hover {
      border-color: var(--danger);
      background-color: var(--danger-container);
    }

    path {
      fill: var(--danger) !important;
    }
  }

  &:hover,
  &:focus {
    border-color: var(--primary);
    background-color: var(--surface-container-highest);
  }
}

.shadow {
  box-shadow: var(--card-shadow);
}

.border {
  border: var(--border-in-light);
}

.icon-button-icon {
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media only screen and (max-width: 600px) {
  .icon-button {
    padding: 16px;
    min-height: 48px;
  }
}

.icon-button-text {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:not(:first-child) {
    margin-left: 6px;
  }
}
```

- [ ] **Step 2: Run the module guard**

Run:

```bash
pnpm jest test/material3-style-modules.test.ts --runInBand
```

Expected: still FAIL because chat and shared UI modules are not updated yet.

- [ ] **Step 3: Commit the button update**

Commit:

```bash
git add app/components/button.module.scss
git commit -m "style: update buttons for Material 3 surfaces"
```

## Task 5: Chat Surface

**Files:**
- Modify: `app/components/chat.module.scss`
- Test: `test/material3-style-modules.test.ts`

- [ ] **Step 1: Update action chips and prompt toast surfaces**

In `app/components/chat.module.scss`, update `.chat-input-action` inside `.chat-input-actions` and `.prompt-toast-inner`:

```scss
.chat-input-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;

  &-end {
    display: flex;
    margin-left: auto;
    gap: 8px;
  }

  .chat-input-action {
    display: inline-flex;
    border-radius: 18px;
    font-size: 12px;
    font-weight: 600;
    background-color: var(--surface-container-high);
    color: var(--on-surface);
    border: var(--border-in-light);
    padding: 6px 12px;
    animation: slide-in ease 0.3s;
    box-shadow: var(--card-shadow);
    transition: width ease 0.3s, background-color ease 0.2s, border-color ease 0.2s;
    align-items: center;
    height: 20px;
    width: var(--icon-width);
    overflow: hidden;
```

Keep the nested `.text`, hover expansion, `.text`, and `.icon` rules as they are.

Update `.prompt-toast-inner`:

```scss
.prompt-toast-inner {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  background-color: var(--surface-container-high);
  color: var(--on-surface);

  border: var(--border-in-light);
  box-shadow: var(--card-shadow);
  padding: 12px 22px;
  border-radius: 100px;

  animation: slide-in-from-top ease 0.3s;
```

- [ ] **Step 2: Update memory and clear-context surfaces**

Update `.memory-prompt-content` and `.clear-context`:

```scss
.memory-prompt-content {
  background-color: var(--surface-container-high);
  color: var(--on-surface);
  border: var(--border-in-light);
  border-radius: 18px;
  padding: 14px;
  font-size: 12px;
  user-select: text;
}

.clear-context {
  margin: 24px 0 0 0;
  padding: 8px 0;

  border-top: var(--border-in-light);
  border-bottom: var(--border-in-light);
  box-shadow: none;
```

Keep the rest of `.clear-context` behavior.

- [ ] **Step 3: Update transcript and message bubbles**

Update `.chat`, `.chat-body`, `.chat-message-item`, and the user message override:

```scss
.chat {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  background-color: var(--surface-container-low);
}

.chat-body {
  flex: 1;
  overflow: auto;
  overflow-x: hidden;
  padding: 28px;
  padding-bottom: 44px;
  position: relative;
  overscroll-behavior: none;
}

.chat-message-item {
  box-sizing: border-box;
  max-width: 100%;
  margin-top: 12px;
  border-radius: 24px;
  background-color: var(--surface-container-high);
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.6;
  user-select: text;
  word-break: break-word;
  border: var(--border-in-light);
  position: relative;
  transition: all ease 0.3s;
  box-shadow: var(--card-shadow);
}

.chat-message-user>.chat-message-container>.chat-message-item {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
  border-color: transparent;

  &:hover {
    min-width: 0;
  }
}
```

- [ ] **Step 4: Update input panel and prompt hints**

Update `.chat-input-panel`, `.prompt-hints`, `.prompt-hint`, `.chat-input-panel-inner`, focus state, `.chat-input`, and `.chat-input-send`:

```scss
.chat-input-panel {
  position: relative;
  width: 100%;
  padding: 24px;
  padding-top: 14px;
  box-sizing: border-box;
  flex-direction: column;
  border-top: var(--border-in-light);
  background-color: var(--surface);
  box-shadow: 0 -8px 24px rgba(30, 44, 48, 0.06);

  .chat-input-actions {
    .chat-input-action {
      margin-bottom: 12px;
    }
  }
}

.prompt-hints {
  min-height: 20px;
  width: 100%;
  max-height: 50vh;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;

  background-color: var(--surface-container-high);
  border: var(--border-in-light);
  border-radius: 24px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-floating);

  .prompt-hint {
    color: var(--on-surface);
    padding: 10px 14px;
    animation: slide-in ease 0.3s;
    cursor: pointer;
    transition: all ease 0.3s;
    border: 1px solid transparent;
    margin: 6px;
    border-radius: 18px;
```

Keep the nested hint typography and selection rules, but make selected/hover use `border-color: var(--primary); background-color: var(--primary-container);`.

```scss
.chat-input-panel-inner {
  cursor: text;
  display: flex;
  flex: 1;
  border-radius: 24px;
  border: var(--border-in-light);
  background-color: var(--surface-container-high);
  box-shadow: var(--card-shadow);
}

.chat-input-panel-inner:has(.chat-input:focus) {
  border: 1px solid var(--primary);
  box-shadow: 0 0 0 3px var(--primary-10);
}

.chat-input {
  height: 100%;
  width: 100%;
  border-radius: 24px;
  border: none;
  box-shadow: none;
  background-color: transparent;
  color: var(--on-surface);
  font-family: inherit;
  padding: 14px 96px 14px 18px;
  resize: none;
  outline: none;
  box-sizing: border-box;
  min-height: 82px;
  line-height: 1.5;
}

.chat-input-send {
  background-color: var(--primary);
  color: var(--on-primary);

  position: absolute;
  right: 36px;
  bottom: 38px;
  border-radius: 18px;
}
```

- [ ] **Step 5: Update shortcut key surfaces**

Update `.shortcut-key-item`, `.shortcut-key`, and text colors:

```scss
.shortcut-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  padding: 12px;
  background-color: var(--surface-container-high);
  border-radius: 18px;
}

.shortcut-key-title {
  font-size: 14px;
  color: var(--on-surface);
}

.shortcut-key {
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border-in-light);
  border-radius: 12px;
  padding: 6px;
  background-color: var(--surface-container);
  min-width: 34px;
}

.shortcut-key span {
  font-size: 12px;
  color: var(--on-surface);
}
```

- [ ] **Step 6: Run the module guard**

Run:

```bash
pnpm jest test/material3-style-modules.test.ts --runInBand
```

Expected: still FAIL because shared UI module is not updated yet.

- [ ] **Step 7: Commit the chat update**

Commit:

```bash
git add app/components/chat.module.scss
git commit -m "style: redesign chat surfaces with Material 3"
```

## Task 6: Shared UI Library

**Files:**
- Modify: `app/components/ui-lib.module.scss`
- Test: `test/material3-style-modules.test.ts`

- [ ] **Step 1: Update cards, lists, and popovers**

In `app/components/ui-lib.module.scss`, update `.card`, `.list`, `.list-item`, `.popover-content`, and `.popover-mask`:

```scss
.card {
  background-color: var(--surface-container-high);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  padding: 14px;
  border: var(--border-in-light);
}

.popover-content {
  position: absolute;
  width: 350px;
  animation: slide-in 0.3s ease;
  right: 0;
  top: calc(100% + 12px);
}

.popover-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(8px);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  border-bottom: var(--border-in-light);
  padding: 14px 20px;
  animation: slide-in ease 0.6s;
```

Inside `.list-item .list-header`, set `.list-item-sub-title` to:

```scss
.list-item-sub-title {
  font-size: 12px;
  font-weight: normal;
  color: var(--on-surface-variant);
}
```

Update `.list`:

```scss
.list {
  border: var(--border-in-light);
  border-radius: 24px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
  animation: slide-in ease 0.3s;
  background: var(--surface-container-high);
  overflow: hidden;
}
```

- [ ] **Step 2: Update modal surfaces**

Replace `.modal-container` opening declarations:

```scss
.modal-container {
  box-shadow: var(--shadow-floating);
  background-color: var(--surface);
  border: var(--border-in-light);
  border-radius: 24px;
  width: 80vw;
  max-width: 900px;
  min-width: 300px;
  animation: slide-in ease 0.3s;
```

Inside `.modal-header`, `.modal-content`, and `.modal-footer`, use:

```scss
.modal-header {
  padding: var(--modal-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: var(--border-in-light);
  background-color: var(--surface-container);

  .modal-title {
    font-weight: bolder;
    font-size: 16px;
    color: var(--on-surface);
  }
```

```scss
.modal-content {
  max-height: 40vh;
  padding: var(--modal-padding);
  overflow: auto;
  background-color: var(--surface);
}
```

```scss
.modal-footer {
  padding: var(--modal-padding);
  display: flex;
  justify-content: flex-end;
  border-top: var(--border-in-light);
  box-shadow: none;
  background-color: var(--surface-container);
```

- [ ] **Step 3: Update toast and form controls**

Update `.toast-content`, `.toast-action`, `.input`, and select helper surfaces:

```scss
.toast-content {
  max-width: 80vw;
  word-break: break-all;
  font-size: 14px;
  background-color: var(--surface-container-high);
  box-shadow: var(--shadow-floating);
  border: var(--border-in-light);
  color: var(--on-surface);
  padding: 12px 22px;
  border-radius: 50px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  pointer-events: all;

  .toast-action {
    padding-left: 20px;
    color: var(--primary);
    opacity: 0.9;
    border: 0;
    background: none;
    cursor: pointer;
    font-family: inherit;

    &:hover {
      opacity: 1;
    }
  }
}

.input {
  border: var(--border-in-light);
  border-radius: 18px;
  padding: 12px 14px;
  font-family: inherit;
  background-color: var(--surface-container-high);
  color: var(--on-surface);
  resize: none;
  min-width: 50px;
}
```

- [ ] **Step 4: Run both style guards**

Run:

```bash
pnpm jest test/material3-style-tokens.test.ts test/material3-style-modules.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the shared UI update**

Commit:

```bash
git add app/components/ui-lib.module.scss
git commit -m "style: update shared UI surfaces"
```

## Task 7: Adjacent Module Cleanup

**Files:**
- Review and optionally modify: `app/components/new-chat.module.scss`, `app/components/settings.module.scss`, `app/components/message-selector.module.scss`, `app/components/mask.module.scss`, `app/components/auth.module.scss`, `app/components/artifacts.module.scss`, `app/components/mcp-market.module.scss`

- [ ] **Step 1: Search for old tones in adjacent modules**

Run:

```bash
rg -n -e "var\\(--white\\)|var\\(--gray\\)|var\\(--second\\)|rgba\\(\\$color: #888|rgb\\(166, 166, 166\\)" app/components -g "*.module.scss"
```

Expected: prints remaining old-token usage. Keep usages that still map well through aliases. Update only selectors that visibly clash with the new shell.

- [ ] **Step 2: Apply focused cleanup patterns**

Use these replacements where the old tone appears as a major visible surface:

```scss
background-color: var(--surface-container-high);
color: var(--on-surface);
border: var(--border-in-light);
border-radius: 20px;
box-shadow: var(--card-shadow);
```

Use this for secondary text:

```scss
color: var(--on-surface-variant);
```

Use this for selected or active teal-toned states:

```scss
background-color: var(--primary-container);
color: var(--on-primary-container);
border-color: var(--primary);
```

- [ ] **Step 3: Run source guards**

Run:

```bash
pnpm jest test/material3-style-tokens.test.ts test/material3-style-modules.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 4: Commit adjacent cleanup if files changed**

If Step 2 changed files, commit:

```bash
git add app/components/new-chat.module.scss app/components/settings.module.scss app/components/message-selector.module.scss app/components/mask.module.scss app/components/auth.module.scss app/components/artifacts.module.scss app/components/mcp-market.module.scss
git commit -m "style: align adjacent surfaces with Material 3"
```

If Step 2 did not change files, skip the commit and record that no adjacent cleanup was needed.

## Task 8: Static And Visual Verification

**Files:**
- No planned source files unless verification reveals a defect.

- [ ] **Step 1: Run all Jest tests in CI mode**

Run:

```bash
pnpm test:ci
```

Expected: PASS.

- [ ] **Step 2: Run lint or document lint availability**

Run:

```bash
pnpm lint
```

Expected: PASS. If the command fails because `next lint` is unavailable in this Next.js setup, run the configured ESLint directly:

```bash
pnpm exec eslint app test --max-warnings=0
```

Expected: PASS, or only pre-existing unrelated issues documented in the final handoff.

- [ ] **Step 3: Start the local app**

Run:

```bash
pnpm dev
```

Expected: Next.js dev server starts and prints a localhost URL, usually `http://localhost:3000`. Keep the session running for browser verification.

- [ ] **Step 4: Verify desktop light theme in the browser**

Open the app URL in the in-app browser. Inspect the main chat shell at desktop width.

Expected visual result:

- App shell has a 28px desktop radius and soft elevation.
- Sidebar uses a teal-neutral surface container.
- Chat list items are roomier and pill-like.
- Chat transcript uses a subtle low surface background.
- User message bubbles use teal primary container.
- Assistant bubbles use high surface containers.
- Input panel is a rounded docked surface.

- [ ] **Step 5: Verify dark theme**

Use the app theme control to cycle to dark mode.

Expected visual result:

- Dark mode uses dark teal-neutral surfaces, not pure black.
- Text remains readable.
- Selected chat and user bubble states remain visible.
- SVG icon inversion still works for non-`no-dark` icons.

- [ ] **Step 6: Verify mobile viewport**

Use a mobile viewport around 390px wide in the in-app browser.

Expected visual result:

- Sidebar drawer still opens and closes correctly.
- Buttons remain touch-friendly.
- Input dock and send button do not overlap text.
- Chat bubbles do not overflow horizontally.

- [ ] **Step 7: Verify settings modal and shared list surfaces**

Open settings and inspect the modal/list rows.

Expected visual result:

- Modal has 24px radius on desktop and square bottom edge behavior on mobile remains intact.
- Header/footer use tonal separation.
- List rows use roomier spacing and high surface containers.
- Inputs/selects use the new surface tokens and visible focus state.

- [ ] **Step 8: Stop the dev server and commit final fixes**

Stop the dev server with `Ctrl-C`.

If verification caused final source edits, commit them:

```bash
git add app/styles/globals.scss app/components/*.module.scss test/material3-style-tokens.test.ts test/material3-style-modules.test.ts
git commit -m "style: polish Material 3 visual verification"
```

If no final source edits were needed, skip this commit.

## Self-Review

- Spec coverage: global tokens, app shell/sidebar, buttons, chat surfaces, shared UI, adjacent modules, accessibility, and verification are covered by Tasks 1 through 8.
- Placeholder scan: plan avoids deferred implementation language and includes concrete file paths, snippets, commands, and expected results.
- Type consistency: tests read SCSS source files from `process.cwd()` using Node `fs` and `path`; all referenced token names match the planned SCSS token names.
