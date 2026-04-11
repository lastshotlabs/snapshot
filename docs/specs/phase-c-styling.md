# Phase C: Styling Power — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | C.1 | Animation Declarations from Config | Not started | Schema + Wrapper |
> | C.2 | Glass / Backdrop Blur Shorthand | Not started | Schema + Wrapper |
> | C.3 | Background Gradients (standalone) | Not started | Schema + Wrapper |
> | C.4 | Custom Scrollbar Theming | Not started | Tokens |
> | C.5 | Transition Shorthand | Not started | Schema + Wrapper |
>
> **Priority:** P1 — visual polish.
> **Depends on:** Phase A (CSS Foundation — Tailwind bridge must be active).
> **Blocks:** Phase G (Route Transitions use animation infrastructure).

---

## Vision

### Before

Components render with correct structure and colors but lack visual polish. No enter
animations. No glass effects. No gradients from config. No microinteractions. Hover states
exist for buttons (via `BUTTON_INTERACTIVE_CSS`) but aren't configurable from manifest.
Building a visually sophisticated UI requires inline `style` hacks.

### After

Any component can animate on mount. Glass/blur effects are one prop. Gradients are
declarable. Scrollbars are themed. Transitions are configurable. The manifest produces
the same visual quality as hand-crafted CSS — because it generates the same CSS.

---

## What Already Exists on Main

| File | Lines | What It Does |
|---|---|---|
| `src/ui/manifest/schema.ts` | 1598 | `baseComponentConfigSchema` with `className`, `style`, `tokens` props |
| `src/ui/tokens/resolve.ts` | 957 | `resolveFrameworkStyles()` includes 6 keyframes: `sn-fade`, `sn-fade-up`, `sn-fade-down`, `sn-slide-left`, `sn-slide-right`, `sn-scale` |
| `src/ui/components/_base/component-wrapper.tsx` | 181 | Wraps all components, applies `data-snapshot-component`, token overrides |
| `src/ui/components/_base/button-styles.ts` | 162 | `BUTTON_INTERACTIVE_CSS` — pattern for hover/focus CSS via data attributes |
| `src/ui/tokens/tailwind-bridge.ts` | 56 | Bridges `--sn-*` to Tailwind `@theme` (Tailwind `className` works in manifest) |

### Existing Animation Keyframes (resolve.ts lines 930-954)

```css
@keyframes sn-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes sn-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sn-fade-down { from { opacity: 0; transform: translateY(-8px); } ... }
@keyframes sn-slide-left { from { opacity: 0; transform: translateX(16px); } ... }
@keyframes sn-slide-right { from { opacity: 0; transform: translateX(-16px); } ... }
@keyframes sn-scale { from { opacity: 0; transform: scale(0.95); } ... }
```

### What className Already Enables

With Phase A's Tailwind bridge, consumers can already do:
```jsonc
{ "className": "hover:shadow-xl hover:scale-105 transition-all duration-200" }
```

Phase C adds declarative config alternatives for the most common patterns, so consumers
don't need to know Tailwind to get visual polish.

---

## Developer Context

### Build & Test Commands
```sh
bun run typecheck && bun run format:check && bun run build && bun test
```

### Key Files

| Path | What | Lines |
|---|---|---|
| `src/ui/manifest/schema.ts` | Base component schema — add new props here | 1598 |
| `src/ui/components/_base/component-wrapper.tsx` | Apply new props as styles here | 181 |
| `src/ui/tokens/resolve.ts` | Framework CSS — add keyframes, scrollbar rules | 957 |

---

## Non-Negotiable Engineering Constraints

1. **Semantic tokens.** Animation durations use `--sn-duration-fast`, not `150ms`. (Token Rules)
2. **SSR safe.** Animations must not cause hydration mismatches. Use CSS-only animations,
   not JS-driven. `useEffect` for browser-only setup. (SSR Rules)
3. **No eval.** Gradient color stops can reference token names but no dynamic evaluation.
4. **Canonical token list.** Every `--sn-*` var verified against engineering-rules.md.

---

## C.1: Animation Declarations from Config

### Goal

Any component can specify an enter animation via config. Staggered children animations
on container components.

### Schema Addition

Add to `baseComponentConfigSchema` in `src/ui/manifest/schema.ts`:

```typescript
animation: z.object({
  /** Animation preset name. Matches @keyframes sn-{name} in framework CSS. */
  enter: z.enum(["fade", "fade-up", "fade-down", "slide-left", "slide-right", "scale", "bounce"]),
  /** Duration token or milliseconds. */
  duration: z.union([
    z.enum(["instant", "fast", "normal", "slow"]),
    z.number(),
  ]).optional().default("normal"),
  /** Delay in ms before animation starts. */
  delay: z.number().optional(),
  /** Easing token or CSS timing function. */
  easing: z.union([
    z.enum(["default", "in", "out", "in-out", "spring"]),
    z.string(),
  ]).optional().default("default"),
  /** Stagger delay (ms) between children. Only applies to container components. */
  stagger: z.number().optional(),
}).optional(),
```

### Implementation

In `ComponentWrapper` (`src/ui/components/_base/component-wrapper.tsx`):

```typescript
const DURATION_MAP: Record<string, string> = {
  instant: "var(--sn-duration-instant, 0ms)",
  fast: "var(--sn-duration-fast, 150ms)",
  normal: "var(--sn-duration-normal, 300ms)",
  slow: "var(--sn-duration-slow, 500ms)",
};

const EASING_MAP: Record<string, string> = {
  default: "var(--sn-ease-default, ease)",
  in: "var(--sn-ease-in, ease-in)",
  out: "var(--sn-ease-out, ease-out)",
  "in-out": "var(--sn-ease-in-out, ease-in-out)",
  spring: "var(--sn-ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))",
};

function resolveAnimationStyle(animation: AnimationConfig, childIndex?: number): React.CSSProperties {
  const duration = typeof animation.duration === "number"
    ? `${animation.duration}ms`
    : DURATION_MAP[animation.duration ?? "normal"];
  const easing = EASING_MAP[animation.easing as string] ?? animation.easing ?? EASING_MAP.default;
  const delay = (animation.delay ?? 0) + (childIndex != null && animation.stagger ? childIndex * animation.stagger : 0);

  return {
    animation: `sn-${animation.enter} ${duration} ${easing} ${delay}ms both`,
  };
}
```

### Add Missing Keyframe

Add `sn-bounce` to `resolveFrameworkStyles()`:

```css
@keyframes sn-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

### Stagger Implementation

Container components (`row`, `stack`, `grid`) pass `childIndex` to each child's
`ComponentRenderer`. The child's `ComponentWrapper` uses the parent's `stagger` value
combined with its index to calculate delay.

**Approach:** Parent sets a CSS custom property `--sn-stagger-index` on each child wrapper:

```typescript
// In row/stack/grid component:
{config.children.map((child, i) => (
  <div key={i} style={{ "--sn-stagger-index": i } as React.CSSProperties}>
    <ComponentRenderer config={child} />
  </div>
))}
```

ComponentWrapper reads `--sn-stagger-index` for delay calculation if parent has stagger.

### Files to Modify

| File | Change |
|---|---|
| `src/ui/manifest/schema.ts` | Add `animation` to `baseComponentConfigSchema` |
| `src/ui/components/_base/component-wrapper.tsx` | Apply animation style |
| `src/ui/tokens/resolve.ts` | Add `sn-bounce` keyframe |

### Tests

```typescript
describe("animation config", () => {
  it("applies enter animation style", () => {
    const { container } = render(
      <ComponentWrapper type="test" animation={{ enter: "fade-up" }}>
        <div>content</div>
      </ComponentWrapper>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain("sn-fade-up");
  });
});
```

### Exit Criteria

- [ ] `{ "animation": { "enter": "fade-up" } }` applies CSS animation on mount
- [ ] Duration/easing tokens resolve to canonical `--sn-*` vars
- [ ] Stagger works on row/stack/grid children
- [ ] `sn-bounce` keyframe exists in framework CSS
- [ ] SSR: no hydration mismatch (CSS-only, no JS animation)
- [ ] `bun run typecheck` passes

---

## C.2: Glass / Backdrop Blur Shorthand

### Goal

`glass: true` on any component applies a frosted glass effect.

### Schema Addition

Add to `baseComponentConfigSchema`:

```typescript
glass: z.boolean().optional(),
```

### Implementation

In `ComponentWrapper`:

```typescript
const glassStyle: React.CSSProperties | undefined = config.glass
  ? {
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      background: "color-mix(in oklch, var(--sn-color-card, #fff) 80%, transparent)",
      border: "1px solid color-mix(in oklch, var(--sn-color-border, #e5e7eb) 50%, transparent)",
    }
  : undefined;
```

### Files to Modify

| File | Change |
|---|---|
| `src/ui/manifest/schema.ts` | Add `glass` to `baseComponentConfigSchema` |
| `src/ui/components/_base/component-wrapper.tsx` | Apply glass styles |

### Exit Criteria

- [ ] `{ "glass": true }` produces frosted glass effect
- [ ] Works in dark mode (transparent overlay adapts)
- [ ] SSR safe (CSS only, no browser API)

---

## C.3: Background Gradients (Standalone)

### Goal

Any component can have a gradient background via config, not just the `section` component
from Phase B.

### Schema

Already defined in Phase B.3's `backgroundConfigSchema`. For standalone use, add
`background` to `baseComponentConfigSchema`:

```typescript
background: z.union([
  z.string(),  // CSS color or image URL
  z.object({
    gradient: z.object({
      type: z.enum(["linear", "radial", "conic"]).default("linear"),
      direction: z.string().optional(),
      stops: z.array(z.object({
        color: z.string(),
        position: z.string().optional(),
      })).min(2),
    }),
  }),
]).optional(),
```

### Implementation

In `ComponentWrapper`:

```typescript
const bgStyle = resolveBackgroundStyle(config.background);

function resolveBackgroundStyle(bg: string | { gradient: GradientConfig } | undefined): React.CSSProperties | undefined {
  if (!bg) return undefined;
  if (typeof bg === "string") return { background: bg };
  return { backgroundImage: buildGradientCSS(bg.gradient) };
}
```

### Exit Criteria

- [ ] `{ "background": { "gradient": { "type": "linear", "direction": "135deg", "stops": [{"color": "var(--sn-color-primary)", "position": "0%"}, {"color": "var(--sn-color-accent)", "position": "100%"}] } } }` renders gradient
- [ ] String shorthand `{ "background": "var(--sn-color-muted)" }` works

---

## C.4: Custom Scrollbar Theming

### Goal

Theme-level scrollbar customization via `manifest.theme.components.scrollbar`.

### Schema Addition

Add to component tokens schema in `src/ui/manifest/schema.ts`:

```typescript
scrollbar: z.object({
  width: z.string().optional().default("8px"),
  track: z.string().optional().default("transparent"),
  thumb: z.string().optional().default("muted"),
  thumbHover: z.string().optional().default("primary"),
  radius: z.enum(["none", "sm", "md", "lg", "full"]).optional().default("full"),
}).optional(),
```

### Implementation

Add to `resolveFrameworkStyles()` or generate in `resolveTokens()` component tokens section:

```css
::-webkit-scrollbar {
  width: var(--sn-scrollbar-width, 8px);
}
::-webkit-scrollbar-track {
  background: var(--sn-scrollbar-track, transparent);
}
::-webkit-scrollbar-thumb {
  background: var(--sn-scrollbar-thumb, var(--sn-color-muted, #e5e7eb));
  border-radius: var(--sn-scrollbar-radius, var(--sn-radius-full, 9999px));
}
::-webkit-scrollbar-thumb:hover {
  background: var(--sn-scrollbar-thumb-hover, var(--sn-color-primary, #2563eb));
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--sn-scrollbar-thumb, var(--sn-color-muted)) var(--sn-scrollbar-track, transparent);
}
```

Generate `--sn-scrollbar-*` vars in `resolveTokens()` from `config.components.scrollbar`.

### Files to Modify

| File | Change |
|---|---|
| `src/ui/manifest/schema.ts` | Add `scrollbar` to component tokens schema |
| `src/ui/tokens/resolve.ts` | Generate `--sn-scrollbar-*` CSS vars + scrollbar CSS rules |

### Exit Criteria

- [ ] Custom scrollbar appearance via theme config
- [ ] Works in Chrome (webkit) and Firefox
- [ ] Thumb/track colors use token references

---

## C.5: Transition Shorthand

### Goal

Declarative CSS transition config on any component, without needing Tailwind className.

### Schema Addition

Add to `baseComponentConfigSchema`:

```typescript
transition: z.union([
  z.enum(["all", "colors", "opacity", "shadow", "transform"]),
  z.object({
    property: z.string().default("all"),
    duration: z.union([
      z.enum(["instant", "fast", "normal", "slow"]),
      z.number(),
    ]).optional().default("fast"),
    easing: z.union([
      z.enum(["default", "in", "out", "in-out", "spring"]),
      z.string(),
    ]).optional().default("default"),
  }),
]).optional(),
```

### Implementation

In `ComponentWrapper`:

```typescript
const TRANSITION_PROPERTY_MAP: Record<string, string> = {
  all: "all",
  colors: "color, background-color, border-color",
  opacity: "opacity",
  shadow: "box-shadow",
  transform: "transform",
};

function resolveTransitionStyle(transition: TransitionConfig): React.CSSProperties {
  const property = typeof transition === "string"
    ? TRANSITION_PROPERTY_MAP[transition]
    : TRANSITION_PROPERTY_MAP[transition.property] ?? transition.property;
  const duration = typeof transition === "string"
    ? DURATION_MAP.fast
    : (typeof transition.duration === "number" ? `${transition.duration}ms` : DURATION_MAP[transition.duration ?? "fast"]);
  const easing = typeof transition === "string"
    ? EASING_MAP.default
    : (EASING_MAP[transition.easing as string] ?? transition.easing ?? EASING_MAP.default);

  return { transition: `${property} ${duration} ${easing}` };
}
```

### Exit Criteria

- [ ] `{ "transition": "all" }` applies `transition: all 150ms ease`
- [ ] Object form with custom duration/easing works
- [ ] Duration/easing resolve to `--sn-*` tokens
- [ ] SSR safe

---

## Parallelization & Sequencing

### Track Overview

| Track | Phases | Files Owned |
|---|---|---|
| **Schema + Wrapper** | C.1, C.2, C.3, C.5 | `src/ui/manifest/schema.ts`, `src/ui/components/_base/component-wrapper.tsx` |
| **Tokens** | C.4 | `src/ui/tokens/resolve.ts` |

### Internal Sequencing

All phases are independent. C.1-C.5 can run in any order.
C.1 should be done first as it adds the most visible value.

### Branch Strategy

Branch: `phase-c/styling-power`

---

## Definition of Done

- [ ] `animation` prop works on all components (7 presets + stagger)
- [ ] `glass` prop produces frosted glass effect
- [ ] `background` prop supports gradient config
- [ ] Custom scrollbar theming via `theme.components.scrollbar`
- [ ] `transition` prop works with token-driven durations
- [ ] All new schema fields validated by Zod
- [ ] All changes SSR safe
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` passes
