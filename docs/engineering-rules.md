# Engineering Rules

## Project Status

**Pre-production. No external consumers.** This means:

- Change anything freely — no deprecation cycles, no migration guides, no backwards compat
- Rename, restructure, delete, and redesign without ceremony
- If a pattern is wrong, fix it now. Don't add tech debt "for later"
- No conservative decision-making based on hypothetical consumers
- The only consumers are internal. If something breaks, fix it.
- This applies to manifests, config shape, and generated output too. If the manifest model is
  wrong, replace it. Do not introduce public versioning, migration theater, or compatibility
  layers just to protect hypothetical future apps that do not exist yet.

## What Snapshot Is

Snapshot is the frontend SDK + CLI for bunshot-powered backends. It has two current surfaces and a growing third:

- **SDK** — TypeScript library consumed by React apps (`createSnapshot` factory, hooks, types)
- **CLI** — oclif-based tool (`snapshot init`, `snapshot sync`) that scaffolds and syncs frontend code from a bunshot server
- **Config-driven UI layer** _(in development)_ — design token system, config-addressable component library, page composition from manifest + OpenAPI, inter-component data binding, and an action vocabulary — the frontend half of the full-stack manifest vision

The SDK targets browser environments. The CLI targets Node/Bun. These are different execution contexts — never mix browser-only APIs into CLI code or Node-only APIs into SDK code.

## The Larger Vision

Snapshot is the frontend layer of a config-driven full-stack platform. A backend manifest (bunshot) and a frontend manifest (snapshot) together describe a complete application. The user describes what they want; the platform generates a running full-stack app.

`bunshot sync` bridges them: reads the backend OpenAPI spec → generates typed API client + hooks → generates page components and data bindings from the frontend manifest + OpenAPI response shapes.

## Repository Structure

```
src/
  index.ts                     ← SDK entry point (createSnapshot, hooks, types)
  ui.ts                        ← UI entry point (ManifestApp, PageRenderer, components, tokens)
  create-snapshot.tsx           ← factory function (closure-based hooks)
  types.ts                     ← shared SDK types

  api/                         ← API client, error types
  auth/                        ← auth hooks, contract, token storage, MFA, OAuth, WebAuthn
  community/                   ← community hooks, contract, types
  webhooks/                    ← webhook hooks, contract, types
  ws/                          ← WebSocket manager + hooks
  sse/                         ← SSE manager + hooks
  push/                        ← push notification hooks + service worker
  routing/                     ← route guards (protectedBeforeLoad, guestBeforeLoad)
  theme/                       ← useTheme hook (Jotai atomWithStorage, dark mode toggle)
  providers/                   ← React context providers

  ui/                          ← ALL config-driven UI code lives here
    tokens/                    ← token system
      resolve.ts               ← resolveTokens() — build-time CSS variable generation
      editor.ts                ← useTokenEditor() — runtime token overrides
      flavors.ts               ← built-in flavor definitions + defineFlavor()
      types.ts                 ← ThemeConfig, FlavorConfig, token type definitions
      __tests__/
    context/                   ← reactive state management
      page-context.ts          ← PageContext — per-route Jotai atom registry
      app-context.ts           ← AppContext — global atom registry (persists across routes)
      from-ref.ts              ← resolveFromRef() — { "from": "id" } resolution
      types.ts
      __tests__/
    actions/                   ← action executor
      executor.ts              ← executeAction() — dispatch for all action types
      handlers/                ← one file per action type
        navigate.ts
        api.ts
        open-modal.ts
        close-modal.ts
        refresh.ts
        set-value.ts
        download.ts
        confirm.ts
        toast.ts
      types.ts                 ← ActionConfig union type, per-action schemas
      __tests__/
    manifest/                  ← manifest parsing + rendering
      schema.ts                ← Zod schema for snapshot.manifest.json
      page-renderer.tsx        ← <PageRenderer config={page} /> — renders a page from config
      manifest-app.tsx         ← <ManifestApp manifest={m} /> — full app from manifest
      component-registry.ts    ← maps type strings → component implementations
      types.ts
      __tests__/
    components/                ← all config-addressable components
      _base/                   ← shared component utilities (NOT a barrel — internal only)
        use-component-data.ts  ← shared data-fetching hook (endpoint binding)
        use-from-ref.ts        ← shared from-ref subscription hook
        component-wrapper.tsx  ← shared wrapper (data-snapshot-component attr, error boundary)
        types.ts               ← BaseComponentConfig, shared prop types
      layout/                  ← layout + navigation
        layout/                  ← <Layout> (sidebar, top-nav, stacked)
        nav/                     ← <Nav> (sidebar nav, top nav bar)
        row/                     ← <Row> (flex/grid container)
        heading/                 ← <Heading> (h1-h6 with token styling)
      data/                    ← data display
        stat-card/
        data-table/
        detail-card/
        list/
        chart/
        badge/
        empty-state/
        avatar/
      forms/                   ← form + input
        auto-form/
        select/
        toolbar/
      overlay/                 ← modals, drawers, toasts
        modal/
        drawer/
        toast/
      navigation/              ← in-page navigation
        tabs/
        accordion/
        stepper/
        tree-view/
      content/                 ← rich content
        rich-text-editor/
        markdown/
        code-block/
        media-gallery/
        file-uploader/
        timeline/
      communication/           ← messaging + social
        chat-window/
        message-thread/
        notification-feed/
        comment-section/
        reaction-bar/
      commerce/                ← e-commerce
        product-card/
        cart/
        pricing-table/
      workflow/                ← process + audit
        kanban/
        calendar/
        approval-flow/
        audit-log/
        status-tracker/
      admin/                   ← admin tools
        role-manager/
        feature-flag-panel/
      account/                 ← user account
        profile-editor/
        security-settings/
        session-manager/
        notification-prefs/
      documentation/           ← docs + reference
        doc-viewer/
        search-index/
        version-switcher/
        table-of-contents/
        api-reference/
        changelog/
      education/               ← learning
        quiz-builder/
        progress-tracker/
        lesson-viewer/
        certificate-badge/
    presets/                   ← page presets (composed from components)
      crud-page.ts
      dashboard-page.ts
      settings-page.ts
      inbox-page.ts
      storefront-page.ts
      docs-page.ts
      ...
    hooks/                     ← headless hooks for Level 2/3 consumers
      use-data-table.ts        ← table logic without rendering
      use-auto-form.ts         ← form logic without rendering
      use-page-context.ts      ← subscribe to page-level atoms
      use-app-context.ts       ← subscribe to global atoms
      ...

  cli/                         ← CLI (oclif commands, scaffold, templates)
    commands/                  ← oclif command files
    templates/                 ← pure string-returning template functions
    ...

  vite/                        ← Vite plugin (auto-sync)
```

**Rules:**

- **`src/ui/` is the boundary.** All config-driven UI code goes under `src/ui/`. No UI code
  in `src/auth/`, `src/api/`, etc. No SDK domain code in `src/ui/`.
- **UI code accesses the backend through `api`** — the `ApiClient` instance from the factory.
  Never import from `src/auth/`, `src/community/`, etc. directly. The API client is the
  interface between UI components and the backend.
- **Component directories are never flat.** Components are grouped by domain (`data/`,
  `forms/`, `overlay/`, etc.), not dumped into `components/`. If a new component doesn't
  fit an existing group, create a new group with a clear name.
- **Every component is a directory, not a file.** Even simple components get their own
  directory with the standard file structure (see Component File Conventions below).

## Package Entry Points

Three entry points, three audiences:

| Entry                         | File                | Audience                   | Contains                                                            |
| ----------------------------- | ------------------- | -------------------------- | ------------------------------------------------------------------- |
| `@lastshotlabs/snapshot`      | `src/index.ts`      | SDK consumers              | `createSnapshot`, hooks, types, contracts                           |
| `@lastshotlabs/snapshot/ui`   | `src/ui.ts`         | Config-driven UI consumers | `ManifestApp`, `PageRenderer`, components, tokens, flavors, actions |
| `@lastshotlabs/snapshot/vite` | `src/vite/index.ts` | Build tooling              | Vite plugin for auto-sync                                           |

- SDK consumers who write their own React don't pay for the UI layer.
- UI consumers import from `/ui` for everything config-driven.
- The `/ui` entry imports from the SDK internally (api, auth) but never the reverse.

## Code Patterns

1. **Factory pattern for SDK instances** — `createSnapshot(config)` is the single entry point.
   It returns a `SnapshotInstance` with all hooks and utilities closed over the factory's
   scope. No module-level singletons, no shared mutable state between instances. Each call
   to `createSnapshot` is fully isolated.

2. **No backwards compatibility shims** — No re-export barrels or compat shims. Delete old
   locations entirely.

3. **Hooks are closures, not globals** — Every hook (`useLogin`, `useSocket`, etc.) is created
   inside `createSnapshot` and captures `api`, `queryClient`, `tokenStorage`, etc. from the
   closure. No hooks that reach out to a global store or singleton.

4. **Coding style** — Write complete production-grade fixes, not minimal outlines. Every phase
   lands as real, supportable code with tests and cleanup.

5. **TypeScript casts** — `as unknown as T` only at opaque optional-dep boundaries. No `any`.
   No unnecessary hard casts. If a discriminated union narrows correctly, don't cast.

6. **No import/re-export funnels** — No barrel files funneling internals through a single
   index. The package entry points (`index.ts`, `ui.ts`, `vite.ts`) define the public API
   surface.

7. **Minimal public API** — No internals leaking. The less surface area, the fewer breaking
   changes. Anything not explicitly exported from an entry point is internal.

8. **Separation of concerns** — SDK modules by domain (`auth/`, `community/`, `webhooks/`,
   `ws/`, `sse/`). CLI templates are pure string-returning functions. Scaffold logic is
   separate from template content. Don't inline domain logic into `create-snapshot.tsx`.
   Config-driven UI components own their own data fetching and internal state — don't let
   orchestration modules inline domain logic.

9. **Types** — Shared types in `types.ts`. Never redefine the same shape in two places. 100%
   uniform naming conventions. If two files define the same shape independently, one is wrong.

10. **Peer dependencies are boundaries** — React, TanStack Query, TanStack Router, Jotai, Zod,
    and Vite are peer dependencies — they are the consumer's choice. Never import them directly
    in SDK code except through the factory (where they're passed in or imported as peer deps).
    The SDK must tree-shake cleanly; unused peer deps must not appear in the bundle.

## Architecture Patterns

11. **Contract-driven API layer** — The `AuthContract` and `communityContract` patterns define
    endpoint shapes separately from the API client. Adding a new auth provider or community
    variant is a contract override, not a client rewrite. Follow this pattern for any new
    domain module.

12. **No shell interpolation in CLI** — CLI commands use structured arg passing. User-controlled
    values never pass through shell interpretation.

13. **Templates are pure functions** — Every CLI template (`templates/*.ts`) is a pure function
    that returns a string. No filesystem access inside templates. The scaffold layer handles
    writing; templates handle content.

14. **Section markers for generated files** — Generated files use
    `// --- section:name ---` / `// --- end:name ---` markers where appropriate so consumers
    can override specific sections without replacing the whole file.

15. **Test what you ship** — Every feature includes tests. Hook behavior tested with vitest.
    CLI scaffold output tested as string assertions. No tests that depend on a live network.

## SDK Patterns

These govern how the SDK works internally.

16. **SSE registry** — `SseManager` instances are stored in a per-`createSnapshot` Map keyed
    by endpoint path. Never create a new `EventSource` per hook call. The registry pattern
    means one connection per endpoint, multiple subscribers via `manager.on/off`.

17. **WebSocket manager** — One `WebSocketManager` per `createSnapshot` instance, stored in a
    Jotai atom. Hooks read from the atom, never creating new connections. The atom is
    initialized lazily on first `useWebSocketManager` call.

18. **TanStack Query as cache** — All server state goes through `queryClient`. The `queryClient`
    is created once per `createSnapshot` call with config-driven stale/gc times. Invalidation
    after mutations is the hook's responsibility — never let stale data persist after a write.

19. **Auth token storage is pluggable** — `createTokenStorage` accepts a strategy (localStorage,
    cookie, custom). The `ApiClient` receives the storage instance, not a raw token. Never
    hardcode where tokens live.

20. **CLI scaffold is additive** — `snapshot init` creates files, never overwrites without
    confirmation. `snapshot sync` is the only operation that safely overwrites generated files.

## Config-Driven UI Patterns

These govern the design token system and config-addressable component library being developed.

### Component File Conventions

Every config-addressable component follows the same file structure. No exceptions.

```
src/ui/components/{group}/{component-name}/
  schema.ts           ← Zod config schema (the manifest contract)
  component.tsx       ← React component implementation
  types.ts            ← inferred types from schema + internal types (if needed)
  index.ts            ← single re-export: schema + component
  __tests__/
    component.test.tsx  ← rendering, config variations, from-ref wiring, actions
    schema.test.ts      ← schema validation (valid configs pass, invalid reject)
```

**Rules:**

- `schema.ts` is the source of truth. The component's config type is always
  `z.infer<typeof componentSchema>`. Never define the config type manually.
- `component.tsx` receives a single `config` prop typed from the schema. No other
  props. The component wrapper adds `data-snapshot-component`, error boundary, and
  Suspense boundary.
- `index.ts` exports exactly two things: the schema and the component. Nothing else
  leaks out. These are re-exported from the component registry, not imported directly
  by consumers.
- Tests cover: valid/invalid config rejection, default rendering, all config
  variations, `from` ref resolution, action dispatch, loading/error/empty states,
  and responsive behavior.
- **No snowflakes.** If a component needs something that doesn't fit this structure,
  the structure is wrong — fix the structure for all components, don't make one special.

### Component Implementation Rules

- **Config schema is the only interface.** Components receive `config` (from the Zod
  schema) and nothing else. No React props, no context consumers, no atom readers
  that the manifest user needs to know about. The user writes JSON; the component
  does the rest.
- **Components fetch their own data.** If a component has a `data` field
  (`"data": "GET /api/users"`), it calls the API client itself via the shared
  `useComponentData` hook. Parents never fetch data and pass it down.
- **Components own their states.** Loading, error, empty, and success states are all
  handled internally. The user never writes loading spinners or error boundaries for
  config-driven components.
- **Components publish via `id`.** If a component has an `id` in its config, it
  publishes its current value (selected row, form data, active tab, etc.) to the
  page context. Other components subscribe via `{ "from": "that-id" }`.
- **No direct component-to-component imports.** Components communicate through the
  context system (`from` refs), never by importing each other. A DataTable doesn't
  import Modal — it dispatches an `open-modal` action.
- **Wrap with `<ComponentWrapper>`** — every component renders inside the shared
  wrapper which provides: `data-snapshot-component` attribute for token scoping,
  error boundary, Suspense boundary, and `id` registration.
- **Use semantic tokens, never raw values.** `var(--sn-color-primary)`, not `#2563eb`.
  `var(--sn-spacing-md)`, not `1rem`. `var(--sn-radius-lg)`, not `12px`. If a token
  doesn't exist for what you need, add it to the token system — don't inline a value.

### Token Usage Rules (CRITICAL)

These rules exist because violating them caused system-wide visual breakage. Every rule
here maps to a real bug that was painful to track down. Follow them exactly.

#### CSS Variable Names — The Canonical Token Names

All CSS custom properties use the `--sn-` prefix. These are the ONLY valid token names.
If you reference a variable that isn't in this list, it doesn't exist and the component
will silently fall back to a hardcoded value, breaking theme switching.

**Colors** (all generate a `-foreground` companion automatically):
`--sn-color-primary`, `--sn-color-secondary`, `--sn-color-muted`, `--sn-color-accent`,
`--sn-color-destructive`, `--sn-color-success`, `--sn-color-warning`, `--sn-color-info`,
`--sn-color-background` (companion: `--sn-color-foreground`),
`--sn-color-card`, `--sn-color-popover`, `--sn-color-sidebar`,
`--sn-color-border`, `--sn-color-input`, `--sn-color-ring`,
`--sn-chart-1` through `--sn-chart-5`

**Aliases:** `--sn-color-surface` (= card), `--sn-color-text` (= foreground)

**Radius:** `--sn-radius-none`, `--sn-radius-xs`, `--sn-radius-sm`, `--sn-radius-md`,
`--sn-radius-lg`, `--sn-radius-xl`, `--sn-radius-full`

**Spacing:** `--sn-spacing-xs`, `--sn-spacing-sm`, `--sn-spacing-md`, `--sn-spacing-lg`,
`--sn-spacing-xl`

**Font:** `--sn-font-sans`, `--sn-font-mono`, `--sn-font-display`,
`--sn-font-size-xs`, `--sn-font-size-sm`, `--sn-font-size-md`,
`--sn-font-size-lg`, `--sn-font-size-xl`, `--sn-font-weight-semibold`

**Component-level:** `--sn-card-*`, `--sn-table-*`, `--sn-button-*`, `--sn-input-*`,
`--sn-modal-*`, `--sn-nav-*`, `--sn-badge-*`, `--sn-toast-*`

**Names that DO NOT exist** (common mistakes):
~~`--sn-color-danger`~~ → use `--sn-color-destructive`
~~`--sn-color-card-bg`~~ → use `--sn-color-card`
~~`--sn-color-danger-bg`~~ → no token; use a hardcoded fallback
~~`--sn-font-sm`~~ → use `--sn-font-size-sm`
~~`--sn-font-lg`~~ → use `--sn-font-size-lg`
~~`--sn-shadow-card`~~ → use `--sn-card-shadow` (component token)
~~`--sn-card-radius`~~ → use `--sn-radius-lg`
~~`--sn-spacing-2xl`~~ → no token; hardcode if needed
~~`--sn-color-muted` as text color~~ → use `--sn-color-muted-foreground`

#### Color Values Must Be Valid CSS

Flavor definitions store colors as raw oklch strings (e.g., `"0.205 0 0"`).
`resolveTokens()` wraps these in `oklch()` before emitting CSS. **Every function that
produces a CSS color value must output a complete, valid CSS color** — either
`oklch(L C H)`, `#hex`, or another CSS-parseable format. Never emit raw numbers like
`0.5 0.1 240` as a CSS property value — browsers ignore it silently.

#### `--sn-color-muted` Is a Background, Not a Text Color

`muted` has very high lightness (~0.97 light, ~0.27 dark). Using it as `color:` makes
text invisible. Always use `--sn-color-muted-foreground` for text that should appear
"muted" or "secondary".

#### Foreground Pairs — Every Semantic Color Has a Text Companion

When using a semantic color as a `backgroundColor`, use its `-foreground` companion for
`color`. Example: `backgroundColor: var(--sn-color-primary)` pairs with
`color: var(--sn-color-primary-foreground)`. This guarantees contrast in every theme.

The same applies to: `secondary`, `muted`, `accent`, `destructive`, `success`,
`warning`, `info`, `card`, `popover`, `sidebar`.

#### Every Flavor Must Define All Semantic Colors

When adding a new semantic color (like `success`, `warning`, `info`), add it to:

1. The Zod schema (`src/ui/tokens/schema.ts`) — if not already there
2. `FOREGROUND_PAIRS` in `resolve.ts` — so foreground is auto-derived
3. **Every flavor definition** in `flavors.ts` — both `colors` and `darkColors`
4. The token editor UI (playground) — so users can customize it

If a flavor omits a color, components using that token fall back to hardcoded values
and stop responding to theme changes.

#### Font Sizes Use `--sn-font-size-*` Tokens, Never Hardcoded Values

Every `fontSize` in a component must use `var(--sn-font-size-{xs|sm|md|lg|xl}, fallback)`.
Hardcoded `fontSize: "0.875rem"` breaks the font size control — the token var gets
overridden by the static value. This applies to:

- Component inline styles (`style={{ fontSize: "var(--sn-font-size-sm, 0.875rem)" }}`)
- Playground/consumer CSS (use `font-size: var(--sn-font-size-sm, 0.875rem)`)
- Any CSS rule that targets component elements

The only exception is UI chrome that should NOT scale (e.g., the token editor sidebar).

#### Badge/Pill Elements Must Have Explicit Background + Text Color

A badge/pill is useless without visible background and text colors. Always set both
`backgroundColor` and `color` using a semantic token pair. Never rely on `data-color`
attributes without corresponding CSS rules to style them.

#### Overlay Components Must Animate

Modals and drawers must have enter/exit transitions. Never use bare
`if (!isOpen) return null` — use a `mounted` + `animating` state pattern:

1. On open: set `mounted=true`, then `animating=true` on next frame
2. On close: set `animating=false`, then `mounted=false` after transition duration
3. Apply CSS `transition` on opacity/transform

#### Dark Mode Must Flow Through `resolveTokens()` Only

Never set theme colors via `document.documentElement.style.setProperty()` for flavor
switching — inline styles on `:root` override both `:root` and `.dark` CSS rules,
breaking dark mode. The only correct approach for theme changes is regenerating the
full CSS via `resolveTokens()` and injecting it into a `<style>` element.

`useTokenEditor().setToken()` is for individual runtime overrides only, not bulk
flavor switching.

#### Dark Mode Color Overrides Must Derive From User Changes

When a user overrides a color (e.g., changes primary), the dark mode variant must
auto-derive from the override. Never use the flavor's hardcoded `darkColors` verbatim
when `overrides.colors` contains changes — merge auto-derived dark variants for the
overridden colors into the dark palette.

#### `color-scheme` Property Is Required

The `:root` block must include `color-scheme: light` and the `.dark` block must include
`color-scheme: dark`. This ensures native browser elements (scrollbars, form controls,
date pickers) match the theme. Without it, dark mode has white scrollbars.

### Playground Rules

The playground (`playground/`) is the visual verification environment for all
config-driven components. It is NOT optional.

- **Every component must appear in the playground.** When building a new component,
  add it to the playground showcase with representative fixture data. A component that
  isn't in the playground is untested visually.
- **Showcase all states.** Each component must demonstrate: default/populated, loading,
  error, and empty states. If the component has variants (size, color, format), show them.
- **Token responsiveness is mandatory.** Every component in the playground must visibly
  respond to token changes: flavor switching, color overrides, font size, radius, spacing,
  and dark mode. If a component doesn't change when the user adjusts tokens, something is
  hardcoded that shouldn't be.
- **Playground CSS must use token variables for component areas.** Any `font-size`,
  `color`, `background`, `border-radius`, `padding`, or `gap` that applies to component
  rendering areas must use `var(--sn-*)` tokens. Hardcoded values in playground CSS
  override component token usage and break the token editor. Only sidebar/chrome UI may
  use hardcoded values.
- **Fixture data lives in the showcase.** Mock API responses and config objects are defined
  in `playground/src/showcase.tsx` (or similar). They serve as living documentation of what
  configs look like.
- **Compositions / page presets go in the playground too.** When building page presets
  (CRUD page, dashboard, settings, etc.), add a playground tab/page that renders the preset
  so the full composition can be verified visually with token changes.

### Headless Hooks (Level 2/3)

For consumers who want component logic without the framework's rendering:

- Headless hooks live in `src/ui/hooks/`, not inside component directories.
- Named `use{Component}` (e.g., `useDataTable`, `useAutoForm`).
- Return data + state + handlers, no JSX.
- Accept the same config schema as the config-driven component (or a subset).
- Exported from the `./ui` entry point.
- These are secondary — build the config-driven component first, extract the
  headless hook from it. Never build the hook first and wrap it.

21. **Design tokens are the styling boundary** — Components consume tokens, not raw CSS values.
    Token categories: color (semantic: primary, destructive, muted, success, warning, info),
    spacing scale, radius scale, font scale, component-level tokens. Dark/light mode is a
    token switch, not a separate theme. Breakpoint-aware tokens accept either a flat value or
    a breakpoint map: `{ "default": 1, "md": 2, "lg": 3 }`.

22. **Components are higher-level abstractions** — A config-driven component (table, form,
    stat-card, chart, feed, modal) is not just a React component with props. It:
    - Has a Zod config schema describing what the manifest can set
    - Fetches its own data from its bound endpoint using the generated API client
    - Manages its own loading, error, and empty states internally
    - Publishes its current value by `id` to a page-level context
    - Subscribes to values from other components via `{ "from": "component-id" }`
    - Never exposes React props, useState, or atoms to the user — only its config schema

23. **Inter-component data binding via `from` refs** — Components that drive others declare an
    `id`. Components that consume that value use `{ "from": "id" }` in their config. The
    framework manages reactive state (atoms/signals) underneath. The user describes
    relationships, not wiring.

24. **Fixed action vocabulary** — Interactions are expressed as named actions, not arbitrary
    JavaScript: `navigate`, `api`, `open-modal`, `close-modal`, `refresh`, `set-value`,
    `download`, `confirm`, `toast`. Each action has a defined config schema. New actions are
    added to the vocabulary, not inlined.

25. **Interaction presets** — Hover/press/focus/enter states are named tokens (`lift`, `glow`,
    `fade-in`, `scale-down`, `ring`). Duration tokens: `instant`, `fast`, `normal`, `slow`.
    Components reference presets, not raw CSS. Custom animations that can't be expressed as
    presets go in the code escape hatch.

26. **Code escape hatch is a last resort** — Custom components registered by name and
    referenced via `{ "type": "custom", "component": "MyComponent" }`. Generated code lives
    in `generated/` and is never hand-edited. Custom code is never overwritten by sync.

27. **bunshot sync generates from manifest + OpenAPI** — Reads the backend OpenAPI spec to
    know response shapes, then generates: typed API client + hooks (current), page components
    from frontend manifest + OpenAPI, auto-derived form fields / table columns / detail views,
    nav and auth flows from manifest config, theme CSS from design tokens.

### UI Test Patterns

Config-driven UI components have a different testing shape than SDK hooks. Follow these
patterns for all UI tests.

28. **Test the config, not the implementation.** Tests assert that a given config produces
    the correct output. Don't test internal state management, atom values, or React
    internals. Test what the user (manifest author) controls.

29. **Schema tests are mandatory.** Every component has `schema.test.ts` that verifies:
    valid configs parse, invalid configs reject with clear errors, defaults are applied,
    and `from` ref fields accept both literal values and `{ "from": "id" }` objects.

30. **Rendering tests use config fixtures.** Define config objects as test fixtures, render
    the component with them, assert on output. Don't construct configs inline in every
    test — define a `baseConfig` and spread overrides.

31. **`from` ref tests use a test harness.** Wrap components in a `<TestPageContext>` that
    pre-populates atom values. Assert that the component reads the correct value and
    re-renders when it changes.

32. **Action tests assert dispatch, not side effects.** When a component dispatches an
    action (e.g., clicking a row dispatches `open-modal`), assert the action was dispatched
    with the correct config. Don't test that the modal actually opened — that's the action
    executor's job.

33. **No network in UI tests.** Components fetch via the API client. In tests, provide a
    mock API client that returns fixtures. Never hit a real endpoint.

34. **JSDoc on public API** — Every exported function, hook, type, and class must have
    up-to-date JSDoc. When you change a signature, param, return value, or behavior, update
    the JSDoc in the same commit. Stale or missing docs on public surface area is a bug.
    Internal helpers do not require JSDoc unless the logic is non-obvious.

35. **Documentation parity** — Any change to a public API, config option, behavior, or concept
    documented in `docs/` must be reflected there in the same commit. Docs that describe the
    old behavior are a bug.

    **Before closing any task**, independently verify:
    - Every exported symbol you touched: is the JSDoc accurate for the new behavior?
    - Every `docs/` page that references the affected feature or API: does it still describe
      reality?

## Definition of Done

Work is not finished until all of the following pass:

```sh
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier formatting check (run `bun run format` to fix)
bun run build            # tsup + oclif manifest
bun test                 # full test suite (vitest run)
```

Additionally, for every change that touches a public API, config option, or user-visible
behavior, verify:

- [ ] JSDoc updated on every affected exported symbol (same commit)
- [ ] `docs/` updated or created for every affected user-visible feature

If any of these fail or are missing, the work is not done. Fix the issue before moving on.

## Writing Specs

When writing or updating implementation specs, follow the process in `docs/spec-process.md`.
Key points: audit the codebase before writing, surface architectural decisions to the developer,
resolve all ambiguity before handoff, separate tracks on separate branches.
