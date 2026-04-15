# Shared Frontend Contract And Platform Separation - Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | 0 | Snapshot-Safe Bootstrap | Completed | Snapshot + Contract |
> | 1 | Canonical Shared Contract Boundary | In progress | Contract |
> | 2 | Snapshot Rebased On Shared Contract | In progress | Snapshot |
> | 3 | Pocketshot Manifest Runtime Rebuilt On Shared Contract | In progress | Pocketshot Runtime |
> | 4 | Native Universal Styling Runtime | Not started | Pocketshot UI |
> | 5 | Pocketshot Component Library Rebased On Shared Contract | In progress | Pocketshot UI |
> | 6 | CLI, Fixtures, And Contract Proofs | In progress | Tooling + Tests |
>
> **Priority:** P0
>
> **Product bar:** Snapshot and Pocketshot are peer runtimes over one canonical frontend contract. Neither package is allowed to own cross-platform concepts that belong in the shared contract package.

> **Execution Snapshot - 2026-04-14**
>
> The work is no longer theoretical:
>
> - `../frontend-contract` now exists and both Snapshot and Pocketshot are wired to it with a local file dependency.
> - The shared package already owns ref contracts, manifest shared sections, env/resources/actions/i18n/policies/state/workflows contracts, and Snapshot's token contract surface.
> - Snapshot already imports/re-exports multiple shared contract surfaces while keeping its current runtime/compiler behavior intact.
> - Pocketshot already consumes shared manifest section types, shared ref types/guards/schemas, and its component schema layer now uses the shared `fromRefSchema` instead of local copies.
> - Pocketshot's `resolveFromRef()` now honors nested paths and shared transforms, which closes a real contract/runtime mismatch.
> - Shared-package typecheck/test/build are passing. Pocketshot contract-level validation is currently done with targeted tests and import-smoke checks because the repo's broader RN dependency/type baseline is still incomplete in this workspace.

---

## Read This First

If an implementation agent reads nothing else before starting, these are the decisions that matter:

1. Create a new sibling repo/package at `../frontend-contract` with package name `@lastshotlabs/frontend-contract`.
2. Snapshot and Pocketshot both depend on that package. Pocketshot does not depend on Snapshot.
3. Start additively. Do not rip ownership out of Snapshot first.
4. Phase 0 is the only phase where duplicate contract ownership is allowed, and only while the same surface is being extracted and re-exported safely.
5. After Phase 0, the shared contract package becomes the only allowed owner of cross-platform frontend semantics.
6. Snapshot remains the web runtime. Pocketshot remains the native runtime.
7. The final state does remove duplicate contract ownership. The initial state does not.

---

## Terminology Rule

This spec uses these terms with strict meanings:

- `shared contract package`: the new sibling repo at `../frontend-contract`, published as `@lastshotlabs/frontend-contract`
- `contract`: cross-platform semantics such as manifest schema, actions, resources, workflows, state, policies, i18n, tokens, and canonical component metadata
- `runtime`: platform execution code that mounts, routes, renders, styles, and integrates with browser or native APIs
- `Snapshot runtime`: the web runtime package
- `Pocketshot runtime`: the native runtime package

If a piece of code touches browser-only APIs, React Native APIs, router mounting, CSS emission, native style projection, or platform overlays, it is runtime code, not contract code.

---

## Workspace Assumptions

This spec is written for the workspace layout that exists today:

- `../snapshot` is the web runtime repo
- `../pocketshot` is the native runtime repo
- `../frontend-contract` does not exist yet and must be created as a new sibling repo

The shared package is therefore not created inside Snapshot. It is created as its own package/repo so that both Snapshot and Pocketshot consume the same source directly.

During implementation, wire both consumers to the local package with a file dependency:

```json
"@lastshotlabs/frontend-contract": "file:../frontend-contract"
```

Do not hide the shared contract inside `snapshot/packages/**` and then treat Pocketshot as a special-case consumer. That recreates the wrong ownership boundary.

---

## Duplicate Ownership Rule

This is the shortest way to think about sequencing:

- Phase 0: duplicate contract ownership is temporarily allowed while extraction/re-export wiring is being stood up safely
- Phase 1 and later: duplicate contract ownership is no longer allowed as an end state
- Final architecture: the shared contract package is the only owner of cross-platform semantics

The spec is therefore additive first, corrective second.

---

## Vision

### Before

Snapshot is already the canonical frontend platform in practice, but its cross-platform contract still lives inside the web package. Pocketshot has a strong native SDK and a large native component library, but its manifest/runtime layer is materially behind Snapshot and its design-system abstractions do not yet align with Snapshot's universal styling model.

This creates the wrong architecture:

- Snapshot implicitly acts like the parent package.
- Pocketshot duplicates or approximates concepts that Snapshot already defines more completely.
- Shared concepts such as manifest structure, actions, resources, workflows, state, token vocabulary, and component metadata do not have one enforced source of truth.
- The codebase is at risk of ending up with two similar but incompatible declarative platforms.

### After

There is one canonical frontend contract and two platform runtimes.

- `@lastshotlabs/frontend-contract` is the only owner of cross-platform frontend semantics.
- `@lastshotlabs/snapshot` is the web runtime.
- `@lastshotlabs/pocketshot` is the native runtime.
- Snapshot and Pocketshot are peers. Pocketshot does not depend on Snapshot.
- There is one correct contract. Wrong shapes are deleted outright. Both packages are pre-production and may replace incorrect surfaces outright.

The shared contract package owns:

- manifest schema and compiler
- action vocabulary
- resources model
- workflows model and engine
- state, policies, and i18n semantics
- canonical token vocabulary and flavor definitions
- component metadata, canonical type names, slots, and runtime states

The platform runtimes own:

- Snapshot: DOM, CSS variables, SSR/RSC, browser routing, browser overlays, web-only UX
- Pocketshot: Expo Router, React Native styles, safe area, keyboard handling, bottom sheets, biometrics, deep links, native push, offline/device behavior

---

## Success Statement

When this spec is complete, a single manifest fixture can be compiled by `@lastshotlabs/frontend-contract`, mounted by Snapshot as a browser app, mounted by Pocketshot as a native app, and produce the same manifest semantics, action semantics, workflow semantics, token semantics, and component metadata semantics without either runtime importing the other.

The end state is not "similar architecture." The end state is one contract package and two runtime packages.

---

## Explicit Non-Goals

The following are not part of this spec and must not be treated as hidden requirements:

- preserving old package boundaries
- keeping temporary aliases as public contract
- building a browser runtime inside Pocketshot
- building a React Native runtime inside Snapshot
- solving every platform-specific UX difference by forcing identical rendering
- creating a monorepo inside `snapshot`
- waiting for all Snapshot styling work to fully land before starting shared-contract extraction

---

## Execution Decision

You do not wait for Snapshot to finish every in-flight styling change before starting this program.

Start now, with a hard boundary between work that is already stable enough to extract and work that still needs the final pass on the Snapshot side.

Work that can start immediately:

- shared-contract package creation
- manifest schema/compiler extraction
- actions/resources/workflows/state/policies/i18n extraction
- token vocabulary and flavor boundary definition
- Pocketshot native manifest runtime scaffolding
- Pocketshot runtime deletion plan for wrong abstractions

Work that should track the final Snapshot styling cutover closely but does not block the rest:

- final shared-contract component metadata surface
- final shared slot/state catalog
- final native universal styling parity fixtures
- full Pocketshot component-library rebasing

The last roughly 15 Snapshot components are not a reason to delay Phase 1 or Phase 3. They only limit when the component contract can be declared complete and frozen.

---

## Implementation Order In One Minute

The execution order is:

1. Create `../frontend-contract`.
2. Wire Snapshot to resolve `@lastshotlabs/frontend-contract`.
3. Extract contract code additively while Snapshot keeps its current runtime intact.
4. Make Snapshot import and re-export shared contract surfaces.
5. Stop allowing duplicate contract ownership.
6. Rebuild Pocketshot manifest/runtime/styling against the shared contract package.
7. Prove parity with shared fixtures and package-local checks.

If an implementation plan starts by deleting Snapshot-owned contract code before the shared contract package exists and compiles, it is out of order.

---

## What Already Exists On Main

### Snapshot

Audited in this repo:

- [docs/vision.md](../vision.md) defines Snapshot as a manifest-first frontend platform, not just a web component library.
- [src/ui/manifest/schema.ts](../../src/ui/manifest/schema.ts) already owns a large manifest contract: `routes`, `navigation`, `state`, `clients`, `resources`, `workflows`, `overlays`, `policies`, `i18n`, `subApps`, `auth`, `realtime`.
- [src/ui/manifest/compiler.ts](../../src/ui/manifest/compiler.ts) already compiles and validates the manifest and expands presets.
- [src/ui/manifest/resources.ts](../../src/ui/manifest/resources.ts), [src/ui/workflows/types.ts](../../src/ui/workflows/types.ts), and [src/ui/state/types.ts](../../src/ui/state/types.ts) already define stable cross-platform semantics.
- [src/ui/tokens/](../../src/ui/tokens) already defines the canonical web token vocabulary and flavor model.
- [src/ui/manifest/index.ts](../../src/ui/manifest/index.ts) exports a large public manifest/runtime surface from inside Snapshot.
- [src/ui/components/_base/schema.ts](../../src/ui/components/_base/schema.ts) and [src/ui/components/_base/style-surfaces.ts](../../src/ui/components/_base/style-surfaces.ts) already define the universal style-prop and surface-resolution direction.

Current state of the styling cutover:

- [docs/specs/universal-item-styling.md](./universal-item-styling.md) still says the full cutover is not complete.
- The live worktree shows active cutover work across 41 files, heavily concentrated in schemas and components moving to `extendComponentSchema`, `slotsSchema`, and `resolveSurfacePresentation`.
- Developer context for this spec: Snapshot is close to completion on the component cutover, with roughly 15 components left. This spec treats that as near-term and does not wait for total completion before starting shared-contract work.

### Pocketshot

Audited in the sister repo at `../pocketshot`:

- [src/create-pocketshot.tsx](../../../pocketshot/src/create-pocketshot.tsx) already provides a strong native SDK factory with auth, community, webhooks, device, push, offline, organizations, permissions, search, upload, haptics, deep links, sharing, and app-state integration.
- [docs/spec-pocketshot-2.0.md](../../../pocketshot/docs/spec-pocketshot-2.0.md) describes a far more complete manifest/runtime architecture than the code currently ships.
- [src/ui/manifest/types.ts](../../../pocketshot/src/ui/manifest/types.ts) currently defines only `name`, `theme`, and `screens`.
- [src/ui/manifest/ManifestApp.tsx](../../../pocketshot/src/ui/manifest/ManifestApp.tsx) still expects `currentScreen`, `tokens`, and `componentRegistry` to be provided externally.
- [src/ui/components/registry.ts](../../../pocketshot/src/ui/components/registry.ts) exposes a large native component library, but the component naming, schema model, and styling abstractions are not yet aligned with Snapshot's canonical model.
- [src/theme/hook.ts](../../../pocketshot/src/theme/hook.ts) and [src/ui/tokens/editor.ts](../../../pocketshot/src/ui/tokens/editor.ts) still use module-scoped atoms, which conflicts with the factory-isolated runtime rule in Pocketshot's own engineering constraints.

### The Critical Gap

Cross-platform concepts already exist, but they are in the wrong place.

- Snapshot owns too much shared architecture.
- Pocketshot owns too much parallel architecture.
- The shared contract package does not yet exist.

---

## Developer Context

### Current package roles

- `snapshot`: canonical frontend platform in practice, but web-owned in package structure
- `pocketshot`: strong native SDK, incomplete declarative runtime
- desired end state: one shared contract package, two peer runtimes

### Current consumer shape

Today:

- Snapshot consumers can ship a full manifest-defined app from `@lastshotlabs/snapshot/ui`.
- Pocketshot consumers mainly build an Expo Router app scaffolded by CLI and use the SDK directly.

After this spec:

- Snapshot still ships the web runtime.
- Pocketshot ships the native runtime.
- Both import shared semantics from `@lastshotlabs/frontend-contract`.

### Representative files

| Path | Purpose |
|---|---|
| [src/ui/manifest/schema.ts](../../src/ui/manifest/schema.ts) | Snapshot manifest source of truth today |
| [src/ui/manifest/compiler.ts](../../src/ui/manifest/compiler.ts) | Snapshot manifest compiler |
| [src/ui/components/_base/schema.ts](../../src/ui/components/_base/schema.ts) | Snapshot universal style/schema foundation |
| [src/ui/components/_base/style-surfaces.ts](../../src/ui/components/_base/style-surfaces.ts) | Snapshot surface merge/runtime model |
| [../../../pocketshot/src/create-pocketshot.tsx](../../../pocketshot/src/create-pocketshot.tsx) | Pocketshot factory entrypoint |
| [../../../pocketshot/src/ui/manifest/types.ts](../../../pocketshot/src/ui/manifest/types.ts) | Pocketshot shipped manifest shape today |
| [../../../pocketshot/src/ui/components/registry.ts](../../../pocketshot/src/ui/components/registry.ts) | Pocketshot native component registry |
| [../../../pocketshot/docs/spec-pocketshot-2.0.md](../../../pocketshot/docs/spec-pocketshot-2.0.md) | Intended native declarative direction |

---

## Non-Negotiable Engineering Constraints

1. Wrong contracts are deleted and replaced.
2. Pocketshot must not depend on Snapshot as a runtime or package boundary.
3. Cross-platform concepts must not remain inside a platform package once the shared-contract boundary is defined.
4. Snapshot's universal styling model is canonical for cross-platform semantics, but not for web-specific implementation details.
5. Pocketshot must remain fully factory-isolated. Module-scoped runtime state that survives across instances is incorrect.
6. The shared contract package must stay platform-neutral. No DOM APIs, CSS assumptions, Expo APIs, or React Native style objects inside it.
7. Shared component contracts use canonical type names, canonical slot names, and canonical runtime states. Platform aliases are temporary implementation scaffolding and not public contract.
8. Every phase leaves both repos type-safe and testable at their package boundary.

---

## Phase 0: Snapshot-Safe Bootstrap

### Goal

Create the new shared contract package and begin extraction additively, without destabilizing Snapshot's current runtime or removing its local ownership in the first pass.

### Plain-language meaning

This phase exists so Snapshot does not get destabilized up front.

- You are allowed to stand up the shared contract package first.
- You are allowed to copy or split contract code into it first.
- You are allowed to re-export from it first.
- You are not required to delete Snapshot-owned contract code first.
- You are not allowed to leave that duplication in place past the bootstrap window.

### Rules

- Snapshot keeps its current runtime behavior intact during this phase.
- Shared contract files may be copied or extracted from Snapshot first, then wired back through re-exports.
- Snapshot is allowed to temporarily retain duplicate contract definitions during Phase 0 only.
- Pocketshot does not start consuming partial or unstable contract surfaces until the Phase 0 package boundary is real and buildable.
- No runtime behavior changes are required in Snapshot during this phase beyond import/re-export preparation.

### Required outputs

- `../frontend-contract` exists as a buildable sibling repo
- Snapshot can resolve `@lastshotlabs/frontend-contract` locally
- at least one contract surface is extracted and re-exported without changing Snapshot runtime behavior
- Snapshot still passes typecheck/build/tests after the additive wiring

### Explicitly preserved in this phase

These Snapshot areas must remain intact during Phase 0:

- `src/ui/manifest/app.tsx`
- `src/ui/manifest/runtime.tsx`
- `src/ui/manifest/router.ts`
- `src/ui/manifest/component-registry.tsx`
- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/tokens/tailwind-bridge.ts`
- SSR and Vite entrypoints
- existing public exports from `@lastshotlabs/snapshot` and `@lastshotlabs/snapshot/ui`

### Exit criteria

- shared contract package exists and builds
- Snapshot resolves the package locally
- Snapshot continues to run off its intact runtime while additive extraction is underway
- no contract ownership has been deleted from Snapshot yet unless the same surface is already re-exported from the shared contract package

### Phase 0 completion test

A cold implementor should be able to answer `yes` to all four questions below:

1. Does `../frontend-contract` exist and build?
2. Can Snapshot resolve `@lastshotlabs/frontend-contract` locally?
3. Does Snapshot still run on its intact web runtime?
4. Has any deleted Snapshot-owned contract surface already been replaced by a working shared-contract re-export?

---

## Phase 1: Canonical Shared Contract Boundary

### Goal

Create the shared package and move the canonical cross-platform contract into it. This is a structural extraction and package-boundary correction, not a thin utility library.

### Plain-language meaning

This phase makes the shared contract package canonical.

- The shared contract package becomes the intended owner of cross-platform semantics in this phase.
- Extraction may still happen by split/copy-then-switch where necessary.
- What changes in this phase is ownership, not whether the first mechanical step was copy or move.
- By the end of this phase, the canonical source of truth must be the shared contract package even if some cleanup continues immediately after.

### Package decision

Create a new sibling repo/package:

```text
../frontend-contract/
```

Working package name:

```ts
@lastshotlabs/frontend-contract
```

### Repository bootstrap requirements

`../frontend-contract/package.json` must use the same basic package conventions as the two existing repos:

- `type: "module"`
- `main`, `module`, `types`, and `exports`
- `build`, `typecheck`, `test`, `format`, `format:check`
- `tsup` for builds
- `vitest` for tests
- `prettier` for formatting

`../frontend-contract` must remain platform-neutral in both source and package dependencies. It may depend on `zod`, but it must not depend on React DOM, React Native, Expo, browser-only packages, or Snapshot/Pocketshot packages.

### Shared-Contract Public Surface

The shared package must own these entrypoints:

- `manifest`
- `tokens`
- `actions`
- `resources`
- `workflows`
- `state`
- `policies`
- `i18n`
- `components`

### Canonical ownership matrix

| Domain | Shared contract package owns | Snapshot owns | Pocketshot owns |
|---|---|---|---|
| Manifest | schema, validation, compiler, presets, structural metadata | web boot/runtime binding | native boot/runtime binding |
| Actions | action vocabulary, payload schemas, execution contracts | browser handlers and side effects | native handlers and side effects |
| Resources | declarative model, dependency semantics, invalidation semantics | web transport/runtime integration | native transport/runtime integration |
| Workflows | node types, graph semantics, execution contracts | browser-trigger adapters | native-trigger adapters |
| State | `from` semantics, scopes, state descriptors | browser state providers | native state providers |
| Policies | policy schema and evaluation contract | browser route/component enforcement | native route/component enforcement |
| I18n | locale contract, translation refs, schema | browser locale detection/persistence | native locale detection/persistence |
| Tokens | semantic token vocabulary, flavor model, mode semantics | CSS variable emission and DOM stylesheet behavior | React Native token resolution and style projection |
| Components | canonical type names, schema metadata, slot catalog, runtime-state catalog | React DOM implementations | React Native implementations |

### Post-spec source-of-truth rules

After completion, the only places allowed to define these contracts are:

- manifest schema/types/compiler: `../frontend-contract/src/manifest/**`
- action type system and execution contract: `../frontend-contract/src/actions/**`
- resource model: `../frontend-contract/src/resources/**`
- workflow schema/types/engine contract: `../frontend-contract/src/workflows/**`
- state descriptors and `from` semantics: `../frontend-contract/src/state/**`
- policy schema/evaluation contract: `../frontend-contract/src/policies/**`
- i18n schema and translation reference semantics: `../frontend-contract/src/i18n/**`
- token schema/types/flavors/mode semantics: `../frontend-contract/src/tokens/**`
- canonical component metadata/slots/states/schema helpers: `../frontend-contract/src/components/**`

Snapshot and Pocketshot may adapt these contracts to platform runtime behavior, but they may not redefine them locally.

### Files to create

- `../frontend-contract/package.json`
- `../frontend-contract/tsconfig.json`
- `../frontend-contract/tsup.config.ts`
- `../frontend-contract/vitest.config.ts`
- `../frontend-contract/src/index.ts`
- `../frontend-contract/src/manifest/**`
- `../frontend-contract/src/tokens/**`
- `../frontend-contract/src/actions/**`
- `../frontend-contract/src/resources/**`
- `../frontend-contract/src/workflows/**`
- `../frontend-contract/src/state/**`
- `../frontend-contract/src/policies/**`
- `../frontend-contract/src/i18n/**`
- `../frontend-contract/src/components/**`

### Files to move or split from Snapshot

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/compiler.ts`
- `src/ui/manifest/resources.ts`
- `src/ui/workflows/**`
- `src/ui/state/types.ts`
- token vocabulary and flavor definitions from `src/ui/tokens/**`
- component metadata, slot/state declarations, and platform-neutral schema helpers from `src/ui/components/_base/schema.ts`

### Initial extraction map

The first implementation pass should move or split files along this exact path map:

| Snapshot source | Shared-contract destination | Notes |
|---|---|---|
| `src/ui/manifest/schema.ts` | `../frontend-contract/src/manifest/schema.ts` | shared manifest schema only |
| `src/ui/manifest/compiler.ts` | `../frontend-contract/src/manifest/compiler.ts` | compiler, preset expansion, structural validation |
| `src/ui/manifest/types.ts` | `../frontend-contract/src/manifest/types.ts` | manifest contract types |
| `src/ui/manifest/resources.ts` | `../frontend-contract/src/resources/schema.ts` | move declarative resource model, keep runtime fetch orchestration local |
| `src/ui/workflows/schema.ts` | `../frontend-contract/src/workflows/schema.ts` | shared node schema |
| `src/ui/workflows/types.ts` | `../frontend-contract/src/workflows/types.ts` | shared workflow types |
| `src/ui/workflows/engine.ts` | `../frontend-contract/src/workflows/engine.ts` | only the platform-neutral engine pieces |
| `src/ui/state/types.ts` | `../frontend-contract/src/state/types.ts` | shared state descriptors and `from` semantics |
| `src/ui/tokens/schema.ts` | `../frontend-contract/src/tokens/schema.ts` | token schema only |
| `src/ui/tokens/types.ts` | `../frontend-contract/src/tokens/types.ts` | semantic token types |
| `src/ui/tokens/flavors.ts` | `../frontend-contract/src/tokens/flavors.ts` | flavor inheritance and composition |
| `src/ui/tokens/derive-dark.ts` | `../frontend-contract/src/tokens/derive-dark.ts` | mode derivation semantics |
| `src/ui/components/_base/schema.ts` | `../frontend-contract/src/components/schema.ts` | only canonical metadata/schema helpers |

Anything that touches DOM, CSS emission, React rendering, browser events, or React Native style objects stays out of the shared contract package even if it currently lives beside shared semantics in Snapshot.

### Second extraction map

The same Phase 1 pass must also classify the following Snapshot files explicitly as move, split, or stay-local:

| Snapshot source | Shared-contract destination | Decision |
|---|---|---|
| `src/ui/actions/types.ts` | `../frontend-contract/src/actions/types.ts` | move |
| `src/ui/actions/interpolate.ts` | `../frontend-contract/src/actions/interpolate.ts` | split if platform-neutral pieces exist |
| `src/ui/actions/executor.ts` | `../frontend-contract/src/actions/executor.ts` | split contract from runtime handlers |
| `src/ui/policies/types.ts` | `../frontend-contract/src/policies/types.ts` | move |
| `src/ui/policies/evaluate.ts` | `../frontend-contract/src/policies/evaluate.ts` | move if platform-neutral |
| `src/ui/i18n/schema.ts` | `../frontend-contract/src/i18n/schema.ts` | move |
| `src/ui/i18n/resolve.ts` | `../frontend-contract/src/i18n/resolve.ts` | move if platform-neutral |
| `src/ui/manifest/defaults/i18n-en.ts` | `../frontend-contract/src/i18n/defaults/en.ts` | move if used as shared default |
| `src/ui/manifest/guards/authenticated.ts` | none | stay local to Snapshot runtime adapter |
| `src/ui/manifest/guards/unauthenticated.ts` | none | stay local to Snapshot runtime adapter |
| `src/ui/manifest/router.ts` | none | stay local to Snapshot |
| `src/ui/manifest/runtime.tsx` | none | stay local to Snapshot |
| `src/ui/manifest/component-registry.tsx` | none | stay local to Snapshot |
| `src/ui/tokens/resolve.ts` | split | move semantic resolution, keep CSS/runtime resolution local |
| `src/ui/tokens/editor.ts` | none | stay local to Snapshot unless pure schema helpers are extracted |
| `src/ui/tokens/tailwind-bridge.ts` | none | stay local to Snapshot |
| `src/ui/tokens/contrast-checker.ts` | optional `../frontend-contract/src/tokens/contrast.ts` | move only if platform-neutral and used cross-platform |

This table is not optional guidance. By the end of Phase 1, each listed file must have an explicit disposition.

### Shared-Contract Structure Requirements

`../frontend-contract/src/components/` must be metadata-only:

- `catalog.ts`: canonical component registry metadata without implementations
- `schema.ts`: shared schema helpers, canonical slot definitions, canonical state definitions
- `slots.ts`: named slot catalog
- `states.ts`: canonical interactive/runtime states
- `types.ts`: cross-platform component contract types

`../frontend-contract/src/manifest/` must expose:

- `schema.ts`
- `compiler.ts`
- `presets.ts`
- `types.ts`
- `validators.ts`

`../frontend-contract/src/tokens/` must expose:

- semantic token families
- flavor inheritance contract
- mode contract
- token reference resolution rules
- platform-neutral token AST/types

### Shared-Contract Exports Contract

`../frontend-contract/package.json` must export at minimum:

- `.`
- `./manifest`
- `./tokens`
- `./actions`
- `./resources`
- `./workflows`
- `./state`
- `./policies`
- `./i18n`
- `./components`

### Consumer package wiring

Phase 1 must make these concrete package changes:

- add `"@lastshotlabs/frontend-contract": "file:../frontend-contract"` to [package.json](/C:/Users/email/projects/snapshot/package.json)
- add `"@lastshotlabs/frontend-contract": "file:../frontend-contract"` to [package.json](/C:/Users/email/projects/pocketshot/package.json)
- install dependencies in both repos so local resolution actually works
- keep Snapshot and Pocketshot package names unchanged

The shared package is a new dependency of both repos, not a replacement package for either repo.

### Explicit Exclusions From The Shared Contract Package

- `ManifestApp`
- DOM stylesheet injection
- CSS variable emission
- SSR/RSC code
- React Native style resolution
- Expo Router navigation building
- browser or native overlay managers

### Shared-Contract Anti-Leak Rules

The following imports are forbidden anywhere in `../frontend-contract/src/**`:

- `react-dom`
- `react-native`
- `expo-router`
- `expo-*`
- browser globals such as `window`, `document`, `HTMLElement`, `CSSStyleSheet`
- Snapshot-local files
- Pocketshot-local files

The following patterns are forbidden anywhere in `../frontend-contract/src/**`:

- JSX rendering
- DOM event listeners
- CSS variable writes
- React Native `StyleSheet.create`
- platform overlay registration
- router mounting

### Exit criteria

- Shared-contract package builds independently.
- Shared-contract contains no browser-only or React Native-only imports.
- Snapshot and Pocketshot can import the shared contract package without circular dependency.
- The canonical manifest shape no longer lives only inside Snapshot.
- The shared package is the only place allowed to define cross-platform component names and manifest semantics.
- Snapshot and Pocketshot both declare `@lastshotlabs/frontend-contract` in `package.json` and build against it locally.

### Tests

- `../frontend-contract/src/**/__tests__/*.test.ts`
- parity fixtures proving schema/compiler/resource/workflow/state behavior without platform runtime

### Phase 1 acceptance matrix

Phase 1 is only complete when each domain below has a real shared-contract home:

| Domain | Required shared-contract files |
|---|---|
| Manifest | `src/manifest/schema.ts`, `src/manifest/compiler.ts`, `src/manifest/types.ts` |
| Actions | `src/actions/types.ts` and any platform-neutral execution contract helpers |
| Resources | `src/resources/schema.ts` and resource types/helpers |
| Workflows | `src/workflows/schema.ts`, `src/workflows/types.ts`, `src/workflows/engine.ts` |
| State | `src/state/types.ts` |
| Policies | `src/policies/types.ts`, `src/policies/evaluate.ts` |
| I18n | `src/i18n/schema.ts`, `src/i18n/resolve.ts` |
| Tokens | `src/tokens/schema.ts`, `src/tokens/types.ts`, `src/tokens/flavors.ts` |
| Components | `src/components/schema.ts`, `src/components/slots.ts`, `src/components/states.ts`, `src/components/types.ts` |

### Required deliverables

At the end of Phase 1, a cold agent must be able to point at these concrete outputs:

- a buildable `../frontend-contract` repo
- local file dependency wiring in Snapshot and Pocketshot
- shared-contract export maps that compile
- at least one passing shared-contract manifest/compiler test

---

## Phase 2: Snapshot Rebased On Shared Contract

### Goal

Snapshot becomes a web runtime over the shared contract instead of the owner of that contract.

### Implementation

- Replace local ownership of manifest/action/resource/workflow/token contract modules with imports from `@lastshotlabs/frontend-contract`.
- Keep Snapshot-specific rendering/runtime modules in `src/ui/manifest/app.tsx`, `src/ui/manifest/runtime.tsx`, `src/ui/components/_base/style-surfaces.ts`, and all SSR/Vite/browser-specific paths.
- Keep Snapshot's universal styling runtime as the canonical semantic reference for slots/states/style props, but move the platform-neutral schema pieces to the shared contract package.

### Snapshot-specific hold points

Snapshot may continue landing the remaining component cutover while this program is active. The rule is:

- if a change is semantic and cross-platform, move it or mirror it into the shared contract package
- if a change is DOM/CSS/browser runtime behavior, keep it in Snapshot

This lets Snapshot finish the cutover without blocking the architecture correction.

### Files to modify

- `src/ui/manifest/index.ts`
- `src/ui.ts`
- `src/create-snapshot.tsx`
- `src/ui/manifest/**`
- `src/ui/tokens/**`
- `src/ui/workflows/**`
- `src/ui/state/**`

### Snapshot files that must stay local

The following Snapshot responsibilities stay inside Snapshot even after rebasing:

- `src/ui/manifest/app.tsx`
- `src/ui/manifest/runtime.tsx`
- `src/ui/manifest/router.ts`
- `src/ui/manifest/component-registry.tsx`
- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/tokens/tailwind-bridge.ts`
- SSR entrypoints under `src/ssr/**`
- Vite plugin code under `src/vite/**`
- browser overlay implementations in `src/ui/actions/*.tsx`

### Exit criteria

- Snapshot no longer defines duplicate copies of shared manifest semantics.
- Snapshot public exports continue to work through re-export from the shared contract package where appropriate.
- Snapshot browser runtime stays green on typecheck, build, and tests.

### Required deliverables

- Snapshot imports shared manifest/token/workflow/state contracts from `@lastshotlabs/frontend-contract`
- Snapshot keeps only web runtime logic locally
- Snapshot public exports remain coherent for consumers of `@lastshotlabs/snapshot` and `@lastshotlabs/snapshot/ui`

### Phase 2 acceptance matrix

- `src/ui/manifest/index.ts` re-exports shared contract surfaces instead of owning them
- local Snapshot code no longer defines duplicate manifest/action/workflow/state/token schemas
- Snapshot tests continue covering browser-only runtime behavior where shared-contract tests cannot

---

## Phase 3: Pocketshot Manifest Runtime Rebuilt On Shared Contract

### Goal

Pocketshot ships a real native manifest runtime built on the same contract, not a lightweight parallel screen renderer.

### Required runtime shape

Pocketshot's manifest runtime must support:

- `theme`
- `navigation`
- `globals`
- `resources`
- `state`
- `overlays`
- `workflows`
- `policies`
- `i18n`
- `screens`

### Replace current thin manifest layer

Replace the current minimal files:

- [../../../pocketshot/src/ui/manifest/types.ts](../../../pocketshot/src/ui/manifest/types.ts)
- [../../../pocketshot/src/ui/manifest/ManifestApp.tsx](../../../pocketshot/src/ui/manifest/ManifestApp.tsx)
- [../../../pocketshot/src/ui/manifest/renderer.tsx](../../../pocketshot/src/ui/manifest/renderer.tsx)

with a native runtime shaped like:

```text
../pocketshot/src/ui/manifest/
  schema.ts
  compiler.ts
  component-registry.ts
  runtime.tsx
  navigation.tsx
  resources.ts
  renderer.tsx
  app.tsx
  structural.tsx
  index.ts
```

### Native runtime file responsibilities

Each new Pocketshot manifest file must have a single clear job:

| File | Responsibility |
|---|---|
| `schema.ts` | re-export shared manifest schema/types for native consumers |
| `compiler.ts` | re-export or wrap shared compiler with native-safe defaults |
| `component-registry.ts` | native component lookup keyed by canonical shared names |
| `runtime.tsx` | app runtime providers, boot orchestration, lifecycle wiring |
| `navigation.tsx` | Expo Router stack/tab/drawer mounting from manifest navigation config |
| `resources.ts` | native resource orchestration and refresh/invalidation hooks |
| `renderer.tsx` | native component tree renderer from compiled nodes |
| `app.tsx` | public `ManifestApp` entrypoint |
| `structural.tsx` | native structural wrappers/layout glue |
| `index.ts` | public exports |

### Pocketshot deletions and replacements

The following local shapes should be treated as wrong and replaced rather than evolved:

- the minimal `Manifest` type in `src/ui/manifest/types.ts`
- `ManifestApp` requiring externally supplied `currentScreen`
- `ManifestApp` requiring externally supplied resolved tokens
- `ManifestApp` requiring externally supplied component registry
- module-scoped theme/editor atoms in `src/theme/hook.ts` and `src/ui/tokens/editor.ts`
- any per-component schema naming that diverges from the canonical shared component catalog where the concept overlaps Snapshot

### Native ownership

- navigation builder for Expo Router stack/tabs/drawer
- overlay orchestration for modal/bottom-sheet/action-sheet
- app-global state bridging for auth/org/theme/native notifications
- native-safe resource/refetch orchestration
- binding Pocketshot SDK capabilities from `src/create-pocketshot.tsx` into manifest runtime services

### Exit criteria

- Pocketshot `ManifestApp` can boot from `manifest + apiUrl` without hand-supplying `currentScreen`, resolved tokens, or registry.
- Pocketshot manifest schema is derived from the shared-contract package, not separately invented.
- Pocketshot runtime supports guarded navigation, shared resources, workflows, and global state.
- Pocketshot runtime boot is factory-local and supports multiple isolated app instances in one JS process.

### Required deliverables

- a native `ManifestApp` entrypoint that owns runtime boot instead of expecting pre-resolved inputs
- shared-contract manifest compilation feeding Pocketshot runtime boot
- native navigation/resource/workflow/runtime modules under `../pocketshot/src/ui/manifest/`

### Phase 3 acceptance matrix

- Pocketshot can boot a manifest app from `manifest + apiUrl` alone
- navigation decisions come from manifest config rather than external screen injection
- runtime state is instance-local, not module-global
- shared-contract compile output is the direct input to native rendering/runtime orchestration

---

## Phase 4: Native Universal Styling Runtime

### Goal

Pocketshot implements the same semantic styling contract as Snapshot using React Native primitives instead of CSS.

### Canonical semantic model

The shared contract package owns:

- universal style props
- canonical slot names
- canonical runtime states such as `hover`, `focus`, `open`, `selected`, `current`, `active`, `completed`, `invalid`, `disabled`

Pocketshot owns:

- state-to-native-style resolution
- slot-to-`ViewStyle` / `TextStyle` projection
- touch/native equivalents for hover/focus/active where supported

### Required new native base layer

Create under `../pocketshot/src/ui/components/_base/`:

- `style-props.ts`
- `style-surfaces.ts`
- `surface-state.ts`
- upgraded `ComponentWrapper.tsx`

### Native base-layer file responsibilities

| File | Responsibility |
|---|---|
| `style-props.ts` | native-facing contract for universal style props |
| `style-surfaces.ts` | slot/state/token resolution into RN style fragments |
| `surface-state.ts` | canonical runtime-state mapping for press/focus/open/selected/etc |
| `ComponentWrapper.tsx` | shared component shell that applies surfaces, visibility, data/action wiring |

### Native parity rule

Pocketshot does not need to imitate browser behavior; it needs to honor the same semantic contract.

Examples:

- `hover` may degrade to no-op on touch-only devices, but the state name remains canonical
- `focus` maps to native focusability and accessibility focus where appropriate
- `active` maps to press interaction
- slot names such as `root`, `header`, `body`, `footer`, `label`, `helper`, `trigger`, `content` remain identical across platforms

### Explicit correction

Pocketshot components must stop relying on per-component bespoke style props as the primary customization path. The universal surface contract becomes the primary path.

### Exit criteria

- At least one representative component in each class uses the native surface runtime:
  layout/navigation, overlay, data, forms
- Slot names and runtime state names match shared-contract metadata.
- Token-aware style props resolve through the shared contract, not per-component ad hoc naming.

### Required deliverables

- shared native base styling files under `../pocketshot/src/ui/components/_base/`
- proof components in layout/navigation, overlay, data, and forms using the shared surface contract
- tests covering token-aware slot/state resolution on React Native primitives

### Phase 4 acceptance matrix

- the same slot names are visible in shared-contract metadata and native component implementations
- components no longer invent bespoke style prop vocabularies where universal style props apply
- RN style resolution is token-driven and state-aware

---

## Phase 5: Pocketshot Component Library Rebased On Shared Contract

### Goal

Pocketshot's large native component library keeps its native UX but stops owning a separate declarative philosophy.

### Rules

- Shared component names must converge on canonical names from the shared contract package.
- Shared components use canonical schema and slot/state metadata.
- Platform-specific components are allowed where the concept is genuinely native-only.
- Any overlapping component that exists in both packages must match on:
  - canonical `type`
  - schema semantics
  - publish/subscribe behavior
  - action execution semantics
  - resource binding semantics

### Audit baseline

Current component inventory from the repo audit:

- Snapshot unique component names: about 113
- Pocketshot unique component names: about 125
- shared names already present in both repos: about 72

This means the work is not inventing parity from zero. The main job is to normalize names, schema semantics, and styling/state contracts for the shared set, then classify the remaining components as platform-specific or candidates for future convergence.

### Classification pass required before implementation completes

Every Pocketshot component must end up in exactly one of these buckets:

1. canonical shared component
2. Pocketshot-only native component
3. incorrect duplicate that gets deleted

No component stays in an ambiguous "close enough" state.

### Representative cutover order

1. layout + navigation
2. overlay
3. data
4. forms
5. content
6. communication + commerce + workflow

### Exit criteria

- Shared component contracts are no longer duplicated manually in Pocketshot.
- Pocketshot keeps native implementations, but shared semantics come from the shared contract package.
- The component registry in Pocketshot is rebuilt around canonical names and metadata.

### Required deliverables

- a checked-in classification artifact at `../pocketshot/docs/component-classification.md` covering every Pocketshot component as shared, native-only, or delete
- a rebuilt Pocketshot registry keyed by canonical shared names where concepts overlap
- representative converted components in every cutover class listed above

### Required classification columns

`../pocketshot/docs/component-classification.md` must include, at minimum, one row per component with:

- component path
- current exported name
- canonical shared name or `native-only`
- target bucket: `shared`, `native-only`, or `delete`
- target schema source
- target slot/state source
- notes on why the component is native-only if applicable

### Phase 5 acceptance matrix

- every overlapping Snapshot/Pocketshot component has a single canonical shared name
- the Pocketshot registry is keyed by canonical names for shared components
- duplicate semantics are deleted rather than left in parallel under alternate names

---

## Phase 6: CLI, Fixtures, And Contract Proofs

### Goal

Make the new structure real at the tooling boundary and prove the contract with shared fixtures.

### Snapshot work

- keep `snapshot init` and `snapshot sync` truthful against the new package structure

### Pocketshot work

- elevate manifest-first scaffolding and validation to first-class tooling
- replace the thin `manifest` command behavior with shared-contract-driven validation and generation

### Shared proofs

Create a contract fixture suite consumed by both repos:

```text
../frontend-contract/fixtures/
  auth/
  data/
  navigation/
  overlays/
  state/
  workflows/
```

Each fixture proves:

- manifest parse/compile output
- action execution semantics
- workflow semantics
- resource resolution behavior
- state and `from` behavior
- component metadata shape
- slot/state naming parity across runtimes where the component exists on both platforms

### Minimum shared fixture set

At minimum, the shared fixture set must include:

- authenticated route with policy guard
- resource-backed list screen with empty/loading/populated states
- modal or bottom-sheet overlay launched from an action
- workflow with branch/retry/capture semantics
- i18n-backed text reference
- token flavor swap affecting multiple component slots

### Required docs updates

- Snapshot docs must stop implying that web owns the frontend contract.
- Pocketshot docs must stop implying that native manifest support is a lighter sibling path.
- Shared-contract docs must present the contract as platform-first and runtime-agnostic.

### Exit criteria

- Shared fixtures run in both Snapshot and Pocketshot test suites.
- CLI output in both repos reflects the new architecture.
- Public docs in both repos describe peers over the shared contract package, not web-parent/mobile-child.

### Required deliverables

- shared fixture directories checked into `../frontend-contract/fixtures/`
- Snapshot and Pocketshot test entrypoints that consume the same fixture set
- CLI flows in both repos that validate against shared-contract schema/compiler behavior

### Phase 6 acceptance matrix

- the same fixture manifest compiles once in the shared contract package and is consumed by both runtimes
- fixture assertions prove semantic parity, not identical DOM/native rendering
- CLI validate/generate paths in both repos fail on contract drift and pass on shared-contract-compliant inputs

---

## Parallelization And Sequencing

### Tracks

- **Track A: Contract**
  Owns `../frontend-contract/**`
- **Track B: Snapshot**
  Owns Snapshot re-exports and web runtime rebasing
- **Track C: Pocketshot Runtime**
  Owns manifest runtime, navigation builder, global runtime
- **Track D: Pocketshot UI**
  Owns native style runtime and component-library rebasing
- **Track E: Tooling + Proofs**
  Owns fixtures, CLI, docs, and parity tests

### Dependency order

1. Track A starts first and defines the canonical package boundary.
2. Track B and Track C start once shared-contract entrypoints compile.
3. Track D starts once Track A defines slot/state/style contracts and Track C has runtime scaffolding.
4. Track E runs continuously once Track A exists.

### Phase gates

Do not start the next phase until the current phase has produced its required deliverables and acceptance matrix outputs.

- Gate 1: `../frontend-contract` exists, builds, exports compile, and both repos resolve it locally
- Gate 2: Snapshot imports shared contracts instead of owning them
- Gate 3: Pocketshot native manifest runtime boots from shared-contract manifest compile output
- Gate 4: Pocketshot native styling runtime resolves canonical slot/state/style semantics
- Gate 5: Pocketshot component classification artifact exists and registry rebasing is in place
- Gate 6: shared fixtures pass in both runtimes and docs/CLI reflect the new architecture

### Why these tracks are independent

- Contract owns shared semantics only.
- Snapshot owns web runtime only.
- Pocketshot runtime and Pocketshot UI can move in parallel once the shared contract exists.
- Tooling and proofs can target the shared package and both runtimes without owning rendering internals.

### Agent execution checklist

1. Read [docs/engineering-rules.md](../engineering-rules.md).
2. Read [../../../pocketshot/docs/engineering-rules.md](../../../pocketshot/docs/engineering-rules.md).
3. Read [src/ui/manifest/schema.ts](../../src/ui/manifest/schema.ts), [src/ui/manifest/compiler.ts](../../src/ui/manifest/compiler.ts), [src/ui/actions/types.ts](../../src/ui/actions/types.ts), [src/ui/policies/types.ts](../../src/ui/policies/types.ts), [src/ui/i18n/schema.ts](../../src/ui/i18n/schema.ts), [src/ui/components/_base/schema.ts](../../src/ui/components/_base/schema.ts), [../../../pocketshot/src/ui/manifest/ManifestApp.tsx](../../../pocketshot/src/ui/manifest/ManifestApp.tsx), [../../../pocketshot/src/ui/manifest/types.ts](../../../pocketshot/src/ui/manifest/types.ts), and [../../../pocketshot/src/ui/components/registry.ts](../../../pocketshot/src/ui/components/registry.ts).
4. Create `../frontend-contract` and wire `"@lastshotlabs/frontend-contract": "file:../frontend-contract"` into both repos.
5. Build the shared-contract package surface first.
6. Extract or split Snapshot contracts according to the extraction maps in this spec.
7. Rebase Snapshot imports/exports onto the shared contract package.
8. Rebuild Pocketshot manifest runtime on the shared contract package.
9. Rebuild Pocketshot native styling/runtime abstractions on the shared contract package.
10. Produce the Pocketshot component classification artifact.
11. Run package-local checks after each phase.
12. Run shared fixtures in all affected packages before closing work.

### Stop conditions

Stop and correct the implementation if any of these happen:

- Snapshot regains ownership of a cross-platform manifest or component contract
- Pocketshot imports Snapshot directly
- the shared contract package adds DOM, CSS, Expo, React Native, or runtime-renderer dependencies
- Pocketshot runtime still requires externally supplied `currentScreen`, tokens, or registry to boot
- Pocketshot keeps module-scoped runtime state that breaks factory isolation

---

## Definition Of Done

### Per-package checks

Snapshot:

```sh
cd ../snapshot
bun run typecheck
bun run format:check
bun run build
bun test
```

Pocketshot:

```sh
cd ../pocketshot
bun run typecheck
bun run format:check
bun run build
bun test
```

Shared contract package:

```sh
cd ../frontend-contract
bun run typecheck
bun run format:check
bun run build
bun test
```

### Full completion checks

- Shared contract package exists and is the owner of cross-platform semantics.
- Snapshot and Pocketshot are peer runtimes over the shared contract package.
- Pocketshot does not depend on Snapshot.
- Wrong duplicated contracts have been removed.
- Shared fixtures prove parity on contract semantics across web and native runtimes.
- Docs in both repos describe the corrected architecture with no parent/child package confusion.
- Pocketshot can ship a manifest-first app without hand-built screen wiring.

### Completion evidence required in the final PR or work summary

The final implementation summary must include:

- the path to the new `../frontend-contract` repo
- the shared-contract export surface that now exists
- the list of Snapshot files that were split or rebased
- the list of Pocketshot manifest/runtime files that were created or replaced
- the path to `../pocketshot/docs/component-classification.md`
- the fixture paths used to prove shared contract parity
- the exact commands run and whether they passed in each repo
