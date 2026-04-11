# Phase K: Performance — Production Scale — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | K.1 | Virtual Lists — IntersectionObserver-based virtualization | Not started | Runtime |
> | K.2 | Code Splitting by Route — Vite plugin auto-splits pages | Not started | Vite |
> | K.3 | Image Optimization — lazy loading, placeholders, sizes | Not started | Components |
> | K.4 | Resource Prefetching — start API calls before page renders | Not started | Runtime |
> | K.5 | Suspense Boundaries — `suspense` prop on container components | Not started | Runtime |
>
> **Priority:** P2 — required for production at scale, not blocking core features.
> **Depends on:** Phase A (CSS Foundation), Phase B (Layout).
> **Blocks:** Nothing — performance is additive.

---

## Vision

### Before (Today)

Snapshot renders every component synchronously and loads all data after mount. At small
scale (< 100 items, < 10 pages), this works fine. At production scale:

1. **Large lists render all items.** A data-table or list with 1000+ items renders every
   row in the DOM. No virtualization.
2. **All component code is in one bundle.** Every page's component tree is loaded upfront.
   There is no route-based code splitting for the manifest-driven component tree.
3. **Images load eagerly.** The existing `SnapshotImage` component has `priority` (eager)
   and `placeholder: "blur"` support, but there is no `loading: "lazy"` support in the
   manifest schema and no skeleton placeholder variant.
4. **No route-level data prefetching.** API calls start after the page component mounts.
   There is a `prefetch-manifest.json` for JS/CSS asset prefetching but no API data
   prefetching tied to route navigation.
5. **No Suspense boundaries.** Components cannot declare Suspense fallbacks from manifest.
   Loading states are handled per-component via `useComponentData` but there is no way to
   group components under a shared Suspense boundary with a skeleton fallback.

### After (This Spec)

1. `virtualize: true` on data-table and list components renders only visible items.
2. Vite plugin auto-splits each page's component tree into lazy-loaded chunks.
3. Image component supports `loading: "lazy"`, `placeholder: "skeleton"`, `sizes`.
4. Routes can declare `prefetch` endpoints that start fetching before the page renders.
5. Container components accept `suspense` prop with configurable fallback.

---

## What Already Exists on Main

### Data Table (NO virtualization)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/data/data-table/component.tsx` | ~600 | Renders all rows. Uses `useComponentData` for data fetching. Pagination is client-side offset. No IntersectionObserver. |
| `src/ui/components/data/data-table/schema.ts` | ~100 | `dataTableConfigSchema`: columns, pagination, actions, searchable, emptyMessage. No `virtualize` prop. |

### Image Component (PARTIAL)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/media/image/schema.ts` | 59 | `snapshotImageSchema`: `src`, `width`, `height`, `quality`, `format`, `sizes`, `priority`, `placeholder` (blur/empty), `alt`. Has `sizes` but no `loading`. |
| `src/ui/components/media/image/component.tsx` | ~120 | Renders `<img>` with optimization URL. Uses `loading="eager"` when `priority: true`, otherwise no `loading` attribute. |

### Vite Plugin (NO route-level code splitting)

| File | Lines | What Exists |
|---|---|---|
| `src/vite/index.ts` | 995 | `snapshotApp()` creates a single virtual entry point. All component code is in one bundle. `snapshotSsr()` handles asset splitting for SSR but not route-level splitting for SPA. |
| `src/vite/prefetch.ts` | ~140 | `buildPrefetchManifest()` maps file-system routes to JS/CSS chunks. This is for `<PrefetchLink>` asset prefetching, not API data prefetching. |

### Route Config (NO prefetch)

| File | Lines | What Exists |
|---|---|---|
| `src/ui/manifest/schema.ts` (routeConfigSchema) | ~50 | Route config has `enter`, `leave`, `guard`, `preload`. `preload` accepts endpoint targets for TanStack Query prefetching. No `prefetch` for pre-navigation API calls. |

### Suspense (NO manifest support)

| File | What |
|---|---|
| `src/ui/components/_base/component-wrapper.tsx` | Wraps components in an error boundary. No Suspense boundary. |

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
| `src/ui/components/data/data-table/component.tsx` | DataTable component | ~600 |
| `src/ui/components/data/data-table/schema.ts` | DataTable schema | ~100 |
| `src/ui/components/media/image/schema.ts` | Image schema | 59 |
| `src/ui/components/media/image/component.tsx` | Image component | ~120 |
| `src/vite/index.ts` | Vite plugin | 995 |
| `src/vite/prefetch.ts` | Prefetch manifest builder | ~140 |
| `src/ui/manifest/schema.ts` | All manifest schemas | ~1400 |
| `src/ui/manifest/compiler.ts` | `compileManifest()` | ~600 |
| `src/ui/components/_base/component-wrapper.tsx` | ComponentWrapper | 181 |

---

## Non-Negotiable Engineering Constraints

1. **SSR safe** — IntersectionObserver only in `useEffect`. Suspense fallback must render
   on server.
2. **Manifest-only** — all performance features configurable from JSON.
3. **No `any`** — strict types on all new props and hooks.
4. **Semantic tokens only** — skeleton placeholders use `--sn-*` tokens.
5. **No new peer dependencies** — virtualization implemented in-house.
6. **Backwards compatible** — `virtualize` defaults to `false`, existing behavior unchanged.
7. **Tree-shakeable** — virtualization code must not be bundled if not used.

---

## Phase K.1: Virtual Lists — IntersectionObserver-Based Virtualization

### Goal

Add `virtualize: true` prop to data-table and list components. When enabled, only render
items that are visible in the viewport plus an overscan buffer.

### Types

Add to data-table schema in `src/ui/components/data/data-table/schema.ts`:

```ts
/**
 * Virtualization config for large datasets.
 * When enabled, only visible rows are rendered in the DOM.
 */
virtualize: z.union([
  z.boolean(),
  z.object({
    /** Estimated height of each row in pixels. Required for scroll calculations. */
    itemHeight: z.number().positive().default(48),
    /** Number of items to render above/below the visible area. */
    overscan: z.number().int().nonnegative().default(5),
  }),
]).optional(),
```

### Implementation

**1. Create `src/ui/hooks/use-virtual-list.ts`:**

```ts
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export interface UseVirtualListOptions {
  /** Total number of items. */
  totalCount: number;
  /** Height of each item in pixels. */
  itemHeight: number;
  /** Number of extra items to render above/below viewport. */
  overscan: number;
}

export interface UseVirtualListResult {
  /** Ref to attach to the scrollable container. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Total height of all items (for scroll sizing). */
  totalHeight: number;
  /** Start index of visible range (inclusive). */
  startIndex: number;
  /** End index of visible range (exclusive). */
  endIndex: number;
  /** Offset in pixels for the first visible item. */
  offsetTop: number;
  /** Array of visible item indices. */
  visibleIndices: number[];
}

/**
 * Headless hook for list virtualization.
 *
 * Observes the scroll position of a container element and calculates
 * which items should be rendered based on viewport visibility.
 *
 * @param options - Virtualization configuration
 * @returns Virtual list state for rendering
 */
export function useVirtualList(options: UseVirtualListOptions): UseVirtualListResult {
  const { totalCount, itemHeight, overscan } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Observe container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const totalHeight = totalCount * itemHeight;

  const startIndex = useMemo(() => {
    const raw = Math.floor(scrollTop / itemHeight) - overscan;
    return Math.max(0, raw);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const raw = Math.floor(scrollTop / itemHeight) + visibleCount + overscan;
    return Math.min(totalCount, raw);
  }, [scrollTop, containerHeight, itemHeight, overscan, totalCount]);

  const offsetTop = startIndex * itemHeight;

  const visibleIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      indices.push(i);
    }
    return indices;
  }, [startIndex, endIndex]);

  return {
    containerRef,
    totalHeight,
    startIndex,
    endIndex,
    offsetTop,
    visibleIndices,
  };
}
```

**2. Update `src/ui/components/data/data-table/component.tsx`:**

When `virtualize` is truthy, wrap the table body in a virtual scroll container:

```tsx
import { useVirtualList } from "../../../hooks/use-virtual-list";

// Inside DataTable component:
const virtualConfig = typeof config.virtualize === "object"
  ? config.virtualize
  : config.virtualize
    ? { itemHeight: 48, overscan: 5 }
    : null;

// If virtualConfig is set, use virtual rendering:
if (virtualConfig) {
  const { containerRef, totalHeight, offsetTop, visibleIndices } =
    useVirtualList({
      totalCount: rows.length,
      itemHeight: virtualConfig.itemHeight,
      overscan: virtualConfig.overscan,
    });

  return (
    <div ref={containerRef} style={{ overflow: "auto", maxHeight: "600px" }}>
      <table>
        <thead>...</thead>
        <tbody>
          <tr style={{ height: offsetTop }} aria-hidden="true"><td colSpan={columns.length} /></tr>
          {visibleIndices.map((index) => {
            const row = rows[index];
            return <TableRow key={row.id ?? index} row={row} ... />;
          })}
          <tr style={{ height: totalHeight - (visibleIndices.length * virtualConfig.itemHeight) - offsetTop }} aria-hidden="true">
            <td colSpan={columns.length} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/hooks/use-virtual-list.ts` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `virtualize` prop |
| Modify | `src/ui/components/data/data-table/component.tsx` — virtual rendering path |
| Modify | `src/ui/components/data/data-table/types.ts` — update `DataTableConfig` type |
| Modify | `src/ui.ts` — export `useVirtualList` hook and types |

### Documentation Impact

- JSDoc on `useVirtualList`.
- Update `docs/components.md` — data-table section with virtualization docs.

### Tests

| File | What |
|---|---|
| `src/ui/hooks/__tests__/use-virtual-list.test.ts` (create) | Tests: calculates correct start/end indices, overscan extends range, empty list returns empty indices, respects container height. |
| `src/ui/components/data/data-table/__tests__/schema.test.ts` | Add tests: `virtualize: true` accepted, `virtualize: { itemHeight: 60 }` accepted, defaults correct. |

### Exit Criteria

- [ ] `{ "type": "data-table", "virtualize": true }` renders only visible rows.
- [ ] `{ "virtualize": { "itemHeight": 60, "overscan": 10 } }` uses custom height and overscan.
- [ ] Scrolling reveals additional rows dynamically.
- [ ] Total scroll height matches total item count * item height.
- [ ] `virtualize` defaults to `undefined` (no virtualization — backwards compatible).
- [ ] SSR render does not throw (IntersectionObserver/ResizeObserver in `useEffect` only).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase K.2: Code Splitting by Route — Vite Plugin Auto-Splits Pages

### Goal

Enhance the `snapshotApp()` Vite plugin to auto-split each page's component tree into
separate chunks. Components are lazy-loaded on first use when their page route is visited.

### Implementation

**1. Update virtual entry module in `src/vite/index.ts`:**

Instead of importing `ManifestApp` which registers all components eagerly via
`bootBuiltins()`, generate a virtual entry that lazy-imports component registrations
per page.

The approach: the Vite plugin reads the manifest file at build time, extracts which
component types each page uses, and generates dynamic imports grouped by route.

```ts
// In snapshotApp() plugin, load() hook:
function generateLazyEntry(manifest: unknown, apiUrlExpression: string): string {
  // Parse manifest to find which component types are used per route
  const routes = extractRouteComponentTypes(manifest);

  return `
import "${VIRTUAL_GLOBALS_ID}";
import { createElement, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ManifestApp } from "@lastshotlabs/snapshot/ui";

// Lazy component registrations will be loaded on demand
import manifest from ${JSON.stringify(manifestUrl)};

const apiUrl = ${apiUrlExpression};
const root = document.getElementById("root");
if (!root) {
  throw new Error("Snapshot app shell is missing #root");
}

createRoot(root).render(
  createElement(ManifestApp, {
    manifest,
    apiUrl,
    lazyComponents: true,
  }),
);
`;
}
```

**2. Add `lazyComponents` prop to `ManifestApp`:**

When `lazyComponents: true`, `ManifestApp` defers component registration until a route
that uses the component is visited. Components are grouped by the `type` field in the
manifest.

```ts
// In ManifestApp:
if (props.lazyComponents) {
  // Register only the component types used by the current route
  const routeTypes = extractComponentTypes(currentRoute.page.content);
  await registerComponentsForTypes(routeTypes);
}
```

**3. Create `src/ui/manifest/lazy-registry.ts`:**

```ts
/**
 * Lazy component registration — loads component modules on demand.
 *
 * Instead of importing all component schemas and React components at boot time,
 * this module dynamically imports them when first needed.
 */

const loadedTypes = new Set<string>();

const COMPONENT_LOADERS: Record<string, () => Promise<void>> = {
  "data-table": async () => {
    const { dataTableConfigSchema } = await import("../components/data/data-table/schema");
    const { DataTable } = await import("../components/data/data-table/index");
    registerComponent("data-table", DataTable);
    registerComponentSchema("data-table", dataTableConfigSchema);
  },
  // ... one entry per component type
};

export async function ensureComponentsLoaded(types: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const type of types) {
    if (loadedTypes.has(type)) continue;
    loadedTypes.add(type);
    const loader = COMPONENT_LOADERS[type];
    if (loader) {
      promises.push(loader());
    }
  }
  await Promise.all(promises);
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/lazy-registry.ts` |
| Modify | `src/vite/index.ts` — generate lazy entry with route analysis |
| Modify | `src/ui/manifest/app.tsx` — `lazyComponents` prop support |
| Modify | `src/ui/manifest/types.ts` — add `lazyComponents` to `ManifestAppProps` |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/lazy-registry.test.ts` (create) | Tests: `ensureComponentsLoaded(["data-table"])` registers the schema, calling twice does not double-register, unknown type is silently skipped. |
| `src/vite/__tests__/plugin.test.ts` | Add test: `snapshotApp()` with manifest generates valid entry module. |

### Exit Criteria

- [ ] `snapshotApp({ lazyComponents: true })` generates entry with lazy loading.
- [ ] Visiting a route lazy-loads only that route's component types.
- [ ] Previously loaded types are cached and not re-imported.
- [ ] `bun run build` produces multiple chunks (one per component group).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase K.3: Image Optimization — Lazy Loading, Placeholders, Sizes

### Goal

Enhance the `SnapshotImage` component schema to support `loading: "lazy"`, a `"skeleton"`
placeholder variant, and better `sizes` documentation. Wire these into the component
render.

### Implementation

**1. Update `src/ui/components/media/image/schema.ts`:**

```ts
export const snapshotImageSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive().max(4096),
  height: z.number().int().positive().max(4096).optional(),
  quality: z.number().int().min(1).max(100).default(75),
  format: z.enum(["avif", "webp", "jpeg", "png", "original"]).default("original"),
  sizes: z.string().optional(),
  priority: z.boolean().default(false),
  /**
   * Loading strategy for the image.
   * - "eager" — load immediately (default when priority is true)
   * - "lazy" — defer loading until near viewport (default when priority is false)
   */
  loading: z.enum(["eager", "lazy"]).optional(),
  /**
   * Placeholder strategy while the image loads.
   * - "blur" — renders a blurred background color div
   * - "skeleton" — renders an animated skeleton pulse
   * - "empty" — no placeholder
   * @default "empty"
   */
  placeholder: z.enum(["blur", "skeleton", "empty"]).default("empty"),
  alt: z.string(),
  className: z.string().optional(),
  /** Aspect ratio to maintain. e.g. "16/9", "1/1", "4/3" */
  aspectRatio: z.string().optional(),
});
```

**2. Update `src/ui/components/media/image/component.tsx`:**

```tsx
// Resolve loading attribute
const loading = config.loading ?? (config.priority ? "eager" : "lazy");

// Skeleton placeholder
const [loaded, setLoaded] = useState(config.priority);
const showSkeleton = config.placeholder === "skeleton" && !loaded;

return (
  <div
    data-snapshot-component="image"
    className={config.className}
    style={{
      position: "relative",
      overflow: "hidden",
      aspectRatio: config.aspectRatio,
      width: config.width,
    }}
  >
    {showSkeleton && (
      <div
        data-snapshot-image-skeleton=""
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--sn-color-muted, #f3f4f6)",
          animation: "snapshot-skeleton-pulse 2s ease-in-out infinite",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
        }}
      />
    )}
    <img
      src={optimizedUrl}
      alt={config.alt}
      width={config.width}
      height={config.height}
      loading={loading}
      sizes={config.sizes}
      onLoad={() => setLoaded(true)}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        opacity: loaded || config.placeholder === "empty" ? 1 : 0,
        transition: "opacity var(--sn-duration-normal, 200ms) var(--sn-ease-default, ease)",
      }}
    />
  </div>
);
```

**3. Add skeleton animation to framework styles in `src/ui/tokens/resolve.ts`:**

```css
@keyframes snapshot-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/components/media/image/schema.ts` — add `loading`, `skeleton` placeholder, `aspectRatio` |
| Modify | `src/ui/components/media/image/component.tsx` — lazy loading, skeleton placeholder |
| Modify | `src/ui/components/media/image/types.ts` — type auto-updates |
| Modify | `src/ui/tokens/resolve.ts` — add skeleton pulse keyframe |

### Tests

| File | What |
|---|---|
| `src/ui/components/media/image/__tests__/schema.test.ts` | Add tests: `loading: "lazy"` accepted, `placeholder: "skeleton"` accepted, `aspectRatio` accepted, `loading` defaults correctly based on `priority`. |
| `src/ui/components/media/image/__tests__/component.test.tsx` | Add tests: lazy image renders with `loading="lazy"`, skeleton placeholder shown before load, skeleton hidden after onLoad. |

### Exit Criteria

- [ ] `{ "loading": "lazy" }` renders `<img loading="lazy">`.
- [ ] Default loading is `"lazy"` unless `priority: true`.
- [ ] `{ "placeholder": "skeleton" }` renders a pulsing skeleton before image loads.
- [ ] Skeleton disappears when image `onLoad` fires.
- [ ] `{ "aspectRatio": "16/9" }` sets CSS `aspect-ratio` on the wrapper.
- [ ] Framework CSS includes `snapshot-skeleton-pulse` keyframe.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase K.4: Resource Prefetching — Start API Calls Before Page Renders

### Goal

Add `prefetch` array to route config. When a user navigates toward a route (link hover or
route match), start API calls for the declared endpoints before the page component mounts.

### Types

The route config already has `preload` for TanStack Query prefetching. We extend this
with `prefetch` for broader use:

```ts
// In routeConfigSchema:
/**
 * Endpoints to prefetch when this route is about to be entered.
 * Triggered on link hover (via PrefetchLink) or route match.
 * Values are endpoint target strings like "GET /api/users".
 */
prefetch: z.array(endpointTargetSchema).optional(),
```

### Implementation

**1. Update `src/ui/manifest/schema.ts`:**

Add `prefetch` to `routeConfigSchema`:

```ts
export const routeConfigSchema = z.object({
  // ... existing fields ...
  prefetch: z.array(endpointTargetSchema).optional(),
});
```

**2. Update `src/ui/manifest/compiler.ts`:**

In `compileManifest()`, include `prefetch` in the compiled route:

```ts
// In the route compilation loop:
const compiledRoute: CompiledRoute = {
  // ... existing fields ...
  prefetch: route.prefetch,
};
```

**3. Update `CompiledRoute` type:**

```ts
export interface CompiledRoute {
  // ... existing fields ...
  prefetch?: EndpointTarget[];
}
```

**4. Create `src/ui/manifest/use-route-prefetch.ts`:**

```ts
'use client';

import { useEffect } from "react";
import type { EndpointTarget } from "./resources";
import { useManifestResourceCache } from "./runtime";

/**
 * Hook that prefetches data for declared route endpoints.
 * Fires on route enter — starts API calls immediately so data is
 * ready by the time components mount.
 */
export function useRoutePrefetch(endpoints: EndpointTarget[] | undefined) {
  const cache = useManifestResourceCache();

  useEffect(() => {
    if (!endpoints || endpoints.length === 0) return;

    for (const endpoint of endpoints) {
      // Use cache.prefetch if available, or cache.fetch with cache-first policy
      cache.prefetch(endpoint);
    }
  }, [endpoints, cache]);
}
```

**5. Wire into the route runtime provider:**

In the router integration, call `useRoutePrefetch(route.prefetch)` when a route is matched.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/use-route-prefetch.ts` |
| Modify | `src/ui/manifest/schema.ts` — add `prefetch` to route schema |
| Modify | `src/ui/manifest/compiler.ts` — include `prefetch` in compiled route |
| Modify | `src/ui/manifest/types.ts` — add `prefetch` to `CompiledRoute` |
| Modify | `src/ui/manifest/runtime.tsx` — call `useRoutePrefetch` in route provider |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/compiler.test.ts` | Add test: route with `prefetch: ["GET /api/users"]` compiles to route with prefetch. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add test: `prefetch` accepts endpoint target array. |

### Exit Criteria

- [ ] `{ "prefetch": ["GET /api/users", "GET /api/stats"] }` in route config compiles.
- [ ] Route prefetch hook fires on route enter.
- [ ] Prefetch calls use cache-first strategy (don't re-fetch if cached).
- [ ] Empty/missing `prefetch` does not cause errors.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase K.5: Suspense Boundaries — `suspense` Prop on Container Components

### Goal

Add `suspense` prop to container components (`row`, `card`, `section`, `container`, `grid`).
When set, the component wraps its children in a React Suspense boundary with a configurable
fallback (skeleton, spinner, or custom component).

### Types

Add to the manifest schema:

```ts
const suspenseFallbackSchema = z.object({
  /** Fallback component type. */
  type: z.enum(["skeleton", "spinner", "custom"]),
  /** Skeleton variant — controls the shape of skeleton elements. */
  variant: z.enum(["card", "list", "text", "table"]).optional(),
  /** Number of skeleton items to show. */
  count: z.number().int().positive().optional(),
  /** Custom component config to render as fallback. */
  component: z.record(z.unknown()).optional(),
}).optional();

// On container components:
suspense: suspenseFallbackSchema,
```

### Implementation

**1. Create `src/ui/components/_base/suspense-wrapper.tsx`:**

```tsx
'use client';

import React, { Suspense } from "react";

interface SuspenseConfig {
  type: "skeleton" | "spinner" | "custom";
  variant?: "card" | "list" | "text" | "table";
  count?: number;
  component?: Record<string, unknown>;
}

interface SuspenseWrapperProps {
  config?: SuspenseConfig;
  children: React.ReactNode;
}

function SkeletonFallback({ variant, count }: { variant?: string; count?: number }) {
  const items = count ?? (variant === "list" ? 5 : variant === "table" ? 10 : 1);
  const height = variant === "card" ? "8rem" : variant === "table" ? "2.5rem" : "1rem";

  return (
    <div
      data-snapshot-suspense-fallback=""
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {Array.from({ length: items }, (_, i) => (
        <div
          key={i}
          style={{
            height,
            backgroundColor: "var(--sn-color-muted, #f3f4f6)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            animation: "snapshot-skeleton-pulse 2s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

function SpinnerFallback() {
  return (
    <div
      data-snapshot-suspense-fallback=""
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "var(--sn-spacing-xl, 2rem)",
      }}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          border: "2px solid var(--sn-color-muted, #e5e7eb)",
          borderTopColor: "var(--sn-color-primary, #2563eb)",
          borderRadius: "50%",
          animation: "snapshot-spinner 0.6s linear infinite",
        }}
      />
    </div>
  );
}

/**
 * Wraps children in a React Suspense boundary with a configurable fallback.
 */
export function SuspenseWrapper({ config, children }: SuspenseWrapperProps) {
  if (!config) return <>{children}</>;

  let fallback: React.ReactNode;
  switch (config.type) {
    case "skeleton":
      fallback = <SkeletonFallback variant={config.variant} count={config.count} />;
      break;
    case "spinner":
      fallback = <SpinnerFallback />;
      break;
    case "custom":
      // ComponentRenderer would handle custom component
      fallback = <SkeletonFallback />;
      break;
    default:
      fallback = <SkeletonFallback />;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}
```

**2. Add suspense prop to container component schemas:**

Update `rowConfigSchema`, `cardConfigSchema`, `sectionConfigSchema`, `containerConfigSchema`,
`gridConfigSchema` in `src/ui/manifest/schema.ts`:

```ts
export const rowConfigSchema = z.lazy(() =>
  baseComponentConfigSchema.extend({
    type: z.literal("row"),
    // ... existing ...
    suspense: suspenseFallbackSchema,
  }),
);
```

**3. Update container component renders:**

Wrap children in `SuspenseWrapper`:

```tsx
import { SuspenseWrapper } from "../../_base/suspense-wrapper";

// In component render:
<SuspenseWrapper config={config.suspense}>
  {config.children.map((child, i) => (
    <ComponentRenderer key={...} config={child} />
  ))}
</SuspenseWrapper>
```

**4. Add spinner keyframe to framework styles:**

```css
@keyframes snapshot-spinner {
  to { transform: rotate(360deg); }
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/suspense-wrapper.tsx` |
| Modify | `src/ui/manifest/schema.ts` — add `suspenseFallbackSchema`, add `suspense` to container schemas |
| Modify | `src/ui/manifest/structural.tsx` — wrap children in SuspenseWrapper |
| Modify | `src/ui/tokens/resolve.ts` — add spinner keyframe |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/suspense-wrapper.test.tsx` (create) | Tests: skeleton fallback renders correct number of items, spinner fallback renders, no config renders children directly. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add tests: `suspense` prop accepted on row/card/section/container/grid. |

### Exit Criteria

- [ ] `{ "type": "row", "suspense": { "type": "skeleton", "variant": "card" } }` wraps
      children in Suspense with card skeleton fallback.
- [ ] `{ "suspense": { "type": "spinner" } }` shows spinner during loading.
- [ ] Omitting `suspense` renders children without Suspense boundary.
- [ ] Skeleton animation uses `--sn-color-muted` token.
- [ ] SSR renders the fallback correctly (Suspense server behavior).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Three independent tracks:

| Track | Phases | Files Owned |
|---|---|---|
| Runtime | K.1, K.4, K.5 | `src/ui/hooks/use-virtual-list.ts`, `src/ui/manifest/use-route-prefetch.ts`, `src/ui/components/_base/suspense-wrapper.tsx` |
| Vite | K.2 | `src/vite/index.ts`, `src/ui/manifest/lazy-registry.ts` |
| Components | K.3 | `src/ui/components/media/image/*` |

### File Conflicts

- K.1 and K.5 both touch `src/ui/tokens/resolve.ts` (adding keyframes). Run sequentially.
- K.4 and K.5 both touch `src/ui/manifest/schema.ts`. Run sequentially.
- K.2 is fully independent.
- K.3 is fully independent.

### Recommended Order

1. K.3 (image — standalone, fast)
2. K.1 (virtual lists — standalone hook + component mod)
3. K.5 (suspense — adds to resolve.ts after K.1)
4. K.4 (prefetch — adds to schema after K.5)
5. K.2 (code splitting — most complex, benefits from others being stable)

### Branch Strategy

```
branch: phase-k-performance
base: main
```

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Start with K.3 (simplest, fewest dependencies).
4. Run `bun run typecheck && bun test` after each sub-phase.
5. Run `bun run build` at the end.
6. Verify SSR safety: no `document`/`window` in render body.
7. Commit each sub-phase separately.

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
bun test                 # All performance tests pass
```

### Documentation Checks

- [ ] JSDoc on `useVirtualList`, `SuspenseWrapper`, `useRoutePrefetch`.
- [ ] All new schema fields have JSDoc comments.
- [ ] `src/ui.ts` exports updated for new hooks and types.
