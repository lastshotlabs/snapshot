# SSR/RSC UI Compatibility — Canonical Spec

> **Status**
>
> | Phase | Title                                     | Status      | Track            |
> | ----- | ----------------------------------------- | ----------- | ---------------- |
> | A     | Component SSR/RSC audit and fix           | Not started | A — Components   |
> | B     | Thread RSC through the framework renderer | Not started | B — Renderer     |
> | C     | Config composition table and fixes        | Not started | B — Renderer     |
> | D     | Manifest config surface for RSC           | Not started | B — Renderer     |

---

## Vision

### The Before

Snapshot has a working RSC two-pass render path in `renderPage()` and a working `rscTransform()`
Vite plugin. On paper, RSC is supported. In practice, it has never been wired end-to-end:

1. **`renderer.ts` never passes `rscOptions`** — `renderPage()` accepts `rscOptions?: RscOptions`
   and will perform the two-pass RSC render when provided. `createReactRenderer()` and
   `createManifestRenderer()` both call `renderPage()` at 8 separate call sites and pass nothing
   for `rscOptions`. RSC is declared but inert.

2. **All 69 UI component files lack `'use client'`** — Not a single `component.tsx` in
   `src/ui/components/` begins with `'use client'`. Every component uses hooks (`useState`,
   `useEffect`, `useRef`, etc.). Without the directive, RSC treats them as server components and
   crashes when it encounters `useState`.

3. **Two render-body browser API bugs exist** — `save-indicator/component.tsx` calls
   `document.createElement()` synchronously in the render body (via `ensureStyles()`), not inside
   a `useEffect`. `nav/component.tsx` accesses `window.location.pathname` synchronously in the
   render body with an `"undefined"` guard — the guard prevents crashes but the pattern is wrong.

4. **SSG + RSC is untested and unwired** — `snapshotSsr({ ssg: true, rsc: true })` spawns
   `slingshot-ssg` via `spawnSync`. The slingshot-ssg runner calls `renderPage()` independently. It
   has no awareness of `rsc-manifest.json` and no mechanism to receive `rscOptions`. SSG with
   RSC silently falls back to standard SSR.

5. **RSC is not manifest-addressable** — There is no field in `snapshot.manifest.json` or any
   manifest config type that lets a user enable RSC. The CLAUDE.md manifest-first requirement
   (Rule: everything runs in manifest mode) is violated.

### The After

- Every UI component has an explicit execution context declaration: `'use client'` as the first
  line for every interactive component (all 69 current components qualify), or a comment
  `// Server Component` for any pure display component with no hooks and no browser APIs.
- No component has browser API calls in its synchronous render path.
- `createReactRenderer()` and `createManifestRenderer()` accept `rscOptions?: RscOptions` in
  their config structs and thread it through to every `renderPage()` call site.
- Both `SnapshotSsrConfig` and `ManifestSsrConfig` have an `rscOptions` field.
- `snapshotSsr({ ssg: true, rsc: true })` passes `--rsc-manifest` to the slingshot-ssg spawn so
  the SSG runner can load `rsc-manifest.json` and pass `rscOptions` to `renderPage()`.
- A user can enable RSC from `snapshot.manifest.json` by setting `"ssr": { "rsc": true }` in the
  manifest. The manifest renderer reads this and loads the manifest file.

---

## What Already Exists on Main

### What works

| What                                    | File(s)                                                    | Notes                                           |
| --------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `renderPage()` with full RSC two-pass   | `src/ssr/render.ts` (lines 92–231)                        | Complete and correct. No changes needed here.   |
| `RscOptions` / `RscManifest` types      | `src/ssr/rsc.ts`, exported from `src/ssr/index.ts`        | Types are correct and exported.                 |
| `rscTransform()` Vite plugin            | `src/vite/rsc-transform.ts`                               | Writes `rsc-manifest.json`. No changes needed.  |
| `snapshotSsr({ rsc: true })` Vite option | `src/vite/index.ts` `SnapshotSsrOptions.rsc`             | Flag exists. Build side is wired.               |
| RSC documentation                       | `docs/ssr/rsc.md`                                         | Accurate but describes the ideal, not reality.  |

### What is partial / broken

| What                                       | File(s)                                                           | Gap                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `createReactRenderer()` RSC threading     | `src/ssr/renderer.ts` line 307                                   | `SnapshotSsrConfig` has no `rscOptions`. 8 call sites pass nothing.   |
| `createManifestRenderer()` RSC threading  | `src/ssr/manifest-renderer.ts` line 283                          | `ManifestSsrConfig` has no `rscOptions`. 1 call site passes nothing.  |
| Component `'use client'` directives       | All 69 `src/ui/components/**/component.tsx` files                | Zero files have `'use client'`. All use hooks.                        |
| `save-indicator` render-body DOM access   | `src/ui/components/data/save-indicator/component.tsx` lines 16–21 | `ensureStyles()` calls `document.createElement` in render body.      |
| `nav` render-body `window` access         | `src/ui/components/layout/nav/component.tsx` line 297            | `window.location.pathname` read synchronously with `typeof` guard.   |
| SSG + RSC composition                     | `src/vite/index.ts` lines 562–608 (SSG spawn)                   | slingshot-ssg spawn never passes `--rsc-manifest`.                      |
| Manifest-addressable RSC                  | `src/ssr/types.ts` `ManifestSsrConfig`                          | No `ssr.rsc` field in the manifest config type or schema.             |

### Component execution context audit

Every `component.tsx` file was checked. None begin with `'use client'`. Representative sample:

| Component file                                | Hooks used                         | Browser API in render body?                                  |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `layout/nav/component.tsx`                    | `useNav`, `useActionExecutor`      | YES — `window.location.pathname` at line 297 (guarded)       |
| `overlay/modal/component.tsx`                 | `useModal`, `useRef`, `useState`, `useEffect`, `useCallback` | No                              |
| `data/data-table/component.tsx`               | `useMemo`, `useState`, `useCallback`, `useDataTable` | No                             |
| `data/save-indicator/component.tsx`           | `useSubscribe`                     | YES — `document.createElement` via `ensureStyles()` at line 51 |
| `overlay/context-menu/component.tsx`          | `useState`, `useCallback`, `useEffect`, `useRef` | `window.innerWidth/Height` inside `useEffect` — OK        |
| `communication/reaction-bar/component.tsx`    | hooks                              | `document.addEventListener` inside `useEffect` — OK          |

The two render-body violations are:
1. `save-indicator` — `ensureStyles()` is called at line 51 directly in the render function body, not in a `useEffect`. It calls `document.createElement` and `document.head.appendChild`. Fix: move `ensureStyles()` call into a `useEffect`.
2. `nav` — `window.location.pathname` at line 297 is called during render (guarded by `typeof window !== "undefined"`). The guard prevents crashes but makes the initial render produce `/` on the server, then re-render client-side. Fix: move to `useEffect` with a state variable initialized to `"/"`.

---

## Developer Context

### Build and test commands

```sh
bun run typecheck   # tsc --noEmit — catches type errors from the config changes
bun run format      # prettier — run after adding directives to 69 files
bun run build       # tsup + oclif manifest
bun run test        # vitest — component rendering tests must pass
```

### Key files

| File                                            | What it does                                                              | Lines |
| ----------------------------------------------- | ------------------------------------------------------------------------- | ----- |
| `src/ssr/render.ts`                             | `renderPage()` — the SSR/RSC render function. No changes needed.         | 264   |
| `src/ssr/renderer.ts`                           | `createReactRenderer()` — 8 `renderPage()` call sites. Needs `rscOptions`. | ~1010 |
| `src/ssr/manifest-renderer.ts`                  | `createManifestRenderer()` — 1 `renderPage()` call site. Needs `rscOptions`. | ~290 |
| `src/ssr/types.ts`                              | `SnapshotSsrConfig` (line 164), `ManifestSsrConfig` (line 432). Both need `rscOptions` field. | ~470 |
| `src/vite/index.ts`                             | `snapshotSsr()` — SSG spawn (lines 562–608) needs `--rsc-manifest` arg.  | ~640  |
| `src/ui/components/**/component.tsx`            | 69 files — all need `'use client'` as line 1.                            | varies |
| `src/ui/components/data/save-indicator/component.tsx` | Render-body `document` access at line 51.                         | ~80   |
| `src/ui/components/layout/nav/component.tsx`    | Render-body `window` access at line 297.                                 | 467   |

---

## Non-Negotiable Engineering Constraints

All rules from the CLAUDE.md and `docs/engineering-rules.md` apply. Specifically:

- **Rule: Manifest-first** — RSC enable/disable must be expressible from `snapshot.manifest.json`.
- **Rule: No module-level singletons** — `rscOptions` flows through function configs, never a module-level variable.
- **Rule: Freeze at the boundary** — Config objects (including updated `SnapshotSsrConfig`) remain frozen via `Object.freeze()` at `createReactRenderer()` entry.
- **Rule: JSDoc on all public API** — Every changed exported symbol gets updated JSDoc.
- **Rule: No shell interpolation** — `spawnSync` with array args only. The new `--rsc-manifest` arg joins the existing array, never a template literal.

---

## Phase A: Component SSR/RSC Audit and Fix

### Goal

Add `'use client'` as the first line of all 69 UI component files. Fix the two render-body
browser API violations. After this phase, every component correctly declares its execution
context and none crash during server-side `renderToStaticMarkup`.

### Approach

#### Rule: Every component file must declare its execution context

One of two forms, as the very first line of the file:

```ts
'use client';
```

or, for a component that has no hooks and no browser APIs:

```ts
// Server Component — no hooks, no browser APIs, no event handlers.
```

There are currently no pure server components in the library. Every existing component uses
at minimum one hook. All 69 files get `'use client'`.

#### `'use client'` does NOT skip SSR pre-rendering

`'use client'` marks the hydration boundary. The component still pre-renders on the server
with `react-dom/server`. The directive tells the RSC runtime "this component needs client JS"
— it does not opt the component out of server rendering. Do not confuse the two.

#### Fix 1: `save-indicator/component.tsx` — move `ensureStyles()` out of render body

Current (incorrect):

```tsx
export function SaveIndicator({ config }: { config: SaveIndicatorConfig }) {
  const status = useSubscribe(config.status) as string;
  // ...
  ensureStyles(); // ← called synchronously in render body — crashes on server
  // ...
}
```

Correct:

```tsx
'use client';

export function SaveIndicator({ config }: { config: SaveIndicatorConfig }) {
  const status = useSubscribe(config.status) as string;

  useEffect(() => {
    ensureStyles(); // ← effects never run during server pre-render
  }, []);

  // ...
}
```

The `useEffect` with an empty dependency array runs exactly once after the first mount on the
client. `ensureStyles()` already guards against double-injection with `styleInjected`, so
calling it from an effect is safe.

#### Fix 2: `nav/component.tsx` — move `window.location.pathname` to state

Current (incorrect):

```tsx
export function Nav({ config, pathname, onNavigate }: NavComponentProps) {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  // ↑ called synchronously in render — guard prevents crash but causes
  //   a server/client mismatch hydration warning
```

Correct:

```tsx
'use client';

export function Nav({ config, pathname, onNavigate }: NavComponentProps) {
  const [currentPath, setCurrentPath] = useState(pathname ?? "/");

  useEffect(() => {
    if (!pathname) {
      setCurrentPath(window.location.pathname);
    }
  }, [pathname]);

  // Use currentPath below instead of the inline ternary.
```

The server pre-renders with `"/"`. After hydration, the effect fires and sets the real
`window.location.pathname`. This matches how React recommends handling browser-only values
that are unavailable during SSR.

### Files to change — Phase A

All 69 `component.tsx` files under `src/ui/components/`. The complete list:

```
src/ui/components/account/notification-prefs/component.tsx
src/ui/components/account/profile-editor/component.tsx
src/ui/components/account/security-settings/component.tsx
src/ui/components/account/session-manager/component.tsx
src/ui/components/admin/feature-flag-panel/component.tsx
src/ui/components/admin/role-manager/component.tsx
src/ui/components/commerce/cart/component.tsx
src/ui/components/commerce/pricing-table/component.tsx
src/ui/components/commerce/product-card/component.tsx
src/ui/components/communication/chat-window/component.tsx
src/ui/components/communication/comment-section/component.tsx
src/ui/components/communication/message-thread/component.tsx
src/ui/components/communication/notification-feed/component.tsx
src/ui/components/communication/reaction-bar/component.tsx
src/ui/components/content/code-block/component.tsx
src/ui/components/content/file-uploader/component.tsx
src/ui/components/content/markdown/component.tsx
src/ui/components/content/media-gallery/component.tsx
src/ui/components/content/rich-text-editor/component.tsx
src/ui/components/content/timeline/component.tsx
src/ui/components/data/avatar/component.tsx
src/ui/components/data/badge/component.tsx
src/ui/components/data/data-table/component.tsx
src/ui/components/data/detail-card/component.tsx
src/ui/components/data/empty-state/component.tsx
src/ui/components/data/entity-picker/component.tsx
src/ui/components/data/filter-bar/component.tsx
src/ui/components/data/list/component.tsx
src/ui/components/data/save-indicator/component.tsx  ← also fix ensureStyles()
src/ui/components/data/stat-card/component.tsx
src/ui/components/documentation/api-reference/component.tsx
src/ui/components/documentation/changelog/component.tsx
src/ui/components/documentation/doc-viewer/component.tsx
src/ui/components/documentation/search-index/component.tsx
src/ui/components/documentation/table-of-contents/component.tsx
src/ui/components/documentation/version-switcher/component.tsx
src/ui/components/education/certificate-badge/component.tsx
src/ui/components/education/lesson-viewer/component.tsx
src/ui/components/education/progress-tracker/component.tsx
src/ui/components/education/quiz-builder/component.tsx
src/ui/components/forms/auto-form/component.tsx
src/ui/components/forms/location-input/component.tsx
src/ui/components/forms/multi-select/component.tsx
src/ui/components/forms/select/component.tsx
src/ui/components/forms/tag-selector/component.tsx
src/ui/components/forms/toolbar/component.tsx
src/ui/components/layout/heading/component.tsx
src/ui/components/layout/layout/component.tsx
src/ui/components/layout/nav/component.tsx  ← also fix window.location.pathname
src/ui/components/layout/row/component.tsx
src/ui/components/media/image/component.tsx
src/ui/components/navigation/accordion/component.tsx
src/ui/components/navigation/stepper/component.tsx
src/ui/components/navigation/tabs/component.tsx
src/ui/components/navigation/tree-view/component.tsx
src/ui/components/overlay/context-menu/component.tsx
src/ui/components/overlay/drawer/component.tsx
src/ui/components/overlay/modal/component.tsx
src/ui/components/overlay/toast/component.tsx
src/ui/components/workflow/approval-flow/component.tsx
src/ui/components/workflow/audit-log/component.tsx
src/ui/components/workflow/calendar/component.tsx
src/ui/components/workflow/kanban/component.tsx
src/ui/components/workflow/status-tracker/component.tsx
```

Also add `'use client'` to:
- `src/ui/components/_base/component-wrapper.tsx` — uses `React.Component` error boundary class
  (class components are client components) and `Suspense` boundary management
- `src/ui/context/providers.tsx` — `AppContextProvider` and `PageContextProvider` wrap Jotai
  state providers which use hooks internally

### Tests — Phase A

Add to each component's `__tests__/component.test.tsx` (or create it):

```ts
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { ComponentName } from '../component';

describe('ComponentName — SSR compatibility', () => {
  it('renders to static markup without throwing', () => {
    expect(() =>
      renderToStaticMarkup(
        <TestPageContext>
          <ComponentName config={baseConfig} />
        </TestPageContext>
      )
    ).not.toThrow();
  });
});
```

Every component must pass this test before Phase A is considered done. A throw means there
is a render-body browser API call that was missed.

### Exit criteria — Phase A

1. `grep -r "'use client'" src/ui/components/ --include="component.tsx" | wc -l` returns 69+.
2. `grep -r "'use client'" src/ui/components/_base/component-wrapper.tsx` finds the directive.
3. `grep -r "'use client'" src/ui/context/providers.tsx` finds the directive.
4. `grep -rn "ensureStyles()" src/ui/components/data/save-indicator/component.tsx` returns a
   line number inside a `useEffect`, not in the render body.
5. `grep -n "window.location" src/ui/components/layout/nav/component.tsx` returns a line inside
   a `useEffect`, not in the render body.
6. `bun run typecheck` passes.
7. Every `component.test.tsx` that includes the SSR compatibility test passes.

---

## Phase B: Thread RSC Through the Framework Renderer

### Goal

`createReactRenderer()` and `createManifestRenderer()` must accept `rscOptions?: RscOptions`
in their config structs and pass it to every `renderPage()` call site. After this phase,
a consumer who sets `rsc: true` in `snapshotSsr()` and loads `rsc-manifest.json` can activate
RSC rendering by passing `rscOptions` to the renderer factory — without any code changes to
slingshot-ssr.

### Changes to `src/ssr/types.ts`

#### `SnapshotSsrConfig` — add `rscOptions` field

The field goes after `renderTimeoutMs`. No other fields change.

```ts
export interface SnapshotSsrConfig {
  snapshot?: SnapshotInstance<Record<string, unknown>>;
  resolveComponent: (
    match: ServerRouteMatchShape,
  ) => Promise<React.ComponentType<Record<string, unknown>>>;
  renderTimeoutMs?: number;

  /**
   * RSC manifest loaded from `rsc-manifest.json` in the server output directory.
   *
   * When provided, every `renderPage()` call made by this renderer uses RSC
   * two-pass rendering. When omitted, standard single-pass SSR is used.
   *
   * Load the manifest at server startup:
   * ```ts
   * import { readFileSync } from 'node:fs';
   * import type { RscManifest } from '@lastshotlabs/snapshot/ssr';
   * const manifest: RscManifest = JSON.parse(
   *   readFileSync('./dist/server/rsc-manifest.json', 'utf-8')
   * );
   * const renderer = createReactRenderer({ ..., rscOptions: { manifest } });
   * ```
   *
   * Requires `rsc: true` in `snapshotSsr()` during the build.
   */
  rscOptions?: RscOptions;
}
```

Import `RscOptions` at the top of `types.ts`:

```ts
import type { RscOptions } from './rsc';
```

#### `ManifestSsrConfig` — add `rscOptions` field

Same pattern. The field goes after `getUser`:

```ts
export interface ManifestSsrConfig {
  manifest: ManifestConfig;
  preloadResolvers?: Record<string, ManifestPreloadResolver>;
  getUser?: (headers: Headers) => Promise<{ id: string; roles: string[] } | null>;

  /**
   * RSC manifest loaded from `rsc-manifest.json`.
   *
   * When provided, `renderPage()` uses RSC two-pass rendering for every manifest
   * route. When omitted, standard single-pass SSR is used.
   *
   * @see `SnapshotSsrConfig.rscOptions` for the loading pattern.
   */
  rscOptions?: RscOptions;
}
```

### Changes to `src/ssr/renderer.ts`

#### Step 1: read `rscOptions` from frozen config

`createReactRenderer()` already freezes its config on line 320:

```ts
const frozen = Object.freeze({ ...config });
const timeoutMs = frozen.renderTimeoutMs ?? 5000;
```

Add one line after:

```ts
const rscOptions = frozen.rscOptions;
```

#### Step 2: pass `rscOptions` to every `renderPage()` call site

There are 8 call sites in `renderer.ts`. Each currently ends with `renderPage(element, requestContext, shell, timeoutMs)` or `renderPage(element, requestContext, fullShell, timeoutMs)`. Append `rscOptions` as the fifth argument to all 8:

- Line 437: `renderPage(element, requestContext, shell, timeoutMs)` → `renderPage(element, requestContext, shell, timeoutMs, rscOptions)`
- Line 459: same pattern
- Line 574: `renderPage(element, requestContext, fullShell, timeoutMs)` → append `rscOptions`
- Line 695: same pattern
- Line 717: same pattern
- Line 739: same pattern
- Line 993: `renderPage(element, requestContext, fullShell, timeoutMs)` → append `rscOptions`

Note: the 8th call site is the `renderPage` calls for error/not-found/forbidden/unauthorized
convention components. These should also receive `rscOptions` so error pages are rendered
with the same render path as normal pages.

**Exact line numbers may shift as the file is edited — use the surrounding context to find
each call, not a hardcoded line number.**

#### `renderChain()` — same pattern

The `renderChain()` method lives in the same `createReactRenderer()` return object. The same
`rscOptions` variable (from the outer scope via closure) applies. No new parameter needed —
`rscOptions` is already in scope from step 1.

### Changes to `src/ssr/manifest-renderer.ts`

#### Step 1: read `rscOptions` from config

`createManifestRenderer()` (or equivalent factory name — verify in the file) stores its
config. Locate where the config is read and add:

```ts
const rscOptions = config.rscOptions;
```

#### Step 2: pass to the single `renderPage()` call site

Line 283 (approximately):

```ts
return renderPage(element, requestContext, populatedShell);
```

Changes to:

```ts
return renderPage(element, requestContext, populatedShell, undefined, rscOptions);
```

Pass `undefined` for `timeoutMs` to use the default (5000ms), since `ManifestSsrConfig` does
not expose a timeout option. If a timeout field is added in a later spec, update this.

### No changes to `src/ssr/render.ts`

`renderPage()` is already correct. The `rscOptions` parameter is already the 5th argument and
already implements the two-pass RSC render. Do not touch this file in Phase B.

### Exit criteria — Phase B

1. `bun run typecheck` passes — `SnapshotSsrConfig` and `ManifestSsrConfig` both have `rscOptions`.
2. Manual inspection: every `renderPage(` call in `renderer.ts` has 5 arguments (the 5th being
   `rscOptions`).
3. Manual inspection: the single `renderPage(` call in `manifest-renderer.ts` has `rscOptions`
   as the 5th argument.
4. `bun run test` passes (existing renderer tests must not regress).

---

## Phase C: Config Composition Table and Fixes

### Goal

Define definitively which `snapshotSsr()` option combinations work, which need code changes,
and which are unsupported. Fix the one combination that requires a code change: `ssg: true` +
`rsc: true`.

### Composition table

| Combination                                    | Works today? | After this spec? | Notes                                                                                                                                              |
| ---------------------------------------------- | ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rsc: true` only (standard SSR + RSC)          | No           | Yes (Phase B)    | Requires Phase B (renderer threading) + Phase A (components). Build side already works. Consumer must load `rsc-manifest.json` and pass to renderer. |
| `rsc: true` + `ssg: true`                      | No           | Yes (Phase C)    | slingshot-ssg spawn must receive `--rsc-manifest` path. See fix below.                                                                               |
| `rsc: true` + `ppr: true`                      | No           | Partially        | PPR uses `renderPprPage()` which calls `renderToReadableStream` directly — not `renderPage()`. RSC two-pass is not composed into PPR. Out of scope for this spec. |
| `rsc: true` + `target: 'edge-cloudflare'`      | No           | No (unsupported) | Edge runtimes lack `AsyncLocalStorage`. Snapshot's `cache()` primitive uses it. Attempting RSC on Cloudflare will silently fall back to standard SSR or throw. Document the limitation — do not attempt to fix it here. |
| `rsc: true` + `target: 'edge-deno'`            | No           | Yes (Phase B)    | Deno supports `AsyncLocalStorage` via Node compat. Same fix as standard RSC. No extra changes. |
| `rsc: true` + `serverActions: true`            | Yes (build)  | Yes              | Both are Vite transform-level. `serverActionsTransform()` and `rscTransform()` operate on different directive strings (`'use server'` vs `'use client'`). They compose cleanly. No conflicts. |
| `ssg: true` only                               | Yes          | Yes              | Unaffected by this spec.                                                                                                                           |
| `ppr: true` only                               | Yes          | Yes              | Unaffected by this spec.                                                                                                                           |

### Fix: `ssg: true` + `rsc: true` — pass RSC manifest to slingshot-ssg

**Current behavior:** `snapshotSsr()` spawns `slingshot-ssg` with `--assets-manifest`,
`--out`, and `--renderer`. If `rsc: true` is set, the `rsc-manifest.json` is written to
`dist/server/rsc-manifest.json` by `rscTransform()`. The SSG runner does not know about it.

**Required behavior:** when `rsc: true` is set alongside `ssg: true`, pass the RSC manifest
path to the SSG runner as a new `--rsc-manifest` flag.

**Change in `src/vite/index.ts`**, inside the `closeBundle` hook, in the SSG block
(approximately lines 562–608):

```ts
// ── SSG ───────────────────────────────────────────────────────────────
if (!opts.ssg) return;

const serverOutDir = opts.serverOutDir ?? "dist/server";
const ssgOutDir = opts.ssgOutDir ?? "dist/static";
const assetsManifest = path.join(clientOutDir, ".vite", "manifest.json");
const rendererEntry = path.join(serverOutDir, "entry-server.js");

// Build the arg array. Rule: spawnSync with array args — no shell interpolation.
const ssgArgs = [
  "run",
  path.resolve(process.cwd(), "node_modules/.bin/slingshot-ssg"),
  "--assets-manifest",
  assetsManifest,
  "--out",
  ssgOutDir,
  "--renderer",
  rendererEntry,
];

// When RSC is enabled, tell the SSG runner where rsc-manifest.json lives.
// The SSG runner must load this file and pass it to renderPage() as rscOptions.
if (opts.rsc) {
  const rscManifestPath = path.join(serverOutDir, "rsc-manifest.json");
  ssgArgs.push("--rsc-manifest", rscManifestPath);
}

const result = spawnSync("bun", ssgArgs, { ... });
```

**The slingshot-ssg runner** (in `@lastshotlabs/slingshot-ssg`, not in this repo) must be updated
to accept `--rsc-manifest <path>` and, when provided, load the file and pass `rscOptions` to
`renderPage()`. That change is out of scope for this spec but must be filed as a dependency.
The Vite plugin side of this fix (adding `--rsc-manifest` to the spawn args) is in scope.

### PPR + RSC — explicit non-goal

`renderPprPage()` bypasses `renderPage()` and calls `renderToReadableStream` directly. The
PPR fast path sends pre-computed shell HTML and then streams dynamic update scripts. Wiring
RSC two-pass into this flow requires significant changes to `renderPprPage()` and is out of
scope for this spec. The combination `rsc: true` + `ppr: true` is unsupported until a
dedicated PPR+RSC spec is written.

**Add a validation warning** to `snapshotSsr()` in `src/vite/index.ts` when both `rsc: true`
and `ppr: true` are set:

```ts
if (opts.rsc && opts.ppr) {
  console.warn(
    '[snapshot-ssr] Warning: rsc: true and ppr: true are set simultaneously. ' +
    'RSC two-pass rendering is not composed with PPR shells. ' +
    'RSC will apply to non-PPR routes only. ' +
    'See docs/specs/ssr-rsc-ui-compatibility.md for details.'
  );
}
```

### Edge + RSC — explicit non-goal

The `AsyncLocalStorage` limitation on Cloudflare Workers is a documented constraint in
`docs/ssr/rsc.md`. No code change is needed — the limitation already exists and is documented.

**Add a validation warning** to `snapshotSsr()` in `src/vite/index.ts` when `rsc: true` and
`target: 'edge-cloudflare'` are set:

```ts
if (opts.rsc && opts.target === 'edge-cloudflare') {
  console.warn(
    '[snapshot-ssr] Warning: rsc: true with target: edge-cloudflare is not supported. ' +
    'Cloudflare Workers do not support AsyncLocalStorage, which is required by the ' +
    'Snapshot cache() primitive used inside server components. ' +
    'RSC will be disabled at runtime. Use target: node or target: edge-deno instead.'
  );
}
```

### Exit criteria — Phase C

1. `bun run typecheck` passes.
2. `grep -n "rsc-manifest\|rscManifest" src/vite/index.ts` shows the new `--rsc-manifest` arg.
3. The two `console.warn` calls for unsupported combinations are present.
4. `bun run build` passes (the Vite plugin change compiles cleanly).

---

## Phase D: Manifest Config Surface for RSC

### Goal

A user must be able to enable RSC from `snapshot.manifest.json` with no TypeScript changes.
The manifest-first rule requires this. Currently it is impossible.

### Manifest entry shape

In `snapshot.manifest.json`, users enable RSC via a top-level `ssr` field:

```json
{
  "theme": { "flavor": "midnight" },
  "ssr": {
    "rsc": true,
    "rscManifestPath": "./dist/server/rsc-manifest.json"
  },
  "pages": { ... }
}
```

- `ssr.rsc` — boolean, default `false`. When `true`, the manifest renderer loads the RSC manifest and enables RSC two-pass rendering.
- `ssr.rscManifestPath` — string, optional. Defaults to `"./dist/server/rsc-manifest.json"` when `ssr.rsc` is `true`. Path is resolved relative to `process.cwd()`.

### Schema change in `src/ui/manifest/schema.ts`

Add a Zod-validated `ssr` field to the manifest schema:

```ts
const ssrConfigSchema = z.object({
  rsc: z.boolean().optional().default(false),
  rscManifestPath: z.string().optional().default('./dist/server/rsc-manifest.json'),
}).optional();

// Add to the top-level manifest schema object:
ssr: ssrConfigSchema,
```

The full shape of the field, for JSDoc:

```ts
/**
 * Server-side rendering configuration for this application.
 *
 * Controls RSC (React Server Components) and future SSR options.
 */
ssr?: {
  /**
   * Enable RSC two-pass rendering.
   * Requires `snapshotSsr({ rsc: true })` in `vite.config.ts` during the build.
   * @default false
   */
  rsc?: boolean;
  /**
   * Path to the RSC manifest file generated by the Vite build.
   * Resolved relative to `process.cwd()`.
   * @default './dist/server/rsc-manifest.json'
   */
  rscManifestPath?: string;
}
```

### Manifest renderer change in `src/ssr/manifest-renderer.ts`

`createManifestRenderer()` receives `ManifestSsrConfig` which has the raw `manifest` object.
After Phase B, it also has `rscOptions?: RscOptions` in its config. Phase D wires the manifest
`ssr` field to auto-populate `rscOptions` when `ssr.rsc` is `true` and `rscOptions` is not
explicitly provided by the caller:

```ts
// Inside createManifestRenderer(), after config is frozen:
let rscOptions = config.rscOptions;

if (!rscOptions && config.manifest.ssr?.rsc) {
  // Load rsc-manifest.json from the path declared in the manifest.
  const manifestPath = path.resolve(
    process.cwd(),
    config.manifest.ssr.rscManifestPath ?? './dist/server/rsc-manifest.json',
  );
  try {
    const rscManifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as RscManifest;
    rscOptions = Object.freeze({ manifest: rscManifest });
  } catch (err) {
    console.error(
      `[snapshot-ssr] Failed to load rsc-manifest.json from ${manifestPath}:`,
      String(err),
    );
    // Fall through — rscOptions remains undefined, standard SSR is used.
  }
}
```

This auto-loading happens once at renderer construction (not per request). The loaded
`rscOptions` is captured in the factory closure, matching the same pattern as `timeoutMs`.

The `import` at the top of `manifest-renderer.ts` needs:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { RscManifest } from './rsc';
```

Verify whether `path` and `readFileSync` are already imported; add only what is missing.

### No change to `createReactRenderer()`

The file-based renderer (`createReactRenderer()`) does not read from a manifest JSON. RSC is
enabled by passing `rscOptions` explicitly in `SnapshotSsrConfig`. There is no auto-loading
path for the file-based renderer — the caller is responsible for loading the manifest.

This is correct: the file-based renderer is used by slingshot-ssr middleware which already
controls its own startup logic. The manifest-based renderer (`createManifestRenderer()`) is
the one that needs auto-loading because manifest-first apps should not need any code.

### Docs change

Update `docs/ssr/rsc.md` — add a section "Enabling RSC from the manifest" after the current
"Enabling RSC" section:

```markdown
## Enabling RSC from the manifest

If you are using the manifest renderer (`createManifestRenderer()`), you can enable RSC
directly from `snapshot.manifest.json` without changing any TypeScript:

```json
{
  "ssr": {
    "rsc": true,
    "rscManifestPath": "./dist/server/rsc-manifest.json"
  }
}
```

The manifest renderer will automatically load the RSC manifest from `rscManifestPath`
at server startup and pass it to `renderPage()`. No code changes required.

You still need `snapshotSsr({ rsc: true })` in your `vite.config.ts` for the build to
generate `rsc-manifest.json` and apply the RSC transform.
```

### Exit criteria — Phase D

1. `grep -n "ssr\|rscManifestPath" src/ui/manifest/schema.ts` shows the new Zod schema field.
2. `grep -n "ssr\.rsc\|rscManifestPath" src/ssr/manifest-renderer.ts` shows the auto-load logic.
3. An integration test: pass a manifest with `ssr: { rsc: true }` to `createManifestRenderer()`
   with a mock `rsc-manifest.json` on disk. Assert that `renderPage()` is called with
   non-undefined `rscOptions`. (Test file: `src/ssr/__tests__/manifest-renderer-rsc.test.ts`.)
4. `bun run typecheck` passes.

---

## Parallelization and Sequencing

### Tracks

**Track A — Components** (Phase A only)

- Owns: all files under `src/ui/components/`, `src/ui/components/_base/component-wrapper.tsx`,
  `src/ui/context/providers.tsx`
- No dependency on Track B. Can start immediately.
- Pure mechanical work: add `'use client'` as line 1 of 69+ files, fix 2 render-body bugs.
- Branch: `fix/ssr-rsc-component-directives`

**Track B — Renderer** (Phases B, C, D)

- Owns: `src/ssr/types.ts`, `src/ssr/renderer.ts`, `src/ssr/manifest-renderer.ts`,
  `src/vite/index.ts`, `src/ui/manifest/schema.ts`, `docs/ssr/rsc.md`
- No dependency on Track A (renderer changes don't require components to have directives first).
- Phases B → C → D must run in order within this track.
- Branch: `fix/ssr-rsc-renderer-threading`

### Why tracks are independent

Track A edits only `.tsx` component files. Track B edits only `.ts` infrastructure files and
the Vite plugin. There is no file overlap. Both branches can be opened as PRs simultaneously
and merged in either order.

### Internal sequencing — Track B

| Phase | Input                                       | Output                                            |
| ----- | ------------------------------------------- | ------------------------------------------------- |
| B     | `SnapshotSsrConfig` without `rscOptions`    | `SnapshotSsrConfig` and `ManifestSsrConfig` with `rscOptions`; all call sites pass it |
| C     | Vite plugin without `--rsc-manifest`         | Vite plugin spawns SSG with `--rsc-manifest`; warning for unsupported combos |
| D     | Manifest schema without `ssr` field         | `ssr.rsc` field in schema; auto-load in manifest renderer |

Phase D reads `ManifestSsrConfig` which Phase B changes — Phase D must run after Phase B.

### Agent execution checklist

For an agent executing either track:

1. Read `C:/Users/email/projects/snapshot/CLAUDE.md` fully.
2. Read this spec fully.
3. Read each file listed in the phase before editing it.
4. Make changes exactly as specified. Do not invent alternatives.
5. After each phase: run `bun run typecheck` and `bun run format:check`. Fix any errors before
   continuing.
6. Verify the exit criteria for the phase before moving to the next.
7. Do not run `bun test` (no args). Use `bun run test` if test execution is required.
8. Do not mark the phase complete until all exit criteria pass.

---

## Definition of Done

### Phase A — Component directives

- [ ] All 69 `component.tsx` files begin with `'use client'` as line 1
- [ ] `component-wrapper.tsx` begins with `'use client'`
- [ ] `providers.tsx` begins with `'use client'`
- [ ] `ensureStyles()` in `save-indicator/component.tsx` is called from `useEffect`, not render body
- [ ] `window.location.pathname` in `nav/component.tsx` is read from `useEffect`, not render body
- [ ] Every modified component has a passing `renderToStaticMarkup` SSR test
- [ ] `bun run typecheck` passes
- [ ] `bun run format:check` passes

### Phase B — Renderer threading

- [ ] `SnapshotSsrConfig` in `src/ssr/types.ts` has `rscOptions?: RscOptions`
- [ ] `ManifestSsrConfig` in `src/ssr/types.ts` has `rscOptions?: RscOptions`
- [ ] All 8 `renderPage()` calls in `renderer.ts` pass `rscOptions` as 5th argument
- [ ] The 1 `renderPage()` call in `manifest-renderer.ts` passes `rscOptions` as 5th argument
- [ ] `bun run typecheck` passes
- [ ] `bun run test` passes (no regressions)

### Phase C — Composition fixes

- [ ] `snapshotSsr()` passes `--rsc-manifest` to slingshot-ssg when `rsc: true` and `ssg: true`
- [ ] `snapshotSsr()` warns when `rsc: true` + `ppr: true` are combined
- [ ] `snapshotSsr()` warns when `rsc: true` + `target: 'edge-cloudflare'` are combined
- [ ] `bun run typecheck` passes
- [ ] `bun run build` passes

### Phase D — Manifest surface

- [ ] `ssr` field with `rsc` and `rscManifestPath` subfields is in the manifest Zod schema
- [ ] `createManifestRenderer()` auto-loads `rsc-manifest.json` when `manifest.ssr.rsc === true`
- [ ] Auto-load failure logs an error and falls back to standard SSR (does not throw)
- [ ] `docs/ssr/rsc.md` updated with "Enabling RSC from the manifest" section
- [ ] JSDoc updated on `ManifestSsrConfig.rscOptions` and the new schema fields
- [ ] Integration test for auto-load in `src/ssr/__tests__/manifest-renderer-rsc.test.ts`
- [ ] `bun run typecheck` passes
- [ ] `bun run test` passes

### Full completion

- [ ] All phases above are done
- [ ] Every exported symbol that was added or changed has up-to-date JSDoc
- [ ] `docs/ssr/rsc.md` describes the current reality (manifest surface, component directives,
  config composition table)
- [ ] No `any` casts introduced; no casts other than at the `react-server-dom-webpack` boundary
  which already uses `as unknown as T` per Rule 5
