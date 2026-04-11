# Manifest UI: Complete Vision Spec

> **Goal:** One JSON file = a production-quality app indistinguishable from Facebook, Discord, Nike.com, or any sophisticated SPA. No `.tsx` files. No escape hatches. Everything declarative.

---

## Implementation Specs

Each phase has a dedicated implementation spec that a zero-context agent can execute.

| Phase | Spec File | Lines | Priority |
|---|---|---|---|
| A | [`phase-a-css-foundation.md`](phase-a-css-foundation.md) | 1268 | **P0** |
| B | [`phase-b-layout.md`](phase-b-layout.md) | 666 | P1 |
| C | [`phase-c-styling.md`](phase-c-styling.md) | 475 | P1 |
| D | [`phase-d-interactivity.md`](phase-d-interactivity.md) | 1391 | P2 |
| E | [`phase-e-state-machine.md`](phase-e-state-machine.md) | 1163 | P1 |
| F | [`phase-f-realtime.md`](phase-f-realtime.md) | 1071 | P3 |
| G | [`phase-g-navigation.md`](phase-g-navigation.md) | 1006 | P2 |
| H | [`phase-h-components.md`](phase-h-components.md) | 1569 | P2 |
| I | [`phase-i-presets.md`](phase-i-presets.md) | 1283 | P3 |
| J | [`phase-j-accessibility.md`](phase-j-accessibility.md) | 965 | P4 |
| K | [`phase-k-performance.md`](phase-k-performance.md) | 984 | P4 |
| L | [`phase-l-dx.md`](phase-l-dx.md) | 1257 | P4 |

**Total: 13,098 lines of implementation specs.**

---

## Table of Contents

1. [Current State & Gap Analysis](#1-current-state--gap-analysis)
2. [The main.tsx Problem](#2-the-maintsx-problem)
3. [Phase A: CSS Foundation — Close the Playground Gap](#3-phase-a-css-foundation)
4. [Phase B: Layout Expressiveness — Beyond Grids](#4-phase-b-layout-expressiveness)
5. [Phase C: Styling Power — Visual Sophistication from Config](#5-phase-c-styling-power)
6. [Phase D: Interactivity Engine — Rich Client Behavior](#6-phase-d-interactivity-engine)
7. [Phase E: State Machine — Client-Side Intelligence](#7-phase-e-state-machine)
8. [Phase F: Real-Time — Live Apps from Config](#8-phase-f-real-time)
9. [Phase G: Navigation & Routing — SPA-Grade UX](#9-phase-g-navigation--routing)
10. [Phase H: Missing Components — Full Primitive Coverage](#10-phase-h-missing-components)
11. [Phase I: Page Presets — Composition Shortcuts](#11-phase-i-page-presets)
12. [Phase J: Accessibility & Polish](#12-phase-j-accessibility--polish)
13. [Phase K: Performance — Production Scale](#13-phase-k-performance)
14. [Phase L: Developer Experience](#14-phase-l-developer-experience)
15. [Dependency Graph & Execution Order](#15-dependency-graph)

---

## 1. Current State & Gap Analysis

### What Works Today
- 76 registered components across 14 categories
- Design token system with OKLCH color derivation, 8 built-in flavors
- `id`/`from` data binding between components
- Action executor with 11 action types and chaining
- Policy-based visibility with boolean algebra
- Auth screens, i18n, analytics hooks
- Resource caching with optimistic mutations

### Why Budget-FE Looks Like 1999

**Root cause:** The playground has **1,031 lines of production CSS** (`playground/src/styles.css`) that manifest-mode apps never receive. This includes:

| What Playground Gets | What Manifest Apps Get |
|---|---|
| CSS reset (box-sizing, margin, padding) | Nothing |
| Typography defaults (font-family, size, line-height) | Token CSS vars (unused by components) |
| Form input styling (borders, focus, placeholders) | Raw browser defaults |
| Component container styles (cards, tables, sections) | Bare divs |
| Dark mode `.dark` class management | Token vars but no class toggling |
| Tailwind `@import "tailwindcss"` | No utility classes |
| Responsive breakpoints | Nothing |

**Components hardcode inline styles instead of reading token CSS variables.** Tokens are generated but never consumed. The entire token infrastructure is wasted.

### The Vision Gap (Ranked by Impact)

| Gap | Impact | Blocks |
|---|---|---|
| No CSS baseline in manifest mode | **Critical** — everything looks broken | All visual quality |
| main.tsx exists (should be zero-code) | **High** — breaks "one JSON file" promise | Developer experience |
| No className/Tailwind in manifest mode | **High** — no fine-grained styling | Visual polish |
| No route transitions / animations | **Medium** — feels like page reloads | SPA feel |
| No client-side computed state | **Medium** — can't derive values | Dynamic UIs |
| No drag-and-drop beyond kanban | **Medium** — limits interactivity | Rich interactions |
| No keyboard shortcuts from config | **Medium** — power user experience | Discord-level UX |
| No WebSocket implementation depth | **Medium** — real-time is schema-only | Live apps |
| No page presets | **Low** — convenience, not capability | Developer velocity |
| No infinite scroll / virtualization | **Low** — works at small scale | Large datasets |

---

## 2. The main.tsx Problem

### Current State (budget-fe)

```tsx
// src/main.tsx — THIS FILE SHOULD NOT EXIST
import React from "react";
import ReactDOM from "react-dom/client";
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
import manifest from "../snapshot.manifest.json";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ManifestApp manifest={manifest as never} apiUrl={import.meta.env.VITE_API_URL ?? "http://localhost:2323"} />
  </React.StrictMode>,
);
```

### Why This Is Wrong

The "one JSON file" vision means a consuming app ships:
- `snapshot.manifest.json`
- `index.html`
- `package.json`
- `vite.config.ts`

**No `src/` directory. No `.tsx` files.** The framework handles everything.

### Solution: Vite Plugin Auto-Entry

```ts
// vite.config.ts — the ONLY config file needed
import { defineConfig } from "vite";
import { snapshotPlugin } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [snapshotPlugin()],
});
```

The plugin:
1. Auto-generates a virtual entry module (`virtual:snapshot-app`)
2. Reads `snapshot.manifest.json` from project root
3. Injects React, ReactDOM, ManifestApp, CSS baseline, Tailwind bridge
4. Manages `index.html` transformation (inject `<script>` tag)
5. Reads `apiUrl` from manifest's `api.baseUrl` or `VITE_API_URL` env var
6. Hot-reloads on manifest file changes

```ts
// What the plugin generates internally (virtual module):
import React from "react";
import ReactDOM from "react-dom/client";
import { ManifestApp, registerBuiltInComponents } from "@lastshotlabs/snapshot/ui";
import "@lastshotlabs/snapshot/css"; // CSS baseline + reset + component styles
import manifest from "./snapshot.manifest.json";

registerBuiltInComponents();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ManifestApp manifest={manifest} />
  </React.StrictMode>,
);
```

### What the Manifest Gains

```jsonc
{
  "app": {
    "title": "Budget",
    "api": {
      "baseUrl": { "env": "VITE_API_URL", "default": "http://localhost:2323" }
    },
    "shell": "sidebar",
    "home": "/"
  }
  // ... rest of manifest
}
```

The `app.api.baseUrl` replaces the `apiUrl` prop. Everything is in the JSON.

---

## 3. Phase A: CSS Foundation

> **Goal:** Budget-fe looks like a real product with ZERO manifest changes. Just upgrade Snapshot.

### A1: CSS Reset & Baseline

`ManifestApp` (or the Vite plugin) injects a `<style>` block containing:

```css
/* Auto-injected by Snapshot */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html {
  font-family: var(--sn-font-sans, system-ui, sans-serif);
  font-size: var(--sn-font-size-base, 16px);
  line-height: var(--sn-line-height-normal, 1.5);
  color: var(--sn-color-foreground);
  background: var(--sn-color-background);
  -webkit-font-smoothing: antialiased;
}
body { min-height: 100dvh; }
img, video, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; color: inherit; }
```

### A2: Component Stylesheet (Token-Driven)

Every component gets baseline CSS that reads token vars. Example:

```css
/* Card */
[data-sn-component="card"] {
  background: var(--sn-color-card);
  border-radius: var(--sn-radius-lg);
  border: var(--sn-card-border, 1px) solid var(--sn-color-border);
  box-shadow: var(--sn-card-shadow, var(--sn-shadow-sm));
  padding: var(--sn-card-padding, var(--sn-spacing-lg));
}

/* Input */
[data-sn-component="input"] input {
  background: var(--sn-color-input);
  border: 1px solid var(--sn-color-border);
  border-radius: var(--sn-radius-md);
  padding: var(--sn-spacing-sm) var(--sn-spacing-md);
  transition: border-color var(--sn-duration-fast) var(--sn-easing-default);
}
[data-sn-component="input"] input:focus {
  outline: none;
  border-color: var(--sn-color-primary);
  box-shadow: 0 0 0 2px var(--sn-color-ring);
}

/* Data Table */
[data-sn-component="data-table"] th {
  background: var(--sn-color-muted);
  font-weight: var(--sn-font-weight-semibold);
  padding: var(--sn-spacing-sm) var(--sn-spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--sn-color-border);
}
```

**Implementation:** Generate this CSS alongside token CSS in `resolveTokens()`. Every component wrapper adds `data-sn-component="<type>"` to its root element.

### A3: Wire Token Vars Through Components

**Audit every component implementation.** Replace:
```tsx
// BAD: hardcoded
<div style={{ padding: "16px", borderRadius: "8px", background: "#1e1e2e" }}>
```
With:
```tsx
// GOOD: token-driven
<div style={{
  padding: "var(--sn-spacing-md)",
  borderRadius: "var(--sn-radius-lg)",
  background: "var(--sn-color-card)"
}}>
```

Or better: remove inline styles entirely and let the component stylesheet handle it via `data-sn-component` selectors.

### A4: Dark Mode Class Management

`ManifestApp` manages the `.dark` class on `<html>`:
- Read initial state from `manifest.theme.mode` or `localStorage`
- Toggle via `set-theme` action
- Persist preference to `localStorage`
- Apply `color-scheme: dark` CSS property

### A5: Tailwind Bridge

The Vite plugin generates a Tailwind `@theme` block that maps Snapshot tokens to Tailwind utilities:

```css
@theme {
  --color-primary: var(--sn-color-primary);
  --color-secondary: var(--sn-color-secondary);
  --radius-sm: var(--sn-radius-sm);
  --radius-md: var(--sn-radius-md);
  /* ... all tokens */
}
```

This enables `className: "bg-primary/50 rounded-xl p-4"` in manifest JSON.

### A6: Font Loading

Support Google Fonts or custom fonts from manifest:

```jsonc
{
  "theme": {
    "fonts": {
      "sans": { "family": "Inter", "source": "google", "weights": [400, 500, 600, 700] },
      "mono": { "family": "JetBrains Mono", "source": "google" },
      "display": { "family": "Cal Sans", "source": "url", "url": "/fonts/CalSans.woff2" }
    }
  }
}
```

`ManifestApp` injects `<link>` tags or `@font-face` rules automatically.

### Acceptance Criteria
- [ ] Budget-fe looks polished with zero code changes — just upgrade Snapshot
- [ ] Every component reads token CSS vars, not hardcoded values
- [ ] Dark mode toggles correctly
- [ ] `className` with Tailwind utilities works in manifest JSON
- [ ] Custom fonts load from manifest config

---

## 4. Phase B: Layout Expressiveness

> **Goal:** Build any layout from JSON — hero sections, sticky headers, asymmetric grids, full-bleed backgrounds, split views.

### B1: CSS Grid Named Areas

```jsonc
{
  "type": "grid",
  "areas": [
    "header header header",
    "sidebar main aside",
    "footer footer footer"
  ],
  "rows": "auto 1fr auto",
  "columns": "250px 1fr 300px",
  "gap": "md",
  "children": [
    { "type": "nav", "area": "header" },
    { "type": "stack", "area": "sidebar", "children": [...] },
    { "type": "stack", "area": "main", "children": [...] },
    { "type": "stack", "area": "aside", "children": [...] },
    { "type": "text", "area": "footer", "text": "© 2026" }
  ]
}
```

Responsive areas:
```jsonc
{
  "areas": {
    "default": ["main", "main"],
    "lg": ["sidebar main", "sidebar main"]
  }
}
```

### B2: Container Component

```jsonc
{
  "type": "container",
  "maxWidth": "xl",       // "sm"|"md"|"lg"|"xl"|"2xl"|"full"|"prose"|number
  "padding": "md",
  "center": true,
  "children": [...]
}
```

### B3: Hero / Full-Bleed Sections

```jsonc
{
  "type": "section",
  "background": {
    "image": "/hero.jpg",
    "overlay": "rgba(0,0,0,0.6)",
    "position": "center",
    "size": "cover",
    "fixed": true           // parallax scrolling
  },
  "height": "60vh",         // or "screen" for full viewport
  "align": "center",
  "justify": "center",
  "bleed": true,            // break out of parent container
  "children": [
    { "type": "heading", "text": "Welcome", "level": 1, "className": "text-5xl text-white" },
    { "type": "text", "text": "Build anything from JSON", "className": "text-xl text-white/80" },
    { "type": "button", "label": "Get Started", "size": "lg", "variant": "default" }
  ]
}
```

### B4: Sticky Positioning

```jsonc
{
  "type": "stack",
  "sticky": true,          // or { "top": "0", "zIndex": 10 }
  "children": [
    { "type": "heading", "text": "Section Header" }
  ]
}
```

Any component can be made sticky via the `sticky` prop in its config.

### B5: Aspect Ratio & Object Fit

```jsonc
{
  "type": "image",
  "src": "/photo.jpg",
  "aspectRatio": "16/9",    // or "1/1", "4/3", "auto"
  "objectFit": "cover",     // "contain", "fill", "none"
  "objectPosition": "top"
}
```

### B6: Responsive Visibility (Show/Hide by Breakpoint)

```jsonc
{
  "type": "nav",
  "variant": "sidebar",
  "visible": { "default": false, "lg": true }   // hidden on mobile, shown on desktop
}
```

### B7: Overflow & Scroll Containers

```jsonc
{
  "type": "stack",
  "overflow": "auto",         // "hidden", "scroll", "auto", "visible"
  "maxHeight": "400px",
  "children": [...]
}
```

### B8: Z-Index Layers from Config

```jsonc
{
  "type": "stack",
  "zIndex": "overlay",       // semantic: "base"|"dropdown"|"sticky"|"overlay"|"modal"|"popover"|"toast" or number
  "position": "fixed",
  "inset": { "bottom": "0", "right": "0" },
  "children": [...]
}
```

### Acceptance Criteria
- [ ] CSS Grid named areas work with responsive breakpoints
- [ ] Hero sections with background images, overlays, parallax
- [ ] Sticky elements work anywhere in the tree
- [ ] Container component with max-width presets
- [ ] Responsive show/hide via `visible` breakpoints
- [ ] Full-bleed sections break out of parent padding

---

## 5. Phase C: Styling Power

> **Goal:** Pixel-perfect visual control from JSON. Gradients, shadows, animations, glassmorphism — the same tools a CSS developer has.

### C1: className Support (Tailwind)

Already partially spec'd. Every component accepts `className`:

```jsonc
{
  "type": "card",
  "className": "bg-gradient-to-r from-primary/20 to-accent/10 border-none shadow-xl backdrop-blur-sm",
  "children": [...]
}
```

### C2: Inline Style Escape Hatch

```jsonc
{
  "type": "stack",
  "style": {
    "background": "linear-gradient(135deg, var(--sn-color-primary), var(--sn-color-accent))",
    "backdropFilter": "blur(12px)",
    "WebkitBackdropFilter": "blur(12px)"
  }
}
```

### C3: Animation Declarations

```jsonc
{
  "type": "stat-card",
  "animation": {
    "enter": "fade-up",         // preset: "fade"|"fade-up"|"fade-down"|"slide-left"|"slide-right"|"scale"|"bounce"
    "duration": "normal",       // token: "instant"|"fast"|"normal"|"slow" or ms number
    "delay": 100,               // ms, useful for staggered lists
    "easing": "spring"          // token or cubic-bezier string
  }
}
```

Staggered children:
```jsonc
{
  "type": "row",
  "animation": {
    "enter": "fade-up",
    "stagger": 50               // ms between each child's animation start
  },
  "children": [
    { "type": "stat-card", "..." : "..." },
    { "type": "stat-card", "..." : "..." },
    { "type": "stat-card", "..." : "..." }
  ]
}
```

### C4: Hover / Focus / Active States

```jsonc
{
  "type": "card",
  "className": "hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer",
  "action": { "type": "navigate", "to": "/details/{id}" }
}
```

Tailwind handles this via `className`. No new schema needed beyond enabling Tailwind.

### C5: Gradient Backgrounds

```jsonc
{
  "type": "section",
  "background": {
    "gradient": {
      "type": "linear",         // "linear"|"radial"|"conic"
      "direction": "135deg",    // or "to-right", "to-bottom-right"
      "stops": [
        { "color": "primary", "position": "0%" },
        { "color": "accent", "position": "100%" }
      ]
    }
  }
}
```

### C6: Backdrop Blur / Glass Effects

```jsonc
{
  "type": "card",
  "glass": true,                // shorthand for backdrop-blur + translucent bg
  // OR explicit:
  "className": "bg-card/80 backdrop-blur-md border border-white/10"
}
```

### C7: Custom Scrollbar Styling

```jsonc
{
  "theme": {
    "components": {
      "scrollbar": {
        "width": "8px",
        "track": "transparent",
        "thumb": "muted",
        "thumbHover": "primary",
        "radius": "full"
      }
    }
  }
}
```

### C8: Shadows & Elevation

Token-driven but also overridable per-instance:

```jsonc
{
  "type": "card",
  "tokens": {
    "shadow": "0 20px 60px -10px rgba(0,0,0,0.3)"  // custom shadow per-instance
  }
}
```

### Acceptance Criteria
- [ ] Tailwind className works on every component
- [ ] Inline style escape hatch works
- [ ] Enter animations with presets and stagger
- [ ] Gradient backgrounds from config
- [ ] Glass/blur effects from config
- [ ] Custom scrollbars from theme tokens

---

## 6. Phase D: Interactivity Engine

> **Goal:** Drag-and-drop, keyboard shortcuts, gestures, scroll effects, form logic — all from config. Discord-level interactivity without writing event handlers.

### D1: Keyboard Shortcuts

```jsonc
{
  "shortcuts": {
    "ctrl+k": { "type": "open-modal", "modal": "command-palette" },
    "ctrl+n": { "type": "open-modal", "modal": "create-new" },
    "escape": { "type": "close-modal" },
    "ctrl+/": { "type": "navigate", "to": "/shortcuts" },
    "g then d": { "type": "navigate", "to": "/dashboard" },
    "g then t": { "type": "navigate", "to": "/transactions" }
  }
}
```

**Scope:** Global shortcuts live at manifest root. Component-level shortcuts attach to focused components:

```jsonc
{
  "type": "data-table",
  "shortcuts": {
    "delete": [
      { "type": "confirm", "message": "Delete selected?" },
      { "type": "api", "method": "DELETE", "endpoint": "/api/{selected.id}" }
    ],
    "enter": { "type": "open-modal", "modal": "edit", "payload": { "from": "self.selected" } }
  }
}
```

### D2: Drag and Drop (Generic)

```jsonc
{
  "type": "list",
  "id": "task-list",
  "data": "GET /api/tasks",
  "draggable": true,
  "onReorder": {
    "type": "api",
    "method": "PATCH",
    "endpoint": "/api/tasks/reorder",
    "body": { "ids": "{reorderedIds}" }
  },
  "dropTargets": ["done-list"],       // allow dropping onto other components
  "onDrop": {
    "type": "api",
    "method": "PATCH",
    "endpoint": "/api/tasks/{draggedItem.id}",
    "body": { "status": "done" }
  }
}
```

**File drag-and-drop:**
```jsonc
{
  "type": "file-uploader",
  "dropzone": true,
  "accept": ["image/*", ".pdf"],
  "maxSize": "10MB",
  "onUpload": {
    "type": "api",
    "method": "POST",
    "endpoint": "/api/files",
    "body": "{files}"
  }
}
```

### D3: Scroll-Driven Behaviors

```jsonc
{
  "type": "section",
  "onScroll": {
    "threshold": 100,                 // px from top
    "enter": { "type": "set-value", "target": "header", "field": "compact", "value": true },
    "leave": { "type": "set-value", "target": "header", "field": "compact", "value": false }
  }
}
```

**Infinite scroll:**
```jsonc
{
  "type": "data-table",
  "pagination": {
    "type": "cursor",
    "pageSize": 25,
    "infinite": true              // auto-load next page on scroll
  }
}
```

**Scroll to element:**
```jsonc
{
  "type": "button",
  "label": "Jump to Comments",
  "action": { "type": "scroll-to", "target": "comments-section", "behavior": "smooth" }
}
```

### D4: Form Field Dependencies

```jsonc
{
  "type": "auto-form",
  "fields": [
    {
      "name": "accountType",
      "type": "select",
      "options": ["checking", "savings", "credit"]
    },
    {
      "name": "creditLimit",
      "type": "number",
      "visible": { "equals": [{ "from": "self.accountType" }, "credit"] },
      "required": { "equals": [{ "from": "self.accountType" }, "credit"] }
    },
    {
      "name": "interestRate",
      "type": "number",
      "visible": { "any": [
        { "equals": [{ "from": "self.accountType" }, "credit"] },
        { "equals": [{ "from": "self.accountType" }, "savings"] }
      ]}
    }
  ]
}
```

### D5: Client-Side Validation Rules

```jsonc
{
  "type": "auto-form",
  "fields": [
    {
      "name": "email",
      "type": "email",
      "validate": {
        "required": "Email is required",
        "pattern": { "regex": "^[^@]+@[^@]+\\.[^@]+$", "message": "Invalid email" }
      }
    },
    {
      "name": "password",
      "type": "password",
      "validate": {
        "required": true,
        "minLength": { "value": 8, "message": "At least 8 characters" },
        "pattern": { "regex": "[A-Z]", "message": "Must contain uppercase" }
      }
    },
    {
      "name": "confirmPassword",
      "type": "password",
      "validate": {
        "equals": { "field": "password", "message": "Passwords must match" }
      }
    }
  ]
}
```

### D6: Debounce / Throttle on Actions

```jsonc
{
  "type": "input",
  "placeholder": "Search...",
  "onChange": {
    "type": "api",
    "method": "GET",
    "endpoint": "/api/search?q={value}",
    "debounce": 300                  // ms
  }
}
```

### D7: Context Menus from Config

```jsonc
{
  "type": "data-table",
  "contextMenu": [
    { "label": "Edit", "icon": "Pencil", "action": { "type": "open-modal", "modal": "edit" } },
    { "label": "Duplicate", "icon": "Copy", "action": { "type": "api", "method": "POST", "endpoint": "/api/clone/{id}" } },
    { "type": "separator" },
    { "label": "Delete", "icon": "Trash", "variant": "destructive", "action": [...] }
  ]
}
```

### D8: Clipboard Actions

```jsonc
{
  "type": "button",
  "label": "Copy Link",
  "icon": "Copy",
  "action": [
    { "type": "copy-to-clipboard", "value": "https://app.com/share/{id}" },
    { "type": "toast", "message": "Link copied!", "variant": "success" }
  ]
}
```

### D9: Timers & Polling

```jsonc
{
  "type": "stat-card",
  "data": "GET /api/metrics/active-users",
  "poll": {
    "interval": 5000,             // ms
    "pauseWhenHidden": true       // pause when tab not visible
  }
}
```

### D10: Confirmation Variants

```jsonc
{
  "action": [
    {
      "type": "confirm",
      "title": "Delete Account",
      "message": "This action cannot be undone. Type 'DELETE' to confirm.",
      "variant": "destructive",
      "requireInput": "DELETE",       // must type this string
      "confirmLabel": "Delete Forever",
      "cancelLabel": "Keep Account"
    },
    { "type": "api", "method": "DELETE", "endpoint": "/api/account" }
  ]
}
```

### Acceptance Criteria
- [ ] Global and component-scoped keyboard shortcuts work
- [ ] Generic drag-and-drop with reorder and cross-component drops
- [ ] Infinite scroll on data tables and lists
- [ ] Form field visibility and validation driven by other field values
- [ ] Debounce/throttle on input-driven actions
- [ ] Context menus from config
- [ ] Clipboard copy action
- [ ] Polling with tab-visibility pause
- [ ] Confirmation dialogs with typed confirmation

---

## 7. Phase E: State Machine

> **Goal:** Client-side computed values, derived state, URL sync, persistence — the app feels alive without round-tripping to the server.

### E1: Computed / Derived Values

```jsonc
{
  "state": {
    "totalItems": { "from": "cart.items", "transform": "count" },
    "subtotal": { "from": "cart.items", "transform": "sum", "field": "price" },
    "tax": { "compute": "{ subtotal } * 0.08" },
    "total": { "compute": "{ subtotal } + { tax }" },
    "isEmpty": { "compute": "{ totalItems } === 0" },
    "formattedTotal": { "compute": "{ total }", "format": "currency" }
  }
}
```

### E2: Expression Language

Anywhere a value is accepted, support expressions:

```jsonc
{
  "type": "text",
  "text": { "expr": "'Hello, ' + {global.user.firstName} + '!'" }
}
```

```jsonc
{
  "type": "badge",
  "variant": { "expr": "{item.amount} > 0 ? 'success' : 'destructive'" },
  "text": { "expr": "{item.amount} > 0 ? 'Income' : 'Expense'" }
}
```

**Supported operators:** `+`, `-`, `*`, `/`, `%`, `===`, `!==`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `!`, `? :` (ternary), string concatenation, template literals.

**Built-in functions:** `Math.abs()`, `Math.round()`, `Math.floor()`, `Math.ceil()`, `Math.min()`, `Math.max()`, `String.toLowerCase()`, `String.toUpperCase()`, `String.includes()`, `Array.length`, `Array.includes()`, `Date.now()`, `JSON.stringify()`.

**Security:** Expressions are parsed into an AST — never `eval()`. Only whitelisted operations allowed.

### E3: URL State Sync

```jsonc
{
  "type": "data-table",
  "id": "transactions",
  "urlSync": {
    "page": "page",           // ?page=2
    "sort": "sort",           // ?sort=date:desc
    "search": "q",            // ?q=groceries
    "filters": "f"            // ?f=status:pending,type:expense
  }
}
```

Browser back/forward updates the component state. Component state changes update the URL.

### E4: Persistent State

```jsonc
{
  "state": {
    "sidebarCollapsed": {
      "default": false,
      "persist": "localStorage"       // or "sessionStorage"
    },
    "recentSearches": {
      "default": [],
      "persist": "localStorage",
      "key": "budget-recent-searches"  // custom storage key
    }
  }
}
```

### E5: Client-Side Filtering & Sorting

For small datasets already loaded:

```jsonc
{
  "type": "list",
  "data": { "from": "all-categories.data" },
  "clientFilter": {
    "field": "name",
    "source": "search-input.value"      // filter by another component's value
  },
  "clientSort": {
    "field": "name",
    "direction": "asc"
  }
}
```

### E6: Conditional Action Chains

```jsonc
{
  "action": [
    { "type": "api", "method": "POST", "endpoint": "/api/order" },
    {
      "type": "branch",
      "condition": { "expr": "{result.requiresApproval}" },
      "then": [
        { "type": "navigate", "to": "/pending-approval/{result.id}" },
        { "type": "toast", "message": "Sent for approval", "variant": "info" }
      ],
      "else": [
        { "type": "navigate", "to": "/orders/{result.id}" },
        { "type": "toast", "message": "Order placed!", "variant": "success" }
      ]
    }
  ]
}
```

### E7: Repeat / Loop Actions

```jsonc
{
  "action": {
    "type": "for-each",
    "items": { "from": "table.selectedRows" },
    "action": {
      "type": "api",
      "method": "DELETE",
      "endpoint": "/api/items/{item.id}"
    },
    "onComplete": [
      { "type": "refresh", "target": "table" },
      { "type": "toast", "message": "Deleted {count} items" }
    ]
  }
}
```

### Acceptance Criteria
- [ ] Computed values with expression language (no eval)
- [ ] Expressions work in text, visibility, variant — anywhere a value is used
- [ ] URL state sync for tables and filters
- [ ] localStorage/sessionStorage persistence from config
- [ ] Client-side filter/sort without API calls
- [ ] Conditional branching in action chains
- [ ] Loop actions over selected items

---

## 8. Phase F: Real-Time

> **Goal:** WebSocket and SSE connections from config. Live dashboards, chat, presence, collaborative editing — all declarative.

### F1: WebSocket Connection

```jsonc
{
  "realtime": {
    "ws": {
      "url": { "env": "VITE_WS_URL", "default": "ws://localhost:2323/ws" },
      "auth": true,                   // send auth token on connect
      "reconnect": {
        "enabled": true,
        "maxAttempts": 10,
        "backoff": "exponential"      // "linear"|"exponential"
      },
      "heartbeat": {
        "interval": 30000,
        "message": { "type": "ping" }
      }
    }
  }
}
```

### F2: Event → Action Mapping

```jsonc
{
  "realtime": {
    "ws": {
      "url": "...",
      "events": {
        "transaction.created": {
          "actions": [
            { "type": "refresh", "target": "transactions-table" },
            { "type": "refresh", "target": "net-worth-stat" },
            { "type": "toast", "message": "New transaction: {event.description}", "variant": "info" }
          ]
        },
        "notification": {
          "actions": [
            { "type": "set-value", "target": "global.notifications", "merge": "prepend", "value": "{event}" },
            { "type": "toast", "message": "{event.title}" }
          ]
        },
        "user.typing": {
          "actions": [
            { "type": "set-value", "target": "typing-indicator", "field": "users", "value": "{event.users}" }
          ]
        }
      }
    }
  }
}
```

### F3: Send WebSocket Messages from Actions

New action type: `ws-send`

```jsonc
{
  "type": "button",
  "label": "Send",
  "action": {
    "type": "ws-send",
    "event": "message",
    "data": {
      "text": { "from": "message-input.value" },
      "channelId": { "from": "route.params.channelId" }
    }
  }
}
```

### F4: SSE (Server-Sent Events)

```jsonc
{
  "realtime": {
    "sse": {
      "url": "/api/events/stream",
      "events": {
        "price-update": {
          "actions": [
            { "type": "set-value", "target": "price-display", "field": "value", "value": "{event.price}" }
          ]
        }
      }
    }
  }
}
```

### F5: Presence Awareness

```jsonc
{
  "realtime": {
    "presence": {
      "enabled": true,
      "channel": "page:{route.path}",     // scoped per page
      "publishInterval": 10000            // heartbeat
    }
  }
}
```

```jsonc
{
  "type": "presence-indicator",
  "data": { "from": "global.presence.users" },
  "maxDisplay": 5,
  "showCount": true
}
```

### F6: Live Data Binding

Components auto-subscribe to real-time updates:

```jsonc
{
  "type": "stat-card",
  "data": "GET /api/metrics/revenue",
  "live": "revenue.updated",            // refresh when this WS event fires
  "animation": { "enter": "pulse" }     // animate on update
}
```

### Acceptance Criteria
- [ ] WebSocket connects from config with auth and reconnection
- [ ] WS events trigger action chains
- [ ] `ws-send` action sends messages
- [ ] SSE connections from config
- [ ] Presence channel with user list
- [ ] `live` prop on any data component for auto-refresh on WS event

---

## 9. Phase G: Navigation & Routing

> **Goal:** SPA-grade navigation with transitions, guards, preloading, breadcrumbs, and deep linking.

### G1: Route Transitions

```jsonc
{
  "routes": {
    "/dashboard": {
      "page": "dashboard",
      "transition": {
        "enter": "fade",               // "fade"|"slide-left"|"slide-right"|"slide-up"|"scale"|"none"
        "exit": "fade",
        "duration": "fast"
      }
    }
  }
}
```

Global default:
```jsonc
{
  "app": {
    "transitions": {
      "default": "fade",
      "duration": "fast"
    }
  }
}
```

### G2: Route Preloading

```jsonc
{
  "type": "link",
  "to": "/transactions",
  "preload": "hover",                  // "hover"|"visible"|"eager"|"none"
  "children": [{ "type": "text", "text": "View Transactions" }]
}
```

Nav items preload on hover by default.

### G3: Nested Layouts

```jsonc
{
  "routes": {
    "/settings": {
      "layout": "settings-layout",
      "children": {
        "/settings/profile": { "page": "settings-profile" },
        "/settings/billing": { "page": "settings-billing" },
        "/settings/team": { "page": "settings-team" }
      }
    }
  },
  "pages": {
    "settings-layout": {
      "content": [
        {
          "type": "row",
          "children": [
            {
              "type": "tabs",
              "variant": "vertical",
              "items": [
                { "label": "Profile", "to": "/settings/profile" },
                { "label": "Billing", "to": "/settings/billing" },
                { "label": "Team", "to": "/settings/team" }
              ],
              "span": 3
            },
            { "type": "outlet", "span": 9 }
          ]
        }
      ]
    }
  }
}
```

### G4: Breadcrumb Auto-Generation

```jsonc
{
  "app": {
    "breadcrumbs": {
      "auto": true,                     // generate from route hierarchy
      "home": { "label": "Home", "icon": "Home" },
      "separator": "chevron"            // "chevron"|"slash"|"dot"
    }
  }
}
```

Override per-route:
```jsonc
{
  "routes": {
    "/transactions/:id": {
      "breadcrumb": { "label": { "from": "transaction.description" } }
    }
  }
}
```

### G5: Deep Linking & Share URLs

All state that affects the view should be in the URL by default:
- Table page, sort, filters → query params
- Tab selection → query param
- Modal open state → query param (enables sharing "edit transaction" links)
- Accordion open state → fragment

```jsonc
{
  "type": "tabs",
  "urlSync": "tab",                   // ?tab=billing
  "items": [...]
}
```

### G6: Not Found & Error Routes

```jsonc
{
  "routes": {
    "*": { "page": "not-found" },
    "error": { "page": "error" }
  },
  "pages": {
    "not-found": {
      "content": [
        {
          "type": "default-not-found",
          "title": "Page not found",
          "description": "The page you're looking for doesn't exist.",
          "action": { "type": "navigate", "to": "/" },
          "actionLabel": "Go Home"
        }
      ]
    }
  }
}
```

### Acceptance Criteria
- [ ] Route transitions with configurable animations
- [ ] Link preloading on hover/visible
- [ ] Nested layouts with `<outlet>` component
- [ ] Auto-generated breadcrumbs from route hierarchy
- [ ] URL state sync for tabs, modals, table state
- [ ] Custom 404 and error pages from config

---

## 10. Phase H: Missing Components

> **Goal:** Full primitive coverage. Every UI pattern you'd find on Facebook, Discord, or Figma — available as a JSON component type.

### H1: Chart (Full Implementation)

```jsonc
{
  "type": "chart",
  "variant": "line",                  // "line"|"bar"|"area"|"pie"|"donut"|"scatter"|"radar"|"treemap"|"funnel"|"sparkline"
  "data": "GET /api/analytics/revenue",
  "xAxis": { "field": "date", "format": "MMM dd" },
  "yAxis": { "field": "amount", "format": "currency" },
  "series": [
    { "field": "revenue", "label": "Revenue", "color": "chart-1" },
    { "field": "expenses", "label": "Expenses", "color": "chart-2" }
  ],
  "legend": true,
  "tooltip": true,
  "responsive": true,
  "aspectRatio": "16/9"
}
```

**Sparkline variant** (inline mini-chart):
```jsonc
{
  "type": "chart",
  "variant": "sparkline",
  "data": { "from": "stat-card.trend" },
  "height": 40,
  "color": "primary"
}
```

### H2: Feed / Activity Stream

```jsonc
{
  "type": "feed",
  "data": "GET /api/activity",
  "pagination": { "type": "cursor", "infinite": true },
  "item": {
    "avatar": { "field": "user.avatar" },
    "title": { "expr": "{item.user.name} {item.action} {item.target}" },
    "description": { "field": "item.details" },
    "timestamp": { "field": "item.createdAt", "format": "relative" },
    "actions": [
      { "label": "Reply", "action": { "type": "open-modal", "modal": "reply" } }
    ]
  }
}
```

### H3: Wizard / Multi-Step Form

```jsonc
{
  "type": "wizard",
  "id": "onboarding",
  "steps": [
    {
      "title": "Account",
      "description": "Basic information",
      "icon": "User",
      "content": [
        { "type": "auto-form", "fields": [
          { "name": "name", "type": "text", "required": true },
          { "name": "email", "type": "email", "required": true }
        ]}
      ],
      "validate": { "required": ["name", "email"] }
    },
    {
      "title": "Preferences",
      "content": [...]
    },
    {
      "title": "Review",
      "content": [
        { "type": "detail-card", "data": { "from": "onboarding.formData" } }
      ]
    }
  ],
  "onComplete": {
    "type": "api",
    "method": "POST",
    "endpoint": "/api/onboarding",
    "body": { "from": "onboarding.formData" }
  }
}
```

### H4: Command Palette (Full)

```jsonc
{
  "type": "command-palette",
  "id": "command-palette",
  "shortcut": "ctrl+k",
  "groups": [
    {
      "label": "Navigation",
      "items": { "from": "global.nav.items" },
      "itemAction": { "type": "navigate", "to": "{item.path}" }
    },
    {
      "label": "Actions",
      "items": [
        { "label": "Create Transaction", "icon": "Plus", "shortcut": "ctrl+n", "action": { "type": "open-modal", "modal": "create-transaction" } },
        { "label": "Toggle Dark Mode", "icon": "Moon", "action": { "type": "set-theme", "toggle": true } }
      ]
    },
    {
      "label": "Search",
      "search": true,
      "endpoint": "GET /api/search?q={query}",
      "debounce": 200,
      "itemAction": { "type": "navigate", "to": "{item.url}" }
    }
  ]
}
```

### H5: Toast System (Enhanced)

```jsonc
{
  "theme": {
    "components": {
      "toast": {
        "position": "bottom-right",    // "top-right"|"top-left"|"bottom-right"|"bottom-left"|"top-center"|"bottom-center"
        "maxVisible": 5,
        "duration": 5000,
        "animation": "slide-right"
      }
    }
  }
}
```

Toast with undo:
```jsonc
{
  "action": [
    { "type": "api", "method": "DELETE", "endpoint": "/api/item/{id}" },
    {
      "type": "toast",
      "message": "Item deleted",
      "variant": "success",
      "undo": {
        "type": "api",
        "method": "POST",
        "endpoint": "/api/item/{id}/restore"
      },
      "duration": 8000
    }
  ]
}
```

### H6: Notification Center

```jsonc
{
  "type": "notification-bell",
  "data": "GET /api/notifications/unread",
  "live": "notification.new",
  "panel": {
    "type": "drawer",
    "position": "right",
    "width": "400px",
    "content": [
      {
        "type": "notification-feed",
        "data": "GET /api/notifications",
        "markReadOnView": true,
        "markReadEndpoint": "PATCH /api/notifications/{id}/read",
        "groupBy": "date",
        "item": {
          "avatar": { "field": "sender.avatar" },
          "title": { "field": "title" },
          "description": { "field": "body" },
          "timestamp": { "field": "createdAt", "format": "relative" },
          "action": { "type": "navigate", "to": "{item.actionUrl}" }
        }
      }
    ]
  }
}
```

### H7: Color Picker

```jsonc
{
  "type": "color-picker",
  "id": "category-color",
  "format": "hex",                    // "hex"|"rgb"|"hsl"|"oklch"
  "swatches": ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"],
  "allowCustom": true
}
```

### H8: Date/Time Picker

```jsonc
{
  "type": "date-picker",
  "mode": "range",                    // "single"|"range"|"multiple"
  "format": "yyyy-MM-dd",
  "minDate": "today",
  "maxDate": { "expr": "today + 365" },
  "presets": [
    { "label": "Last 7 days", "value": "-7d" },
    { "label": "Last 30 days", "value": "-30d" },
    { "label": "This month", "value": "thisMonth" },
    { "label": "This year", "value": "thisYear" }
  ]
}
```

### H9: Slider / Range Input

```jsonc
{
  "type": "slider",
  "min": 0,
  "max": 1000,
  "step": 10,
  "format": "currency",
  "showValue": true,
  "range": true                       // dual-thumb for min/max
}
```

### H10: Skeleton Loading States (Automatic)

Components should automatically show skeleton states while loading:

```jsonc
{
  "type": "data-table",
  "data": "GET /api/transactions",
  "loading": {
    "variant": "skeleton",            // "skeleton"|"spinner"|"blur"
    "rows": 10                        // skeleton row count
  }
}
```

**Default behavior:** All data-bound components show skeleton automatically. No config needed.

### H11: Empty States (Automatic)

```jsonc
{
  "type": "data-table",
  "data": "GET /api/transactions",
  "empty": {
    "icon": "FileText",
    "title": "No transactions yet",
    "description": "Add your first transaction to get started.",
    "action": { "label": "Add Transaction", "action": { "type": "open-modal", "modal": "create" } }
  }
}
```

### Acceptance Criteria
- [ ] Chart with 10+ variants and sparkline mode
- [ ] Feed with infinite scroll, relative timestamps, actions
- [ ] Multi-step wizard with validation per step
- [ ] Command palette with search, shortcuts, grouped items
- [ ] Toast with undo support
- [ ] Notification center with live updates
- [ ] Date picker with range mode and presets
- [ ] Automatic skeleton loading on all data components
- [ ] Automatic empty states with CTA

---

## 11. Phase I: Page Presets

> **Goal:** Common page patterns as one-line declarations. CRUD, Dashboard, Settings — without spelling out every component.

### I1: CrudPage Preset

```jsonc
{
  "pages": {
    "/transactions": {
      "preset": "crud",
      "resource": "transactions",
      "endpoint": "/api/transactions",
      "title": "Transactions",
      "columns": [
        { "field": "date", "format": "date", "sortable": true },
        { "field": "description", "sortable": true },
        { "field": "amount", "format": "currency", "align": "right" },
        { "field": "category.name", "label": "Category" }
      ],
      "form": {
        "fields": [
          { "name": "date", "type": "date", "required": true },
          { "name": "description", "type": "text", "required": true },
          { "name": "amount", "type": "number", "required": true },
          { "name": "categoryId", "type": "select", "options": "GET /api/categories" }
        ]
      },
      "searchable": true,
      "deletable": true,
      "exportable": true
    }
  }
}
```

**Expands to:** heading + filter bar + data table + create button + create modal + edit modal + delete confirmation + empty state + pagination. All wired together.

### I2: DashboardPage Preset

```jsonc
{
  "pages": {
    "/": {
      "preset": "dashboard",
      "title": "Dashboard",
      "stats": [
        { "label": "Revenue", "endpoint": "/api/stats/revenue", "format": "currency", "icon": "DollarSign" },
        { "label": "Users", "endpoint": "/api/stats/users", "format": "number", "icon": "Users" },
        { "label": "Orders", "endpoint": "/api/stats/orders", "format": "number", "icon": "ShoppingCart" }
      ],
      "charts": [
        { "title": "Revenue Over Time", "variant": "area", "endpoint": "/api/charts/revenue" },
        { "title": "Users by Region", "variant": "pie", "endpoint": "/api/charts/users-region" }
      ],
      "recentActivity": {
        "endpoint": "/api/activity",
        "limit": 10
      }
    }
  }
}
```

### I3: SettingsPage Preset

```jsonc
{
  "pages": {
    "/settings": {
      "preset": "settings",
      "title": "Settings",
      "sections": [
        {
          "title": "Profile",
          "icon": "User",
          "endpoint": "GET /api/me",
          "submit": "PATCH /api/me",
          "fields": [
            { "name": "name", "type": "text" },
            { "name": "email", "type": "email" },
            { "name": "avatar", "type": "file-upload", "accept": "image/*" }
          ]
        },
        {
          "title": "Notifications",
          "icon": "Bell",
          "fields": [
            { "name": "emailNotifications", "type": "switch", "label": "Email notifications" },
            { "name": "pushNotifications", "type": "switch", "label": "Push notifications" }
          ]
        }
      ]
    }
  }
}
```

### I4: AuthPage Preset

Already partially implemented. Formalize:

```jsonc
{
  "auth": {
    "screens": ["login", "register", "forgot-password", "reset-password", "verify-email"],
    "providers": ["google", "github"],
    "branding": {
      "logo": "/logo.svg",
      "background": { "gradient": { "type": "linear", "stops": [...] } },
      "tagline": "Manage your finances"
    }
  }
}
```

### Acceptance Criteria
- [ ] CrudPage preset generates full CRUD interface from resource + columns + form
- [ ] DashboardPage preset generates stat cards + charts + activity feed
- [ ] SettingsPage preset generates tabbed/sectioned form pages
- [ ] Presets are fully overridable — any generated component can be customized

---

## 12. Phase J: Accessibility & Polish

> **Goal:** WCAG 2.1 AA compliance from config. Focus management, ARIA, reduced motion, screen reader support.

### J1: Focus Management

```jsonc
{
  "type": "modal",
  "focus": {
    "trap": true,                     // focus stays inside modal
    "initialFocus": "name-input",     // focus this component on open
    "returnFocus": true               // return focus to trigger on close
  }
}
```

### J2: Skip Links

```jsonc
{
  "app": {
    "a11y": {
      "skipLinks": [
        { "label": "Skip to main content", "target": "main-content" },
        { "label": "Skip to navigation", "target": "nav" }
      ]
    }
  }
}
```

### J3: ARIA Labels from Config

```jsonc
{
  "type": "button",
  "icon": "Trash",
  "ariaLabel": "Delete transaction",
  "variant": "ghost"
}
```

Every interactive component supports `ariaLabel`, `ariaDescribedBy`, `role`.

### J4: Reduced Motion

```jsonc
{
  "app": {
    "a11y": {
      "respectReducedMotion": true    // default: true
    }
  }
}
```

When `prefers-reduced-motion: reduce` is active, all animations are disabled or replaced with simple fades.

### J5: Color Contrast Enforcement

The token resolution system should validate that foreground/background pairs meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text). Warn in dev mode if they don't.

### J6: Live Regions for Dynamic Content

```jsonc
{
  "type": "toast",
  "ariaLive": "polite"               // screen readers announce toast content
}
```

```jsonc
{
  "type": "stat-card",
  "ariaLive": "polite",             // announce value changes
  "live": "revenue.updated"
}
```

### Acceptance Criteria
- [ ] Focus trapping in modals and drawers
- [ ] Skip links from config
- [ ] ARIA labels on all interactive components
- [ ] Reduced motion respected by default
- [ ] Contrast ratio warnings in dev mode
- [ ] Live regions for dynamic content

---

## 13. Phase K: Performance

> **Goal:** 60fps interactions, instant page loads, efficient rendering at scale.

### K1: Virtual Lists

```jsonc
{
  "type": "list",
  "data": "GET /api/messages",
  "virtualize": true,               // only render visible items
  "itemHeight": 72,                  // fixed height for calculation (or "auto" with ResizeObserver)
  "overscan": 5                      // render N items beyond viewport
}
```

### K2: Code Splitting by Route

The Vite plugin should automatically code-split:
- Each page's component tree is a lazy chunk
- Component implementations loaded on first use
- Preload triggered by link hover (`preload: "hover"`)

### K3: Image Optimization

```jsonc
{
  "type": "image",
  "src": "/photos/hero.jpg",
  "loading": "lazy",                 // "lazy"|"eager"
  "sizes": "(max-width: 768px) 100vw, 50vw",
  "placeholder": "blur",            // "blur"|"skeleton"|"none"
  "blurDataUrl": "data:image/..."
}
```

### K4: Resource Prefetching

```jsonc
{
  "routes": {
    "/dashboard": {
      "prefetch": ["GET /api/stats", "GET /api/recent-activity"],
      "page": "dashboard"
    }
  }
}
```

Start API calls before the page renders.

### K5: Suspense Boundaries

```jsonc
{
  "type": "stack",
  "suspense": {
    "fallback": { "type": "skeleton", "variant": "card", "count": 3 }
  },
  "children": [
    { "type": "stat-card", "data": "GET /api/slow-query" }
  ]
}
```

### Acceptance Criteria
- [ ] Virtual lists for 10k+ items
- [ ] Automatic code splitting by route
- [ ] Lazy image loading with blur placeholder
- [ ] Resource prefetching on route config
- [ ] Suspense boundaries from config

---

## 14. Phase L: Developer Experience

> **Goal:** Building a Snapshot app feels magical — instant feedback, great errors, zero boilerplate.

### L1: Manifest Hot Reload

Editing `snapshot.manifest.json` hot-reloads the app without full page refresh. The Vite plugin watches the manifest file and sends HMR updates.

### L2: Manifest Validation Errors

On invalid manifest, show an overlay in the browser with:
- Which field is invalid
- What the expected type/value is
- A link to the docs for that field

### L3: Component Inspector (Dev Mode)

In development, clicking a component while holding `Alt` shows:
- Component type and config
- Current data/state
- Which `from` refs it subscribes to
- Which `id` it publishes
- Which actions are attached

### L4: CLI Scaffolding

```bash
snapshot init my-app          # create new app with manifest, vite config, package.json
snapshot add-page dashboard   # add a dashboard page preset to manifest
snapshot add-resource users   # add a resource definition
snapshot validate             # validate manifest against schema
snapshot preview              # open browser with live preview
```

### L5: JSON Schema for IDE Autocomplete

Publish a JSON Schema for `snapshot.manifest.json` that provides:
- Autocomplete for all fields
- Inline documentation
- Error highlighting for invalid values
- Available component types
- Available action types

```jsonc
// snapshot.manifest.json
{
  "$schema": "https://unpkg.com/@lastshotlabs/snapshot/manifest-schema.json",
  // ... full autocomplete and validation
}
```

### Acceptance Criteria
- [ ] Manifest changes hot-reload
- [ ] Validation errors shown as browser overlay
- [ ] Component inspector in dev mode
- [ ] CLI for scaffolding
- [ ] JSON Schema published for IDE autocomplete

---

## 15. Dependency Graph & Execution Order

```
Phase A: CSS Foundation ─────────────────────────────────┐
  ├── A1: CSS Reset                                      │
  ├── A2: Component Stylesheet                           │
  ├── A3: Wire Token Vars                                │
  ├── A4: Dark Mode Management                           │
  ├── A5: Tailwind Bridge                                │
  └── A6: Font Loading                                   │
                                                         │
Phase B: Layout (depends on A) ──────────────────────────┤
  ├── B1: CSS Grid Named Areas                           │
  ├── B2: Container Component                            │
  ├── B3: Hero / Full-Bleed Sections                     │
  ├── B4: Sticky Positioning                             │
  ├── B5: Aspect Ratio                                   │
  ├── B6: Responsive Visibility                          │
  └── B7-B8: Overflow, Z-Index                           │
                                                         │
main.tsx Elimination (depends on A5) ────────────────────┤
  └── Vite Plugin Auto-Entry                             │
                                                         │
Phase C: Styling (depends on A5) ────────────────────────┤
  ├── C1: className/Tailwind                             │
  ├── C2: Inline Styles                                  │
  ├── C3: Animations                                     │
  └── C4-C8: Hover, Gradients, Glass, Scrollbar          │
                                                         │
Phase D: Interactivity (independent) ────────────────────┤
  ├── D1: Keyboard Shortcuts                             │
  ├── D2: Drag and Drop                                  │
  ├── D3: Scroll Behaviors                               │
  ├── D4: Form Dependencies                              │
  ├── D5: Validation Rules                               │
  └── D6-D10: Debounce, Context Menu, Clipboard, etc.   │
                                                         │
Phase E: State Machine (independent) ────────────────────┤
  ├── E1: Computed Values                                │
  ├── E2: Expression Language ◄── used by B, C, D, F, G │
  ├── E3: URL State Sync                                 │
  ├── E4: Persistent State                               │
  └── E5-E7: Client Filter, Branching, Loops             │
                                                         │
Phase F: Real-Time (depends on D for actions) ───────────┤
  ├── F1: WebSocket Connection                           │
  ├── F2: Event → Action Mapping                         │
  ├── F3: WS Send Action                                 │
  ├── F4: SSE                                            │
  └── F5-F6: Presence, Live Binding                      │
                                                         │
Phase G: Navigation (depends on A, C3) ──────────────────┤
  ├── G1: Route Transitions                              │
  ├── G2: Preloading                                     │
  ├── G3: Nested Layouts                                 │
  └── G4-G6: Breadcrumbs, Deep Links, Error Routes       │
                                                         │
Phase H: Components (depends on A, E2) ──────────────────┤
  ├── H1: Chart                                          │
  ├── H2: Feed                                           │
  ├── H3: Wizard                                         │
  ├── H4: Command Palette                                │
  └── H5-H11: Toast, Notifications, Date Picker, etc.   │
                                                         │
Phase I: Page Presets (depends on H) ────────────────────┤
  ├── I1: CrudPage                                       │
  ├── I2: DashboardPage                                  │
  ├── I3: SettingsPage                                   │
  └── I4: AuthPage                                       │
                                                         │
Phase J: Accessibility (depends on A) ───────────────────┤
Phase K: Performance (depends on A, B) ──────────────────┤
Phase L: Developer Experience (depends on main.tsx) ─────┘
```

### Recommended Execution Order

| Priority | Phase | Why |
|----------|-------|-----|
| **P0** | **A: CSS Foundation** | Budget-fe goes from 1999 → 2026 immediately |
| **P0** | **main.tsx Elimination** | Delivers on "one JSON file" promise |
| **P1** | **E2: Expression Language** | Unlocks conditional rendering, computed values — used by everything |
| **P1** | **B: Layout** | Hero sections, grids, sticky — visual sophistication |
| **P1** | **C: Styling** | Animations, gradients, glass — visual polish |
| **P2** | **D: Interactivity** | Keyboard shortcuts, DnD, form logic — Discord-level UX |
| **P2** | **H: Components** | Chart, Feed, Wizard — fill primitive gaps |
| **P2** | **G: Navigation** | Route transitions, preloading — SPA feel |
| **P3** | **F: Real-Time** | WebSockets, presence — live apps |
| **P3** | **E (rest): State** | URL sync, persistence, computed values |
| **P3** | **I: Presets** | Developer velocity shortcuts |
| **P4** | **J: Accessibility** | Compliance and polish |
| **P4** | **K: Performance** | Virtualization, code splitting |
| **P4** | **L: Developer Experience** | Hot reload, inspector, CLI |

---

## Success Metric

When this spec is fully implemented, the following test must pass:

> **Test:** A developer creates a new directory with `package.json`, `vite.config.ts`, and `snapshot.manifest.json`. They run `npm install && npm run dev`. The result is a production-quality app with:
> - Sophisticated visual design (custom theme, proper typography, shadows, gradients)
> - Rich interactivity (keyboard shortcuts, drag-and-drop, real-time updates)
> - Full CRUD with modals, forms, validation, and optimistic updates
> - Responsive layout that works on mobile and desktop
> - Dark mode toggle
> - Authentication flow
> - No TypeScript files. No CSS files. Just JSON.

That's the dream. One JSON file. Facebook-level UI.
