# Snapshot: Any Sophisticated UI From JSON

## Vision

One `snapshot.manifest.json` → Discord, Gmail, Nike.com, Discourse, budget dashboard. Four-layer override cascade: **config → tailwind className → inline style → code**. Zero TypeScript required for 95% of apps.

## Current State

The playground looks polished. Budget-fe looks like 1999 HTML. Same framework, same components.

**Root cause**: The playground has 800+ lines of private CSS (`playground/src/styles.css`) including Tailwind import, CSS reset, and component polish rules. Manifest-mode apps get none of this. Components hardcode inline styles instead of reading token CSS vars. The component token system generates CSS nobody consumes.

---

## Phase 1: Fix the Rendering Pipeline

**Goal**: Budget-fe looks like a real product with zero manifest changes.

### 1.1 CSS Baseline + Component Stylesheet

**File**: `src/ui/tokens/resolve.ts` — new `resolveFrameworkStyles()` function

Generate and inject alongside token CSS:

**A) CSS Reset:**
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--sn-font-sans, system-ui, -apple-system, sans-serif);
  font-size: var(--sn-font-size-md, 1rem);
  line-height: var(--sn-leading-normal, 1.5);
  color: var(--sn-color-foreground);
  background: var(--sn-color-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
button, input, textarea, select { font: inherit; }
```

**B) Component polish CSS** — extracted from playground's proven rules, parameterized by token vars:
```css
[data-snapshot-component="data-table"] {
  overflow: hidden;
  border: var(--sn-card-border, 1px solid var(--sn-color-border));
  border-radius: var(--sn-radius-lg);
  background: var(--sn-color-card);
}
[data-snapshot-component="data-table"] thead {
  background: var(--sn-table-header-bg, var(--sn-color-muted));
}
/* ... stat-card, form, chart, detail-card, etc. */
```

**C) Page layout default:**
```css
[data-snapshot-page] {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-lg, 1.5rem);
}
```

**File**: `src/ui/manifest/app.tsx` — inject both token CSS and framework styles via `<style>` tags.

### 1.2 Wire Component Tokens Through Components

**Files**: `stat-card/component.tsx`, `data-table/component.tsx`, `button-styles.ts`

Replace hardcoded inline styles with token var references:
- `boxShadow: "0 1px 3px..."` → `var(--sn-card-shadow, 0 1px 3px...)`
- Table density/striped/hover/header → `var(--sn-table-*)` tokens
- Button weight/transform → `var(--sn-button-*)` tokens

### 1.3 Fix Component Token CSS Scoping

**File**: `src/ui/tokens/resolve.ts`

Move component tokens to `:root` scope. Current `[data-snapshot-component="card"]` never matches `stat-card`. Put on `:root` so they cascade.

### 1.4 Font Loading

**File**: `src/ui/tokens/resolve.ts`

Emit `@import url(https://fonts.googleapis.com/css2?family=...)` for known web fonts. Support `font.url` for custom sources.

### 1.5 Dark Mode Management

**File**: `src/ui/manifest/app.tsx`

Apply `.dark` to `document.documentElement` based on `theme.mode`. Handle `set-theme` action. Persist to localStorage. `useLayoutEffect` to prevent flash.

### 1.6 Icon Rendering in Structural Button

**File**: `src/ui/manifest/structural.tsx`

Import `renderIcon` from `../icons/render`. Render alongside label.

### 1.7 Layout Primitives: card, section, container

**File**: `src/ui/manifest/structural.tsx` + register in `boot-builtins.ts`

**card**: Container with `--sn-card-*` tokens, optional title/subtitle/actions, children with gap.
```json
{ "type": "card", "title": "Recent Activity", "children": [...] }
```

**section**: Semantic `<section>` with auto heading, description, divider.
```json
{ "type": "section", "heading": "Finance", "description": "...", "children": [...] }
```

**container**: Max-width constraint, centered.
```json
{ "type": "container", "maxWidth": "xl", "children": [...] }
```

---

## Phase 2: Tailwind Integration for Manifest Mode

**Goal**: `className: "bg-primary/50 rounded-xl shadow-lg"` works in manifest JSON.

### 2.1 Vite Plugin for Manifest Apps

**File**: new `src/vite/manifest-plugin.ts` or extend `snapshotSync`

- Detect manifest-mode apps
- Auto-inject `@tailwindcss/vite`
- Generate virtual `globals.css` bridging `--sn-*` tokens to Tailwind `@theme`
- Scan manifest JSON for className values as Tailwind content sources

### 2.2 Token → Tailwind Bridge

**File**: new `src/ui/tokens/tailwind-bridge.ts`

Extract the `@theme` generation from `globals-css.ts` scaffold template into reusable function.

### 2.3 Eliminate main.tsx Boilerplate

**File**: new CLI commands `snapshot dev` / `snapshot build`

- Read `snapshot.manifest.json` from CWD
- Auto-generate virtual entry point
- Include Tailwind pipeline
- Zero user code

---

## Phase 3: Layout Expressiveness

**Goal**: Express hero sections, complex grids, sticky elements, split panes — all in JSON.

### 3.1 Background Image / Overlay Support on Containers
### 3.2 Flexible Grid System
### 3.3 Sticky Positioning
### 3.4 Split Pane Component
### 3.5 Spacer Component

---

## Phase 4: Interaction Expressiveness

**Goal**: Express infinite scroll, keyboard shortcuts, scroll behaviors — all in JSON.

### 4.1 Infinite Scroll / Virtual Lists
### 4.2 Keyboard Shortcut Binding
### 4.3 Scroll Event Handling
### 4.4 Animation / Transition Config

---

## Phase 5: Missing Components

**Goal**: Fill component gaps for Discord, Gmail, Nike, Discourse.

### 5.1 Carousel / Slider
### 5.2 Image Gallery + Lightbox
### 5.3 Video / Iframe Embed
### 5.4 Vote / Rating Component
### 5.5 Banner / Hero Component
### 5.6 Mobile Sidebar Toggle

---

## Override Cascade Summary

After all phases, every component supports:

```
1. MANIFEST CONFIG (first-class)
   { "type": "stat-card", "variant": "outlined", "icon": "Wallet" }
   → Component reads config, applies token-driven defaults

2. TAILWIND className (utility overrides)
   { "type": "stat-card", "className": "shadow-xl rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10" }
   → Tailwind classes override/extend token defaults

3. INLINE STYLE (escape hatch)
   { "type": "stat-card", "style": { "maxWidth": "300px", "transform": "rotate(-2deg)" } }
   → Inline styles override everything

4. CODE (nuclear option)
   registerComponent("custom-stat-card", MyCustomStatCard)
   → Full React component, declared in manifest, rendered by framework
```

---

## Priority Order

| Phase | Effort | Impact | Unlocks |
|-------|--------|--------|---------|
| **Phase 1**: Rendering pipeline | Medium | Critical | Budget-fe, admin dashboards, CRUD apps look real |
| **Phase 2**: Tailwind integration | Medium | Critical | className override layer lights up for all apps |
| **Phase 3**: Layout expressiveness | Medium | High | Nike hero, Gmail split-pane, complex dashboards |
| **Phase 4**: Interaction expressiveness | Large | High | Discord chat scroll, Gmail shortcuts, scroll animations |
| **Phase 5**: Missing components | Medium | Medium | Carousel, gallery, video, vote fill specific gaps |

After Phase 1+2: budget-fe, Discourse, basic admin apps — **production-ready from JSON**.
After Phase 3: Gmail, complex dashboards — **production-ready from JSON**.
After Phase 4+5: Discord, Nike.com — **production-ready from JSON**.

---

## Files to Modify/Create

### Phase 1 (Rendering Fix)
| File | Changes |
|------|---------|
| `src/ui/tokens/resolve.ts` | CSS reset, font import, component styles, tokens to :root |
| `src/ui/manifest/app.tsx` | Inject framework styles, dark mode class management |
| `src/ui/components/data/stat-card/component.tsx` | Token var references |
| `src/ui/components/data/data-table/component.tsx` | Token var references |
| `src/ui/components/_base/button-styles.ts` | Token var references |
| `src/ui/manifest/structural.tsx` | Button icon + card/section/container components |
| `src/ui/manifest/boot-builtins.ts` | Register new structural components |
| `src/ui/manifest/schema.ts` | Card/section/container schemas |

### Phase 2 (Tailwind)
| File | Changes |
|------|---------|
| `src/vite/manifest-plugin.ts` | New: auto-inject Tailwind for manifest apps |
| `src/ui/tokens/tailwind-bridge.ts` | New: extract @theme gen from scaffold template |
| `src/cli/commands/dev.ts` | New: zero-code dev server |
| `src/cli/commands/build.ts` | New: zero-code production build |

### Phase 3 (Layout)
| File | Changes |
|------|---------|
| `src/ui/manifest/structural.tsx` | grid, spacer components; background image support |
| `src/ui/manifest/schema.ts` | Grid schema, background schema, position/sticky fields |
| `src/ui/components/layout/split-pane/` | New: resizable split pane |

### Phase 4 (Interaction)
| File | Changes |
|------|---------|
| `src/ui/components/data/data-table/component.tsx` | Infinite scroll pagination mode |
| `src/ui/components/data/feed/component.tsx` | Infinite scroll mode |
| `src/ui/shortcuts/` | New: keyboard shortcut registry + listener |
| `src/ui/manifest/schema.ts` | Shortcuts schema, animate schema, onScroll schema |
| `src/ui/manifest/app.tsx` | Register shortcut listener |

### Phase 5 (Components)
| File | Changes |
|------|---------|
| `src/ui/components/media/carousel/` | New component |
| `src/ui/components/media/gallery/` | New component |
| `src/ui/components/media/video/` | New component |
| `src/ui/components/media/embed/` | New component |
| `src/ui/components/data/vote/` | New component |
| `src/ui/components/content/banner/` | New component |
| `src/ui/components/layout/layout/component.tsx` | Mobile sidebar toggle |
