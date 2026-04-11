# Phase G: Navigation & Routing — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | G.1 | Route Transitions | Not started | Routing |
> | G.2 | Preloading | Not started | Routing |
> | G.3 | Nested Layouts | Not started | Routing |
> | G.4 | Breadcrumb Auto-Generation | Not started | Components |
> | G.5 | Deep Linking | Not started | State |
> | G.6 | Error Routes | Not started | Routing |
>
> **Priority:** P1 — completes the routing story for production-quality navigation.
> **Depends on:** Phase A (CSS Foundation), Phase B (Layout).
> **Blocks:** Nothing directly — routing enhancements are additive.

---

## Vision

### Before (Today)

Snapshot has a functional manifest-driven router but lacks polish for production navigation:

1. **No route transitions.** `ManifestApp` in `src/ui/manifest/app.tsx` renders the matched
   route's page via `PageRenderer`. Route changes are instant — no enter/exit animations.
   The route config in `src/ui/manifest/schema.ts` has `enter` and `leave` (for guard
   lifecycle) but no CSS transition config.
2. **Preloading is partial.** `src/ui/components/navigation/prefetch-link/` exists as a
   registered component. `src/vite/prefetch.ts` builds a prefetch manifest for JS/CSS asset
   prefetching. But there is no `preload` strategy config on links (`"hover"`, `"visible"`,
   `"eager"`).
3. **No nested layouts.** Route config has `layout` for top-level layout selection, but no
   `children` array for nested routes. There is no `outlet` structural component for rendering
   child routes within a parent layout.
4. **Breadcrumb exists but is not auto-generated.** `src/ui/components/navigation/breadcrumb/`
   is a registered component. It accepts explicit `items`. There is no auto-generation from
   the route hierarchy.
5. **No deep linking for UI state.** Modals have no `urlParam`. Tabs have no `urlSync`
   (addressed in Phase E.3). Opening a modal does not update the URL — sharing the URL does
   not reopen the modal.
6. **Error/not-found routes exist but need verification.** `src/ui/components/feedback/`
   has `default-error`, `default-not-found`, `default-loading`, and `default-offline`
   components. The manifest schema has `notFound` and `error` config. Need to verify they
   work correctly end-to-end.

### After (This Spec)

1. `transition` on route config adds CSS enter/exit animations.
2. `preload` on links controls prefetch strategy.
3. `children` on routes enables nested layouts with `outlet` component.
4. `breadcrumbs` config auto-generates breadcrumbs from route hierarchy.
5. Modal `urlParam` and tabs `urlSync` enable deep linking.
6. Error/not-found routes verified and documented.

---

## What Already Exists on Main

### Router

| File | Lines | What Exists |
|---|---|---|
| `src/ui/manifest/router.ts` | ~100 | `normalizePathname()`, `matchRoutePath()`, `resolveRouteMatch()`. Pattern matching with `{param}` extraction. No nested route resolution. |
| `src/ui/manifest/app.tsx` | ~600 | `ManifestApp` — compiles manifest, matches route, renders `PageRenderer` inside `RouteRuntimeProvider`. Instant route changes. |
| `src/ui/manifest/schema.ts` | ~1400 | `routeConfigSchema`: `path`, `page`, `layout`, `guard`, `enter`, `leave`, `preload`. No `children`, no `transition`. |
| `src/ui/manifest/types.ts` | ~200 | `CompiledRoute`, `ManifestAppProps`, `CompiledManifest`. No nested route types. |
| `src/ui/manifest/renderer.tsx` | ~300 | `PageRenderer`, `ComponentRenderer`. Renders page content. No transition wrapper. |
| `src/ui/manifest/runtime.tsx` | ~300 | `ManifestRuntimeProvider`, `RouteRuntimeProvider`. Provides route context. |

### PrefetchLink Component

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/navigation/prefetch-link/` | ~80 | Registered component. Renders `<a>` with hover-based JS/CSS prefetching via the Vite prefetch manifest. |

### Prefetch Infrastructure

| File | Lines | What Exists |
|---|---|---|
| `src/vite/prefetch.ts` | ~140 | `buildPrefetchManifest()` — maps routes to JS/CSS chunks for `<link rel="prefetch">`. |

### Breadcrumb Component

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/navigation/breadcrumb/` | ~100 | Registered component. Schema accepts `items: [{ label, href, icon }]`. No auto-generation. |

### Feedback Components

| File | What |
|---|---|
| `src/ui/components/feedback/default-error/` | Error page component. |
| `src/ui/components/feedback/default-not-found/` | 404 page component. |
| `src/ui/components/feedback/default-loading/` | Loading spinner component. |
| `src/ui/components/feedback/default-offline/` | Offline banner component. |

### Modal/Drawer

| File | What |
|---|---|
| `src/ui/components/overlay/modal/` | Modal component. No URL param binding. |
| `src/ui/components/overlay/drawer/` | Drawer component. No URL param binding. |

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
| `src/ui/manifest/router.ts` | Route matching | ~100 |
| `src/ui/manifest/app.tsx` | ManifestApp (router + renderer) | ~600 |
| `src/ui/manifest/schema.ts` | All manifest schemas | ~1400 |
| `src/ui/manifest/renderer.tsx` | Page/component renderer | ~300 |
| `src/ui/manifest/runtime.tsx` | Runtime providers | ~300 |
| `src/ui/manifest/types.ts` | Compiled manifest types | ~200 |
| `src/ui/manifest/structural.tsx` | Structural components (row, heading, etc.) | ~500 |
| `src/ui/components/navigation/prefetch-link/` | PrefetchLink component | ~80 |
| `src/ui/components/navigation/breadcrumb/` | Breadcrumb component | ~100 |
| `src/ui/components/overlay/modal/` | Modal component | ~200 |
| `src/vite/prefetch.ts` | Asset prefetch manifest builder | ~140 |

---

## Non-Negotiable Engineering Constraints

1. **Manifest-only** (Rule: Config-Driven UI #6) — transitions, preloading, nested layouts, breadcrumbs all from JSON.
2. **No `any`** (Rule: Code Patterns #3) — strict types on all route config extensions.
3. **SSR safe** (Rule: SSR #3) — transitions use CSS (not JS animations), URL manipulation in `useEffect`.
4. **One code path** (Rule: Config-Driven UI #1) — extend existing router, not a parallel system.
5. **Semantic tokens** — transition animations use `--sn-duration-*` and `--sn-ease-*` tokens.
6. **No new peer dependencies** — CSS transitions, not a JS animation library.
7. **Backwards compatible** — all new props optional, existing routes unchanged.

---

## Phase G.1: Route Transitions

### Goal

Add `transition` config to route definitions. Wraps `PageRenderer` output in a CSS
animation wrapper that applies enter/exit classes on route change.

### Types

```ts
/**
 * Route transition configuration.
 * Uses CSS animations for enter/exit transitions.
 */
export const routeTransitionSchema = z.object({
  /**
   * Enter animation name.
   * Built-in: "fade-in", "slide-left", "slide-right", "slide-up", "slide-down", "scale-in".
   * Custom: any CSS @keyframes name defined in the theme.
   */
  enter: z.string().default("fade-in"),
  /**
   * Exit animation name.
   * Built-in: "fade-out", "slide-left", "slide-right", "slide-up", "slide-down", "scale-out".
   */
  exit: z.string().default("fade-out"),
  /**
   * Animation duration in ms. Uses --sn-duration-normal token by default.
   */
  duration: z.number().int().positive().default(200),
  /**
   * Easing function. Uses --sn-ease-default token by default.
   */
  easing: z.string().default("ease"),
});
```

### Implementation

**1. Create `src/ui/manifest/transition-wrapper.tsx`:**

```tsx
'use client';

import { useEffect, useRef, useState, type ReactNode } from "react";

interface TransitionConfig {
  enter: string;
  exit: string;
  duration: number;
  easing: string;
}

interface TransitionWrapperProps {
  config?: TransitionConfig;
  routeKey: string;
  children: ReactNode;
}

const BUILT_IN_KEYFRAMES = `
@keyframes sn-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sn-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes sn-slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes sn-slide-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes sn-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes sn-slide-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes sn-scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes sn-scale-out { from { transform: scale(1); opacity: 1; } to { transform: scale(0.95); opacity: 0; } }
`;

function resolveKeyframeName(name: string): string {
  const builtIns: Record<string, string> = {
    "fade-in": "sn-fade-in",
    "fade-out": "sn-fade-out",
    "slide-left": "sn-slide-left",
    "slide-right": "sn-slide-right",
    "slide-up": "sn-slide-up",
    "slide-down": "sn-slide-down",
    "scale-in": "sn-scale-in",
    "scale-out": "sn-scale-out",
  };
  return builtIns[name] ?? name;
}

/**
 * Wraps page content with CSS enter/exit animations on route changes.
 */
export function TransitionWrapper({ config, routeKey, children }: TransitionWrapperProps) {
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");
  const prevRouteKey = useRef(routeKey);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config) return;

    // Enter animation
    setPhase("entering");
    const timer = setTimeout(() => setPhase("visible"), config.duration);
    return () => clearTimeout(timer);
  }, [routeKey]);

  if (!config) return <>{children}</>;

  const animationName = phase === "entering"
    ? resolveKeyframeName(config.enter)
    : phase === "exiting"
      ? resolveKeyframeName(config.exit)
      : "none";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BUILT_IN_KEYFRAMES }} />
      <div
        ref={containerRef}
        data-snapshot-transition={phase}
        style={{
          animation: animationName !== "none"
            ? `${animationName} ${config.duration}ms ${config.easing} forwards`
            : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
```

**2. Update `ManifestApp` in `src/ui/manifest/app.tsx`:**

Wrap `PageRenderer` with `TransitionWrapper`:

```tsx
<TransitionWrapper config={currentRoute.transition} routeKey={currentRoute.path}>
  <PageRenderer page={currentRoute.page} />
</TransitionWrapper>
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/transition-wrapper.tsx` |
| Modify | `src/ui/manifest/schema.ts` — add `routeTransitionSchema`, add `transition` to route config |
| Modify | `src/ui/manifest/types.ts` — add `transition` to `CompiledRoute` |
| Modify | `src/ui/manifest/app.tsx` — wrap PageRenderer in TransitionWrapper |
| Modify | `src/ui/manifest/compiler.ts` — include `transition` in compiled route |

### Documentation Impact

- JSDoc on `routeTransitionSchema` and `TransitionWrapper`.
- Document built-in animation names.

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/transition-wrapper.test.tsx` (create) | Tests: renders children, applies enter animation on mount, resolves built-in names, no wrapper when config missing. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `transition` config validates, defaults correct. |

### Exit Criteria

- [ ] `{ "transition": { "enter": "fade-in", "exit": "fade-out" } }` animates route enter/exit.
- [ ] `{ "duration": 300 }` overrides default animation duration.
- [ ] Custom keyframe name (not in built-ins) passes through for theme-defined animations.
- [ ] No transition config renders page instantly (backwards compatible).
- [ ] SSR renders the content without animation (animation starts in `useEffect`).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase G.2: Preloading

### Goal

Add `preload` strategy to link configs and route declarations. Controls when route
resources are prefetched: on hover, when visible in viewport, or eagerly on page load.

### Types

```ts
/**
 * Resource preloading strategy.
 * Controls when a route's JS/CSS/data resources are prefetched.
 */
export const preloadStrategySchema = z.enum([
  /** Prefetch on link hover (default, already exists in PrefetchLink). */
  "hover",
  /** Prefetch when the link enters the viewport (IntersectionObserver). */
  "visible",
  /** Prefetch immediately on page load. */
  "eager",
  /** No prefetching. */
  "none",
]);
```

Add to link/button navigate actions and to PrefetchLink config:

```ts
// In PrefetchLink schema:
preload: preloadStrategySchema.optional(),
```

### Implementation

**1. Update `src/ui/components/navigation/prefetch-link/component.tsx`:**

Currently, PrefetchLink prefetches on hover. Add support for `visible` (via
IntersectionObserver) and `eager` (prefetch on mount):

```tsx
// "visible" strategy:
useEffect(() => {
  if (config.preload !== "visible") return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        prefetchRoute(config.to);
        observer.disconnect();
      }
    },
    { threshold: 0 },
  );
  if (linkRef.current) observer.observe(linkRef.current);
  return () => observer.disconnect();
}, [config.preload, config.to]);

// "eager" strategy:
useEffect(() => {
  if (config.preload === "eager") {
    prefetchRoute(config.to);
  }
}, [config.preload, config.to]);
```

**2. Create `src/ui/manifest/prefetch-routes.ts`:**

```ts
/**
 * Prefetch a route's resources: JS chunks, CSS, and optionally API data.
 */
export function prefetchRoute(path: string, prefetchManifest: PrefetchManifest): void {
  const resources = prefetchManifest[path];
  if (!resources) return;

  for (const url of resources.js ?? []) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "script";
    link.href = url;
    document.head.appendChild(link);
  }

  for (const url of resources.css ?? []) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "style";
    link.href = url;
    document.head.appendChild(link);
  }
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/prefetch-routes.ts` |
| Modify | `src/ui/components/navigation/prefetch-link/schema.ts` — add `preload` |
| Modify | `src/ui/components/navigation/prefetch-link/component.tsx` — visible + eager strategies |
| Modify | `src/ui/manifest/schema.ts` — add `preloadStrategySchema` |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/prefetch-routes.test.ts` (create) | Tests: creates prefetch link elements, skips unknown routes, deduplicates. |
| `src/ui/components/navigation/prefetch-link/__tests__/schema.test.ts` | Add: `preload` values accepted. |

### Exit Criteria

- [ ] `{ "preload": "hover" }` prefetches on hover (existing behavior, now explicit).
- [ ] `{ "preload": "visible" }` prefetches when link scrolls into view.
- [ ] `{ "preload": "eager" }` prefetches immediately on mount.
- [ ] `{ "preload": "none" }` disables prefetching.
- [ ] Default behavior unchanged (hover).
- [ ] SSR safe — IntersectionObserver in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase G.3: Nested Layouts

### Goal

Add `children` array to route config for nested routes. Add `outlet` structural component
that renders the matched child route. The parent layout wraps child routes.

### Types

```ts
/**
 * Route config schema with nested children.
 * Children inherit the parent's path prefix and layout.
 */
export const routeConfigSchema: z.ZodType<RouteConfig> = z.lazy(() =>
  z.object({
    // ... existing: path, page, layout, guard, enter, leave, preload, transition ...
    /**
     * Nested child routes. Each child's path is relative to the parent.
     * The parent route must include an "outlet" component in its page
     * to render the matched child.
     */
    children: z.array(routeConfigSchema).optional(),
  }),
);
```

Add `outlet` structural component:

```ts
/**
 * Outlet component — renders the matched child route's page content.
 * Used inside parent route pages for nested layouts.
 */
export const outletComponentSchema = z.object({
  type: z.literal("outlet"),
  /** Optional fallback when no child route matches. */
  fallback: z.array(componentConfigSchema).optional(),
});
```

### Implementation

**1. Update `src/ui/manifest/compiler.ts`:**

Flatten nested routes into a route table with full paths:

```ts
function compileRoutes(routes: RouteConfig[], parentPath: string = ""): CompiledRoute[] {
  const compiled: CompiledRoute[] = [];

  for (const route of routes) {
    const fullPath = parentPath + route.path;
    compiled.push({
      ...compileRoute(route),
      path: fullPath,
      parentPath: parentPath || null,
      children: route.children ? compileRoutes(route.children, fullPath) : undefined,
    });

    // Also add child routes to the flat list
    if (route.children) {
      compiled.push(...compileRoutes(route.children, fullPath));
    }
  }

  return compiled;
}
```

**2. Update `src/ui/manifest/router.ts`:**

Route matching must handle nested paths. When a nested route matches, both the parent and
child routes are active. The parent renders its page (with the outlet), and the outlet
renders the child's page.

```ts
export interface RouteMatch {
  route: CompiledRoute;
  params: Record<string, string>;
  /** Parent route matches for nested layouts. */
  parents: CompiledRoute[];
  /** Child route match (for outlet rendering). */
  childRoute?: CompiledRoute;
}
```

**3. Register `outlet` in `src/ui/manifest/structural.tsx`:**

```tsx
function OutletComponent({ config }: { config: { fallback?: ComponentConfig[] } }) {
  const { childRoute } = useRouteRuntime();

  if (!childRoute) {
    if (config.fallback) {
      return <>{config.fallback.map((c, i) => <ComponentRenderer key={i} config={c} />)}</>;
    }
    return null;
  }

  return <PageRenderer page={childRoute.page} />;
}
```

**4. Update ManifestApp** to provide child route info via `RouteRuntimeProvider`.

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/manifest/schema.ts` — make `routeConfigSchema` recursive (children), add `outletComponentSchema` |
| Modify | `src/ui/manifest/compiler.ts` — flatten nested routes |
| Modify | `src/ui/manifest/router.ts` — nested route matching, `RouteMatch` type |
| Modify | `src/ui/manifest/structural.tsx` — add `OutletComponent` |
| Modify | `src/ui/manifest/types.ts` — `childRoute` on `CompiledRoute`, `RouteMatch` |
| Modify | `src/ui/manifest/runtime.tsx` — provide `childRoute` in route runtime |
| Modify | `src/ui/manifest/app.tsx` — render parent + child routes |
| Modify | `src/ui/manifest/component-registry.tsx` — register `outlet` component |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/router.test.ts` | Add: nested route matching, parent + child resolution, params from both levels. |
| `src/ui/manifest/__tests__/compiler.test.ts` | Add: nested routes flatten correctly, full paths computed. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `children` array accepted, `outlet` component validates. |

### Exit Criteria

- [ ] Route with `children` renders parent layout wrapping child content.
- [ ] `{ "type": "outlet" }` in parent page renders the matched child's page.
- [ ] Child paths are relative: parent `/settings` + child `/profile` matches `/settings/profile`.
- [ ] Route params from both parent and child are available in context.
- [ ] Outlet with `fallback` renders fallback when no child matches.
- [ ] Existing flat routes still work (backwards compatible).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase G.4: Breadcrumb Auto-Generation

### Goal

Add `manifest.app.breadcrumbs` config that auto-generates breadcrumb items from the route
hierarchy. The existing breadcrumb component renders them.

### Types

```ts
/**
 * Automatic breadcrumb generation config.
 */
export const breadcrumbAutoConfigSchema = z.object({
  /** Enable auto-generation from route hierarchy. */
  auto: z.boolean().default(false),
  /** Home breadcrumb item (always first). */
  home: z.object({
    label: z.string().default("Home"),
    icon: z.string().optional(),
    href: z.string().default("/"),
  }).optional(),
  /** Separator between breadcrumb items. Default: "/". */
  separator: z.string().default("/"),
  /** Label overrides for specific route paths. */
  labels: z.record(z.string(), z.string()).optional(),
});
```

### Implementation

**1. Create `src/ui/manifest/breadcrumbs.ts`:**

```ts
import type { CompiledRoute, RouteMatch } from "./types";

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: string;
  isCurrent: boolean;
}

export interface BreadcrumbAutoConfig {
  auto: boolean;
  home?: { label: string; icon?: string; href: string };
  separator: string;
  labels?: Record<string, string>;
}

/**
 * Generate breadcrumb items from the current route match and route hierarchy.
 */
export function generateBreadcrumbs(
  match: RouteMatch,
  config: BreadcrumbAutoConfig,
  allRoutes: CompiledRoute[],
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Home
  if (config.home) {
    items.push({
      label: config.home.label,
      href: config.home.href,
      icon: config.home.icon,
      isCurrent: match.route.path === config.home.href,
    });
  }

  // Build path segments
  const segments = match.route.path.split("/").filter(Boolean);
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += "/" + segments[i];
    const isLast = i === segments.length - 1;

    // Try to find a route for this path
    const route = allRoutes.find((r) => r.path === currentPath);
    const label = config.labels?.[currentPath]
      ?? route?.page?.title
      ?? formatSegment(segments[i]!);

    items.push({
      label,
      href: currentPath,
      isCurrent: isLast,
    });
  }

  return items;
}

/**
 * Convert a URL segment to a human-readable label.
 * "user-settings" → "User Settings"
 */
function formatSegment(segment: string): string {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

**2. Create `src/ui/hooks/use-auto-breadcrumbs.ts`:**

```ts
'use client';

import { useMemo } from "react";
import { useRouteRuntime, useManifestRuntime } from "../manifest/runtime";
import { generateBreadcrumbs, type BreadcrumbAutoConfig, type BreadcrumbItem } from "../manifest/breadcrumbs";

/**
 * Hook that returns auto-generated breadcrumb items for the current route.
 */
export function useAutoBreadcrumbs(config: BreadcrumbAutoConfig | undefined): BreadcrumbItem[] {
  const routeRuntime = useRouteRuntime();
  const manifestRuntime = useManifestRuntime();

  return useMemo(() => {
    if (!config?.auto) return [];
    return generateBreadcrumbs(
      routeRuntime.match,
      config,
      manifestRuntime.routes,
    );
  }, [config, routeRuntime.match, manifestRuntime.routes]);
}
```

**3. Update breadcrumb component** to use `useAutoBreadcrumbs` when no explicit `items`
are provided and `auto: true` is in the app config.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/breadcrumbs.ts` |
| Create | `src/ui/hooks/use-auto-breadcrumbs.ts` |
| Modify | `src/ui/manifest/schema.ts` — add `breadcrumbAutoConfigSchema`, add `breadcrumbs` to app config |
| Modify | `src/ui/manifest/types.ts` — add `breadcrumbs` to compiled manifest app |
| Modify | `src/ui/components/navigation/breadcrumb/component.tsx` — auto-breadcrumb fallback |
| Modify | `src/ui/components/navigation/breadcrumb/schema.ts` — allow empty `items` when auto is enabled |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/breadcrumbs.test.ts` (create) | Tests: generates from route path, includes home, uses label overrides, formats segments, marks current. |
| `src/ui/components/navigation/breadcrumb/__tests__/schema.test.ts` | Add: accepts empty items. |

### Exit Criteria

- [ ] `{ "app": { "breadcrumbs": { "auto": true, "home": { "label": "Home" } } } }` auto-generates breadcrumbs.
- [ ] Route `/settings/profile` generates: Home > Settings > Profile.
- [ ] `labels` override auto-generated labels: `{ "/settings": "Config" }`.
- [ ] `{param}` segments resolve to the actual param value.
- [ ] Explicit breadcrumb `items` take precedence over auto-generation.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase G.5: Deep Linking

### Goal

Add `urlParam` to modal/drawer configs and verify tabs `urlSync` (from Phase E.3). Opening
a modal updates the URL; loading the URL reopens the modal.

### Types

```ts
// Add to modal/drawer schema:
/**
 * URL parameter name for deep linking.
 * When set, opening the modal adds ?{urlParam}=1 to the URL.
 * Loading a URL with this param opens the modal automatically.
 */
urlParam: z.string().optional(),
```

### Implementation

**1. Update modal/drawer components:**

```tsx
// In modal component:
const { urlParam } = config;

// On mount: check URL for param
useEffect(() => {
  if (!urlParam || typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.has(urlParam)) {
    openModal();
  }
}, [urlParam]);

// On open: add param to URL
useEffect(() => {
  if (!urlParam || !isOpen || typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set(urlParam, "1");
  window.history.replaceState(null, "", url.pathname + url.search);

  return () => {
    // On close: remove param
    const url = new URL(window.location.href);
    url.searchParams.delete(urlParam);
    window.history.replaceState(null, "", url.pathname + url.search);
  };
}, [urlParam, isOpen]);
```

**2. Wire `open-modal` action** to support URL params. When executing `open-modal` for a
modal with `urlParam`, the URL is updated.

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/components/overlay/modal/schema.ts` — add `urlParam` |
| Modify | `src/ui/components/overlay/modal/component.tsx` — URL sync |
| Modify | `src/ui/components/overlay/drawer/schema.ts` — add `urlParam` |
| Modify | `src/ui/components/overlay/drawer/component.tsx` — URL sync |
| Modify | `src/ui/actions/modal-manager.ts` — pass urlParam context |

### Tests

| File | What |
|---|---|
| `src/ui/components/overlay/modal/__tests__/component.test.tsx` | Add: urlParam adds to URL, removes on close, opens from URL on mount. |
| `src/ui/components/overlay/drawer/__tests__/component.test.tsx` | Add: same urlParam tests. |
| `src/ui/components/overlay/modal/__tests__/schema.test.ts` | Add: `urlParam` accepted. |

### Exit Criteria

- [ ] `{ "urlParam": "details" }` on modal adds `?details=1` when opened.
- [ ] Loading a URL with `?details=1` auto-opens the modal.
- [ ] Closing the modal removes the URL param.
- [ ] Multiple modals with different `urlParam` values coexist.
- [ ] SSR safe — URL read in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase G.6: Error Routes

### Goal

Verify that `manifest.app.notFound` and `manifest.app.error` configs work correctly
end-to-end. The feedback components at `src/ui/components/feedback/` render when appropriate.
Fix any gaps discovered during verification.

### Implementation

**1. Audit checklist:**

- [ ] Navigating to an unknown path renders the `notFound` page.
- [ ] The `notFound` config (`notFoundConfigSchema`) is compiled and passed to ManifestApp.
- [ ] ManifestApp renders `DefaultNotFound` when no route matches.
- [ ] An unhandled error in a component renders the `error` page.
- [ ] The error boundary in `ComponentWrapper` catches component errors.
- [ ] The `error` config (`errorPageConfigSchema`) is compiled and applied.
- [ ] The `DefaultError` component displays the error message.
- [ ] Both `notFound` and `error` pages use semantic tokens.
- [ ] Both render correctly in SSR.

**2. Fix any gaps:**

Common gaps to check:
- NotFound may not render the consumer's custom `notFound` config (may use hardcoded default).
- Error boundary may not use the consumer's `error` config.
- Custom action on error page (e.g., "Go Home" button) may not work.

**3. Update manifest schema if needed** to ensure `notFound` and `error` accept action
configs for buttons.

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify (if needed) | `src/ui/manifest/app.tsx` — verify notFound/error rendering |
| Modify (if needed) | `src/ui/components/feedback/default-not-found/component.tsx` — verify token usage, actions |
| Modify (if needed) | `src/ui/components/feedback/default-error/component.tsx` — verify token usage, actions |
| Modify (if needed) | `src/ui/components/_base/component-wrapper.tsx` — verify error boundary uses manifest config |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/app.test.tsx` | Add: unknown route renders notFound page, error in component renders error page. |
| `src/ui/components/feedback/__tests__/default-not-found.test.tsx` | Verify: renders with config, action button works. |
| `src/ui/components/feedback/__tests__/default-error.test.tsx` | Verify: renders with error message, retry action works. |

### Exit Criteria

- [ ] Unknown URL renders consumer-configured `notFound` page (or default).
- [ ] Component error renders consumer-configured `error` page (or default).
- [ ] `notFound` page has a working "Go Home" or custom action button.
- [ ] `error` page has a working "Retry" or custom action button.
- [ ] Both pages use `--sn-*` semantic tokens.
- [ ] SSR renders both pages correctly.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Three tracks:

| Track | Phases | Files Owned |
|---|---|---|
| Routing | G.1, G.2, G.3, G.6 | `src/ui/manifest/transition-wrapper.tsx`, `src/ui/manifest/prefetch-routes.ts`, router/compiler/app modifications |
| Components | G.4 | `src/ui/manifest/breadcrumbs.ts`, `src/ui/hooks/use-auto-breadcrumbs.ts`, breadcrumb component |
| State | G.5 | Modal/drawer URL param logic |

### Why Tracks Are Independent

- **Routing** modifies the router, compiler, and ManifestApp for core routing features.
- **Components** only touches breadcrumb generation — new files plus breadcrumb component.
- **State** only touches modal/drawer components for URL param binding.

### File Conflicts

- **G.1 and G.3** both modify `src/ui/manifest/app.tsx`. Run G.1 first (simpler), then G.3.
- **G.3** modifies `router.ts`, `compiler.ts`, `schema.ts` — the most complex change. Must be last in the Routing track.
- **G.2** modifies PrefetchLink component — independent of G.1/G.3.
- **G.4** is fully independent.
- **G.5** is fully independent.
- **G.6** may modify `app.tsx` — run after G.1 and G.3.

### Recommended Order

1. **G.6** (error routes — audit first, may reveal issues)
2. **G.1** (transitions — contained to new wrapper)
3. **G.2** (preloading — updates PrefetchLink)
4. **G.5** (deep linking — modal/drawer only)
5. **G.4** (breadcrumbs — new utility + component update)
6. **G.3** (nested layouts — most complex, touches many files)

### Branch Strategy

```
branch: phase-g-navigation
base: main
```

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Audit existing router and feedback components before starting.
4. Start with G.6 (verification — may surface issues that affect other phases).
5. For each phase:
   a. Create/modify files exactly as listed.
   b. Add JSDoc to all new exports.
   c. Run `bun run typecheck && bun test`.
   d. Run `bun run format:check`.
   e. Commit with message: `feat(phase-g.N): <title>`.
6. After all phases:
   a. Run `bun run build`.
   b. Test route transitions visually if possible.
   c. Verify SSR safety.
7. Push branch, do not merge.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| G.1 transition flicker on SSR | Content renders statically on server; animation starts in useEffect on client. |
| G.3 nested routes complexity | Comprehensive router tests for 3+ levels of nesting, wildcard params, index routes. |
| G.4 breadcrumb param resolution | Test with dynamic segments like `{userId}`. |
| G.5 URL param collisions | Namespace modal params or validate uniqueness at compile time. |

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Per-Track Checks

- [ ] No `any` casts.
- [ ] All new exports have JSDoc.
- [ ] SSR safe — no `window`/`document` in render body.
- [ ] All animations use `--sn-*` token variables.

### Documentation Checks

- [ ] JSDoc on `routeTransitionSchema`, `preloadStrategySchema`, `breadcrumbAutoConfigSchema`.
- [ ] JSDoc on `TransitionWrapper`, `generateBreadcrumbs`, `useAutoBreadcrumbs`, `OutletComponent`.
- [ ] All new schema fields documented with JSDoc.
- [ ] `src/ui.ts` exports updated for new hooks.

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All navigation tests pass
```

- [ ] All 6 sub-phases have passing tests.
- [ ] Route transitions animate smoothly.
- [ ] Preloading works for all three strategies.
- [ ] Nested layouts render correctly with outlet.
- [ ] Breadcrumbs auto-generate from route hierarchy.
- [ ] Modal deep linking round-trips correctly.
- [ ] Error/not-found pages work end-to-end.
- [ ] No TypeScript required for any navigation feature.
