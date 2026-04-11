# Engineering Rules

## Repository Structure

```
src/
  index.ts                     ← SDK entry point
  ui.ts                        ← UI entry point
  create-snapshot.tsx           ← factory function
  types.ts                     ← shared SDK types
  api/  auth/  community/  webhooks/  ws/  sse/  push/  routing/  theme/  providers/

  ui/                          ← ALL config-driven UI code
    tokens/                    ← resolve.ts, editor.ts, flavors.ts, types.ts
    context/                   ← page-context.ts, app-context.ts, from-ref.ts
    actions/                   ← executor.ts + handlers/ (navigate, api, open-modal, etc.)
    manifest/                  ← schema.ts, page-renderer.tsx, manifest-app.tsx, component-registry.ts
    components/                ← grouped by domain, never flat
      _base/                   ← shared: use-component-data, use-from-ref, component-wrapper, types
      layout/                  ← layout, nav, row, heading
      data/                    ← stat-card, data-table, detail-card, list, chart, badge, empty-state, avatar
      forms/                   ← auto-form, select, toolbar
      overlay/                 ← modal, drawer, toast
      navigation/              ← tabs, accordion, stepper, tree-view
      primitives/              ← link, text, oauth-buttons, passkey-button
      content/  communication/  commerce/  workflow/  admin/  account/  documentation/  education/
    presets/                   ← page presets (crud, dashboard, settings, etc.)
    hooks/                     ← headless hooks (useDataTable, useAutoForm, etc.)
    i18n/                      ← internationalization

  cli/                         ← oclif commands + templates
  vite/                        ← Vite plugin
```

**Boundary rules:**
- `src/ui/` is the boundary — no UI code outside it, no SDK domain code inside it
- UI code accesses backend through `ApiClient`, never importing from `src/auth/` etc.
- Components grouped by domain, every component is a directory (not a file)

## Package Entry Points

| Entry                         | File                | Contains                                                            |
| ----------------------------- | ------------------- | ------------------------------------------------------------------- |
| `@lastshotlabs/snapshot`      | `src/index.ts`      | `createSnapshot`, hooks, types, contracts                           |
| `@lastshotlabs/snapshot/ui`   | `src/ui.ts`         | `ManifestApp`, `PageRenderer`, components, tokens, flavors, actions |
| `@lastshotlabs/snapshot/vite` | `src/vite/index.ts` | Vite plugin                                                         |

`/ui` imports from SDK internally but never the reverse.

## Code Patterns

1. **Factory pattern** — `createSnapshot(config)` returns a fully isolated `SnapshotInstance`.
   No module-level singletons. All hooks are closures capturing `api`, `queryClient`, etc.

2. **No backwards compat shims** — Delete old code, don't re-export or alias it.

3. **No `any`, no unnecessary casts** — `as unknown as T` only at opaque optional-dep boundaries.

4. **No barrel files** — Entry points (`index.ts`, `ui.ts`, `vite.ts`) define the public API.
   Minimal surface area. Anything not explicitly exported is internal.

5. **Types** — Shared types in `types.ts`. Never redefine the same shape in two places.

6. **Peer dependencies** — React, TanStack Query/Router, Jotai, Zod, Vite are peer deps.
   SDK must tree-shake cleanly; unused peer deps must not appear in the bundle.

7. **Contract-driven API** — `AuthContract`/`communityContract` define endpoint shapes
   separately from the client. New domain modules follow this pattern.

8. **CLI** — No shell interpolation. Templates are pure string-returning functions.
   `snapshot init` is additive; `snapshot sync` safely overwrites generated files.
   Section markers (`// --- section:name ---`) for consumer overrides.

9. **SDK internals** — SSE: one `SseManager` per endpoint via registry. WebSocket: one
   manager per instance in a Jotai atom. TanStack Query as cache with mutation-driven
   invalidation. Auth token storage is pluggable via `createTokenStorage`.

## Config-Driven UI Patterns

### Manifest-Only Architecture

These rules enforce the vision in `docs/specs/completed/manifest-only-ui.md`. Every new feature,
component, and code path must satisfy all of them.

1. **One code path per concept.** If two components solve the same problem differently, one
   is wrong. There is one data-fetching hook (`useComponentData`), one from-ref resolver
   (`resolveFromRef`), one template resolver (`resolveTemplate`), one icon renderer
   (`renderIcon`). Adding a second path for any of these is a bug, not a feature.

2. **No escape hatches.** Auth is not special. Feedback screens are not special. Every screen
   is a route with a layout and components. No `if (route.id === "login")` branching, no
   `resolveAuthScreen`, no route-id checks that create special rendering paths. If a concept
   needs special treatment, the framework is incomplete — fix the framework.

3. **Fragments replace bespoke code.** Framework-provided defaults (auth screens, error pages,
   feedback) are manifest fragments composed from public primitives — the same primitives a
   consumer would use. If a default fragment looks bad, the component library is incomplete.
   Fix the library, not the fragment.

4. **Registries, not switches.** Components, layouts, actions, and guards are all registered
   in registries and resolved by name. No switch statements over type strings, no hardcoded
   lists. Adding a new type means calling `register*()`, not editing framework internals.

5. **Defaults render presentably.** A manifest with minimal config must produce a beautiful,
   themed, working app. `resolveTokens({})` returns sensible defaults. Default fragments
   fill gaps the consumer doesn't specify. A blank-ish manifest should never produce a
   broken or unstyled page.

6. **Consumer apps have no source code.** The target consumer repo is:
   `snapshot.manifest.json` + `index.html` + `vite.config.ts` + `package.json`. No `src/`
   directory, no `.tsx`, no `.css`. The only exception is an optional
   `src/custom-components.ts` for genuinely bespoke needs — and that file must use tokens.

7. **Dogfooding drives completeness.** If a consuming app needs bespoke code to accomplish
   something, the framework is incomplete. Every feature must work end-to-end from manifest
   config alone.

### Component File Conventions

```
src/ui/components/{group}/{component-name}/
  schema.ts           ← Zod config schema (source of truth for types)
  component.tsx       ← receives single `config` prop from schema
  types.ts            ← z.infer types + internal types
  index.ts            ← exports schema + component only
  __tests__/
    component.test.tsx
    schema.test.ts
```

No snowflakes. If a component needs something outside this structure, fix the structure.

### Component Implementation Rules

- **Config schema is the only interface.** Single `config` prop, no React props.
- **Self-contained.** Components fetch their own data (`useComponentData`), manage their
  own loading/error/empty states. Parents never fetch and pass down.
- **Publish via `id`.** Components publish current value to page context. Others subscribe
  via `{ "from": "that-id" }`. No direct component-to-component imports.
- **Wrap with `<ComponentWrapper>`** for `data-snapshot-component` attr, error/Suspense boundary.
- **Semantic tokens only.** `var(--sn-color-primary)` not `#2563eb`. If no token exists, add one.
- **Fixed action vocabulary.** `navigate`, `api`, `open-modal`, `close-modal`, `refresh`,
  `set-value`, `download`, `confirm`, `toast`. New actions added to vocabulary, not inlined.
- **Code escape hatch** via `{ "type": "custom", "component": "MyComponent" }` — last resort.

### SSR Rules

Components render on the server. Violating these causes SSR crashes or hydration mismatches.

1. **Every component file**: `'use client'` as line 1 (if hooks used) or
   `// Server Component` comment. No exceptions.
2. **`'use client'` does NOT skip SSR.** Client components still pre-render on server.
3. **No browser APIs in render body.** No `document`, `window`, `localStorage`, `navigator`
   in synchronous render. Move to `useEffect` — effects don't run during SSR, no typeof
   guards needed.
4. **Server→client props must be serializable.** No functions, `Map`, `Set`, `Date`, `undefined`.
5. **Context providers and `ComponentWrapper` get `'use client'`.**
6. **Test SSR** with `renderToStaticMarkup` in every component test suite.

### Token Usage Rules (CRITICAL)

All CSS vars use `--sn-` prefix. Reference a non-existent var → silent fallback → broken theming.

**Canonical tokens:**

- **Colors** (auto-generate `-foreground` companion):
  `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `info`,
  `background` (companion: `foreground`), `card`, `popover`, `sidebar`, `border`, `input`, `ring`
  Charts: `--sn-chart-1` through `--sn-chart-5`
  Aliases: `--sn-color-surface` (=card), `--sn-color-text` (=foreground)

- **Radius:** `none`, `xs`, `sm`, `md`, `lg`, `xl`, `full`
- **Spacing:** `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- **Font:** families (`sans`, `mono`, `display`), sizes (`xs`–`4xl`), weights (`light`–`bold`)
- **Shadows:** `none`, `xs`, `sm`, `md`, `lg`, `xl`
- **Z-index:** `base`, `dropdown`, `sticky`, `overlay`, `modal`, `popover`, `toast`
- **Animation:** durations (`instant`, `fast`, `normal`, `slow`), easings (`default`, `in`, `out`, `in-out`, `spring`)
- **Opacity:** `disabled`, `hover`, `muted`
- **Typography:** leading (`none`–`loose`), tracking (`tight`, `normal`, `wide`)
- **Border:** `none`, `thin`, `default`, `thick`
- **Containers:** `xs`–`2xl`, `full`, `prose`
- **Focus ring:** `--sn-ring-width`, `--sn-ring-offset`, `--sn-ring-color`
- **Breakpoints:** `sm` (640), `md` (768), `lg` (1024), `xl` (1280), `2xl` (1536)
- **Component-level:** `--sn-card-*`, `--sn-table-*`, `--sn-button-*`, `--sn-input-*`,
  `--sn-modal-*`, `--sn-nav-*`, `--sn-badge-*`, `--sn-toast-*`

**Common mistakes:**
~~`--sn-color-danger`~~ → `--sn-color-destructive` |
~~`--sn-font-sm`~~ → `--sn-font-size-sm` |
~~`--sn-color-muted` as text~~ → `--sn-color-muted-foreground` |
~~`--sn-shadow-card`~~ → `--sn-card-shadow` |
~~`--sn-card-radius`~~ → `--sn-radius-lg`

**Token rules:**
- Colors stored as raw oklch strings; `resolveTokens()` wraps in `oklch()`. Never emit raw numbers as CSS values.
- `--sn-color-muted` is a background. Use `--sn-color-muted-foreground` for text.
- Foreground pairs: `backgroundColor: var(--sn-color-primary)` → `color: var(--sn-color-primary-foreground)`.
- New semantic colors must be added to: Zod schema, `FOREGROUND_PAIRS`, every flavor, token editor.
- Font sizes: always `var(--sn-font-size-*, fallback)`, never hardcoded.
- Badges: explicit `backgroundColor` + `color` pair, always.
- Overlays: must animate (mounted + animating state pattern).
- Dark mode: flows through `resolveTokens()` only. Never `style.setProperty()` for flavor switching.
- Dark mode overrides: auto-derive from user changes, don't use hardcoded `darkColors`.
- `:root` needs `color-scheme: light`; `.dark` needs `color-scheme: dark`.

### Playground Rules

Every component must appear in the playground with all states (default, loading, error, empty,
variants). Must respond to token changes (flavor, colors, font, radius, spacing, dark mode).
Playground CSS uses `var(--sn-*)` for component areas. Page presets go in playground too.

### Headless Hooks

Live in `src/ui/hooks/`, named `use{Component}`. Return data + state + handlers, no JSX.
Build the config-driven component first, extract the hook second.

## Testing

- **Config, not implementation.** Assert config → output. Don't test atoms or React internals.
- **Schema tests mandatory.** Valid/invalid configs, defaults, `from` ref fields.
- **Config fixtures.** Define `baseConfig`, spread overrides. Don't construct inline.
- **`from` ref tests** use `<TestPageContext>` with pre-populated atoms.
- **Action tests** assert dispatch config, not side effects.
- **No network.** Mock API client with fixtures.

## Documentation

- **JSDoc on public API.** Update when you change behavior. Stale docs = bug.
- **`docs/` parity.** Any public API or behavior change reflected in docs in same commit.

## Definition of Done

```sh
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier (run `bun run format` to fix)
bun run build            # tsup + oclif manifest
bun test                 # vitest
```

Plus: JSDoc updated, `docs/` updated for any public API changes.
