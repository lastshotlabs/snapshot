# Coding Standards

1. **No hacky fixes** — Follow framework patterns. Never modify the public API surface to work around issues in consumer apps. Investigate how existing modules solve the problem and follow that pattern.

2. **No backwards compatibility shims** — Don't add re-export barrels or backwards-compat shims. Delete old locations entirely. John is the only consumer and can fix his apps.

3. **Repository/factory pattern** — No mutable module state, no singletons, closure-owned state. No module-level `let` + lazy init patterns. Use factory functions that return instances with closure-owned state.

4. **Coding style** — Write complete production-grade code, not minimal outlines.

5. **TypeScript casts** — `as unknown as T` only at opaque optional-dep boundaries, never to hide missing values. No `any`. No hard casts when not necessary.

6. **No import/re-export funnels** — No barrel files funneling internals through a single index.

7. **Minimal public API** — No internals leaking. Public API should be minimal. Testing utilities, tooling, etc. go on their own subpath (e.g. `@lastshotlabs/snapshot/testing`), not the main export.

8. **Separation of concerns** — Files, directories, and code follow standard splitting structure. Keep uniform across the app.

9. **Types** — Shared types should be lifted and organized, never redefined. Extend types when it makes sense instead of redefining. Naming conventions must be 100% uniform.

# Project Context

Snapshot is the React frontend framework for bunshot-powered backends. It is part of a larger platform vision: a config-driven full-stack app platform where users describe what they want and get a running application.

The bunshot backend framework has a config generation layer (manifest schema, handler registry, constraint engine, audit suite) in `src/framework/config/generation/`. Snapshot's frontend config generation mirrors those same patterns adapted for frontend concerns.

# Architecture

## Plugin System

- `createSnapshot(coreConfig, ...plugins)` — core config is minimal (apiUrl, auth mode, query options). Everything else is a plugin.
- Each plugin has: `name`, optional `dependencies`, `setup(ctx)` (phase 1: infra), `createHooks(ctx)` (phase 2: hooks), `teardown()`.
- Cross-plugin communication via callback arrays (`ctx.callbacks.onLoginSuccess`, `ctx.callbacks.onLogoutSuccess`). No direct references between plugins.
- Shared state via `ctx.shared` Map for plugin-to-plugin data handoff (e.g., auth stores MFA atom, SSE stores registry).
- Return type is inferred from registered plugins via `SnapshotInstance<TPlugins>`.

## Plugins

- `createAuthPlugin(config)` — auth, MFA, OAuth, WebAuthn, account hooks, routing guards, error formatting
- `createWsPlugin<TWSEvents>(config)` — WebSocket manager + hooks
- `createSsePlugin(config)` — SSE managers per endpoint + hooks
- `createCommunityPlugin(config?)` — community hooks + optional SSE notifications
- `createWebhookPlugin()` — webhook hooks
- `createPushPlugin(config?)` — push notification hook

## Token System

- 9 token categories: colors, spacing, radius, typography, shadows, breakpoints, zIndex, transitions, interactions
- 3-level composition: full presets → category presets → value overrides
- Extensible registries: `registerCategoryPreset()`, `registerFullPreset()`
- CSS generation: `resolveTokensToCSS()` produces `:root` + `.dark` custom properties
- React provider: `<TokenProvider tokens={...}>`

## Component Library

- Hierarchical component registry: `createComponentRegistry()`, `.extend()`, `.resolve(name)`
- Every component has: `.tsx` implementation + `.schema.ts` Zod config schema
- Data binding: `useDataSource(api, config)` fetches from endpoint refs, resolves `{ from: "id" }` params
- Inter-component communication: page context via jotai atoms, `usePublishValue(id, value)`, `usePageValue(id)`
- Action system: 9-action vocabulary (navigate, api, open-modal, refresh, etc.), `executeAction(action, ctx)`
- ComponentRenderer: walks config tree, resolves from registry, renders React tree

## Manifest & Generation

- Frontend manifest schema: Zod-validated, covers theme, auth screens, nav, pages, features, api, ws, sse, environments
- Constraint engine: 8 pluggable rules (data-source-required, nav-path-exists, component-id-unique, etc.)
- Audit suite: 7 rules across accessibility, UX, performance, security, consistency
- Handler registry: categories (component, layout, action, validator, formatter, guard), hierarchical composition
- Generation pipeline: validate → constrain → audit → generate (pages, routes, theme CSS)

## Build & Exports

- **tsup** with entry points: library, tokens, components, manifest, generation, CLI, Vite plugin
- **Peer dependencies** — React, TanStack Query, TanStack Router, jotai, @unhead/react, zod. Optional: vite.
- **Tests** — vitest, node environment.

# Subpath Exports

- `@lastshotlabs/snapshot` — createSnapshot, plugin factories, auth types, community/webhook types
- `@lastshotlabs/snapshot/tokens` — token schema, presets, CSS generation, provider, utilities
- `@lastshotlabs/snapshot/components` — registry, data binding, page context, actions, renderer
- `@lastshotlabs/snapshot/manifest` — manifest schema, constraints, audits, handler registry
- `@lastshotlabs/snapshot/generation` — generateApp pipeline, page/route/theme generators
- `@lastshotlabs/snapshot/vite` — Vite plugin for schema sync
