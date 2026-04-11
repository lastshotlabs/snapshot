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

**Files**: `structural.tsx` (row, stack, card, section), `schema.ts`

Add to base container config schema:
```json
{
  "type": "row",
  "background": {
    "image": "/hero.jpg",
    "position": "center",
    "size": "cover",
    "overlay": "rgba(0,0,0,0.5)"
  },
  "children": [...]
}
```

Implementation: renders `backgroundImage`, `backgroundSize`, `backgroundPosition` on container div. Overlay renders as a positioned overlay div.

Enables: Nike hero sections, promotional banners, jumbotrons, feature showcases.

### 3.2 Flexible Grid System

**Files**: `structural.tsx`, `schema.ts`

Add `grid` structural component alongside `row`:
```json
{
  "type": "grid",
  "columns": { "default": 1, "sm": 2, "lg": 3, "xl": 4 },
  "gap": "md",
  "children": [...]
}
```

Also support named grid areas:
```json
{
  "type": "grid",
  "template": "200px 1fr 200px",
  "rows": "auto 1fr auto",
  "areas": ["header header header", "sidebar main aside", "footer footer footer"],
  "children": [
    { "type": "heading", "text": "Hello", "area": "header" },
    { "type": "nav", "area": "sidebar" }
  ]
}
```

Implementation: CSS Grid with `grid-template-columns`, `grid-template-rows`, `grid-template-areas`. Responsive `columns` uses `useResponsiveValue`. `area` on child maps to `grid-area`.

Enables: masonry-like layouts, holy grail layout, dashboard panels, sidebar+main+aside, auto-fit product grids.

### 3.3 Sticky Positioning

**Files**: base component rendering in `structural.tsx`

Add `position` field to any component config:
```json
{
  "type": "row",
  "position": "sticky",
  "top": "0",
  "zIndex": "sticky",
  "children": [...]
}
```

Schema: `position: "static" | "sticky" | "relative"` (no absolute/fixed — those cause layout issues in manifest context). `top`/`bottom` for sticky offset. `zIndex` references semantic token scale (`base`, `dropdown`, `sticky`, `overlay`, `modal`, `popover`, `toast`).

Implementation: applied as inline style on the component wrapper in `InlineComponentRenderer`.

Enables: sticky headers, pinned toolbars, floating action bars, Gmail compose footer.

### 3.4 Split Pane Component

**File**: new component `src/ui/components/layout/split-pane/`

```json
{
  "type": "split-pane",
  "direction": "horizontal",
  "defaultSplit": 30,
  "minSize": 200,
  "children": [
    { "type": "data-table", "..." : "..." },
    { "type": "detail-card", "..." : "..." }
  ]
}
```

Resizable divider between two panes. Uses pointer events with `setPointerCapture` for drag resizing. Supports horizontal and vertical directions.

Enables: Gmail list+preview, IDE-style layouts, master-detail views.

### 3.5 Spacer Component

**File**: `structural.tsx`

```json
{ "type": "spacer", "size": "xl" }
{ "type": "spacer", "flex": true }
```

Fixed-size spacer (xs through 3xl with CSS custom property fallbacks) or flex-grow spacer (push items apart).

Enables: fine-grained spacing control, push-to-end patterns.

---

## Phase 4: Interaction Expressiveness

**Goal**: Express infinite scroll, keyboard shortcuts, scroll behaviors — all in JSON.

### 4.1 Infinite Scroll / Virtual Lists

**Files**: `data-table/component.tsx`, `data-table/hook.ts`, `data-table/schema.ts`, `data-table/types.ts`

Add `pagination.type: "infinite"` option:
```json
{
  "type": "data-table",
  "data": "GET /api/messages",
  "pagination": { "type": "infinite", "pageSize": 50 }
}
```

Implementation: IntersectionObserver on sentinel element at list bottom. Rows accumulate across pages instead of showing a single page window. Standard pagination controls hidden in infinite mode. `hasMore` flag controls sentinel visibility.

Enables: Discord message history, Twitter feed, infinite product grids.

### 4.2 Keyboard Shortcut Binding

**Files**: new `src/ui/shortcuts/` module (types, parse, listener, index), `schema.ts`, `app.tsx`

Add to manifest top-level:
```json
{
  "shortcuts": {
    "ctrl+k": { "type": "open-modal", "modal": "command-palette" },
    "j": { "type": "emit", "event": "select-next" },
    "k": { "type": "emit", "event": "select-prev" },
    "ctrl+n": { "type": "open-modal", "modal": "compose" },
    "?": { "type": "open-modal", "modal": "shortcuts-help" }
  }
}
```

Implementation: Global keyboard listener registered by ManifestRouter. Parses key combos into structured `ParsedCombo` objects. Dispatches actions through existing action executor. Context-aware — disabled when typing in input/textarea/select/contenteditable (unless shortcut uses a modifier key). Returns cleanup function for React effect lifecycle.

Enables: Gmail j/k navigation, Discord Ctrl+K command palette, Discourse keyboard nav.

### 4.3 Scroll Event Handling

_Deferred — not implemented in this iteration. Future work:_

Named scroll behaviors on containers:
- `revealOnScroll`: fade-in children as they enter viewport (Intersection Observer)
- `scrollSpy`: update a target component's active state based on scroll position
- `hideOnScroll`: hide/show element based on scroll direction (e.g., mobile nav)

### 4.4 Animation / Transition Config

**Files**: `structural.tsx` (ANIMATION_MAP, DURATION_MAP, InlineComponentRenderer), `resolve.ts` (@keyframes)

Add `animate` field to any component config:
```json
{
  "type": "stat-card",
  "animate": {
    "enter": "fade-up",
    "duration": "normal",
    "delay": 100
  }
}
```

Built-in named animations: `fade`, `fade-up`, `fade-down`, `slide-left`, `slide-right`, `scale`, `none`. Duration references token scale (`fast`: 150ms, `normal`: 250ms, `slow`: 500ms). Delay in ms.

Implementation: CSS `@keyframes` generated in framework stylesheet. Applied via `animation` property on mount. Animation name resolved through `ANIMATION_MAP`, duration through `DURATION_MAP`, delay via `animationDelay`.

Enables: page transition polish, staggered card reveals, Nike-style scroll animations.

---

## Phase 5: Missing Components

**Goal**: Fill component gaps for Discord, Gmail, Nike, Discourse.

### 5.1 Carousel / Slider

**File**: new `src/ui/components/media/carousel/`

```json
{
  "type": "carousel",
  "autoPlay": true,
  "interval": 5000,
  "showDots": true,
  "showArrows": true,
  "children": [
    { "type": "image", "src": "/hero-1.jpg", "alt": "..." },
    { "type": "card", "children": ["..."] }
  ]
}
```

Implementation: CSS transform-based slide transitions. Arrow buttons, dot indicators, auto-play with pause on hover. Uses `ComponentRenderer` to render arbitrary child components as slides.

### 5.2 Image Gallery + Lightbox

_Deferred — not implemented in this iteration. Future work:_ Grid of thumbnails with click-to-open full-size lightbox overlay.

### 5.3 Video / Iframe Embed

**Files**: new `src/ui/components/media/video/`, `src/ui/components/media/embed/`

```json
{
  "type": "video",
  "src": "/product-demo.mp4",
  "poster": "/poster.jpg",
  "controls": true,
  "autoPlay": false
}
```

Also supports iframe mode for YouTube/Vimeo:
```json
{
  "type": "embed",
  "url": "https://youtube.com/embed/...",
  "aspectRatio": "16/9"
}
```

Video component wraps `<video>` with poster/controls/autoPlay/loop/muted support. Auto-mutes when autoPlay is on. Embed component wraps `<iframe>` with responsive aspect ratio.

### 5.4 Vote / Rating Component

**File**: new `src/ui/components/data/vote/`

```json
{
  "type": "vote",
  "value": 42,
  "upAction": { "type": "api", "method": "POST", "endpoint": "/api/posts/:id/upvote" },
  "downAction": { "type": "api", "method": "POST", "endpoint": "/api/posts/:id/downvote" }
}
```

Up/down arrows with count display. Local toggle state tracks user's vote. Executes actions via `useActionExecutor`. Supports numeric value or `FromRef` data binding.

### 5.5 Banner / Hero Component

**File**: new `src/ui/components/content/banner/`

```json
{
  "type": "banner",
  "background": { "image": "/hero.jpg", "overlay": "rgba(0,0,0,0.5)" },
  "height": { "default": "50vh", "lg": "70vh" },
  "align": "center",
  "children": [
    { "type": "heading", "text": "Just Do It", "level": 1 },
    { "type": "text", "value": "The new Air Max 2025" },
    { "type": "button", "label": "Shop Now", "variant": "default" }
  ]
}
```

Full-width hero with background image/color, gradient overlay, configurable alignment (left/center/right), responsive height, and child component rendering via `ComponentRenderer`.

### 5.6 Mobile Sidebar Toggle

_Deferred — not implemented in this iteration. Future work:_ Hamburger button visible at mobile breakpoints, manages `data-sidebar-open` state.

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
| `src/ui/tokens/tailwind-bridge.ts` | New: `generateTailwindBridge()` — `@theme` block mapping `--sn-*` to Tailwind v4 |
| `src/vite/index.ts` | Virtual `snapshot-globals.css` module, auto-inject `@tailwindcss/vite` |
| `src/ui/tokens/index.ts` | Barrel export for `generateTailwindBridge` |

### Phase 3 (Layout)
| File | Changes |
|------|---------|
| `src/ui/manifest/structural.tsx` | Grid, spacer components; background image/overlay on row/card/section; sticky positioning; animation support in InlineComponentRenderer |
| `src/ui/manifest/schema.ts` | Grid schema, spacer schema, background config schema |
| `src/ui/components/layout/split-pane/` | New: resizable split pane (component, schema, types, index) |

### Phase 4 (Interaction)
| File | Changes |
|------|---------|
| `src/ui/shortcuts/` | New: types, parse, listener, index — keyboard shortcut module |
| `src/ui/manifest/app.tsx` | Register shortcut listener in ManifestRouter |
| `src/ui/manifest/schema.ts` | Shortcuts field on manifest schema |
| `src/ui/tokens/resolve.ts` | CSS `@keyframes` for 6 built-in animations |
| `src/ui/manifest/structural.tsx` | ANIMATION_MAP, DURATION_MAP, animate support |
| `src/ui/components/data/data-table/component.tsx` | InfiniteScrollSentinel component |
| `src/ui/components/data/data-table/hook.ts` | Infinite scroll accumulation logic |
| `src/ui/components/data/data-table/schema.ts` | `"infinite"` pagination type |
| `src/ui/components/data/data-table/types.ts` | `isInfiniteScroll`, `hasMore` fields |

### Phase 5 (Components)
| File | Changes |
|------|---------|
| `src/ui/components/media/carousel/` | New: carousel/slider component |
| `src/ui/components/media/video/` | New: `<video>` wrapper component |
| `src/ui/components/media/embed/` | New: `<iframe>` wrapper component |
| `src/ui/components/data/vote/` | New: up/down vote component |
| `src/ui/components/content/banner/` | New: hero/banner component |
| `src/ui/components/register.ts` | Registration for all 6 new components |

### Deferred Items
| Item | Reason |
|------|--------|
| 4.3 Scroll event handling | Needs more design work for scroll-spy/reveal APIs |
| 5.2 Image gallery + lightbox | Needs lightbox overlay system design |
| 5.6 Mobile sidebar toggle | Needs responsive breakpoint state management design |
