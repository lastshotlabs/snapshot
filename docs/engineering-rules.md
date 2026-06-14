# Engineering Rules

## Repository Shape

Snapshot is organized around a small set of public surfaces and a larger set of internal implementation folders.

### Public entrypoints

- `src/index.ts`
  - SDK runtime, auth/realtime/community/webhook contracts, plugin helpers, schema generation
- `src/ui.ts`
  - standalone UI components, tokens, actions, hooks, icons, context, and state helpers
- `src/ssr/index.ts`
  - server rendering, RSC, cache, PPR, prefetch helpers
- `src/vite/index.ts`
  - Vite plugins for sync, SSR, RSC, prefetch, PPR, SSG
- `src/cli/index.ts`
  - `snapshot` CLI and command tree

### Top-level source folders

- `src/api`, `src/auth`, `src/community`, `src/webhooks`, `src/ws`, `src/sse`, `src/push`
- `src/providers`, `src/routing`, `src/theme`
- `src/ui`
- `src/ssr`
- `src/vite`
- `src/cli`

### UI sub-surfaces

`src/ui` currently includes:

- `actions`
- `analytics`
- `components`
- `context`
- `entity-pages`
- `expressions`
- `hooks`
- `i18n`
- `icons`
- `layouts`
- `policies`
- `presets`
- `shortcuts`
- `state`
- `tokens`
- `workflows`

### Component groups

Components are grouped by domain under `src/ui/components`:

- `_base`
- `commerce`
- `communication`
- `content`
- `data`
- `feedback`
- `forms`
- `layout`
- `media`
- `navigation`
- `overlay`
- `primitives`
- `workflow`

## Boundary Rules

1. Public API is declared intentionally from the four package entrypoints plus the CLI binary. Keep those entrypoints readable and source-backed.
2. SDK code must not depend on UI-only internals unless that dependency is explicitly part of the supported bootstrap/runtime relationship.
3. UI runtime code lives in `src/ui/**`. Do not leak UI-only logic into unrelated top-level folders.
4. SSR/Vite integration lives in `src/ssr/**` and `src/vite/**`. Do not mix browser-only assumptions into server paths.
5. CLI code must remain shell-safe and template-driven. Generated files are product surface, not throwaway scaffolding.

## API Design Rules

1. Use the factory pattern. `createSnapshot(config)` returns an isolated runtime instance.
2. No backwards-compat shims. If a public shape is wrong, replace it cleanly and update the docs.
3. No `any` without a deliberate opaque boundary. Prefer real types over casts.
4. Keep canonical public exports in the entrypoints. Internal `index.ts` files inside folders are allowed, but do not quietly widen public API through accidental re-export sprawl.
5. Shared public shapes belong in the real type modules, not duplicated ad hoc across files.
6. Contract-driven integration stays explicit. Auth, community, webhook, UI, and Vite option shapes should be readable from source and JSDoc.

## UI Rules

### Platform rules

1. One code path per concept. If the repo has two different ways to resolve the same UI concern, one of them is probably drift.
2. Use registries, not switches, for extensible surfaces such as components, layouts, guards, analytics providers, and workflow actions.
3. Component defaults must render presentably.
4. Source of truth lives in the schema, component, and runtime helpers:
   - component contracts: `src/ui/components/**/schema.ts`
   - component styling model: `src/ui/components/_base/schema.ts` and `src/ui/components/_base/style-surfaces.ts`
5. If a consumer needs bespoke code for a common reusable UI concern, improve the component surface rather than normalizing ad hoc copies.

### Component file conventions

Every component directory should follow the normal structure unless there is a strong reason not to:

```text
src/ui/components/{group}/{component-name}/
  schema.ts
  standalone.tsx
  types.ts
  index.ts
  __tests__/
    schema.test.ts
    component.test.tsx
```

### Component implementation rules

- Component props and schemas are the contract. Read both before changing docs or examples.
- Prefer typed props and normal React event handlers for code-first components.
- Components are responsible for their own data/runtime integration through shared UI patterns.
- Use shared wrappers and base utilities instead of rebuilding error, loading, slot, or publish/subscribe behavior per component.
- Use semantic Snapshot tokens. If a needed token does not exist, add it properly instead of hardcoding raw values.
- Visible component behavior must be represented in the playground when practical.

### Canonical pattern files

When implementing or reviewing UI, start with:

- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/style-surfaces.ts`
- `playground/src/showcase.tsx`

## SSR And Vite Rules

1. SSR docs and code must describe current runtime behavior, not an intended future design.
2. Do not introduce browser globals into synchronous server render paths.
3. Treat `src/ssr/index.ts` and `src/vite/index.ts` as public contracts. JSDoc quality matters there.
4. If a render mode, prefetch flow, PPR behavior, SSG behavior, or RSC contract changes, update the integration docs and proving tests in the same change.

## CLI Rules

1. No shell interpolation for file operations or command construction.
2. Templates are source of truth for generated projects. Keep them typed and readable.
3. `snapshot init` and `snapshot sync` must stay truthful in docs and tests. If generated output changes, the docs and template expectations change with it.

## Testing Rules

- Test the contract, not framework implementation trivia.
- Schema or prop-level tests are mandatory for public component contract changes.
- Reuse the nearest existing wrapper/provider pattern instead of inventing new test harnesses.
- Use `renderToStaticMarkup` when changing SSR-sensitive component surfaces.
- No live network calls in tests. Use fixtures and mocks.
- If the public contract changed and the nearest proving test did not, the work is incomplete.

## Documentation Rules

- Public docs are product surface.
- JSDoc on public exports is mandatory and must match behavior on `main`.
- Human-written guides explain workflows and composition. Generated reference carries exact shapes.
- Capability changes must review the cross-cutting docs, not just the local reference page:
  - `apps/docs/src/content/docs/index.md`
  - `apps/docs/src/content/docs/start-here/index.md`
  - `apps/docs/src/content/docs/start-here/installation.md`
  - `apps/docs/src/content/docs/examples/index.md`
- Playground coverage is part of the documentation system until a broader example suite exists.
- `bun run docs:ci` is the default documentation validation path for contributor work.

## Definition Of Done

Run:

```sh
bun run typecheck
bun run format:check
bun run build
bun test
```

And, when public behavior changed:

```sh
bun run docs:ci
```

The change is not done until code, docs, examples, and proving tests all agree.
