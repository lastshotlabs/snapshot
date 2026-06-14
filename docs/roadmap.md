# Roadmap

> **Last updated:** 2026-05-10 - code-first authoring reset.
>
> This page tracks the active product direction. Historical specs remain under
> `docs/specs/completed/` for project archaeology; they are not current authoring
> guidance.

## Completed

**Code-first runtime**

- `createSnapshot({ apiUrl })` is the public runtime entry point.
- Apps configure auth, cache, realtime, navigation, and API behavior in
  TypeScript.
- Runtime hooks return normal TanStack Query and React hook surfaces that app
  code composes directly.

**Standalone UI**

- Public UI components live under `@lastshotlabs/snapshot/ui` and focused UI
  subpaths.
- Components accept plain React props, callbacks, class names, styles, and slot
  overrides.
- Tokens and flavors are helpers for app-owned styling, not an alternate app
  authoring layer.

**OpenAPI sync**

- `snapshot sync` generates typed API clients and React Query hooks from a
  Bunshot/OpenAPI schema.
- `snapshotSync()` keeps generated clients current during Vite startup and
  builds.

**SSR and Vite helpers**

- `snapshotSsr()` supports Vite client/server builds, asset metadata, route
  prefetch metadata, RSC metadata, PPR metadata, and static route metadata.
- SSR exports live under `@lastshotlabs/snapshot/ssr`.

**Authoring cleanup**

- The package surface now centers on TypeScript runtime config, React
  composition, generated hooks, standalone UI, and SSR helpers.
- Scaffolded apps start from code and route files instead of a separate
  file-authored layer.
- Public docs and internal agent guidance now use "app authors" language.

## Now

**Authoring docs**

- Keep README, `docs/`, and the docs app aligned around the same first path:
  install, create the runtime, wrap the provider, build screens, sync API hooks,
  import standalone UI, and add SSR helpers only when needed.
- Generated reference docs should support that path, not replace it.
- Examples should be ordinary React apps with visible source for runtime setup,
  route guards, auth flows, generated hooks, and UI composition.

**Generated client ergonomics**

- Keep `snapshot sync` output small, typed, and readable.
- Preserve the boundary between package code and generated project code.
- Improve sync diagnostics, watch-mode behavior, and multi-schema workflows.

**UI authoring**

- Continue exposing rich components as plain React components with stable props.
- Keep slots and tokens predictable across components.
- Prefer focused subpath imports for large UI pieces when bundle size matters.

**Server rendering**

- Keep SSR, RSC, PPR, prefetch, and static-route metadata explicit build
  helpers.
- Expand fixture coverage for Vite plugin behavior and generated SSR templates.
- Keep artifact terminology clear: build metadata is not an app authoring model.

## Later

**Sync evolution**

- Selective hook generation from OpenAPI operation selection.
- Multiple generated client sets for multi-backend and multi-tenant apps.
- Offline schema/docs assets for local development and hosted docs.

**Examples**

- Checked-in runnable examples for auth, settings, chat/community, admin data
  workflows, SSR, and RSC.
- A source-backed examples index in the docs app.

**Design tooling**

- Playground flows for tokens, component variants, slots, and interaction states.
- Exportable code snippets that map directly to component props and runtime
  config.

**Platform depth**

- Stronger multi-tenant runtime primitives.
- Better realtime diagnostics and reconnect visibility.
- More production templates for edge, node, and hybrid SSR targets.
