# Phase A: CSS Foundation & Zero-Code Entry — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | A.1 | Expand `resolveFrameworkStyles()` to cover all 76 components | Not started | CSS |
> | A.2 | Audit & fix component inline style / token var mismatches | Not started | Components |
> | A.3 | Budget-fe migration to `snapshotApp()` plugin | Not started | Dogfood |
> | A.4 | Tailwind bridge completeness | Not started | CSS |
> | A.5 | Font loading from manifest config | Not started | CSS |
> | A.6 | Dark mode edge cases | Not started | Runtime |
>
> **Priority:** P0 — this unblocks all visual quality work.
> **Depends on:** Nothing (first spec in the chain).
> **Blocks:** Phase B (Layout), Phase C (Styling), Phase G (Navigation), Phase L (DX).

---

## Vision

### Before (Today)

Budget-fe uses `ManifestApp` and gets framework styles injected. But the app still looks
unpolished because:

1. `resolveFrameworkStyles()` only covers 5 component types: `data-table`, `stat-card`,
   `form`, `detail-card`, and a generic `[data-snapshot-component]` constraint. The other
   71 registered components get zero framework CSS.
2. Budget-fe uses `@vitejs/plugin-react` instead of `snapshotApp()`, so it has no Tailwind
   bridge, no auto-entry, and requires a manual `src/main.tsx`.
3. `className` in manifest JSON is accepted by the schema but Tailwind classes don't resolve
   because `@tailwindcss/vite` is never loaded.
4. Several components still have hardcoded fallback values that don't match the active theme.

### After (This Spec)

1. Every one of the 76 registered components has framework CSS in `resolveFrameworkStyles()`
   that reads token vars.
2. Budget-fe deletes `src/main.tsx` and uses `snapshotApp()` in `vite.config.ts`. Zero
   source files.
3. `className: "bg-primary/50 rounded-xl"` works in any manifest JSON because Tailwind is
   auto-injected by the Vite plugin.
4. Budget-fe looks like a polished product with zero manifest changes — just upgrade Snapshot
   and switch to the plugin.

---

## What Already Exists on Main

### Framework CSS Pipeline (WORKS)

| File | Lines | What It Does |
|---|---|---|
| `src/ui/tokens/resolve.ts` | 957 | `resolveTokens()` generates all `--sn-*` CSS vars. `resolveFrameworkStyles()` generates CSS reset + component styles (lines 750-956). |
| `src/ui/manifest/app.tsx` | 1764 | `ManifestApp` injects both token CSS (`<style id="snapshot-tokens">`) and framework CSS (`<style id="snapshot-framework">`) at lines 1714-1723. Has `DarkModeManager` at line 1724. |
| `src/ui/components/_base/component-wrapper.tsx` | 181 | Adds `data-snapshot-component={type}` attribute to every component (line 155). This is the CSS hook. |
| `src/ui/tokens/tailwind-bridge.ts` | 56 | `generateTailwindBridge()` maps `--sn-*` vars to Tailwind `@theme` vars. |

### Vite Plugin (WORKS)

| File | Lines | What It Does |
|---|---|---|
| `src/vite/index.ts` | 995 | `snapshotApp()` plugin (lines 63-165): auto-injects `@tailwindcss/vite`, creates virtual entry module with `ManifestApp`, creates virtual CSS module with Tailwind bridge, serves HTML shell. |

### Component Styling (WORKS — but inline-only)

All 76 components use `var(--sn-*)` token CSS vars in inline styles. Example from
`stat-card/component.tsx`:
```tsx
padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))"
```

Components use `ComponentWrapper` which adds `data-snapshot-component` for CSS targeting.

### Boot System (WORKS)

| File | Lines | What It Does |
|---|---|---|
| `src/ui/manifest/boot-builtins.ts` | 40 | `bootBuiltins()` registers all 76 components, 9 flavors, layouts, guards. Idempotent. Called by `ManifestApp` before render. |
| `src/ui/components/register.ts` | ~600 | `registerBuiltInComponents()` pairs each component with its Zod schema. |

### Budget-FE (PARTIAL — needs migration)

| File | Lines | Problem |
|---|---|---|
| `budget-fe/src/main.tsx` | 14 | Manual entry point. Should not exist — `snapshotApp()` plugin handles this. |
| `budget-fe/vite.config.ts` | 17 | Uses `@vitejs/plugin-react` instead of `snapshotApp()`. No Tailwind, no auto-entry. |
| `budget-fe/index.html` | 15 | Manual HTML with dark mode script hack. Plugin generates this. |
| `budget-fe/snapshot.manifest.json` | 1308 | The manifest. No changes needed. |

---

## Developer Context

### Build & Test Commands

```sh
cd /c/Users/email/projects/snapshot
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier
bun run build            # tsup + oclif manifest
bun test                 # vitest
```

### Key Files

| Path | What | Lines |
|---|---|---|
| `src/ui/tokens/resolve.ts` | Token + framework CSS generation | 957 |
| `src/ui/manifest/app.tsx` | ManifestApp — injects CSS, manages providers | 1764 |
| `src/ui/components/_base/component-wrapper.tsx` | Adds `data-snapshot-component` attr | 181 |
| `src/ui/tokens/tailwind-bridge.ts` | Tailwind v4 `@theme` bridge | 56 |
| `src/vite/index.ts` | `snapshotApp()` plugin | 995 |
| `src/ui/components/_base/button-styles.ts` | Shared button inline styles + CSS | 162 |
| `playground/src/styles.css` | Reference CSS (what polish looks like) | 1031 |

### Consumer Shape

**Before (budget-fe today):**
```
budget-fe/
  src/main.tsx              ← MUST DELETE
  index.html                ← MUST DELETE (plugin generates)
  vite.config.ts            ← MUST CHANGE (switch to snapshotApp())
  snapshot.manifest.json    ← NO CHANGES
  package.json              ← REMOVE @vitejs/plugin-react, ADD @tailwindcss/vite
```

**After (budget-fe target):**
```
budget-fe/
  vite.config.ts            ← uses snapshotApp()
  snapshot.manifest.json    ← unchanged
  package.json              ← @lastshotlabs/snapshot + @tailwindcss/vite
```

---

## Non-Negotiable Engineering Constraints

From `docs/engineering-rules.md`:

1. **Semantic tokens only.** `var(--sn-color-primary)` not `#2563eb`. If no token exists,
   add one. (Token Usage Rules)
2. **`data-snapshot-component` selectors** for all framework CSS. No class-based selectors.
   (Component Wrapper Pattern)
3. **No backwards compat shims.** Delete old code, don't re-export or alias. (Rule 2)
4. **Consumer apps have no source code.** Target: `snapshot.manifest.json` +
   `vite.config.ts` + `package.json`. No `src/`, no `.tsx`, no `.css`. (Rule 6)
5. **Defaults render presentably.** A manifest with minimal config must produce a beautiful,
   themed, working app. (Rule 5)
6. **Every component in playground** with all states. (Playground Rules)
7. **SSR safe.** No `document`/`window` in render body. `resolveFrameworkStyles()` is a pure
   string function — SSR compatible by design. (SSR Rules)
8. **Canonical token list.** Every CSS var must exist in the canonical token list in
   engineering-rules.md. Invented variable names are the #1 source of visual bugs.

---

## A.1: Expand `resolveFrameworkStyles()` — All 76 Components

### Goal

Every registered component type gets baseline CSS rules in the framework stylesheet.
Today only 5 types are covered. After this phase, all 76 are.

### What Exists (lines 750-956 of `resolve.ts`)

Currently covered:
- `[data-snapshot-component="data-table"]` — 45 lines (border, radius, thead, th, td, pagination, bulk actions)
- `[data-snapshot-component="stat-card"]` — 7 lines (card styling)
- `[data-snapshot-component="form"]` — 73 lines (fields, inputs, focus, checkbox, submit)
- `[data-snapshot-component="detail-card"]` — 3 lines (max-width)
- `[data-snapshot-component]` — 3 lines (generic max-width)
- CSS reset — 12 lines
- Page layout — 5 lines
- Focus ring — 7 lines
- Animations — 24 lines (6 keyframes)

### Implementation

Add CSS rules to `resolveFrameworkStyles()` in `src/ui/tokens/resolve.ts` for every
uncovered component type. Rules must:

1. Use only canonical `--sn-*` tokens with fallback values
2. Target `[data-snapshot-component="<type>"]` selectors
3. Cover: container styling (bg, border, radius, shadow, padding), typography, spacing
4. Cover interactive states where applicable (`:hover`, `:focus-visible`, `:disabled`)
5. NOT duplicate styling already handled by inline styles in the component — framework CSS
   provides the structural/container chrome, inline styles handle variant-specific logic

### Components to Add (grouped by priority)

**High priority (visible in budget-fe):**

```css
/* ── Badge ────────────────────────────────────────────────────────────── */

[data-snapshot-component="badge"] {
  display: inline-flex;
  align-items: center;
  gap: var(--sn-spacing-xs, 0.25rem);
  font-size: var(--sn-font-size-xs, 0.75rem);
  font-weight: var(--sn-font-weight-medium, 500);
  line-height: 1;
  white-space: nowrap;
}

/* ── Tabs ─────────────────────────────────────────────────────────────── */

[data-snapshot-component="tabs"] [data-tab-list] {
  display: flex;
  gap: var(--sn-spacing-xs, 0.25rem);
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
  padding-bottom: 0;
}
[data-snapshot-component="tabs"] [data-tab-trigger] {
  padding: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  font-weight: var(--sn-font-weight-medium, 500);
  color: var(--sn-color-muted-foreground, #667085);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color var(--sn-duration-fast, 150ms), border-color var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="tabs"] [data-tab-trigger][data-active] {
  color: var(--sn-color-foreground, #111);
  border-bottom-color: var(--sn-color-primary, #2563eb);
}
[data-snapshot-component="tabs"] [data-tab-content] {
  padding-top: var(--sn-spacing-md, 1rem);
}

/* ── Accordion ────────────────────────────────────────────────────────── */

[data-snapshot-component="accordion"] {
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  overflow: hidden;
}
[data-snapshot-component="accordion"] [data-accordion-trigger] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  font-weight: var(--sn-font-weight-medium, 500);
  background: var(--sn-color-card, #fff);
  border: none;
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
  cursor: pointer;
  transition: background var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="accordion"] [data-accordion-trigger]:hover {
  background: var(--sn-color-muted, #f1f5f9);
}
[data-snapshot-component="accordion"] [data-accordion-content] {
  padding: var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem);
  background: var(--sn-color-card, #fff);
}

/* ── Modal ────────────────────────────────────────────────────────────── */

[data-snapshot-component="modal"] [data-modal-overlay] {
  position: fixed;
  inset: 0;
  z-index: var(--sn-z-index-modal, 40);
}
[data-snapshot-component="modal"] [data-modal-content] {
  background: var(--sn-color-card, #fff);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  box-shadow: var(--sn-shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));
}
[data-snapshot-component="modal"] [data-modal-header] {
  padding: var(--sn-spacing-lg, 1.5rem);
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
}
[data-snapshot-component="modal"] [data-modal-body] {
  padding: var(--sn-spacing-lg, 1.5rem);
}
[data-snapshot-component="modal"] [data-modal-footer] {
  padding: var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem);
  border-top: 1px solid var(--sn-color-border, #e5e7eb);
}

/* ── Drawer ───────────────────────────────────────────────────────────── */

[data-snapshot-component="drawer"] [data-drawer-content] {
  background: var(--sn-color-card, #fff);
  border-left: 1px solid var(--sn-color-border, #e5e7eb);
  box-shadow: var(--sn-shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));
}

/* ── Alert ────────────────────────────────────────────────────────────── */

[data-snapshot-component="alert"] {
  display: flex;
  gap: var(--sn-spacing-sm, 0.5rem);
  padding: var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
}

/* ── Avatar ───────────────────────────────────────────────────────────── */

[data-snapshot-component="avatar"] img,
[data-snapshot-component="avatar"] [data-avatar-fallback] {
  border-radius: var(--sn-radius-full, 9999px);
  object-fit: cover;
}

/* ── Breadcrumb ───────────────────────────────────────────────────────── */

[data-snapshot-component="breadcrumb"] {
  display: flex;
  align-items: center;
  gap: var(--sn-spacing-xs, 0.25rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  color: var(--sn-color-muted-foreground, #667085);
}
[data-snapshot-component="breadcrumb"] a {
  color: var(--sn-color-muted-foreground, #667085);
  text-decoration: none;
  transition: color var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="breadcrumb"] a:hover {
  color: var(--sn-color-foreground, #111);
}

/* ── Stepper ──────────────────────────────────────────────────────────── */

[data-snapshot-component="stepper"] {
  display: flex;
  align-items: center;
  gap: var(--sn-spacing-sm, 0.5rem);
}

/* ── List ─────────────────────────────────────────────────────────────── */

[data-snapshot-component="list"] {
  display: flex;
  flex-direction: column;
}
[data-snapshot-component="list"] [data-list-item] {
  padding: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
  transition: background var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="list"] [data-list-item]:last-child {
  border-bottom: none;
}
[data-snapshot-component="list"] [data-list-item]:hover {
  background: var(--sn-color-muted, #f1f5f9);
}

/* ── Empty state ──────────────────────────────────────────────────────── */

[data-snapshot-component="empty-state"] {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sn-spacing-md, 1rem);
  padding: var(--sn-spacing-2xl, 3rem) var(--sn-spacing-lg, 1.5rem);
  text-align: center;
  color: var(--sn-color-muted-foreground, #667085);
}

/* ── Progress ─────────────────────────────────────────────────────────── */

[data-snapshot-component="progress"] {
  height: 0.5rem;
  background: var(--sn-color-muted, #f1f5f9);
  border-radius: var(--sn-radius-full, 9999px);
  overflow: hidden;
}
[data-snapshot-component="progress"] [data-progress-bar] {
  height: 100%;
  border-radius: var(--sn-radius-full, 9999px);
  background: var(--sn-color-primary, #2563eb);
  transition: width var(--sn-duration-normal, 300ms) var(--sn-ease-default, ease);
}

/* ── Skeleton ─────────────────────────────────────────────────────────── */

[data-snapshot-component="skeleton"],
[data-snapshot-loading] {
  background: var(--sn-color-muted, #f1f5f9);
  border-radius: var(--sn-radius-md, 0.375rem);
  animation: sn-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes sn-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── Tooltip ──────────────────────────────────────────────────────────── */

[data-snapshot-component="tooltip"] [data-tooltip-content] {
  background: var(--sn-color-foreground, #111);
  color: var(--sn-color-background, #fff);
  font-size: var(--sn-font-size-xs, 0.75rem);
  padding: var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem);
  border-radius: var(--sn-radius-sm, 0.25rem);
  z-index: var(--sn-z-index-tooltip, 50);
}

/* ── Dropdown menu ────────────────────────────────────────────────────── */

[data-snapshot-component="dropdown-menu"] [data-menu-content] {
  background: var(--sn-color-card, #fff);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  box-shadow: var(--sn-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
  padding: var(--sn-spacing-xs, 0.25rem);
  z-index: var(--sn-z-index-dropdown, 10);
  min-width: 10rem;
}
[data-snapshot-component="dropdown-menu"] [data-menu-item] {
  display: flex;
  align-items: center;
  gap: var(--sn-spacing-sm, 0.5rem);
  padding: var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  border-radius: var(--sn-radius-sm, 0.25rem);
  cursor: pointer;
  transition: background var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="dropdown-menu"] [data-menu-item]:hover {
  background: var(--sn-color-accent, #f1f5f9);
}
[data-snapshot-component="dropdown-menu"] [data-menu-separator] {
  height: 1px;
  background: var(--sn-color-border, #e5e7eb);
  margin: var(--sn-spacing-xs, 0.25rem) 0;
}
```

**Medium priority (communication, workflow, content):**

```css
/* ── Kanban ───────────────────────────────────────────────────────────── */

[data-snapshot-component="kanban"] {
  display: flex;
  gap: var(--sn-spacing-md, 1rem);
  overflow-x: auto;
  padding-bottom: var(--sn-spacing-sm, 0.5rem);
}
[data-snapshot-component="kanban"] [data-kanban-column] {
  min-width: 280px;
  background: var(--sn-color-muted, #f1f5f9);
  border-radius: var(--sn-radius-lg, 0.75rem);
  padding: var(--sn-spacing-sm, 0.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-sm, 0.5rem);
}
[data-snapshot-component="kanban"] [data-kanban-card] {
  background: var(--sn-color-card, #fff);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  padding: var(--sn-spacing-md, 1rem);
  box-shadow: var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
  cursor: grab;
}

/* ── Calendar ─────────────────────────────────────────────────────────── */

[data-snapshot-component="calendar"] {
  background: var(--sn-color-card, #fff);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  padding: var(--sn-spacing-md, 1rem);
}

/* ── Timeline ─────────────────────────────────────────────────────────── */

[data-snapshot-component="timeline"] {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-md, 1rem);
  padding-left: var(--sn-spacing-lg, 1.5rem);
  border-left: 2px solid var(--sn-color-border, #e5e7eb);
}

/* ── Chat window ──────────────────────────────────────────────────────── */

[data-snapshot-component="chat-window"] {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--sn-color-card, #fff);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  overflow: hidden;
}

/* ── Comment section ──────────────────────────────────────────────────── */

[data-snapshot-component="comment-section"] {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-md, 1rem);
}

/* ── Code block ───────────────────────────────────────────────────────── */

[data-snapshot-component="code-block"] {
  background: var(--sn-color-muted, #f1f5f9);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  padding: var(--sn-spacing-md, 1rem);
  font-family: var(--sn-font-mono, monospace);
  font-size: var(--sn-font-size-sm, 0.875rem);
  overflow-x: auto;
}

/* ── Rich text editor ─────────────────────────────────────────────────── */

[data-snapshot-component="rich-text-editor"] {
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  overflow: hidden;
}
[data-snapshot-component="rich-text-editor"] [data-editor-toolbar] {
  display: flex;
  gap: var(--sn-spacing-2xs, 0.125rem);
  padding: var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem);
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
  background: var(--sn-color-muted, #f1f5f9);
}
[data-snapshot-component="rich-text-editor"] [data-editor-content] {
  padding: var(--sn-spacing-md, 1rem);
  min-height: 8rem;
}

/* ── File uploader ────────────────────────────────────────────────────── */

[data-snapshot-component="file-uploader"] [data-dropzone] {
  border: 2px dashed var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  padding: var(--sn-spacing-xl, 2rem);
  text-align: center;
  color: var(--sn-color-muted-foreground, #667085);
  cursor: pointer;
  transition: border-color var(--sn-duration-fast, 150ms), background var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="file-uploader"] [data-dropzone]:hover,
[data-snapshot-component="file-uploader"] [data-dropzone][data-drag-active] {
  border-color: var(--sn-color-primary, #2563eb);
  background: color-mix(in oklch, var(--sn-color-primary, #2563eb) 5%, transparent);
}

/* ── Pricing table ────────────────────────────────────────────────────── */

[data-snapshot-component="pricing-table"] {
  display: grid;
  gap: var(--sn-spacing-md, 1rem);
}
[data-snapshot-component="pricing-table"] [data-pricing-card] {
  background: var(--sn-color-card, #fff);
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  padding: var(--sn-spacing-xl, 2rem);
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-md, 1rem);
}
[data-snapshot-component="pricing-table"] [data-pricing-card][data-featured] {
  border-color: var(--sn-color-primary, #2563eb);
  box-shadow: 0 0 0 1px var(--sn-color-primary, #2563eb);
}

/* ── Notification feed ────────────────────────────────────────────────── */

[data-snapshot-component="notification-feed"] [data-notification-item] {
  display: flex;
  gap: var(--sn-spacing-sm, 0.5rem);
  padding: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
  transition: background var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="notification-feed"] [data-notification-item]:hover {
  background: var(--sn-color-muted, #f1f5f9);
}
[data-snapshot-component="notification-feed"] [data-notification-item][data-unread] {
  background: color-mix(in oklch, var(--sn-color-primary, #2563eb) 5%, transparent);
}

/* ── Tree view ────────────────────────────────────────────────────────── */

[data-snapshot-component="tree-view"] [data-tree-node] {
  display: flex;
  align-items: center;
  gap: var(--sn-spacing-xs, 0.25rem);
  padding: var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  border-radius: var(--sn-radius-sm, 0.25rem);
  cursor: pointer;
  transition: background var(--sn-duration-fast, 150ms);
}
[data-snapshot-component="tree-view"] [data-tree-node]:hover {
  background: var(--sn-color-muted, #f1f5f9);
}
[data-snapshot-component="tree-view"] [data-tree-node][data-selected] {
  background: var(--sn-color-accent, #f1f5f9);
  color: var(--sn-color-accent-foreground, #111);
}
```

### How to Implement

1. Open `src/ui/tokens/resolve.ts`
2. Find `resolveFrameworkStyles()` at line 750
3. Add the new CSS rules after the existing component sections (before the closing backtick
   at line 955)
4. Group by component category with section comments matching the existing pattern:
   `/* ── Component Name ──...── */`

### Data Attribute Verification

Before adding CSS for a component, verify it emits the expected `data-*` attributes. Check
each component's `component.tsx` for:

- `data-snapshot-component` — added by `ComponentWrapper` automatically
- Sub-element attrs like `data-tab-list`, `data-accordion-trigger`, etc. — must be added by
  the component implementation

If a component doesn't emit sub-element data attributes, add them in phase A.2.

### Files to Modify

| File | Change |
|---|---|
| `src/ui/tokens/resolve.ts` | Add ~300 lines of CSS rules to `resolveFrameworkStyles()` |

### Files to Verify (data attributes present)

| File | Verify |
|---|---|
| `src/ui/components/navigation/tabs/component.tsx` | `data-tab-list`, `data-tab-trigger`, `data-tab-content`, `data-active` |
| `src/ui/components/navigation/accordion/component.tsx` | `data-accordion-trigger`, `data-accordion-content` |
| `src/ui/components/overlay/modal/component.tsx` | `data-modal-overlay`, `data-modal-content`, `data-modal-header`, `data-modal-body`, `data-modal-footer` |
| `src/ui/components/overlay/drawer/component.tsx` | `data-drawer-content` |
| `src/ui/components/data/list/component.tsx` | `data-list-item` |
| `src/ui/components/workflow/kanban/component.tsx` | `data-kanban-column`, `data-kanban-card` |
| All components | `data-snapshot-component` (via ComponentWrapper — already present) |

### Tests

| File | What to Test |
|---|---|
| `src/ui/tokens/__tests__/resolve.test.ts` | `resolveFrameworkStyles()` contains selectors for all 76 component types |
| `src/ui/manifest/__tests__/app.test.tsx` | Framework CSS is injected into `<style id="snapshot-framework">` |

Add to `resolve.test.ts`:
```typescript
describe("resolveFrameworkStyles", () => {
  const css = resolveFrameworkStyles();

  it("includes CSS reset", () => {
    expect(css).toContain("box-sizing: border-box");
  });

  it("includes all major component types", () => {
    const requiredComponents = [
      "data-table", "stat-card", "form", "detail-card",
      "badge", "tabs", "accordion", "modal", "drawer",
      "alert", "avatar", "breadcrumb", "list", "empty-state",
      "progress", "skeleton", "tooltip", "dropdown-menu",
      "kanban", "calendar", "timeline", "chat-window",
      "code-block", "rich-text-editor", "file-uploader",
      "pricing-table", "notification-feed", "tree-view",
    ];
    for (const type of requiredComponents) {
      expect(css).toContain(`data-snapshot-component="${type}"`);
    }
  });

  it("uses only canonical --sn-* tokens", () => {
    // Extract all var() references
    const varRefs = css.match(/var\(--sn-[a-z0-9-]+/g) ?? [];
    const unique = [...new Set(varRefs.map((v) => v.replace("var(", "")))];
    // Every --sn-* var must be in the canonical list
    for (const v of unique) {
      expect(CANONICAL_TOKENS).toContain(v);
    }
  });
});
```

### Exit Criteria

- [ ] `resolveFrameworkStyles()` output contains `[data-snapshot-component="<type>"]`
      selectors for all 76 registered component types
- [ ] Every CSS rule uses only `--sn-*` token vars from the canonical list
- [ ] Every CSS rule includes a hardcoded fallback value in `var()`
- [ ] `bun run typecheck` passes
- [ ] `bun test src/ui/tokens/__tests__/resolve.test.ts` passes

---

## A.2: Audit & Fix Component Data Attributes

### Goal

Every component's `component.tsx` emits the sub-element `data-*` attributes that the
framework CSS targets. Without these, the CSS selectors in A.1 have nothing to match.

### Implementation

For each component type, verify that sub-elements use `data-*` attributes. If missing,
add them. Example fix:

**Before (tabs/component.tsx):**
```tsx
<div className="tab-list" role="tablist">
```

**After:**
```tsx
<div data-tab-list="" role="tablist">
```

### Audit Checklist

For every component added in A.1, verify these data attributes exist in its
`component.tsx`:

| Component | Required Attributes |
|---|---|
| tabs | `data-tab-list`, `data-tab-trigger`, `data-tab-content`, `data-active` |
| accordion | `data-accordion-trigger`, `data-accordion-content` |
| modal | `data-modal-overlay`, `data-modal-content`, `data-modal-header`, `data-modal-body`, `data-modal-footer` |
| drawer | `data-drawer-content` |
| dropdown-menu | `data-menu-content`, `data-menu-item`, `data-menu-separator` |
| list | `data-list-item` |
| kanban | `data-kanban-column`, `data-kanban-card` |
| tree-view | `data-tree-node`, `data-selected` |
| rich-text-editor | `data-editor-toolbar`, `data-editor-content` |
| file-uploader | `data-dropzone`, `data-drag-active` |
| pricing-table | `data-pricing-card`, `data-featured` |
| notification-feed | `data-notification-item`, `data-unread` |
| tooltip | `data-tooltip-content` |
| progress | `data-progress-bar` |
| avatar | `data-avatar-fallback` |

### Files to Modify

Every component listed above — its `component.tsx` file. Exact paths follow the pattern:
```
src/ui/components/{group}/{component-name}/component.tsx
```

### Exit Criteria

- [ ] Every component's sub-elements use `data-*` attributes matching the CSS selectors
- [ ] No `className`-based selectors in framework CSS (all `data-*` based)
- [ ] `bun run typecheck` passes
- [ ] `bun test` passes (existing tests still work with data attribute additions)

---

## A.3: Budget-FE Migration to `snapshotApp()` Plugin

### Goal

Budget-fe uses the `snapshotApp()` Vite plugin, deletes `src/main.tsx` and the manual
`index.html`, and runs with zero source files.

### Implementation

**Step 1: Update `budget-fe/vite.config.ts`**

Replace:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
  resolve: {
    alias: {
      "@lastshotlabs/snapshot/ui": path.resolve(
        __dirname,
        "../snapshot/src/ui.ts",
      ),
      "@lastshotlabs/snapshot": path.resolve(
        __dirname,
        "../snapshot/src/index.ts",
      ),
    },
  },
});
```

With:
```ts
import { defineConfig } from "vite";
import { snapshotApp } from "@lastshotlabs/snapshot/vite";
import path from "node:path";

export default defineConfig({
  plugins: [snapshotApp()],
  server: {
    port: 5175,
  },
  resolve: {
    alias: {
      "@lastshotlabs/snapshot/ui": path.resolve(
        __dirname,
        "../snapshot/src/ui.ts",
      ),
      "@lastshotlabs/snapshot/vite": path.resolve(
        __dirname,
        "../snapshot/src/vite/index.ts",
      ),
      "@lastshotlabs/snapshot": path.resolve(
        __dirname,
        "../snapshot/src/index.ts",
      ),
    },
  },
});
```

**Step 2: Delete `budget-fe/src/main.tsx`**

**Step 3: Delete `budget-fe/index.html`**

The `snapshotApp()` plugin generates the HTML shell via its `configureServer` middleware
(line 141-163 of `src/vite/index.ts`).

**Step 4: Update `budget-fe/package.json`**

Remove `@vitejs/plugin-react` from devDependencies. Add `@tailwindcss/vite` to
devDependencies (for Tailwind class support in manifest `className`).

**Step 5: Verify the `snapshotApp()` plugin handles build mode**

Check that the plugin's `config` hook generates proper `build.rollupOptions.input` for
production builds. Currently the plugin only handles dev server via `configureServer`.
If build mode is broken, fix the plugin to also generate a virtual HTML entry for
`vite build`.

### Files to Modify

| File | Change |
|---|---|
| `budget-fe/vite.config.ts` | Switch to `snapshotApp()` plugin |
| `budget-fe/src/main.tsx` | DELETE |
| `budget-fe/index.html` | DELETE |
| `budget-fe/package.json` | Remove `@vitejs/plugin-react`, add `@tailwindcss/vite` |

### Files to Verify

| File | Verify |
|---|---|
| `src/vite/index.ts` | `snapshotApp()` works in both dev and build mode |

### Exit Criteria

- [ ] `budget-fe/src/` directory is empty (or deleted)
- [ ] `budget-fe/index.html` does not exist
- [ ] `cd budget-fe && bun run dev` starts successfully and renders the app
- [ ] `cd budget-fe && bun run build` produces a production bundle
- [ ] The app looks identical (or better) to before the migration
- [ ] Tailwind classes in `className` work (e.g., add `"className": "text-red-500"` to a
      component in the manifest and verify it renders red)

---

## A.4: Tailwind Bridge Completeness

### Goal

The Tailwind bridge (`generateTailwindBridge()`) maps all canonical `--sn-*` tokens to
Tailwind utilities so `className` in manifest JSON works for any token value.

### What Exists (tailwind-bridge.ts — 56 lines)

Currently bridges: 21 colors, 4 radius scales, 5 spacing scales, 2 font families. Missing:
font sizes, shadows, z-index, line-heights, font-weights, border-widths, container widths,
animation durations.

### Implementation

Expand `generateTailwindBridge()` in `src/ui/tokens/tailwind-bridge.ts`:

```typescript
export function generateTailwindBridge(): string {
  return `@import "tailwindcss";

@theme {
  /* ── Colors ─────────────────────────────────────────────────────────── */
  --color-background: var(--sn-color-background);
  --color-foreground: var(--sn-color-foreground);
  --color-card: var(--sn-color-card);
  --color-card-foreground: var(--sn-color-card-foreground);
  --color-popover: var(--sn-color-popover, var(--sn-color-card));
  --color-popover-foreground: var(--sn-color-popover-foreground, var(--sn-color-card-foreground));
  --color-primary: var(--sn-color-primary);
  --color-primary-foreground: var(--sn-color-primary-foreground);
  --color-secondary: var(--sn-color-secondary);
  --color-secondary-foreground: var(--sn-color-secondary-foreground);
  --color-muted: var(--sn-color-muted);
  --color-muted-foreground: var(--sn-color-muted-foreground);
  --color-accent: var(--sn-color-accent);
  --color-accent-foreground: var(--sn-color-accent-foreground);
  --color-destructive: var(--sn-color-destructive);
  --color-destructive-foreground: var(--sn-color-destructive-foreground);
  --color-success: var(--sn-color-success);
  --color-success-foreground: var(--sn-color-success-foreground);
  --color-warning: var(--sn-color-warning);
  --color-warning-foreground: var(--sn-color-warning-foreground);
  --color-info: var(--sn-color-info);
  --color-info-foreground: var(--sn-color-info-foreground);
  --color-border: var(--sn-color-border);
  --color-input: var(--sn-color-input);
  --color-ring: var(--sn-color-ring);
  --color-sidebar: var(--sn-color-sidebar);
  --color-sidebar-foreground: var(--sn-color-sidebar-foreground);
  --color-chart-1: var(--sn-chart-1);
  --color-chart-2: var(--sn-chart-2);
  --color-chart-3: var(--sn-chart-3);
  --color-chart-4: var(--sn-chart-4);
  --color-chart-5: var(--sn-chart-5);

  /* ── Radius ─────────────────────────────────────────────────────────── */
  --radius-none: var(--sn-radius-none);
  --radius-xs: var(--sn-radius-xs);
  --radius-sm: var(--sn-radius-sm);
  --radius-md: var(--sn-radius-md);
  --radius-lg: var(--sn-radius-lg);
  --radius-xl: var(--sn-radius-xl);
  --radius-full: var(--sn-radius-full);

  /* ── Spacing ────────────────────────────────────────────────────────── */
  --spacing-2xs: var(--sn-spacing-2xs);
  --spacing-xs: var(--sn-spacing-xs);
  --spacing-sm: var(--sn-spacing-sm);
  --spacing-md: var(--sn-spacing-md);
  --spacing-lg: var(--sn-spacing-lg);
  --spacing-xl: var(--sn-spacing-xl);
  --spacing-2xl: var(--sn-spacing-2xl);
  --spacing-3xl: var(--sn-spacing-3xl);

  /* ── Fonts ──────────────────────────────────────────────────────────── */
  --font-sans: var(--sn-font-sans);
  --font-mono: var(--sn-font-mono);
  --font-display: var(--sn-font-display, var(--sn-font-sans));

  /* ── Font sizes ─────────────────────────────────────────────────────── */
  --text-xs: var(--sn-font-size-xs);
  --text-sm: var(--sn-font-size-sm);
  --text-base: var(--sn-font-size-md);
  --text-lg: var(--sn-font-size-lg);
  --text-xl: var(--sn-font-size-xl);
  --text-2xl: var(--sn-font-size-2xl);
  --text-3xl: var(--sn-font-size-3xl);
  --text-4xl: var(--sn-font-size-4xl);

  /* ── Shadows ────────────────────────────────────────────────────────── */
  --shadow-none: var(--sn-shadow-none);
  --shadow-xs: var(--sn-shadow-xs);
  --shadow-sm: var(--sn-shadow-sm);
  --shadow-md: var(--sn-shadow-md);
  --shadow-lg: var(--sn-shadow-lg);
  --shadow-xl: var(--sn-shadow-xl);

  /* ── Z-index ────────────────────────────────────────────────────────── */
  --z-base: var(--sn-z-index-base);
  --z-dropdown: var(--sn-z-index-dropdown);
  --z-sticky: var(--sn-z-index-sticky);
  --z-overlay: var(--sn-z-index-overlay);
  --z-modal: var(--sn-z-index-modal);
  --z-popover: var(--sn-z-index-popover);
  --z-toast: var(--sn-z-index-toast);
}
`;
}
```

### Files to Modify

| File | Change |
|---|---|
| `src/ui/tokens/tailwind-bridge.ts` | Expand to map all canonical tokens |

### Tests

| File | What to Test |
|---|---|
| `src/ui/tokens/__tests__/tailwind-bridge.test.ts` | CREATE: bridge output contains all token categories |

### Exit Criteria

- [ ] `generateTailwindBridge()` maps all color, radius, spacing, font, shadow, z-index tokens
- [ ] `className: "bg-primary text-foreground shadow-lg rounded-xl p-lg"` works in manifest JSON
- [ ] `bun run typecheck` passes

---

## A.5: Font Loading from Manifest Config

### Goal

Fonts declared in `manifest.theme.font` config auto-load via `@import` or `@font-face`
rules in the token CSS output.

### What Exists

`resolveTokens()` already handles Google Font imports (lines 710-717 of `resolve.ts`):
```typescript
if (config.overrides?.font?.sans) {
  const fontName = config.overrides.font.sans;
  if (KNOWN_GOOGLE_FONTS.includes(fontName)) {
    fontImports.push(`@import url('https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap');`);
  }
}
```

### What's Missing

1. Custom font URLs (`"source": "url"`) with `@font-face` generation
2. `font.display` family loading (only `font.sans` and `font.mono` checked today)
3. Configurable weights per font family
4. Font preload `<link>` tags for critical fonts

### Implementation

Expand the font loading section in `resolveTokens()`:

```typescript
// After resolving font families, before building CSS output:
const fontFaces: string[] = [];

for (const [role, fontConfig] of Object.entries(resolvedFont)) {
  if (typeof fontConfig === "string") {
    // Simple font name — check Google Fonts
    if (KNOWN_GOOGLE_FONTS.includes(fontConfig)) {
      fontImports.push(
        `@import url('https://fonts.googleapis.com/css2?family=${fontConfig.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap');`
      );
    }
  } else if (fontConfig && typeof fontConfig === "object") {
    // Structured font config
    if (fontConfig.source === "google") {
      const weights = fontConfig.weights?.join(";") ?? "300;400;500;600;700";
      fontImports.push(
        `@import url('https://fonts.googleapis.com/css2?family=${fontConfig.family.replace(/ /g, "+")}:wght@${weights}&display=swap');`
      );
    } else if (fontConfig.source === "url" && fontConfig.url) {
      fontFaces.push(`@font-face {
  font-family: '${fontConfig.family}';
  src: url('${fontConfig.url}');
  font-display: swap;
}`);
    }
  }
}
```

### Schema Addition

Add structured font config to the theme schema in `src/ui/manifest/schema.ts`:

```typescript
const fontSourceSchema = z.union([
  z.string(), // Simple font name (Google Fonts auto-detection)
  z.object({
    family: z.string(),
    source: z.enum(["google", "url"]),
    url: z.string().optional(),
    weights: z.array(z.number()).optional(),
  }),
]);
```

### Files to Modify

| File | Change |
|---|---|
| `src/ui/tokens/resolve.ts` | Expand font loading logic in `resolveTokens()` |
| `src/ui/manifest/schema.ts` | Add `fontSourceSchema` for structured font config |
| `src/ui/tokens/types.ts` | Update `FontConfig` type if needed |

### Exit Criteria

- [ ] `"font": { "sans": { "family": "Inter", "source": "google", "weights": [400, 500, 600, 700] } }` generates correct `@import`
- [ ] `"font": { "display": { "family": "Cal Sans", "source": "url", "url": "/fonts/CalSans.woff2" } }` generates `@font-face`
- [ ] `bun run typecheck` passes
- [ ] `bun test` passes

---

## A.6: Dark Mode Edge Cases

### Goal

Dark mode works flawlessly from manifest config. Toggle persists, initial state avoids
flash, and all components respond.

### What Exists

`ManifestApp` has a `DarkModeManager` component (referenced at line 1724 of `app.tsx`).
Budget-fe's `index.html` has an inline `<script>` that reads from `localStorage` and sets
`.dark` on `<html>` before React hydrates — preventing flash.

### What Needs Verification

1. The `snapshotApp()` plugin's generated HTML must include the same dark mode flash
   prevention script
2. `DarkModeManager` correctly handles `theme.mode: "system"` (prefers-color-scheme media
   query)
3. The `set-theme` action type works to toggle dark mode at runtime
4. Persisted theme preference survives page reload

### Implementation

Check `getSnapshotAppHtml()` in `src/vite/index.ts` (line 46). If it doesn't include the
dark mode script, add it:

```typescript
function getSnapshotAppHtml(entryId: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Snapshot</title>
    <script>
      (function(){
        var t = localStorage.getItem('snapshot-theme');
        if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      })();
    </script>
    <script type="module" src="/@vite/client"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entryId}"></script>
  </body>
</html>
`;
}
```

### Files to Modify

| File | Change |
|---|---|
| `src/vite/index.ts` | Add dark mode flash prevention script to `getSnapshotAppHtml()` |

### Exit Criteria

- [ ] No white flash on load when dark mode is active
- [ ] `theme.mode: "dark"` in manifest starts in dark mode
- [ ] `theme.mode: "system"` respects OS preference
- [ ] Dark mode toggle persists across page reload
- [ ] `bun run typecheck` passes

---

## Parallelization & Sequencing

### Track Overview

| Track | Phases | Files Owned |
|---|---|---|
| **CSS** | A.1, A.4, A.5 | `src/ui/tokens/resolve.ts`, `src/ui/tokens/tailwind-bridge.ts` |
| **Components** | A.2 | `src/ui/components/*/component.tsx` (data attribute additions only) |
| **Runtime** | A.6 | `src/vite/index.ts` (dark mode script), `src/ui/manifest/app.tsx` (DarkModeManager) |
| **Dogfood** | A.3 | `budget-fe/*` (no snapshot files) |

### Why Tracks Don't Conflict

- **CSS track** only modifies token/bridge files — no component files
- **Components track** only adds data attributes to component `.tsx` files — doesn't touch
  token files
- **Runtime track** only modifies the Vite plugin HTML output and DarkModeManager
- **Dogfood track** only modifies budget-fe files — no snapshot files

### Internal Sequencing

```
A.1 (framework CSS) ──┐
                       ├── A.3 (budget-fe migration)
A.2 (data attributes) ─┘
                           A.3 depends on A.1 + A.2 being done
A.4 (tailwind bridge) ─── independent, can run in parallel with A.1/A.2
A.5 (font loading) ────── independent
A.6 (dark mode) ───────── independent, but verify after A.3
```

### Branch Strategy

- Branch: `phase-a/css-foundation`
- Push branch, don't merge. Review before merge.
- Each phase committed separately with descriptive message.

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` — understand token rules, component conventions
2. Read this spec — understand scope, files, changes
3. Start with A.1 (expand `resolveFrameworkStyles()`)
4. Then A.2 (audit data attributes, fix missing ones)
5. Run `bun run typecheck && bun test src/ui/tokens/__tests__/resolve.test.ts`
6. Commit A.1 + A.2
7. Do A.4 (Tailwind bridge) — independent
8. Do A.5 (font loading) — independent
9. Do A.6 (dark mode) — independent
10. Run full `bun run typecheck && bun test`
11. Commit all
12. Do A.3 (budget-fe migration) — depends on everything above
13. Verify budget-fe runs: `cd budget-fe && bun run dev`
14. Commit, push branch

---

## Definition of Done

### Per-Phase Checks

```sh
# After A.1 + A.2:
bun run typecheck
bun test src/ui/tokens/__tests__/resolve.test.ts

# After A.4:
bun run typecheck

# After A.5:
bun run typecheck
bun test src/ui/tokens/__tests__/resolve.test.ts

# After A.6:
bun run typecheck

# After all phases:
bun run typecheck
bun run format:check
bun run build
bun test
```

### Full Completion

- [ ] `resolveFrameworkStyles()` covers all 76 component types
- [ ] All component sub-elements have data attributes for CSS targeting
- [ ] Budget-fe has no `src/` directory, no `index.html`
- [ ] Budget-fe starts with `bun run dev` and renders correctly
- [ ] Budget-fe builds with `bun run build`
- [ ] Tailwind classes work in manifest `className`
- [ ] Dark mode works without flash
- [ ] All Snapshot tests pass
- [ ] No `any` casts, no unnecessary type assertions
