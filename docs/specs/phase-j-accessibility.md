# Phase J: Accessibility & Polish — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | J.1 | Focus Management — trapping in modals/drawers | Not started | A11y |
> | J.2 | Skip Links — manifest-driven skip navigation | Not started | A11y |
> | J.3 | ARIA Labels — props on base component schema | Not started | A11y |
> | J.4 | Reduced Motion — respect `prefers-reduced-motion` | Not started | A11y |
> | J.5 | Color Contrast Warnings — dev-mode WCAG AA validator | Not started | A11y |
> | J.6 | Live Regions — `ariaLive` for dynamic content | Not started | A11y |
>
> **Priority:** P1 — required for production apps.
> **Depends on:** Phase A (CSS Foundation), Phase D (Interactivity Engine).
> **Blocks:** Nothing — accessibility is additive.

---

## Vision

### Before (Today)

Snapshot components have basic accessibility: modal uses `role="dialog"` and `aria-modal`,
the close button has `aria-label`, keyboard Escape closes modals. But there are significant
gaps:

1. **No focus trapping.** Tab key escapes modals and drawers into background content.
   The modal component focuses itself on open (`dialogRef.current.focus()`) but does not
   trap focus within the dialog boundary.
2. **No skip links.** Screen reader users cannot skip to main content.
3. **No manifest-level ARIA props.** Components cannot be annotated with `ariaLabel`,
   `ariaDescribedBy`, or `role` from manifest JSON. These are available only when the
   component author hardcodes them.
4. **No reduced motion support.** Animations run regardless of user preference. Modal
   scale/opacity transitions, toast slide-ins, and chart animations ignore
   `prefers-reduced-motion`.
5. **No contrast validation.** A consumer can set theme colors that fail WCAG AA contrast
   ratios with no warning.
6. **No live regions.** Dynamic content updates (stat cards refreshing, toast messages)
   are not announced to screen readers.

### After (This Spec)

1. Modals and drawers trap focus using a lightweight focus-trap utility. `initialFocus`
   and `returnFocus` are configurable from manifest.
2. Skip links are auto-injected by `ManifestApp` based on manifest config.
3. `ariaLabel`, `ariaDescribedBy`, and `role` are available on every component via
   `baseComponentConfigSchema`.
4. `prefers-reduced-motion: reduce` disables/replaces all animations framework-wide.
5. Dev mode validates foreground/background contrast ratios and warns in console.
6. Components with dynamic content support `ariaLive` for screen reader announcements.

---

## What Already Exists on Main

### Modal Accessibility (PARTIAL)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/overlay/modal/component.tsx` | 350 | `role="dialog"`, `aria-modal="true"`, `aria-label={title}`. Focus: `dialogRef.current.focus()` on open. Escape key handler. No focus trapping — Tab escapes. |
| `src/ui/components/overlay/modal/schema.ts` | 58 | No `initialFocus`, `returnFocus`, or `trapFocus` props. |
| `src/ui/components/overlay/drawer/component.tsx` | ~300 | Similar pattern — `role="dialog"`, `aria-modal`, focus on open, Escape closes. No trap. |

### Base Component Schema (NO a11y props)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/manifest/schema.ts:203-219` | 17 | `baseComponentConfigSchema`: `type`, `id`, `tokens`, `visibleWhen`, `visible`, `className`, `style`, `span`. No `ariaLabel`, `ariaDescribedBy`, `role`. |

### ManifestApp (NO skip links)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/manifest/app.tsx` | 1764 | Renders providers, token CSS, framework CSS, router. No skip link injection. |

### Animations (NO reduced motion)

| File | What |
|---|---|
| `src/ui/components/overlay/modal/component.tsx` | Hardcoded 200ms scale/opacity transition. |
| `src/ui/components/overlay/drawer/component.tsx` | Hardcoded slide transition. |
| `src/ui/actions/toast.ts` | Toast slide-in animation. |
| `src/ui/tokens/resolve.ts` | Generates `--sn-duration-*` and `--sn-ease-*` tokens. No reduced motion override. |

### Token System (NO contrast validation)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/tokens/resolve.ts` | 957 | `resolveTokens()` generates CSS vars from theme config. No contrast checking. |
| `src/ui/tokens/color.ts` | ~200 | Color conversion utilities (hex, hsl, oklch). Has oklch parsing but no contrast ratio calculation. |

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
| `src/ui/components/overlay/modal/component.tsx` | Modal component | 350 |
| `src/ui/components/overlay/modal/schema.ts` | Modal Zod schema | 58 |
| `src/ui/components/overlay/drawer/component.tsx` | Drawer component | ~300 |
| `src/ui/manifest/schema.ts` | All manifest schemas inc. `baseComponentConfigSchema` | ~1400 |
| `src/ui/manifest/app.tsx` | `ManifestApp` root component | 1764 |
| `src/ui/tokens/resolve.ts` | Token resolution + framework CSS | 957 |
| `src/ui/tokens/color.ts` | Color conversion utilities | ~200 |
| `src/ui/components/_base/component-wrapper.tsx` | ComponentWrapper | 181 |

---

## Non-Negotiable Engineering Constraints

1. **SSR safe** — focus trapping only activates in `useEffect`, never in render body.
   No `document` or `window` in synchronous render.
2. **Manifest-only architecture** — all a11y features configurable from JSON manifest.
3. **No `any`** — all new types properly defined.
4. **Semantic tokens only** — reduced motion respects `--sn-duration-*` tokens.
5. **Config schema is the only interface** — a11y props on `baseComponentConfigSchema`.
6. **Tests mandatory** — focus trap behavior, skip link rendering, ARIA prop passthrough.
7. **No new peer dependencies** — focus trapping implemented in-house, not via
   `focus-trap` npm package.

---

## Phase J.1: Focus Management — Trapping in Modals/Drawers

### Goal

Implement focus trapping in modal and drawer components. Focus stays within the overlay
when Tab/Shift+Tab is pressed. Add `initialFocus`, `returnFocus`, and `trapFocus` props
to the modal/drawer schemas.

### Types

Add focus management props to modal schema in `src/ui/components/overlay/modal/schema.ts`:

```ts
export const modalConfigSchema = baseComponentConfigSchema.extend({
  // ... existing fields ...
  /**
   * Trap focus within the modal when open. Tab/Shift+Tab cycle within focusable elements.
   * @default true
   */
  trapFocus: z.boolean().default(true),
  /**
   * CSS selector for the element to receive initial focus when the modal opens.
   * Defaults to the first focusable element.
   */
  initialFocus: z.string().optional(),
  /**
   * When true, return focus to the previously focused element when the modal closes.
   * @default true
   */
  returnFocus: z.boolean().default(true),
});
```

### Implementation

**1. Create `src/ui/components/_base/use-focus-trap.ts`:**

```ts
'use client';

import { useEffect, useRef, useCallback } from "react";

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  /** Whether focus trapping is enabled. */
  enabled: boolean;
  /** Whether the overlay is currently open. */
  isOpen: boolean;
  /** CSS selector for initial focus target. */
  initialFocus?: string;
  /** Whether to return focus on close. */
  returnFocus?: boolean;
}

/**
 * Hook that traps focus within a container element.
 *
 * Returns a ref to attach to the container. When enabled and open:
 * - Tab cycles through focusable elements within the container.
 * - Shift+Tab cycles backwards.
 * - Focus does not escape the container.
 * - On open, focuses initialFocus target or first focusable element.
 * - On close, returns focus to previously focused element (if returnFocus).
 */
export function useFocusTrap<T extends HTMLElement>(options: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Store the previously focused element when opening
  useEffect(() => {
    if (options.isOpen && options.enabled) {
      previousFocusRef.current = document.activeElement;
    }
  }, [options.isOpen, options.enabled]);

  // Focus initial element when opening
  useEffect(() => {
    if (!options.isOpen || !options.enabled || !containerRef.current) return;

    const container = containerRef.current;
    const initialTarget = options.initialFocus
      ? container.querySelector<HTMLElement>(options.initialFocus)
      : null;

    if (initialTarget) {
      initialTarget.focus();
    } else {
      const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        container.focus();
      }
    }
  }, [options.isOpen, options.enabled, options.initialFocus]);

  // Return focus on close
  useEffect(() => {
    if (!options.isOpen && options.returnFocus !== false && previousFocusRef.current) {
      const target = previousFocusRef.current as HTMLElement;
      if (typeof target.focus === "function") {
        target.focus();
      }
      previousFocusRef.current = null;
    }
  }, [options.isOpen, options.returnFocus]);

  // Trap Tab/Shift+Tab
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!options.enabled || e.key !== "Tab" || !containerRef.current) return;

      const container = containerRef.current;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [options.enabled],
  );

  return { containerRef, handleKeyDown };
}
```

**2. Update `src/ui/components/overlay/modal/component.tsx`:**

Replace the manual focus logic with `useFocusTrap`:

```tsx
import { useFocusTrap } from "../../_base/use-focus-trap";

export function ModalComponent({ config }: { config: ModalConfig }) {
  const { isOpen, close, payload, result } = useModal(config);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const { containerRef: dialogRef, handleKeyDown: trapKeyDown } = useFocusTrap<HTMLDivElement>({
    enabled: config.trapFocus !== false,
    isOpen: isOpen && animating,
    initialFocus: config.initialFocus,
    returnFocus: config.returnFocus !== false,
  });

  // ... mount/unmount animation (unchanged) ...

  // Combine focus trap keydown with Escape handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      trapKeyDown(e);
    },
    [close, trapKeyDown],
  );

  // Remove the old focus useEffect — useFocusTrap handles it
  // ...
}
```

**3. Apply same pattern to drawer component.**

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/use-focus-trap.ts` |
| Modify | `src/ui/components/overlay/modal/schema.ts` — add `trapFocus`, `initialFocus`, `returnFocus` |
| Modify | `src/ui/components/overlay/modal/component.tsx` — use `useFocusTrap` hook |
| Modify | `src/ui/components/overlay/drawer/schema.ts` — add same props |
| Modify | `src/ui/components/overlay/drawer/component.tsx` — use `useFocusTrap` hook |

### Documentation Impact

- JSDoc on `useFocusTrap` hook.
- Update `docs/components.md` — modal/drawer section with focus management props.

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/use-focus-trap.test.ts` (create) | Tests: Tab cycles within container, Shift+Tab wraps backwards, initial focus targets selector, return focus on close, disabled mode does not trap. |
| `src/ui/components/overlay/modal/__tests__/schema.test.ts` | Add tests: `trapFocus` defaults to true, `initialFocus` accepts selector string, `returnFocus` defaults to true. |
| `src/ui/components/overlay/modal/__tests__/component.test.tsx` | Add test: Tab key does not escape modal when `trapFocus: true`. |

### Exit Criteria

- [ ] Tab key cycles through focusable elements within an open modal without escaping.
- [ ] Shift+Tab wraps from first to last focusable element.
- [ ] `initialFocus: "[name='email']"` focuses the email input on open.
- [ ] Closing modal returns focus to the element that opened it.
- [ ] `trapFocus: false` disables focus trapping.
- [ ] Same behavior works for drawer component.
- [ ] SSR render (`renderToStaticMarkup`) does not throw.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase J.2: Skip Links — Manifest-Driven Skip Navigation

### Goal

Add skip link support so screen reader users can jump directly to main content. Skip links
are configured in the manifest and auto-injected by `ManifestApp`.

### Types

Add to manifest app config schema in `src/ui/manifest/schema.ts`:

```ts
// Inside appConfigSchema
a11y: z.object({
  /** Skip links injected at the top of the page. */
  skipLinks: z.array(z.object({
    /** Display label for the skip link. */
    label: z.string().min(1),
    /** Target element ID (without #). */
    target: z.string().min(1),
  })).default([
    { label: "Skip to main content", target: "main-content" },
  ]),
  /** Whether to respect prefers-reduced-motion. */
  respectReducedMotion: z.boolean().default(true),
}).default({}).optional(),
```

### Implementation

**1. Create `src/ui/components/_base/skip-links.tsx`:**

```tsx
'use client';

import React from "react";

interface SkipLink {
  label: string;
  target: string;
}

interface SkipLinksProps {
  links: SkipLink[];
}

/**
 * Skip links component — renders visually hidden links that become visible on focus.
 * Allows keyboard/screen reader users to skip to landmark regions.
 */
export function SkipLinks({ links }: SkipLinksProps) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Skip links" data-snapshot-skip-links="">
      <style>{`
        [data-snapshot-skip-links] {
          position: fixed;
          top: 0;
          left: 0;
          z-index: var(--sn-z-index-toast, 50);
          display: flex;
          flex-direction: column;
          gap: var(--sn-spacing-xs, 0.25rem);
          padding: var(--sn-spacing-xs, 0.25rem);
        }
        [data-snapshot-skip-link] {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
          padding: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
          background: var(--sn-color-primary, #2563eb);
          color: var(--sn-color-primary-foreground, #fff);
          font-size: var(--sn-font-size-sm, 0.875rem);
          font-weight: var(--sn-font-weight-medium, 500);
          text-decoration: none;
          border-radius: var(--sn-radius-sm, 0.25rem);
        }
        [data-snapshot-skip-link]:focus {
          position: static;
          width: auto;
          height: auto;
          overflow: visible;
          clip: auto;
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
      {links.map((link) => (
        <a
          key={link.target}
          href={`#${link.target}`}
          data-snapshot-skip-link=""
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById(link.target);
            if (target) {
              target.focus();
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
```

**2. Update `src/ui/manifest/app.tsx`:**

Import and render `SkipLinks` at the top of the app tree, reading config from
`compiled.app.a11y?.skipLinks`:

```tsx
import { SkipLinks } from "../components/_base/skip-links";

// Inside ManifestApp render, before the router:
{compiled.app.a11y?.skipLinks && (
  <SkipLinks links={compiled.app.a11y.skipLinks} />
)}
```

**3. Add `id="main-content"` to the page content wrapper** in the layout component
or page renderer so the default skip link target exists.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/skip-links.tsx` |
| Modify | `src/ui/manifest/schema.ts` — add `a11y` to `appConfigSchema` |
| Modify | `src/ui/manifest/app.tsx` — render `SkipLinks` |
| Modify | `src/ui/manifest/renderer.tsx` — add `id="main-content"` to page wrapper |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/skip-links.test.tsx` (create) | Tests: renders links with correct hrefs, links are visually hidden by default, clicking link focuses target element, empty array renders nothing. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add tests: `a11y.skipLinks` defaults, custom skip links accepted, `respectReducedMotion` defaults to true. |

### Exit Criteria

- [ ] Default manifest includes a "Skip to main content" link targeting `#main-content`.
- [ ] Skip links are visually hidden until focused via Tab.
- [ ] Clicking a skip link focuses and scrolls to the target element.
- [ ] Custom skip links configurable: `{ "a11y": { "skipLinks": [...] } }`.
- [ ] SSR renders skip links correctly (visible in static markup).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase J.3: ARIA Labels — Props on Base Component Schema

### Goal

Add `ariaLabel`, `ariaDescribedBy`, and `role` props to `baseComponentConfigSchema` so any
component can be annotated from manifest JSON.

### Implementation

**1. Update `src/ui/manifest/schema.ts`:**

```ts
export const baseComponentConfigSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  tokens: z.record(z.string()).optional(),
  visibleWhen: z.string().optional(),
  visible: z.union([
    z.boolean(),
    responsiveSchema(z.boolean()),
    fromRefSchema,
    policyRefSchema,
  ]).optional(),
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),
  span: responsiveSchema(z.number().int().min(1).max(12)).optional(),
  /** Accessible label for screen readers. Maps to aria-label. */
  ariaLabel: z.string().optional(),
  /** ID of element that describes this component. Maps to aria-describedby. */
  ariaDescribedBy: z.string().optional(),
  /** WAI-ARIA role override. */
  role: z.string().optional(),
});
```

**2. Update `src/ui/components/_base/component-wrapper.tsx`:**

Pass ARIA props through to the wrapper element:

```tsx
// In ComponentWrapper render:
<div
  data-snapshot-component={config.type}
  aria-label={config.ariaLabel}
  aria-describedby={config.ariaDescribedBy}
  role={config.role}
  // ... existing props ...
>
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/manifest/schema.ts` — add `ariaLabel`, `ariaDescribedBy`, `role` to base schema |
| Modify | `src/ui/components/_base/component-wrapper.tsx` — pass ARIA props to wrapper div |
| Modify | `src/ui/manifest/types.ts` — `BaseComponentConfig` type auto-updates via `z.infer` |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/schema.test.ts` | Add tests: `ariaLabel` accepted as string, `ariaDescribedBy` accepted, `role` accepted, all optional. |
| `src/ui/components/_base/__tests__/component-wrapper.test.tsx` (create or modify) | Tests: `ariaLabel` renders as `aria-label`, `ariaDescribedBy` renders as `aria-describedby`, `role` renders on wrapper. |

### Exit Criteria

- [ ] `{ "type": "stat-card", "ariaLabel": "Total revenue this month" }` renders with
      `aria-label` on the wrapper.
- [ ] `{ "type": "data-table", "role": "grid" }` renders with `role="grid"`.
- [ ] Omitting ARIA props produces no ARIA attributes (no empty strings).
- [ ] Existing components are not affected (props are optional, defaults to undefined).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase J.4: Reduced Motion — Respect `prefers-reduced-motion`

### Goal

When `prefers-reduced-motion: reduce` is active and `manifest.app.a11y.respectReducedMotion`
is true (default), disable or replace all animations with instant transitions.

### Implementation

**1. Update `src/ui/tokens/resolve.ts`:**

Add reduced motion CSS to `resolveFrameworkStyles()`:

```ts
// At the end of resolveFrameworkStyles():
css += `
@media (prefers-reduced-motion: reduce) {
  :root {
    --sn-duration-instant: 0ms;
    --sn-duration-fast: 0ms;
    --sn-duration-normal: 0ms;
    --sn-duration-slow: 0ms;
  }

  [data-snapshot-component] *,
  [data-snapshot-modal-dialog],
  [data-snapshot-modal-overlay],
  [data-snapshot-drawer-panel],
  [data-snapshot-drawer-overlay],
  [data-snapshot-toast] {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
```

**2. Update `src/ui/manifest/app.tsx`:**

Check the `a11y.respectReducedMotion` config. When explicitly set to `false`, skip injecting
the reduced motion styles:

```tsx
// In ManifestApp, when building framework styles:
const respectReducedMotion = compiled.app.a11y?.respectReducedMotion !== false;
const frameworkCSS = resolveFrameworkStyles({ respectReducedMotion });
```

Update `resolveFrameworkStyles` signature:

```ts
export function resolveFrameworkStyles(options?: {
  respectReducedMotion?: boolean;
}): string {
  // ... existing code ...
  if (options?.respectReducedMotion !== false) {
    css += REDUCED_MOTION_CSS;
  }
  return css;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/tokens/resolve.ts` — add reduced motion media query to framework styles |
| Modify | `src/ui/manifest/app.tsx` — pass `respectReducedMotion` to `resolveFrameworkStyles` |

### Tests

| File | What |
|---|---|
| `src/ui/tokens/__tests__/resolve.test.ts` | Add tests: framework styles include `@media (prefers-reduced-motion: reduce)` block, `respectReducedMotion: false` omits it. |

### Exit Criteria

- [ ] `resolveFrameworkStyles()` output contains `prefers-reduced-motion: reduce` media query.
- [ ] Duration tokens are set to `0ms` inside the reduced motion query.
- [ ] `resolveFrameworkStyles({ respectReducedMotion: false })` omits the query.
- [ ] `manifest.app.a11y.respectReducedMotion` defaults to `true` in schema.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase J.5: Color Contrast Warnings — Dev Mode WCAG AA Validator

### Goal

In development mode, validate that foreground/background color pairs meet WCAG AA contrast
ratio (4.5:1 for normal text, 3:1 for large text). Warn in console.

### Implementation

**1. Add contrast ratio calculation to `src/ui/tokens/color.ts`:**

```ts
/**
 * Calculate relative luminance from oklch values.
 * Uses the sRGB-based formula from WCAG 2.1.
 */
export function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculate WCAG 2.1 contrast ratio between two colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a contrast ratio meets WCAG AA requirements.
 */
export function meetsWcagAA(ratio: number, isLargeText: boolean = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
```

**2. Create `src/ui/tokens/contrast-checker.ts`:**

```ts
import { oklchToHex, contrastRatio, meetsWcagAA } from "./color";
import type { ThemeColors } from "./types";

/** Pairs of (background, foreground) token names to validate. */
const CONTRAST_PAIRS: Array<[string, string]> = [
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["destructive", "destructive-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["card", "card-foreground"],
  ["popover", "popover-foreground"],
  ["background", "foreground"],
];

/**
 * Validate color contrast ratios and warn in console.
 * Only runs in development mode. Does nothing in production.
 */
export function validateContrast(colors: ThemeColors): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }

  for (const [bgName, fgName] of CONTRAST_PAIRS) {
    const bgValue = (colors as Record<string, string>)[bgName];
    const fgValue = (colors as Record<string, string>)[fgName];

    if (!bgValue || !fgValue) continue;

    try {
      const bgHex = oklchToHex(bgValue);
      const fgHex = oklchToHex(fgValue);
      const ratio = contrastRatio(bgHex, fgHex);

      if (!meetsWcagAA(ratio)) {
        console.warn(
          `[snapshot a11y] Color contrast warning: "${bgName}" / "${fgName}" ` +
          `has a contrast ratio of ${ratio.toFixed(2)}:1. ` +
          `WCAG AA requires at least 4.5:1 for normal text. ` +
          `Consider adjusting your theme colors.`
        );
      }
    } catch {
      // Color parsing failed — skip silently
    }
  }
}
```

**3. Wire into `ManifestApp`:**

Call `validateContrast()` once during compilation when in dev mode:

```ts
// In compileManifest() or ManifestApp initialization:
if (import.meta.env?.DEV) {
  validateContrast(resolvedTheme.colors);
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/tokens/color.ts` — add `relativeLuminance`, `contrastRatio`, `meetsWcagAA` |
| Create | `src/ui/tokens/contrast-checker.ts` |
| Modify | `src/ui/manifest/app.tsx` — call `validateContrast` in dev mode |

### Tests

| File | What |
|---|---|
| `src/ui/tokens/__tests__/color.test.ts` | Add tests: `contrastRatio` returns correct values for known pairs, `meetsWcagAA` returns true/false correctly. |
| `src/ui/tokens/__tests__/contrast-checker.test.ts` (create) | Tests: warns for low contrast pairs, does not warn for good contrast, does not run in production mode. |

### Exit Criteria

- [ ] `contrastRatio("#ffffff", "#000000")` returns 21.
- [ ] `contrastRatio("#ffffff", "#767676")` returns approximately 4.54 (passes AA).
- [ ] `contrastRatio("#ffffff", "#777777")` returns approximately 4.48 (fails AA).
- [ ] `validateContrast()` logs warning for failing pairs.
- [ ] `validateContrast()` is a no-op in production.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase J.6: Live Regions — `ariaLive` for Dynamic Content

### Goal

Add `ariaLive` prop to components that display dynamic content. When set, the component
wrapper uses `aria-live` to announce content changes to screen readers.

### Implementation

**1. Add `ariaLive` to `baseComponentConfigSchema`:**

```ts
export const baseComponentConfigSchema = z.object({
  // ... existing fields ...
  /** ARIA live region behavior for screen readers. */
  ariaLive: z.enum(["polite", "assertive", "off"]).optional(),
});
```

**2. Update `ComponentWrapper`:**

```tsx
<div
  data-snapshot-component={config.type}
  aria-live={config.ariaLive}
  // ... existing props ...
>
```

**3. Default `ariaLive` for specific components:**

In the stat-card, toast, and notification-bell schemas, set a default:

```ts
// stat-card schema:
ariaLive: z.enum(["polite", "assertive", "off"]).default("polite"),

// toast (in toast action runtime, not schema):
// Toast container already uses aria-live="polite" — verify and keep.
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/manifest/schema.ts` — add `ariaLive` to `baseComponentConfigSchema` |
| Modify | `src/ui/components/_base/component-wrapper.tsx` — pass `aria-live` prop |
| Modify | `src/ui/components/data/stat-card/schema.ts` — default `ariaLive: "polite"` |
| Modify | `src/ui/components/data/notification-bell/schema.ts` — default `ariaLive: "polite"` |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/schema.test.ts` | Add tests: `ariaLive` accepts "polite", "assertive", "off"; optional. |
| `src/ui/components/_base/__tests__/component-wrapper.test.tsx` | Add test: `ariaLive: "polite"` renders `aria-live="polite"`. |
| `src/ui/components/data/stat-card/__tests__/schema.test.ts` | Verify stat-card defaults to `ariaLive: "polite"`. |

### Exit Criteria

- [ ] `{ "type": "stat-card", "ariaLive": "assertive" }` renders with `aria-live="assertive"`.
- [ ] Stat cards default to `aria-live="polite"` when `ariaLive` is not specified.
- [ ] Notification bells default to `aria-live="polite"`.
- [ ] Omitting `ariaLive` on non-defaulted components produces no `aria-live` attribute.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Single track — **A11y**. Most phases modify different files but J.3 and J.6 both modify
`baseComponentConfigSchema`, so they must be sequential.

### Internal Sequencing

| Phase | Depends On | Why |
|---|---|---|
| J.1 | Nothing | Standalone — creates `use-focus-trap.ts`, modifies modal/drawer |
| J.2 | Nothing | Standalone — creates `skip-links.tsx`, modifies app.tsx + schema |
| J.3 | Nothing | Standalone — modifies base schema + component wrapper |
| J.4 | Nothing | Standalone — modifies resolve.ts + app.tsx |
| J.5 | Nothing | Standalone — creates contrast-checker.ts, modifies color.ts |
| J.6 | J.3 | Must come after J.3 since both modify `baseComponentConfigSchema` |

J.1 through J.5 can run in parallel. J.6 runs after J.3.

Recommended sequential order: J.3, J.6, J.1, J.2, J.4, J.5 (group the base schema
changes together, then the standalone phases).

### Branch Strategy

```
branch: phase-j-accessibility
base: main
```

Push branch after each sub-phase. Do not merge until all pass.

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Read all files listed in "Key Files" before modifying.
4. Implement J.3 first (base schema changes), then J.6, then J.1, J.2, J.4, J.5.
5. Run `bun run typecheck && bun test` after each sub-phase.
6. Run `bun run build` at the end.
7. Verify `renderToStaticMarkup` does not throw for any modified component.
8. Verify JSDoc on all new exports.
9. Commit each sub-phase separately.

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All a11y tests pass
```

### Documentation Checks

- [ ] JSDoc on `useFocusTrap`, `SkipLinks`, `validateContrast`, `contrastRatio`,
      `meetsWcagAA`, `relativeLuminance`.
- [ ] All new schema fields have JSDoc comments.
- [ ] `src/ui.ts` exports updated if any new public symbols added.
