# Config-Driven Platform Completion - Canonical Spec

> **Status**
>
> | Phase | Title                                       | Status | Track             |
> | ----- | ------------------------------------------- | ------ | ----------------- |
> | 14-A  | Canonical Manifest + IR + Compiler Pipeline | Draft  | A - Core          |
> | 14-B  | Unified Component Definition Registry       | Draft  | A - Core          |
> | 14-C  | Resource Runtime                            | Draft  | B - Runtime       |
> | 14-D  | State Runtime                               | Draft  | B - Runtime       |
> | 14-E  | Workflow Engine                             | Draft  | B - Runtime       |
> | 14-F  | Route/Auth/Nav/Overlay Completion           | Draft  | C - Shell         |
> | 14-G  | Slots, Templates, Presentation System       | Draft  | C - Shell         |
> | 14-H  | Plugin Platform                             | Draft  | D - Extensibility |
> | 14-I  | CLI, Builder, Lint, Docs, Catalog Tooling   | Draft  | D - Extensibility |

---

## Vision

### The Problem

Snapshot already has a serious config-driven UI foundation, but it is still too easy for app
teams to fall out of config and back into React code:

- page shells are only partially manifest-native
- routing is still simplified at runtime
- `nav` and `auth` are ahead in schema compared to runtime usage
- data fetching is mostly component-local instead of resource-first
- component registration is split across runtime registry and schema registry
- actions are strong, but they are still a button-action system rather than a full workflow
  runtime
- component customization still leans on per-component schema fields, `className`, and
  `style`, instead of a shared composition/presentation system
- the extension story for "we are adding many more components" is not formal enough yet

That means Snapshot is currently "a manifest renderer with a lot of components" rather than
"a complete config platform for frontend apps."

### The After

Snapshot becomes a full config-first frontend platform:

- the app author writes a validated manifest, or uses a typed builder that compiles to that
  manifest
- the same canonical manifest IR powers runtime rendering, route generation, docs generation,
  schema tooling, and CLI sync output
- routes, auth, nav, overlays, resources, state, workflows, and page composition are
  first-class manifest sections
- components register definitions, not just renderers
- presets and macros compile into normal manifest IR instead of becoming runtime special cases
- the escape hatch for app teams is "install or build a plugin component" rather than "write
  React page code"

This spec interprets "99.999999999% config driven" as:

- app teams do not write app-specific React components for normal product work
- app teams do not write route glue, data orchestration code, or page shell code
- framework authors and plugin authors still write code, but app authors consume those
  capabilities through config only

---

## What Already Exists on Main

Audited from the current repository, not assumed.

### Core manifest/runtime foundation

- `src/create-snapshot.tsx`
  Adds `manifest` to `SnapshotConfig` consumption and exposes `ManifestApp` when present.
- `src/ui.ts`
  Exports the config-driven UI surface from `@lastshotlabs/snapshot/ui`.
- `src/ui/manifest/schema.ts`
  Defines the current manifest schema with `theme`, `globals`, `nav`, `auth`, and `pages`.
- `src/ui/manifest/app.tsx`
  Provides `ManifestApp`, injects tokens, creates snapshot instance, and renders via a
  simplified router.
- `src/ui/manifest/renderer.tsx`
  Provides `PageRenderer` and `ComponentRenderer`.
- `src/ui/manifest/component-registry.tsx`
  Maintains the runtime component registry plus the `custom` wrapper.
- `src/ui/manifest/types.ts`
  Defines `ManifestConfig`, `PageConfig`, `ComponentConfig`, and related manifest types.

### Action system

- `src/ui/actions/types.ts`
  Defines the current action union:
  `navigate`, `api`, `open-modal`, `close-modal`, `refresh`, `set-value`, `download`,
  `confirm`, `toast`.
- `src/ui/actions/executor.ts`
  Implements the runtime executor with sequential action handling and recursive success/error
  chains.
- Supporting files:
  `src/ui/actions/confirm.ts`, `src/ui/actions/modal-manager.ts`, `src/ui/actions/toast.ts`,
  `src/ui/actions/interpolate.ts`.

### Context and data binding

- `src/ui/context/types.ts`
  Defines `FromRef`, `AtomRegistry`, `GlobalConfig`, and app/page context props.
- `src/ui/context/providers.tsx`
  Creates `AppContextProvider` and `PageContextProvider`.
- `src/ui/context/hooks.ts`
  Implements publish/subscribe and ref resolution.

### Token system

- `src/ui/tokens/schema.ts`
  Defines theme schema, component token schema, and global token schema.
- `src/ui/tokens/resolve.ts`
  Resolves theme config to CSS custom properties and scoped component token CSS.
- `src/ui/tokens/flavors.ts`
  Defines built-in flavors.
- `src/ui/tokens/editor.ts`
  Provides runtime token editing helpers.

### Component library

- `src/ui/components/register.ts`
  Registers built-in component schemas and renderers.
- Current built-in registrations in `register.ts`: 65 component schemas.
- Current structural components in `src/ui/manifest/structural.tsx`:
  `row`, `heading`, `button`, `select`, `custom`.
- Current component families already present under `src/ui/components/`:
  data, forms, overlay, navigation, layout, content, communication, commerce, workflow.

### CLI and generation

- `src/cli/commands/manifest/init.ts`
  Generates starter manifest JSON.
- `src/cli/commands/manifest/validate.ts`
  Validates a manifest file against the runtime schema.
- `src/cli/sync.ts`
  Already includes:
  `readManifest()`, `generateThemeCss()`, `generateRouteFile()`, and `generateNavFile()`.
- `src/ui/presets/`
  Already exists with:
  `crud-page.ts`, `dashboard-page.ts`, `settings-page.ts`.

### Tests that already exist

- `src/ui/manifest/__tests__/`
- `src/ui/actions/__tests__/`
- `src/ui/context/__tests__/`
- `src/ui/tokens/__tests__/`
- `src/cli/__tests__/manifest-init.test.ts`
- `src/cli/__tests__/manifest-validate.test.ts`
- `src/cli/__tests__/sync-manifest.test.ts`

### What is partial today

- `ManifestApp` uses a simplified browser-path router in `src/ui/manifest/app.tsx`.
- `nav` and `auth` exist in schema, but runtime manifest rendering is still page-centric.
- `select` endpoint-backed options are explicitly deferred in `src/ui/manifest/structural.tsx`.
- component data fetching is shared but still endpoint-string oriented in
  `src/ui/components/_base/use-component-data.ts`.
- component registration is split:
  `registerComponentSchema()` in `src/ui/manifest/schema.ts`
  and `registerComponent()` in `src/ui/manifest/component-registry.tsx`.
- there is no canonical manifest IR yet; runtime schema, runtime config, and CLI codegen are
  still adjacent but not unified.

### What is missing entirely

- first-class `resources` section
- first-class `state` section beyond current `globals` plus implicit component publishing
- first-class `routes` section beyond `pages`
- first-class `navigation` section beyond `nav`
- reusable `overlays` section
- workflow control flow actions
- component definition metadata contract
- plugin registration contract
- manifest compiler pipeline and IR
- manifest lint/docs/catalog tooling

---

## Developer Context

### Build and test commands

From `package.json`:

```sh
bun run build
bun run typecheck
bun run test
bun run format
bun run format:check
```

### Key files

| Path                                            | What                                       | Lines |
| ----------------------------------------------- | ------------------------------------------ | ----- |
| `src/ui.ts`                                     | Public `/ui` entry surface                 | 523   |
| `src/create-snapshot.tsx`                       | Snapshot factory and `ManifestApp` wiring  | 459   |
| `src/ui/manifest/schema.ts`                     | Current manifest schema + schema registry  | 273   |
| `src/ui/manifest/app.tsx`                       | `ManifestApp` + simplified router          | 119   |
| `src/ui/manifest/renderer.tsx`                  | Page/component rendering                   | 93    |
| `src/ui/manifest/component-registry.tsx`        | Runtime component registry                 | 70    |
| `src/ui/components/register.ts`                 | Built-in component registration            | 447   |
| `src/ui/components/_base/use-component-data.ts` | Shared endpoint-bound component data hook  | 146   |
| `src/ui/actions/types.ts`                       | Current action types and schemas           | 256   |
| `src/ui/actions/executor.ts`                    | Current action runtime                     | 240   |
| `src/ui/context/providers.tsx`                  | App/page context providers                 | 121   |
| `src/ui/context/types.ts`                       | Binding and global state types             | 100   |
| `src/ui/tokens/schema.ts`                       | Theme/token schema                         | 240   |
| `src/ui/tokens/resolve.ts`                      | Theme/token CSS generation                 | 613   |
| `src/cli/sync.ts`                               | Current OpenAPI + manifest sync/generation | 1297  |

### How the consumer uses this today

#### Runtime-only manifest path

```tsx
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
import manifest from "./snapshot.manifest.json";

export function App() {
  return (
    <ManifestApp manifest={manifest} apiUrl={import.meta.env.VITE_API_URL} />
  );
}
```

#### Current manifest shape

```json
{
  "theme": {},
  "globals": {},
  "nav": [],
  "auth": {},
  "pages": {
    "/dashboard": {
      "layout": "sidebar",
      "title": "Dashboard",
      "content": [{ "type": "heading", "text": "Dashboard", "level": 1 }]
    }
  }
}
```

#### Current compile-time path

CLI sync can already read a manifest and generate:

- theme CSS
- route files
- nav file

But it does not compile from a canonical IR shared with runtime.

### How the consumer should use this after

#### Authoring path

```ts
import { defineManifest } from "@lastshotlabs/snapshot/ui";

export default defineManifest({
  app: { name: "Acme Admin", homeRoute: "/dashboard" },
  theme: { flavor: "neutral" },
  resources: {
    "users.list": {
      kind: "query",
      request: { method: "GET", url: "/api/users" },
    },
  },
  state: {
    "filters.userSearch": { scope: "route", default: "" },
  },
  routes: {
    dashboard: {
      path: "/dashboard",
      layout: "app.sidebar",
      body: [
        {
          type: "data.table",
          resource: "users.list",
        },
      ],
    },
  },
  navigation: {
    main: [{ label: "Dashboard", route: "dashboard" }],
  },
});
```

#### Runtime path

```tsx
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
import manifest from "./snapshot.manifest";

export function App() {
  return (
    <ManifestApp manifest={manifest} apiUrl={import.meta.env.VITE_API_URL} />
  );
}
```

#### Compile-time path

```sh
snapshot manifest compile
snapshot manifest lint
snapshot sync
```

---

## Non-Negotiable Engineering Constraints

These are mandatory. This spec does not override them.

1. `src/ui/` remains the boundary for config-driven UI code.
2. New UI runtime modules live under `src/ui/`, not inside domain SDK folders.
3. `createSnapshot()` remains the single factory for SDK instances.
4. New manifest/runtime logic does not become a singleton global.
5. `/ui` remains the public entry point for config-driven consumers.
6. CLI templates remain pure functions.
7. The action/resource/state/workflow runtimes do not import auth/community/webhooks domain
   modules directly; they use `ApiClient` and context.
8. No backwards-compat shims or barrels beyond entry-point surfaces.
9. No invented CSS variable names typed ad hoc in component files.
10. Any new token family must be declared centrally under `src/ui/tokens/` and emitted from the
    token pipeline, not handwritten in random components.
11. Docs and JSDoc ship with each phase.
12. Every new runtime module needs tests.
13. Specs must remove ambiguity; no `TBD`, no "choose later", no vague file ownership.
14. Preprod rule applies to manifests too: if the manifest shape is wrong, replace it. Do not
    introduce public manifest versioning, migration guides, or compatibility layers for
    hypothetical future apps.

### Explicit boundary decisions for this spec

- No new hook introduced by this spec lives inside `createSnapshot.tsx` unless it must capture
  factory-local SDK state.
- The new manifest compiler, resource runtime, state runtime, workflow runtime, and plugin
  system all live under `src/ui/`.
- `createSnapshot.tsx` may only change for:
  - public type surface updates
  - wiring additional manifest/runtime providers
  - exposing already-built runtime surfaces
- `src/ui.ts` must explicitly export every new public type, runtime module, and builder surface.

---

## Design Decisions

### Decision 1: Add a canonical manifest IR

**Recommendation:** yes.

Without an IR, runtime and CLI will continue to drift.

**What we gain**

- one normalization path
- one reshape path
- one place to lower authoring shorthand and presets
- compile/runtime parity

**What we give up**

- more upfront architectural work before shipping more surface area

### Decision 2: Keep JSON manifest authoring, but add a typed builder

**Recommendation:** yes.

JSON remains the interoperable artifact; TypeScript builder is a nicer authoring layer.
The builder compiles to the same schema and IR.

### Decision 3: Move from endpoint-in-component toward named resources

**Recommendation:** yes.

Inline endpoint strings remain as shorthand, but the canonical runtime model is resource-first.

### Decision 4: Replace split component registration with definition registration

**Recommendation:** yes.

The schema registry and runtime registry must be unified into a richer definition contract.

### Decision 5: Grow actions into a workflow engine

**Recommendation:** yes.

It is the only way to remove the remaining orchestration pressure that currently pushes app
authors back into code.

### Decision 6: Formalize a plugin system instead of relying on `custom`

**Recommendation:** yes.

`custom` stays, but it becomes a low-level platform hook. The normal extension path is
plugin-provided component definitions that still feel config-native to app authors.

### Decision 7: Add shared capability mixins for all components

**Recommendation:** yes.

This is the only scalable way to keep the manifest coherent while the library keeps growing.

---

## Canonical Target Model

### Canonical manifest

```ts
export interface ManifestConfig {
  $schema?: string;
  app: AppConfig;
  theme?: ThemeConfig;
  resources?: Record<string, ResourceConfig>;
  state?: Record<string, StateConfig>;
  routes: Record<string, RouteConfig>;
  navigation?: NavigationConfig;
  auth?: AuthConfig;
  overlays?: Record<string, OverlayConfig>;
  presets?: Record<string, PresetInvocation>;
  policies?: Record<string, PolicyConfig>;
  i18n?: I18nConfig;
}
```

### Canonical IR

```ts
export interface ManifestIR {
  app: ResolvedAppConfig;
  theme: ResolvedThemeConfig;
  resources: Record<string, ResourceNode>;
  state: Record<string, StateNode>;
  routes: Record<string, RouteNode>;
  navigation: ResolvedNavigationConfig;
  auth?: ResolvedAuthConfig;
  overlays: Record<string, OverlayNode>;
  policies: Record<string, PolicyNode>;
  catalogs: {
    components: Record<string, ManifestComponentDefinition>;
    presets: Record<string, PresetDefinition>;
    actions: Record<string, WorkflowActionDefinition>;
  };
  diagnostics: ManifestDiagnostic[];
}
```

### Manifest replacement rules

The compiler and runtime are built for the new manifest model. Replace the old top-level shape
instead of carrying the legacy surface forward:

| Current shape          | Canonical target                                          |
| ---------------------- | --------------------------------------------------------- |
| Replace this           | With this                                                 |
| `pages`                | `routes`                                                  |
| `nav`                  | `navigation.main`                                         |
| `globals`              | `state`                                                   |
| inline `data`/`submit` | named `resources` or compiler-lowered anonymous resources |
| `action` arrays        | workflow nodes                                            |
| ad hoc `custom` usage  | plugin/core definition registration                       |

---

## Core Type Contracts

These types are the contract for the implementation phases below.

### App

```ts
export interface AppConfig {
  name?: string;
  homeRoute?: string;
  notFoundRoute?: string;
  locale?: string;
  featureFlags?: Record<string, boolean>;
}
```

### Resource system

```ts
export type ResourceKind =
  | "query"
  | "mutation"
  | "subscription"
  | "upload"
  | "download"
  | "derived";

export interface ResourceRequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url?: string;
  params?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ResourceCacheConfig {
  key?: unknown[];
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  enabled?: boolean | FromRefLike;
}

export interface ResourceConfig {
  kind: ResourceKind;
  request?: ResourceRequestConfig;
  cache?: ResourceCacheConfig;
  source?: string | FromRefLike;
  derive?: DeriveConfig;
  select?: unknown;
  onSuccess?: WorkflowNode | WorkflowNode[];
  onError?: WorkflowNode | WorkflowNode[];
}
```

### State system

```ts
export type StateScope = "app" | "route" | "overlay" | "component" | "template";

export type StateKind =
  | "value"
  | "selection"
  | "form"
  | "derived"
  | "ephemeral";

export interface StateConfig {
  scope: StateScope;
  kind?: StateKind;
  default?: unknown;
  resource?: string;
  derive?: DeriveConfig;
  persist?: boolean;
}
```

### Workflows

```ts
export interface WorkflowBaseNode {
  type: string;
  id?: string;
  when?: ConditionConfig;
}

export interface WorkflowActionNode extends WorkflowBaseNode {
  input?: unknown;
  onSuccess?: WorkflowNode | WorkflowNode[];
  onError?: WorkflowNode | WorkflowNode[];
  finally?: WorkflowNode | WorkflowNode[];
}

export interface WorkflowBranchNode extends WorkflowBaseNode {
  type: "if" | "switch";
}

export type WorkflowNode = WorkflowActionNode | WorkflowBranchNode;
```

### Routes

```ts
export interface RouteConfig {
  path: string;
  title?: string;
  layout?: string;
  search?: Record<string, unknown>;
  params?: Record<string, unknown>;
  preload?: string[];
  guard?: string | ConditionConfig;
  breadcrumb?: string;
  body: ComponentNode[];
  head?: RouteHeadConfig;
}
```

### Navigation

```ts
export interface NavigationItemConfig {
  label: string;
  route?: string;
  href?: string;
  icon?: string;
  badge?: unknown;
  when?: ConditionConfig;
  children?: NavigationItemConfig[];
}

export interface NavigationConfig {
  main?: NavigationItemConfig[];
  secondary?: NavigationItemConfig[];
  commandPalette?: NavigationItemConfig[];
}
```

### Overlays

```ts
export interface OverlayConfig {
  type: "modal" | "drawer" | "sheet" | "popover" | "dialog";
  title?: unknown;
  body: ComponentNode[];
  size?: string;
  side?: "top" | "right" | "bottom" | "left";
}
```

### Component definitions

```ts
export interface ManifestComponentDefinition {
  type: string;
  version: number;
  displayName: string;
  category: string;
  schema: ZodType;
  defaults?: Record<string, unknown>;
  capabilities: ComponentCapability[];
  slots?: SlotDefinition[];
  events?: EventDefinition[];
  stateModel?: PublishedStateDefinition[];
  tokens?: ComponentTokenDefinition[];
  examples: ManifestExample[];
  replacements?: ComponentReplacement[];
  compile?: ComponentCompiler;
  render: ConfigDrivenComponent;
}
```

### Presets

```ts
export interface PresetDefinition {
  name: string;
  version: number;
  schema: ZodType;
  expand(input: unknown, ctx: PresetExpansionContext): PresetExpansionResult;
  examples: ManifestExample[];
}
```

```ts
export interface ComponentReplacement {
  from: string;
  to: string;
  reason?: string;
}
```

### Plugins

```ts
export interface SnapshotUiPlugin {
  name: string;
  version: string;
  register(registry: SnapshotUiRegistry): void;
}
```

### Shared utility types

```ts
export interface FromRefLike {
  from: string;
  transform?: string;
  transformArg?: string | number;
}

export interface DeriveConfig {
  from: string;
  transform?: string;
  args?: unknown;
}

export interface ConditionConfig {
  from?: string;
  equals?: unknown;
  notEquals?: unknown;
  in?: unknown[];
  truthy?: boolean;
  and?: ConditionConfig[];
  or?: ConditionConfig[];
  not?: ConditionConfig;
}
```

---

## File and Module Layout

This is the exact target module layout for the work in this spec.

### New runtime/compiler modules

```text
src/ui/
  compiler/
    index.ts
    types.ts
    reshape.ts
    defaults.ts
    presets.ts
    build-ir.ts
    __tests__/

  registry/
    index.ts
    components.ts
    presets.ts
    actions.ts
    plugins.ts
    types.ts
    __tests__/

  resources/
    index.ts
    types.ts
    registry.ts
    runtime.ts
    hooks.ts
    lowering.ts
    __tests__/

  state/
    index.ts
    types.ts
    registry.ts
    providers.tsx
    hooks.ts
    derive.ts
    __tests__/

  workflows/
    index.ts
    types.ts
    registry.ts
    engine.ts
    builtins.ts
    __tests__/

  routes/
    index.ts
    types.ts
    runtime.tsx
    guards.ts
    __tests__/

  overlays/
    index.ts
    types.ts
    registry.ts
    runtime.tsx
    __tests__/

  plugins/
    index.ts
    types.ts
```

### Existing files to evolve

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/types.ts`
- `src/ui/manifest/app.tsx`
- `src/ui/manifest/renderer.tsx`
- `src/ui/manifest/component-registry.tsx`
- `src/ui/components/register.ts`
- `src/ui/components/_base/use-component-data.ts`
- `src/ui/context/types.ts`
- `src/ui/context/providers.tsx`
- `src/ui/actions/types.ts`
- `src/ui/actions/executor.ts`
- `src/ui.ts`
- `src/cli/sync.ts`
- `src/cli/commands/manifest/init.ts`
- `src/cli/commands/manifest/validate.ts`

### Existing files this spec must not turn into dumping grounds

- `src/create-snapshot.tsx`
  No compiler or registry logic here.
- `src/ui.ts`
  Export surface only, not implementation dumping ground.
- `src/cli/sync.ts`
  Do not keep compiler logic here long-term. Move it into `src/ui/compiler/`.

---

## Token Usage Policy

This spec touches UI architecture, so token rules must be explicit.

### Current token policy that remains in force

- Existing global semantic token families remain canonical:
  `--sn-color-*`, `--sn-radius-*`, `--sn-spacing-*`, `--sn-font-*`,
  `--sn-shadow-*`, `--sn-duration-*`, `--sn-ease-*`, and the current scoped component token
  output from `src/ui/tokens/resolve.ts`.
- No component may invent raw CSS variable strings inline during implementation.

### New policy introduced by this spec

- Any new component-part token family must be declared as structured metadata in
  `src/ui/tokens/types.ts` and emitted centrally from `src/ui/tokens/resolve.ts`.
- The only allowed naming source for new CSS custom properties is the central token emitter.
- Component definitions describe token metadata; components consume emitted token names only.
- The plugin system may contribute token definitions, but those definitions are validated and
  emitted through the same central token pipeline.

### Practical implementation rule

If a future component wants tokens for table header padding, modal footer gap, or form error
color, the implementation must:

1. add token metadata centrally
2. add schema support centrally if needed
3. emit CSS variables centrally
4. consume those variables in the component

It may not just hardcode `--sn-table-header-padding` into a component file.

---

## Phase 14-A: Canonical Manifest + IR + Compiler Pipeline

### Goal

Create the canonical manifest authoring shape and a shared compiler pipeline that turns authoring
input into one resolved IR.

### API

#### New public authoring helper

```ts
import { defineManifest, compileManifest } from "@lastshotlabs/snapshot/ui";

const manifest = defineManifest({
  app: { name: "Acme Admin" },
  routes: {
    dashboard: {
      path: "/dashboard",
      body: [{ type: "heading", text: "Dashboard", level: 1 }],
    },
  },
});

const ir = compileManifest(manifest);
```

#### ManifestApp behavior

`ManifestApp` must call the compiler path first, then render from IR.

### Implementation

- Replace the old top-level manifest shape with the canonical manifest shape.
- Add canonical IR types.
- Add compiler steps:
  parse -> validate -> reshape -> defaults -> preset expansion -> IR.
- `ManifestApp` uses `compileManifest()` before rendering.
- CLI `readManifest()` must reuse the same compiler entry.

### Files to create

- `src/ui/compiler/index.ts`
- `src/ui/compiler/types.ts`
- `src/ui/compiler/reshape.ts`
- `src/ui/compiler/defaults.ts`
- `src/ui/compiler/presets.ts`
- `src/ui/compiler/build-ir.ts`
- `src/ui/compiler/__tests__/reshape.test.ts`
- `src/ui/compiler/__tests__/build-ir.test.ts`

### Files to modify

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/types.ts`
- `src/ui/manifest/app.tsx`
- `src/ui.ts`
- `src/cli/sync.ts`
- `src/cli/commands/manifest/validate.ts`

### Export rules

- `compileManifest`, `defineManifest`, `manifestSchema`, `ManifestConfig`, and `ManifestIR`
  export from `src/ui.ts`.
- None of these export from `src/index.ts`.

### Documentation impact

- Update `docs/getting-started.md`
- Update `docs/vision.md`
- Update `docs/specs/config-driven-ui-foundation.md`
- Add compiler/IR notes to `docs/components.md`

### Tests

- compiler unit tests under `src/ui/compiler/__tests__/`
- update `src/ui/manifest/__tests__/schema.test.ts`
- update `src/cli/__tests__/sync-manifest.test.ts`
- add compiler tests proving shorthand authoring input lowers correctly

### Exit criteria

- CLI compile path and runtime compile path share the same compiler entry
- presets and shorthands compile away before render
- no route or page rendering path reads raw manifest authoring input directly after compile
- the old top-level `pages`/`nav`/`globals` shape is removed from the canonical manifest

---

## Phase 14-B: Unified Component Definition Registry

### Goal

Replace split schema/runtime registration with a unified definition registry for components,
presets, and workflow actions.

### API

```ts
import {
  registerComponentDefinition,
  getComponentDefinition,
  getRegisteredComponentDefinitions,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Introduce `src/ui/registry/` as the canonical registration surface.
- Convert current `registerComponentSchema()` and `registerComponent()` usage into unified
  definition registration.
- Move built-in component metadata into definitions.
- Remove the split registration model. There is one registry after this phase.

### Files to create

- `src/ui/registry/index.ts`
- `src/ui/registry/components.ts`
- `src/ui/registry/presets.ts`
- `src/ui/registry/actions.ts`
- `src/ui/registry/types.ts`
- `src/ui/registry/__tests__/components.test.ts`

### Files to modify

- `src/ui/manifest/component-registry.tsx`
- `src/ui/manifest/schema.ts`
- `src/ui/components/register.ts`
- `src/ui/manifest/renderer.tsx`
- `src/ui.ts`

### Cutover rule

This phase does not require rewriting every component implementation in one shot, but it does
require cutting over to one registry contract:

- built-in registration calls are rewritten to emit definition objects
- richer metadata can still be added incrementally after the cutover

### Documentation impact

- Update `docs/components.md`
- Update `docs/customization.md`
- Add registry/definition examples to `docs/getting-started.md`

### Tests

- registry introspection tests
- manifest validation tests using unified registry

### Exit criteria

- one canonical registry can answer:
  renderer, schema, defaults, capabilities, slots, examples
- runtime render path does not read from a separate ad hoc component map
- manifest validation path does not maintain a separate concept of "known component types"

---

## Phase 14-C: Resource Runtime

### Goal

Introduce first-class named resources and move component data semantics onto that system.

### API

```ts
import {
  useResource,
  useMutationResource,
  resourceConfigSchema,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Add `resources` manifest section and schema.
- Build resource registry/provider/runtime under `src/ui/resources/`.
- Introduce named query and mutation execution.
- Lower component inline `data`, `submit`, and request config into anonymous resources during
  compilation.
- Replace `useComponentData()` internals with the resources runtime.

### Files to create

- `src/ui/resources/index.ts`
- `src/ui/resources/types.ts`
- `src/ui/resources/registry.ts`
- `src/ui/resources/runtime.ts`
- `src/ui/resources/hooks.ts`
- `src/ui/resources/lowering.ts`
- `src/ui/resources/__tests__/runtime.test.ts`
- `src/ui/resources/__tests__/lowering.test.ts`

### Files to modify

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/types.ts`
- `src/ui/manifest/app.tsx`
- `src/ui/components/_base/use-component-data.ts`
- `src/ui/actions/executor.ts`
- `src/ui.ts`

### Explicit design rules

- Resource runtime lives under `src/ui/resources/`; it does not live inside TanStack Query
  hooks generated by `createSnapshot`.
- It consumes the `ApiClient` from `SnapshotApiContext`.
- Resource caching semantics may use TanStack Query under the hood, but the public authoring
  model is resource-first, not query-hook-first.

### Documentation impact

- Add `docs/resources.md`
- Update `docs/actions.md`
- Update `docs/data-binding.md`
- Update `docs/getting-started.md`

### Tests

- query resource execution tests
- mutation resource execution tests
- compiler lowering tests for inline component data -> anonymous resource
- resource invalidation tests

### Exit criteria

- a route can preload named resources
- a component can bind to a named resource without embedding endpoint strings
- current inline endpoint strings still work through lowering
- no new component introduced after this phase uses bespoke request semantics if a resource
  binding would fit

---

## Phase 14-D: State Runtime

### Goal

Introduce first-class named state definitions that subsume current `globals` plus implicit
component publishing.

### API

```ts
import {
  useStateValue,
  useSetStateValue,
  stateConfigSchema,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Add `state` section to the manifest.
- Add `state` section to the manifest.
- Build named state registry/providers under `src/ui/state/`.
- Preserve existing `id` and `{ from: "..." }` pattern by compiling component publishing into
  named state bindings.
- Unify app/route/overlay scopes.
- Add derived state support.

### Files to create

- `src/ui/state/index.ts`
- `src/ui/state/types.ts`
- `src/ui/state/registry.ts`
- `src/ui/state/providers.tsx`
- `src/ui/state/hooks.ts`
- `src/ui/state/derive.ts`
- `src/ui/state/__tests__/providers.test.tsx`
- `src/ui/state/__tests__/derive.test.ts`

### Files to modify

- `src/ui/context/types.ts`
- `src/ui/context/providers.tsx`
- `src/ui/context/hooks.ts`
- `src/ui/manifest/app.tsx`
- `src/ui/manifest/renderer.tsx`
- `src/ui/actions/executor.ts`
- `src/ui.ts`

### Explicit design rules

- Replace the current context internals with the new state runtime.
- Keep public hook names only if they remain the right canonical names after the rewrite.
- Do not preserve parallel state systems.

### Documentation impact

- Update `docs/data-binding.md`
- Add `docs/state.md`
- Update `docs/getting-started.md`

### Tests

- app-scope state persistence tests
- route-scope reset-on-navigation tests
- derived state tests
- state binding tests for the canonical publish/subscribe hooks that remain after the rewrite

### Exit criteria

- current globals can compile into state definitions
- component publishing is modeled as state, not as a separate parallel concept
- workflow engine can read and write named state targets

---

## Phase 14-E: Workflow Engine

### Goal

Expand the current action executor into a typed workflow engine that can express common product
logic without app-authored React.

### API

```ts
import {
  runWorkflow,
  workflowNodeSchema,
  registerWorkflowAction,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Replace the current action vocabulary implementation with workflow-native action definitions.
- Add control-flow nodes:
  `if`, `switch`, `parallel`, `return`.
- Add state/resource-oriented nodes:
  `run-query`, `run-mutation`, `invalidate-resource`, `set-state`, `patch-state`,
  `reset-state`.
- Update component event fields to point at workflow nodes rather than ad hoc action arrays.
- Keep string interpolation behavior, but move it under workflow utilities.

### Files to create

- `src/ui/workflows/index.ts`
- `src/ui/workflows/types.ts`
- `src/ui/workflows/registry.ts`
- `src/ui/workflows/engine.ts`
- `src/ui/workflows/builtins.ts`
- `src/ui/workflows/__tests__/engine.test.ts`
- `src/ui/workflows/__tests__/builtins.test.ts`

### Files to modify

- `src/ui/actions/types.ts`
- `src/ui/actions/executor.ts`
- `src/ui/actions/index.ts`
- `src/ui/manifest/schema.ts`
- `src/ui.ts`

### Explicit design rules

- Do not add a second separate runtime. The current action executor evolves into the workflow
  engine.
- Existing public action names may remain only if they are still the right canonical API.
- Do not keep a parallel "legacy actions" system.

### Documentation impact

- Update `docs/actions.md`
- Add `docs/workflows.md`
- Update `docs/components.md` event examples

### Tests

- sequential workflow tests
- branching tests
- resource mutation + success/error/finally tests
- state mutation tests
- workflow tests covering the canonical action shapes shipped after the rewrite

### Exit criteria

- the platform can represent normal CRUD orchestration without custom React callback code
- current action configs still work
- workflow runtime is registry-backed and extensible for plugins

---

## Phase 14-F: Route/Auth/Nav/Overlay Completion

### Goal

Make route shell, auth, nav, and reusable overlay behavior fully manifest-native at runtime and
compile time.

### API

```ts
import {
  routeConfigSchema,
  navigationConfigSchema,
  authConfigSchema,
  overlayConfigSchema,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Add `routes`, `navigation`, and `overlays` sections.
- Replace the simplified browser-path router in `src/ui/manifest/app.tsx`.
- Add route guards powered by auth/policy/state conditions.
- Add reusable overlay registry so workflows can open named overlay definitions without
  embedding their content inline everywhere.
- Replace `pages`, `nav`, and inline modal/drawer patterns with route/navigation/overlay
  sections.

### Files to create

- `src/ui/routes/index.ts`
- `src/ui/routes/types.ts`
- `src/ui/routes/runtime.tsx`
- `src/ui/routes/guards.ts`
- `src/ui/routes/__tests__/runtime.test.tsx`
- `src/ui/overlays/index.ts`
- `src/ui/overlays/types.ts`
- `src/ui/overlays/registry.ts`
- `src/ui/overlays/runtime.tsx`
- `src/ui/overlays/__tests__/runtime.test.tsx`

### Files to modify

- `src/ui/manifest/app.tsx`
- `src/ui/manifest/schema.ts`
- `src/ui/manifest/types.ts`
- `src/ui/manifest/renderer.tsx`
- `src/ui/actions/executor.ts`
- `src/cli/sync.ts`
- `src/ui.ts`

### Explicit design rules

- This phase does not move routing into `createSnapshot.tsx`.
- Runtime routing stays in `/ui` and uses manifest IR.
- CLI route generation must use the same route IR nodes consumed by runtime.

### Documentation impact

- Update `docs/getting-started.md`
- Update `docs/vision.md`
- Add `docs/routing.md`
- Add `docs/navigation.md`
- Add `docs/auth-config.md`
- Add `docs/overlays.md`

### Tests

- route matching tests
- route guard tests
- nav visibility tests
- overlay registry tests
- sync route generation tests from route IR

### Exit criteria

- runtime route selection is no longer the current simplified browser-path lookup
- nav and auth are truly runtime-driven from manifest IR
- overlays can be defined once and reused across routes and workflows

---

## Phase 14-G: Slots, Templates, Presentation System

### Goal

Introduce the shared composition and customization model needed to keep the platform coherent
as more components are added.

### API

```ts
import {
  slotDefinitionSchema,
  templateNodeSchema,
  presentationConfigSchema,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Introduce slots as a first-class component capability.
- Introduce repeater/template semantics.
- Introduce presentation metadata:
  variants, parts, states, responsive presentation overrides.
- Add component-definition-driven token metadata for parts.
- Update complex built-in components incrementally to declare parts and slots.

### Files to create

- `src/ui/registry/__tests__/slots.test.ts`
- `src/ui/compiler/__tests__/templates.test.ts`
- `src/ui/manifest/template-schema.ts`
- `src/ui/manifest/presentation-schema.ts`

### Files to modify

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/types.ts`
- `src/ui/manifest/renderer.tsx`
- `src/ui/tokens/types.ts`
- `src/ui/tokens/schema.ts`
- `src/ui/tokens/resolve.ts`
- `src/ui/components/register.ts`
- selected component definition files as they are migrated
- `src/ui.ts`

### Explicit design rules

- This phase must not require every component to be rewritten at once.
- Begin by upgrading structural components and a small set of complex reference components:
  `data-table`, `form`, `modal`, `drawer`, `tabs`.
- Presentation metadata belongs in definitions, not in random renderer helpers.

### Documentation impact

- Update `docs/components.md`
- Update `docs/customization.md`
- Add `docs/templates.md`
- Add `docs/presentation.md`

### Tests

- slot validation tests
- template expansion tests
- part token emission tests
- migrated component rendering tests

### Exit criteria

- the platform has a shared model for slots, templates, and presentation
- at least the reference components above prove the model works end-to-end
- future components can adopt the same capability mixins instead of inventing new schema shapes

---

## Phase 14-H: Plugin Platform

### Goal

Make extension first-class so the component library can grow without forcing app teams back
into code.

### API

```ts
import {
  defineSnapshotUiPlugin,
  registerPlugin,
} from "@lastshotlabs/snapshot/ui";
```

### Implementation

- Add plugin registration surface.
- Plugins may contribute component definitions, preset definitions, workflow actions, and token
  metadata.
- Add namespacing rules for plugin-contributed types.
- Add plugin validation.

### Files to create

- `src/ui/plugins/index.ts`
- `src/ui/plugins/types.ts`
- `src/ui/registry/plugins.ts`
- `src/ui/registry/__tests__/plugins.test.ts`

### Files to modify

- `src/ui/registry/index.ts`
- `src/ui.ts`

### Explicit design rules

- Plugins integrate with the same registry contracts as core; there is no "second plugin API".
- Plugin components must be manifest-native. They do not get a special rendering loophole.

### Documentation impact

- Add `docs/plugins.md`
- Update `docs/components.md`
- Update `docs/customization.md`

### Tests

- plugin registration tests
- plugin component definition resolution tests
- plugin workflow action registration tests
- plugin preset expansion tests

### Exit criteria

- a plugin package can add a namespaced component without touching core code
- app authors can use plugin components entirely through manifest config

---

## Phase 14-I: CLI, Builder, Lint, Docs, Catalog Tooling

### Goal

Turn the manifest into a first-class platform API with tooling strong enough for large-scale
authoring.

### API

```sh
snapshot manifest init
snapshot manifest validate
snapshot manifest lint
snapshot manifest compile
snapshot manifest docs
snapshot sync
```

### Implementation

- Add `defineManifest()` builder helper and typed authoring utilities.
- Add manifest linting for:
  unknown routes, duplicate state/resource ids, impossible refs, bad plugin namespaces,
  removed fields, unreachable overlays, and incompatible slot usage.
- Add docs/catalog generation from registry metadata.
- Add JSON Schema generation from component and preset definitions.

### Files to create

- `src/cli/commands/manifest/lint.ts`
- `src/cli/commands/manifest/compile.ts`
- `src/cli/commands/manifest/docs.ts`
- `src/cli/manifest-docs.ts`
- `src/cli/manifest-lint.ts`
- `src/cli/manifest-compile.ts`
- tests under `src/cli/__tests__/`

### Files to modify

- `src/cli/commands/manifest/init.ts`
- `src/cli/commands/manifest/validate.ts`
- `src/cli/sync.ts`
- `src/ui.ts`

### Explicit design rules

- CLI compile/lint/docs commands all consume the same compiler/registry code from `src/ui/`.
- CLI docs/catalog generation must not duplicate registry logic.

### Documentation impact

- Update `README.md`
- Update `docs/getting-started.md`
- Update `docs/spec-process.md` if spec authoring guidance changes because of the new builder
  or catalog system

### Tests

- manifest lint command tests
- manifest compile command tests
- manifest docs command tests
- builder helper type tests where feasible

### Exit criteria

- app authors can author with JSON or builder APIs
- manifest docs/catalog can be generated from the registry
- linting catches common authoring failures before runtime

---

## Current Gaps Mapped to Phases

| Gap                                            | Phase |
| ---------------------------------------------- | ----- |
| No canonical IR                                | 14-A  |
| Split runtime/schema registration              | 14-B  |
| No named resources                             | 14-C  |
| No first-class state section                   | 14-D  |
| Action system too small for full orchestration | 14-E  |
| Simplified router and partial shell runtime    | 14-F  |
| No shared slot/template/presentation model     | 14-G  |
| No formal plugin contract                      | 14-H  |
| Weak authoring/docs/lint tooling               | 14-I  |

---

## Parallelization and Sequencing

### Track overview

#### Track A - Core

Owns:

- `src/ui/compiler/**`
- `src/ui/registry/**`
- `src/ui/manifest/schema.ts`
- `src/ui/manifest/types.ts`
- `src/ui/components/register.ts`
- `src/ui.ts`

Phases:

- 14-A
- 14-B

#### Track B - Runtime

Owns:

- `src/ui/resources/**`
- `src/ui/state/**`
- `src/ui/workflows/**`
- `src/ui/components/_base/use-component-data.ts`
- `src/ui/actions/**`
- `src/ui/context/**`
- `src/ui.ts`

Phases:

- 14-C
- 14-D
- 14-E

#### Track C - Shell

Owns:

- `src/ui/routes/**`
- `src/ui/overlays/**`
- `src/ui/manifest/app.tsx`
- `src/ui/manifest/renderer.tsx`
- `src/ui/tokens/**`
- selected component definition rewrites
- `src/ui.ts`

Phases:

- 14-F
- 14-G

#### Track D - Extensibility

Owns:

- `src/ui/plugins/**`
- `src/cli/commands/manifest/**`
- CLI docs/catalog plumbing
- high-level docs updates
- `src/ui.ts`

Phases:

- 14-H
- 14-I

### Dependency rules

| Phase | Depends on       |
| ----- | ---------------- |
| 14-A  | none             |
| 14-B  | 14-A             |
| 14-C  | 14-A             |
| 14-D  | 14-A, 14-C       |
| 14-E  | 14-C, 14-D       |
| 14-F  | 14-A, 14-B       |
| 14-G  | 14-B, 14-F       |
| 14-H  | 14-B, 14-E       |
| 14-I  | 14-A, 14-B, 14-H |

### Parallelizable combinations

- 14-B and 14-C may run in parallel after 14-A stabilizes
- 14-F may begin after 14-A plus minimal 14-B registry contracts are in place
- 14-H may begin after 14-B registry contracts are stable, without waiting for full shell
  completion

### Non-parallelizable combinations

- 14-D must not start before 14-C resource contracts settle
- 14-E must not fork its own state/resource model
- 14-I must not invent a second compiler entry

### Branch strategy

- one branch per phase by default
- branch prefix: `codex/phase-14-a-*`, `codex/phase-14-b-*`, etc.
- do not merge tracks together until dependent phases are green
- review after each phase, not only at the end

### Agent execution checklist

1. Read `docs/engineering-rules.md`
2. Read this spec fully
3. Read the current files listed in the phase being implemented
4. Confirm file ownership for the track
5. Implement one phase only
6. Run phase tests plus full required commands
7. Update JSDoc and docs listed for that phase
8. Commit and push branch
9. Open for review before starting dependent phases

---

## Risks and Mitigations

### Risk 1: IR becomes a second source of truth rather than the source of truth

**Mitigation**

- runtime and CLI both consume `compileManifest()`
- raw manifest objects are not read directly after compile

### Risk 2: Components keep inventing bespoke fields

**Mitigation**

- capability mixin rules are enforced in registry review
- new components must declare capabilities and metadata

### Risk 3: Plugin API diverges from core component API

**Mitigation**

- plugins register through the same registry contracts as core
- no separate plugin-only renderer or schema bypass

### Risk 4: Token chaos from part-level customization

**Mitigation**

- token metadata is centralized in `src/ui/tokens/`
- no ad hoc CSS variable strings in component files

### Risk 5: Incremental implementation drifts back into compatibility thinking

**Mitigation**

- delete the wrong public shape instead of carrying it forward
- cut over to one registry/runtime per concern
- allow incremental internal refactors only when they are moving toward the final shape

---

## Definition of Done

### Per-phase completion checks

For every phase:

```sh
bun run typecheck
bun run format:check
bun run build
bun run test
```

### Per-phase code checks

- all new files live in the exact paths listed for the phase
- all new public exports are added to `src/ui.ts`
- no implementation logic is dumped into `src/ui.ts`
- no compiler logic is dumped into `src/create-snapshot.tsx`
- no direct domain SDK imports are introduced into UI runtime modules where `ApiClient`
  should be used

### Per-phase documentation checks

- JSDoc added to new exported symbols
- docs pages listed for the phase updated or created
- examples in docs match the actual manifest shape shipped in code

### Full-completion checks

Snapshot meets the target of this spec when:

- a realistic admin app can be built with no app-authored React components
- a realistic product app can be built with no app-authored route/data/orchestration code
- runtime and CLI share one compiler entry and one IR
- route, auth, nav, overlays, resources, state, and workflows are all manifest-native
- core and plugin components use the same definition contract
- future component growth goes through capability mixins and registry definitions, not ad hoc
  schema invention

---

## Immediate Design Guidance

Until all phases land, every new UI/platform change should be judged by this question:

> Does this make Snapshot more like a real config platform with shared semantics and one
> canonical manifest pipeline, or does it quietly push application logic back into code?

If the answer is "back into code", reject the design and refactor it before shipping.
