# Material 3 Surface Redesign Design

Date: 2026-05-10
Project: QuanAiChat

## Goal

Redesign QuanAiChat with a Material 3-inspired surface system while preserving the existing chat workflow. The app should feel roomier, softer, and more tactile, but still use QuanAiChat's teal identity instead of adopting the default purple Material palette.

## Selected Direction

Use a **Brand Teal, Roomy Material 3 surface redesign**.

This is a full visual redesign of the existing shell, not a layout rewrite. The sidebar, chat list, chat transcript, input panel, settings, modals, and current routes remain structurally recognizable. The work updates the design language through global tokens and focused SCSS module changes.

## Alternatives Considered

### Token Refresh

Replace global colors, borders, and shadows while leaving most component spacing and shape unchanged.

Trade-off: lowest risk and fastest, but it would not deliver the fuller Material 3 surface tone requested.

### Surface Redesign

Rework tokens and the main visual surfaces while preserving behavior and component structure.

Trade-off: more SCSS surface area changes, but it provides the best balance between Material 3 polish and implementation risk.

### Expressive Material You

Push stronger rounded shapes, more color variety, and more personality into the interface.

Trade-off: visually distinctive, but higher risk of making a dense chat tool feel decorative.

## Visual System

### Color Tokens

Introduce Material 3-style semantic tokens in `app/styles/globals.scss` and keep backwards-compatible aliases for existing SCSS modules.

Core light roles:

- `--surface`: main app and message surfaces.
- `--surface-container-low`: subtle page and chat transcript background.
- `--surface-container`: sidebar and secondary panels.
- `--surface-container-high`: raised cards, chat items, input wells, popovers, and modals.
- `--primary`: QuanAiChat teal primary.
- `--primary-container`: teal-toned selected state and user message surface.
- `--on-surface`: primary text.
- `--on-surface-variant`: secondary text.
- `--outline` and `--outline-variant`: borders and dividers.

Core dark roles mirror the same semantics with dark teal-toned containers. Existing aliases such as `--white`, `--black`, `--gray`, `--second`, `--hover-color`, `--border-in-light`, `--shadow`, and `--card-shadow` remain defined so the change can be incremental and does not break untouched modules.

### Shape And Elevation

Use roomier Material 3 shapes:

- App container: 28px radius on desktop windowed mode.
- Sidebar and large panels: 24px radius where visible.
- Cards, chat list items, chat bubbles, popovers, and input well: 18px to 24px radius depending on size.
- Icon buttons: 16px to 20px radius with larger hit areas.

Elevation should be subtle. Prefer tonal contrast and outlines over heavy shadows. Shadows remain for modals, floating prompt hints, and the desktop app window, but they should be softer and less opaque.

### Density

Use a **Roomy Material** density:

- Increase sidebar and header breathing room.
- Make chat list rows taller and more pill-like.
- Increase chat bubble padding.
- Make the input panel feel like a docked surface with a larger rounded input well.
- Preserve mobile usability by keeping controls large and avoiding text overflow.

The app remains a utility interface. It should not become a marketing-style page or add decorative content.

## Component Scope

### Global Theme

Update `app/styles/globals.scss` first. This gives every existing component access to Material 3 semantic roles while preserving old variable names.

Expected changes:

- New light and dark token sets.
- Body background uses low surface container.
- Inputs, selects, checkboxes, ranges, and scrollbars receive Material 3-compatible colors and focus states.
- `--theme-color` maps to the active base surface for browser chrome metadata.

### App Shell And Sidebar

Update `app/components/home.module.scss`.

Expected changes:

- App window becomes a softer surface with Material 3 radius and lighter elevation.
- Sidebar uses `surface-container` and no longer relies on a blue-tinted `--second` background.
- Chat items become raised or outlined surface containers with more padding, larger radius, and clear selected state using `primary-container`.
- Narrow sidebar keeps the existing behavior but adopts the new tokens and rounded items.

### Buttons

Update `app/components/button.module.scss`.

Expected changes:

- Default icon buttons use high surface containers and outline/hover tones.
- Primary buttons use teal primary with readable `on-primary` text.
- Danger buttons keep the existing semantic behavior but use Material-style container color and focus treatment.
- Button text and icon spacing remain compatible with existing `IconButton`.

### Chat Surface

Update `app/components/chat.module.scss`.

Expected changes:

- Transcript background uses `surface-container-low`.
- Assistant messages use high surface containers with outline variants.
- User messages use `primary-container`.
- Input panel becomes a distinct docked surface with a rounded input well.
- Chat action chips use surface containers and become roomier.
- Prompt hints and toasts adopt the new surface, outline, and shadow tokens.

### Shared UI Library

Update `app/components/ui-lib.module.scss`.

Expected changes:

- Cards, lists, modals, popovers, toasts, textareas, and selectors use the new surface roles.
- Modals use softer radius and clearer header/footer separation.
- List rows get roomier padding and updated dividers.

### Adjacent Modules

Review focused styles that heavily use old tokens:

- `app/components/new-chat.module.scss`
- `app/components/settings.module.scss`
- `app/components/message-selector.module.scss`
- `app/components/mask.module.scss`
- `app/components/auth.module.scss`
- `app/components/artifacts.module.scss`
- `app/components/mcp-market.module.scss`

Only update these where the old tones visibly clash with the redesigned shell.

## Behavior And Data Flow

This redesign is CSS-first. It does not change application state, routes, stores, chat data, provider logic, message sending, model selection, MCP behavior, or persistence.

Theme switching continues through the existing `Theme.Auto`, `Theme.Light`, and `Theme.Dark` flow. The `useSwitchTheme` logic should keep working because it depends on CSS variables and body classes.

## Accessibility

The redesign must preserve or improve readability:

- Maintain strong contrast for primary text, secondary text, and selected states in light and dark themes.
- Keep visible focus states for keyboard users.
- Avoid relying on color alone for selected chat items; use border or tonal treatment as well.
- Preserve touch-friendly targets on mobile.

## Testing And Verification

Run static checks and visual verification:

- `pnpm lint` if available and functional in this Next.js version.
- A production or development build check if lint is unavailable.
- Start the local app and inspect desktop and mobile viewport screenshots.
- Verify light, dark, and auto theme behavior.
- Verify the main chat shell, sidebar, input panel, settings modal, and at least one shared list/modal surface.

## Out Of Scope

- Replacing the icon set.
- Adding a Material UI component library.
- Rewriting React component structure.
- Changing chat behavior, providers, storage, or model configuration.
- Creating a new landing page.
