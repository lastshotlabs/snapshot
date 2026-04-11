# Phase B: Layout Expressiveness — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | B.1 | CSS Grid Named Areas | Not started | Components |
> | B.2 | Container Component | Not started | Components |
> | B.3 | Section / Hero Component | Not started | Components |
> | B.4 | Sticky Positioning | Not started | Schema |
> | B.5 | Spacer Component | Not started | Components |
> | B.6 | Responsive Visibility Verification | Not started | Runtime |
> | B.7 | Overflow & Scroll Props | Not started | Schema |
> | B.8 | Z-Index from Config | Not started | Schema |
>
> **Priority:** P1 — visual sophistication.
> **Depends on:** Phase A (CSS Foundation).
> **Blocks:** Phase C (Styling), Phase I (Presets).

---

## Vision

### Before

Layout options are limited to `row` (flex), `stack`, and `split-pane`. No way to build
complex grid layouts, hero sections, sticky headers, or full-bleed backgrounds from config.
Building a landing page or dashboard with asymmetric columns requires inline `style` hacks.

### After

Any layout pattern from CSS Grid and Flexbox is declarable in JSON. Hero sections with
background images. Sticky elements anywhere. Full-bleed sections. Container queries.
A developer can replicate any marketing site or dashboard layout purely from manifest config.

---

## What Already Exists on Main

| File | Lines | What It Does |
|---|---|---|
| `src/ui/components/layout/layout/component.tsx` | 479 | App shell: sidebar, top-nav, minimal, full-width variants |
| `src/ui/components/layout/row/component.tsx` | ~80 | Flex row with gap, justify, align, wrap |
| `src/ui/components/layout/row/schema.ts` | ~30 | `rowConfigSchema`: gap (responsive enum), justify, align, wrap, children |
| `src/ui/components/layout/stack/component.tsx` | ~60 | Vertical/horizontal stack |
| `src/ui/components/layout/split-pane/` | ~200 | Resizable split panes |
| `src/ui/manifest/schema.ts` | 1598 | `baseComponentConfigSchema` with `span` (responsive 1-12) |
| `src/ui/hooks/use-breakpoint.ts` | ~100 | `useResponsiveValue()`, `useBreakpoint()`, `resolveResponsiveValue()` |
| `src/ui/components/_base/component-wrapper.tsx` | 181 | Wraps all components, applies grid span |

### Grid System Today

The current 12-column grid uses `span` on individual components:
```jsonc
{ "type": "stat-card", "span": 3 }          // 3 of 12 columns
{ "type": "stat-card", "span": { "default": 12, "md": 6, "lg": 3 } }  // responsive
```

This is applied in `ComponentRenderer` as CSS Grid column span. The parent page uses
`display: grid; grid-template-columns: repeat(12, 1fr)` via `[data-snapshot-page]` styles.

**Limitation:** No named grid areas. No explicit row/column sizing. No asymmetric layouts.

---

## Developer Context

### Build & Test Commands
```sh
bun run typecheck && bun run format:check && bun run build && bun test
```

### Component File Convention
```
src/ui/components/layout/{name}/
  schema.ts        ← Zod config schema
  component.tsx    ← Single config prop, wraps in ComponentWrapper
  types.ts         ← z.infer types
  index.ts         ← Exports schema + component
  __tests__/
    component.test.tsx
    schema.test.ts
```

---

## Non-Negotiable Engineering Constraints

1. **Semantic tokens only.** `var(--sn-spacing-md)` not `1rem`. (Token Usage Rules)
2. **Component directory convention.** schema.ts, component.tsx, types.ts, index.ts. (Component File Conventions)
3. **Register in `register.ts`.** `registerComponent()` + `registerComponentSchema()`. (Rule 4)
4. **ComponentWrapper.** Every component wrapped for data attributes, error boundary, Suspense. (Component Implementation Rules)
5. **SSR safe.** No `document`/`window` in render body. (SSR Rules)
6. **Playground integration.** All new components appear in playground. (Playground Rules)
7. **Config schema is the only interface.** Single `config` prop, no React props. (Component Implementation Rules)

---

## B.1: CSS Grid Named Areas

### Goal

New `grid` component type for CSS Grid layouts with named areas, explicit row/column
sizing, and responsive breakpoints.

### Types

```typescript
// src/ui/components/layout/grid/schema.ts
import { z } from "zod";
import { baseComponentConfigSchema, responsiveSchema, componentConfigSchema } from "../../../manifest/schema";

const gridAreaChildSchema = z.object({
  area: z.string(),
}).passthrough();

export const gridConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("grid"),
  /** Grid template areas — array of row strings. Each string is space-separated area names. */
  areas: responsiveSchema(z.array(z.string())),
  /** Grid template rows. CSS value like "auto 1fr auto" or "200px 1fr". */
  rows: z.string().optional(),
  /** Grid template columns. CSS value like "250px 1fr 300px". */
  columns: z.string().optional(),
  /** Gap between grid cells. */
  gap: responsiveSchema(z.enum(["xs", "sm", "md", "lg", "xl"])).optional(),
  /** Children must specify an `area` prop to place in the grid. */
  children: z.array(componentConfigSchema).min(1),
});

export type GridConfig = z.infer<typeof gridConfigSchema>;
```

### Implementation

```typescript
// src/ui/components/layout/grid/component.tsx
"use client";

import { ComponentWrapper } from "../../_base/component-wrapper";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import type { GridConfig } from "./types";

const GAP_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
};

export function Grid({ config }: { config: GridConfig }) {
  const areas = useResponsiveValue(config.areas);
  const gap = useResponsiveValue(config.gap);

  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateAreas: areas?.map((row) => `"${row}"`).join(" "),
    gridTemplateRows: config.rows,
    gridTemplateColumns: config.columns,
    gap: gap ? GAP_MAP[gap] : undefined,
  };

  return (
    <ComponentWrapper type="grid" id={config.id} className={config.className} style={{ ...style, ...config.style }}>
      {config.children.map((child, i) => {
        const childArea = (child as { area?: string }).area;
        return (
          <div key={child.id ?? i} style={childArea ? { gridArea: childArea } : undefined}>
            <ComponentRenderer config={child} />
          </div>
        );
      })}
    </ComponentWrapper>
  );
}
```

### Registration

Add to `src/ui/components/register.ts`:
```typescript
import { Grid } from "./layout/grid";
import { gridConfigSchema } from "./layout/grid/schema";
registerComponent("grid", Grid);
registerComponentSchema("grid", gridConfigSchema);
```

### Files to Create

| File | Purpose |
|---|---|
| `src/ui/components/layout/grid/schema.ts` | Zod schema |
| `src/ui/components/layout/grid/component.tsx` | Implementation |
| `src/ui/components/layout/grid/types.ts` | Inferred types |
| `src/ui/components/layout/grid/index.ts` | Barrel exports |
| `src/ui/components/layout/grid/__tests__/schema.test.ts` | Schema validation |
| `src/ui/components/layout/grid/__tests__/component.test.tsx` | Render tests |

### Files to Modify

| File | Change |
|---|---|
| `src/ui/components/register.ts` | Register grid component + schema |
| `src/ui/tokens/resolve.ts` | Add `[data-snapshot-component="grid"]` CSS in `resolveFrameworkStyles()` |

### Framework CSS

```css
[data-snapshot-component="grid"] {
  display: grid;
  width: 100%;
}
```

### Tests

```typescript
// schema.test.ts
describe("gridConfigSchema", () => {
  it("accepts valid grid config", () => {
    const config = gridConfigSchema.parse({
      type: "grid",
      areas: ["header header", "sidebar main"],
      rows: "auto 1fr",
      columns: "250px 1fr",
      gap: "md",
      children: [{ type: "text", text: "Hello", area: "header" }],
    });
    expect(config.areas).toEqual(["header header", "sidebar main"]);
  });

  it("accepts responsive areas", () => {
    gridConfigSchema.parse({
      type: "grid",
      areas: { default: ["main"], lg: ["sidebar main"] },
      children: [{ type: "text", text: "X" }],
    });
  });

  it("requires at least one child", () => {
    expect(() => gridConfigSchema.parse({ type: "grid", areas: ["main"], children: [] })).toThrow();
  });
});
```

### Exit Criteria

- [ ] `grid` component registered and renderable
- [ ] Grid areas work with responsive breakpoints
- [ ] Children placed by `area` prop
- [ ] SSR: `renderToStaticMarkup` produces valid HTML
- [ ] `bun run typecheck` passes
- [ ] Schema tests pass

---

## B.2: Container Component

### Goal

`container` component for max-width constrained, centered content.

### Types

```typescript
// src/ui/components/layout/container/schema.ts
export const containerConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("container"),
  maxWidth: z.union([
    z.enum(["xs", "sm", "md", "lg", "xl", "2xl", "full", "prose"]),
    z.number(),
  ]).optional().default("xl"),
  padding: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional().default("md"),
  center: z.boolean().optional().default(true),
  children: z.array(componentConfigSchema).min(1),
});
```

### Implementation

Uses canonical container tokens: `--sn-container-xs` through `--sn-container-2xl`,
`--sn-container-prose`, `--sn-container-full`.

```typescript
const MAX_WIDTH_MAP: Record<string, string> = {
  xs: "var(--sn-container-xs, 20rem)",
  sm: "var(--sn-container-sm, 24rem)",
  md: "var(--sn-container-md, 28rem)",
  lg: "var(--sn-container-lg, 32rem)",
  xl: "var(--sn-container-xl, 80rem)",
  "2xl": "var(--sn-container-2xl, 96rem)",
  full: "100%",
  prose: "var(--sn-container-prose, 65ch)",
};
```

### Files to Create

Same pattern: `src/ui/components/layout/container/` with schema, component, types, index, tests.

### Exit Criteria

- [ ] `container` component registered
- [ ] maxWidth uses canonical `--sn-container-*` tokens
- [ ] center: true applies `margin: 0 auto`
- [ ] SSR safe
- [ ] Tests pass

---

## B.3: Section / Hero Component

### Goal

`section` component for full-bleed sections with background images, overlays, gradients,
and vertical centering.

### Types

```typescript
// src/ui/components/layout/section/schema.ts
const backgroundConfigSchema = z.object({
  image: z.string().optional(),
  overlay: z.string().optional(),       // CSS color value for overlay
  gradient: z.object({
    type: z.enum(["linear", "radial", "conic"]).default("linear"),
    direction: z.string().optional().default("135deg"),
    stops: z.array(z.object({
      color: z.string(),
      position: z.string().optional(),
    })).min(2),
  }).optional(),
  position: z.string().optional().default("center"),
  size: z.enum(["cover", "contain", "auto"]).optional().default("cover"),
  fixed: z.boolean().optional(),          // parallax
}).optional();

export const sectionConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("section"),
  background: backgroundConfigSchema,
  height: z.union([z.string(), z.enum(["screen", "auto"])]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z.enum(["start", "center", "end", "between", "around"]).optional(),
  bleed: z.boolean().optional(),          // break out of parent container padding
  children: z.array(componentConfigSchema),
});
```

### Implementation

```typescript
export function Section({ config }: { config: SectionConfig }) {
  const bg = config.background;
  const style: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: config.align,
    justifyContent: config.justify,
    minHeight: config.height === "screen" ? "100vh" : config.height,
    ...(bg?.image && {
      backgroundImage: `url(${bg.image})`,
      backgroundPosition: bg.position,
      backgroundSize: bg.size,
      backgroundAttachment: bg.fixed ? "fixed" : undefined,
    }),
    ...(bg?.gradient && {
      backgroundImage: buildGradientCSS(bg.gradient),
    }),
    ...(config.bleed && {
      marginLeft: "calc(-1 * var(--sn-spacing-lg, 1.5rem))",
      marginRight: "calc(-1 * var(--sn-spacing-lg, 1.5rem))",
      paddingLeft: "var(--sn-spacing-lg, 1.5rem)",
      paddingRight: "var(--sn-spacing-lg, 1.5rem)",
    }),
    ...config.style,
  };

  return (
    <ComponentWrapper type="section" id={config.id} className={config.className} style={style}>
      {bg?.overlay && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: bg.overlay,
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {config.children.map((child, i) => (
          <ComponentRenderer key={child.id ?? i} config={child} />
        ))}
      </div>
    </ComponentWrapper>
  );
}

function buildGradientCSS(gradient: { type: string; direction?: string; stops: { color: string; position?: string }[] }): string {
  const stops = gradient.stops.map((s) => `${s.color}${s.position ? ` ${s.position}` : ""}`).join(", ");
  if (gradient.type === "radial") return `radial-gradient(${stops})`;
  if (gradient.type === "conic") return `conic-gradient(from ${gradient.direction ?? "0deg"}, ${stops})`;
  return `linear-gradient(${gradient.direction ?? "135deg"}, ${stops})`;
}
```

### Files to Create

`src/ui/components/layout/section/` with schema, component, types, index, tests.

### Exit Criteria

- [ ] Hero section with background image + overlay renders correctly
- [ ] Gradient backgrounds render
- [ ] Parallax (fixed attachment) works
- [ ] Full-bleed (`bleed: true`) breaks out of container padding
- [ ] SSR safe
- [ ] Tests pass

---

## B.4: Sticky Positioning

### Goal

Any component can be made sticky via a `sticky` prop on `baseComponentConfigSchema`.

### Schema Addition

Add to `baseComponentConfigSchema` in `src/ui/manifest/schema.ts`:

```typescript
sticky: z.union([
  z.boolean(),
  z.object({
    top: z.string().optional().default("0"),
    zIndex: z.union([
      z.enum(["base", "dropdown", "sticky", "overlay", "modal", "popover", "toast"]),
      z.number(),
    ]).optional().default("sticky"),
  }),
]).optional(),
```

### Implementation

Applied in `ComponentWrapper` (`src/ui/components/_base/component-wrapper.tsx`):

```typescript
const stickyStyle: React.CSSProperties | undefined = config.sticky
  ? {
      position: "sticky",
      top: typeof config.sticky === "object" ? config.sticky.top : "0",
      zIndex: typeof config.sticky === "object"
        ? (Z_INDEX_MAP[config.sticky.zIndex as string] ?? config.sticky.zIndex)
        : "var(--sn-z-index-sticky, 20)",
    }
  : undefined;
```

### Files to Modify

| File | Change |
|---|---|
| `src/ui/manifest/schema.ts` | Add `sticky` to `baseComponentConfigSchema` |
| `src/ui/components/_base/component-wrapper.tsx` | Apply sticky style |

### Exit Criteria

- [ ] `{ "type": "heading", "text": "Section", "sticky": true }` renders with position: sticky
- [ ] Custom top/zIndex via object form works
- [ ] SSR safe

---

## B.5: Spacer Component

### Goal

`spacer` component for explicit whitespace between components.

### Types

```typescript
export const spacerConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("spacer"),
  size: z.union([
    z.enum(["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]),
    z.string(),
  ]).optional().default("md"),
  axis: z.enum(["horizontal", "vertical"]).optional().default("vertical"),
});
```

### Implementation

```typescript
export function Spacer({ config }: { config: SpacerConfig }) {
  const sizeVar = SPACING_MAP[config.size] ?? config.size;
  const style: React.CSSProperties = config.axis === "horizontal"
    ? { width: sizeVar, flexShrink: 0 }
    : { height: sizeVar, flexShrink: 0 };

  return <ComponentWrapper type="spacer" id={config.id} style={style}><div /></ComponentWrapper>;
}
```

### Exit Criteria

- [ ] Spacer renders as blank space with correct size
- [ ] Horizontal and vertical axes work
- [ ] Uses `--sn-spacing-*` tokens

---

## B.6: Responsive Visibility Verification

### Goal

Verify `visible: { "default": false, "lg": true }` works end-to-end for showing/hiding
components at different breakpoints.

### Implementation

`ComponentRenderer` in `src/ui/manifest/renderer.tsx` already calls `useResponsiveValue()`
on the `visible` prop. Verify this:

1. Resolves responsive boolean map
2. Returns `null` when visibility is false
3. Works with `useBreakpoint()` hook from `src/ui/hooks/use-breakpoint.ts`

If broken, fix. If working, add test.

### Tests

```typescript
it("hides component below lg breakpoint when visible is responsive", () => {
  // Mock window.matchMedia for lg breakpoint
  // Render component with visible: { default: false, lg: true }
  // Assert hidden at sm, visible at lg
});
```

### Exit Criteria

- [ ] Responsive visibility works at all breakpoints
- [ ] Test confirms behavior

---

## B.7: Overflow & Scroll Props

### Goal

Add `overflow` and `maxHeight` props to `row` and `stack` schemas for scrollable containers.

### Schema Addition

Add to `rowConfigSchema` and `stackConfigSchema`:

```typescript
overflow: z.enum(["auto", "hidden", "scroll", "visible"]).optional(),
maxHeight: z.string().optional(),
```

### Implementation

Applied as inline styles in the row/stack component:

```typescript
style.overflow = config.overflow;
style.maxHeight = config.maxHeight;
```

### Exit Criteria

- [ ] `{ "type": "row", "overflow": "auto", "maxHeight": "400px" }` creates scrollable container
- [ ] Tests pass

---

## B.8: Z-Index from Config

### Goal

Add `zIndex` prop to `baseComponentConfigSchema` for explicit stacking.

### Schema

```typescript
zIndex: z.union([
  z.enum(["base", "dropdown", "sticky", "overlay", "modal", "popover", "toast"]),
  z.number(),
]).optional(),
```

### Implementation

Applied in `ComponentWrapper`:

```typescript
const Z_INDEX_MAP: Record<string, string> = {
  base: "var(--sn-z-index-base, 0)",
  dropdown: "var(--sn-z-index-dropdown, 10)",
  sticky: "var(--sn-z-index-sticky, 20)",
  overlay: "var(--sn-z-index-overlay, 30)",
  modal: "var(--sn-z-index-modal, 40)",
  popover: "var(--sn-z-index-popover, 50)",
  toast: "var(--sn-z-index-toast, 60)",
};
```

### Exit Criteria

- [ ] `{ "zIndex": "overlay" }` applies `var(--sn-z-index-overlay)`
- [ ] Numeric values pass through directly
- [ ] SSR safe

---

## Parallelization & Sequencing

### Track Overview

| Track | Phases | Files Owned |
|---|---|---|
| **Components** | B.1, B.2, B.3, B.5 | `src/ui/components/layout/grid/`, `container/`, `section/`, `spacer/` |
| **Schema** | B.4, B.7, B.8 | `src/ui/manifest/schema.ts`, `src/ui/components/_base/component-wrapper.tsx` |
| **Runtime** | B.6 | `src/ui/manifest/renderer.tsx` (verification only) |

### Internal Sequencing

All phases are independent. B.1-B.8 can be implemented in any order.

### Branch Strategy

- Branch: `phase-b/layout-expressiveness`
- Each sub-phase committed separately.

### Agent Execution Checklist

1. Read `docs/engineering-rules.md`
2. Read this spec
3. Create new component directories for B.1, B.2, B.3, B.5
4. Add schema props for B.4, B.7, B.8
5. Register all new components in `register.ts`
6. Add framework CSS in `resolveFrameworkStyles()`
7. Write tests
8. Run `bun run typecheck && bun test`
9. Add playground entries
10. Commit, push branch

---

## Definition of Done

- [ ] 4 new components registered: `grid`, `container`, `section`, `spacer`
- [ ] `sticky`, `zIndex` props on all components via base schema
- [ ] `overflow`, `maxHeight` on row/stack
- [ ] Responsive visibility verified
- [ ] All new components in playground
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` passes
