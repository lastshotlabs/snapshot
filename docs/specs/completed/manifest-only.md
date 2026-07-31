# Manifest-Only Completion — Canonical Spec

> **Status: Done 2026-04-10.** All 35 phases landed on `main`. C1 and C4 were
> satisfied by A3 and A4 respectively and do not have their own commits. Three
> follow-up commits after F3 handled workflow refactoring, ManifestApp test
> updates for `pushState`, and happy-dom route test fixes.
>
> | Phase | Title                                                            | Status        | Track                      |
> | ----- | ---------------------------------------------------------------- | ------------- | -------------------------- |
> | A1    | Remove auth path inference (route ids only)                      | Done          | A — Hardcoded removal      |
> | A2    | Remove layout fallback (manifest required)                       | Done          | A — Hardcoded removal      |
> | A3    | Replace `"custom"` magic with declared schema                    | Done          | A — Hardcoded removal      |
> | A4    | Replace side-effect registration with explicit boot              | Done          | A — Hardcoded removal      |
> | A5    | Move hardcoded loading/error UI into manifest                    | Done          | A — Hardcoded removal      |
> | B1    | `{ "env": "..." }` resolver                                      | Done          | B — Config collapse        |
> | B2    | `manifest.auth.session` (mode/storage/key)                       | Done          | B — Config collapse        |
> | B3    | `manifest.app.cache` (stale/gc/retry)                            | Done          | B — Config collapse        |
> | B4    | `manifest.auth.contract` + redirects + handlers                  | Done          | B — Config collapse        |
> | B5    | `manifest.realtime.{ws,sse}` (replaces `config.ws`/`config.sse`) | Done          | B — Config collapse        |
> | B6    | Collapse `SnapshotConfig` to four fields                         | Done          | B — Config collapse        |
> | C1    | Manifest-side custom-component declarations                      | Done (via A3) | C — Declarative registries |
> | C2    | Manifest-side custom-action declarations                         | Done          | C — Declarative registries |
> | C3    | Manifest-declarable flavors (no `defineFlavor()` required)       | Done          | C — Declarative registries |
> | C4    | Boot-time registry construction (no module side-effects)         | Done (via A4) | C — Declarative registries |
> | D1    | `policies` schema, resolver, route guard integration             | Done          | D — Policies + i18n        |
> | D2    | Component `visible` policy support                               | Done          | D — Policies + i18n        |
> | D3    | `i18n` schema, resolver, `{ "t": "..." }` ref                    | Done          | D — Policies + i18n        |
> | D4    | i18n locale detection + persistence                              | Done          | D — Policies + i18n        |
> | E1    | `clients` block + per-resource client selection                  | Done          | E — Multi-app              |
> | E2    | `subApps` block + sub-manifest mounting                          | Done          | E — Multi-app              |
> | E3    | Sub-manifest theme/i18n/policy inheritance                       | Done          | E — Multi-app              |
> | F1    | Manifest convention routes (loading/error/notFound/offline)      | Done          | F — Manifest SSR/routing   |
> | F2    | Nested layout declarations in manifest routes                    | Done          | F — Manifest SSR/routing   |
> | F3    | Parallel route slots in manifest                                 | Done          | F — Manifest SSR/routing   |
> | F4    | SSR middleware as manifest workflows                             | Done          | F — Manifest SSR/routing   |
> | G1    | WS/SSE event → workflow mapping                                  | Done          | G — Realtime + cache       |
> | G2    | Per-resource invalidation rules                                  | Done          | G — Realtime + cache       |
> | G3    | Per-resource optimistic update rules                             | Done          | G — Realtime + cache       |
> | G4    | Form submission lifecycle workflows                              | Done          | G — Realtime + cache       |
> | H1    | `manifest.toast` config                                          | Done          | H — App-level services     |
> | H2    | `manifest.analytics` + `track` action                            | Done          | H — App-level services     |
> | H3    | `manifest.push` (VAPID, SW path)                                 | Done          | H — App-level services     |
> | H4    | `manifest.theme.editor.persist`                                  | Done          | H — App-level services     |
> | H5    | OAuth/MFA/WebAuthn full config in `manifest.auth`                | Done          | H — App-level services     |

---

## Vision

### The Before

Snapshot is **partially** manifest-driven. Routes, pages, components, themes, overlays,
resources, workflows, and most of the auth screens already render from JSON. But the
acceptance test in `vision.md` — _"can a user enable this feature by editing
`snapshot.manifest.json` with no TypeScript?"_ — fails for a long list of features:

1. **`SnapshotConfig` is a second source of truth.** `src/types.ts:304-362` declares 25+
   fields on `SnapshotConfig` covering auth mode, redirects, callbacks, token storage,
   cache policy, contract, SSE endpoints, WS options, error formatting. `ManifestApp`
   forwards these via a `snapshotConfig` prop. The manifest cannot describe a complete
   app without code.

2. **Hardcoded path inference for auth screens.** `src/ui/manifest/auth.tsx:62-81` and
   `src/ui/manifest/app.tsx:106-131` literally enumerate `/login`, `/auth/login`,
   `/register`, `/auth/register`, etc. as fallback path candidates. This is duplicated
   in two files. The manifest cannot put the login screen at `/sign-in` without code
   awareness.

3. **Layout fallback decided in code.** `src/ui/manifest/app.tsx:265-268`:
   `route.page.layout ?? manifest.app.shell ?? (manifest.navigation?.mode === "top-nav" ? "top-nav" : "full-width")`.
   Three-level fallback chain. The third level is unreachable from the manifest.

4. **`"custom"` magic component type.** `src/ui/manifest/component-registry.tsx:47`:
   `if (type === "custom") return CustomComponentWrapper;`. The string `"custom"` is
   hardcoded. Custom component schemas are not declared in the manifest, so the
   validator cannot validate references to them.

5. **Side-effect registration of built-ins.** `src/ui/manifest/structural.tsx:336-339`
   and `src/ui/workflows/registry.ts` register components and actions via module-level
   side effects. Module-load order is implicit. The manifest cannot enumerate "what
   components and actions are available."

6. **Schema placeholders that are not alive.** `src/ui/manifest/schema.ts:521-522`:
   `policies: z.record(z.unknown())` and `i18n: z.record(z.unknown())`. Grep across
   `src/` finds zero runtime references. Pure shape, no consumer.

7. **Code-registered flavors.** `src/ui/tokens/flavors.ts` defines all flavors via
   `defineFlavor()` calls. The manifest's `theme` block can override token _values_ but
   cannot **declare a new flavor** or compose flavors by extension.

8. **Hardcoded loading/error UI.** `src/ui/manifest/app.tsx:287` and `:611` render
   bare `<div>Loading...</div>`. There is no manifest field for a loading component, an
   error component, a 404 component, or an offline component.

9. **Realtime is code-only.** WS and SSE event handlers are wired through hooks
   (`useRoomEvent`, `onSseEvent`) that take function references. Manifest cannot map
   `chat:message.created → workflow:append-to-feed`.

10. **Cache invalidation, optimistic updates, form lifecycle, toast config, analytics,
    push, token-editor persistence, OAuth/MFA/WebAuthn full config** — none of these are
    in the manifest. All are code-side or hardcoded defaults.

11. **No environment-variable indirection.** `apiUrl`, OAuth client ids, feature flags
    all force code paths to inject per-environment values. Manifest cannot say
    `{ "env": "API_URL" }`.

12. **No multi-backend or sub-manifest composition.** Manifest assumes one client and
    one root manifest. There is no `clients` block and no `subApps` block.

### The After

Every item above moves into the manifest. `SnapshotConfig` shrinks to four bootstrap
fields: `apiUrl`, `wsUrl?`, `bearerToken?`, `manifest`. The four legitimate escape
hatches from `vision.md` (custom component, custom action, custom client,
`{ "env": "..." }`) are the **only** code-side surfaces.

The acceptance test passes for every feature touched by this spec. A new contributor
can read `snapshot.manifest.json` and know the entire shape of the running app.

---

## What Already Exists on Main

Audited 2026-04-10. File paths and line numbers are from `origin/main`.

| Area                  | What's there                                                                                                                                  | What's missing                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest.theme`      | Full token schema, `resolveTokens()`, `useTokenEditor()`, built-in flavors via `defineFlavor()` (`src/ui/tokens/`)                            | Manifest cannot **declare** new flavors. Token editor persistence target hardcoded.                                                                                                                                        |
| `manifest.routes`     | Path, id, page, preload, refreshOnEnter, invalidateOnLeave, enter, leave, guard (`src/ui/manifest/schema.ts:386-405`)                         | No nested layouts. No parallel slots. No convention routes (`loading`, `error`, `notFound`, `offline`).                                                                                                                    |
| `manifest.navigation` | Items, mode, collapsible (schema present)                                                                                                     | Layout fallback decided in code (`app.tsx:265-268`).                                                                                                                                                                       |
| `manifest.auth`       | Screens, providers, passkey, branding, redirects, screenOptions, fields, links (`schema.ts:323-367`)                                          | Path inference still hardcoded (`auth.tsx:62-81`). No `session` block (mode/storage/key). No `contract` block. No `errors` block. No per-provider config (client id, scopes, callback). MFA/WebAuthn config not in schema. |
| `manifest.resources`  | Endpoint targets, dependsOn, invalidates, polling, refresh (`src/ui/manifest/resources.ts`)                                                   | Per-resource cache override not declared. Optimistic updates not declared. WS/SSE-backed resources have no event-to-workflow mapping.                                                                                      |
| `manifest.workflows`  | Full workflow definition schema with try/catch, retry, capture, assign, conditions (`src/ui/workflows/`)                                      | Custom action registry is side-effect only. Manifest cannot list available custom actions or their schemas.                                                                                                                |
| `manifest.overlays`   | Modal + drawer with content, footer, onOpen/onClose (`schema.ts:453-495`)                                                                     | No toast config.                                                                                                                                                                                                           |
| `manifest.state`      | App-scoped + route-scoped state with data + default (`schema.ts:407-413`)                                                                     | No persistence target declared.                                                                                                                                                                                            |
| `manifest.policies`   | `z.record(z.unknown())` placeholder (`schema.ts:521`)                                                                                         | No runtime. No consumers. Inert.                                                                                                                                                                                           |
| `manifest.i18n`       | `z.record(z.unknown())` placeholder (`schema.ts:522`)                                                                                         | No runtime. No consumers. Inert.                                                                                                                                                                                           |
| `manifest.ssr`        | `rsc` flag, `rscManifestPath` (`schema.ts:430-438`)                                                                                           | No middleware mapping. No head/meta declarations beyond title.                                                                                                                                                             |
| Components            | Full component library with schemas, ComponentWrapper, error boundaries, page renderer (`src/ui/components/`, `src/ui/manifest/renderer.tsx`) | `"custom"` type hardcoded as magic string. Custom-component schemas not declared in manifest.                                                                                                                              |
| Realtime              | `WebSocketManager`, `SseManager`, `useRoomEvent`, `onSseEvent`, registry pattern (`src/ws/`, `src/sse/`)                                      | No manifest field for event-to-workflow mapping. Per-endpoint config in code only.                                                                                                                                         |
| `SnapshotConfig`      | 25+ fields covering bootstrap, auth, callbacks, redirects, storage, contract, sse, ws, errors (`src/types.ts:304-362`)                        | Almost all of this should be in the manifest.                                                                                                                                                                              |
| `ManifestApp`         | Reads manifest, composes providers, runs router, dispatches workflows (`src/ui/manifest/app.tsx`)                                             | Receives `snapshotConfig` prop that re-introduces the second source of truth.                                                                                                                                              |

---

## Developer Context

### Build & Test Commands

```sh
bun run typecheck     # tsc --noEmit
bun run format:check  # Prettier
bun run build         # tsup + oclif manifest
bun test              # vitest run
```

All four must pass at the end of every phase. No exceptions.

### Key Files

| Path                                     | What                                                | Lines | Tracks that touch it |
| ---------------------------------------- | --------------------------------------------------- | ----- | -------------------- |
| `src/types.ts`                           | `SnapshotConfig`, `SnapshotInstance`, all SDK types | ~700  | B                    |
| `src/create-snapshot.tsx`                | Factory entry point, hook composition               | 526   | B, C, G, H           |
| `src/ui/manifest/schema.ts`              | Manifest Zod schema (the contract)                  | ~620  | All                  |
| `src/ui/manifest/app.tsx`                | `ManifestApp`, routing, lifecycle, layout fallback  | 709   | A, F, B              |
| `src/ui/manifest/auth.tsx`               | Auth screen rendering, path inference               | ~600  | A, B, H              |
| `src/ui/manifest/compiler.ts`            | Manifest validation + compilation                   | —     | All                  |
| `src/ui/manifest/component-registry.tsx` | Runtime component registry, `"custom"` magic        | 76    | A, C                 |
| `src/ui/manifest/structural.tsx`         | Built-in components, side-effect registration       | ~340  | A, C                 |
| `src/ui/workflows/registry.ts`           | Workflow action registry                            | 17    | A, C                 |
| `src/ui/workflows/types.ts`              | Workflow types                                      | —     | C, G                 |
| `src/ui/tokens/flavors.ts`               | Built-in flavors via `defineFlavor()`               | ~600  | C                    |
| `src/ui/tokens/resolve.ts`               | `resolveTokens()`                                   | —     | C, H                 |
| `src/ui/tokens/editor.ts`                | `useTokenEditor()` runtime overrides                | —     | H                    |
| `src/ui/manifest/resources.ts`           | Resource schema + endpoint targets                  | —     | E, G                 |
| `src/ui/manifest/runtime.tsx`            | Resource cache, runtime providers                   | —     | E, G                 |
| `src/ui/context/index.ts`                | Page/app context atoms                              | —     | D, G                 |
| `src/ws/manager.ts`, `src/ws/hook.ts`    | WebSocket manager + hooks                           | —     | G                    |
| `src/sse/manager.ts`                     | SSE manager                                         | —     | G                    |
| `src/auth/contract.ts`                   | `AuthContract` type + merge                         | —     | B                    |
| `src/ssr/manifest-renderer.ts`           | Manifest SSR entry                                  | —     | F                    |

### Boot Sequence (Current)

```
createSnapshot(config)
  ├── mergeContract(config.apiUrl, config.contract)
  ├── new ApiClient({...config.auth, contract})
  ├── createTokenStorage({...config.tokenStorage, key})
  ├── new QueryClient({stale, gc, retry from config})
  ├── if (config.ws) new WebSocketManager(config.ws)
  ├── if (config.sse) for each endpoint: new SseManager(...)
  ├── createAuthHooks({api, storage, config, contract, ...})
  ├── createMfaHooks(...), createOAuthHooks(...), createWebAuthnHooks(...)
  ├── createCommunityHooks(...), createWebhookHooks(...)
  ├── if (config.manifest) build ManifestApp component
  └── return SnapshotInstance
```

Track B's job is to make this read the manifest as the source of truth, with `config`
shrinking to bootstrap-only.

---

## Non-Negotiable Engineering Constraints

These come from `CLAUDE.md` and `docs/engineering-rules.md`. Any phase that violates one
is wrong.

- **Manifest-first.** The acceptance test (`vision.md`) is the rule: every new field
  must be expressible from manifest JSON alone.
- **Factory-closure SDK.** No singletons. Every hook closes over its dependencies.
  Adding manifest-driven config does not change this — hooks now close over
  manifest-derived runtime config.
- **No backwards compat shims.** Pre-production. Delete old fields. No deprecation. No
  re-export barrels. No "legacy" branches.
- **Components consume tokens, never raw values.** Any new component uses the canonical
  `--sn-*` tokens.
- **SSR-safe.** Every new component starts with `'use client'` if it uses hooks. Browser
  APIs in `useEffect` only. `renderToStaticMarkup` test in every component test suite.
- **Tests cover the config, not the implementation.** Schema tests for valid/invalid.
  Render tests with config fixtures. No tests against internal atom state.
- **Docs ship with the feature.** JSDoc on every exported symbol; `docs/` updated in
  the same commit as user-visible behavior changes.
- **Three entry points.** `@lastshotlabs/snapshot` (SDK), `@lastshotlabs/snapshot/ui`
  (manifest runtime), `@lastshotlabs/snapshot/vite` (build). Internals do not leak.

---

## Track A — Hardcoded Behavior Removal

Goal: every code path that decides app behavior in TypeScript moves to the manifest.
Track A is the prerequisite for Tracks B–H — once these hardcodes are gone, the manifest
is the only source of truth.

### Phase A1 — Auth path resolution by route id only

**Goal.** Delete `inferAuthScreenPath()` from both `auth.tsx` and `app.tsx`. Auth
screens are located by **route id** alone. The user puts a `login` screen wherever they
want by setting `routes[].id = "login"`.

**The change.**

```ts
// BEFORE — src/ui/manifest/auth.tsx:62-81 and src/ui/manifest/app.tsx:106-131
function inferAuthScreenPath(
  manifest: CompiledManifest,
  screen: AuthScreen,
): string | undefined {
  const routeById = manifest.routes.find((r) => r.id === screen);
  if (routeById) return routeById.path;
  const candidates: Record<AuthScreen, string[]> = {
    login: ["/login", "/auth/login"],
    register: ["/register", "/auth/register"],
    // ... 4 more entries
  };
  return candidates[screen].find((p) => manifest.routeMap[p] != null);
}

// AFTER — single helper in src/ui/manifest/auth-routes.ts
export function getAuthScreenPath(
  manifest: CompiledManifest,
  screen: AuthScreen,
): string | undefined {
  return manifest.routes.find((r) => r.id === screen)?.path;
}
```

**Validation.** `compileManifest()` must reject a manifest that lists `screen` in
`auth.screens` but has no route with matching `id`. Error message:
`Auth screen "login" is enabled but no route has id "login". Add { "id": "login", "path": "/your-path", ... } to routes.`

**Files.**

- Edit `src/ui/manifest/auth.tsx` — remove `inferAuthScreenPath`, import from new helper
- Edit `src/ui/manifest/app.tsx` — remove duplicate `inferAuthScreenPath`, import from new helper
- Create `src/ui/manifest/auth-routes.ts` — single source for the helper
- Edit `src/ui/manifest/compiler.ts` — add validation
- Edit `src/ui/manifest/__tests__/compiler.test.ts` — add rejection test

**Exit criteria.**

- `grep -r "inferAuthScreenPath" src/` returns nothing.
- A manifest with `auth.screens: ["login"]` and no `routes[].id === "login"` fails
  compilation with the error above.
- A manifest with `auth.screens: ["login"]` and `routes[].id === "login", path: "/sign-in"`
  successfully resolves the login screen at `/sign-in`.
- All existing tests pass.

### Phase A2 — Layout fallback removed

**Goal.** Delete the three-level fallback in `app.tsx:265-268`. The shell layout is
**explicit** in the manifest.

**The change.**

```ts
// BEFORE — src/ui/manifest/app.tsx:265-268
const shell =
  route.page.layout ??
  manifest.app.shell ??
  (manifest.navigation?.mode === "top-nav" ? "top-nav" : "full-width");

// AFTER
const shell = route.page.layout ?? manifest.app.shell ?? "full-width";
```

`navigation.mode` no longer leaks into shell selection. If a user wants `top-nav` shell,
they set `manifest.app.shell: "top-nav"` explicitly. The default when nothing is
specified is `full-width`.

**Schema change.** `manifest.app.shell` becomes required-with-default: `layoutSchema.default("full-width")`.

**Files.**

- Edit `src/ui/manifest/app.tsx`
- Edit `src/ui/manifest/schema.ts` (`appConfigSchema`)
- Update `src/ui/manifest/__tests__/app.test.tsx` to remove tests of the old fallback

**Exit criteria.**

- `grep -n "navigation?.mode" src/ui/manifest/app.tsx` returns nothing.
- A manifest with `navigation: { mode: "top-nav" }` and no `app.shell` renders
  `full-width`.
- A manifest with `app.shell: "top-nav"` renders `top-nav`.

### Phase A3 — `"custom"` magic replaced with declared schema

**Goal.** Custom components are **declared in the manifest** with their config schema.
The component-registry no longer special-cases `type === "custom"`. The renderer looks
up custom components through the same path as built-ins.

**Manifest addition.**

```jsonc
{
  "components": {
    "custom": {
      "order-timeline": {
        "props": {
          "orderId": { "type": "string", "required": true },
          "highlight": { "type": "boolean" },
        },
      },
    },
  },
}
```

**Usage.**

```jsonc
{
  "type": "order-timeline",
  "orderId": { "from": "order.id" },
}
```

The user no longer writes `{ "type": "custom", "component": "OrderTimeline" }`. The
custom component name is its `type`, namespaced under whatever the user picked. Validation
uses the declared props schema.

**Code-side registration unchanged.** `registerComponent("order-timeline", OrderTimeline)`
still happens at boot — but the manifest declares the schema independently, so the
validator can validate references without loading any component code.

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `componentsConfigSchema` with `custom` block
- Edit `src/ui/manifest/component-registry.tsx` — delete `CustomComponentWrapper`,
  delete `if (type === "custom")` branch
- Edit `src/ui/manifest/compiler.ts` — register custom schemas into the schema registry
  during compilation, validate component types against the union of built-in + custom
- Edit `src/ui/manifest/types.ts` — remove `CustomComponentConfig`
- Edit `src/ui/manifest/__tests__/compiler.test.ts` — add tests for declared custom
  components, undeclared custom types, schema validation

**Exit criteria.**

- `grep -n '"custom"' src/ui/manifest/component-registry.tsx` returns nothing.
- A manifest with a declared `order-timeline` custom component validates and renders.
- A manifest referencing an undeclared custom type fails compilation with
  `Unknown component type "order-timeline". Declare it in components.custom or use a built-in type.`
- A manifest declaring `order-timeline` with required `orderId` rejects a content node
  missing `orderId` with a Zod validation error.

### Phase A4 — Boot-time registry construction

**Goal.** Module side-effect registration disappears. `structural.tsx`,
`workflows/registry.ts`, `flavors.ts` no longer call `registerComponent()` or
`defineFlavor()` at module top level. Instead, an explicit `bootBuiltins()` function
runs once during `createSnapshot()` and populates the registries.

**Why.** Side-effect registration makes module load order load-bearing, breaks
tree-shaking, and prevents the manifest from declaring its own components/actions
because the registries are populated implicitly.

**The change.**

```ts
// BEFORE — src/ui/manifest/structural.tsx (bottom of file)
registerComponent("row", Row);
registerComponent("heading", Heading);
registerComponent("button", Button);
registerComponent("select", Select);

// AFTER — src/ui/manifest/structural.tsx exports the components only
export const STRUCTURAL_COMPONENTS = {
  row: Row,
  heading: Heading,
  button: Button,
  select: Select,
} as const;
```

```ts
// NEW — src/ui/manifest/boot-builtins.ts
import { registerComponent } from "./component-registry";
import { registerWorkflowAction } from "../workflows/registry";
import { defineFlavor } from "../tokens/flavors";
import { STRUCTURAL_COMPONENTS } from "./structural";
import { BUILTIN_FLAVORS } from "../tokens/flavor-defs";
import { BUILTIN_WORKFLOW_ACTIONS } from "../workflows/builtins";

let booted = false;
export function bootBuiltins(): void {
  if (booted) return;
  booted = true;
  for (const [name, c] of Object.entries(STRUCTURAL_COMPONENTS))
    registerComponent(name, c);
  for (const [name, h] of Object.entries(BUILTIN_WORKFLOW_ACTIONS))
    registerWorkflowAction(name, h);
  for (const [name, f] of Object.entries(BUILTIN_FLAVORS))
    defineFlavor(name, f);
}
```

**Where it's called.** First line of `createSnapshot()`. Idempotent so re-imports are
safe.

**Files.**

- Create `src/ui/manifest/boot-builtins.ts`
- Edit `src/ui/manifest/structural.tsx` — remove side-effect calls, export
  `STRUCTURAL_COMPONENTS`
- Edit `src/ui/workflows/registry.ts` — already exports register functions; create
  `src/ui/workflows/builtins.ts` exporting `BUILTIN_WORKFLOW_ACTIONS`
- Edit `src/ui/tokens/flavors.ts` — split definitions into `flavor-defs.ts` (data) and
  `flavors.ts` (registry only)
- Edit `src/create-snapshot.tsx` — call `bootBuiltins()` first thing
- Edit `src/ui/manifest/component-registry.tsx` — `getRegisteredComponent()` no longer
  has the `"custom"` branch (already removed in A3)

**Exit criteria.**

- `grep -rn "registerComponent(" src/ui/manifest/structural.tsx` returns nothing.
- `grep -rn "defineFlavor(" src/ui/tokens/flavors.ts` returns only the `defineFlavor`
  function definition itself, not call sites.
- A clean import of `@lastshotlabs/snapshot/ui` followed by checking the registries
  shows them empty until `createSnapshot()` is called.
- All existing tests pass — `bootBuiltins()` runs in test setup if needed.

### Phase A5 — Manifest-driven loading/error/notFound/offline UI

**Goal.** No more `<div>Loading...</div>` literals in `app.tsx`. The manifest declares
which component renders during route preloads, auth checks, errors, 404s, and offline
states.

**Manifest addition.**

```jsonc
{
  "app": {
    "loading": { "type": "spinner", "size": "lg" },
    "error": { "type": "error-page", "showRetry": true },
    "notFound": "/404",
    "offline": { "type": "offline-banner" },
  },
}
```

`loading`, `error`, `offline` accept either an inline component config or a route id.
`notFound` accepts a route id only.

**Defaults if omitted.** Built-in components `<DefaultLoading>`, `<DefaultError>`,
`<DefaultNotFound>`, `<DefaultOffline>` registered as built-ins. Defaults render as
neutral, token-styled placeholders.

**Files.**

- Edit `src/ui/manifest/schema.ts` — extend `appConfigSchema` with the four fields
- Edit `src/ui/manifest/app.tsx` — replace literal `<div>Loading...</div>` with
  `<AppFallback name="loading" manifest={manifest} />`
- Create `src/ui/components/feedback/{default-loading,default-error,default-not-found,default-offline}/`
- Register defaults in `boot-builtins.ts`

**Exit criteria.**

- `grep -n 'Loading\.\.\.' src/ui/manifest/app.tsx` returns nothing.
- A manifest with `app.loading: { type: "spinner" }` shows the spinner during preloads.
- A manifest with no `app.loading` shows the default loading component.
- All four states (loading, error, notFound, offline) reachable from manifest config.

---

## Track B — `SnapshotConfig` Collapse + Env Resolution

Goal: shrink `SnapshotConfig` to four bootstrap fields. Everything else moves to the
manifest. Add `{ "env": "..." }` resolver so the manifest can reference per-environment
values.

### Phase B1 — `{ "env": "..." }` resolver

**Goal.** Anywhere a manifest accepts a string, accept `{ "env": "VAR_NAME" }` as well.
The resolver reads from a per-`createSnapshot` env source. The default source reads
`import.meta.env` (Vite) and falls back to `process.env`.

**Type.**

```ts
/** A manifest reference to a per-environment value. */
export type EnvRef = { env: string; default?: string };

export function isEnvRef(value: unknown): value is EnvRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "env" in value &&
    typeof (value as { env: unknown }).env === "string"
  );
}

/** Resolve an EnvRef using the configured env source. Returns the default if missing. */
export function resolveEnvRef(
  ref: EnvRef,
  env: Record<string, string | undefined>,
): string | undefined {
  return env[ref.env] ?? ref.default;
}
```

**Schema helper.**

```ts
const envRefSchema = z
  .object({ env: z.string().min(1), default: z.string().optional() })
  .strict();
const stringOrEnvRef = z.union([z.string(), envRefSchema]);
```

**Where it's accepted.** Any manifest field that is per-environment by nature:
`clients[].apiUrl`, `auth.providers[].clientId`, `analytics.providers[].apiKey`,
`push.vapidPublicKey`, etc. Also: `manifest.app.apiUrl` (override of bootstrap arg).

**Env source.** `createSnapshot({ env? })` accepts an optional `env: Record<string, string>`.
Default: a function that reads `import.meta.env` if available, then `process.env`. Track
B6 adds this argument.

**Files.**

- Create `src/ui/manifest/env.ts` — `EnvRef`, `isEnvRef`, `resolveEnvRef`, `envRefSchema`
- Edit `src/ui/manifest/schema.ts` — import `envRefSchema`, use `stringOrEnvRef` in the
  fields listed above
- Edit `src/ui/manifest/compiler.ts` — resolve `EnvRef`s during compilation, store
  resolved values in the compiled manifest
- Tests in `src/ui/manifest/__tests__/env.test.ts`

**Exit criteria.**

- A manifest with `clients.main.apiUrl: { env: "API_URL" }` resolves to the env value
  at compile time.
- A missing env var without a default produces a clear compile error.
- A missing env var with a default uses the default.

### Phase B2 — `manifest.auth.session`

**Goal.** Move `auth: 'cookie' | 'token'`, `tokenStorage`, and `tokenKey` from
`SnapshotConfig` into `manifest.auth.session`.

**Schema.**

```ts
export const authSessionSchema = z
  .object({
    mode: z.enum(["cookie", "token"]).default("cookie"),
    storage: z
      .enum(["localStorage", "sessionStorage", "memory"])
      .default("sessionStorage"),
    key: z.string().default("snapshot.token"),
  })
  .strict();
```

Added to `authScreenConfigSchema` as `session: authSessionSchema.optional()`. Default
when omitted is `{ mode: "cookie" }`.

**Threading.** `compileManifest()` returns `compiled.auth.session`. `createSnapshot()`
reads `compiled.auth.session` (after Track B6 makes the manifest the source of truth).

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/ui/manifest/types.ts`
- Edit `src/ui/manifest/compiler.ts`

**Exit criteria.**

- `manifest.auth.session.mode: "token"` produces a token-mode `ApiClient`.
- Default behavior (no `session` block) is cookie mode.
- Track B6 will delete the equivalent fields from `SnapshotConfig`; until then, manifest
  values take precedence over config values.

### Phase B3 — `manifest.app.cache`

**Goal.** Move `staleTime`, `gcTime`, `retry` to `manifest.app.cache`.

**Schema.**

```ts
export const appCacheSchema = z
  .object({
    staleTime: z
      .number()
      .int()
      .nonnegative()
      .default(5 * 60 * 1000),
    gcTime: z
      .number()
      .int()
      .nonnegative()
      .default(10 * 60 * 1000),
    retry: z.number().int().nonnegative().default(1),
  })
  .strict();
```

Added to `appConfigSchema` as `cache: appCacheSchema.optional()`. Defaults match the
current `createSnapshot` defaults.

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/ui/manifest/types.ts`
- Edit `src/ui/manifest/compiler.ts`

**Exit criteria.**

- `manifest.app.cache.staleTime: 60000` produces a `QueryClient` with that stale time.
- Default behavior (no `cache` block) matches today's defaults.

### Phase B4 — `manifest.auth.contract` + redirects + handlers

**Goal.** Move `AuthContractConfig`, `loginPath`/`homePath`/etc., and
`onUnauthenticated`/`onForbidden`/`onLogoutSuccess` callbacks into the manifest.

**Schema.** `manifest.auth.contract` accepts the same shape as today's
`AuthContractConfig` (it's already JSON-shaped — `endpoints`, `headers`).

`manifest.auth.redirects` already exists at `schema.ts:346-354`. Extend it to also cover
`unauthenticated` and `forbidden` redirects (currently those are callbacks).

`manifest.auth.on` is new — workflow names for what was previously a callback:

```jsonc
{
  "auth": {
    "on": {
      "unauthenticated": "redirect-to-login",
      "forbidden": "show-forbidden-toast",
      "logout": "clear-cart-and-redirect",
    },
  },
}
```

Each value is a workflow name (the workflow lives in `manifest.workflows`). The legacy
"redirect path" form (`loginPath` etc.) is **deleted** — users put their redirect logic
in a one-line workflow.

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `auth.contract`, `auth.on`
- Edit `src/ui/manifest/compiler.ts` — validate that `auth.on` workflow names exist
- Edit `src/auth/contract.ts` — `mergeContract` continues to work; just receives the
  manifest's contract instead of `config.contract`

**Exit criteria.**

- A manifest with `auth.on.unauthenticated: "my-workflow"` runs the workflow when 401
  fires.
- A manifest with no `auth.on` does nothing on 401 (no implicit redirect).
- `loginPath`, `homePath`, `forbiddenPath`, `mfaPath`, `mfaSetupPath` deleted from
  `SnapshotConfig` in B6.

### Phase B5 — `manifest.realtime.{ws,sse}`

**Goal.** Move `config.ws` and `config.sse` to `manifest.realtime.ws` and
`manifest.realtime.sse`. Track G1 will add the event-to-workflow mapping; this phase
just relocates the existing options.

**Schema.**

```ts
export const realtimeWsSchema = z
  .object({
    url: stringOrEnvRef.optional(),
    autoReconnect: z.boolean().default(true),
    reconnectOnLogin: z.boolean().default(true),
    reconnectOnFocus: z.boolean().default(true),
    maxReconnectAttempts: z.number().int().nonnegative().optional(),
    reconnectBaseDelay: z.number().int().nonnegative().optional(),
    reconnectMaxDelay: z.number().int().nonnegative().optional(),
    on: z
      .object({
        connected: z.string().optional(),
        disconnected: z.string().optional(),
        reconnecting: z.string().optional(),
        reconnectFailed: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const realtimeSseEndpointSchema = z
  .object({
    withCredentials: z.boolean().optional(),
    on: z
      .object({
        connected: z.string().optional(),
        error: z.string().optional(),
        closed: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const realtimeConfigSchema = z
  .object({
    ws: realtimeWsSchema.optional(),
    sse: z
      .object({
        endpoints: z.record(realtimeSseEndpointSchema),
        reconnectOnLogin: z.boolean().default(true),
      })
      .strict()
      .optional(),
  })
  .strict();
```

`url` defaults to deriving from `apiUrl` (auto `http→ws`, `https→wss`).

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/create-snapshot.tsx` — read `compiled.realtime.ws` instead of `config.ws`,
  same for SSE
- Delete `SnapshotConfig.ws` and `SnapshotConfig.sse` in B6

**Exit criteria.**

- A manifest with `realtime.ws.url: { env: "WS_URL" }` reads the env var.
- A manifest with no `realtime.ws.url` derives from `apiUrl`.
- All existing WS/SSE tests pass with the new manifest source.

### Phase B6 — Collapse `SnapshotConfig` to four fields

**Goal.** The terminal phase of Track B. Delete every field from `SnapshotConfig` that
moved into the manifest. Final shape:

```ts
export interface SnapshotConfig {
  /** API base URL. Per-environment, not part of the contract. */
  apiUrl: string;
  /** Optional environment source for { "env": "..." } resolution. Defaults to import.meta.env then process.env. */
  env?: Record<string, string | undefined>;
  /** @internal Test/CLI only. Not for browser deployments. */
  bearerToken?: string;
  /** The frontend manifest. */
  manifest: ManifestConfig;
}
```

**Deleted fields.** `auth`, `loginPath`, `homePath`, `forbiddenPath`, `mfaPath`,
`mfaSetupPath`, `onUnauthenticated`, `onForbidden`, `onLogoutSuccess`, `authErrors`,
`tokenStorage`, `tokenKey`, `staleTime`, `gcTime`, `retry`, `contract`, `sse`, `ws`.

**`ManifestApp` no longer needs `snapshotConfig`.** It receives only the entry point's
`SnapshotInstance`. The `apiUrl` is read from `manifest.app.apiUrl` (with the env-ref
resolver) or from the bootstrap `apiUrl`.

**Files.**

- Edit `src/types.ts` — delete the fields, keep the four
- Edit `src/create-snapshot.tsx` — read every dropped field from the compiled manifest
- Edit `src/ui/manifest/app.tsx` — remove `snapshotConfig` prop and all uses
- Edit every test/example that constructs a `SnapshotConfig`

**Test migration is part of B6, not deferred.** Before B6 is marked done, the agent must:

1. `grep -rn "SnapshotConfig" src/ test/` — every match in a test file must be updated
   to the four-field shape.
2. `grep -rn "createSnapshot(" src/ test/ playground/` — every call site must be migrated.
3. Estimated ~60 test files. They land in the **same commit** as B6 so the diff is one
   reviewable unit. Per-track migration is explicitly disallowed.

**Cross-track sequencing.** Tracks C–H **block on B6**. They may begin schema and test
work on their branches in parallel, but they cannot merge runtime wiring that reads from
both `SnapshotConfig` and the manifest. There must be no dual-source code path at any
commit. Once B6 lands on `main`, C–H rebase and merge.

**Exit criteria.**

- `SnapshotConfig` has exactly four fields.
- A test app boots from `createSnapshot({ apiUrl, manifest })` alone.
- `bun run typecheck` passes after deleting fields.
- `grep -rn "snapshotConfig" src/` returns nothing (the prop is gone).
- All existing tests pass after migration — no `.skip`, no `.only`.
- `bun test` and `bun run build` pass.

---

## Track C — Declarative Registries

Goal: every registry (components, workflow actions, flavors) is populated from both code
and manifest. The manifest can declare items the code does not know about (their
schemas), and the manifest can list every item the framework expects to find at runtime.

### Phase C1 — Manifest-side custom-component declarations

Already specified in Phase A3. C1 is the cross-track dependency marker — Track C
**requires** A3 to be complete before C2/C3 build on it.

### Phase C2 — Manifest-side custom-action declarations

**Goal.** Same shape as A3, applied to workflow actions.

**Manifest addition.**

```jsonc
{
  "workflows": {
    "actions": {
      "custom": {
        "send-to-slack": {
          "input": {
            "channel": { "type": "string", "required": true },
            "message": { "type": "string", "required": true },
          },
        },
      },
    },
    "definitions": {
      "notify-slack": {
        "steps": [
          {
            "action": "send-to-slack",
            "channel": "#alerts",
            "message": "{from:event.summary}",
          },
        ],
      },
    },
  },
}
```

**Code-side registration unchanged.** `registerWorkflowAction("send-to-slack", handler)`
in user code. Manifest declares the schema so workflow definitions can reference and
validate it without loading the handler.

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `workflows.actions.custom` block
- Edit `src/ui/workflows/registry.ts` — add `getDeclaredCustomActionSchema(name)`
- Edit `src/ui/manifest/compiler.ts` — validate workflow steps against built-in actions
  - declared custom actions

**Exit criteria.**

- A workflow referencing an undeclared action fails compilation.
- A workflow referencing a declared custom action with the wrong input shape fails
  compilation.
- A correctly declared and used custom action runs at runtime.

### Phase C3 — Manifest-declarable flavors

**Goal.** Manifest can declare a new flavor by extension. Code-side `defineFlavor()`
becomes one of several sources, not the only source.

**Manifest addition.**

```jsonc
{
  "theme": {
    "flavor": "my-brand",
    "flavors": {
      "my-brand": {
        "extends": "neutral",
        "displayName": "My Brand",
        "colors": { "primary": "0.55 0.18 25", "accent": "0.6 0.15 280" },
        "darkColors": { "primary": "0.65 0.2 25" },
        "radius": "md",
        "spacing": "default",
        "font": {},
      },
    },
  },
}
```

`extends` references a flavor that already exists (built-in or another manifest-declared
flavor). Color values are raw oklch strings as documented in `engineering-rules.md`.

**Compilation.** `compileManifest()` walks `theme.flavors`, resolves `extends`, and
calls `defineFlavorWithExtension()` for each. Then `theme.flavor` selects the active one.

**`defineFlavorWithExtension` semantics.** Reads the parent flavor by name from the
flavor registry, then merges:

```ts
export function defineFlavorWithExtension(
  name: string,
  extendsName: string,
  overrides: Partial<FlavorConfig>,
): void {
  const parent = getFlavor(extendsName);
  if (!parent) throw new Error(`Cannot extend unknown flavor "${extendsName}"`);

  const merged: FlavorConfig = {
    displayName: overrides.displayName ?? parent.displayName,
    colors: { ...parent.colors, ...overrides.colors },
    darkColors: deriveDarkColors(parent, overrides),
    radius: overrides.radius ?? parent.radius,
    spacing: overrides.spacing ?? parent.spacing,
    font: { ...parent.font, ...overrides.font },
  };

  defineFlavor(name, merged);
}
```

**Dark color derivation rule (binding).** Per `engineering-rules.md`, dark mode overrides
must derive from user changes. The merge precedence is:

1. If `overrides.darkColors[k]` is set explicitly → use that.
2. Else if `overrides.colors[k]` is set (user changed the light value) → call
   `deriveDarkVariant(overrides.colors[k])` (the same helper used by the token editor for
   runtime overrides — already exists in `src/ui/tokens/derive-dark.ts`).
3. Else → fall back to `parent.darkColors[k]`.

This is what `deriveDarkColors(parent, overrides)` does. The helper must be reused (not
reimplemented) so the manifest path and the runtime token-editor path produce identical
dark variants for the same light input. **If `derive-dark.ts` doesn't exist yet, the
agent extracts the existing inline derivation from `editor.ts` into a shared helper as
the first step of this phase.**

**Files.**

- Edit `src/ui/tokens/schema.ts` — extend `themeConfigSchema` with `flavors` map (a Zod
  record of `flavorOverrideSchema` — a `FlavorConfig` schema with all fields optional
  except `extends`)
- Edit `src/ui/tokens/flavors.ts` — add `defineFlavorWithExtension`, `getFlavor` (if not
  already exported)
- Create or edit `src/ui/tokens/derive-dark.ts` — extract `deriveDarkVariant` and
  `deriveDarkColors` from `editor.ts`
- Edit `src/ui/tokens/editor.ts` — import from `derive-dark.ts` instead of inline
- Edit `src/ui/manifest/compiler.ts` — register manifest-declared flavors during
  compilation, error on circular `extends` chains
- Tests: extending a built-in, extending a manifest-declared flavor, dark variant
  derivation matches token-editor output, circular extends rejection

**Exit criteria.**

- A manifest with `theme.flavors.my-brand: { extends: "neutral", ... }` produces a
  working `my-brand` flavor at runtime with no code-side registration.
- Selecting `theme.flavor: "my-brand"` activates it.
- Built-in flavors continue to work unchanged.
- A manifest flavor that overrides `colors.primary` (light) without setting
  `darkColors.primary` produces the same dark variant as the token editor would for that
  same light value (assert via direct call to the shared helper).
- A manifest with `flavors.a: { extends: "b" }` and `flavors.b: { extends: "a" }` fails
  compilation with `Circular flavor extension: a → b → a`.
- `grep -n "deriveDarkVariant" src/ui/tokens/editor.ts` shows it imported, not defined.

### Phase C4 — Boot-time registry construction

Already specified in Phase A4. Cross-track dependency marker.

---

## Track D — Policies + i18n

### Phase D1 — `policies` schema, resolver, route guard integration

**Goal.** Replace the `z.record(z.unknown())` placeholder with a real authorization
expression schema, a runtime resolver, and integration with route guards.

**Schema.**

```ts
/** A boolean policy expression — JSON Logic-style with named refs. */
export const policyExprSchema: z.ZodType = z.lazy(() =>
  z.union([
    z.string(), // ref to another policy by name
    z.object({ all: z.array(policyExprSchema) }).strict(), // AND
    z.object({ any: z.array(policyExprSchema) }).strict(), // OR
    z.object({ not: policyExprSchema }).strict(), // NOT
    z.object({ equals: z.tuple([refOrLiteral, refOrLiteral]) }).strict(),
    z.object({ "not-equals": z.tuple([refOrLiteral, refOrLiteral]) }).strict(),
    z.object({ exists: refOrLiteral }).strict(),
    z.object({ truthy: refOrLiteral }).strict(),
    z.object({ falsy: refOrLiteral }).strict(),
    z.object({ in: z.tuple([refOrLiteral, z.array(refOrLiteral)]) }).strict(),
  ]),
);

const refOrLiteral = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  fromRefSchema,
  envRefSchema,
]);

export const policiesSchema = z.record(policyExprSchema);
```

**Resolver.** `evaluatePolicy(name, expr, ctx)` walks the expression. Refs resolve via
`resolveFromRef()` (already exists). Returns `boolean`.

**Route guard integration.** `routeConfigSchema.guard` adds a `policy` field:

```jsonc
{
  "id": "admin",
  "path": "/admin",
  "guard": { "policy": "is-admin" },
}
```

**`guard.condition` is deleted in this same phase (D1).** Pre-production rules (no
backwards compat). The previous ad-hoc `condition` form is removed from the schema and
every existing usage is migrated to a named policy in `manifest.policies`. The agent
must:

1. `grep -rn "guard.*condition" src/ playground/ test/` to find every usage.
2. For each, define a named policy (or reuse an existing one) and replace the inline
   `condition` with `{ "policy": "name" }`.
3. Delete the `condition` field from `guard`'s Zod schema.

Doing this in D1 (not deferred to D2) keeps Track D internally consistent.

**Files.**

- Create `src/ui/policies/types.ts`, `src/ui/policies/evaluate.ts`,
  `src/ui/policies/__tests__/`
- Edit `src/ui/manifest/schema.ts` — replace `policies: z.record(z.unknown())`, **delete
  `guard.condition`** from `routeConfigSchema`
- Edit `src/ui/manifest/app.tsx` — `evaluateRouteGuard` calls `evaluatePolicy` when
  `guard.policy` is set; remove the old `condition` evaluation branch
- Edit `src/ui/manifest/compiler.ts` — validate that policy refs exist
- Migrate every existing `guard.condition` usage in tests/playground to named policies

**Exit criteria.**

- A manifest with `policies.is-admin: { equals: [{ from: "global.user.role" }, "admin"] }`
  and `routes[].guard.policy: "is-admin"` blocks non-admin users.
- A reference to an undeclared policy fails compilation.
- 100% test coverage on the resolver.
- `grep -rn '"condition"' src/ui/manifest/` returns nothing.
- `grep -rn "guard.condition" src/ playground/ test/` returns nothing.

### Phase D2 — Component `visible` policy support

**Goal.** Components accept `"visible": { "policy": "name" }` in addition to the existing
boolean / responsive / from-ref form.

**Files.**

- Edit `src/ui/manifest/schema.ts` — extend `baseComponentConfigSchema.visible` union
  with `policyRefSchema`
- Edit `src/ui/components/_base/component-wrapper.tsx` (or wherever visibility is
  resolved) — call `evaluatePolicy` when the visible value is a policy ref
- Tests in component-wrapper test suite

**Exit criteria.**

- `"visible": { "policy": "is-admin" }` hides the component for non-admins.
- Existing visibility forms continue to work.

### Phase D3 — `i18n` schema, resolver, `{ "t": "..." }` ref

**Goal.** Replace the `z.record(z.unknown())` placeholder with a real i18n schema and a
`{ "t": "key" }` resolver parallel to `{ "from": "..." }`.

**Schema.**

```ts
export const i18nConfigSchema = z
  .object({
    default: z.string().min(1),
    locales: z.array(z.string().min(1)).min(1),
    strings: z.record(
      z.union([
        z.string(), // path to JSON file
        z.record(z.union([z.string(), z.record(z.string())])), // inline strings
      ]),
    ),
    detect: z
      .array(z.enum(["state", "navigator", "default", "header"]))
      .optional(),
  })
  .strict();
```

**Resolver.** `useT(key, vars?)` hook + `resolveTRef(ref, locale, strings)` non-hook
function for use in compilers. Handles dot-path key lookup, string interpolation
(`{var}`), and missing-key fallback (returns key, warns in dev).

**`{ "t": "..." }` ref.** Components that accept text fields (heading.text, button.label,
nav item labels, modal title, etc.) accept a `TRef`:

```ts
export type TRef = { t: string; vars?: Record<string, unknown> };
```

Same union shape as `FromRef` and `EnvRef`. The resolver runs at render time, subscribes
to the active locale atom, and re-renders on locale change.

**Files.**

- Create `src/ui/i18n/{schema,resolve,hook}.ts`, `src/ui/i18n/__tests__/`
- Edit `src/ui/manifest/schema.ts` — replace `i18n: z.record(z.unknown())`
- Edit `src/ui/context/index.ts` — add `localeAtom` to app context
- Edit components that accept text fields (heading, button, nav, modal, drawer,
  page title)

**Exit criteria.**

- A manifest with `i18n.locales: ["en", "es"]`, strings files, and
  `{ "type": "heading", "text": { "t": "page.title" } }` renders the right string for
  the active locale.
- Locale switch re-renders affected components.
- Missing keys log a dev warning and return the key.

### Phase D4 — i18n locale detection + persistence

**Goal.** The `detect` strategy from D3 is implemented end-to-end.

- `state` — read from `manifest.state.locale` (a regular state value)
- `navigator` — read `navigator.language` in `useEffect`
- `header` — SSR only, read from `Accept-Language`
- `default` — fall back to `i18n.default`

`detect` is an ordered list. The first one that returns a value in `i18n.locales` wins.

**Persistence.** When `detect` includes `state`, the active locale persists via the
state value's normal persistence path (which itself becomes manifest-driven via
Track H4's token-editor pattern, applied to state values).

**Files.**

- Edit `src/ui/i18n/resolve.ts` — implement detection
- Edit `src/ssr/manifest-renderer.ts` — pass `Accept-Language` into the SSR locale
  resolution

**Exit criteria.**

- `detect: ["state", "navigator", "default"]` — user can change locale via a state
  value, falls back to navigator, then default.
- SSR honors `Accept-Language` when `detect` includes `header`.

---

## Track E — Multi-App

### Phase E1 — `clients` block + per-resource client selection

**Goal.** Manifest can declare multiple backend clients. Each `resource` declares which
client it uses.

**Schema.**

```ts
export const clientConfigSchema = z
  .object({
    apiUrl: stringOrEnvRef,
    contract: authContractConfigSchema.optional(),
    /** Custom client implementation, registered in code by name. Escape hatch #3. */
    custom: z.string().optional(),
  })
  .strict();

export const clientsSchema = z.record(clientConfigSchema);
```

```jsonc
{
  "clients": {
    "main": { "apiUrl": { "env": "API_URL" } },
    "billing": { "apiUrl": { "env": "BILLING_API_URL" } },
  },
  "resources": {
    "users": { "kind": "rest", "client": "main", "endpoint": "/users" },
    "invoices": {
      "kind": "rest",
      "client": "billing",
      "endpoint": "/invoices",
    },
  },
}
```

The default client (when a resource omits `client`) is `"main"`. If `clients` is omitted
entirely, a default `main` client is auto-derived from the bootstrap `apiUrl`.

**Runtime.** `createSnapshot()` builds an `ApiClient` per declared client. The resource
runtime selects the right client by name.

**Custom client registration API.** Escape hatch #3 uses the factory pattern, parallel
to `registerComponent` and `registerWorkflowAction`:

```ts
// src/api/custom-clients.ts
export type ClientFactory = (
  apiUrl: string,
  bootstrap: { env?: Record<string, string | undefined>; bearerToken?: string },
) => ApiClientLike;

export function registerClient(name: string, factory: ClientFactory): void;
export function getRegisteredClient(name: string): ClientFactory | undefined;
```

The factory closes over per-instance state (matches the SDK's factory-closure rule). When
a manifest declares `clients.foo.custom: "stripe-client"`, the runtime calls
`getRegisteredClient("stripe-client")(apiUrl, bootstrap)` and stores the result in the
client map under `foo`. The returned object must implement the same surface as
`ApiClient` (`get`, `post`, `put`, `patch`, `delete`, `request`).

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `clients`, extend `resourceConfigSchema` with
  `client?: string`
- Create `src/api/custom-clients.ts` — `registerClient` / `getRegisteredClient` factory
  registry
- Edit `src/ui/manifest/runtime.tsx` — manage a map of `ApiClient`s, look up by resource
- Edit `src/create-snapshot.tsx` — instantiate clients (built-in via `ApiClient`, custom
  via `getRegisteredClient`)
- Edit `src/api/client.ts` — should already accept per-instance config; verify
- Export `registerClient` from `src/index.ts`

**Exit criteria.**

- A two-client manifest fetches from both backends correctly.
- Resources without an explicit `client` field use `main`.
- Custom clients (escape hatch #3) registered by name via `registerClient` are usable
  from manifest.
- A manifest referencing `clients.foo.custom: "unknown"` fails compilation with a clear
  error naming the unregistered client.

### Phase E2 — `subApps` block + sub-manifest mounting

**Goal.** Manifest can mount another manifest under a path prefix. The sub-manifest gets
its own routes, components, overlays, and workflows.

**Schema.**

```ts
export const subAppConfigSchema = z
  .object({
    mountPath: z.string().startsWith("/"),
    manifest: z.union([
      z.string(), // path to a manifest file (loaded at compile time)
      manifestConfigSchema, // inline manifest object
    ]),
    inherit: z
      .object({
        theme: z.boolean().default(true),
        i18n: z.boolean().default(true),
        policies: z.boolean().default(true),
        state: z.boolean().default(false),
      })
      .strict()
      .optional(),
  })
  .strict();

export const subAppsSchema = z.record(subAppConfigSchema);
```

```jsonc
{
  "subApps": {
    "admin": {
      "mountPath": "/admin",
      "manifest": "./manifests/admin.json",
    },
  },
}
```

**Mounting.** `compileManifest()` recursively compiles each sub-manifest. The router
matches paths under `mountPath` against the sub-manifest's routes (with the prefix
stripped). Each sub-app gets its own page context. App context is shared with the
parent unless `inherit.state: false`.

**`clients` inheritance — child wins on collision.** If the sub-manifest declares its own
`clients` block, the resolved client map for that sub-app is `{ ...parentClients,
...subAppClients }`. Same-name clients in the sub-app fully replace the parent's
definition for resources scoped to that sub-app. Parent resources continue to see the
parent client. The compiler validates child client definitions against the same
`clientConfigSchema` and rejects unknown `custom` references.

**Sub-app SSR — out of scope for this spec.** Sub-app routes are client-only in this
phase. The SSR renderer must mark sub-app route trees as suspense boundaries that render
the parent shell on the server and hydrate the sub-app on the client. A follow-up spec
will tackle full server rendering of sub-manifests (it requires server-side manifest
loading and per-request manifest resolution, which has its own design surface).

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/ui/manifest/compiler.ts` — recursive sub-app compilation
- Edit `src/ui/manifest/app.tsx` — sub-app router mounting
- Edit `src/ui/manifest/router.ts` — path-prefix matching against sub-apps
- Tests for nested resolution, path stripping, two-level nesting

**Exit criteria.**

- A manifest with one sub-app at `/admin` routes `/admin/users` to the sub-manifest's
  `/users` route.
- Two-level nesting works (sub-app inside a sub-app).
- Sub-apps with `inherit.theme: false` use their own theme.

### Phase E3 — Sub-manifest theme/i18n/policy inheritance

**Goal.** The `inherit` block from E2 is implemented end-to-end. Sub-apps merge parent
values for the inherited categories.

**Files.**

- Edit `src/ui/manifest/compiler.ts` — implement merging
- Edit `src/ui/policies/evaluate.ts` — sub-app evaluator falls back to parent policies
- Edit `src/ui/i18n/resolve.ts` — sub-app strings layer over parent strings

**Exit criteria.**

- A sub-app inherits all parent flavors and can override individual ones.
- A sub-app inherits parent policies and can add its own.
- A sub-app inherits parent i18n strings and can override individual keys.

---

## Track F — Manifest-Driven SSR + Routing

### Phase F1 — Convention routes

**Goal.** `manifest.app.{loading,error,notFound,offline}` (Phase A5) honored by SSR
renderer too. The SSR renderer uses the same fallback components for the same states.

**Files.**

- Edit `src/ssr/manifest-renderer.ts` — read fallbacks from manifest
- Edit `src/ssr/render.ts` — use fallback components for SSR error states

**Exit criteria.**

- An SSR 500 renders the manifest's `error` component.
- An SSR 404 renders the manifest's `notFound` route.

### Phase F2 — Nested layout declarations

**Goal.** Routes declare a chain of layouts in the manifest. The renderer composes them
parent-to-child. Replaces the existing single `route.page.layout` with a layout array.

**Schema.**

```ts
export const routeLayoutSchema = z.union([
  z.string(), // layout name (built-in or custom component)
  z
    .object({
      type: z.string(),
      props: z.record(z.unknown()).optional(),
    })
    .strict(),
]);

routeConfigSchema.extend({
  layouts: z.array(routeLayoutSchema).optional(), // outermost first
});
```

**`route.page.layout` is deleted.** Pre-production rules. The single-layout field is
replaced entirely by `layouts: [...]`. The agent must:

1. `grep -rn "page.layout" src/ playground/ test/` to find every usage.
2. For each route that has a `page.layout: "x"`, rewrite to `layouts: ["x"]`.
3. Delete the `layout` field from `routePageSchema`'s Zod definition.
4. Resolution order in the renderer: if `route.layouts` is set, use it; otherwise fall
   back to `[manifest.app.shell]` (the global default from A2).

**Stable identity for outer layouts.** The renderer must key each layout by `type` so
React doesn't unmount/remount shared outer layouts on sibling navigation. Implementation:
walk the `layouts` array and render as nested elements with stable React keys derived
from `type` (`<L key="root"><L key="dashboard">...</L></L>`).

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `layouts`, **delete `page.layout`**
- Edit `src/ui/manifest/app.tsx` — `AppShell` composes layouts in order with stable keys
- Edit `src/ssr/manifest-renderer.ts` — same composition for SSR
- Migrate every `page.layout` reference in tests/playground/examples to `layouts`
- Tests: nested composition order, stable identity across sibling navigation, fallback
  to `manifest.app.shell` when `layouts` omitted

**Exit criteria.**

- A route with `layouts: ["root", "dashboard"]` renders `<Root><Dashboard><Page/></Dashboard></Root>`.
- Sibling routes that share an outer layout don't unmount it on navigation (assert via a
  ref-counting test that mounts twice and checks the outer layout's mount count is 1).
- `grep -rn "page.layout" src/ playground/ test/` returns nothing.
- A route with no `layouts` field renders inside `manifest.app.shell` only.

### Phase F3 — Parallel route slots

**Goal.** A route can render multiple slots in parallel. Sibling components in
declared `slots` render simultaneously, each with its own loading state and Suspense
boundary.

**Schema.**

```ts
// Route side
routeConfigSchema.extend({
  slots: z.record(z.array(componentConfigSchema)).optional(),
});

// Layout side — layouts that accept slots declare them in their config
layoutConfigSchema.extend({
  slots: z
    .array(
      z.object({
        name: z.string().min(1),
        required: z.boolean().default(false),
        fallback: componentConfigSchema.optional(), // rendered if slot is empty
      }),
    )
    .optional(),
});
```

**Slot resolution.** The renderer:

1. Collects `route.slots` (a record `slotName → ComponentConfig[]`).
2. For each declared slot in the active layout, renders the matching `route.slots[name]`
   array inside a `<Suspense>` with the layout's per-slot fallback (or `app.loading` if
   none).
3. The layout component receives slot content via a `slots: Record<string, ReactNode>`
   prop and places each via a `<Slot name="..."/>` helper that just reads from the prop.

**Built-in layouts that gain slot support in this phase.** `top-nav`, `sidebar`,
`stacked` — all three add `header`, `sidebar`, `main`, `footer` slots. `full-width`
remains slot-less (it's a single-area layout). The agent updates each layout component
to accept the `slots` prop and render the named areas. Custom layouts can declare any
slot names they want via the schema above.

**Compilation validation.** A route that declares `slots.foo` for a layout that doesn't
declare `foo` (and doesn't accept arbitrary slots) fails compilation with
`Layout "sidebar" does not declare slot "foo". Available slots: header, sidebar, main, footer.`

**Files.**

- Edit `src/ui/manifest/schema.ts` — add route `slots` and layout `slots`
- Edit `src/ui/components/layout/layout/component.tsx` and the three slot-bearing
  layouts (top-nav, sidebar, stacked) — accept `slots` prop, render named areas
- Edit `src/ui/manifest/app.tsx` (`AppShell`) — pass slot content into layouts
- Edit `src/ui/manifest/compiler.ts` — slot validation
- Tests: slot rendering, fallback when slot empty, validation rejection, two-slot layout
  with both slots populated

**Exit criteria.**

- A route with `slots: { sidebar: [...], main: [...] }` against a sidebar layout renders
  both areas simultaneously.
- An unknown slot name fails compilation with the error above.
- A required slot left empty fails compilation.
- Each slot has its own Suspense boundary (assert by suspending one and verifying the
  other still rendered).

### Phase F4 — SSR middleware as workflows

**Goal.** Today's `server/middleware.ts` becomes a manifest declaration. Middleware
steps are workflows referenced by name from `manifest.ssr.middleware`.

**Schema.**

```ts
manifestSsrConfigSchema.extend({
  middleware: z
    .array(
      z.object({
        /** Path pattern. Supports `*` and `:param` segments. Omit to match all. */
        match: z.string().optional(),
        /** Workflow name from manifest.workflows. */
        workflow: z.string(),
      }),
    )
    .optional(),
});
```

**SSR middleware context (binding type).** Workflows running in middleware position
receive a typed context object via the workflow input. The shape is:

```ts
// src/ssr/middleware-context.ts
export interface SSRMiddlewareContext {
  /** Read-only request information. */
  readonly request: {
    url: string; // full URL
    pathname: string; // pathname only
    method: string;
    headers: Readonly<Record<string, string>>;
    cookies: Readonly<Record<string, string>>;
    params: Readonly<Record<string, string>>; // matched route params
    query: Readonly<Record<string, string>>;
  };

  /** Mutable response state. Built-in actions write here. */
  response: {
    status?: number;
    headers: Record<string, string>;
    /** If set, the renderer redirects instead of rendering. Mutually exclusive with rewrite. */
    redirect?: { url: string; permanent: boolean };
    /** If set, the renderer renders this path instead of the requested one. */
    rewrite?: string;
    /** If set, short-circuits the chain — no further middleware runs, no render. */
    halt?: boolean;
  };
}
```

**How the context is exposed to workflows.** The middleware runner passes the context as
the workflow's `input.ssr` field. From-refs inside middleware workflows can read it via
`{ "from": "ssr.request.headers.authorization" }` etc. The middleware actions below
mutate `ssr.response` directly through the executor.

**New built-in actions (SSR-only).** Each takes its config from the action node and
operates on the context's `response` field. They throw if `ssr` is not present in the
workflow input (i.e., called from a non-SSR context).

```ts
// src/ui/workflows/builtins/ssr-middleware.ts
type SSRAction<C> = (
  config: C,
  ctx: { input: { ssr?: SSRMiddlewareContext } },
) => void;

export const setStatus: SSRAction<{ status: number }>;
// { "action": "set-status", "status": 401 }

export const redirect: SSRAction<{ url: string; permanent?: boolean }>;
// { "action": "redirect", "url": "/login", "permanent": false }

export const rewrite: SSRAction<{ url: string }>;
// { "action": "rewrite", "url": "/maintenance" }

export const setHeader: SSRAction<{ name: string; value: string }>;
// { "action": "set-header", "name": "X-Frame-Options", "value": "DENY" }

export const halt: SSRAction<{}>;
// { "action": "halt" }
```

Each writes into `ctx.input.ssr.response.*`. `redirect` and `rewrite` are mutually
exclusive — setting one when the other is set throws. The renderer reads `response`
after each middleware workflow returns and decides whether to short-circuit.

**Middleware execution order.**

1. For each entry in `manifest.ssr.middleware`:
   a. If `match` is set and doesn't match `request.pathname`, skip.
   b. Run the workflow with `input.ssr = context`.
   c. After return: if `response.halt`, `response.redirect`, or `response.rewrite` is
   set, stop the chain. Renderer handles the result.
2. If the chain completes without halting, render the route normally with the mutated
   response (status + headers).

**Path matching.** `match` supports glob-style `*` (single segment) and `**` (any depth),
plus `:param` segments. Implemented via the existing path-to-regexp utility used by the
router.

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `ssr.middleware`
- Create `src/ssr/middleware-context.ts` — `SSRMiddlewareContext` type
- Create `src/ssr/middleware-runner.ts` — executes the chain, reads `response`
- Create `src/ui/workflows/builtins/ssr-middleware.ts` — the five action handlers
- Edit `src/ui/workflows/builtins.ts` (or `boot-builtins.ts`) — register them under
  guarded names so they fail outside SSR
- Edit `src/ssr/manifest-renderer.ts` — call the runner before render, honor halt /
  redirect / rewrite, apply headers + status
- Tests:
  - Each action mutates the context as expected
  - Each action throws when `input.ssr` is absent (non-SSR call)
  - Match patterns: literal, `*`, `**`, `:param`
  - `redirect` and `rewrite` set in same workflow throws
  - `halt` short-circuits the chain
  - Headers from middleware appear on the rendered response

**Exit criteria.**

- A manifest with `ssr.middleware: [{ match: "/admin/**", workflow: "require-admin" }]`
  runs the workflow and can redirect non-admins.
- Middleware actions called from a non-SSR workflow throw with
  `Action "set-status" requires SSR context. It can only be called from manifest.ssr.middleware workflows.`
- A middleware that calls `set-header` adds the header to the rendered response.
- A middleware that calls `halt` prevents subsequent middleware from running and prevents
  the route from rendering.
- `redirect` + `rewrite` in the same workflow run throws a clear error.

---

## Track G — Realtime + Cache + Optimistic + Form Lifecycle

### Phase G1 — WS/SSE event → workflow mapping

**Goal.** `manifest.realtime.ws.events` and `manifest.realtime.sse.endpoints[].events`
map event names to workflows. The runtime subscribes via the existing manager and
dispatches.

**Schema.**

```ts
realtimeWsSchema.extend({
  events: z.record(z.string()).optional(), // event name → workflow name
});

realtimeSseEndpointSchema.extend({
  events: z.record(z.string()).optional(),
});
```

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/create-snapshot.tsx` (or a dedicated `src/ui/manifest/realtime-bridge.ts`)
  — subscribe to declared events and dispatch workflows
- Tests

**Exit criteria.**

- A manifest with `realtime.ws.events: { "chat.message.created": "append-to-feed" }`
  runs the workflow each time the event fires.
- Same for SSE.

### Phase G2 — Per-resource invalidation rules

**Goal.** Resources declare what other resources or query keys to invalidate when their
own data mutates. Replaces ad-hoc `queryClient.invalidateQueries(...)` calls in code.

**Schema (extension to existing `resourceConfigSchema`).**

```ts
resourceConfigSchema.extend({
  invalidates: z
    .array(
      z.union([
        z.string(), // other resource name
        z.object({ key: z.array(z.string()) }), // explicit query key
      ]),
    )
    .optional(),
});
```

The existing `invalidates: z.array(z.string())` already exists; this phase widens the
schema and wires it to the runtime so it actually invalidates after mutations.

**Files.**

- Edit `src/ui/manifest/resources.ts`
- Edit `src/ui/manifest/runtime.tsx` — invalidate after mutation completes
- Tests

**Exit criteria.**

- A resource declared as `invalidates: ["users-list"]` invalidates that resource's
  cache after a mutation through the same client.

### Phase G3 — Per-resource optimistic updates

**Goal.** Resources can declare an optimistic update strategy. The runtime applies the
update to the cached query before the request fires, snapshots the previous value, and
restores it on error.

**Schema.**

```ts
/** A reference to another resource by name, optionally narrowed by query key params. */
export const optimisticTargetSchema = z.union([
  z.string(), // resource name
  z
    .object({
      resource: z.string(),
      params: z.record(z.unknown()).optional(), // narrows to a specific cached query
    })
    .strict(),
]);

export const optimisticConfigSchema = z
  .object({
    target: optimisticTargetSchema,
    merge: z.enum(["append", "prepend", "replace", "patch", "remove"]),
    /** Required for replace/patch/remove. The field on each item that identifies it. */
    idField: z.string().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (["replace", "patch", "remove"].includes(val.merge) && !val.idField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `optimistic.idField is required when merge is "${val.merge}"`,
      });
    }
  });

resourceConfigSchema.extend({
  optimistic: optimisticConfigSchema.optional(),
});
```

**Merge semantics (binding).** Each merge mode operates on the target resource's cached
data, which is always treated as an array of items (lists) or a single object (detail).
The mutation's request body is `payload`.

| `merge`   | List target                                                | Detail target                  |
| --------- | ---------------------------------------------------------- | ------------------------------ |
| `append`  | `[...cached, payload]`                                     | error: append requires a list  |
| `prepend` | `[payload, ...cached]`                                     | error: prepend requires a list |
| `replace` | replace item where `item[idField] === payload[idField]`    | replace whole object           |
| `patch`   | `{...item, ...payload}` for matching item                  | `{...cached, ...payload}`      |
| `remove`  | filter out item where `item[idField] === payload[idField]` | set to `null`                  |

If the cached shape doesn't match (e.g. `append` against an object), the runtime logs a
dev warning, skips the optimistic update, and proceeds with the request.

**Rollback path (snapshot-then-restore, NOT refetch).** Refetch is racy and reintroduces
the loading flicker the optimistic update was meant to avoid.

```ts
async function mutateWithOptimistic(resource, payload) {
  const queryKey = resolveTargetQueryKey(resource.optimistic.target);
  const previous = queryClient.getQueryData(queryKey); // snapshot
  queryClient.setQueryData(
    queryKey,
    applyMerge(previous, payload, resource.optimistic),
  );
  try {
    const result = await sendMutation(resource, payload);
    queryClient.invalidateQueries({ queryKey }); // refetch on success
    return result;
  } catch (err) {
    queryClient.setQueryData(queryKey, previous); // restore on error
    throw err;
  }
}
```

The snapshot is captured **before** the optimistic write so concurrent mutations to the
same target each restore to the value they observed. Concurrent mutations are serialized
per target queryKey via a per-key `Promise` chain in the resource runtime.

**Files.**

- Edit `src/ui/manifest/resources.ts` — add `optimisticConfigSchema`,
  `optimisticTargetSchema`
- Create `src/ui/manifest/optimistic.ts` — `applyMerge`, `resolveTargetQueryKey`,
  per-key serialization
- Edit `src/ui/manifest/runtime.tsx` — wire `mutateWithOptimistic` into the mutation
  path; add unit tests for each merge mode and the rollback behavior
- Tests: each merge mode (5), rollback on error, concurrent mutations serialize, list vs
  detail shape mismatch warning, missing idField rejection at compile time

**Exit criteria.**

- An "add comment" mutation with `optimistic: { target: "comments", merge: "append" }`
  shows the new comment immediately. On HTTP error, the comment is removed (cache returns
  to the snapshotted value, not a refetched one).
- A "delete user" mutation with `merge: "remove", idField: "id"` removes the user from
  the list optimistically and restores it on error.
- Each merge mode has at least one passing test asserting both the optimistic state and
  the rollback state.
- Two concurrent mutations against the same target produce a deterministic final state
  (the second mutation's snapshot is the first mutation's optimistic write).

### Phase G4 — Form submission lifecycle workflows

**Goal.** Forms declare `before-submit`, `after-submit`, `on-error` workflows. The
auto-form component runs them at the right lifecycle moments.

**Schema (extension to auto-form schema).**

```ts
{
  on: z.object({
    beforeSubmit: z.string().optional(),
    afterSubmit:  z.string().optional(),
    error:        z.string().optional(),
  }).strict().optional(),
}
```

**Files.**

- Edit `src/ui/components/forms/auto-form/schema.ts`
- Edit `src/ui/components/forms/auto-form/component.tsx` — dispatch lifecycle workflows
- Tests

**Exit criteria.**

- A form with `on.beforeSubmit: "validate-extra"` runs the workflow before submit and
  can cancel submission.
- A form with `on.error: "report-error"` runs the workflow when submit fails.

---

## Track H — App-Level Services

### Phase H1 — `manifest.toast`

**Goal.** Move toast defaults (position, duration, theme, per-type variants) to the
manifest.

**Schema.**

```ts
export const toastConfigSchema = z
  .object({
    position: z
      .enum([
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ])
      .default("bottom-right"),
    duration: z.number().int().nonnegative().default(4000),
    variants: z
      .record(
        z.object({
          icon: z.string().optional(),
          color: z.string().optional(),
          duration: z.number().int().nonnegative().optional(),
        }),
      )
      .optional(),
  })
  .strict();
```

Added to top-level manifest as `toast: toastConfigSchema.optional()`.

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/ui/components/overlay/toast/component.tsx` — read from manifest
- Tests

**Exit criteria.**

- A manifest with `toast.position: "top-right"` shows toasts top-right.
- The `toast` action picks up the manifest's defaults.

### Phase H2 — `manifest.analytics` + `track` action

**Goal.** Declare analytics providers in the manifest. Add `track` to the action
vocabulary.

**Schema.**

```ts
export const analyticsProviderSchema = z
  .object({
    type: z.enum(["ga4", "posthog", "plausible", "custom"]),
    apiKey: stringOrEnvRef.optional(),
    config: z.record(z.unknown()).optional(),
  })
  .strict();

export const analyticsConfigSchema = z
  .object({
    providers: z.record(analyticsProviderSchema),
  })
  .strict();
```

**`track` action.**

```jsonc
{
  "action": "track",
  "event": "user.signup",
  "props": { "plan": { "from": "form.plan" } },
}
```

Dispatches to all configured providers.

**Provider interface.** Each provider implements:

```ts
export interface AnalyticsProvider {
  init(config: {
    apiKey?: string;
    config?: Record<string, unknown>;
  }): void | Promise<void>;
  track(event: string, props?: Record<string, unknown>): void;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  page?(name: string, props?: Record<string, unknown>): void;
  reset?(): void; // called on logout
}
```

**Built-in providers.** `ga4`, `posthog`, `plausible` ship with the framework. Each is a
small wrapper over the provider's web SDK, lazy-loaded the first time `init` runs.

**Custom provider registration (escape hatch).** Same factory pattern as `registerClient`
and `registerWorkflowAction`:

```ts
// src/ui/analytics/registry.ts
export type AnalyticsProviderFactory = () => AnalyticsProvider;

export function registerAnalyticsProvider(
  name: string,
  factory: AnalyticsProviderFactory,
): void;
export function getRegisteredAnalyticsProvider(
  name: string,
): AnalyticsProviderFactory | undefined;
```

A manifest references custom providers via `type: "custom"` plus a `name` field:

```jsonc
{
  "analytics": {
    "providers": {
      "internal": {
        "type": "custom",
        "name": "my-tracker",
        "config": { "endpoint": "/track" },
      },
    },
  },
}
```

The compiler validates that any `type: "custom"` provider has a registered factory under
the given `name`. `registerAnalyticsProvider` is exported from `@lastshotlabs/snapshot/ui`.

**Files.**

- Edit `src/ui/manifest/schema.ts` — `analyticsConfigSchema` (extend with `name` for
  custom)
- Create `src/ui/analytics/types.ts` — `AnalyticsProvider`, `AnalyticsProviderFactory`
- Create `src/ui/analytics/registry.ts` — `registerAnalyticsProvider`,
  `getRegisteredAnalyticsProvider`
- Create `src/ui/analytics/built-ins/{ga4,posthog,plausible}.ts` — built-in providers
- Create `src/ui/analytics/dispatch.ts` — fan-out to all configured providers
- Edit `src/ui/actions/handlers/track.ts` — call `dispatch.track(event, props)`
- Edit `src/ui/actions/types.ts` — add `track` to `ActionConfig` union
- Edit `src/ui.ts` — export `registerAnalyticsProvider`, `AnalyticsProvider` type
- Tests: built-ins lazy-load on first event, fan-out fires all providers, custom provider
  registration, undeclared custom name fails compilation

**Exit criteria.**

- A manifest with one provider configured fires the right event when `track` runs.
- Multiple providers all receive the event.
- A custom provider registered via `registerAnalyticsProvider("my-tracker", () => impl)`
  is usable from manifest with `type: "custom", name: "my-tracker"`.
- A manifest referencing `name: "unknown"` fails compilation with
  `Analytics provider "unknown" is not registered. Call registerAnalyticsProvider("unknown", ...) before createSnapshot.`

### Phase H3 — `manifest.push`

**Goal.** VAPID public key and service worker path declared in the manifest. The push
hooks read from there.

**Schema.**

```ts
export const pushConfigSchema = z
  .object({
    vapidPublicKey: stringOrEnvRef,
    serviceWorkerPath: z.string().default("/sw.js"),
    applicationServerKey: stringOrEnvRef.optional(),
  })
  .strict();
```

**Files.**

- Edit `src/ui/manifest/schema.ts`
- Edit `src/push/hooks.ts` — read from manifest
- Tests

**Exit criteria.**

- `usePushNotifications` reads VAPID key from the manifest, no code-side config needed.

### Phase H4 — Token editor persistence

**Goal.** `useTokenEditor()`'s persistence target is declared in the manifest.

**Schema.**

```ts
themeConfigSchema.extend({
  editor: z
    .object({
      persist: z
        .union([
          z.literal("none"),
          z.literal("localStorage"),
          z.literal("sessionStorage"),
          z.object({ resource: z.string() }).strict(), // persist to a resource (e.g. user prefs)
        ])
        .default("localStorage"),
    })
    .strict()
    .optional(),
});
```

**Files.**

- Edit `src/ui/tokens/schema.ts`
- Edit `src/ui/tokens/editor.ts`
- Tests

**Exit criteria.**

- Manifest sets persist target; the editor uses it.
- `{ resource: "user-prefs" }` mode persists via the named resource.

### Phase H5 — OAuth/MFA/WebAuthn full config

**Goal.** Per-provider OAuth config (client id, scopes, callback path), MFA method
config (issuer, period), and WebAuthn config (rp id, rp name, attestation) all declared
in the manifest.

**Disambiguation: existing `providers` vs new `providers`.** The current
`authScreenConfigSchema` (`src/ui/manifest/schema.ts:323-367`) already has a `providers`
field that lives **per auth screen** (e.g., login screen lists which provider buttons to
show). That field is **kept** but its shape changes: it becomes a list of provider names
(string refs), not full provider configs. The full per-provider config (clientId, scopes,
callbackPath, etc.) moves up one level to a new `auth.providers` map keyed by provider
name. This is the standard "declare once, reference by name" pattern.

```jsonc
{
  "auth": {
    // NEW — declare once at the auth level
    "providers": {
      "google": {
        "type": "google",
        "clientId": { "env": "GOOGLE_ID" },
        "scopes": ["openid", "email"],
        "callbackPath": "/auth/callback/google",
      },
      "github": { "type": "github", "clientId": { "env": "GH_ID" } },
    },
    "screens": {
      "login": {
        // CHANGED — was full provider configs, now string refs into auth.providers
        "providers": ["google", "github"],
      },
    },
  },
}
```

**Schema.**

```ts
// NEW — declared at the auth level, not per-screen
export const authProviderSchema = z
  .object({
    type: z.enum([
      "google",
      "github",
      "microsoft",
      "apple",
      "facebook",
      "discord",
      "custom",
    ]),
    clientId: stringOrEnvRef.optional(),
    clientSecret: stringOrEnvRef.optional(), // server-side only; ignored in browser bundles
    scopes: z.array(z.string()).optional(),
    callbackPath: z.string().optional(),
    label: z.string().optional(),
    description: z.string().optional(),
    autoRedirect: z.boolean().optional(),
    /** For type: "custom" — name of a registered custom OAuth provider. */
    name: z.string().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.type === "custom" && !val.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom OAuth providers require a name field",
      });
    }
  });

// EXTENSION on existing top-level authConfigSchema (NOT authScreenConfigSchema)
authConfigSchema.extend({
  providers: z.record(authProviderSchema).optional(),
  mfa: z
    .object({
      issuer: z.string().optional(),
      period: z.number().int().positive().default(30),
      methods: z.array(z.enum(["totp", "email", "sms", "webauthn"])).optional(),
    })
    .strict()
    .optional(),
  webauthn: z
    .object({
      rpId: z.string().optional(),
      rpName: z.string().optional(),
      attestation: z.enum(["none", "indirect", "direct"]).default("none"),
    })
    .strict()
    .optional(),
});

// CHANGE on authScreenConfigSchema — providers becomes a list of name refs
authScreenConfigSchema.extend({
  providers: z.array(z.string()).optional(), // refs into auth.providers
});
```

**Compilation validation.** Every entry in a screen's `providers: [...]` must reference a
key in `auth.providers`. Error: `Auth screen "login" references provider "google" but auth.providers.google is not declared.`

**Migration.** The current shape (per-screen full configs) is deleted. The agent must:

1. `grep -rn '"screens"' src/ playground/ test/` and find every auth manifest fixture.
2. Hoist any per-screen provider configs into a top-level `auth.providers` map, keyed by
   name. Replace the per-screen list with the names.
3. Update tests accordingly.

**Files.**

- Edit `src/ui/manifest/schema.ts` — add `auth.providers`, `auth.mfa`, `auth.webauthn`,
  change `auth.screens.*.providers` to `z.array(z.string())`
- Edit `src/ui/manifest/compiler.ts` — validate provider name refs
- Edit `src/auth/oauth-hooks.ts` — read from `manifest.auth.providers`
- Edit `src/auth/mfa-hooks.ts` — read from `manifest.auth.mfa`
- Edit `src/auth/webauthn-hooks.ts` — read from `manifest.auth.webauthn`
- Edit `src/ui/manifest/auth.tsx` — when rendering screen provider buttons, look up the
  full config by name
- Migrate every auth fixture in tests/playground

**Exit criteria.**

- A manifest with `auth.providers.google: { type: "google", clientId: { env: "GOOGLE_ID" } }`
  and `auth.screens.login.providers: ["google"]` produces a working Google login button on
  the login screen.
- MFA TOTP setup uses the manifest's `auth.mfa.issuer`.
- WebAuthn registration uses the manifest's `auth.webauthn.rpId` and `rpName`.
- A manifest screen referencing an undeclared provider name fails compilation with the
  error above.
- `grep -rn 'screens.*providers.*type' src/ playground/ test/` returns nothing (no
  per-screen full configs left).

---

## Parallelization & Sequencing

### Track Overview

```
A — Hardcoded removal       (foundation)         A1, A2, A3, A4, A5
        │
        ├──> B — Config collapse                 B1, B2, B3, B4, B5, B6
        │       │
        │       └──> H — App services            H1, H2, H3, H4, H5
        │
        ├──> C — Declarative registries          C1, C2, C3, C4
        │
        ├──> D — Policies + i18n                 D1, D2, D3, D4
        │
        ├──> E — Multi-app                       E1, E2, E3
        │
        ├──> F — Manifest SSR/routing            F1, F2, F3, F4
        │
        └──> G — Realtime + cache + optimistic   G1, G2, G3, G4
```

### Why Tracks Are Independent

| Track | Owns (file paths)                                                                                                                                                                                                            |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | `auth.tsx`, `app.tsx` (lifecycle/layout sections), `component-registry.tsx`, `structural.tsx`, `workflows/registry.ts`, `tokens/flavors.ts`, new `boot-builtins.ts`, new `auth-routes.ts`, `components/feedback/*`           |
| **B** | `types.ts`, `create-snapshot.tsx`, `schema.ts` (auth.session, app.cache, auth.contract, auth.on, realtime.\*), new `env.ts`                                                                                                  |
| **C** | `schema.ts` (components.custom, workflows.actions.custom, theme.flavors), `component-registry.tsx`, `workflows/registry.ts`, `tokens/flavors.ts` (additions only)                                                            |
| **D** | `schema.ts` (policies, i18n), new `policies/`, new `i18n/`                                                                                                                                                                   |
| **E** | `schema.ts` (clients, subApps), `runtime.tsx`, `app.tsx` (router section), `compiler.ts` (sub-manifest recursion)                                                                                                            |
| **F** | `schema.ts` (routes.layouts, routes.slots, ssr.middleware), `ssr/manifest-renderer.ts`, `ssr/render.ts`, `app.tsx` (AppShell composition)                                                                                    |
| **G** | `schema.ts` (realtime.events, resources.invalidates extension, resources.optimistic), `resources.ts`, `runtime.tsx`, new `realtime-bridge.ts`, `auto-form/component.tsx`                                                     |
| **H** | `schema.ts` (toast, analytics, push, theme.editor.persist, auth.providers, auth.mfa, auth.webauthn), `analytics/`, `push/hooks.ts`, `tokens/editor.ts`, `auth/oauth-hooks.ts`, `auth/mfa-hooks.ts`, `auth/webauthn-hooks.ts` |

**Schema overlap.** Multiple tracks add fields to `schema.ts`. Each track owns its **own
fields** and adds them in its own commit. Cross-track conflicts are limited to
neighboring lines and resolve cleanly. The agent rebases against `main` after each track
completes.

**Cross-track dependencies.**

- C1 = A3 (same phase, satisfied once).
- C4 = A4 (same phase, satisfied once).
- B6 depends on B1–B5 completing first.
- **Tracks C–H block on B6.** C–H may begin schema and test work in parallel branches,
  but they cannot **merge** runtime wiring until B6 has landed on `main`. There must be
  no commit anywhere in which a feature reads from both `SnapshotConfig` and the
  manifest. Single source of truth at every commit.
- F1 depends on A5 (the fallback components A5 creates are also used by SSR).
- E2 depends on E1 (sub-apps need clients).
- D2 depends on D1 (component visibility uses the policy resolver).
- D4 depends on D3 (detection needs the schema).

### Branch Strategy

- One branch per track: `track/a-hardcoded-removal`, `track/b-config-collapse`, etc.
- Each phase is a commit on the track branch with title `[track-letter]N: <phase title>`.
- Push branches; do not merge until the track is complete and the agent has run the
  exit criteria for every phase.
- After Track A merges, all other tracks rebase against `main` before continuing.
- Track B merges next (it's load-bearing for H, and small in surface area beyond
  schema).
- Tracks C–H can land in any order after B6.

### Per-Phase Definition of Done

For every phase:

1. `bun run typecheck` — zero errors
2. `bun run format:check` — clean
3. `bun test` — full vitest suite green (no `.skip`, no `.only`)
4. `bun run build` — tsup + oclif manifest succeed
5. JSDoc updated on every exported symbol the phase added or changed
6. `docs/` updated for every user-visible behavior change (token names, manifest fields,
   action vocabulary)
7. Phase-specific exit criteria from this spec all pass

### Per-Track Definition of Done

In addition to per-phase checks:

1. `grep` for the deleted symbols (e.g. `inferAuthScreenPath`) returns nothing.
2. The `vision.md` acceptance test passes for the new fields: write a test manifest
   exercising every new field and confirm it boots, validates, and renders.
3. Component and integration tests added for every new field at the component, schema,
   and runtime level.
4. No `as unknown as` casts introduced. No `any`. Discriminated unions narrow correctly.

### Agent Execution Checklist

For each track, the executing agent:

1. Read `CLAUDE.md` and `docs/engineering-rules.md` end-to-end.
2. Read this spec end-to-end.
3. Read `docs/vision.md` (the acceptance test is the rule).
4. Pick the track (one track per agent run).
5. For each phase in order:
   - Read the phase section of this spec
   - Read the listed files in the codebase
   - Implement the change
   - Add/update tests
   - Update JSDoc on touched exports
   - Update `docs/` pages affected by the change
   - Run the four DoD commands
   - Verify exit criteria
   - Commit with title `[track]N: <title>`
6. After the last phase: rebase against `main`, run all DoD checks one more time, push
   the branch.
7. Open a PR titled `Track <letter> — <name>` and link this spec.

---

## Documentation Impact

This spec touches almost every public surface. The implementing agent for each track
must update the following docs as part of the same commits:

| Track | Docs to update                                                                                                                           |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | `customization.md` (escape hatch story), `components.md` (custom component declaration)                                                  |
| **B** | `getting-started.md` (the four-line entry point), new `docs/manifest/bootstrap.md`, `docs/manifest/auth.md`, `docs/manifest/realtime.md` |
| **C** | `customization.md` (custom action declaration), `tokens.md` (manifest-declared flavors)                                                  |
| **D** | New `docs/manifest/policies.md`, new `docs/manifest/i18n.md`                                                                             |
| **E** | New `docs/manifest/multi-app.md`                                                                                                         |
| **F** | `ssr/` pages — manifest middleware, layouts, parallel routes, conventions                                                                |
| **G** | `data-binding.md` (event-to-workflow), new `docs/manifest/cache.md`, `actions.md`                                                        |
| **H** | New `docs/manifest/analytics.md`, `actions.md` (`track`), `docs/manifest/auth.md` (providers, mfa, webauthn), `docs/manifest/push.md`    |

JSDoc must be updated on:

- Every new schema export
- Every new resolver function
- `SnapshotConfig` (in B6 — the four-field public type with `@internal` tags)
- `ManifestApp` (in B6 — no longer takes `snapshotConfig`)
- Every new action handler

---

## Resolved Decisions

The following ambiguities were resolved with the developer on 2026-04-10. Implementing
agents should treat these as binding.

1. **B6 sequencing — tracks C–H block on B6.** No dual-source code paths. C–H may begin
   schema/test work in parallel branches but cannot merge runtime wiring until B6 has
   landed and `SnapshotConfig` is reduced to bootstrap-only. The single-source-of-truth
   invariant is non-negotiable while this spec is in flight.

2. **Sub-app SSR — out of scope.** E2 mounts sub-manifests at runtime only. Server-side
   rendering of sub-app routes is deferred to a follow-up spec. The sub-app entry point
   in this spec must clearly mark sub-app routes as client-only and degrade gracefully on
   the server (render parent shell + suspense fallback).

3. **Sub-app `clients` resolution — inherit, child wins on collision.** A sub-manifest
   sees the parent `clients` block by default. If the sub-manifest declares a client with
   the same name as a parent client, the child definition replaces the parent for that
   sub-app's resources only. Parallel to how `inherit.theme` already works. The compiler
   must validate child client definitions against the same schema as root clients.

4. **Custom client registration — factory pattern.** The code-side API is
   `registerClient(name, factory)` where `factory(apiUrl, bootstrap)` returns an
   `ApiClient`-shaped object. This is parallel to `registerComponent` and
   `registerWorkflowAction`. The factory closes over per-instance state, matching the
   factory-closure SDK pattern. The manifest references custom clients by name in
   `clients[].custom: "my-client-name"`.

5. **Test migration in B6.** B6 is responsible for updating every test that constructs
   `SnapshotConfig` with dropped fields. The B6 agent must `grep` for `SnapshotConfig`
   and `createSnapshot(` across `src/**/__tests__/**`, update each affected test in the
   same commit, and confirm `bun test` is fully green before B6 is marked done. Estimated
   ~60 test files. Per-track migration is **not** allowed — B6 owns the cleanup so the
   diff is reviewable as one unit.
