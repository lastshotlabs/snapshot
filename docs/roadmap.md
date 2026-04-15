# Roadmap

> **Last updated:** 2026-04-14 - shared frontend contract execution status updated
>
> Modeled on [`bunshot/docs/roadmap.md`](../../bunshot/docs/roadmap.md). Specs progress
> from `docs/specs/<name>.md` (active) -> `docs/specs/completed/<name>.md` (done) and
> their entries move from **Now** -> **Completed** here.

## Completed

Specs moved to [`docs/specs/completed/`](./specs/completed/).

**Config-driven UI foundation (`config-driven-ui-foundation.md`) - Done 2026-02:**

- Phase 1 - Design token system (`src/ui/tokens/`): Zod schema, `resolveTokens()`,
  `useTokenEditor()`, built-in flavors, dark/light, breakpoint-aware values
- Phase 2 - Page context + `from` ref system: per-route Jotai atom registry, app-level
  registry, `resolveFromRef()`, `useResolveFrom`, `useSubscribe`, `usePublish`
- Phase 3 - Action executor: dispatch for the fixed action vocabulary (navigate, api,
  open-modal, close-modal, refresh, set-value, download, confirm, toast)
- Phase 4 - Manifest schema, page renderer, structural components (row, heading, button,
  select)
- Phase 5 - Layout + Nav components
- Phase 6-9 - StatCard, DataTable, AutoForm, DetailCard
- Phase 10-11 - Modal, Drawer, Tabs (with shared overlay manager)
- Phase 12 - CLI integration: `snapshot init` scaffolds manifest mode, `snapshot sync`
  generates typed clients

**Config-driven platform completion (`config-driven-platform.md`) - Done 2026-03:**

- 30 additional components - communication suite (chat-window, message-thread,
  notification-feed, comment-section, reaction-bar), embeds, missing data primitives,
  workflow primitives (kanban, calendar, approval-flow, audit-log, status-tracker),
  account primitives, content primitives
- Token system polish - global token schemas, shadow tokens, color/component mapping
- Playground - dev-time visual verification environment with all components, fixture
  data, all states (loading/error/empty/populated), token responsiveness

**Phase 13 - next sprint (`phase-13-next.md`) - Done 2026-03:**

- Feed, Chart, Wizard components
- Page presets - `crudPage`, `dashboardPage`, `settingsPage`
- Drag-and-drop system with `@dnd-kit` (kanban, sortable lists)

**Entity page renderer (`entity-page-renderer.md`) - Done 2026-04-09:**

- Entity page mappers - dashboard, detail, form, list, field mappings
- `bunshot sync` generates page configs from backend entity schemas
- Auto-derives table columns / form fields / detail views from OpenAPI response shapes

**SSR/RSC UI compatibility (`ssr-rsc-ui-compatibility.md`) - Done 2026-04-09:**

- Every UI component declares execution context (`'use client'` or server-component
  comment)
- Browser APIs moved out of render bodies into `useEffect`
- `ComponentWrapper` and context providers marked client
- `renderToStaticMarkup` SSR safety tests across the component library
- RSC manifest integration in the manifest renderer

**Manifest auth runtime - Done 2026-04 (no separate spec, multiple commits):**

- `ManifestAuthScreen` component renders all auth screens (login, register, forgot,
  reset, verify-email, mfa) from manifest config
- `manifest.auth` schema with screens, providers, passkey, branding, redirects, fields,
  links, screen options
- Passkey authentication
- User state bridge - `global.user` and `global.auth` exposed via app context
- Workflow-driven `enter`/`leave` lifecycle for routes

**Resource layer + workflow execution - Done 2026-04 (multiple commits):**

- Manifest `resources` block - declarative data sources with cache, polling,
  invalidation, dependsOn
- Workflow nodes: `try/catch`, `capture`, `assign`, `retry` with backoff, conditional
- Resource preload, refreshOnEnter, invalidateOnLeave on routes
- Modal `result` target wiring - modal results flow back into workflows

**Routing primitives + SSR Track E - Done 2026-04 (commit 430f071 + others):**

- Nested layouts (`layout.ts`)
- Parallel routes (`@slot` directories)
- Intercepting routes
- Conventions: `loading.ts` -> Suspense, `error.ts` -> ErrorBoundary, `not-found.ts` -> 404
- SSR middleware (`server/middleware.ts`) for redirects, rewrites, headers
- DX polish - dev error overlay, `defineRoute()`, bundle analyzer

**Prefetch + image - Done 2026-04 (multiple commits):**

- `usePrefetchRoute` hook
- `<PrefetchLink>` component (hover/viewport prefetch)
- `<SnapshotImage>` - sharp, responsive srcset, blur placeholder

**Manifest-only completion (`manifest-only.md`) - Done 2026-04-10:**

The drive to 100% manifest capability. 35 phases across 8 file-disjoint tracks, all on
`main`. The acceptance test - *"can a user enable this feature by editing
`snapshot.manifest.json` with no TypeScript?"* - now passes for every feature in the
spec.

| Track | Shipped |
|---|---|
| **A** | Hardcoded behavior removed - auth path inference, layout fallback, `"custom"` magic, side-effect registration, hardcoded loading/error/404/offline UI - all gone. Boot-time `bootBuiltins()` replaces module side effects. |
| **B** | `SnapshotConfig` collapsed to four fields (`apiUrl`, `env`, `bearerToken`, `manifest`). `{ "env": "..." }` resolver. `manifest.auth.{session,contract,on}`, `manifest.app.cache`, `manifest.realtime.{ws,sse}`. |
| **C** | Declarative custom-action declarations. Manifest-declarable flavors with `extends` + shared dark-variant derivation. |
| **D** | `policies` schema + resolver + route guard + component `visible` integration (and `guard.condition` deleted). `i18n` schema + `{ "t": "..." }` ref + locale detection + persistence. |
| **E** | `clients` block with per-resource selection + `registerClient` factory. `subApps` block with sub-manifest mounting, theme/i18n/policy inheritance, child-wins client collision, client-only SSR fallback. |
| **F** | SSR convention routes, nested layouts (replacing single `page.layout`), parallel route slots on built-in layouts, SSR middleware as workflows with `SSRMiddlewareContext`. |
| **G** | WS/SSE event -> workflow mapping, per-resource invalidation rules, per-resource optimistic updates with snapshot-then-restore rollback, form submission lifecycle workflows. |
| **H** | `manifest.toast`, `manifest.analytics` + `track` action + `registerAnalyticsProvider`, `manifest.push`, `manifest.theme.editor.persist`, and full OAuth/MFA/WebAuthn config (with top-level `auth.providers` map and screen-level name refs). |

Spec at [`docs/specs/completed/manifest-only.md`](./specs/completed/manifest-only.md).

## Now - Active Specs

**Shared frontend contract + Pocketshot alignment (`shared-frontend-core-and-pocketshot-alignment.md`) - Active 2026-04-14:**

- Extract the cross-platform frontend contract into a dedicated shared package instead of letting it remain web-owned inside Snapshot.
- Rebase Snapshot and Pocketshot as peer runtimes over that shared contract package.
- Finish Pocketshot's declarative runtime against the same manifest, token, action, resource, workflow, state, policy, i18n, and component metadata contract.
- This is replacement work: both packages are pre-production and incorrect contracts should be replaced outright.

**Documentation infrastructure (`documentation-infrastructure.md`) - Active 2026-04-13:**

- Phases 1-4 are effectively landed: governance, the public docs app, source-backed
  reference generation, and the core guide layer all exist and `bun run docs:ci` is green
  on `main`.
- Phase 5 is still active: the playground is acting as the canonical example system, but
  the spec's dedicated `examples/` registry and runnable example apps have not landed yet.
- Phase 6 is still active: repo-local docs automation exists, but there is no checked-in
  CI workflow in this repo that makes `docs:ci` a required gate.
- Phase 7 is still active: `README.md` is still carrying too much public-doc load and
  still needs reduction toward a short front door into `apps/docs`.

## Later - Needs Its Own Spec

These are real future work, not ideas. Each gets a spec when it reaches the top of the
queue.

**Multi-tenant / multi-backend deepening:**

- Sub-manifest hot-reload (load sub-manifests on demand without full app reload)
- Per-tenant token overrides served from a backend resource

**Sync evolution:**

- **Selective hook syncing** - manifest of available hooks, consumer picks which to
  generate. Tree-shaking for API clients. Don't generate hooks for endpoints the manifest
  doesn't reference.
- **Multiple hook/client sets** - first-class `bunshot sync` support for emitting more
  than one client from a single project (multi-backend, multi-tenant). Track E of the
  manifest-only spec covers the runtime side; this is the codegen side.
- **Offline docs** - bundle the OpenAPI spec + custom docs as a static asset. Snapshot
  reads from `/openapi.json` or a local file. Partially supported via Vite plugin's
  `file` option today.

**Visual + DX:**

- **Visual page builder** - runtime manifest editor, persists to backend or filesystem,
  built on `<PageRenderer>` and `useTokenEditor()`.
- **Code escape hatch v2 (Monaco)** - embedded Monaco editor for Bunshot Cloud users to
  write custom components and custom workflow actions in the browser dashboard with full
  IntelliSense from generated types. Generated/custom code persists into the user's
  project.
- **Manifest LSP** - language server for `snapshot.manifest.json` providing completion,
  hover, go-to-definition, and validation in any editor.

**Speculative:**

- **State-as-config / FSM** - declarative state machines in the manifest. The brainstorm
  tied this to the "base + flavors" idea: apply config-driven variants to state
  transitions. Worth a spec when the use case becomes concrete.

## Eventually - Wishlist

- Bunshot Cloud-hosted manifest editor with live preview
- AI manifest generation from natural language (paired with bunshot's MCP server)
- Cross-manifest type inference - frontend manifest validates against backend manifest
  at sync time, not just at runtime
- Native mobile shell that consumes the same manifest (React Native or Capacitor)
- Plugin marketplace - third-party flavors, components, workflow actions distributed via
  npm with auto-registration
