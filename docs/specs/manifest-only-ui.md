# Manifest-Only Enterprise UI — Canonical Spec

> **Status:** Draft v1
> **Owner:** Framework
> **Scope:** Make snapshot the single surface for building beautiful, fully-customizable, enterprise-grade applications entirely from `snapshot.manifest.json`. Zero `.tsx` / `.ts` / `.css` files in the consuming repo. No escape hatches for "special" screens. No bespoke code paths. The manifest is the source of truth, end to end.
>
> | Phase | Title | Track | Status |
> |---|---|---|---|
> | 0 | Foundation fixes | Runtime | Not started |
> | 1 | Delete the escape hatches | Runtime | Not started |
> | 2 | Default fragments + merge | Compiler | Not started |
> | 3 | Layout system completeness | Components | Not started |
> | 4 | Component library gap-fill | Components | Not started |
> | 5 | Action language expansion | Actions | Not started |
> | 6 | Data binding unification | Runtime | Not started |
> | 7 | Auth fragment rewrite | Compiler | Not started |
> | 8 | Enterprise features | Runtime | Not started |
> | 9 | CLI completion + scaffolding | CLI | Not started |
> | 10 | Accessibility + i18n | Components | Not started |
> | 11 | Extension points | Runtime | Not started |
> | 12 | Enforcement + visual regression | CI | Not started |

---

## 1. Vision

A developer runs `snapshot init my-app`, edits `snapshot.manifest.json`, runs `snapshot dev`, and sees a fully themed, authenticated, responsive, accessible, enterprise-grade application. They ship it with `snapshot build`. A designer re-themes the whole app by editing the `theme` block. A security auditor finds no escape hatches, no bypasses, no special cases.

### Before

- `auth.tsx` is ~1000 lines of bespoke React that hardcodes the auth flow, bypasses the component library, and cannot be themed via tokens the way the rest of the app is.
- `resolveAuthScreen` hijacks routes at render time, making "auth" a special kind of thing the rest of the framework has to work around.
- Default feedback screens (`error-page`, `not-found`, `offline-banner`, `spinner`) are registered as components but aren't composed from the component library — each is hand-rolled.
- Token CSS injection runs in a `useLayoutEffect`, so the first paint is always unstyled when the browser renders faster than React commits.
- Nav items render icon *names* as plain text (`LayoutDashboard`) instead of SVGs because the nav component's item loop uses `{item.icon}` directly while the user menu in the same file uses `<Icon name={item.icon} />` correctly.
- `auth.screens` is a flat `z.array(z.enum(...)).min(1)` — impossible to override individual screens or opt out of specific ones without workaround hacks.
- Consuming apps must have a `main.tsx` even though the Vite plugin already supports a virtual entry. Nobody documented it; nobody uses it.
- There is no "default fragment" concept. Every manifest is atomic. Framework-provided sensible defaults must be copied into every consumer's manifest by hand.

### After

- `auth.tsx` does not exist. Auth is a manifest fragment (`defaults/auth.ts`) composed from public primitives the same way any consumer would build auth themselves. Delete it and you see that the component library is complete enough to express it.
- `resolveAuthScreen` does not exist. Auth routes are just routes. Routes pick their layout; auth routes pick `layout: "centered"`.
- Every default screen (404, error, loading, offline, auth) is shipped as a manifest fragment. Consumers override per-screen via `auth.screens: { login: "default", register: false }` or by defining a route with the same `id`.
- Token CSS is injected during compile — synchronously, before first render, SSR-safe.
- Every component uses one shared icon-rendering helper. Every component uses one shared data-resolver, one shared from-ref resolver, one shared template resolver. No snowflakes.
- Consuming apps ship with: `snapshot.manifest.json`, `index.html`, `vite.config.ts`, `package.json`. No `src/` directory. Optional single file `src/custom-components.ts` for extension needs.
- Visual regression tests run a reference manifest that exercises every primitive × every layout × every flavor × both modes. A PR that degrades the login screen fails CI.

---

## 2. What Already Exists on Main

Audited against `snapshot/src/**` and reported here so the spec does not contradict reality. File paths and counts are ground truth.

### 2.1 Component library (69 components, fully token-compliant)

Already registered in `src/ui/components/register.ts` via `registerBuiltInComponents()` (lines 181–589). All 69 use `var(--sn-*)` exclusively — no hardcoded hex/rgba/px values detected. Organized by domain:

**Layout & structure**
- `layout/layout` — 5 variants (`sidebar`, `top-nav`, `stacked`, `minimal`, `full-width`), slot-based (header/sidebar/main/footer/nav)
- `layout/nav`
- `data/separator`

**Forms (13)**
- `button`, `input`, `textarea`, `switch`, `toggle`, `multi-select`, `tag-selector`, `entity-picker`, `location-input`, `quick-add`, `inline-edit`, `auto-form`, `wizard`

**Data display (17)**
- `stat-card`, `data-table`, `detail-card`, `avatar`, `avatar-group`, `badge`, `alert`, `progress`, `skeleton`, `empty-state`, `list`, `tooltip`, `filter-bar`, `highlighted-text`, `favorite-button`, `notification-bell`, `save-indicator`

**Content (8)**
- `timeline`, `code-block`, `markdown`, `rich-text-editor`, `rich-input`, `file-uploader`, `compare-view`, `link-embed`

**Navigation (6)**
- `accordion`, `breadcrumb`, `stepper`, `tree-view`, `tabs`, `prefetch-link`

**Overlay (7)**
- `modal`, `drawer`, `popover`, `dropdown-menu`, `context-menu`, `command-palette`

**Communication (7)**
- `chat-window`, `message-thread`, `comment-section`, `emoji-picker`, `reaction-bar`, `presence-indicator`, `typing-indicator`, `gif-picker`

**Workflow (4)**
- `kanban`, `calendar`, `audit-log`, `notification-feed`

**Commerce (1)**
- `pricing-table`

**Feedback (4)**
- `spinner`, `error-page`, `not-found`, `offline-banner`

**Specialized (2)**
- `chart`, `feed`

**Missing primitives this spec adds:**
- `stack`, `column`, `grid`, `container`, `divider`, `spacer`, `section`, `heading` (confirmed not in inventory), `text`, `link`, `code` (separate from `code-block`), `oauth-buttons`, `confirm-dialog`

### 2.2 Layout system

- `src/ui/components/layout/layout/component.tsx` — 5 variants hardcoded in a switch statement, not a registry.
- Routes can declare `layout: { variant: "sidebar" }` today via the route schema.
- **Gap:** no layout registry. New layouts can't be added without editing the switch. Layout per-instance token overrides work via the base `tokens` slot on the component schema, but there is no `layout: "centered"` built-in.

### 2.3 Action system

`src/ui/actions/` contains 11 registered action types:

`navigate`, `api`, `open-modal`, `close-modal`, `refresh`, `set-value`, `download`, `confirm`, `toast`, `track`, `run-workflow`

Workflow composition exists (`src/ui/manifest/schema.ts:417–549`): `if`, `try`/`catch`, `parallel`, `retry`, `wait`, `assign`. Workflows are evaluated at runtime via a `runWorkflow()` engine.

**Gaps:** no `copy`, `emit`, `submit-form`, `reset-form`, `set-theme`, `log`, `navigate-external`, `sequence` (implicit today — arrays run sequentially), `open-drawer`/`close-drawer` (modal covers both today).

### 2.4 Manifest schema top-level shape

`src/ui/manifest/schema.ts:1255–1278`:

```
manifestConfigSchema = z.object({
  $schema?, app?, components?, theme?, toast?, analytics?, push?, ssr?,
  state?, navigation?, auth?, realtime?, clients?, resources?, workflows?,
  overlays?, presets?, policies?, i18n?, subApps?,
  routes: z.array(routeConfigSchema).min(1)  // only required field
})
```

`routes` is the only required top-level field. Everything else is optional. This is already correct.

### 2.5 Auth system (the main bespoke holdout)

- `src/ui/manifest/auth.tsx` exists (~1000 lines). Renders login, register, forgot-password, reset-password, verify-email, MFA, passkey, OAuth screens with hardcoded inline-styled React.
- `resolveAuthScreen(manifest, route)` at `auth.tsx:70–85` — checks if the active route's id matches any declared auth screen and returns a screen type or `null`. Called from `ManifestApp` around line 1194.
- Schema: `authScreenConfigSchema.screens = z.array(z.enum([...])).min(1)` — array of enum, one-or-more required.
- OAuth redirect URL contract is hardcoded in `auth.tsx` and mismatches bunshot-auth's actual path.

**This is the single largest piece of code to delete in this spec.**

### 2.6 Token system

- `src/ui/tokens/flavors.ts:122–584` — 8 built-in flavors: `neutral`, `slate`, `midnight`, `violet`, `rose`, `emerald`, `ocean`, `sunset`. Each declares `colors`, `darkColors`, `radius`, `spacing`, `font`, and optional `components`.
- `resolveTokens(config: ThemeConfig): string` — returns a CSS string with `:root { --sn-* }` + `.dark { --sn-* }` + component-scoped rules. Colors normalized to `oklch()`. Foreground pairs auto-derived.
- **Bug:** `ManifestApp` injects the result in a `useLayoutEffect` (`app.tsx:1582-1587`). First paint is unstyled when the browser paints before React commits. Also: the effect only fires if `compiledManifest.theme` is truthy — a manifest without a `theme` block gets zero tokens.

### 2.7 Default fragments

**Do not exist.** No `defaultFragment`, `mergeFragment`, or `defaultAuthFragment` pattern. Every manifest is atomic. Adding this is the single biggest architectural change in this spec.

### 2.8 CLI

`src/cli/commands/`:
- `init.ts` — scaffolds a new project
- `dev.ts` — starts dev server
- `sync.ts` — generates types/hooks from OpenAPI

**Gap:** no `snapshot build`, `snapshot preview`. Vite handles these today but the CLI story is incomplete.

### 2.9 Vite plugin (more complete than assumed)

`src/vite/index.ts` exports:

- **`snapshotApp(opts?)`** — already creates a virtual entry module `virtual:snapshot-entry` and injects `<ManifestApp manifest apiUrl />`. **Consumers do not need a `main.tsx`.** This is undocumented and unused.
- `snapshotSync(opts?)` — runs `snapshot sync` on build + watches OpenAPI
- `snapshotSsr(opts?)` — SSR plugin array (RSC, PPR, prefetch manifest)
- `staticParamsPlugin(opts)` — scans `generateStaticParams`

**Gap:** documentation and the `init` scaffold don't use `snapshotApp()`, so every consumer writes a `main.tsx` by hand.

### 2.10 Registries

Three separate registries:

1. **Component registry** — `src/ui/manifest/component-registry.tsx:22-34`, `registerComponent(type, component)`
2. **Schema registry** — `src/ui/manifest/schema.ts:193`, `registerComponentSchema(type, schema)`
3. **Flavor registry** — `src/ui/tokens/flavors.ts`, `defineFlavor(name, config)` + `registerBuiltInFlavors()`

Bootstrap:
- `registerBuiltInComponents()` in `src/ui/components/register.ts` — idempotent, guarded by a `builtInComponentsRegistered` flag
- No single `bootBuiltins()` function; initialization is split across multiple call sites in `create-snapshot.tsx`

**Gap:** the registration is spread out. The timing bug from the prior session is caused by `createSnapshot()` triggering builtin registration, which runs *after* `ManifestApp` has already called `compileManifest`. Fix: unify into one `bootBuiltins()` that runs as the first statement of `ManifestApp`.

---

## 3. Developer Context

### 3.1 Build & test

```sh
bun run typecheck
bun run format:check
bun run build
bun test
```

All four must pass at the end of every phase. Phases leave the repo green.

### 3.2 Key files

| Path | What | Notes |
|---|---|---|
| `src/ui/manifest/app.tsx` | `ManifestApp` boot + provider tree | 1600+ lines; contains the timing bugs |
| `src/ui/manifest/schema.ts` | Zod schema for the entire manifest | 1300+ lines; strict, cross-validated |
| `src/ui/manifest/compiler.ts` | `compileManifest` pipeline | Validates + transforms |
| `src/ui/manifest/auth.tsx` | Bespoke auth renderer (~1000 lines) | **Deleted in Phase 1** |
| `src/ui/manifest/component-registry.tsx` | `registerComponent`, `resolveComponent` | ~100 lines |
| `src/ui/components/register.ts` | `registerBuiltInComponents()` — 69 builtins | 600 lines |
| `src/ui/components/layout/layout/component.tsx` | Layout shell with 5 hardcoded variants | Gets a registry in Phase 3 |
| `src/ui/components/layout/nav/component.tsx` | Nav with icon-string rendering bug | Fixed in Phase 0 |
| `src/ui/tokens/resolve.ts` | `resolveTokens()` → CSS string | Used synchronously in Phase 0 |
| `src/ui/tokens/flavors.ts` | 8 built-in flavors | Extended via `defineFlavor` |
| `src/ui/actions/executor.ts` | Action dispatcher + registry | Extended in Phase 5 |
| `src/ui/actions/types.ts` | Action config union | Extended in Phase 5 |
| `src/ui/context/page-context.ts` | Per-route Jotai registry | Used as-is |
| `src/ui/context/app-context.ts` | Global atom registry | Used as-is |
| `src/ui/context/from-ref.ts` | `resolveFromRef()` | Made canonical in Phase 6 |
| `src/vite/index.ts` | `snapshotApp()` + SSR plugins | Documented + used by init in Phase 9 |
| `src/cli/commands/init.ts` | `snapshot init` scaffold | Rewritten in Phase 9 |

### 3.3 Consumer shape — before and after

**Before** (current `budget-fe`):

```
budget-fe/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ snapshot.manifest.json
└─ src/
   └─ main.tsx         ← boilerplate: mount <ManifestApp>
```

**After** (target):

```
budget-fe/
├─ index.html           ← references virtual:snapshot-entry
├─ package.json
├─ vite.config.ts       ← snapshotApp()
└─ snapshot.manifest.json
```

Extension case:

```
budget-fe/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ snapshot.manifest.json
└─ src/
   └─ custom-components.ts   ← registers consumer-specific primitives only
```

No other files. No `App.tsx`. No `main.tsx`. No `.css`. No component directories.

---

## 4. Non-Negotiable Engineering Constraints

Already enforced by `snapshot/CLAUDE.md` and `docs/engineering-rules.md`. This spec adds nothing new — it operationalizes what already exists.

| # | Rule | Enforcement |
|---|---|---|
| R1 | Manifest is the only source of truth | Spec phase exit criteria |
| R2 | No snowflakes — every concept has one code path | CI grep for `route.id ===` and similar |
| R3 | Tokens are the only styling surface | CI grep for hex/rgb/rgba/raw px in `src/ui/components/**` |
| R4 | Defaults render presentably on minimal config | Playground + visual regression |
| R5 | Components closed over their config (no React props) | Schema tests |
| R6 | Actions are a closed vocabulary | Schema validation; no dynamic dispatch |
| R7 | One code path per concept | Code review + lint |
| R8 | Pre-production: delete freely, no compat shims | No version gates in code |
| R9 | SSR-safe components (`renderToStaticMarkup` test mandatory) | Per-component test file |
| R10 | Dogfooding drives completeness (`budget-fe`) | Consumer CI fails on new `.tsx`/`.ts`/`.css` files |
| R11 | WCAG 2.1 AA baseline for every component | axe-core in component tests |
| R12 | Every component in the playground with full state showcase | Playground CI check |

---

## 5. Phase 0 — Foundation Fixes

**Goal:** Fix the bugs that make every other phase harder. Unblocks downstream work. Mechanical, no architecture changes.

### 5.1 Unified `bootBuiltins()`

Create `src/ui/manifest/boot-builtins.ts`:

```ts
let booted = false;

export function bootBuiltins(): void {
  if (booted) return;
  booted = true;
  registerBuiltInComponents();
  registerBuiltInFlavors();
  registerBuiltInActions();
  registerBuiltInLayouts();   // added in Phase 3
  registerBuiltInGuards();    // added in Phase 8
}
```

Call from the **first statement** of `ManifestApp`:

```tsx
export function ManifestApp({ manifest, apiUrl }: ManifestAppProps) {
  bootBuiltins();  // ← before anything else
  const compiledManifest = useMemo(() => compileManifest(manifest), [manifest]);
  // ...
}
```

**File:** `src/ui/manifest/app.tsx:1560` (top of function body).

**Why first statement and not a useEffect:** `compileManifest` runs synchronously at render and reads from the schema registry. If builtins aren't registered yet, the compile pass sees only the ~8 framework-level schemas (row, heading, button, select, spinner, error-page, not-found, offline-banner) and rejects every user component type as unknown. This is already a reported production bug.

### 5.2 Synchronous token injection

Replace the `useLayoutEffect`-based injection at `src/ui/manifest/app.tsx:1582-1587`:

**Before:**
```tsx
useLayoutEffect(() => {
  if (compiledManifest.theme) {
    const css = resolveTokens(compiledManifest.theme);
    injectStyleSheet("snapshot-tokens", css);
  }
}, [compiledManifest.theme]);
```

**After:**
```tsx
const tokenCss = useMemo(
  () => resolveTokens(compiledManifest.theme ?? {}),
  [compiledManifest.theme],
);
// Inside the JSX tree:
<style id="snapshot-tokens" dangerouslySetInnerHTML={{ __html: tokenCss }} />
```

Two behavior changes:
1. Token CSS is always injected, even if `theme` is omitted — `resolveTokens({})` returns defaults.
2. The style tag is part of the render tree, so SSR output includes it and first paint is styled.

### 5.3 Nav icon rendering bug

`src/ui/components/layout/nav/component.tsx:76-80`:

**Before:**
```tsx
{item.icon && (
  <span data-nav-icon="" aria-hidden="true">
    {item.icon}
  </span>
)}
```

**After:**
```tsx
{item.icon && (
  <span data-nav-icon="" aria-hidden="true">
    <Icon name={item.icon} size={16} />
  </span>
)}
```

Match the user menu pattern at line 276 which already does this correctly. Both should use the same `renderIcon(name)` helper extracted to `src/ui/icons/render.ts` so this bug cannot be reintroduced.

### 5.4 Icon helper extraction (no more snowflakes)

New file `src/ui/icons/render.ts`:

```ts
import type { ReactNode } from "react";
import { Icon } from "./icon";

export function renderIcon(name: string | undefined, size = 16): ReactNode {
  if (!name) return null;
  return <Icon name={name} size={size} />;
}
```

Grep `src/ui/components/**` for `{item.icon}`, `{config.icon}`, `{icon}` in JSX and replace every occurrence with `renderIcon(...)`. Expected hits: 15–25.

### 5.5 SSR test coverage

Every component under `src/ui/components/**/component.tsx` must have a corresponding `__tests__/component.test.tsx` that includes:

```ts
import { renderToStaticMarkup } from "react-dom/server";

it("renders to static markup without throwing", () => {
  expect(() =>
    renderToStaticMarkup(
      <TestPageContext>
        <MyComponent config={baseConfig} />
      </TestPageContext>
    )
  ).not.toThrow();
});
```

Audit which components have this test and which don't. Add missing tests. **If a component fails the test, fix the component — do not weaken the test.**

### 5.6 Token lint

New CI script `scripts/lint-tokens.ts`:

```ts
// Grep src/ui/components/**/component.tsx for:
//   - /#[0-9a-fA-F]{3,8}\b/    (hex colors)
//   - /rgba?\(/                (rgb/rgba)
//   - /"\d+px"/                (hardcoded px)
//   - /"\d+\.?\d*rem"/         (hardcoded rem)
// Exceptions: fallbacks inside var() calls are allowed: var(--sn-color-primary, #2563eb)
// Fails CI on any hit.
```

Run in the `bun run lint:tokens` script. Add to CI pipeline.

### 5.7 Escape-hatch lint

New CI script `scripts/lint-escape-hatches.ts`:

```ts
// Grep src/ui/manifest/**/*.ts(x) for:
//   - /route\.id\s*===/
//   - /resolveAuthScreen/
//   - /manifest\.auth\.screens\[/
//   - /AuthScreen\s*\|/
// Fails CI on any hit.
```

Phase 0 adds the lint. It will **not pass** until Phase 1 lands — that's intentional. It exists to block regression once Phase 1 is in.

### 5.8 Exit criteria

- [ ] `bootBuiltins()` exists and runs as the first statement of `ManifestApp`
- [ ] Token CSS injected synchronously, first paint is styled in `budget-fe`
- [ ] Nav items render icons as SVGs, not strings
- [ ] `renderIcon()` helper replaces every inline `{item.icon}` in the component library
- [ ] Every component has an SSR test
- [ ] Token lint passes CI
- [ ] Escape-hatch lint exists (may fail CI — blocks until Phase 1)
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` all pass

### 5.9 Files touched

- `src/ui/manifest/app.tsx` — boot call + synchronous token injection
- `src/ui/manifest/boot-builtins.ts` — **new**
- `src/ui/components/layout/nav/component.tsx` — icon fix
- `src/ui/icons/render.ts` — **new** shared helper
- `src/ui/components/**/component.tsx` — replace inline icon rendering (15–25 files)
- `src/ui/components/**/__tests__/component.test.tsx` — add missing SSR tests
- `scripts/lint-tokens.ts` — **new**
- `scripts/lint-escape-hatches.ts` — **new**
- `package.json` — add `lint:tokens`, `lint:escape-hatches` scripts
- CI config — add lint steps

---

## 6. Phase 1 — Delete the Escape Hatches

**Goal:** Remove every code path that bypasses the manifest. Break login on purpose. The breakage is the signal that motivates Phase 2.

### 6.1 Delete `src/ui/manifest/auth.tsx`

Delete the entire file (~1000 lines). Delete every import of it.

**Expected breakage:**
- `ManifestApp.tsx` will have unresolved imports for `resolveAuthScreen`, `ManifestAuthScreen`, etc.
- Any route declared in `auth.screens` will have no renderer and 404.
- Login, register, MFA, password reset screens stop working in `budget-fe`.

**This breakage is expected and not to be worked around.** Do not re-implement anything deleted in this phase. Phase 2 restores it via the manifest fragment path.

### 6.2 Remove `resolveAuthScreen` calls

Grep for `resolveAuthScreen` — should return zero hits after Phase 1. Any caller gets deleted. The condition that decided "is this an auth screen?" disappears entirely; auth routes become just routes.

### 6.3 Remove the auth-screen path-collision validator

`src/ui/manifest/schema.ts:1307-1326` has a cross-reference validator that synthesizes routes from `auth.screens` and rejects collisions. Delete it. Replace in Phase 2 with the fragment merge algorithm.

### 6.4 Delete the `.min(1)` constraint

`authScreenConfigSchema.screens` should become optional. Drop `.min(1)`. A consuming app may have no auth screens at all (public marketing site, internal tool with no login).

### 6.5 Mark feedback components for fragment rewrite

`spinner`, `error-page`, `not-found`, `offline-banner` currently exist as registered components that self-register their schemas at import time (`src/ui/manifest/schema.ts:770-773`). Leave them registered — they are valid reusable components. Phase 2 builds the default fragment that uses them.

### 6.6 Exit criteria

- [ ] `src/ui/manifest/auth.tsx` does not exist
- [ ] `grep -r "resolveAuthScreen" src/` returns zero results
- [ ] `grep -r "ManifestAuthScreen" src/` returns zero results
- [ ] Escape-hatch lint (added in Phase 0) passes
- [ ] `auth.screens` is optional in the schema
- [ ] `bun run typecheck && bun run build && bun test` pass (tests for auth.tsx are deleted too)
- [ ] **`budget-fe` login is broken** (expected)

### 6.7 Files touched

- `src/ui/manifest/auth.tsx` — **deleted**
- `src/ui/manifest/app.tsx` — remove all auth-screen branching
- `src/ui/manifest/schema.ts` — drop `.min(1)`, remove cross-ref validator
- `src/ui/manifest/__tests__/` — delete auth.tsx tests

---

## 7. Phase 2 — Default Fragments + Merge Algorithm

**Goal:** Introduce the single architectural primitive that replaces every bespoke renderer — **manifest fragments** that snapshot ships and consumers override.

### 7.1 The `ManifestFragment` type

New file `src/ui/manifest/fragment.ts`:

```ts
import type { ManifestConfig } from "./schema";

/**
 * A partial manifest shipped as a default by snapshot or any consumer.
 * Fragments are merged into the consumer's manifest during compile.
 */
export interface ManifestFragment {
  /** Routes contributed by this fragment. Merged by id; app wins on collision. */
  routes?: ManifestConfig["routes"];
  /** Theme overrides contributed by this fragment. Deep-merged; app wins. */
  theme?: ManifestConfig["theme"];
  /** Resources contributed by this fragment. Merged by key; app wins. */
  resources?: ManifestConfig["resources"];
  /** State contributed by this fragment. Merged by key; app wins. */
  state?: ManifestConfig["state"];
  /** I18n strings contributed by this fragment. Deep-merged by locale + key; app wins. */
  i18n?: ManifestConfig["i18n"];
  /** Overlays contributed by this fragment. Merged by key; app wins. */
  overlays?: ManifestConfig["overlays"];
  /** Navigation items contributed by this fragment (appended; app items come after). */
  navigation?: ManifestConfig["navigation"];
}
```

### 7.2 The merge algorithm

New file `src/ui/manifest/merge.ts`:

```ts
/**
 * Merge a default fragment into a consumer manifest. The app's manifest
 * always wins on collision. Deterministic, pure, testable.
 */
export function mergeFragment(
  base: ManifestConfig,
  fragment: ManifestFragment,
): ManifestConfig {
  return {
    ...base,
    routes:    mergeRoutesById(fragment.routes ?? [], base.routes),
    theme:     deepMerge(fragment.theme,    base.theme),
    resources: mergeByKey(fragment.resources, base.resources),
    state:     mergeByKey(fragment.state,     base.state),
    i18n:      mergeI18n(fragment.i18n,       base.i18n),
    overlays:  mergeByKey(fragment.overlays,  base.overlays),
  };
}

function mergeRoutesById(
  fragmentRoutes: RouteConfig[],
  appRoutes: RouteConfig[],
): RouteConfig[] {
  const byId = new Map<string, RouteConfig>();
  for (const r of fragmentRoutes) byId.set(r.id, r);
  for (const r of appRoutes)      byId.set(r.id, r);  // app wins
  return [...byId.values()];
}
```

**Rules:**
- `routes`: merged by `id`. App's route with the same id wins entirely. Fragment routes the app doesn't mention are included as-is.
- `theme`, `resources`, `state`, `overlays`, `i18n`: deep-merged, app wins at every key collision.
- `navigation`: not merged (nav is too opinionated — the app owns it entirely).
- `auth.screens`: **handled separately** (see 7.5).

### 7.3 Fragment loading via `auth.screens` modes

Rewrite `authScreenConfigSchema.screens` from array to object:

```ts
const authScreensSchema = z.record(
  z.enum(["login", "register", "forgot-password", "reset-password", "verify-email", "mfa", "sso-callback"]),
  z.union([z.literal("default"), z.literal(false)]),
).optional();
```

Usage:
```json
"auth": {
  "screens": {
    "login":           "default",
    "register":        "default",
    "forgot-password": false,
    "mfa":             "default"
  }
}
```

- `"default"` — include the default fragment's route for this screen
- `false` — do not create a route for this screen (the app owns it or it's unused)
- Omitted — treat as `"default"` if auth is declared at all

To override a specific screen with bespoke content, the app defines a route with the matching `id` (e.g., `id: "login"`). The merge algorithm keeps the app's version.

### 7.4 The default auth fragment

New file `src/ui/manifest/defaults/auth.ts`:

```ts
import type { ManifestFragment } from "../fragment";

/**
 * Default auth screens composed entirely from public primitives.
 * Consumers override per-screen via auth.screens: { login: "default" | false }
 * or by defining a route with the matching id.
 *
 * This fragment is the canonical test that the component library is
 * complete enough to express auth. If this looks bad, the component
 * library is incomplete — fix the library, not this fragment.
 */
export const defaultAuthFragment: ManifestFragment = {
  routes: [
    {
      id: "login",
      path: "/login",
      layout: { type: "centered" },
      meta: { title: "{i18n:auth.login.title}" },
      content: [
        { type: "stack", gap: "lg", maxWidth: "sm", children: [
          { type: "heading", text: "{app.title}", level: 1, align: "center" },
          { type: "text", value: "{i18n:auth.login.subtitle}", variant: "muted", align: "center" },
          {
            type: "oauth-buttons",
            providers: { from: "auth.providers" },
            onSuccess: [{ type: "navigate-external", to: "{$last.url}" }],
            visibleWhen: "defined(auth.providers)"
          },
          { type: "divider", label: "{i18n:common.or}", visibleWhen: "defined(auth.providers)" },
          {
            type: "auto-form",
            submit: "/auth/login",
            method: "POST",
            fields: [
              { name: "email", type: "email", label: "{i18n:auth.email}",
                required: true, autoComplete: "email" },
              { name: "password", type: "password", label: "{i18n:auth.password}",
                required: true, autoComplete: "current-password",
                inlineAction: { label: "{i18n:auth.forgot}", to: "/forgot-password" } }
            ],
            submitLabel: "{i18n:auth.login.submit}",
            onSuccess: [{ type: "navigate", to: "{auth.redirects.afterLogin}" }],
            onError:   [{ type: "toast", level: "error", message: "{$last.error.message}" }]
          },
          { type: "link", to: "/register", text: "{i18n:auth.login.signupPrompt}", align: "center" }
        ]}
      ]
    },
    { id: "register",        path: "/register",        layout: { type: "centered" }, content: [/*...*/] },
    { id: "forgot-password", path: "/forgot-password", layout: { type: "centered" }, content: [/*...*/] },
    { id: "reset-password",  path: "/reset-password",  layout: { type: "centered" }, content: [/*...*/] },
    { id: "verify-email",    path: "/verify-email",    layout: { type: "centered" }, content: [/*...*/] },
    { id: "mfa",             path: "/mfa",             layout: { type: "centered" }, content: [/*...*/] },
    { id: "sso-callback",    path: "/auth/callback",   layout: { type: "centered" }, content: [/*...*/] }
  ],
  i18n: {
    en: {
      "auth.login.title":         "Sign in",
      "auth.login.subtitle":      "Welcome back",
      "auth.login.submit":        "Sign in",
      "auth.login.signupPrompt":  "Don't have an account? Sign up",
      "auth.email":               "Email",
      "auth.password":            "Password",
      "auth.forgot":              "Forgot?",
      "common.or":                "or",
      /* ...every string referenced above, full English catalog... */
    }
  }
};
```

Every other auth screen follows the same pattern. Full files written in implementation.

### 7.5 Default feedback fragment

New file `src/ui/manifest/defaults/feedback.ts`:

```ts
export const defaultFeedbackFragment: ManifestFragment = {
  routes: [
    {
      id: "not-found",
      path: "*",
      layout: { type: "centered" },
      meta: { title: "{i18n:feedback.notFound.title}" },
      content: [
        { type: "stack", align: "center", gap: "md", children: [
          { type: "heading", text: "404", level: 1 },
          { type: "text", value: "{i18n:feedback.notFound.message}" },
          { type: "button", label: "{i18n:feedback.notFound.home}",
            onClick: [{ type: "navigate", to: "{app.home}" }] }
        ]}
      ]
    },
    {
      id: "error",
      path: "/_error",
      layout: { type: "centered" },
      content: [
        { type: "stack", align: "center", gap: "md", children: [
          { type: "heading", text: "{i18n:feedback.error.title}", level: 1 },
          { type: "text", value: "{from:error.message}", variant: "muted" },
          { type: "button", label: "{i18n:feedback.error.retry}",
            onClick: [{ type: "refresh" }] }
        ]}
      ]
    }
  ],
  i18n: { en: { /* ... */ } }
};
```

### 7.6 Fragment loading pipeline

`compileManifest` gains a fragment phase:

```ts
export function compileManifest(manifest: ManifestConfig): CompiledManifest {
  const withEnv    = resolveEnvRefs(manifest);
  const withFragments = applyDefaultFragments(withEnv);
  const validated  = manifestConfigSchema.parse(withFragments);
  const resolved   = resolveCrossReferences(validated);
  return Object.freeze(resolved);
}

function applyDefaultFragments(m: ManifestConfig): ManifestConfig {
  let out = m;
  if (shouldIncludeAuthFragment(m))     out = mergeFragment(out, buildAuthFragment(m));
  if (shouldIncludeFeedbackFragment(m)) out = mergeFragment(out, defaultFeedbackFragment);
  return out;
}
```

`buildAuthFragment(m)` reads `m.auth.screens` and returns only the routes requested (filtered `defaultAuthFragment.routes`).

### 7.7 Exit criteria

- [ ] `ManifestFragment` type exists
- [ ] `mergeFragment()` pure function with tests for every merge case
- [ ] `defaultAuthFragment` exists, uses only public primitives (no new framework internals)
- [ ] `defaultFeedbackFragment` exists
- [ ] `compileManifest` applies fragments before schema validation
- [ ] `auth.screens` schema rewritten to object-of-modes form
- [ ] `budget-fe` login works again **with zero auth route config** — just `auth.screens: { login: "default" }`
- [ ] Login screen visually passes a manual review (this phase unblocks visual work in later phases)
- [ ] Tests cover: app overrides fragment route, app opts out via `false`, app provides zero auth and sees no auth routes, fragment-only manifest works

### 7.8 Files touched

- `src/ui/manifest/fragment.ts` — **new**
- `src/ui/manifest/merge.ts` — **new**
- `src/ui/manifest/defaults/auth.ts` — **new**
- `src/ui/manifest/defaults/feedback.ts` — **new**
- `src/ui/manifest/defaults/index.ts` — **new** barrel
- `src/ui/manifest/compiler.ts` — fragment pass
- `src/ui/manifest/schema.ts` — `auth.screens` rewrite
- `src/ui/manifest/__tests__/merge.test.ts` — **new**
- `src/ui/manifest/__tests__/defaults-auth.test.ts` — **new**

---

## 8. Phase 3 — Layout System Completeness

**Goal:** Layouts become first-class registered components. Routes pick them. The `centered` layout that Phase 2 already references becomes real.

### 8.1 Layout registry

New file `src/ui/manifest/layout-registry.ts`:

```ts
import type { FC, ReactNode } from "react";
import type { ZodType } from "zod";

export interface LayoutDef<Config = unknown> {
  schema: ZodType<Config>;
  component: FC<{ config: Config; children: ReactNode }>;
}

const layouts = new Map<string, LayoutDef>();

export function registerLayout<C>(name: string, def: LayoutDef<C>): void {
  layouts.set(name, def as LayoutDef);
}

export function resolveLayout(name: string): LayoutDef | undefined {
  return layouts.get(name);
}

export function registerBuiltInLayouts(): void {
  registerLayout("blank",     { schema: blankLayoutSchema,     component: BlankLayout });
  registerLayout("centered",  { schema: centeredLayoutSchema,  component: CenteredLayout });
  registerLayout("sidebar",   { schema: sidebarLayoutSchema,   component: SidebarLayout });
  registerLayout("topbar",    { schema: topbarLayoutSchema,    component: TopbarLayout });
  registerLayout("split",     { schema: splitLayoutSchema,     component: SplitLayout });
  registerLayout("dashboard", { schema: dashboardLayoutSchema, component: DashboardLayout });
  registerLayout("focused",   { schema: focusedLayoutSchema,   component: FocusedLayout });
}
```

### 8.2 Extract existing layouts

The existing `src/ui/components/layout/layout/component.tsx` currently has 5 variants in a switch. Extract each variant to its own component directory under `src/ui/layouts/`:

```
src/ui/layouts/
  blank/
    schema.ts
    component.tsx
    index.ts
    __tests__/
  centered/
    ...
  sidebar/
    ... (ported from the existing sidebar variant)
  topbar/
    ... (ported from existing top-nav variant)
  split/
    ...
  dashboard/
    ...
  focused/
    ... (ported from minimal variant)
```

The legacy `layout/layout/component.tsx` becomes a thin compatibility shim that dispatches to `resolveLayout(variant)` — or is deleted entirely per P8.

### 8.3 Route schema: `layout` field

Update `routeConfigSchema` in `src/ui/manifest/schema.ts`:

```ts
const layoutRefSchema = z.union([
  z.string(),  // "centered"
  z.object({
    type: z.string(),
    tokens: z.record(z.string(), z.string()).optional(),
    className: z.string().optional(),
    style: z.record(z.string(), z.unknown()).optional(),
    // plus any per-layout fields via discriminated union
  })
]);

const routeConfigSchema = z.object({
  id: z.string(),
  path: z.string(),
  layout: layoutRefSchema.optional(),  // falls back to app.defaultLayout
  content: z.union([
    z.array(componentConfigSchema),           // fills "main" slot
    z.record(z.string(), z.array(componentConfigSchema)),  // named slots
  ]),
  guard: z.string().optional(),
  meta: routeMetaSchema.optional(),
});
```

### 8.4 Centered layout (required by Phase 2)

`src/ui/layouts/centered/component.tsx`:

```tsx
'use client';
import type { ReactNode } from "react";
import type { CenteredLayoutConfig } from "./schema";

export function CenteredLayout({
  config,
  children,
}: { config: CenteredLayoutConfig; children: ReactNode }) {
  return (
    <div
      data-snapshot-layout="centered"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--sn-color-background)",
        padding: "var(--sn-spacing-lg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: `var(--sn-container-${config.maxWidth ?? "sm"})`,
          padding: "var(--sn-spacing-2xl)",
          background: "var(--sn-color-card)",
          color: "var(--sn-color-card-foreground)",
          borderRadius: "var(--sn-radius-lg)",
          boxShadow: "var(--sn-shadow-lg)",
          border: "var(--sn-border-thin) solid var(--sn-color-border)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

Tokens used: `--sn-color-background`, `--sn-spacing-lg`, `--sn-container-sm`, `--sn-spacing-2xl`, `--sn-color-card`, `--sn-color-card-foreground`, `--sn-radius-lg`, `--sn-shadow-lg`, `--sn-border-thin`, `--sn-color-border`. **All canonical per `docs/engineering-rules.md`.**

### 8.5 Layout slots

Routes can declare named slots:

```json
"content": {
  "header":  [{ "type": "breadcrumb" }],
  "toolbar": [{ "type": "button", "label": "New" }],
  "main":    [{ "type": "data-table" }],
  "footer":  [{ "type": "text", "value": "© 2026" }]
}
```

Layouts receive a `slots` prop instead of plain `children` when the route uses the object form. `children` is a shortcut that fills the `main` slot.

### 8.6 Exit criteria

- [ ] `registerLayout` + `resolveLayout` exist
- [ ] 7 built-in layouts registered
- [ ] Every layout uses tokens exclusively (token lint)
- [ ] Every layout has SSR + schema + rendering tests
- [ ] Routes can declare `layout: "centered"` in the manifest
- [ ] Route `content` accepts both array (main slot) and object (named slots)
- [ ] `defaultAuthFragment` renders correctly with `layout: "centered"`
- [ ] `budget-fe` login is beautiful, centered, no app chrome leaks in

### 8.7 Files touched

- `src/ui/manifest/layout-registry.ts` — **new**
- `src/ui/layouts/blank/` — **new**
- `src/ui/layouts/centered/` — **new**
- `src/ui/layouts/sidebar/` — **new** (ported)
- `src/ui/layouts/topbar/` — **new** (ported)
- `src/ui/layouts/split/` — **new**
- `src/ui/layouts/dashboard/` — **new**
- `src/ui/layouts/focused/` — **new** (ported)
- `src/ui/manifest/schema.ts` — `layoutRefSchema`, `content` as union
- `src/ui/manifest/boot-builtins.ts` — call `registerBuiltInLayouts()`
- `src/ui/components/layout/layout/` — deleted or shimmed (P8: delete)

---

## 9. Phase 4 — Component Library Gap-Fill

**Goal:** Add the primitives `defaultAuthFragment` references that don't exist yet, plus the missing building blocks for enterprise UI composition.

### 9.1 New primitives

Each gets a directory under the correct group, following the file conventions in `snapshot/CLAUDE.md`:

**Layout primitives** (`src/ui/components/layout/`)
- `stack` — vertical flex with token-driven gap, align, justify, maxWidth
- `column` — vertical flex container (row synonym for consistency)
- `grid` — CSS grid with responsive `cols: { default: 1, md: 2, lg: 3 }`
- `container` — max-width wrapper using `--sn-container-*` tokens
- `divider` — horizontal/vertical with optional label ("or")
- `spacer` — flex spacer with size token
- `section` — titled content region with optional collapse

**Content primitives** (`src/ui/components/content/`)
- `heading` — `h1`–`h6` with align, variant, color token
- `text` — paragraph with size/weight/color/variant (`default`, `muted`, `subtle`)
- `link` — first-class navigation primitive with `to`, `external`, `download` modes
- `code` — inline code (separate from `code-block`)

**Form primitives** (`src/ui/components/forms/`)
- `oauth-buttons` — renders branded buttons per provider from `auth.providers`, dispatches `navigate-external` with the computed provider start URL
- Form field additions (extend `auto-form` schema):
  - Password field gains built-in visibility toggle (component-level, not opt-in)
  - `autoComplete` allowed on every field (drop `.strict()` on field config; use a base + discriminated union)
  - `visibleWhen` on every field — expression language reference
  - `inlineAction` on every field: `{ label, to }` renders a link at the end of the field row
  - `combobox`, `tag-input`, `slider`, `color` field types

**Overlay primitive**
- `confirm-dialog` — alias over modal with `confirm`/`cancel` action targets

### 9.2 Component schema base

All components extend a shared base schema:

```ts
// src/ui/components/_base/schema.ts
export const baseComponentSchema = z.object({
  id: z.string().optional(),
  tokens: z.record(z.string(), z.string()).optional(),
  className: z.string().optional(),
  style: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  visibleWhen: z.string().optional(),
});

export function extendComponentSchema<T extends z.ZodRawShape>(shape: T) {
  return baseComponentSchema.extend(shape);
}
```

Every component schema uses `extendComponentSchema({ ... })` instead of raw `z.object({ ... })`. Refactor existing 69 components as part of this phase.

### 9.3 `oauth-buttons` implementation

```tsx
'use client';
import { useManifestAuth } from "../../../manifest/runtime";
import { useActionExecutor } from "../../../actions/executor";
import { renderIcon } from "../../../icons/render";

export function OAuthButtons({ config }: { config: OAuthButtonsConfig }) {
  const auth = useManifestAuth();
  const execute = useActionExecutor();

  const providers = Object.entries(auth.providers ?? {}).filter(
    ([, p]) => p.type === "oauth",
  );

  if (providers.length === 0) return null;

  return (
    <div data-snapshot-component="oauth-buttons" style={{
      display: "flex", flexDirection: "column", gap: "var(--sn-spacing-sm)"
    }}>
      {providers.map(([name, p]) => (
        <button
          key={name}
          type="button"
          onClick={() => execute([
            { type: "navigate-external", to: p.startUrl ?? `/auth/${name}/start` }
          ])}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "var(--sn-spacing-sm)",
            padding: "var(--sn-spacing-md) var(--sn-spacing-lg)",
            background: "var(--sn-color-card)",
            color: "var(--sn-color-card-foreground)",
            border: "var(--sn-border-thin) solid var(--sn-color-border)",
            borderRadius: "var(--sn-radius-md)",
            cursor: "pointer",
            fontSize: "var(--sn-font-size-sm)",
            fontWeight: "var(--sn-font-weight-medium)" as any,
            transition: "background var(--sn-duration-fast) var(--sn-ease-default)",
          }}
        >
          {renderIcon(p.icon ?? name, 18)}
          <span>{p.label ?? `Continue with ${name}`}</span>
        </button>
      ))}
    </div>
  );
}
```

Tokens referenced: all canonical.

### 9.4 Exit criteria

- [ ] All Phase 4 primitives exist with full component directory structure
- [ ] Every component extends `baseComponentSchema`
- [ ] Existing 69 components refactored to extend the base
- [ ] `defaultAuthFragment` renders end-to-end without runtime errors
- [ ] Password field has working visibility toggle
- [ ] `oauth-buttons` reads `auth.providers` and renders correctly
- [ ] All new components pass token lint, SSR test, axe-core test
- [ ] Playground showcase entry for every new component

### 9.5 Files touched

- ~15 new component directories under `src/ui/components/`
- `src/ui/components/_base/schema.ts` — **new**
- All 69 existing component schemas — refactor to use `extendComponentSchema`
- `src/ui/components/register.ts` — register new components
- Playground fixtures for new components

---

## 10. Phase 5 — Action Language Expansion

**Goal:** Complete the action vocabulary so every interaction a real app needs is expressible without custom code. Formalize the expression language.

### 10.1 New actions

Added to `src/ui/actions/handlers/`:

| Action | Config |
|---|---|
| `navigate-external` | `{ to: string, target?: "_self" \| "_blank" }` |
| `copy` | `{ text: string, onSuccess?: Action[] }` |
| `emit` | `{ event: string, payload?: unknown }` |
| `submit-form` | `{ formId: string }` |
| `reset-form` | `{ formId: string }` |
| `set-theme` | `{ flavor?: string, mode?: "light" \| "dark" \| "system" }` |
| `log` | `{ level: string, message: string, data?: unknown }` |
| `open-drawer` | `{ id: string, payload?: unknown }` |
| `close-drawer` | `{ id: string, result?: unknown }` |

Existing `open-modal`/`close-modal` already handle drawers internally — split them for clarity.

### 10.2 Action composition (already partial)

The current system runs action arrays sequentially. Formalize:

- **Sequential** — an array. Each action waits for the previous.
- **`sequence`** — explicit `{ type: "sequence", actions: Action[] }` for nesting.
- **`parallel`** — already exists in workflows. Expose as a top-level action.
- **`if`** — already exists in workflows. Expose as a top-level action.
- **`try`** — already exists in workflows. Expose as a top-level action.
- **`wait`** — already exists in workflows. Expose as a top-level action.

The workflow engine becomes the single executor. `executeAction(action, ctx)` is a thin wrapper that calls the workflow engine with a one-step workflow. **One code path per concept.**

### 10.3 Expression language

Formalize the expression grammar used in `when`, `visibleWhen`, and templates. New file `src/ui/expressions/parser.ts`:

```ebnf
Expression  := OrExpr
OrExpr      := AndExpr ( "||" AndExpr )*
AndExpr     := UnaryExpr ( "&&" UnaryExpr )*
UnaryExpr   := "!" UnaryExpr | CmpExpr
CmpExpr     := Primary ( ("==" | "!=" | ">" | "<" | ">=" | "<=") Primary )?
Primary     := Literal | Ref | FnCall | "(" Expression ")"
Ref         := Identifier ( "." Identifier | "[" Literal "]" )*
FnCall      := ("defined" | "empty" | "in") "(" ArgList ")"
Literal     := StringLit | NumberLit | BoolLit | NullLit
```

No function calls beyond `defined`, `empty`, `in`. No arbitrary JS. Parser is ~200 lines, exhaustively tested. Used by every component's visibility check and every action's `when` clause.

### 10.4 Template resolver unification

Every string field in the manifest supports `{path}` interpolation. One function:

```ts
// src/ui/expressions/template.ts
export function resolveTemplate(
  template: string,
  contexts: TemplateContexts,
): string;
```

`TemplateContexts` is a typed bag of scopes: `{ app, auth, route, from, env, date, i18n, $last, $refs }`. Every component that accepts user text calls this function. **One code path per concept.**

### 10.5 `$last` and `$ref` for action chaining

Actions in a chain can reference the result of the previous action via `{$last.field}` or a named ref via `ref: "myApi"` then `{$refs.myApi.field}`.

```json
"onClick": [
  { "type": "api", "endpoint": "POST /export", "ref": "export" },
  { "type": "download", "url": "{$refs.export.downloadUrl}" },
  { "type": "toast", "message": "Exported {$refs.export.count} rows" }
]
```

### 10.6 Exit criteria

- [ ] All new actions exist with schemas, handlers, tests
- [ ] Expression parser handles grammar above; fuzz-tested
- [ ] Template resolver is a single function called by every relevant component
- [ ] `$last` / `$refs` work across action chains
- [ ] Workflow engine is the single action executor
- [ ] `docs/actions.md` updated with full action reference
- [ ] `oauth-buttons.onSuccess` can chain API call + toast + navigate

### 10.7 Files touched

- `src/ui/actions/handlers/navigate-external.ts` — **new**
- `src/ui/actions/handlers/copy.ts` — **new**
- `src/ui/actions/handlers/emit.ts` — **new**
- `src/ui/actions/handlers/submit-form.ts` — **new**
- `src/ui/actions/handlers/reset-form.ts` — **new**
- `src/ui/actions/handlers/set-theme.ts` — **new**
- `src/ui/actions/handlers/log.ts` — **new**
- `src/ui/actions/handlers/open-drawer.ts` — **new**
- `src/ui/actions/handlers/close-drawer.ts` — **new**
- `src/ui/actions/types.ts` — extend union
- `src/ui/actions/executor.ts` — unify via workflow engine
- `src/ui/expressions/parser.ts` — **new**
- `src/ui/expressions/template.ts` — **new**
- `src/ui/expressions/__tests__/` — **new**
- `docs/actions.md` — updated

---

## 11. Phase 6 — Data Binding Unification

**Goal:** Every component consumes data through the same three primitives: resources, state, from-refs. No snowflakes.

### 11.1 Resource declarations

`manifest.resources` is already in the schema. This phase makes it the canonical way components fetch data.

```json
"resources": {
  "users": {
    "endpoint": "GET /api/users",
    "staleTime": 60000,
    "cacheTime": 300000,
    "params": { "limit": 100 }
  },
  "current-user": {
    "endpoint": "GET /auth/me",
    "cache": "session"
  }
}
```

Components reference resources instead of endpoints:

```json
{ "type": "data-table", "data": { "resource": "users" } }
```

### 11.2 `useComponentData` unification

Every component that fetches data uses one hook:

```ts
// src/ui/components/_base/use-component-data.ts
export function useComponentData<T>(
  dataConfig: DataConfig,
): { data: T | null; loading: boolean; error: Error | null };

type DataConfig =
  | { resource: string }                     // named resource
  | { endpoint: string; method?: string }    // inline endpoint
  | { from: string }                         // from-ref
  | { value: unknown };                      // literal
```

Every existing component currently fetches data somehow. Audit every component and replace bespoke fetching with `useComponentData`. **One code path per concept.**

### 11.3 From-ref resolver canonicalization

`src/ui/context/from-ref.ts` already has `resolveFromRef`. Make it the **only** way to resolve `{ from: "..." }` references across the codebase. Grep for ad-hoc resolution and replace.

### 11.4 Invalidation

Mutation actions declare what they invalidate:

```json
{
  "type": "api",
  "endpoint": "DELETE /api/users/{from:selected-user.id}",
  "invalidates": ["users"]
}
```

The action executor calls `queryClient.invalidateQueries` for each resource name. Already partially supported via `refresh` action — formalize that mutations can declare invalidation inline.

### 11.5 Exit criteria

- [ ] Every component uses `useComponentData` for data fetching
- [ ] Resources are the canonical data binding form
- [ ] `resolveFromRef` is the single from-ref path (no ad-hoc resolution)
- [ ] `resolveTemplate` is the single template path
- [ ] Mutations can declare `invalidates: string[]`
- [ ] Tests for each data-binding mode

### 11.6 Files touched

- `src/ui/components/_base/use-component-data.ts` — **new**
- Every component file under `src/ui/components/**` — refactor to use the shared hook
- `src/ui/context/from-ref.ts` — export canonical version
- `src/ui/actions/handlers/api.ts` — invalidation support

---

## 12. Phase 7 — Auth Fragment Complete

**Goal:** Close every gap between the bespoke `auth.tsx` (deleted in Phase 1) and the manifest-driven path. At the end of this phase, the default auth fragment is functionally equivalent to the deleted file — same features, same UX, better because it uses the real token system.

### 12.1 OAuth flow end-to-end

- `oauth-buttons` emits `navigate-external` to `auth.providers[name].startUrl`, which defaults to `/auth/{name}/start`.
- The backend handles the OAuth handshake. On return, it redirects to `/auth/callback?token=...`.
- The `sso-callback` route (in `defaultAuthFragment`) runs an action chain: `api` (exchange code for session) → `set-value` (session token to app state) → `navigate` to `afterLogin`.
- **The URL contract between snapshot and bunshot-auth is now explicit.** `auth.providers[name].startUrl` is the only coupling point. Bunshot-auth must expose providers at `/auth/{name}/start`.

### 12.2 Session management

`SessionManager` (already exists in SDK) receives session tokens. The manifest `auth.session` config declares storage mode:

```json
"session": {
  "mode": "cookie",
  "storage": "sessionStorage",
  "key": "app.token",
  "refreshEndpoint": "/auth/refresh"
}
```

No changes to `SessionManager` internals — this phase just documents and tests the existing contract.

### 12.3 Guards as registered actions

Route guards are named entries registered the same way actions/layouts are:

```ts
// src/ui/manifest/guard-registry.ts
export function registerGuard(name: string, def: GuardDef): void;

export function registerBuiltInGuards(): void {
  registerGuard("authenticated", authenticatedGuard);
  registerGuard("role", roleGuard);
  registerGuard("permission", permissionGuard);
  registerGuard("unauthenticated", unauthenticatedGuard);
}
```

Routes reference guards by name:

```json
{ "id": "admin", "path": "/admin", "guard": "admin", "content": [...] }
```

Guards return `{ allow: true }`, `{ allow: false, redirect: "/login" }`, or `{ allow: false, render: ComponentConfig }`. The router checks the guard before rendering the route.

### 12.4 MFA flow

The `mfa` route in `defaultAuthFragment` is just a form with a 6-digit code field. On success, it calls `/auth/mfa/verify` and navigates to `afterLogin`. No bespoke MFA component required.

### 12.5 Passkey / WebAuthn

Register a built-in action `webauthn-authenticate` that runs the WebAuthn ceremony and returns credentials. Use it in the default login fragment conditionally via `visibleWhen: "defined(auth.passkey)"`.

### 12.6 Exit criteria

- [ ] Full auth flow works end-to-end in `budget-fe` with zero route config beyond `auth.screens`
- [ ] OAuth start → callback → session → navigate chain works
- [ ] MFA, password reset, email verify screens work
- [ ] Route guards registered and enforced
- [ ] `docs/auth.md` updated with the manifest-only pattern; code examples only in JSON
- [ ] **No file in snapshot contains `if (isAuth) ...` branching** — auth is a schema concept, not a runtime special case

### 12.7 Files touched

- `src/ui/manifest/guard-registry.ts` — **new**
- `src/ui/manifest/guards/authenticated.ts` — **new**
- `src/ui/manifest/guards/role.ts` — **new**
- `src/ui/manifest/guards/permission.ts` — **new**
- `src/ui/manifest/guards/unauthenticated.ts` — **new**
- `src/ui/manifest/defaults/auth.ts` — flesh out all 7 screens
- `src/ui/actions/handlers/webauthn-authenticate.ts` — **new**
- `docs/auth.md` — rewrite

---

## 13. Phase 8 — Enterprise Features

**Goal:** Internationalization, real-time, observability, advanced theming. The features that separate "demo app" from "enterprise SaaS."

### 13.1 Internationalization

Already partially in schema. This phase completes:

- `{i18n:key.path}` in template resolver
- Locale switching via `set-value` action (`{ key: "app.locale", value: "es" }`)
- Automatic re-render on locale change via app-context atom
- Date/number/currency formatting: `{date:created_at|format:long}`, `{number:amount|currency:USD}`
- RTL detection: `dir="rtl"` on `<html>` when locale is RTL
- Missing key fallback to default locale (never blank)

### 13.2 Real-time

`manifest.realtime` already in schema. Complete the runtime:

```json
"realtime": {
  "websocket": {
    "url": { "env": "VITE_WS_URL" },
    "subscriptions": [
      { "topic": "notifications", "invalidates": ["notifications"] },
      { "topic": "user-status", "publish": "user-status-atom" }
    ]
  }
}
```

On connect, subscribe to topics. Incoming messages either invalidate resources or publish to app state. Components subscribing via `from:user-status-atom` update automatically — they don't know realtime is involved.

### 13.3 Observability

```json
"observability": {
  "audit": { "sink": "POST /audit" },
  "errors": { "sink": "POST /errors", "include": ["stack", "user", "route"] }
}
```

Every action emits an audit event (action name, config, result, user, route, timestamp). Every component error goes to the error sink. No code change needed per consumer.

### 13.4 Theming — runtime flavor switching

`set-theme` action (added in Phase 5) calls `resolveTokens` with the new flavor and re-injects the style tag. Components that use tokens update automatically.

### 13.5 Per-component token overrides

Every component's `tokens` field (added in Phase 4's base schema) emits CSS custom properties scoped to `[data-snapshot-component="X"][data-component-id="Y"]`. The consumer gets per-instance theming:

```json
{
  "type": "button",
  "label": "Primary action",
  "tokens": { "color.primary": "var(--sn-color-success)" }
}
```

### 13.6 Exit criteria

- [ ] Full i18n with locale switching, date/number formatting, RTL
- [ ] Real-time subscriptions working end-to-end in `budget-fe` (via bunshot WS)
- [ ] Observability events fired for every action and error
- [ ] Runtime theme switching via `set-theme`
- [ ] Per-component token overrides emit scoped CSS vars

### 13.7 Files touched

- `src/ui/expressions/template.ts` — i18n + formatting
- `src/ui/realtime/manifest-bridge.ts` — new
- `src/ui/observability/` — new directory
- `src/ui/actions/handlers/set-theme.ts` — complete (stub in Phase 5)
- `src/ui/components/_base/tokens.ts` — per-instance override emitter

---

## 14. Phase 9 — CLI + Scaffolding

**Goal:** Zero boilerplate in consuming apps. `snapshot init` creates a project with no `src/` directory.

### 14.1 Rewrite `snapshot init`

`src/cli/commands/init.ts` currently scaffolds a project with a `main.tsx`. Rewrite to scaffold:

```
my-app/
├─ index.html
├─ package.json          (peer deps, scripts)
├─ vite.config.ts        (uses snapshotApp())
└─ snapshot.manifest.json
```

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>My App</title></head>
  <body>
    <div id="root"></div>
    <script type="module" src="virtual:snapshot-entry"></script>
  </body>
</html>
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import { snapshotApp } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [snapshotApp()],
});
```

`snapshot.manifest.json`: minimal valid manifest with one route, theme flavor, and a "Hello" heading.

**No `src/` directory is created.**

### 14.2 Add `snapshot build` command

`src/cli/commands/build.ts`:

```ts
// Thin wrapper around `vite build` that ensures the plugin is loaded
// and the manifest is validated before build starts.
```

Also adds `snapshot preview` (wraps `vite preview`).

### 14.3 Document `snapshotApp()` properly

Currently the Vite plugin exists but is undocumented. Add `docs/cli/vite-plugin.md` with:
- What it does
- How to use it
- Virtual entry module
- Manifest loading
- HMR behavior
- Options (`manifestPath`, `apiUrl`)

### 14.4 Exit criteria

- [ ] `snapshot init` creates a working project with no `src/` directory
- [ ] `snapshot dev` / `build` / `preview` all work on the scaffold
- [ ] `budget-fe` deletes its `src/main.tsx` and continues to work
- [ ] Consumer CI lint: fails if `src/` contains any `.tsx`/`.ts`/`.css` beyond `src/custom-components.ts`
- [ ] `docs/cli/` updated

### 14.5 Files touched

- `src/cli/commands/init.ts` — rewrite
- `src/cli/commands/build.ts` — **new**
- `src/cli/commands/preview.ts` — **new**
- `src/cli/templates/` — updated scaffold templates
- `src/vite/index.ts` — documentation + option polish
- `docs/cli/` — new docs
- `budget-fe/src/main.tsx` — **deleted** (dogfooding proof)

---

## 15. Phase 10 — Accessibility + i18n Baseline

**Goal:** Every component meets WCAG 2.1 AA out of the box. English is the reference locale; others are declarative.

### 15.1 Accessibility audit

For every component:

- [ ] Correct semantic HTML (`<nav>`, `<main>`, `<button>`, `<a>`)
- [ ] ARIA attributes: `role`, `aria-label`, `aria-describedby`, `aria-expanded`, `aria-current`
- [ ] Keyboard: Tab reaches every interactive element; Enter/Space activate; Escape closes overlays
- [ ] Focus visible: outline via `--sn-ring-*` tokens
- [ ] Focus trap: modals, drawers, command palettes
- [ ] Focus return: on overlay close, return to trigger
- [ ] Screen reader: live regions for toasts; announced state changes
- [ ] Color contrast: verified per flavor, both modes, for every `foreground` / `background` pair in `resolveTokens` output

### 15.2 axe-core integration

Every component test suite runs `axe-core` against the rendered output and fails on any violation.

### 15.3 Contrast CI

Script that iterates every flavor × mode × foreground-background pair and asserts WCAG AA minimum 4.5:1 for text, 3:1 for UI elements. Fails CI on any violation.

### 15.4 Reduced motion

Every animation honors `prefers-reduced-motion`. Token overrides collapse `--sn-duration-*` to `0ms`.

### 15.5 RTL

Every component uses CSS logical properties (`margin-inline-start` not `margin-left`, `padding-inline` not `padding-left`). Switch `dir="rtl"` on root when locale is RTL; verify the whole app mirrors correctly in playground.

### 15.6 Default i18n catalog

Full English strings for every key referenced in `defaultAuthFragment`, `defaultFeedbackFragment`, and every built-in component. Published as `src/ui/manifest/defaults/i18n-en.ts`.

### 15.7 Exit criteria

- [ ] Every component passes axe-core in every state
- [ ] Every flavor passes contrast CI
- [ ] RTL verified for every layout
- [ ] Reduced motion honored
- [ ] English catalog covers every default fragment + component
- [ ] `docs/a11y.md` + `docs/i18n.md` written

### 15.8 Files touched

- Every component file — a11y polish (ARIA, keyboard, logical properties)
- `src/ui/manifest/defaults/i18n-en.ts` — **new**
- `scripts/lint-contrast.ts` — **new**
- Component test files — axe-core assertions
- `docs/a11y.md`, `docs/i18n.md` — new

---

## 16. Phase 11 — Extension Points

**Goal:** Formalize the escape hatch for consumers who have a genuinely bespoke need. Make it narrow, documented, and lint-enforced.

### 16.1 `registerComponent` public API

Already exists internally. Expose via `/ui` entry:

```ts
// @lastshotlabs/snapshot/ui
export { registerComponent, registerLayout, registerAction, registerGuard };
```

### 16.2 `src/custom-components.ts` convention

Consumers who need custom components create exactly one file:

```ts
// src/custom-components.ts
import { registerComponent } from "@lastshotlabs/snapshot/ui";
import { z } from "zod";

registerComponent("company-logo", {
  schema: z.object({
    variant: z.enum(["full", "mark"]).default("full"),
  }).strict(),
  component: ({ config }) => (
    <img
      src={`/logo-${config.variant}.svg`}
      alt="Logo"
      style={{ height: "var(--sn-spacing-lg)" }}
    />
  ),
});
```

### 16.3 Vite plugin auto-import

`snapshotApp()` detects the existence of `src/custom-components.ts` and auto-imports it into the virtual entry module before mounting `ManifestApp`. If the file doesn't exist, nothing is imported.

### 16.4 Custom-component lint

Consumer CI runs the token lint against `src/custom-components.ts`. Hardcoded colors/spacing/px fail the build. Custom components must use tokens.

### 16.5 Exit criteria

- [ ] `registerComponent`, `registerLayout`, `registerAction`, `registerGuard` exported from `/ui`
- [ ] Vite plugin auto-imports `src/custom-components.ts` if present
- [ ] Token lint runs against consumer custom components
- [ ] Docs page explaining when to extend vs. when to file a framework issue
- [ ] `budget-fe` does not have a `custom-components.ts` (dogfooding: the framework should cover it)

### 16.6 Files touched

- `src/ui.ts` — export extension APIs
- `src/vite/index.ts` — auto-import `custom-components.ts`
- `docs/extending.md` — new

---

## 17. Phase 12 — Enforcement + Visual Regression

**Goal:** Make drift impossible. A PR that degrades the UI fails CI.

### 17.1 Reference manifest

New file `playground/reference-manifest.json` — exercises every primitive, every layout, every flavor, both modes. Used as the visual regression source.

### 17.2 Playwright visual regression

`scripts/visual-regression.ts` runs Playwright against the reference manifest, screenshots every route in every flavor × mode, diffs against the baseline. Any visual change requires a baseline update in the same PR. Baselines live in `.snapshots/` (git-tracked).

### 17.3 Component coverage report

`scripts/report-coverage.ts` generates a coverage report:

- How many components exist
- How many are registered
- How many are in the playground
- How many have SSR + schema + a11y + visual tests
- Any component missing any of the above is flagged

### 17.4 Dogfooding CI

`budget-fe` CI runs:

- `snapshot build` against `budget-fe`
- SSR render against every route
- End-to-end login flow against a mocked bunshot
- Lint: fail if `src/` contains any forbidden files
- Compare consumer manifest against a "minimum covered features" reference (every enterprise feature referenced at least once)

### 17.5 Exit criteria

- [ ] Reference manifest exists and covers every primitive
- [ ] Visual regression runs on every PR
- [ ] Coverage report passes 100%
- [ ] Dogfooding CI green
- [ ] A PR that breaks the default auth fragment visually fails CI with a screenshot diff

### 17.6 Files touched

- `playground/reference-manifest.json` — **new**
- `scripts/visual-regression.ts` — **new**
- `scripts/report-coverage.ts` — **new**
- `.snapshots/` — baseline screenshots
- `.github/workflows/ci.yml` — visual regression step
- `budget-fe/.github/workflows/ci.yml` — consumer CI

---

## 18. Parallelization & Sequencing

### 18.1 Track map

| Track | Phases | Owns files | Can run in parallel with |
|---|---|---|---|
| **Runtime** | 0, 1, 6, 8, 11 | `src/ui/manifest/app.tsx`, `src/ui/manifest/boot-builtins.ts`, `src/ui/context/**`, `src/vite/**` | Components after Phase 2 |
| **Compiler** | 2, 7 | `src/ui/manifest/schema.ts`, `src/ui/manifest/compiler.ts`, `src/ui/manifest/merge.ts`, `src/ui/manifest/defaults/**`, `src/ui/manifest/guard-registry.ts` | Components after Phase 2 |
| **Components** | 3, 4, 10 | `src/ui/components/**`, `src/ui/layouts/**`, `src/ui/icons/**` | Runtime after Phase 2 |
| **Actions** | 5 | `src/ui/actions/**`, `src/ui/expressions/**` | Everything |
| **CLI** | 9 | `src/cli/**`, `src/vite/**` (init-only) | Everything after Phase 2 |
| **CI** | 12 | `scripts/**`, `.github/**`, `playground/**` | Everything |

### 18.2 Hard dependencies

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12
         ↓
         (4 and 5 can run in parallel after 3)
         (7 can start as soon as 4 is partial — needs oauth-buttons, centered layout)
         (8, 9, 10 can run in parallel after 7)
         (11 after 9)
         (12 is last)
```

### 18.3 Branch strategy

- Each phase lands on its own branch: `spec/manifest-ui/phase-N-<title>`
- Phases merge to `main` in order
- No phase merges until its exit criteria pass
- CI must be green on every phase merge
- No amending merged commits; fix forward

### 18.4 Agent execution checklist

For an implementing agent picking up a phase:

1. Read `snapshot/CLAUDE.md`
2. Read `docs/engineering-rules.md`
3. Read this spec top to bottom
4. Read the phase section in detail
5. Read every file in the "Files touched" list
6. Implement the phase
7. Run `bun run typecheck && bun run format:check && bun run build && bun test`
8. Run the new lint scripts for the phase
9. Verify every exit criterion checkbox
10. Update JSDoc on every changed exported symbol
11. Update `docs/` for any user-visible change
12. Update `budget-fe` manifest if the phase unlocks new features (dogfooding)
13. Commit each pass separately
14. Push branch; do not merge

---

## 19. Definition of Done (whole spec)

This spec is done when all of the following are true on `main`:

**Code invariants:**
- [ ] `src/ui/manifest/auth.tsx` does not exist
- [ ] `grep -r "route\.id ===" src/ui/manifest/` returns zero hits
- [ ] `grep -r "resolveAuthScreen" src/` returns zero hits
- [ ] Token lint passes
- [ ] Escape-hatch lint passes
- [ ] Every component uses `extendComponentSchema`
- [ ] Every component has: schema test, rendering test, SSR test, a11y test, playground entry
- [ ] Every flavor passes contrast CI

**Consumer invariants:**
- [ ] `budget-fe/src/` does not contain any `.tsx`, `.ts`, or `.css` file (optional `custom-components.ts` only if needed)
- [ ] `budget-fe/snapshot.manifest.json` is the sole source of truth for budget-fe's behavior
- [ ] `budget-fe` login/register/forgot-password/mfa all work from the default auth fragment
- [ ] `budget-fe` dashboard renders with a beautiful sidebar, themed nav, working icons, stat cards, data table

**CI invariants:**
- [ ] Visual regression runs on every PR
- [ ] Dogfooding CI green
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` pass on `main`

**Documentation invariants:**
- [ ] `docs/getting-started.md` walks a new user through `snapshot init` → working app in under 5 minutes
- [ ] `docs/components.md` lists every component with a config example
- [ ] `docs/actions.md` lists every action with a config example
- [ ] `docs/auth.md` documents the manifest-only auth flow
- [ ] `docs/extending.md` documents the single escape hatch
- [ ] `docs/specs/manifest-only-ui.md` (this file) marked Phase 12 complete

---

## 20. Risks & Open Questions

### R1 — Performance of a fully reactive manifest runtime
Every from-ref is a Jotai subscription. A page with 500 components might create 500 atoms. Needs benchmarking as component library use grows. **Mitigation:** batch subscriptions per component, use selector atoms, measure with real consumer (`budget-fe` + stress manifest).

### R2 — SSR vs. runtime-only manifest sections
Fragments merge at compile time, but user-specific content (auth state, feature flags, realtime) resolves at runtime. The SSR boundary needs a clean "static compile + runtime bind" split. **Mitigation:** two-pass compile — static pass produces the serializable compiled manifest; runtime pass binds dynamic values on hydration. Covered in Phase 6 data binding work.

### R3 — Type safety for manifest authors
JSON gives no editor completion. **Mitigation:** generate a JSON Schema from the Zod schemas, publish at `@lastshotlabs/snapshot/schema.json`, point consumers at it via `"$schema"` in their manifest. Future: VS Code extension for hover docs + inline validation. Not in this spec's scope.

### R4 — Bundle size
Complete component library is heavy. **Mitigation:** tree-shaking via per-component entry points; `bootBuiltins()` only registers what the compiled manifest references (compile-time pruning). Vite plugin can inject a manifest-specific `bootBuiltins` during build that excludes unused components. Not in Phase 0; revisit in Phase 9.

### R5 — Migration path for existing apps
Not a concern per R8 — pre-production, no external consumers. `budget-fe` is the only consumer and migrates in lockstep. Each phase's exit criteria include a `budget-fe` smoke test.

### R6 — Where does truly custom CSS live?
**Answer:** nowhere. Tokens + per-instance overrides + custom components cover every case. If a real-world need surfaces that tokens can't express (specific animation keyframes, advanced pseudo-selectors), it becomes a component-level feature (`animation: "pulse"` as a token-driven option), not a CSS escape hatch. Revisit only if `budget-fe` surfaces a real need.

### R7 — Component sprawl
With 69 components already and more to add, risk of bloat. **Mitigation:** every new component must justify itself with a real use case from a real consumer. `budget-fe` drives the roadmap. No speculative primitives.

### R8 — OAuth URL contract with bunshot-auth
Current bespoke `auth.tsx` and bunshot-auth disagree on the OAuth URL shape. Phase 7 standardizes on `/auth/{provider}/start` and `/auth/{provider}/callback`. **Requires bunshot-auth change.** Track as a cross-repo dependency.

### R9 — Guard execution in SSR
Guards run before rendering a route. Under SSR, the guard must run during server rendering — it can read the request (cookies, headers) via the SSR bridge. **Mitigation:** guard signatures receive a context object that works in both client and server modes; current code already handles this for the existing route guards. Verify in Phase 7.

### R10 — Fragment merging edge cases
- Two fragments contributing routes with the same id — fragment merge order determines winner, currently last-wins.
- Fragment contributing `theme.overrides.colors.primary` while app sets it too — app wins, documented.
- App declaring `auth.screens: { login: false }` while providing no login route — login is simply absent; unauthenticated redirects to `/login` will 404. **Mitigation:** cross-reference validator warns (not errors) when a redirect target doesn't resolve to any route.

---

## 21. Explicit Non-Goals

The following are **intentionally out of scope** for this spec and should not creep in:

- **Visual drag-and-drop builder.** Downstream of having a complete manifest schema; separate product.
- **Community component marketplace.** Pre-production; internal only.
- **Backwards compatibility.** P8 in CLAUDE.md — no compat shims.
- **Code generation as the primary workflow.** `snapshot sync` generates an API client and infers resources from OpenAPI, but generated code is never hand-edited and never the source of truth.
- **RSC as a first-class mode.** Components are SSR-safe (pre-rendered + hydrated), but React Server Components as the primary rendering model is a potential future phase, not in this spec.
- **GraphQL as a data source.** REST + OpenAPI via bunshot is the canonical backend contract. GraphQL support is possible via `resources` with a custom client, but not built in.
- **Multi-tenant theming switcher UI.** Runtime theme switching exists via `set-theme`; building a ready-made "theme picker" component is out of scope.

---

## 22. Changelog

- **Draft v1 (2026-04-10)** — initial spec authored against audited state of `snapshot@main`. All phase definitions, exit criteria, file lists grounded in real code paths as of that commit.
