# Declarative Composability — Foundational Spec

> **Status**
>
> | Phase | Title                                                                           | Status      | Track               |
> | ----- | ------------------------------------------------------------------------------- | ----------- | ------------------- |
> | 1     | Universal Style Props (hover/focus/active, responsive, token-aware)             | Not started | Schema + Wrapper    |
> | 2     | Missing Primitives (box, collapsible, icon-button, hover-card, toggle-group)    | Not started | Components          |
> | 3     | Composable Navigation (template system, 6 nav sub-components)                   | Not started | Components + Schema |
> | 4     | Nested Layouts & Outlets (parent route persistence)                             | Not started | Router + App Shell  |
> | 5     | Layout as Component Composition (slot overrides, nav slot)                      | Not started | Layout + Schema     |
> | 6     | Discriminated Union Schema (per-component intellisense)                         | Not started | Schema Gen          |
> | 7     | Component Groups (reusable named bundles)                                       | Not started | Schema + Runtime    |
> | 8     | CSS Baseline & Animation Wiring (reset, keyframes, exit animations, visibility) | Not started | Tokens + Wrapper    |
> | 9     | Consumer Extension API (plugins, custom components, schema gen)                 | Not started | Core + Schema Gen   |
>
> **Priority:** P0 — foundational. Everything else builds on this.
> **Depends on:** Nothing. This IS the foundation.

---

## Vision

### Before

Snapshot's manifest drives pages well but the shell is opinionated and closed. The nav is a
black box. Layouts are fixed variants. Styling uses raw CSS escape hatches. Children routes
don't render inside parent layouts. Components with children infer behavior (dropdown vs
inline) instead of letting the developer declare it. Building a differentiated app means
fighting the framework's opinions.

### After

**Everything is a component. Components compose into anything.**

- The nav bar is not a special system — it's a slot in the layout filled with components:
  `nav-logo`, `nav-link`, `nav-dropdown`, `nav-section`, `nav-search`, `nav-user-menu`,
  `spacer`, `divider`, or ANY other component. You declare what goes there, in what order,
  with what style.

- Layouts are not fixed variants — they're slot containers. You fill `header`, `sidebar`,
  `main`, `footer` with component arrays. The "sidebar" and "top-nav" variants are just
  presets for common slot arrangements. You can override any slot on any route.

- Nested routes work: a parent route's layout persists, child route content fills the
  parent's `main` slot. Multi-level nesting is unlimited.

- Every component — from `button` to `data-table` to `nav-link` — accepts the same
  token-aware style props: `padding`, `margin`, `gap`, `background`, `borderRadius`,
  `shadow`, `opacity`, `width`, `height`, `minHeight`, `maxWidth`. No escape hatches
  needed for common patterns.

- No behavior is inferred. Nav items with children don't auto-become dropdowns.
  You declare `nav-dropdown` if you want a dropdown, `nav-section` if you want an
  expandable group, or `nav-link` if you want a plain link.

- Component groups ("prepackaged screens") are reusable named bundles of components
  that expand inline. Define a `component-group` once, reference it by name anywhere.

- JSON Schema intellisense shows component-specific properties based on `type`.
  Pick `"type": "data-table"` and VSCode shows `columns`, `data`, `searchable`.
  Pick `"type": "button"` and VSCode shows `label`, `variant`, `action`.

---

## What Already Exists on Main

### Fully Implemented (Audited)

| System             | Files                                     | State                                                                        |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| Component Registry | `register.ts` (764 lines)                 | 76 components registered                                                     |
| Base Schema        | `_base/schema.ts` (138 lines)             | `animation`, `glass`, `background`, `transition`, `sticky`, `zIndex` defined |
| ComponentWrapper   | `_base/component-wrapper.tsx` (418 lines) | Applies animation, glass, background, transition, sticky, zIndex, tokens     |
| Layout Component   | `layout/layout/component.tsx` (492 lines) | 5 variants: sidebar, top-nav, stacked, minimal, full-width                   |
| Nav Component      | `layout/nav/component.tsx` (~490 lines)   | Monolithic: logo + items + user menu hardcoded                               |
| Action Executor    | `actions/executor.ts` (1,178 lines)       | 21 action types, debounce/throttle, chaining                                 |
| State System       | `context/` + `state/`                     | Two-tier Jotai registries, FromRef binding, 18+ transforms                   |
| Token System       | `tokens/resolve.ts` (1,443 lines)         | Full OKLCH color science, 8 flavors, all token categories                    |
| Expression Engine  | `expressions/parser.ts`                   | Full parser with precedence, safe builtins, template interpolation           |
| Workflows          | `workflows/engine.ts`                     | 7 node types: if, wait, parallel, retry, try, assign, capture                |
| Router             | `manifest/router.ts`                      | Path matching, parent chain, active route resolution                         |
| Compiler           | `manifest/compiler.ts`                    | Route flattening, parentId assignment, preset expansion                      |
| Presets            | `presets/` (8 files)                      | CRUD, dashboard, settings, auth page factories                               |
| Resources          | `manifest/resources.ts`                   | Endpoint resolution, caching, polling, optimistic updates                    |
| Overlays           | `overlay/modal/`, `overlay/drawer/`       | Focus trap, URL sync, lifecycle hooks                                        |
| Shortcuts          | `shortcuts/`                              | Chord parsing, modifier keys, typing context awareness                       |
| Drag & Drop        | `_base/drag-drop-provider.tsx`            | Shared context, cross-container, drop rules                                  |
| Hooks              | `hooks/`                                  | Breakpoint, infinite scroll, polling, virtual list                           |

### Partially Implemented

| System              | Gap                                                                        |
| ------------------- | -------------------------------------------------------------------------- |
| Nested Layouts      | `match.parents` computed but AppShell renders only root ancestor's page    |
| Nav Composability   | Nav is monolithic; no template system                                      |
| Style Props         | `style` escape hatch exists but no token-aware declarative props           |
| CSS Baseline        | Keyframes defined in resolve.ts but not all wired through framework styles |
| Schema Intellisense | Icon/type enums injected; component-specific schemas not discriminated     |

### Not Started

| System                            | Notes                                                                 |
| --------------------------------- | --------------------------------------------------------------------- |
| Component Groups                  | No manifest-level named component bundles                             |
| Layout slot overrides from routes | Schema has `slots` field but rendering doesn't compose parent + child |
| Universal token-aware style props | Components use raw `style` record, not semantic props                 |

---

## Non-Negotiable Engineering Constraints

From `docs/engineering-rules.md`:

1. **Manifest-First** — If it requires TypeScript to activate, it's incomplete.
2. **One Code Path** — No second way to do the same thing.
3. **No Escape Hatches** — If something needs special treatment, the framework is incomplete.
4. **Registries, Not Switches** — New types = `register*()`, not editing framework internals.
5. **Config Schema Is the Only Interface** — Single `config` prop, no React props.
6. **Semantic Tokens Only** — `var(--sn-spacing-md)` not `1rem`.
7. **Consumer Apps Have No Source Code** — `manifest.json` + `index.html` + `vite.config.ts`.
8. **Dogfooding Drives Completeness** — If bespoke code is needed, the framework is incomplete.

---

## SSR / SSG Cross-Cutting Requirements

Every phase in this spec must satisfy these server-rendering constraints. These are not
optional — they are structural requirements that apply to every new file, component, and
runtime behavior.

### Rules

1. **Every component file starts with `'use client'`** — React Server Components are not
   used. All Snapshot components are client components that hydrate on the browser.
2. **No browser APIs during initial render** — `window`, `document`, `navigator`,
   `localStorage`, `matchMedia`, `IntersectionObserver`, `ResizeObserver`, and any other
   browser-only global must NOT be called in the component body or during the first render
   pass. They may only appear inside `useEffect`, `useLayoutEffect`, event handlers, or
   behind a `typeof window !== "undefined"` guard.
3. **All config props are JSON-serializable** — Manifest configs are plain objects. No
   functions, symbols, or class instances in the schema. `FromRef` bindings resolve at
   runtime on the client, not during SSR.
4. **Scoped `<style>` injection must be idempotent** — The `resolveInteractiveCSS()` and
   `resolveResponsiveCSS()` functions generate CSS strings. On SSR, these must be
   collectable into a `<style>` tag in the `<head>`. On the client, they inject via
   `document.head.appendChild` inside `useEffect`. The generated CSS is deterministic
   (same input = same output) so SSR and client produce identical markup.
5. **No layout shift on hydration** — Style props resolve to inline styles or CSS custom
   properties. The server render and client hydration must produce identical DOM. Avoid
   `useState` for style values that are known at render time.
6. **Collapsible, hover-card, popover: SSR-safe defaults** — Components with show/hide
   behavior render in their default state on the server (collapsed, hidden). The browser
   hydrates and attaches event handlers. No content flash.
7. **Animation: CSS-only where possible** — Keyframe animations use CSS `@keyframes` +
   `animation` property. `ComponentWrapper` sets `animation` via inline style at render
   time. No JS animation libraries. Stagger delays computed at render time and set as
   inline `animation-delay`.
8. **`resolveStyleProps()` is pure** — Takes a config object, returns `React.CSSProperties`.
   No side effects, no hooks, no DOM access. Safe to call on server or client.
9. **`resolveTokens()` and `resolveFrameworkStyles()` are pure** — Return CSS strings.
   Called once at app init. On SSR, output goes into `<style>` in `<head>`. On client,
   injected via `injectStyleSheet`.

### How to Verify

Every phase's exit criteria includes: "Component renders identically on server and client
(no hydration mismatch warnings in console)." Test by:

1. `bun run build` (produces SSR-ready bundle)
2. Render the manifest app server-side and compare HTML output to client hydration
3. Browser console shows zero hydration mismatch warnings

---

## Phase 1: Universal Style Props

### Goal

Every component accepts token-aware style props that resolve to CSS custom properties.
No more writing `"style": { "padding": "var(--sn-spacing-md, 1rem)" }` — instead write
`"padding": "md"`.

### Schema

Add to `baseComponentConfigSchema` in `src/ui/components/_base/schema.ts`:

```typescript
// ── Token-Aware Style Props ─────────────────────────────────────────
// These resolve against the design token system. String enums map to
// --sn-* vars. Raw CSS values pass through for edge cases.

const spacingEnum = z.enum(["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);
const radiusEnum = z.enum(["none", "xs", "sm", "md", "lg", "xl", "full"]);
const shadowEnum = z.enum(["none", "xs", "sm", "md", "lg", "xl"]);
const colorRef = z.string(); // token name ("primary", "muted") or raw CSS value

// Added to baseComponentConfigSchema:
padding: z.union([spacingEnum, z.string()]).optional(),
paddingX: z.union([spacingEnum, z.string()]).optional(),
paddingY: z.union([spacingEnum, z.string()]).optional(),
margin: z.union([spacingEnum, z.string()]).optional(),
marginX: z.union([spacingEnum, z.string()]).optional(),
marginY: z.union([spacingEnum, z.string()]).optional(),
gap: z.union([spacingEnum, z.string()]).optional(),
width: z.string().optional(),
minWidth: z.string().optional(),
maxWidth: z.string().optional(),
height: z.string().optional(),
minHeight: z.string().optional(),
maxHeight: z.string().optional(),
bg: z.union([colorRef, backgroundConfigSchema]).optional(),
color: colorRef.optional(),
borderRadius: z.union([radiusEnum, z.string()]).optional(),
border: z.string().optional(),
shadow: z.union([shadowEnum, z.string()]).optional(),
opacity: z.number().min(0).max(1).optional(),
overflow: z.enum(["auto", "hidden", "scroll", "visible"]).optional(),
cursor: z.string().optional(),
position: z.enum(["relative", "absolute", "fixed", "sticky"]).optional(),
inset: z.string().optional(),
display: z.enum(["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]).optional(),
flexDirection: z.enum(["row", "column", "row-reverse", "column-reverse"]).optional(),
alignItems: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
justifyContent: z.enum(["start", "center", "end", "between", "around", "evenly"]).optional(),
flexWrap: z.enum(["wrap", "nowrap", "wrap-reverse"]).optional(),
flex: z.string().optional(),
gridTemplateColumns: z.string().optional(),
gridTemplateRows: z.string().optional(),
gridColumn: z.string().optional(),
gridRow: z.string().optional(),
textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
fontSize: z.union([z.enum(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]), z.string()]).optional(),
fontWeight: z.union([z.enum(["light", "normal", "medium", "semibold", "bold"]), z.number()]).optional(),
lineHeight: z.union([z.enum(["none", "tight", "snug", "normal", "relaxed", "loose"]), z.string()]).optional(),
letterSpacing: z.union([z.enum(["tight", "normal", "wide"]), z.string()]).optional(),
```

### Token Resolution

In `ComponentWrapper`, resolve token enum values to CSS vars:

```typescript
// src/ui/components/_base/style-props.ts (NEW FILE)

const SPACING_MAP: Record<string, string> = {
  none: "0",
  "2xs": "var(--sn-spacing-2xs, 0.125rem)",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 0.75rem)",
  lg: "var(--sn-spacing-lg, 1rem)",
  xl: "var(--sn-spacing-xl, 1.5rem)",
  "2xl": "var(--sn-spacing-2xl, 2rem)",
  "3xl": "var(--sn-spacing-3xl, 3rem)",
};

const RADIUS_MAP: Record<string, string> = {
  none: "0",
  xs: "var(--sn-radius-xs)",
  sm: "var(--sn-radius-sm)",
  md: "var(--sn-radius-md)",
  lg: "var(--sn-radius-lg)",
  xl: "var(--sn-radius-xl)",
  full: "var(--sn-radius-full)",
};

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  xs: "var(--sn-shadow-xs)",
  sm: "var(--sn-shadow-sm)",
  md: "var(--sn-shadow-md)",
  lg: "var(--sn-shadow-lg)",
  xl: "var(--sn-shadow-xl)",
};

const FONT_SIZE_MAP: Record<string, string> = {
  xs: "var(--sn-font-size-xs)",
  sm: "var(--sn-font-size-sm)",
  base: "var(--sn-font-size-base)",
  lg: "var(--sn-font-size-lg)",
  xl: "var(--sn-font-size-xl)",
  "2xl": "var(--sn-font-size-2xl)",
  "3xl": "var(--sn-font-size-3xl)",
  "4xl": "var(--sn-font-size-4xl)",
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  light: "var(--sn-font-weight-light)",
  normal: "var(--sn-font-weight-normal)",
  medium: "var(--sn-font-weight-medium)",
  semibold: "var(--sn-font-weight-semibold)",
  bold: "var(--sn-font-weight-bold)",
};

const COLOR_MAP: Record<string, string> = {
  primary: "var(--sn-color-primary)",
  secondary: "var(--sn-color-secondary)",
  accent: "var(--sn-color-accent)",
  muted: "var(--sn-color-muted)",
  destructive: "var(--sn-color-destructive)",
  success: "var(--sn-color-success)",
  warning: "var(--sn-color-warning)",
  info: "var(--sn-color-info)",
  background: "var(--sn-color-background)",
  foreground: "var(--sn-color-foreground)",
  card: "var(--sn-color-card)",
  popover: "var(--sn-color-popover)",
  border: "var(--sn-color-border)",
  input: "var(--sn-color-input)",
  // Foreground companions
  "primary-foreground": "var(--sn-color-primary-foreground)",
  "secondary-foreground": "var(--sn-color-secondary-foreground)",
  "muted-foreground": "var(--sn-color-muted-foreground)",
  "accent-foreground": "var(--sn-color-accent-foreground)",
  "destructive-foreground": "var(--sn-color-destructive-foreground)",
  "card-foreground": "var(--sn-color-card-foreground)",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

export function resolveStyleProps(
  config: Record<string, unknown>,
): React.CSSProperties {
  const s: React.CSSProperties = {};
  const resolve = (
    value: unknown,
    map: Record<string, string>,
  ): string | undefined => {
    if (value == null) return undefined;
    const v = String(value);
    return map[v] ?? v; // token name → CSS var, or passthrough raw value
  };

  if (config.padding != null) {
    s.padding = resolve(config.padding, SPACING_MAP);
  }
  if (config.paddingX != null) {
    const v = resolve(config.paddingX, SPACING_MAP);
    s.paddingLeft = v;
    s.paddingRight = v;
  }
  if (config.paddingY != null) {
    const v = resolve(config.paddingY, SPACING_MAP);
    s.paddingTop = v;
    s.paddingBottom = v;
  }
  if (config.margin != null) {
    s.margin = resolve(config.margin, SPACING_MAP);
  }
  if (config.marginX != null) {
    const v = resolve(config.marginX, SPACING_MAP);
    s.marginLeft = v;
    s.marginRight = v;
  }
  if (config.marginY != null) {
    const v = resolve(config.marginY, SPACING_MAP);
    s.marginTop = v;
    s.marginBottom = v;
  }
  if (config.gap != null) {
    s.gap = resolve(config.gap, SPACING_MAP);
  }
  if (config.width != null) {
    s.width = config.width as string;
  }
  if (config.minWidth != null) {
    s.minWidth = config.minWidth as string;
  }
  if (config.maxWidth != null) {
    s.maxWidth = config.maxWidth as string;
  }
  if (config.height != null) {
    s.height = config.height as string;
  }
  if (config.minHeight != null) {
    s.minHeight = config.minHeight as string;
  }
  if (config.maxHeight != null) {
    s.maxHeight = config.maxHeight as string;
  }
  if (config.bg != null) {
    const bg = config.bg;
    if (typeof bg === "string") {
      s.background = COLOR_MAP[bg] ?? bg;
    }
    // Object backgrounds (gradient, image) handled by existing resolveBackgroundStyle
  }
  if (config.color != null) {
    s.color = resolve(config.color, COLOR_MAP);
  }
  if (config.borderRadius != null) {
    s.borderRadius = resolve(config.borderRadius, RADIUS_MAP);
  }
  if (config.border != null) {
    s.border = config.border as string;
  }
  if (config.shadow != null) {
    s.boxShadow = resolve(config.shadow, SHADOW_MAP);
  }
  if (config.opacity != null) {
    s.opacity = config.opacity as number;
  }
  if (config.overflow != null) {
    s.overflow = config.overflow as string;
  }
  if (config.cursor != null) {
    s.cursor = config.cursor as string;
  }
  if (config.position != null) {
    s.position = config.position as React.CSSProperties["position"];
  }
  if (config.inset != null) {
    s.inset = config.inset as string;
  }
  if (config.display != null) {
    s.display = config.display as string;
  }
  if (config.flexDirection != null) {
    s.flexDirection =
      config.flexDirection as React.CSSProperties["flexDirection"];
  }
  if (config.alignItems != null) {
    s.alignItems = resolve(config.alignItems, ALIGN_MAP);
  }
  if (config.justifyContent != null) {
    s.justifyContent = resolve(config.justifyContent, JUSTIFY_MAP);
  }
  if (config.flexWrap != null) {
    s.flexWrap = config.flexWrap as React.CSSProperties["flexWrap"];
  }
  if (config.flex != null) {
    s.flex = config.flex as string;
  }
  if (config.gridTemplateColumns != null) {
    s.gridTemplateColumns = config.gridTemplateColumns as string;
  }
  if (config.gridTemplateRows != null) {
    s.gridTemplateRows = config.gridTemplateRows as string;
  }
  if (config.gridColumn != null) {
    s.gridColumn = config.gridColumn as string;
  }
  if (config.gridRow != null) {
    s.gridRow = config.gridRow as string;
  }
  if (config.textAlign != null) {
    s.textAlign = config.textAlign as React.CSSProperties["textAlign"];
  }
  if (config.fontSize != null) {
    s.fontSize = resolve(config.fontSize, FONT_SIZE_MAP);
  }
  if (config.fontWeight != null) {
    s.fontWeight =
      typeof config.fontWeight === "number"
        ? config.fontWeight
        : (resolve(
            config.fontWeight,
            FONT_WEIGHT_MAP,
          ) as React.CSSProperties["fontWeight"]);
  }
  if (config.lineHeight != null) {
    s.lineHeight = config.lineHeight as string;
  }
  if (config.letterSpacing != null) {
    s.letterSpacing = config.letterSpacing as string;
  }

  return s;
}
```

### Integration in ComponentWrapper

```typescript
// In component-wrapper.tsx, merge style props with existing style resolution:
const styleProps = resolveStyleProps(config);
const mergedStyle = {
  ...styleProps,
  ...stickyStyle,
  ...animationStyle,
  ...glassStyle,
  ...bgStyle,
  ...transitionStyle,
  ...tokenOverrides,
  ...config.style,
};
```

Order: style props → feature styles → token overrides → raw `style` escape hatch (highest priority).

### 1.2: Interactive State Style Props (hover / focus / active)

Any component can declare how it looks on hover, focus, and active states — no `className`
escape hatch needed.

#### Schema

Add to `baseComponentConfigSchema`:

```typescript
/** Styles applied on hover. Same shape as style props. */
hover: z.object({
  bg: z.string().optional(),
  color: z.string().optional(),
  shadow: z.union([shadowEnum, z.string()]).optional(),
  borderRadius: z.union([radiusEnum, z.string()]).optional(),
  border: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  transform: z.string().optional(),
  scale: z.number().optional(),
}).optional(),

/** Styles applied on focus-visible. */
focus: z.object({
  bg: z.string().optional(),
  color: z.string().optional(),
  shadow: z.union([shadowEnum, z.string()]).optional(),
  ring: z.union([z.boolean(), z.string()]).optional(),  // true = default focus ring
  outline: z.string().optional(),
}).optional(),

/** Styles applied on :active (pressed). */
active: z.object({
  bg: z.string().optional(),
  color: z.string().optional(),
  transform: z.string().optional(),
  scale: z.number().optional(),
}).optional(),
```

#### Implementation

ComponentWrapper generates a scoped `<style>` block per component instance when
`hover`, `focus`, or `active` props are present. Uses the `data-snapshot-id` attribute
as the selector:

```typescript
// In style-props.ts:
export function resolveInteractiveCSS(
  id: string,
  hover?: HoverConfig,
  focus?: FocusConfig,
  active?: ActiveConfig,
): string | null {
  const rules: string[] = [];
  const sel = `[data-snapshot-id="${id}"]`;

  if (hover) {
    const props: string[] = [];
    if (hover.bg) props.push(`background: ${resolveColor(hover.bg)}`);
    if (hover.color) props.push(`color: ${resolveColor(hover.color)}`);
    if (hover.shadow) props.push(`box-shadow: ${resolveShadow(hover.shadow)}`);
    if (hover.opacity != null) props.push(`opacity: ${hover.opacity}`);
    if (hover.transform) props.push(`transform: ${hover.transform}`);
    if (hover.scale != null) props.push(`transform: scale(${hover.scale})`);
    if (hover.border) props.push(`border: ${hover.border}`);
    if (hover.borderRadius)
      props.push(`border-radius: ${resolveRadius(hover.borderRadius)}`);
    if (props.length)
      rules.push(
        `${sel}:hover { ${props.join("; ")}; transition: all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease); }`,
      );
  }

  if (focus) {
    const props: string[] = [];
    if (focus.bg) props.push(`background: ${resolveColor(focus.bg)}`);
    if (focus.color) props.push(`color: ${resolveColor(focus.color)}`);
    if (focus.shadow) props.push(`box-shadow: ${resolveShadow(focus.shadow)}`);
    if (focus.ring === true)
      props.push(
        `outline: 2px solid var(--sn-ring-color, var(--sn-color-primary)); outline-offset: var(--sn-ring-offset, 2px)`,
      );
    else if (typeof focus.ring === "string")
      props.push(
        `outline: 2px solid ${resolveColor(focus.ring)}; outline-offset: 2px`,
      );
    if (focus.outline) props.push(`outline: ${focus.outline}`);
    if (props.length)
      rules.push(`${sel}:focus-visible { ${props.join("; ")} }`);
  }

  if (active) {
    const props: string[] = [];
    if (active.bg) props.push(`background: ${resolveColor(active.bg)}`);
    if (active.color) props.push(`color: ${resolveColor(active.color)}`);
    if (active.transform) props.push(`transform: ${active.transform}`);
    if (active.scale != null) props.push(`transform: scale(${active.scale})`);
    if (props.length) rules.push(`${sel}:active { ${props.join("; ")} }`);
  }

  return rules.length ? rules.join("\n") : null;
}
```

ComponentWrapper auto-generates an `id` when hover/focus/active is used but no `id` is
set. Injects the CSS via a `<style>` element scoped to the wrapper.

#### Consumer Example

```jsonc
{
  "type": "box",
  "padding": "md",
  "bg": "card",
  "borderRadius": "lg",
  "cursor": "pointer",
  "hover": { "bg": "accent", "shadow": "lg", "scale": 1.02 },
  "focus": { "ring": true },
  "active": { "scale": 0.98 },
  "children": [{ "type": "text", "value": "Interactive card" }],
}
```

A button with completely custom hover:

```jsonc
{
  "type": "button",
  "label": "Custom",
  "bg": "primary",
  "color": "primary-foreground",
  "borderRadius": "full",
  "padding": "md",
  "hover": { "bg": "secondary", "shadow": "xl", "scale": 1.05 },
  "active": { "scale": 0.95 },
}
```

### 1.3: Responsive Style Props

Style props accept breakpoint maps, not just single values. Same pattern as `span`.

#### Schema

```typescript
// A responsive value is either a single value or a breakpoint map:
// "md"  OR  { "default": "sm", "md": "lg", "xl": "2xl" }
const responsiveSpacing = z.union([
  spacingEnum,
  z.string(),
  z.object({
    default: z.union([spacingEnum, z.string()]),
    sm: z.union([spacingEnum, z.string()]).optional(),
    md: z.union([spacingEnum, z.string()]).optional(),
    lg: z.union([spacingEnum, z.string()]).optional(),
    xl: z.union([spacingEnum, z.string()]).optional(),
    "2xl": z.union([spacingEnum, z.string()]).optional(),
  }),
]);
```

Apply the same `responsiveSchema` wrapper to ALL style props that make sense at
different breakpoints: `padding`, `paddingX`, `paddingY`, `margin`, `marginX`,
`marginY`, `gap`, `fontSize`, `display`, `flexDirection`, `width`, `maxWidth`,
`height`, `minHeight`.

Props that rarely change by breakpoint stay single-value: `bg`, `color`, `cursor`,
`opacity`, `position`.

#### Implementation

Responsive style props generate CSS custom properties + media queries per component
instance, similar to interactive state CSS:

```typescript
// Generates:
// [data-snapshot-id="xyz"] { padding: var(--sn-spacing-sm); }
// @media (min-width: 768px) { [data-snapshot-id="xyz"] { padding: var(--sn-spacing-lg); } }
// @media (min-width: 1280px) { [data-snapshot-id="xyz"] { padding: var(--sn-spacing-2xl); } }

export function resolveResponsiveCSS(
  id: string,
  props: Record<string, unknown>,
): string | null {
  const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };
  const rules: Record<string, string[]> = { default: [] };

  for (const [prop, value] of Object.entries(props)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    if (!("default" in (value as Record<string, unknown>))) continue;

    const responsive = value as Record<string, string>;
    const cssProp = stylePropToCSSProperty(prop);
    if (!cssProp) continue;

    if (responsive.default) {
      rules.default.push(
        `${cssProp}: ${resolveTokenValue(prop, responsive.default)}`,
      );
    }
    for (const [bp, bpValue] of Object.entries(responsive)) {
      if (bp === "default" || !bpValue) continue;
      if (!rules[bp]) rules[bp] = [];
      rules[bp].push(`${cssProp}: ${resolveTokenValue(prop, bpValue)}`);
    }
  }

  const sel = `[data-snapshot-id="${id}"]`;
  const css: string[] = [];
  if (rules.default.length) css.push(`${sel} { ${rules.default.join("; ")}; }`);
  for (const [bp, props] of Object.entries(rules)) {
    if (bp === "default" || !props.length) continue;
    const minWidth = BREAKPOINTS[bp as keyof typeof BREAKPOINTS];
    if (minWidth)
      css.push(
        `@media (min-width: ${minWidth}px) { ${sel} { ${props.join("; ")}; } }`,
      );
  }

  return css.length ? css.join("\n") : null;
}
```

#### Consumer Example

```jsonc
{
  "type": "row",
  "padding": { "default": "sm", "md": "lg", "xl": "2xl" },
  "gap": { "default": "sm", "lg": "xl" },
  "flexDirection": { "default": "column", "md": "row" },
  "children": [
    {
      "type": "text",
      "value": "Title",
      "fontSize": { "default": "lg", "md": "2xl" },
    },
  ],
}
```

### Consumer Example (Full Phase 1)

A navbar built entirely from primitives and style props — no `nav-*` components:

```jsonc
{
  "navigation": {
    "mode": "top-nav",
    "template": [
      {
        "type": "row",
        "alignItems": "center",
        "gap": "md",
        "padding": "sm",
        "height": "3.5rem",
        "width": "100%",
        "children": [
          {
            "type": "link",
            "text": "Budget",
            "path": "/",
            "fontWeight": "bold",
            "fontSize": "lg",
          },
          {
            "type": "link",
            "text": "Dashboard",
            "path": "/",
            "fontSize": "sm",
            "hover": { "color": "primary" },
          },
          {
            "type": "link",
            "text": "Transactions",
            "path": "/transactions",
            "fontSize": "sm",
            "hover": { "color": "primary" },
          },
          {
            "type": "popover",
            "trigger": {
              "type": "button",
              "label": "Manage",
              "variant": "ghost",
              "icon": "ChevronDown",
            },
            "content": [
              {
                "type": "link",
                "text": "Categories",
                "path": "/categories",
                "padding": "sm",
                "hover": { "bg": "accent" },
              },
              {
                "type": "link",
                "text": "Merchants",
                "path": "/merchants",
                "padding": "sm",
                "hover": { "bg": "accent" },
              },
            ],
          },
          { "type": "spacer" },
          { "type": "input", "placeholder": "Search...", "maxWidth": "240px" },
          { "type": "avatar", "size": "sm" },
        ],
      },
    ],
  },
}
```

**This is the test.** If this looks great with just primitives and style props, the
foundation is right. Nav-specific components (Phase 3) are convenience sugar, not
structural requirements.

### Files to Create

| File                                     | Purpose                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/ui/components/_base/style-props.ts` | `resolveStyleProps()`, `resolveInteractiveCSS()`, `resolveResponsiveCSS()`, all token maps |

### Files to Modify

| File                                            | Change                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `src/ui/components/_base/schema.ts`             | Add style props, hover/focus/active, responsive wrappers               |
| `src/ui/components/_base/component-wrapper.tsx` | Call resolvers, inject scoped `<style>` for interactive/responsive CSS |
| `src/ui/manifest/schema.ts`                     | Import updated base schema                                             |

### Exit Criteria

- [ ] `{ "type": "text", "padding": "md", "bg": "card", "borderRadius": "lg" }` renders with token-resolved CSS
- [ ] Raw CSS values pass through: `{ "padding": "2.5rem" }` works
- [ ] Token enums show in JSON Schema intellisense
- [ ] Existing `style` prop still works as override
- [ ] `{ "hover": { "bg": "accent", "scale": 1.02 } }` generates scoped hover CSS
- [ ] `{ "focus": { "ring": true } }` generates focus-visible ring
- [ ] `{ "active": { "scale": 0.98 } }` generates active press effect
- [ ] `{ "padding": { "default": "sm", "md": "lg" } }` generates responsive media queries
- [ ] A navbar built entirely from `row`, `link`, `button`, `input`, `popover`, `spacer` + style props looks production-quality
- [ ] No component needs updating — base schema applies to all 76+ components
- [ ] SSR: `resolveStyleProps()` produces identical output on server and client
- [ ] SSR: Scoped `<style>` blocks are deterministic (same config = same CSS string)
- [ ] `bun run typecheck` passes

---

## Phase 2: Missing Primitives

### Goal

The primitive component library must be sufficient to build ANY UI pattern — navbars,
hero sections, pricing tables, dashboards, landing pages — from composition alone.
The following primitives are missing or incomplete.

### 2.1: `box` Component

A generic styled container. The most fundamental layout primitive. Row is flex, grid is
grid — `box` is just a div that accepts all style props and renders children.

```typescript
// src/ui/components/layout/box/schema.ts
export const boxConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("box"),
  /** Tag to render. Default: "div". */
  as: z
    .enum([
      "div",
      "section",
      "article",
      "aside",
      "header",
      "footer",
      "main",
      "nav",
      "span",
    ])
    .optional(),
  children: z.array(componentConfigSchema).optional(),
});
```

```typescript
// src/ui/components/layout/box/component.tsx
'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { BoxConfig } from "./types";

export function Box({ config }: { config: BoxConfig }) {
  const Tag = config.as ?? "div";
  return (
    <>
      {config.children?.map((child, i) => (
        <ComponentRenderer key={(child as { id?: string }).id ?? i} config={child} />
      ))}
    </>
  );
}
```

**Note:** Box doesn't render its own wrapper div — `ComponentWrapper` already provides
one. Box exists purely to be a composable container with all base style props. The `as`
prop is passed to `ComponentWrapper` to control the rendered HTML element.

#### Consumer Examples

A card built from scratch:

```jsonc
{
  "type": "box",
  "bg": "card",
  "color": "card-foreground",
  "borderRadius": "lg",
  "shadow": "md",
  "padding": "lg",
  "border": "1px solid var(--sn-color-border)",
  "hover": { "shadow": "xl", "scale": 1.01 },
  "children": [
    {
      "type": "text",
      "value": "Custom Card Title",
      "fontWeight": "bold",
      "fontSize": "lg",
    },
    {
      "type": "text",
      "value": "Some description text.",
      "color": "muted-foreground",
      "fontSize": "sm",
    },
  ],
}
```

A full-bleed hero section:

```jsonc
{
  "type": "box",
  "as": "section",
  "bg": {
    "gradient": {
      "type": "linear",
      "direction": "135deg",
      "stops": [
        { "color": "var(--sn-color-primary)", "position": "0%" },
        { "color": "var(--sn-color-accent)", "position": "100%" },
      ],
    },
  },
  "padding": { "default": "xl", "lg": "3xl" },
  "minHeight": "80vh",
  "display": "flex",
  "flexDirection": "column",
  "alignItems": "center",
  "justifyContent": "center",
  "children": [
    {
      "type": "text",
      "value": "Ship faster.",
      "fontSize": { "default": "3xl", "lg": "4xl" },
      "fontWeight": "bold",
      "color": "primary-foreground",
      "textAlign": "center",
    },
    {
      "type": "text",
      "value": "Build your entire frontend from a single manifest.",
      "fontSize": "lg",
      "color": "primary-foreground",
      "opacity": 0.8,
      "textAlign": "center",
    },
    {
      "type": "row",
      "gap": "md",
      "margin": "lg",
      "children": [
        {
          "type": "button",
          "label": "Get Started",
          "bg": "background",
          "color": "foreground",
          "borderRadius": "full",
          "padding": "md",
        },
        {
          "type": "button",
          "label": "Docs",
          "variant": "outline",
          "borderRadius": "full",
          "padding": "md",
          "color": "primary-foreground",
          "border": "1px solid currentColor",
        },
      ],
    },
  ],
}
```

### 2.2: `collapsible` Component

A wrapper that shows/hides its children with smooth height animation. This is the
foundational primitive for expandable search bars, accordion-style reveals, collapsible
sidebar sections, details panels, and any show/hide interaction.

```typescript
// src/ui/components/layout/collapsible/schema.ts
export const collapsibleConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("collapsible"),
  /** Whether the content is expanded. Can be a static boolean, FromRef, or expression. */
  open: z
    .union([z.boolean(), fromRefSchema, z.object({ expr: z.string() })])
    .optional(),
  /** Default open state when not controlled by `open`. */
  defaultOpen: z.boolean().optional(),
  /** The always-visible trigger element. Clicking it toggles open state. */
  trigger: componentConfigSchema.optional(),
  /** The content that shows/hides. */
  children: z.array(componentConfigSchema),
  /** Animation duration token. Default: "fast". */
  duration: z.enum(["instant", "fast", "normal", "slow"]).optional(),
  /** State key to publish open/closed state to. */
  publishTo: z.string().optional(),
});
```

```typescript
// src/ui/components/layout/collapsible/component.tsx
'use client';

import { useEffect, useRef, useState } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useSubscribe, usePublish } from "../../../context/index";
import type { CollapsibleConfig } from "./types";

const DURATION_MAP: Record<string, number> = {
  instant: 0, fast: 150, normal: 300, slow: 500,
};

export function Collapsible({ config }: { config: CollapsibleConfig }) {
  const controlledOpen = useSubscribe(
    typeof config.open === "object" && "from" in config.open ? config.open : undefined,
  );
  const isControlled = config.open !== undefined && typeof config.open !== "boolean"
    ? controlledOpen !== undefined
    : config.open !== undefined;

  const [internalOpen, setInternalOpen] = useState(config.defaultOpen ?? false);
  const isOpen = isControlled
    ? (typeof config.open === "boolean" ? config.open : Boolean(controlledOpen))
    : internalOpen;

  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(isOpen ? "auto" : "0px");
  const duration = DURATION_MAP[config.duration ?? "fast"] ?? 150;
  const publish = usePublish(config.publishTo);

  useEffect(() => {
    if (config.publishTo) publish(isOpen);
  }, [isOpen, config.publishTo, publish]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (isOpen) {
      // Expand: set to scrollHeight, then auto after transition
      setHeight(`${el.scrollHeight}px`);
      const timer = setTimeout(() => setHeight("auto"), duration);
      return () => clearTimeout(timer);
    } else {
      // Collapse: set to current height first, then 0
      setHeight(`${el.scrollHeight}px`);
      requestAnimationFrame(() => setHeight("0px"));
    }
  }, [isOpen, duration]);

  const toggle = () => { if (!isControlled) setInternalOpen((v) => !v); };

  return (
    <>
      {config.trigger && (
        <div onClick={toggle} style={{ cursor: "pointer" }} data-collapsible-trigger="">
          <ComponentRenderer config={config.trigger} />
        </div>
      )}
      <div
        ref={contentRef}
        data-collapsible-content=""
        data-open={isOpen ? "true" : undefined}
        style={{
          height,
          overflow: "hidden",
          transition: `height ${duration}ms var(--sn-ease-default, ease)`,
        }}
      >
        {config.children.map((child, i) => (
          <ComponentRenderer key={(child as { id?: string }).id ?? i} config={child} />
        ))}
      </div>
    </>
  );
}
```

#### Consumer Examples

Expandable search bar (no `nav-search` needed):

```jsonc
{
  "type": "collapsible",
  "defaultOpen": false,
  "publishTo": "searchOpen",
  "trigger": {
    "type": "button",
    "icon": "Search",
    "variant": "ghost",
    "borderRadius": "full",
  },
  "children": [
    {
      "type": "input",
      "placeholder": "Search...",
      "padding": "sm",
      "maxWidth": "300px",
    },
  ],
}
```

Collapsible sidebar section:

```jsonc
{
  "type": "collapsible",
  "defaultOpen": true,
  "trigger": {
    "type": "row",
    "alignItems": "center",
    "justifyContent": "between",
    "padding": "sm",
    "children": [
      {
        "type": "text",
        "value": "Finance",
        "fontWeight": "semibold",
        "fontSize": "xs",
        "color": "muted-foreground",
      },
      {
        "type": "text",
        "value": "▾",
        "fontSize": "xs",
        "color": "muted-foreground",
      },
    ],
  },
  "children": [
    { "type": "link", "text": "Dashboard", "path": "/", "padding": "sm" },
    {
      "type": "link",
      "text": "Transactions",
      "path": "/transactions",
      "padding": "sm",
    },
  ],
}
```

Details panel:

```jsonc
{
  "type": "collapsible",
  "trigger": {
    "type": "row",
    "gap": "sm",
    "children": [
      { "type": "text", "value": "Advanced options" },
      { "type": "text", "value": "›" },
    ],
  },
  "children": [{ "type": "auto-form", "fields": ["..."] }],
}
```

### 2.3: `icon-button` Component

A button that renders as a compact icon-only element. Circle or rounded square. Essential
for toolbars, nav actions, close buttons, and anywhere you need a clickable icon.

```typescript
// src/ui/components/forms/icon-button/schema.ts
export const iconButtonConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("icon-button"),
  icon: z.string(),
  /** Size of the button. Default: "md". */
  size: z.enum(["xs", "sm", "md", "lg"]).optional(),
  /** Visual variant. Default: "ghost". */
  variant: z
    .enum(["default", "secondary", "outline", "ghost", "destructive"])
    .optional(),
  /** Shape. Default: "circle". */
  shape: z.enum(["circle", "square"]).optional(),
  /** Accessible label (required since there's no visible text). */
  ariaLabel: z.string(),
  action: actionSchema.optional(),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
  /** Tooltip text shown on hover. */
  tooltip: z.string().optional(),
});
```

Size map:

```typescript
const SIZE_MAP = { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "3rem" };
const ICON_SIZE_MAP = { xs: 12, sm: 14, md: 16, lg: 20 };
```

#### Consumer Example

```jsonc
{
  "type": "row",
  "gap": "xs",
  "children": [
    {
      "type": "icon-button",
      "icon": "Bell",
      "ariaLabel": "Notifications",
      "variant": "ghost",
      "tooltip": "Notifications",
    },
    {
      "type": "icon-button",
      "icon": "Settings",
      "ariaLabel": "Settings",
      "action": { "type": "navigate", "path": "/settings" },
    },
    {
      "type": "icon-button",
      "icon": "X",
      "ariaLabel": "Close",
      "variant": "ghost",
      "size": "sm",
      "hover": { "bg": "destructive", "color": "destructive-foreground" },
    },
  ],
}
```

### 2.4: `hover-card` Component

Rich content that appears on hover over a trigger element. Unlike tooltip (text only),
hover-card renders full component configs.

```typescript
// src/ui/components/overlay/hover-card/schema.ts
export const hoverCardConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("hover-card"),
  /** The element that triggers the hover card. */
  trigger: componentConfigSchema,
  /** Content rendered in the floating card. */
  content: z.array(componentConfigSchema),
  /** Alignment relative to trigger. Default: "center". */
  align: z.enum(["start", "center", "end"]).optional(),
  /** Side to show on. Default: "bottom". */
  side: z.enum(["top", "bottom", "left", "right"]).optional(),
  /** Delay before showing (ms). Default: 300. */
  openDelay: z.number().optional(),
  /** Delay before hiding (ms). Default: 200. */
  closeDelay: z.number().optional(),
  /** Width of the card. */
  width: z.string().optional(),
});
```

#### Consumer Example

User profile hover card (like GitHub):

```jsonc
{
  "type": "hover-card",
  "trigger": { "type": "avatar", "size": "sm" },
  "width": "320px",
  "content": [
    {
      "type": "row",
      "gap": "md",
      "padding": "md",
      "children": [
        { "type": "avatar", "size": "lg" },
        {
          "type": "box",
          "children": [
            {
              "type": "text",
              "value": { "from": "global.user.name" },
              "fontWeight": "bold",
            },
            {
              "type": "text",
              "value": { "from": "global.user.email" },
              "fontSize": "sm",
              "color": "muted-foreground",
            },
          ],
        },
      ],
    },
    { "type": "divider" },
    {
      "type": "row",
      "padding": "sm",
      "gap": "sm",
      "children": [
        {
          "type": "button",
          "label": "Profile",
          "variant": "ghost",
          "size": "sm",
          "action": { "type": "navigate", "path": "/profile" },
        },
        {
          "type": "button",
          "label": "Sign Out",
          "variant": "ghost",
          "size": "sm",
          "action": {
            "type": "api",
            "method": "POST",
            "endpoint": "/api/auth/logout",
          },
        },
      ],
    },
  ],
}
```

### 2.5: `toggle-group` Component

A row of buttons where one (or multiple) is selected. Radio-button or checkbox behavior.
Essential for view switchers (grid/list/table), filter toggles, and segmented controls.

```typescript
// src/ui/components/forms/toggle-group/schema.ts
export const toggleGroupConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("toggle-group"),
  /** Selection mode. Default: "single". */
  mode: z.enum(["single", "multiple"]).optional(),
  /** Items in the group. */
  items: z.array(
    z
      .object({
        value: z.string(),
        label: z.string().optional(),
        icon: z.string().optional(),
        disabled: z.union([z.boolean(), fromRefSchema]).optional(),
      })
      .strict(),
  ),
  /** Default selected value(s). */
  defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
  /** Controlled value from state. */
  value: z.union([z.string(), z.array(z.string()), fromRefSchema]).optional(),
  /** Size. Default: "md". */
  size: z.enum(["sm", "md", "lg"]).optional(),
  /** Visual variant. Default: "outline". */
  variant: z.enum(["outline", "ghost"]).optional(),
  /** State key to publish selected value(s) to. */
  publishTo: z.string().optional(),
  /** Action on change. */
  onChange: actionSchema.optional(),
});
```

#### Consumer Example

View mode switcher:

```jsonc
{
  "type": "toggle-group",
  "mode": "single",
  "defaultValue": "table",
  "publishTo": "viewMode",
  "items": [
    { "value": "table", "icon": "Table", "label": "Table" },
    { "value": "grid", "icon": "Grid3x3", "label": "Grid" },
    { "value": "list", "icon": "List", "label": "List" },
  ],
}
```

### Files to Create

| File                                                 | Purpose   |
| ---------------------------------------------------- | --------- |
| `src/ui/components/layout/box/schema.ts`             | Schema    |
| `src/ui/components/layout/box/component.tsx`         | Component |
| `src/ui/components/layout/box/types.ts`              | Types     |
| `src/ui/components/layout/box/index.ts`              | Exports   |
| `src/ui/components/layout/collapsible/schema.ts`     | Schema    |
| `src/ui/components/layout/collapsible/component.tsx` | Component |
| `src/ui/components/layout/collapsible/types.ts`      | Types     |
| `src/ui/components/layout/collapsible/index.ts`      | Exports   |
| `src/ui/components/forms/icon-button/schema.ts`      | Schema    |
| `src/ui/components/forms/icon-button/component.tsx`  | Component |
| `src/ui/components/forms/icon-button/types.ts`       | Types     |
| `src/ui/components/forms/icon-button/index.ts`       | Exports   |
| `src/ui/components/overlay/hover-card/schema.ts`     | Schema    |
| `src/ui/components/overlay/hover-card/component.tsx` | Component |
| `src/ui/components/overlay/hover-card/types.ts`      | Types     |
| `src/ui/components/overlay/hover-card/index.ts`      | Exports   |
| `src/ui/components/forms/toggle-group/schema.ts`     | Schema    |
| `src/ui/components/forms/toggle-group/component.tsx` | Component |
| `src/ui/components/forms/toggle-group/types.ts`      | Types     |
| `src/ui/components/forms/toggle-group/index.ts`      | Exports   |

### Files to Modify

| File                            | Change                                                                     |
| ------------------------------- | -------------------------------------------------------------------------- |
| `src/ui/components/register.ts` | Register `box`, `collapsible`, `icon-button`, `hover-card`, `toggle-group` |

### Exit Criteria

- [ ] `box` renders as a styled container with any HTML element
- [ ] `collapsible` smoothly animates height on show/hide
- [ ] `collapsible` supports controlled (FromRef) and uncontrolled modes
- [ ] `collapsible` publishes open state to manifest state system
- [ ] `icon-button` renders compact icon-only buttons with tooltip
- [ ] `hover-card` shows rich component content on hover with configurable delay
- [ ] `toggle-group` supports single and multiple selection with state publishing
- [ ] All new components accept Phase 1 universal style props
- [ ] A custom expandable search built from `collapsible` + `input` works smoothly
- [ ] A sidebar with collapsible sections built from `collapsible` + `link` works
- [ ] SSR: All new components render in default state on server (collapsible → collapsed, hover-card → hidden)
- [ ] SSR: No hydration mismatch warnings in console
- [ ] `bun run typecheck` passes

---

## Phase 3: Composable Navigation

### Goal

Replace the monolithic Nav component with a composable template system. The nav is just a
container that renders whatever components you put in `navigation.template`.

### New Nav Sub-Components

Register 7 new components that can appear anywhere in the manifest, but are primarily
designed for nav composition:

#### 3.1: `nav-logo`

```typescript
// src/ui/components/layout/nav-logo/schema.ts
export const navLogoConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("nav-logo"),
  /** Logo image URL. Falls back to manifest app.title if not provided. */
  src: z.string().optional(),
  /** Brand text. Falls back to manifest app.title. */
  text: z.string().optional(),
  /** Path to navigate on click. Falls back to app.home. */
  path: z.string().optional(),
  /** Height of the logo image. */
  logoHeight: z.string().optional(),
});
```

Reads from `ManifestRuntimeContext` for defaults (app.title, app.home).

#### 3.2: `nav-link`

```typescript
// src/ui/components/layout/nav-link/schema.ts
export const navLinkConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("nav-link"),
  label: z.union([z.string(), fromRefSchema]),
  path: z.string(),
  icon: z.string().optional(),
  badge: z.union([z.number(), fromRefSchema]).optional(),
  /** If true, also matches child paths for active state. Default: true. */
  matchChildren: z.boolean().optional(),
  /** Explicit active state override. */
  active: z.union([z.boolean(), fromRefSchema]).optional(),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
  roles: z.array(z.string()).optional(),
  authenticated: z.boolean().optional(),
});
```

Resolves active state from current pathname. Uses `useSubscribe` for badge/disabled.
Role filtering via user context.

#### 3.3: `nav-dropdown`

```typescript
// src/ui/components/layout/nav-dropdown/schema.ts
export const navDropdownConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("nav-dropdown"),
  label: z.string(),
  icon: z.string().optional(),
  /** Trigger behavior. Default: "click". */
  trigger: z.enum(["click", "hover"]).optional(),
  /** Alignment of dropdown panel. Default: "start". */
  align: z.enum(["start", "center", "end"]).optional(),
  /** Width of dropdown panel. */
  width: z.string().optional(),
  /** Items rendered inside the dropdown panel. */
  items: z.array(componentConfigSchema),
  roles: z.array(z.string()).optional(),
  authenticated: z.boolean().optional(),
});
```

Renders a trigger button + floating dropdown panel. Items are full component configs —
not just links. You can put `nav-link`, `divider`, `text`, `button`, anything inside.

#### 3.4: `nav-section`

```typescript
// src/ui/components/layout/nav-section/schema.ts
export const navSectionConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("nav-section"),
  /** Optional label above the section. */
  label: z.string().optional(),
  /** Whether section is collapsible. Default: false. */
  collapsible: z.boolean().optional(),
  /** Whether section starts collapsed. Default: false. */
  defaultCollapsed: z.boolean().optional(),
  /** Items in this section. */
  items: z.array(componentConfigSchema),
});
```

Groups items with an optional label. In sidebar mode, renders as a labeled group
with optional collapse toggle. Items are full component configs.

#### 3.5: `nav-search`

```typescript
// src/ui/components/layout/nav-search/schema.ts
export const navSearchConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("nav-search"),
  placeholder: z.string().optional(),
  /** Action to execute on search submit. */
  onSearch: actionSchema.optional(),
  /** Shortcut to focus the search input. */
  shortcut: z.string().optional(),
  /** State key to publish the search value to. */
  publishTo: z.string().optional(),
});
```

Renders a search input. Publishes value to state via `publishTo`.
Executes action on submit. Keyboard shortcut support via manifest shortcuts system.

#### 3.6: `nav-user-menu`

```typescript
// src/ui/components/layout/nav-user-menu/schema.ts
export const navUserMenuConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("nav-user-menu"),
  showAvatar: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showName: z.boolean().optional(),
  /** Display mode. "full" = avatar + name + dropdown. "compact" = avatar only + dropdown. */
  mode: z.enum(["full", "compact"]).optional(),
  /** Menu items (dropdown content when clicked). */
  items: z
    .array(
      z
        .object({
          label: z.string(),
          icon: z.string().optional(),
          action: actionSchema,
          roles: z.array(z.string()).optional(),
        })
        .strict(),
    )
    .optional(),
});
```

Reads user from `global.user`. Renders avatar + dropdown with configurable items.
Role-filtered menu items.

#### 3.7: `spacer` (already registered)

Pushes remaining items in a flex container to the end. Renders as `flex: 1`.

### Navigation Schema Update

```typescript
// In src/ui/manifest/schema.ts, update navigationConfigSchema:
export const navigationConfigSchema = z
  .object({
    /** Layout variant for the navigation area. */
    mode: z.enum(["sidebar", "top-nav"]).optional(),
    /** Legacy: flat item list. Used when template is not provided. */
    items: z.array(navItemSchema).optional(),
    /**
     * Composable template: array of component configs rendered in the nav container.
     * When provided, replaces the default nav rendering entirely.
     * Any registered component can appear here.
     */
    template: z.array(componentConfigSchema).optional(),
    /** Logo config (used by default nav when no template is provided). */
    logo: logoConfigSchema.optional(),
    /** User menu config (used by default nav when no template is provided). */
    userMenu: z.union([z.boolean(), userMenuConfigSchema]).optional(),
  })
  .strict()
  .refine((data) => Boolean(data.items?.length || data.template?.length), {
    message: "Navigation must define either items or template.",
  });
```

### Nav Component Rewrite

```typescript
// src/ui/components/layout/nav/component.tsx
// When config.template is provided, Nav becomes a thin container:

export function Nav({ config, pathname, onNavigate, variant }: NavComponentProps) {
  const isTopNav = variant === "top-nav";

  // If template is provided, render composable template
  if (config.template) {
    return (
      <nav
        aria-label="Main navigation"
        data-snapshot-component="nav"
        data-variant={variant}
        className={config.className}
        style={{
          display: "flex",
          flexDirection: isTopNav ? "row" : "column",
          alignItems: isTopNav ? "center" : undefined,
          height: "100%",
          ...resolveStyleProps(config),
          ...(config.style as React.CSSProperties),
        }}
      >
        {config.template.map((item, i) => (
          <ComponentRenderer key={(item as { id?: string }).id ?? i} config={item} />
        ))}
      </nav>
    );
  }

  // Legacy: render from items (existing behavior, no changes)
  // ...existing code...
}
```

### Registration

Add to `src/ui/components/register.ts`:

```typescript
registerComponent("nav-logo", NavLogo);
registerComponentSchema("nav-logo", navLogoConfigSchema);
registerComponent("nav-link", NavLink);
registerComponentSchema("nav-link", navLinkConfigSchema);
registerComponent("nav-dropdown", NavDropdown);
registerComponentSchema("nav-dropdown", navDropdownConfigSchema);
registerComponent("nav-section", NavSection);
registerComponentSchema("nav-section", navSectionConfigSchema);
registerComponent("nav-search", NavSearch);
registerComponentSchema("nav-search", navSearchConfigSchema);
registerComponent("nav-user-menu", NavUserMenu);
registerComponentSchema("nav-user-menu", navUserMenuConfigSchema);
```

### Consumer Example

```jsonc
{
  "navigation": {
    "mode": "top-nav",
    "template": [
      { "type": "nav-logo", "text": "Budget", "path": "/" },
      {
        "type": "nav-link",
        "label": "Dashboard",
        "path": "/",
        "icon": "LayoutDashboard",
      },
      {
        "type": "nav-link",
        "label": "Transactions",
        "path": "/transactions",
        "icon": "ArrowLeftRight",
      },
      {
        "type": "nav-link",
        "label": "Accounts",
        "path": "/accounts",
        "icon": "Wallet",
      },
      {
        "type": "nav-dropdown",
        "label": "Manage",
        "icon": "Settings",
        "items": [
          {
            "type": "nav-link",
            "label": "Categories",
            "path": "/categories",
            "icon": "FolderTree",
          },
          {
            "type": "nav-link",
            "label": "Merchants",
            "path": "/merchants",
            "icon": "Store",
          },
          { "type": "divider" },
          {
            "type": "nav-link",
            "label": "Statements",
            "path": "/statements",
            "icon": "FileText",
          },
        ],
      },
      { "type": "spacer" },
      {
        "type": "nav-search",
        "placeholder": "Search...",
        "shortcut": "ctrl+k",
      },
      { "type": "nav-user-menu", "mode": "compact" },
    ],
  },
}
```

Sidebar example with sections:

```jsonc
{
  "navigation": {
    "mode": "sidebar",
    "template": [
      { "type": "nav-logo", "path": "/" },
      { "type": "nav-search", "placeholder": "Search...", "padding": "sm" },
      {
        "type": "nav-section",
        "label": "Finance",
        "items": [
          {
            "type": "nav-link",
            "label": "Dashboard",
            "path": "/",
            "icon": "LayoutDashboard",
          },
          {
            "type": "nav-link",
            "label": "Transactions",
            "path": "/transactions",
            "icon": "ArrowLeftRight",
          },
        ],
      },
      {
        "type": "nav-section",
        "label": "Manage",
        "collapsible": true,
        "items": [
          {
            "type": "nav-link",
            "label": "Categories",
            "path": "/categories",
            "icon": "FolderTree",
          },
          {
            "type": "nav-link",
            "label": "Merchants",
            "path": "/merchants",
            "icon": "Store",
          },
        ],
      },
      { "type": "spacer" },
      { "type": "nav-user-menu", "mode": "full" },
    ],
  },
}
```

### Files to Create

| File                                                   | Purpose   |
| ------------------------------------------------------ | --------- |
| `src/ui/components/layout/nav-logo/schema.ts`          | Schema    |
| `src/ui/components/layout/nav-logo/component.tsx`      | Component |
| `src/ui/components/layout/nav-logo/types.ts`           | Types     |
| `src/ui/components/layout/nav-logo/index.ts`           | Exports   |
| `src/ui/components/layout/nav-link/schema.ts`          | Schema    |
| `src/ui/components/layout/nav-link/component.tsx`      | Component |
| `src/ui/components/layout/nav-link/types.ts`           | Types     |
| `src/ui/components/layout/nav-link/index.ts`           | Exports   |
| `src/ui/components/layout/nav-dropdown/schema.ts`      | Schema    |
| `src/ui/components/layout/nav-dropdown/component.tsx`  | Component |
| `src/ui/components/layout/nav-dropdown/types.ts`       | Types     |
| `src/ui/components/layout/nav-dropdown/index.ts`       | Exports   |
| `src/ui/components/layout/nav-section/schema.ts`       | Schema    |
| `src/ui/components/layout/nav-section/component.tsx`   | Component |
| `src/ui/components/layout/nav-section/types.ts`        | Types     |
| `src/ui/components/layout/nav-section/index.ts`        | Exports   |
| `src/ui/components/layout/nav-search/schema.ts`        | Schema    |
| `src/ui/components/layout/nav-search/component.tsx`    | Component |
| `src/ui/components/layout/nav-search/types.ts`         | Types     |
| `src/ui/components/layout/nav-search/index.ts`         | Exports   |
| `src/ui/components/layout/nav-user-menu/schema.ts`     | Schema    |
| `src/ui/components/layout/nav-user-menu/component.tsx` | Component |
| `src/ui/components/layout/nav-user-menu/types.ts`      | Types     |
| `src/ui/components/layout/nav-user-menu/index.ts`      | Exports   |

### Files to Modify

| File                                         | Change                                            |
| -------------------------------------------- | ------------------------------------------------- |
| `src/ui/manifest/schema.ts`                  | Update `navigationConfigSchema` to add `template` |
| `src/ui/components/layout/nav/component.tsx` | Add template rendering path                       |
| `src/ui/components/layout/nav/schema.ts`     | Add `template` field                              |
| `src/ui/components/register.ts`              | Register 6 new components                         |

### Exit Criteria

- [ ] `navigation.template` renders composable nav from component configs
- [ ] `nav-link` shows active state based on current path
- [ ] `nav-dropdown` opens/closes on click with outside-click-to-close
- [ ] `nav-section` groups items with optional label and collapse
- [ ] `nav-search` publishes search value to state
- [ ] `nav-user-menu` renders user info with dropdown menu items
- [ ] All nav sub-components accept universal style props from Phase 1
- [ ] Existing `items`-based nav still works when no `template` is provided
- [ ] Role-based visibility works on nav-link, nav-dropdown, nav-user-menu
- [ ] SSR: Nav template renders full markup on server; dropdowns closed by default
- [ ] `bun run typecheck` passes

---

## Phase 4: Nested Layouts & Outlets

### Goal

Parent routes act as persistent layout shells. When navigating to a child route, the
parent's layout persists and the child's content fills the parent's `main` slot.
Multi-level nesting is unlimited.

### The Problem

Currently in `app.tsx`:

```typescript
const renderedRoute = match.activeRoutes[0] ?? route;
// AppShell renders renderedRoute — the ROOT ancestor, not the leaf
```

This renders the root ancestor's page content regardless of which child is active.
`match.parents` is computed by the router but never used for rendering.

### The Fix

`AppShell` takes the leaf route for page content and the full ancestor chain for layout
composition. Each ancestor contributes its layouts (wrapping outward), and the leaf's
content fills the innermost `main` slot.

### SSR Consideration

Layout composition is pure render logic — no browser APIs. The same layout tree renders
on server and client. Route matching happens at request time (SSR) or on navigation
(client). `match.parents` is always available from the router.

### Implementation

#### 4.1: Update AppShell Signature

```typescript
function AppShell({
  manifest,
  route, // Leaf route (page content comes from here)
  parents, // Ancestor routes (layouts come from here, outermost first)
  currentPath,
  navigate,
  isPreloading,
  api,
}: {
  manifest: CompiledManifest;
  route: CompiledRoute;
  parents: CompiledRoute[];
  currentPath: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isPreloading: boolean;
  api: ReturnType<typeof createSnapshot>["api"];
});
```

#### 4.2: Determine Layout Layers

Each route in `[...parents, route]` can contribute layouts. The rule:

- **Outermost route** (first parent, or leaf if no parents): falls back to
  `navigation.mode ?? app.shell ?? "full-width"` when no explicit layouts declared.
- **Inner routes** (subsequent parents and leaf): use explicit `layouts` only.
  If no explicit layouts, contribute nothing (their content passes through to parent's
  `main` slot directly).

```typescript
function hasExplicitLayouts(
  manifest: CompiledManifest,
  routeId: string,
): boolean {
  const route = getRawRouteRecord(manifest, routeId);
  const layouts = route?.["layouts"];
  return Array.isArray(layouts) && layouts.length > 0;
}

// Build the full list of layout layers
interface LayoutLayer {
  route: CompiledRoute;
  layouts: RouteLayoutDeclaration[];
  isOutermost: boolean;
}

const allRouteLevels = [...parents, route];
const layers: LayoutLayer[] = [];
for (let i = 0; i < allRouteLevels.length; i++) {
  const r = allRouteLevels[i]!;
  const isOutermost = i === 0;

  if (isOutermost) {
    // Outermost always has layouts (explicit or global default)
    layers.push({
      route: r,
      layouts: readRouteLayouts(manifest, r.id),
      isOutermost: true,
    });
  } else if (hasExplicitLayouts(manifest, r.id)) {
    // Inner routes contribute only if they declare explicit layouts
    layers.push({
      route: r,
      layouts: readRouteLayouts(manifest, r.id),
      isOutermost: false,
    });
  }
  // else: route has no layouts, its content is passed through directly
}
```

#### 4.3: Compose Layout Tree

```typescript
// Start with the leaf page content
let content: ReactNode = page;

// Wrap from innermost to outermost
for (let i = layers.length - 1; i >= 0; i--) {
  const layer = layers[i]!;
  const layerSlots = readRouteSlots(manifest, layer.route.id);

  content = layer.layouts.reduceRight<ReactNode>((children, layout) => {
    const layoutType = getLayoutType(layout);
    const declaredSlots = new Map<string, RouteLayoutSlotDeclaration>();
    for (const slot of getBuiltInLayoutSlots(layoutType)) {
      declaredSlots.set(slot.name, slot);
    }
    for (const slot of getLayoutSlots(layout)) {
      declaredSlots.set(slot.name, slot);
    }

    const slotContent = layoutSupportsSlots(layout)
      ? Object.fromEntries(
          [...declaredSlots.entries()].map(([slotName, declaration]) => [
            slotName,
            renderSlot(layoutType, declaration, slotName === "main" ? children : undefined),
          ]),
        ) as Record<string, ReactNode>
      : undefined;

    // Global nav only on the outermost layout that supports it
    const navNode =
      layer.isOutermost && navConfig && (layoutType === "sidebar" || layoutType === "top-nav")
        ? <Nav config={navConfig} pathname={currentPath} onNavigate={(path) => navigate(path)} variant={layoutType as "sidebar" | "top-nav"} />
        : undefined;

    return (
      <Layout
        key={`layout:${layer.route.id}:${layoutType}`}
        config={{ type: "layout", variant: layoutType, ...getLayoutProps(layout) } as any}
        nav={navNode}
        slots={slotContent}
      >
        {children}
      </Layout>
    );
  }, content);
}

return content;
```

#### 4.4: Update ManifestRouter Call Site

```typescript
// In ManifestRouter, change:
<AppShell
  manifest={localizedManifest}
  route={route}                    // ← leaf route, NOT renderedRoute
  parents={match.parents}          // ← NEW: ancestor chain
  currentPath={scopedCurrentPath}
  navigate={navigate}
  isPreloading={isPreloading}
  api={api}
/>
```

Remove the `renderedRoute` variable entirely.

### Consumer Example

```jsonc
{
  "navigation": {
    "mode": "top-nav",
    "template": [
      { "type": "nav-logo" },
      { "type": "nav-link", "label": "Finance", "path": "/" },
      { "type": "nav-link", "label": "Settings", "path": "/settings" },
    ],
  },
  "routes": [
    {
      "id": "app",
      "path": "/",
      "content": [{ "type": "heading", "text": "Dashboard" }],
    },
    {
      "id": "settings",
      "path": "/settings",
      "layouts": [
        {
          "type": "sidebar",
          "slots": [
            { "name": "sidebar" },
            { "name": "main", "required": true },
          ],
        },
      ],
      "slots": {
        "sidebar": [
          {
            "type": "nav-link",
            "label": "Profile",
            "path": "/settings/profile",
            "icon": "User",
          },
          {
            "type": "nav-link",
            "label": "Billing",
            "path": "/settings/billing",
            "icon": "CreditCard",
          },
        ],
      },
      "content": [{ "type": "text", "value": "Select a settings page." }],
      "children": [
        {
          "id": "settings-profile",
          "path": "profile",
          "content": [
            { "type": "heading", "text": "Profile Settings" },
            { "type": "auto-form", "fields": ["..."] },
          ],
        },
        {
          "id": "settings-billing",
          "path": "billing",
          "content": [
            { "type": "heading", "text": "Billing" },
            { "type": "data-table", "data": "..." },
          ],
        },
      ],
    },
  ],
}
```

Navigating to `/settings/profile`:

- Outermost: top-nav layout (from `navigation.mode`) with global nav
- Inner: sidebar layout (from settings route's `layouts`) with settings nav in sidebar slot
- Leaf: profile content in main slot

Navigating to `/settings`:

- Same outer layout
- Settings route IS the leaf — its own `content` renders in its sidebar layout's main slot

### Files to Modify

| File                      | Change                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| `src/ui/manifest/app.tsx` | Rewrite AppShell to compose parent layouts; remove `renderedRoute` |
| `src/ui/manifest/app.tsx` | Update AppShell call site in ManifestRouter to pass `parents`      |

### Exit Criteria

- [ ] Child route content renders inside parent route's layout
- [ ] Parent route's sidebar/header slots persist across child navigation
- [ ] Outermost layout gets global nav; inner layouts don't
- [ ] Direct navigation to parent route renders parent's own content
- [ ] 3+ levels of nesting works (outer → settings → subsettings)
- [ ] SSR: Layout composition produces identical markup on server and client
- [ ] `bun run typecheck` passes

---

## Phase 5: Layout as Component Composition

### Goal

Route layout slots (`header`, `sidebar`, `main`, `footer`) can be filled with arbitrary
component arrays from the manifest. Any component can go in any slot.

### Current State

This partially works — `routeConfigSchema` already has `slots: z.record(z.array(componentConfigSchema))`.
The rendering code in `AppShell` reads route slots and renders them. But:

1. Parent route slots don't compose with child route content (fixed in Phase 4)
2. The global nav is auto-injected — there's no way to replace it with custom components
3. Inner layout slots for parent routes need to come from the parent's `slots` config

### Changes

After Phase 4, this mostly works. The remaining gap is allowing routes to override the
nav area itself. Add a `nav` slot to the built-in slot list:

```typescript
// In getBuiltInLayoutSlots:
function getBuiltInLayoutSlots(type: string): RouteLayoutSlotDeclaration[] {
  if (!SLOT_ENABLED_LAYOUT_TYPES.has(type)) return [];
  return [
    { name: "nav" }, // ← NEW: override the nav area
    { name: "header" },
    { name: "sidebar" },
    { name: "main", required: true },
    { name: "footer" },
  ];
}
```

When a route provides a `nav` slot, it replaces the auto-generated nav:

```typescript
const navSlotContent = slotContent?.["nav"];
const navNode = navSlotContent
  ? navSlotContent  // User-provided nav content
  : (navConfig && (layoutType === "sidebar" || layoutType === "top-nav")
    ? <Nav config={navConfig} pathname={currentPath} onNavigate={(path) => navigate(path)} variant={layoutType} />
    : undefined);
```

### Consumer Example

Custom nav via slot override:

```jsonc
{
  "routes": [
    {
      "id": "landing",
      "path": "/",
      "layouts": ["top-nav"],
      "slots": {
        "nav": [
          {
            "type": "row",
            "alignItems": "center",
            "gap": "lg",
            "padding": "md",
            "children": [
              { "type": "nav-logo" },
              { "type": "spacer" },
              {
                "type": "button",
                "label": "Sign In",
                "variant": "outline",
                "action": { "type": "navigate", "path": "/login" },
              },
              {
                "type": "button",
                "label": "Get Started",
                "action": { "type": "navigate", "path": "/register" },
              },
            ],
          },
        ],
      },
      "content": [
        { "type": "section", "height": "screen", "children": ["..."] },
      ],
    },
  ],
}
```

### Exit Criteria

- [ ] Route `slots.nav` overrides auto-generated nav
- [ ] Any component can be placed in any slot
- [ ] Slots compose correctly across nested layouts (Phase 4)
- [ ] SSR: slot content renders identically on server and client
- [ ] `bun run typecheck` passes

---

## Phase 6: Discriminated Union Schema (Intellisense)

### Goal

The generated JSON Schema uses a discriminated union on the `type` field so VSCode shows
component-specific properties when you set `"type": "data-table"`.

### Current State

`zodToJsonSchema` can't see through the passthrough validator used for the component
registry. The post-processing in `generate-manifest-schema.ts` injects icon/type enums
but doesn't create per-component discriminated unions.

### Implementation

In `scripts/generate-manifest-schema.ts`, after generating the base schema, build a
discriminated union from the component registry:

```typescript
// After walk(rawSchema):

// Build discriminated union for component configs
const registeredSchemas = getRegisteredSchemas();
const componentSchemas: Record<string, unknown>[] = [];

for (const [typeName, zodSchema] of registeredSchemas) {
  try {
    const componentJsonSchema = zodToJsonSchema(zodSchema, {
      $refStrategy: "none", // Inline everything for component schemas
      errorMessages: false,
    }) as Record<string, unknown>;

    // Ensure the type field is a const
    if (
      componentJsonSchema.properties &&
      typeof componentJsonSchema.properties === "object"
    ) {
      (componentJsonSchema.properties as Record<string, unknown>)["type"] = {
        const: typeName,
      };
    }

    componentSchemas.push(componentJsonSchema);
  } catch {
    // Skip components whose schemas can't be converted
  }
}

// Create the discriminated union
const componentConfigUnion = {
  oneOf: componentSchemas,
  discriminator: { propertyName: "type" },
};

// Replace all occurrences of the generic component config with the union
function replaceComponentConfigs(node: unknown): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(replaceComponentConfigs);
    return;
  }
  const obj = node as Record<string, unknown>;

  // Find properties that look like component config arrays
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const prop = value as Record<string, unknown>;
      // Array of components (content, children, items, template)
      if (
        prop.type === "array" &&
        prop.items &&
        typeof prop.items === "object"
      ) {
        const items = prop.items as Record<string, unknown>;
        // If items is a generic object or has passthrough, replace with union
        if (items.type === "object" && !items.oneOf && !items.discriminator) {
          // Check if this looks like a component config array
          if (["content", "children", "items", "template"].includes(key)) {
            prop.items = componentConfigUnion;
          }
        }
      }
      replaceComponentConfigs(value);
    }
  }
}

replaceComponentConfigs(rawSchema);
```

### Consumer Experience

In VSCode with the JSON Schema applied:

1. Type `"type": "` → autocomplete shows all 80+ component types
2. Select `"data-table"` → intellisense shows `data`, `columns`, `searchable`, `pagination`, etc.
3. Select `"button"` → intellisense shows `label`, `variant`, `action`, `icon`, etc.
4. Select `"nav-dropdown"` → intellisense shows `label`, `icon`, `trigger`, `items`, etc.
5. Universal style props (`padding`, `bg`, `shadow`, `hover`, `focus`, `active`, etc.) show on every component
6. Responsive props show the breakpoint map option alongside the simple value
7. `hover`, `focus`, `active` objects show their available sub-properties

### TypeScript Manifest Support

For consumers using TypeScript manifest objects (`createSnapshot({ manifest: { ... } })`),
the discriminated union is also available as a TypeScript type:

```typescript
// Auto-generated from the same registry
export type ComponentConfig =
  | {
      type: "button";
      label: string;
      variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
      action?: ActionConfig; /* ...base props */
    }
  | {
      type: "data-table";
      data: DataConfig;
      columns: ColumnConfig[];
      searchable?: boolean; /* ...base props */
    }
  | {
      type: "box";
      as?: string;
      children?: ComponentConfig[]; /* ...base props */
    };
// ... all 80+ types
```

This is generated alongside the JSON Schema by extracting `z.infer<>` from each registered
schema. Consumers get full type safety whether they write JSON or TypeScript.

### Files to Modify

| File                                  | Change                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| `scripts/generate-manifest-schema.ts` | Build discriminated union from registry, replace generic configs |

### Exit Criteria

- [ ] VSCode shows component-specific properties after selecting `type`
- [ ] All 80+ component types appear in type autocomplete
- [ ] Universal style props appear alongside component-specific props
- [ ] Icon enum still works on `icon` fields
- [ ] Schema validates valid manifests and rejects invalid ones
- [ ] `bun run build` generates valid schema

---

## Phase 7: Component Groups (Prepackaged Screens)

### Goal

Named, reusable bundles of components that can be referenced anywhere in the manifest.
Define once, use many times. Like presets but at the component level, not the page level.

### Schema

Add `componentGroups` to manifest config:

```typescript
// In manifestConfigSchema:
componentGroups: z.record(
  z.object({
    /** Description for intellisense. */
    description: z.string().optional(),
    /** The component configs that make up this group. */
    components: z.array(componentConfigSchema).min(1),
  }).strict(),
).optional(),
```

Add `component-group` as a built-in component type:

```typescript
// src/ui/components/_base/component-group/schema.ts
export const componentGroupConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("component-group"),
  /** Name of the group to render (references manifest.componentGroups). */
  group: z.string(),
  /** Override props passed to each component in the group. */
  overrides: z.record(z.record(z.unknown())).optional(),
});
```

### Runtime

`component-group` reads the group definition from the manifest runtime context and
renders each component via `ComponentRenderer`:

```typescript
export function ComponentGroup({ config }: { config: ComponentGroupConfig }) {
  const manifest = useManifestRuntime();
  const group = manifest?.raw?.componentGroups?.[config.group];
  if (!group) return null;

  return (
    <>
      {group.components.map((componentConfig, i) => {
        const overrides = config.overrides?.[componentConfig.id ?? ""] ?? {};
        const merged = { ...componentConfig, ...overrides };
        return <ComponentRenderer key={merged.id ?? i} config={merged} />;
      })}
    </>
  );
}
```

### Consumer Example

```jsonc
{
  "componentGroups": {
    "finance-stats": {
      "description": "Standard financial dashboard stats row",
      "components": [
        {
          "type": "stat-card",
          "id": "balance",
          "data": { "resource": "account-balance" },
          "span": 3,
        },
        {
          "type": "stat-card",
          "id": "income",
          "data": { "resource": "monthly-income" },
          "span": 3,
        },
        {
          "type": "stat-card",
          "id": "expenses",
          "data": { "resource": "monthly-expenses" },
          "span": 3,
        },
        {
          "type": "stat-card",
          "id": "savings",
          "data": { "resource": "savings-rate" },
          "span": 3,
        },
      ],
    },
    "settings-header": {
      "components": [
        { "type": "heading", "text": "Settings", "level": 1 },
        {
          "type": "text",
          "value": "Manage your account preferences.",
          "color": "muted-foreground",
        },
      ],
    },
  },
  "routes": [
    {
      "id": "dashboard",
      "path": "/",
      "content": [
        { "type": "component-group", "group": "finance-stats" },
        {
          "type": "chart",
          "variant": "line",
          "data": { "resource": "spending-trend" },
        },
      ],
    },
    {
      "id": "settings",
      "path": "/settings",
      "content": [
        { "type": "component-group", "group": "settings-header" },
        { "type": "auto-form", "fields": ["..."] },
      ],
    },
  ],
}
```

### Files to Create

| File                                                    | Purpose          |
| ------------------------------------------------------- | ---------------- |
| `src/ui/components/_base/component-group/schema.ts`     | Schema           |
| `src/ui/components/_base/component-group/component.tsx` | Runtime renderer |
| `src/ui/components/_base/component-group/types.ts`      | Types            |
| `src/ui/components/_base/component-group/index.ts`      | Exports          |

### Files to Modify

| File                            | Change                                          |
| ------------------------------- | ----------------------------------------------- |
| `src/ui/manifest/schema.ts`     | Add `componentGroups` to `manifestConfigSchema` |
| `src/ui/components/register.ts` | Register `component-group`                      |

### Exit Criteria

- [ ] `componentGroups` defines named component bundles in manifest
- [ ] `{ "type": "component-group", "group": "name" }` renders the bundle inline
- [ ] Overrides allow per-instance customization of group components
- [ ] Groups can be nested (a group can contain a `component-group` reference)
- [ ] Groups appear in JSON Schema intellisense
- [ ] `bun run typecheck` passes

---

## Phase 8: CSS Baseline & Animation Wiring

### Goal

Wire up the CSS baseline, keyframe animations, and framework styles so components render
correctly out of the box without external CSS.

### Current State

- `resolveTokens()` generates CSS custom properties and some keyframes
- `resolveFrameworkStyles()` generates component CSS selectors
- 6 keyframes defined: `sn-fade`, `sn-fade-up`, `sn-fade-down`, `sn-slide-left`,
  `sn-slide-right`, `sn-scale`
- `ComponentWrapper` has animation resolution code in `_base/schema.ts`
- But the keyframes may not be injected into the page consistently

### Implementation

#### 8.1: CSS Reset

Add to `resolveFrameworkStyles()`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-family: var(--sn-font-sans, system-ui, sans-serif);
  line-height: 1.5;
}
body {
  min-height: 100vh;
  line-height: inherit;
  -webkit-font-smoothing: antialiased;
}
img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}
input,
button,
textarea,
select {
  font: inherit;
}
p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}
#root {
  isolation: isolate;
}
```

#### 8.2: Ensure Keyframes Are Always Present

The keyframes must be in the framework styles CSS that's always injected, not conditionally.
Verify that `ManifestApp` calls `injectStyleSheet` with both `resolveTokens()` AND
`resolveFrameworkStyles()` on mount.

#### 8.3: Add Missing Keyframes

```css
@keyframes sn-bounce {
  0%,
  100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-8px);
  }
}
```

#### 8.4: Exit Animations & Show/Hide Transitions

Components need to animate OUT as well as in. Currently, `animation` on `baseComponentConfigSchema`
handles entrance animations. We need exit animations for when components are conditionally
hidden (e.g., collapsible closing, component visibility toggling).

**Schema addition to `baseComponentConfigSchema`:**

```typescript
/** Exit animation when component is hidden/removed. */
exitAnimation: z.object({
  /** Keyframe preset or custom name. */
  preset: z.enum(["fade", "fade-up", "fade-down", "slide-left", "slide-right", "scale"]).optional(),
  /** Duration token. Default: "fast". */
  duration: z.enum(["instant", "fast", "normal", "slow"]).optional(),
}).optional(),

/** Conditional visibility. Component renders but may be hidden with animation. */
visible: z.union([z.boolean(), fromRefSchema, z.object({ expr: z.string() })]).optional(),
```

**Implementation in `ComponentWrapper`:**

When `visible` is `false` (or resolves to `false` from a `FromRef`/expression):

1. If `exitAnimation` is set, play the exit animation
2. After the exit animation completes, set `display: none`
3. When `visible` becomes `true` again, remove `display: none` and play the entrance `animation`

```typescript
// In component-wrapper.tsx:
const isVisible = resolveVisibility(config.visible); // handles boolean, FromRef, expression
const [shouldRender, setShouldRender] = useState(isVisible !== false);
const [isAnimatingOut, setIsAnimatingOut] = useState(false);

useEffect(() => {
  if (isVisible === false && shouldRender) {
    if (config.exitAnimation) {
      setIsAnimatingOut(true);
      const duration =
        DURATION_MAP[config.exitAnimation.duration ?? "fast"] ?? 150;
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  } else if (isVisible !== false && !shouldRender) {
    setShouldRender(true);
  }
}, [isVisible]);
```

This is SSR-safe: on server render, `visible: false` components render with `display: none`
(no animation). On the client, `useEffect` handles the animation lifecycle.

**Consumer Example — search bar that slides in/out:**

```jsonc
{
  "type": "input",
  "placeholder": "Search...",
  "visible": { "from": "searchOpen" },
  "animation": { "preset": "slide-right", "duration": "fast" },
  "exitAnimation": { "preset": "slide-right", "duration": "fast" },
  "maxWidth": "300px",
}
```

**Consumer Example — notification toast that fades:**

```jsonc
{
  "type": "box",
  "visible": { "from": "showToast" },
  "animation": { "preset": "fade-up" },
  "exitAnimation": { "preset": "fade", "duration": "fast" },
  "position": "fixed",
  "inset": "auto 1rem 1rem auto",
  "bg": "success",
  "color": "success-foreground",
  "padding": "md",
  "borderRadius": "lg",
  "shadow": "lg",
  "children": [{ "type": "text", "value": "Saved!" }],
}
```

#### 8.5: Dark Mode Class Toggle

`DarkModeManager` already exists in `app.tsx` and manages `.dark` class on `<html>`.
Verify `resolveTokens()` generates `.dark { ... }` block with dark mode token overrides.

### Files to Modify

| File                                            | Change                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| `src/ui/tokens/resolve.ts`                      | Add CSS reset to `resolveFrameworkStyles()`, add `sn-bounce` keyframe |
| `src/ui/components/_base/schema.ts`             | Add `exitAnimation` and `visible` to `baseComponentConfigSchema`      |
| `src/ui/components/_base/component-wrapper.tsx` | Add exit animation + visibility lifecycle logic                       |
| `src/ui/manifest/app.tsx`                       | Verify framework styles injection on mount                            |

### Exit Criteria

- [ ] Fresh app with no external CSS renders with correct box-sizing, fonts, spacing
- [ ] All 7 animation presets work: fade, fade-up, fade-down, slide-left, slide-right, scale, bounce
- [ ] Stagger animation works on row/stack/grid children
- [ ] Exit animations play when `visible` transitions from true → false
- [ ] Entrance animations play when `visible` transitions from false → true
- [ ] `visible` prop works with static boolean, FromRef, and expression values
- [ ] SSR: `visible: false` components render with `display: none` (no flash)
- [ ] Dark mode toggles via `set-theme` action
- [ ] SSR: CSS reset + keyframes + token vars all present in server-rendered `<style>`
- [ ] `bun run typecheck` passes

---

## Phase 9: Consumer Extension API (Plugins)

### Goal

Consuming apps can extend Snapshot's component library with their own components,
component groups, and presets — all of which integrate with the manifest, intellisense,
and runtime rendering. No fork required. No framework internals exposed.

### The Problem

Today, the raw registration functions (`registerComponent`, `registerComponentSchema`)
are exported, and a consumer _can_ call them before `createSnapshot()`. But:

1. **No formal shape** — consumers have to know to call two separate functions in the
   right order. Easy to forget the schema, break intellisense, or register after init.
2. **No intellisense for custom components** — the JSON Schema generator only sees
   built-in schemas. Custom components show as unknown types in VSCode.
3. **No way to share plugins** — if a team builds a chart library for Snapshot, there's
   no standard package format. Every consumer reinvents the wiring.
4. **Component groups can't reference custom types** — `componentGroups` in the manifest
   can use custom types if registered, but the schema validation rejects them because
   the discriminated union doesn't include them.
5. **No lifecycle hooks** — plugins can't run setup logic (e.g., register a Jotai atom,
   add global state, wire up a third-party SDK) at app init time.

### Design

#### 9.1: `definePlugin()` — Plugin Definition

```typescript
// src/plugin.ts (NEW — top-level export)

import type { z } from "zod";
import type { ConfigDrivenComponent } from "./ui/manifest/types";
import type { ActionConfig } from "./ui/actions/types";

export interface SnapshotPluginComponent {
  /** The React component implementation. */
  component: ConfigDrivenComponent;
  /** Zod schema for manifest validation + intellisense. */
  schema: z.ZodType;
}

export interface SnapshotPlugin {
  /** Unique plugin name. Used for debug logging and conflict detection. */
  name: string;
  /** Custom components to register. Key = type name used in manifest. */
  components?: Record<string, SnapshotPluginComponent>;
  /**
   * Component groups that ship with this plugin.
   * Merged into manifest.componentGroups at runtime.
   * Consumer manifest groups take precedence on name collision.
   */
  componentGroups?: Record<
    string,
    {
      description?: string;
      components: Record<string, unknown>[];
    }
  >;
  /**
   * Called once during createSnapshot(), after all components are registered.
   * Use for: initializing global state atoms, wiring third-party SDKs,
   * registering workflow actions, etc.
   */
  setup?: (context: PluginSetupContext) => void | Promise<void>;
}

export interface PluginSetupContext {
  /** The compiled manifest (read-only). */
  manifest: CompiledManifest;
  /** Register a custom workflow action type. */
  registerWorkflowAction: (
    type: string,
    handler: WorkflowActionHandler,
  ) => void;
  /** Register a custom route guard. */
  registerGuard: (name: string, guard: GuardFunction) => void;
  /** Publish a value to the global state registry. */
  setGlobalState: (key: string, value: unknown) => void;
}

export function definePlugin(plugin: SnapshotPlugin): SnapshotPlugin {
  return plugin; // Identity function — exists for type inference + discoverability
}
```

#### 9.2: `createSnapshot` Integration

```typescript
// In src/create-snapshot.tsx, add `plugins` option:

export interface SnapshotConfig {
  manifest: ManifestConfig;
  apiUrl: string;
  env?: Record<string, string>;
  bearerToken?: string | (() => string | null);
  /** Plugins that extend the component library. */
  plugins?: SnapshotPlugin[];
}

// In the createSnapshot() function, after bootBuiltins():
function createSnapshot(config: SnapshotConfig) {
  bootBuiltins();

  // Register plugin components
  if (config.plugins) {
    for (const plugin of config.plugins) {
      if (plugin.components) {
        for (const [type, def] of Object.entries(plugin.components)) {
          registerComponent(type, def.component);
          registerComponentSchema(type, def.schema);
        }
      }
    }
  }

  // Compile manifest (now sees plugin component types as valid)
  const compiled = compileManifest(config.manifest, config.env);

  // Merge plugin component groups into manifest
  if (config.plugins) {
    for (const plugin of config.plugins) {
      if (plugin.componentGroups) {
        for (const [name, group] of Object.entries(plugin.componentGroups)) {
          // Consumer manifest groups win on collision
          if (!compiled.raw.componentGroups?.[name]) {
            compiled.raw.componentGroups ??= {};
            compiled.raw.componentGroups[name] = group;
          }
        }
      }
    }
  }

  // Run plugin setup hooks
  if (config.plugins) {
    const setupContext: PluginSetupContext = {
      manifest: compiled,
      registerWorkflowAction,
      registerGuard,
      setGlobalState: (key, value) => globalRegistry.set(key, value),
    };
    for (const plugin of config.plugins) {
      if (plugin.setup) {
        const result = plugin.setup(setupContext);
        // If setup returns a promise, warn — plugins should be sync where possible
        if (result instanceof Promise) {
          result.catch((err) =>
            console.error(
              `[snapshot] Plugin "${plugin.name}" setup failed:`,
              err,
            ),
          );
        }
      }
    }
  }

  // ...rest of createSnapshot
}
```

#### 9.3: Schema Generation for Custom Components

The JSON Schema generator needs to accept external plugin schemas so custom component
types appear in the discriminated union. Two approaches:

**Approach A: Build-time plugin registration (recommended)**

Consumer apps run a schema generation script that imports their plugins:

```typescript
// Consumer: scripts/generate-schema.ts
import { generateManifestSchema } from "@lastshotlabs/snapshot/schema";
import { chartPlugin } from "../src/plugins/charts";
import { analyticsPlugin } from "../src/plugins/analytics";

generateManifestSchema({
  plugins: [chartPlugin, analyticsPlugin],
  outPath: "./snapshot-schema.json",
});
```

This calls into the same `zodToJsonSchema` pipeline but includes plugin schemas in
the discriminated union.

**Implementation in Snapshot:**

```typescript
// src/schema-generator.ts (NEW — top-level export for build tools)

export function generateManifestSchema(options: {
  plugins?: SnapshotPlugin[];
  outPath: string;
}) {
  registerBuiltInComponents();

  // Register plugin schemas
  if (options.plugins) {
    for (const plugin of options.plugins) {
      if (plugin.components) {
        for (const [type, def] of Object.entries(plugin.components)) {
          registerComponentSchema(type, def.schema);
        }
      }
    }
  }

  // Now generate schema — getRegisteredSchemas() includes plugin types
  const rawSchema = zodToJsonSchema(manifestConfigSchema, {
    $refStrategy: "root",
    errorMessages: false,
  });

  // ...same post-processing as existing generate-manifest-schema.ts...
  // The discriminated union now includes plugin component schemas

  writeFileSync(options.outPath, JSON.stringify(rawSchema, null, 2));
}
```

**Consumer's `package.json`:**

```json
{
  "scripts": {
    "generate-schema": "bun run scripts/generate-schema.ts"
  }
}
```

**Consumer's `.vscode/settings.json`:**

```json
{
  "json.schemas": [
    {
      "fileMatch": ["snapshot.manifest.json"],
      "url": "./snapshot-schema.json"
    }
  ]
}
```

Now typing `"type": "` in the manifest shows `"revenue-chart"`, `"funnel-chart"`,
etc. alongside all built-in types, with full property intellisense.

#### 9.4: TypeScript Manifest with Plugin Types

For consumers using TypeScript manifests, plugins contribute to the component config
discriminated union type:

```typescript
// Consumer app:
import { createTypedManifest } from "@lastshotlabs/snapshot";
import type { chartPlugin } from "./plugins/charts";

// The manifest helper is generic over plugins:
const manifest = createTypedManifest<[typeof chartPlugin]>({
  routes: [
    {
      content: [
        { type: "revenue-chart", data: { resource: "revenue" } },
        //       ^ autocomplete works, shows plugin component props
      ],
    },
  ],
});
```

Implementation uses conditional types to merge plugin component schemas into the
base `ComponentConfig` union:

```typescript
// src/types.ts
type ExtractPluginComponents<P extends SnapshotPlugin> = P extends {
  components: infer C;
}
  ? {
      [K in keyof C]: C[K] extends { schema: z.ZodType<infer T> }
        ? T & { type: K }
        : never;
    }[keyof C]
  : never;

type ComponentConfigWithPlugins<Plugins extends SnapshotPlugin[]> =
  | BaseComponentConfig
  | ExtractPluginComponents<Plugins[number]>;
```

### Consumer Example — Full Plugin

```typescript
// @acme/snapshot-charts/index.ts
import { definePlugin } from "@lastshotlabs/snapshot";
import { z } from "zod";
import { baseComponentConfigSchema } from "@lastshotlabs/snapshot/ui";
import { RevenueChart } from "./components/RevenueChart";
import { FunnelChart } from "./components/FunnelChart";
import { KPIGrid } from "./components/KPIGrid";

const revenueChartSchema = baseComponentConfigSchema.extend({
  type: z.literal("revenue-chart"),
  data: z.object({ resource: z.string() }),
  height: z.string().optional(),
  showLegend: z.boolean().optional(),
  period: z.enum(["day", "week", "month", "quarter", "year"]).optional(),
});

const funnelChartSchema = baseComponentConfigSchema.extend({
  type: z.literal("funnel-chart"),
  data: z.object({ resource: z.string() }),
  height: z.string().optional(),
  colorScale: z.array(z.string()).optional(),
});

const kpiGridSchema = baseComponentConfigSchema.extend({
  type: z.literal("kpi-grid"),
  metrics: z.array(
    z.object({
      label: z.string(),
      resource: z.string(),
      format: z.enum(["number", "currency", "percent"]).optional(),
    }),
  ),
  columns: z.number().optional(),
});

export const chartPlugin = definePlugin({
  name: "@acme/charts",
  components: {
    "revenue-chart": { component: RevenueChart, schema: revenueChartSchema },
    "funnel-chart": { component: FunnelChart, schema: funnelChartSchema },
    "kpi-grid": { component: KPIGrid, schema: kpiGridSchema },
  },
  componentGroups: {
    "executive-dashboard": {
      description: "Standard C-suite KPI overview",
      components: [
        {
          type: "kpi-grid",
          metrics: [
            { label: "Revenue", resource: "total-revenue", format: "currency" },
            { label: "Users", resource: "active-users", format: "number" },
            { label: "Churn", resource: "churn-rate", format: "percent" },
          ],
        },
        {
          type: "revenue-chart",
          data: { resource: "revenue-trend" },
          height: "300px",
        },
        {
          type: "funnel-chart",
          data: { resource: "conversion-funnel" },
          height: "250px",
        },
      ],
    },
  },
  setup(ctx) {
    // Wire up real-time chart data via WebSocket
    ctx.setGlobalState("charts.wsConnected", false);
  },
});
```

**Consumer app usage:**

```typescript
// main.ts
import { createSnapshot } from "@lastshotlabs/snapshot";
import { chartPlugin } from "@acme/snapshot-charts";
import manifest from "./snapshot.manifest.json";

const app = createSnapshot({
  manifest,
  apiUrl: "/api",
  plugins: [chartPlugin],
});
```

**Consumer manifest:**

```jsonc
{
  "routes": [
    {
      "id": "dashboard",
      "path": "/",
      "content": [
        { "type": "component-group", "group": "executive-dashboard" },
        {
          "type": "revenue-chart",
          "data": { "resource": "monthly-revenue" },
          "height": "400px",
          "showLegend": true,
          "period": "month",
          "padding": "lg",
          "borderRadius": "lg",
          "bg": "card",
          "shadow": "md",
        },
      ],
    },
  ],
}
```

Note: the plugin's `revenue-chart` gets **all universal style props** for free because
it extends `baseComponentConfigSchema`. `padding`, `bg`, `hover`, `animation` — all work.

### SSR Consideration

Plugin components follow the same SSR rules as built-in components:

- `'use client'` directive on all component files
- No browser APIs during render
- Plugin `setup()` runs on the client only (inside `createSnapshot` which runs client-side)
- For SSR scenarios, plugin registration (component + schema) happens at module load
  time (top-level side effect), so server renders can resolve plugin component types

### Files to Create

| File                      | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `src/plugin.ts`           | `definePlugin()`, `SnapshotPlugin` type, `PluginSetupContext` type |
| `src/schema-generator.ts` | `generateManifestSchema()` for build-time schema gen with plugins  |

### Files to Modify

| File                                  | Change                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| `src/create-snapshot.tsx`             | Add `plugins` option, register plugin components/groups/setup     |
| `src/index.ts`                        | Export `definePlugin`, `SnapshotPlugin`, `generateManifestSchema` |
| `scripts/generate-manifest-schema.ts` | Refactor to use shared `generateManifestSchema()`                 |

### Exit Criteria

- [ ] `definePlugin()` returns a typed plugin object
- [ ] `createSnapshot({ plugins: [myPlugin] })` registers plugin components at init
- [ ] Plugin components render in the manifest via `{ "type": "custom-type" }`
- [ ] Plugin component groups merge into manifest component groups
- [ ] Plugin `setup()` runs after component registration, receives context
- [ ] `generateManifestSchema({ plugins })` includes plugin types in discriminated union
- [ ] VSCode intellisense shows plugin component properties after selecting type
- [ ] Plugin components inherit all universal style props (padding, hover, animation, etc.)
- [ ] Plugin name collisions with built-in types log a dev warning
- [ ] SSR: Plugin components render identically on server and client
- [ ] `bun run typecheck` passes

---

## Parallelization & Sequencing

### Track Overview

| Track                | Phases | Key Files                                                                                                |
| -------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| **Schema + Wrapper** | 1, 8   | `_base/schema.ts`, `_base/style-props.ts`, `_base/component-wrapper.tsx`, `tokens/resolve.ts`            |
| **Primitives**       | 2      | `layout/box/`, `layout/collapsible/`, `forms/icon-button/`, `overlay/hover-card/`, `forms/toggle-group/` |
| **Nav Components**   | 3      | `layout/nav-*/`, `manifest/schema.ts`, `register.ts`                                                     |
| **Router + Shell**   | 4, 5   | `manifest/app.tsx`                                                                                       |
| **Schema Gen**       | 6      | `scripts/generate-manifest-schema.ts`                                                                    |
| **Component Groups** | 7      | `_base/component-group/`, `manifest/schema.ts`                                                           |
| **Plugin System**    | 9      | `src/plugin.ts`, `src/schema-generator.ts`, `src/create-snapshot.tsx`                                    |

### Dependencies

```
Phase 1 (Style Props) ─────────────────┐
                                        ├─→ Phase 2 (Missing Primitives use style props)
Phase 8 (CSS Baseline) ────────────────┤
                                        ├─→ Phase 3 (Nav Components use style props + primitives)
Phase 2 (Missing Primitives) ──────────┤
                                        ├─→ Phase 4 (Nested Layouts — independent but benefits from style props)
Phase 4 (Nested Layouts) ──────────────┤
                                        └─→ Phase 5 (Layout Composition — depends on Phase 4)
Phase 6 (Schema Intellisense) ─────────── Independent, run after Phases 1–3 for full coverage
Phase 7 (Component Groups) ────────────── Independent, can run any time after Phase 1
Phase 9 (Plugin System) ───────────────── Depends on Phases 6 + 7 (needs discriminated unions + component groups)
```

**Recommended order:** 1 → 8 → 2 → 3 → 4 → 5 → 6 → 7 → 9

Phases 1 and 8 can run in parallel (different files).
Phases 6 and 7 can run in parallel (different files).
Phase 9 runs last — it builds on the schema gen (Phase 6) and component group (Phase 7) systems.

### Branch Strategy

Single branch: `declarative-composability`

Each phase is a separate commit. Build must pass after each commit.

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` and `docs/specs/declarative-composability.md`
2. Phase 1: Create `style-props.ts`, update base schema, update ComponentWrapper
3. Phase 8: Update `resolveFrameworkStyles()` with reset + keyframes + exit animations
4. Phase 2: Create 5 missing primitive components (`box`, `collapsible`, `icon-button`, `hover-card`, `toggle-group`), register all
5. Phase 3: Create 6 nav sub-components, update nav schema with `template`, register
6. Phase 4: Rewrite AppShell to compose parent layouts from `match.parents`
7. Phase 5: Add `nav` slot, update slot rendering
8. Phase 6: Update schema generation with discriminated unions
9. Phase 7: Create `component-group` component, add `componentGroups` to manifest schema
10. Phase 9: Create `plugin.ts`, `schema-generator.ts`, add `plugins` to `createSnapshot`
11. Run `bun run typecheck && bun run build` after each phase
12. Final: `bun run typecheck && bun run format:check && bun run build && bun test`
13. Verify with budget-fe: `cd ../budget-fe && bun run dev` — confirm manifest renders correctly

---

## Definition of Done

### Functional Requirements

- [ ] **Style Props:** Every component accepts `padding`, `bg`, `shadow`, `borderRadius`, etc.
      with token resolution. Raw CSS values pass through.
- [ ] **Interactive States:** `hover`, `focus`, `active` props generate scoped CSS on any component
- [ ] **Responsive Props:** Breakpoint maps on spacing/layout/font props generate media queries
- [ ] **Missing Primitives:** `box`, `collapsible`, `icon-button`, `hover-card`, `toggle-group`
      registered and functional
- [ ] **Composable Nav:** `navigation.template` renders arbitrary component composition
- [ ] **Nav Sub-Components:** `nav-logo`, `nav-link`, `nav-dropdown`, `nav-section`,
      `nav-search`, `nav-user-menu` registered and functional
- [ ] **Nested Layouts:** Parent route layouts persist, child content fills main slot.
      3+ levels deep.
- [ ] **Layout Slots:** Any component can fill any layout slot, including `nav` override
- [ ] **Intellisense:** JSON Schema shows per-component props based on `type` discriminated union
- [ ] **Component Groups:** Named component bundles defined once, used anywhere, with overrides
- [ ] **CSS Baseline:** Reset, keyframes, dark mode all working out of the box
- [ ] **Entrance Animations:** All 7 presets + stagger work (fade, fade-up, fade-down,
      slide-left, slide-right, scale, bounce)
- [ ] **Exit Animations:** Components animate out when `visible` transitions to false
- [ ] **Conditional Visibility:** `visible` prop with boolean, FromRef, and expression support
- [ ] **Plugin System:** `definePlugin()` + `createSnapshot({ plugins })` registers custom
      components, groups, and setup hooks
- [ ] **Plugin Intellisense:** `generateManifestSchema({ plugins })` includes custom types
      in discriminated union schema

### Quality Requirements

- [ ] **88+ components** registered (76 existing + 5 primitives + 6 nav + component-group)
- [ ] **Zero TypeScript errors:** `bun run typecheck` passes
- [ ] **Build passes:** `bun run build` succeeds
- [ ] **Schema valid:** Generated schema provides full discriminated-union intellisense in VSCode
- [ ] **Budget-FE works:** The budget app manifest renders correctly with all changes
- [ ] **SSR-safe:** Every component renders identically on server and client. No hydration
      mismatch warnings. No browser API calls during render. No layout shift on hydration.
- [ ] **No regressions:** Existing manifests (budget-fe) render without changes

### The Litmus Test

> Can you build a beautiful, fully custom navbar — with logo, links, dropdowns,
> collapsible search, user menu, hover effects, responsive layout — using ONLY
> `row`, `box`, `link`, `button`, `input`, `popover`, `collapsible`, `spacer`,
> `avatar`, `divider`, and style props?
>
> If the answer is no, the primitives are incomplete.

The nav-specific components (`nav-logo`, `nav-link`, etc.) are convenience sugar.
Every UI pattern they enable MUST also be achievable with primitives alone.

---

## Appendix A: Complex Consumer Examples

### A.1: SaaS Dashboard with Nested Settings

Full application manifest demonstrating nested layouts, composable nav, slot overrides,
component groups, interactive states, and responsive layout:

```jsonc
{
  "$schema": "./snapshot-schema.json",
  "app": { "title": "Acme SaaS", "home": "/" },
  "theme": { "flavor": "zinc", "fonts": { "sans": "Inter" } },
  "componentGroups": {
    "page-header": {
      "components": [
        {
          "type": "row",
          "alignItems": "center",
          "justifyContent": "between",
          "marginY": "lg",
          "children": [
            {
              "type": "heading",
              "id": "page-title",
              "text": "Page",
              "level": 1,
            },
            {
              "type": "row",
              "gap": "sm",
              "id": "page-actions",
              "children": [],
            },
          ],
        },
      ],
    },
  },
  "navigation": {
    "mode": "top-nav",
    "template": [
      {
        "type": "nav-logo",
        "text": "Acme",
        "path": "/",
        "fontWeight": "bold",
        "fontSize": "lg",
      },
      {
        "type": "nav-link",
        "label": "Dashboard",
        "path": "/",
        "icon": "LayoutDashboard",
      },
      {
        "type": "nav-link",
        "label": "Projects",
        "path": "/projects",
        "icon": "Folder",
      },
      {
        "type": "nav-dropdown",
        "label": "Admin",
        "icon": "Shield",
        "roles": ["admin"],
        "items": [
          {
            "type": "nav-link",
            "label": "Users",
            "path": "/admin/users",
            "icon": "Users",
          },
          {
            "type": "nav-link",
            "label": "Billing",
            "path": "/admin/billing",
            "icon": "CreditCard",
          },
          { "type": "divider" },
          {
            "type": "nav-link",
            "label": "Audit Log",
            "path": "/admin/audit",
            "icon": "FileText",
          },
        ],
      },
      { "type": "spacer" },
      {
        "type": "collapsible",
        "defaultOpen": false,
        "publishTo": "searchOpen",
        "trigger": {
          "type": "icon-button",
          "icon": "Search",
          "ariaLabel": "Search",
          "variant": "ghost",
        },
        "children": [
          {
            "type": "input",
            "placeholder": "Search...",
            "maxWidth": "240px",
            "padding": "sm",
          },
        ],
      },
      {
        "type": "icon-button",
        "icon": "Bell",
        "ariaLabel": "Notifications",
        "variant": "ghost",
        "hover": { "bg": "accent" },
        "badge": { "from": "global.unreadCount" },
      },
      { "type": "nav-user-menu", "mode": "compact" },
    ],
  },
  "routes": [
    {
      "id": "dashboard",
      "path": "/",
      "content": [
        {
          "type": "component-group",
          "group": "page-header",
          "overrides": { "page-title": { "text": "Dashboard" } },
        },
        {
          "type": "grid",
          "columns": 4,
          "gap": "lg",
          "children": [
            {
              "type": "stat-card",
              "data": { "resource": "total-revenue" },
              "span": 1,
            },
            {
              "type": "stat-card",
              "data": { "resource": "active-users" },
              "span": 1,
            },
            {
              "type": "stat-card",
              "data": { "resource": "conversion-rate" },
              "span": 1,
            },
            {
              "type": "stat-card",
              "data": { "resource": "avg-order" },
              "span": 1,
            },
          ],
        },
        {
          "type": "chart",
          "variant": "area",
          "data": { "resource": "revenue-trend" },
          "height": "300px",
        },
      ],
    },
    {
      "id": "settings",
      "path": "/settings",
      "layouts": [{ "type": "sidebar" }],
      "slots": {
        "sidebar": [
          {
            "type": "text",
            "value": "Settings",
            "fontWeight": "bold",
            "fontSize": "sm",
            "padding": "md",
            "color": "muted-foreground",
          },
          {
            "type": "nav-link",
            "label": "Profile",
            "path": "/settings/profile",
            "icon": "User",
          },
          {
            "type": "nav-link",
            "label": "Team",
            "path": "/settings/team",
            "icon": "Users",
          },
          {
            "type": "nav-link",
            "label": "Billing",
            "path": "/settings/billing",
            "icon": "CreditCard",
          },
          {
            "type": "nav-link",
            "label": "Integrations",
            "path": "/settings/integrations",
            "icon": "Plug",
          },
        ],
      },
      "content": [{ "type": "text", "value": "Select a settings page." }],
      "children": [
        {
          "id": "settings-profile",
          "path": "profile",
          "content": [
            {
              "type": "component-group",
              "group": "page-header",
              "overrides": { "page-title": { "text": "Profile" } },
            },
            { "type": "auto-form", "resource": "user-profile" },
          ],
        },
        {
          "id": "settings-team",
          "path": "team",
          "content": [
            {
              "type": "component-group",
              "group": "page-header",
              "overrides": {
                "page-title": { "text": "Team" },
                "page-actions": {
                  "children": [
                    {
                      "type": "button",
                      "label": "Invite Member",
                      "icon": "UserPlus",
                      "action": {
                        "type": "open-modal",
                        "modal": "invite-member",
                      },
                    },
                  ],
                },
              },
            },
            {
              "type": "data-table",
              "data": { "resource": "team-members" },
              "searchable": true,
            },
          ],
        },
      ],
    },
  ],
}
```

### A.2: Landing Page with Custom Nav (No Nav Components)

Proves the litmus test — a polished landing page built entirely from primitives:

```jsonc
{
  "app": { "title": "LaunchPad", "home": "/" },
  "theme": { "flavor": "slate" },
  "routes": [
    {
      "id": "landing",
      "path": "/",
      "layouts": ["full-width"],
      "slots": {
        "nav": [
          {
            "type": "row",
            "alignItems": "center",
            "gap": "lg",
            "padding": { "default": "sm", "md": "md" },
            "height": "4rem",
            "bg": "background",
            "shadow": "sm",
            "position": "sticky",
            "inset": "0 0 auto 0",
            "children": [
              {
                "type": "text",
                "value": "🚀 LaunchPad",
                "fontWeight": "bold",
                "fontSize": "xl",
              },
              {
                "type": "row",
                "gap": "md",
                "display": { "default": "none", "md": "flex" },
                "children": [
                  {
                    "type": "link",
                    "text": "Features",
                    "path": "#features",
                    "fontSize": "sm",
                    "hover": { "color": "primary" },
                  },
                  {
                    "type": "link",
                    "text": "Pricing",
                    "path": "#pricing",
                    "fontSize": "sm",
                    "hover": { "color": "primary" },
                  },
                  {
                    "type": "link",
                    "text": "Docs",
                    "path": "/docs",
                    "fontSize": "sm",
                    "hover": { "color": "primary" },
                  },
                ],
              },
              { "type": "spacer" },
              {
                "type": "button",
                "label": "Sign In",
                "variant": "ghost",
                "action": { "type": "navigate", "path": "/login" },
              },
              {
                "type": "button",
                "label": "Get Started",
                "bg": "primary",
                "color": "primary-foreground",
                "borderRadius": "full",
                "hover": { "shadow": "lg", "scale": 1.03 },
                "active": { "scale": 0.97 },
                "action": { "type": "navigate", "path": "/register" },
              },
            ],
          },
        ],
      },
      "content": [
        {
          "type": "box",
          "as": "section",
          "bg": {
            "gradient": {
              "type": "linear",
              "direction": "135deg",
              "stops": [
                { "color": "var(--sn-color-primary)", "position": "0%" },
                { "color": "var(--sn-color-accent)", "position": "100%" },
              ],
            },
          },
          "padding": { "default": "2xl", "lg": "3xl" },
          "minHeight": "80vh",
          "display": "flex",
          "flexDirection": "column",
          "alignItems": "center",
          "justifyContent": "center",
          "gap": "lg",
          "children": [
            {
              "type": "text",
              "value": "Ship 10x Faster",
              "fontSize": { "default": "3xl", "lg": "4xl" },
              "fontWeight": "bold",
              "color": "primary-foreground",
              "textAlign": "center",
              "animation": { "preset": "fade-up" },
            },
            {
              "type": "text",
              "value": "Build your entire frontend from a single manifest file.",
              "fontSize": { "default": "base", "md": "lg" },
              "color": "primary-foreground",
              "opacity": 0.85,
              "textAlign": "center",
              "animation": { "preset": "fade-up", "delay": 100 },
            },
            {
              "type": "row",
              "gap": "md",
              "animation": { "preset": "fade-up", "delay": 200 },
              "flexDirection": { "default": "column", "sm": "row" },
              "children": [
                {
                  "type": "button",
                  "label": "Start Free Trial",
                  "bg": "background",
                  "color": "foreground",
                  "borderRadius": "full",
                  "padding": "lg",
                  "hover": { "shadow": "xl", "scale": 1.05 },
                  "action": { "type": "navigate", "path": "/register" },
                },
                {
                  "type": "button",
                  "label": "Read the Docs",
                  "variant": "outline",
                  "borderRadius": "full",
                  "padding": "lg",
                  "color": "primary-foreground",
                  "border": "1px solid currentColor",
                  "hover": { "bg": "background", "color": "foreground" },
                  "action": { "type": "navigate", "path": "/docs" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

### A.3: E-Commerce Product Page with Responsive Grid

```jsonc
{
  "routes": [
    {
      "id": "product",
      "path": "/products/{productId}",
      "content": [
        {
          "type": "row",
          "flexDirection": { "default": "column", "lg": "row" },
          "gap": { "default": "lg", "lg": "2xl" },
          "padding": { "default": "md", "lg": "xl" },
          "children": [
            {
              "type": "box",
              "flex": "1",
              "children": [
                {
                  "type": "image",
                  "src": { "from": "product.image" },
                  "borderRadius": "lg",
                  "hover": { "scale": 1.02 },
                },
                {
                  "type": "row",
                  "gap": "sm",
                  "marginY": "md",
                  "children": [
                    {
                      "type": "image",
                      "src": { "from": "product.thumbnails[0]" },
                      "width": "80px",
                      "borderRadius": "md",
                      "cursor": "pointer",
                      "hover": {
                        "border": "2px solid var(--sn-color-primary)",
                      },
                    },
                    {
                      "type": "image",
                      "src": { "from": "product.thumbnails[1]" },
                      "width": "80px",
                      "borderRadius": "md",
                      "cursor": "pointer",
                      "hover": {
                        "border": "2px solid var(--sn-color-primary)",
                      },
                    },
                  ],
                },
              ],
            },
            {
              "type": "box",
              "flex": "1",
              "children": [
                {
                  "type": "text",
                  "value": { "from": "product.name" },
                  "fontSize": "2xl",
                  "fontWeight": "bold",
                },
                {
                  "type": "text",
                  "value": { "from": "product.price", "transform": "currency" },
                  "fontSize": "xl",
                  "color": "primary",
                  "marginY": "sm",
                },
                {
                  "type": "text",
                  "value": { "from": "product.description" },
                  "color": "muted-foreground",
                  "lineHeight": "relaxed",
                },
                { "type": "divider", "marginY": "lg" },
                {
                  "type": "toggle-group",
                  "mode": "single",
                  "defaultValue": "M",
                  "publishTo": "selectedSize",
                  "items": [
                    { "value": "S", "label": "S" },
                    { "value": "M", "label": "M" },
                    { "value": "L", "label": "L" },
                    { "value": "XL", "label": "XL" },
                  ],
                },
                {
                  "type": "row",
                  "gap": "md",
                  "marginY": "lg",
                  "children": [
                    {
                      "type": "button",
                      "label": "Add to Cart",
                      "bg": "primary",
                      "color": "primary-foreground",
                      "flex": "1",
                      "padding": "lg",
                      "borderRadius": "lg",
                      "hover": { "shadow": "lg", "scale": 1.02 },
                      "active": { "scale": 0.98 },
                      "action": {
                        "type": "api",
                        "method": "POST",
                        "endpoint": "/api/cart",
                        "body": {
                          "productId": { "from": "route.params.productId" },
                          "size": { "from": "selectedSize" },
                        },
                      },
                    },
                    {
                      "type": "icon-button",
                      "icon": "Heart",
                      "ariaLabel": "Add to wishlist",
                      "variant": "outline",
                      "hover": {
                        "color": "destructive",
                        "border": "1px solid var(--sn-color-destructive)",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```
