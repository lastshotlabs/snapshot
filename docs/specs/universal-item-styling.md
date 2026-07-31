# Universal Declarative Styling

> **Status**
>
> | Phase | Title                                   | Status      | Track      |
> | ----- | --------------------------------------- | ----------- | ---------- |
> | 1     | Canonical Styleable Element Contract    | Not started | Foundation |
> | 2     | Shared Slots, States, and Merge Runtime | Not started | Foundation |
> | 3     | Navigation + Composable Nav Cutover     | Not started | Navigation |
> | 4     | Overlay + Menu Surfaces                 | Not started | Overlay    |
> | 5     | Data Display Surfaces                   | Not started | Data       |
> | 6     | Forms + Field Surfaces                  | Not started | Forms      |
> | 7     | Remove Obsolete Visual APIs             | Not started | Cleanup    |
> | 8     | Docs + Playground + Dogfood             | Not started | Docs       |
>
> **Priority:** P0
>
> **Product bar:** A manifest author must be able to build sophisticated, production-grade UI
> entirely through declarations. Primitive elements are the source of truth. Grouping components
> are syntactic sugar and must remain fully customizable through the same declarative contract.

---

## Purpose

This spec defines the canonical styling system for Snapshot.

The system must satisfy five requirements:

1. **Primitive-first**. Every visible render surface is a styleable element.
2. **Declarative-only**. Consumers customize UI from manifest declarations, not bespoke code.
3. **Universal**. Grouped/collection components use the same styling contract as primitives.
4. **Composable**. Grouping components are sugar over styleable surfaces, not a separate styling model.
5. **Single-path**. Tokens + universal style props + `className`/`style` are the only styling path.
6. **Primitive-backed**. Grouping components must compose shared UI primitives; they must not roll
   private copies of primitive UI behavior.

This is not a nav-only feature. Nav is the first forcing function, but the architecture must serve
every collection and every grouped primitive.

---

## Foundation Law

This spec is not merely a styling cleanup.

It defines the product foundation for manifest-declared UI in Snapshot.

The foundation is correct only if future product expansion requires adding primitives, not adding a
new declarative philosophy.

### Core extension law

A new product class must be unlockable by doing only the following kinds of work:

1. add one or more new primitive families
2. add typed semantic schemas that compose those primitives
3. expose canonical slots/states for the new visible surfaces
4. optionally add grouped sugar on top of those primitives
5. register the new packages under the existing repository/runtime conventions

It must **not** require:

- a new styling model
- a new grouping model
- a new state model
- a new data-fetching model
- a new event/workflow model
- generic prop bags to tunnel capability through the system
- bespoke per-domain visual APIs that bypass canonical `slots`

This is the main architectural law of the entire spec.

### Foundation completeness test

When a new product requirement appears, the first implementation question must be:

- which new primitive family or semantic composition is missing?

The first question must **not** be:

- which new declarative model do we need?

If a product requirement cannot be expressed by extending primitives and semantic composition inside
the existing declarative laws, the foundation is incomplete and must be strengthened at the
foundation level before more feature work proceeds.

### Allowed extension operations

The following are legitimate ways to grow product capability:

- add a new primitive family such as `message-composer`, `thread-list`, `resource-graph`, or
  `segmented-control`
- add a new typed semantic grouped component that composes existing primitives
- add new slot names for genuinely new visible surfaces
- add new semantic states when they are truly cross-cutting and reusable
- add new workflow actions inside the existing workflow model
- add new data/resource shapes inside the existing resource model

### Forbidden extension operations

The following are evidence that the foundation is being bypassed instead of extended:

- adding a component-local styling DSL
- adding a second slot system for one domain
- adding a second runtime state system for one domain
- introducing domain-specific `props` bags to pass untyped power through wrappers
- teaching grouped components to privately own behavior that belongs in primitives
- introducing a parallel package structure for “special” components

### Product-class thought experiment

The system should be strong enough that very different product classes still obey the same platform
laws.

Examples:

#### Commerce / brand-heavy marketing product

Archetype:

- Nike-style commerce, campaign, and editorial surfaces

Needed expansion should look like:

- richer commerce/content/media primitives
- stronger layout, card, carousel, pricing, gallery, CTA, and merchandising primitives

It should **not** require:

- a separate styling system for marketing pages
- a special “brand page config” runtime

#### Realtime communication product

Archetype:

- Discord-style workspace, channels, message stream, presence, and composer surfaces

Needed expansion should look like:

- message-thread primitives
- composer/input primitives
- presence, member-list, channel-list, and voice/stateful communication primitives

It should **not** require:

- a second grouping model for chat UIs
- a second event system for interactive surfaces

#### Community / discussion product

Archetype:

- Discourse-style forum, thread, post, moderation, and composer surfaces

Needed expansion should look like:

- thread, post-body, reaction, moderation-action, composer, and pagination primitives

It should **not** require:

- special per-forum visual APIs
- a second semantic/configuration language for post layouts

#### Social network product

Archetype:

- Facebook- or LinkedIn-style feed, profile, network, messaging, and admin surfaces

Needed expansion should look like:

- feed-item, reaction-bar, comment-thread, profile-header, connection-card, and messaging primitives

It should **not** require:

- special-case feed styling infrastructure
- one-off grouped component APIs for social surfaces

#### Data plane / dashboard product

Archetype:

- MongoDB Atlas-style dashboard, filters, charts, resources, inspectors, and admin tables

Needed expansion should look like:

- query/filter primitives
- richer table/chart/metric/inspector/resource-map primitives
- stronger data workflows and resource interactions inside the existing runtime model

It should **not** require:

- a second dashboard-only layout/styling/runtime contract

#### Party / game-shell product

Archetype:

- Jackbox-style lobby, round setup, voting, scoreboard, prompts, and reveal screens

Needed expansion should look like:

- lobby, prompt, reveal, timer, scoreboard, answer-grid, and controller primitives
- domain-specific game mechanics implemented as primitives or runtime logic inside the same package
  and workflow conventions

It should **not** require:

- a second declarative platform for “game mode”

Note:

- highly bespoke gameplay engines may still require specialized primitives or non-manifest runtime
  code
- that does not weaken the foundation law; it means the primitive library must grow with the product
  domain

### Platform promise

Snapshot should become a system where:

- product breadth increases by adding primitives
- authoring power increases by exposing those primitives through canonical declarations
- grouped sugar increases convenience only, never capability

If we keep needing new declarative exceptions for each new product class, this spec has failed.

### Primitive addition contract

When the product needs a capability the current repo cannot express, the default implementation path
must be:

1. define the missing primitive family
2. place it in the canonical package structure
3. define its typed semantic schema
4. define its visible slots and runtime states
5. wire it through the existing manifest/runtime/workflow conventions
6. add tests proving primitive-level behavior and declarative configurability
7. only then add grouped sugar or domain-specific composition on top

This is how the platform is supposed to grow.

### Primitive admission checklist

A new primitive family is acceptable only if all of the following are true:

1. It solves a reusable UI behavior or reusable visible surface pattern.
2. It does not introduce a new styling contract.
3. It does not introduce a new package/layout convention.
4. It exposes canonical slots for materially visible surfaces.
5. It exposes semantic fields through typed schema, not prop bags.
6. It uses canonical runtime concepts for state/data/workflows.
7. It can be composed by grouped components without hiding its declarative power.

### Semantic composition contract

Grouped/domain components built on top of primitives must obey these rules:

1. They may add domain semantics.
2. They may add defaults.
3. They may add repetition, orchestration, and sugar.
4. They may not fork the primitive styling model.
5. They may not fork the primitive runtime model.
6. They may not become the only place where a capability is possible.

This ensures that domain expansion remains composition, not reinvention.

---

## Zero-Context Execution Standard

This spec must be sufficient for an engineer or agent with no prior repo context to execute the
work correctly.

That means the spec must provide:

1. the system model
2. the repository facts that matter
3. the canonical schema/runtime shapes
4. the exact files likely to change
5. the sequencing constraints
6. the acceptance criteria
7. the explicit anti-patterns to avoid

If an implementation decision is important enough to affect API shape, merge order, or declarative
power, it must be written here.

### Agent Success Criteria

A zero-context agent should be able to read only:

- this spec
- referenced source files named in this spec

and then:

- implement the canonical schema fragments
- wire them through manifest and runtime paths
- upgrade target components consistently
- remove obsolete APIs
- add tests that verify the canonical contract

without inventing alternate patterns.

### Agent Non-Goals

A zero-context agent must not:

- invent new component-specific visual fields when canonical `slots` can express the need
- preserve obsolete APIs for hypothetical external compatibility
- treat grouped surfaces as `className`/`style` only
- upgrade grouped nav without upgrading composable nav primitives
- translate styling intent into bespoke per-component visual CSS variables
- introduce a new declarative or runtime model just because a new product domain appears

---

## Repository Facts

These are repo facts the implementer must know.

### Styling primitives that already exist

The repo already has a universal style vocabulary for top-level components.

Important source files:

- `src/ui/components/_base/schema.ts`
- `src/ui/manifest/schema.ts`
- `src/ui/components/_base/component-wrapper.tsx`

Important current facts:

1. `extendedBaseComponentSchema` in `_base/schema.ts` already contains the universal style props.
2. `baseComponentConfigSchema` in `manifest/schema.ts` mirrors that contract for manifest-level
   component config.
3. `ComponentWrapper` already resolves universal style props, interactive CSS, and responsive CSS
   for top-level components.

System consequence:

- the grouped-surface contract must reuse this vocabulary instead of creating a smaller styling API

### Nav currently has two parallel authoring paths

Grouped path:

- `manifest.navigation.items`
- `src/ui/components/layout/nav/*`

Composable path:

- `manifest.navigation.template`
- `src/ui/components/layout/nav-link/*`
- `src/ui/components/layout/nav-dropdown/*`
- `src/ui/components/layout/nav-section/*`
- `src/ui/components/layout/nav-user-menu/*`

System consequence:

- any “universal styling” implementation that upgrades only one path is incomplete

### The live nav assembly path is not only in `manifest/compiler.ts`

Important files:

- `src/ui/manifest/app.tsx`
- `src/ui/entity-pages/AppShellWrapper.tsx`
- `src/ui/manifest/compiler.ts`

Current fact:

- `manifest/app.tsx` assembles the `Nav` config used by the main app shell
- `AppShellWrapper.tsx` renders `Nav` directly for entity-page shells
- `compiler.ts` passes navigation through, but is not the only place shaping live nav behavior

System consequence:

- a zero-context implementation must update the real runtime handoff points, not assume compiler
  changes alone are sufficient

### Floating menu primitives are shared infrastructure

Important files:

- `src/ui/components/primitives/floating-menu/component.tsx`
- `src/ui/components/primitives/floating-menu/index.ts`

Current fact:

- overlay and nav dropdown behavior already depend on these shared menu primitives

System consequence:

- menu labels, items, separators, and panels should converge here rather than diverging across
  overlay/nav implementations

Current repository warning:

- `dropdown-menu` already composes these primitives
- `nav-dropdown` and `nav-user-menu` currently still roll their own positioned menus
- `layout/nav/component.tsx` still contains bespoke hover/menu rendering behavior

Implementation consequence:

- Phase 3 and Phase 4 must converge those paths on shared primitives rather than merely adding
  styling hooks to bespoke implementations

### Pre-prod cutover rule

Current product fact:

- no external consumers require compatibility support

System consequence:

- internal manifests, tests, docs, and examples may be updated in the same change
- obsolete visual APIs should be removed, not soft-deprecated indefinitely

---

## Repository Structure and File Conventions

This system will drift if repository structure is left to taste.

The repository needs one explicit filesystem contract so a zero-context implementer can predict:

- where a component belongs
- which files must exist
- where helpers should live
- how schemas, runtime code, and tests line up

### Top-level ownership model

The current top-level `src/ui/components` folders are directionally correct and should remain the
main product taxonomy:

- `primitives`
- `layout`
- `navigation`
- `overlay`
- `forms`
- `data`
- `content`
- `feedback`
- `media`
- `communication`
- `commerce`
- `workflow`
- `_base`

Canonical ownership rules:

1. `primitives`
   - lowest-level reusable UI building blocks
   - may be directly manifest-addressable or internal-only, but they are still the canonical source
     of reusable UI behavior
2. domain folders such as `layout`, `navigation`, `forms`, `data`, `overlay`, and others
   - grouped components or domain-specific components built on primitives
3. `_base`
   - cross-cutting runtime infrastructure only
   - no product-specific grouped components
   - no hidden second primitive library
4. `manifest`
   - manifest runtime, schema registry, compiler/renderer/runtime wiring
5. `workflows`
   - workflow engine, schema, registry, and execution runtime

### `_base` restrictions

`_base` is for infrastructure, not for anonymous component sprawl.

Allowed in `_base`:

- shared schema fragments
- style-prop resolution
- merge utilities
- runtime hooks used broadly across families
- wrappers and infrastructure helpers with no product/domain identity

Not allowed in `_base`:

- a reusable visible primitive that should live in `primitives`
- a domain-specific grouped component
- ad hoc component family internals that should be colocated in the component package

Current repo examples that should be normalized by this rule:

- `_base/context-menu-portal.tsx` is shared visible behavior and should either move into an explicit
  primitive family or be wrapped by one clearly
- `_base/button-styles.ts` is shared button-family infrastructure and should remain subordinate to
  the canonical button/trigger primitive family rather than acting like an alternate public API

### One component package per directory

Every manifest-addressable component or reusable primitive family gets one directory:

- `src/ui/components/<domain>/<component-name>/`

Directory naming rules:

- kebab-case
- singular semantic name
- no implementation trivia in directory names
- no duplicate aliases for the same concept

Good:

- `nav-dropdown`
- `floating-menu`
- `data-table`
- `auto-form`

Avoid:

- `navDropdown`
- `dropdown2`
- `shared-nav-dropdown`
- `table-component-v2`

### Canonical package layout

Every manifest-addressable component directory should follow this layout:

```text
<component-name>/
  component.tsx
  schema.ts
  types.ts
  index.ts
  __tests__/
    schema.test.ts
    component.test.tsx
```

Optional files are allowed only when they have a clear purpose:

- `hook.ts`
- `constants.ts`
- `utils.ts`
- `format.ts`
- `slots.ts`
- `theme.ts`
- renderer-specific helpers such as `message-renderer.ts`
- static assets that are truly owned by the component

Optional files must be narrowly named and colocated. Do not create vague sprawl such as:

- `helpers.ts`
- `misc.ts`
- `temp.ts`
- `new.ts`

### File responsibility rules

#### `component.tsx`

Owns rendering and component-local orchestration.

May contain:

- render tree
- local state truly private to the component
- slot resolution
- primitive composition
- event dispatch wiring

Must not become:

- a second schema file
- a dumping ground for unrelated utility functions
- a place where reusable primitive behavior is silently duplicated

#### `schema.ts`

Owns the public declarative contract.

Must contain:

- the canonical Zod schema for the component declaration
- slot names owned by that component
- item schemas where relevant
- exports for schema-driven config typing when appropriate

Must not:

- duplicate shared base fragments inline when importing them is possible
- contain runtime rendering logic
- carry behavior that belongs in `component.tsx`

#### `types.ts`

Owns public TypeScript types for the package.

Use it for:

- config types inferred from schema where exported for consumers
- runtime helper types
- item types
- primitive prop types when they are part of the package contract

Rule:

- manifest-addressable components should have a `types.ts`
- reusable primitives should also have a `types.ts` when they expose any meaningful public type

#### `index.ts`

Owns the package's public surface.

Rules:

- named exports only
- no default exports
- export the main component
- export the canonical config schema
- export public types
- do not make `index.ts` a grab bag for unrelated transitive exports

#### `__tests__/schema.test.ts`

Owns declarative contract tests.

Required coverage:

- valid config acceptance
- invalid config rejection
- slot strictness
- alias normalization where aliases exist

#### `__tests__/component.test.tsx`

Owns runtime render and behavior tests.

Required coverage:

- visible rendering
- slot application
- state styling application where relevant
- primitive composition behavior where relevant

### Canonical optional files

Optional files are allowed, but only under clear conventions.

#### `hook.ts`

Use only when:

- there is meaningful headless logic worth isolating
- the hook is reused
- the hook materially simplifies component readability

Do not create `hook.ts` just to move half the component out of sight.

#### `slots.ts`

Use when:

- slot name constants
- slot-to-primitive mapping
- slot default definitions

need to be shared between schema/tests/component implementation.

This is especially useful for the universal styling rollout.

#### `constants.ts`

Use for stable component constants only.

Do not mix constants and helpers in the same file.

#### `utils.ts` / `format.ts`

Use only for pure local helpers.

If a helper is shared across component families, it should graduate to:

- `_base`
- `manifest`
- `workflows`
- or a primitive family helper

depending on ownership.

### Public import conventions

External code should import a component package through:

- the package root directory
- or a package's explicit `schema.ts` when schema-only access is needed

Examples:

- `./data/data-table`
- `./data/data-table/index`
- `./data/data-table/schema`

Avoid reaching into:

- `./data/data-table/component`
- deep internal helper files

except inside the package itself or in tightly coupled tests.

This keeps refactors safe and makes package boundaries real.

### Registration conventions

Manifest-addressable components must satisfy all of these:

1. have a package directory
2. expose a canonical schema from `schema.ts`
3. expose the component from `index.ts`
4. register through the central component registration path
5. avoid duplicating schema definitions in `register.ts`

`src/ui/components/register.ts` should remain:

- explicit
- side-effect free until registration is called
- organized by stable imports from component package roots or schema files

It must not become the place where API shape is invented.

### Primitive family directory rules

Primitive families in `primitives/` should be treated as product infrastructure.

They should have the same discipline as manifest-addressable grouped components.

That means:

- clear package directory
- public `index.ts`
- `types.ts` when public types exist
- `schema.ts` when the primitive is manifest-addressable
- tests proportional to surface area

Even when a primitive is currently only internally composed, its package structure should still be
clean enough to become public without a rewrite.

### Current audit of structural inconsistencies

The current repo is close to a pattern, but not fully consistent.

#### Missing `types.ts`

Current examples:

- `feedback/default-error`
- `feedback/default-loading`
- `feedback/default-not-found`
- `feedback/default-offline`
- `layout/split-pane`
- `primitives/divider`
- `primitives/floating-menu`
- `primitives/link`
- `primitives/oauth-buttons`
- `primitives/passkey-button`
- `primitives/stack`
- `primitives/text`
- `forms/button`

Interpretation:

- some of these may not need rich public types today
- the repo still needs one standard, so this should be normalized rather than left ad hoc

#### Missing `schema.ts`

Current examples:

- `forms/button`
- `primitives/floating-menu`

Interpretation:

- `forms/button` behaves like a reusable primitive family and should have a clearer canonical package
  contract
- `floating-menu` is a core primitive family for the universal system and should have an explicit
  schema or explicitly documented internal-only status during cutover

#### Missing `__tests__`

Many packages still lack local tests despite being public component packages.

Notable examples include:

- `layout/nav-dropdown`
- `layout/nav-link`
- `layout/nav-user-menu`
- `navigation/accordion`
- `navigation/stepper`
- `navigation/tree-view`
- `overlay/context-menu`
- `overlay/popover`
- most primitive families

This matters because the universal slot/state cutover is exactly the kind of change that drifts
without colocated package tests.

#### Extra helper files are inconsistent but acceptable when disciplined

Examples already present:

- `content/rich-text-editor/toolbar.ts`
- `content/rich-text-editor/cm-theme.ts`
- `communication/message-thread/message-renderer.ts`
- `data/stat-card/format.ts`
- `data/feed/relative-time.ts`

These are acceptable patterns if they remain:

- local to the package
- narrowly named
- not silently promoted to cross-repo dependencies

### Repository structure cutover rules

1. Do not invent new per-package layouts during this rollout.
2. When touching a package materially, bring it to the canonical package layout unless there is a
   strong reason not to.
3. When extracting a new primitive family, create it with the canonical package layout from day one.
4. When a helper becomes cross-family infrastructure, move it to the proper shared owner rather than
   copying it.
5. When `_base` contains reusable visible primitive behavior, either formalize it as a primitive
   family or document why it remains infrastructure.

### Zero-context package checklist

A zero-context implementer opening a component directory should be able to infer:

1. `schema.ts` defines the public declaration contract
2. `types.ts` defines the public types
3. `component.tsx` defines runtime rendering
4. `index.ts` defines the public exports
5. `__tests__` proves contract and behavior

If a package does not make those answers obvious, the package is not yet structured well enough.

---

## Primitive Inventory and Current Audit

This section records the current primitive layer and the architectural gaps that must be closed.

### A. Existing reusable primitives or primitive-like building blocks

These already exist and should be treated as first-class building blocks in the universal system.

#### Clear primitives

- `src/ui/components/forms/button/component.tsx`
  - `ButtonControl`
  - config-driven `Button`
- `src/ui/components/primitives/floating-menu/component.tsx`
  - `FloatingPanel`
  - `MenuItem`
  - `MenuSeparator`
  - `MenuLabel`
  - `FloatingMenuStyles`
- `src/ui/components/primitives/link/component.tsx`
  - `Link`
- `src/ui/components/primitives/text/component.tsx`
  - `Text`
- `src/ui/components/primitives/stack/component.tsx`
  - `Stack`
- `src/ui/components/primitives/divider/component.tsx`
  - `Divider`

#### Primitive-like shared infrastructure that should be elevated or normalized

- `src/ui/components/_base/button-styles.ts`
  - shared button styling contract
  - currently used as a helper, not always via `ButtonControl`
- `src/ui/components/_base/context-menu-portal.tsx`
  - shared context-menu behavior and rendering
  - currently lives under `_base` instead of an explicit primitive namespace
- `src/ui/components/layout/collapsible/component.tsx`
  - reusable disclosure/show-hide behavior
  - likely a primitive candidate for accordion-like surfaces

### B. Current good examples

These follow the intended direction and should be used as reference implementations.

- `overlay/dropdown-menu`
  - already composes `FloatingPanel`, `MenuItem`, `MenuSeparator`, and `MenuLabel`
- `overlay/context-menu`
  - already delegates portal/menu behavior to `ContextMenuPortal`
- root component styling system
  - `extendedBaseComponentSchema`
  - `baseComponentConfigSchema`
  - `ComponentWrapper`

### C. Current violations: grouped components rolling their own behavior

These components currently violate the desired primitive-backed standard.

#### Menu / floating behavior duplication

- `layout/nav-dropdown/component.tsx`
  - owns positioned menu panel implementation
  - owns hover-open behavior
  - does not compose shared floating/menu primitives
- `layout/nav-user-menu/component.tsx`
  - owns positioned menu panel implementation
  - does not compose shared floating/menu primitives
- `layout/nav/component.tsx`
  - still owns bespoke hover/current visual behavior for nav items
  - still owns local dropdown-item rendering instead of converging on shared menu item primitives
- `overlay/popover/component.tsx`
  - owns outside-click handling
  - owns escape handling
  - owns floating positioning and animation locally instead of converging on shared floating
    primitives

#### Button / trigger duplication

- `overlay/dropdown-menu/component.tsx`
  - uses local trigger button implementation rather than composing `ButtonControl`
- `overlay/popover/component.tsx`
  - uses local trigger button implementation rather than composing `ButtonControl`
- `layout/nav-link/component.tsx`
  - uses local button-like rendering instead of composing a shared nav/link/button primitive
- `layout/nav-search/component.tsx`
  - owns local input shell and shortcut treatment
- many grouped components render raw `<button>` triggers with local styling instead of a shared
  trigger/button primitive

#### Disclosure / item-shell duplication

- `navigation/accordion/component.tsx`
  - owns disclosure trigger/content behavior locally
- `navigation/tabs/component.tsx`
  - owns tab trigger/panel shell behavior locally
- `navigation/stepper/component.tsx`
  - owns step trigger/item shell behavior locally
- `navigation/tree-view/component.tsx`
  - owns recursive row shell, selection shell, connector shell, and disclosure shell locally
- `navigation/breadcrumb/component.tsx`
  - owns link hover behavior imperatively via `onMouseEnter` / `onMouseLeave`
- `layout/split-pane/component.tsx`
  - mutates DOM style directly on hover for the resize handle

### D. Missing or under-specified primitives

These primitives are either missing or not yet enforced as first-class reusable building blocks.

1. **Floating content primitive family**
   - should unify popover, dropdown, nav-dropdown, nav-user-menu, and any menu-like overlay
2. **Menu surface primitive family**
   - should unify menu panel, menu item, menu separator, menu label, keyboard behavior
3. **Trigger/button primitive family**
   - grouped components should compose `ButtonControl` or a stricter trigger primitive, not just
     borrow button CSS helpers
4. **Disclosure primitive family**
   - should unify collapsible behavior, accordion trigger/content, tree expansion, and similar
     show/hide shells where practical
5. **Interactive item-shell primitive**
   - a reusable shell for selectable/current/disabled item rows would reduce repeated bespoke item
     rendering across nav, list-like surfaces, tree-view, tabs, and stepper

### E. Audit conclusion

Current state is **not yet universal and not yet fully primitive-backed**.

The biggest structural gaps are:

- shared primitives exist but are not mandatory
- some reusable behavior lives in `_base` helpers rather than explicit primitive contracts
- grouped components still hide or bypass primitive capability
- recursive grouped structures exist, but recursive declarative exposure is not yet codified

This spec closes those gaps by making primitive reuse and recursive declarative exposure mandatory.

---

## Primitive Convergence Plan

This is the repository-wide convergence plan for grouped components.

Each grouped component or grouped behavior must end in one of three states:

- **Reuse existing**: compose an existing primitive family directly
- **Extract primitive**: extract a missing primitive first, then compose it
- **Rewrite to compose**: replace a bespoke grouped implementation with primitive composition

### Convergence table

| Area                 | Component(s)                                                                 | Current state                             | Target primitive family                                              | Action                            |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- | --------------------------------- |
| Nav menus            | `layout/nav`, `layout/nav-dropdown`, `layout/nav-user-menu`                  | bespoke floating/menu behavior            | `FloatingPanel` + `MenuItem` / `MenuSeparator` / `MenuLabel`         | Rewrite to compose                |
| Overlay menus        | `overlay/dropdown-menu`                                                      | already primitive-backed                  | `FloatingPanel` + menu primitives                                    | Reuse existing                    |
| Context menu         | `overlay/context-menu`, `_base/context-menu-portal`                          | shared but not explicit primitive family  | menu/floating primitive family                                       | Extract or normalize primitive    |
| Popover              | `overlay/popover`                                                            | bespoke floating behavior                 | `FloatingPanel`-family plus trigger primitive                        | Rewrite to compose                |
| Hover card           | `overlay/hover-card`                                                         | likely bespoke floating behavior          | `FloatingPanel`-family plus hover trigger primitive                  | Rewrite to compose                |
| Command palette      | `overlay/command-palette`                                                    | bespoke list/menu/search behavior         | menu surface + input/search primitive families                       | Extract primitive(s) then compose |
| Nav links            | `layout/nav-link`, `navigation/prefetch-link`, `primitives/link`             | split across multiple link shells         | link/navigation-link primitive family                                | Extract or normalize primitive    |
| Button-like triggers | dropdown trigger, popover trigger, action triggers across grouped components | inconsistent use of button primitive      | `ButtonControl` or stricter trigger primitive                        | Rewrite to compose                |
| Disclosure           | `layout/collapsible`, `navigation/accordion`, tree expansion shells          | split behavior                            | disclosure/collapsible primitive family                              | Extract or normalize primitive    |
| Tabs                 | `navigation/tabs`                                                            | bespoke trigger/panel shell               | tabs primitive family or shared trigger/panel shell                  | Extract primitive                 |
| Stepper              | `navigation/stepper`                                                         | bespoke item-shell and progress rendering | interactive item-shell + connector primitive family                  | Extract primitive(s)              |
| Tree view            | `navigation/tree-view`                                                       | bespoke recursive row/disclosure shell    | disclosure + interactive item-shell primitive family                 | Extract primitive(s)              |
| Breadcrumb           | `navigation/breadcrumb`                                                      | bespoke link hover shell                  | link/navigation-link primitive family + separator primitive          | Rewrite to compose                |
| Toggle group         | `forms/toggle-group`                                                         | bespoke segmented-control shell           | toggle/segmented-control primitive family                            | Extract primitive                 |
| Auto form fields     | `forms/auto-form`                                                            | grouped but mostly local field shells     | field-shell/input/label/helper/error primitive family                | Extract or normalize primitive    |
| Wizard               | `forms/wizard`                                                               | grouped step + field orchestration        | stepper/disclosure + field primitive families                        | Rewrite to compose                |
| Data list            | `data/list`                                                                  | bespoke interactive item row shell        | interactive item-shell + badge/icon primitives                       | Extract primitive(s)              |
| Data table           | `data/data-table`                                                            | bespoke table cell/row/action shells      | table surface primitives + button primitive + context menu primitive | Extract primitive(s)              |
| Timeline             | `content/timeline`                                                           | grouped rich item shell                   | interactive item-shell + divider/connector primitive family          | Extract primitive(s)              |
| Kanban               | `workflow/kanban`                                                            | grouped board/column/card interactions    | interactive item-shell + drag/drop board primitive family            | Extract primitive(s)              |
| Carousel             | `media/carousel`                                                             | grouped viewport/slide/indicator behavior | carousel primitive family                                            | Extract primitive                 |

### Interpretation rules

1. `Reuse existing` means the component should not keep its current private implementation if the
   primitive already covers the behavior.
2. `Extract primitive` means implementation must not add styling hooks to the bespoke version and
   stop there; extraction is part of the required work.
3. `Rewrite to compose` means the grouped component should become orchestration plus slot/default
   forwarding on top of primitives.

### Primitive families to formalize

These are the primitive families the repo should converge on.

1. **Button / Trigger**
   - basis: `ButtonControl`, `_base/button-styles.ts`
   - target: all grouped action/trigger buttons compose this family
2. **Link / Navigation Link**
   - basis: `primitives/link`, `navigation/prefetch-link`
   - target: one canonical link family for standard links, navigational links, and prefetch-capable links
3. **Floating Surface**
   - basis: `FloatingPanel`
   - target: dropdowns, popovers, hover cards, user menus, floating nav panels
4. **Menu Surface**
   - basis: `MenuItem`, `MenuSeparator`, `MenuLabel`
   - target: all menu-like grouped UIs
5. **Disclosure**
   - basis: `layout/collapsible`
   - target: accordion/tree/show-hide shells
6. **Interactive Item Shell**
   - basis: none yet canonical
   - target: selectable/current/disabled repeated rows across nav, list, tree, stepper
7. **Field Shell**
   - basis: none yet canonical
   - target: label/input/helper/error wrappers across forms
8. **Table Surface**
   - basis: none yet canonical
   - target: header cell / row / cell / action cell shells
9. **Progress / Connector**
   - basis: none yet canonical
   - target: stepper connectors, timeline connectors, related progress shells

### Cutover order

The order matters. Primitive extraction must precede broad grouped rewrites.

#### Wave 1: Existing primitive convergence

1. standardize floating/menu primitives as the mandatory menu/floating family
2. standardize button/trigger primitive usage around `ButtonControl`
3. standardize link/navigation-link primitive usage

Deliverables:

- nav dropdowns converge on shared floating/menu primitives
- popover and hover-card stop owning bespoke floating mechanics
- grouped triggers stop using local ad hoc button shells where a button primitive fits

#### Wave 2: Disclosure and item-shell extraction

1. formalize disclosure primitive family from `layout/collapsible`
2. extract canonical interactive item-shell primitive

Deliverables:

- accordion/tree/nav/list/stepper converge on shared item-shell/disclosure patterns

#### Wave 3: Form and table surface extraction

1. extract field-shell primitive family
2. extract table surface primitive family

Deliverables:

- auto-form and wizard become orchestration over field primitives
- data-table stops hand-owning every cell/row shell

#### Wave 4: Advanced grouped systems

1. timeline
2. kanban
3. carousel
4. command palette

Deliverables:

- advanced grouped systems compose primitive families instead of becoming isolated islands

### Exit condition for convergence

A grouped component is considered converged only when all of the following are true:

1. It does not privately re-implement an existing primitive behavior.
2. It exposes configuration declaratively for the primitives it composes.
3. Its visible surfaces participate in canonical `slots` / `states`.
4. Its primitive/composable equivalent path is not weaker in styling or configurability.

---

## Audit of the Prior Draft

The previous draft moved in the right direction but was not yet foundational enough for the product
bar required here.

### 1. It was still component-specific

The previous draft introduced per-component fields such as:

- `itemClassName`
- `activeItemClassName`
- `dropdownItemClassName`
- `activeDropdownItemClassName`
- `headerClassName`
- `cellClassName`

That approach does not scale. It creates a new surface-specific API every time a component gains a
new visible element. It is schema growth by enumeration rather than a system.

### 2. It made grouped elements second-class

The prior draft only added `className` and `style` to item schemas. Snapshot already has a richer
declarative style vocabulary at the component root:

- spacing
- typography
- color
- radius
- shadow
- background
- hover/focus/active
- responsive values

If grouped elements only get `className` and `style`, they remain less capable than primitives.
That violates the product requirement.

### 3. It treated grouping as a custom API rather than syntactic sugar

The product requirement is:

> I should be able to use primitives in a manifest and fully customize them. Anything grouping
> them should be syntactical sugar and should still be customizable via declarations.

The previous draft added collection-specific fields instead of defining a canonical slot/state
model that any grouping component can forward to its rendered surfaces.

### 4. It under-specified composable nav

The repository already has two nav paths:

- grouped nav via `navigation.items`
- composable nav via `navigation.template` and `nav-link` / `nav-dropdown` / `nav-section` /
  `nav-user-menu`

Any universal styling system that upgrades only grouped nav is incomplete.

### 5. It mixed clean-cutover language with compatibility language

This repo is pre-prod with no external consumers. We should not design around hypothetical backward
compatibility. Dogfood manifests, tests, and examples may change in the same cutover.

### 6. It did not define a universal merge contract

The prior draft specified merge behavior for a few nav fields, but not a single merge algorithm
that works for all:

- primitives
- grouped items
- grouped item sub-elements
- stateful surfaces

Without one merge contract, the system will fragment by component.

---

## Canonical System Model

Snapshot UI is composed of **styleable elements**.

Every rendered component, item, and sub-element must fit this model:

1. A component renders one or more **named slots**.
2. Each slot renders a visible **element**.
3. Each element may be styled in the default state and in named runtime states.
4. Grouping components apply defaults to slots, but individual items may override them.
5. Primitive components and grouped components use the same element styling contract.
6. Grouping components compose shared UI-library primitives wherever the behavior already exists.

### Terminology

- **Primitive**: a directly rendered component or element surface with its own styling contract.
- **Grouping component**: a component that renders repeated or nested primitives/surfaces.
- **Slot**: a named visible surface rendered by a component or item.
- **State**: a runtime condition that changes styling, such as `active`, `disabled`, `open`, or `selected`.
- **Surface**: shorthand for a visible slot instance.

### Examples

#### Primitive

A button has one main visible slot:

- `root`

A more complex primitive may expose:

- `root`
- `icon`
- `label`

#### Grouping component

A nav may expose:

- `root`
- `brand`
- `list`
- `item`
- `itemLabel`
- `itemIcon`
- `itemBadge`
- `dropdown`
- `dropdownItem`
- `dropdownItemLabel`
- `dropdownItemIcon`
- `userMenu`
- `userMenuItem`

A data table may expose:

- `root`
- `headerRow`
- `headerCell`
- `row`
- `cell`
- `emptyState`
- `toolbar`
- `bulkActions`

The architecture must not require a custom schema invention for each of these surfaces.

---

## Canonical Declarative Contract

### Rule 1: Every visible surface is styleable

Every visible render surface must support the same declarative styling contract as a primitive
component root.

That contract includes:

- `className`
- `style`
- universal style props already supported by `extendedBaseComponentSchema`
- interactive style props where relevant (`hover`, `focus`, `active`)

This is the most important system rule in the spec.

### Rule 2: Grouping components do not get bespoke visual APIs

Canonical grouped customization must not rely on fields like:

- `itemClassName`
- `activeItemClassName`
- `tabClassName`
- `panelClassName`
- `headerClassName`

Those are convenience aliases at best. They are not the canonical API.

The canonical API is:

- slot defaults
- slot state defaults
- per-item slot overrides
- per-item slot state overrides

### Rule 3: Grouping is syntactic sugar over styleable slots

If a grouped component renders an item and that item renders a label, icon, and badge, each of
those surfaces must be addressable declaratively.

A grouping component may provide convenience defaults, but it may not hide the underlying surfaces.

### Rule 3a: Grouping components must compose UI-library primitives

Grouping components are not allowed to privately re-implement primitive UI patterns that already
exist in the repository.

Examples:

- menus and floating panels must use shared menu/floating primitives
- shared menu item rendering must not be duplicated per grouped component
- shared dismiss, positioning, and keyboard behavior must not be re-implemented ad hoc

If the needed primitive does not exist yet, the correct implementation sequence is:

1. extract or create the primitive in the UI library
2. define its canonical slot contract
3. compose it from grouped components

Not allowed:

- bespoke absolute-positioned dropdowns inside grouped components
- private menu item renderers where a shared menu primitive already exists
- duplicate hover/focus/current behavior logic scattered across grouped components

### Rule 4: The same styling vocabulary applies everywhere

If a primitive root supports:

- `padding`
- `bg`
- `borderRadius`
- `fontSize`
- `hover`
- `focus`
- `active`
- responsive values

then an item root or item sub-element must be able to use the same vocabulary.

No second-class item API.

### Rule 5: Implementation keeps structural styles, not visual policy

Components may keep structural requirements in code:

- layout mechanics
- positioning
- containment
- truncation
- necessary reset styles

But visual policy must be declarative:

- colors
- spacing intent
- radius
- weight
- hover treatment
- selected/current/active appearance
- per-item differentiation

### Rule 6: Shared behavioral primitives own behavior

When a shared primitive exists for behavior, grouped components must delegate behavior to that
primitive rather than reproducing it locally.

Examples of behavior owned by primitives:

- floating positioning
- outside-click dismissal
- escape-to-close
- menu keyboard semantics
- shared menu item rendering
- shared trigger interaction patterns

This rule exists to prevent grouped components from turning into private UI frameworks.

---

## Schema Standard

This spec standardizes on three schema building blocks:

1. **styleable element schema**
2. **slot map schema**
3. **state map schema**

### 1. Styleable Element Schema

This is the canonical styling fragment for any visible surface.

It must reuse the existing universal style prop vocabulary from `_base/schema.ts`.

Proposed export from `src/ui/components/_base/schema.ts`:

```ts
/**
 * Canonical styling contract for any visible render surface.
 *
 * This is intentionally the same styling vocabulary as a component root.
 * Grouped items and sub-elements must not become second-class.
 */
export const styleableElementFields = {
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),

  padding: responsiveSpacing.optional(),
  paddingX: responsiveSpacing.optional(),
  paddingY: responsiveSpacing.optional(),
  margin: responsiveSpacing.optional(),
  marginX: responsiveSpacing.optional(),
  marginY: responsiveSpacing.optional(),
  gap: responsiveSpacing.optional(),
  width: responsiveString.optional(),
  minWidth: responsiveString.optional(),
  maxWidth: responsiveString.optional(),
  height: responsiveString.optional(),
  minHeight: responsiveString.optional(),
  maxHeight: responsiveString.optional(),
  bg: z.union([colorRef, componentBackgroundSchema]).optional(),
  color: colorRef.optional(),
  borderRadius: z.union([radiusEnum, z.string()]).optional(),
  border: z.string().optional(),
  shadow: z.union([shadowEnum, z.string()]).optional(),
  opacity: z.number().min(0).max(1).optional(),
  overflow: z.enum(["auto", "hidden", "scroll", "visible"]).optional(),
  cursor: z.string().optional(),
  position: z.enum(["relative", "absolute", "fixed", "sticky"]).optional(),
  inset: z.string().optional(),
  display: responsiveDisplay.optional(),
  flexDirection: responsiveFlexDirection.optional(),
  alignItems: z
    .enum(["start", "center", "end", "stretch", "baseline"])
    .optional(),
  justifyContent: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional(),
  flexWrap: z.enum(["wrap", "nowrap", "wrap-reverse"]).optional(),
  flex: z.string().optional(),
  gridTemplateColumns: z.string().optional(),
  gridTemplateRows: z.string().optional(),
  gridColumn: z.string().optional(),
  gridRow: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
  fontSize: responsiveFontSize.optional(),
  fontWeight: z.union([fontWeightEnum, z.number()]).optional(),
  lineHeight: z
    .union([
      z.enum(["none", "tight", "snug", "normal", "relaxed", "loose"]),
      z.string(),
    ])
    .optional(),
  letterSpacing: z
    .union([z.enum(["tight", "normal", "wide"]), z.string()])
    .optional(),

  hover: hoverConfigSchema.optional(),
  focus: focusConfigSchema.optional(),
  active: activeConfigSchema.optional(),
} as const;

export const styleableElementSchema = z.object(styleableElementFields).strict();
```

The actual implementation may factor this out of `extendedBaseComponentSchema` instead of
redeclaring the fields. The important part is: **one shared fragment, one vocabulary**.

### 2. State Map Schema

Pseudo-states such as `hover`/`focus`/`active` already exist in style props. Grouped surfaces also
need named runtime states that are not CSS pseudo-classes:

- `disabled`
- `selected`
- `current`
- `open`
- `completed`
- `invalid`

Canonical schema:

```ts
export const slotStateNameSchema = z.enum([
  "hover",
  "focus",
  "active",
  "disabled",
  "selected",
  "current",
  "open",
  "completed",
  "invalid",
]);

export const statefulElementSchema = styleableElementSchema.extend({
  states: z
    .record(slotStateNameSchema, styleableElementSchema.partial())
    .optional(),
});
```

Notes:

- `hover` / `focus` / `active` remain supported through existing root-level style props.
- `states` is the canonical universal way to style runtime states on grouped surfaces.
- Components do not need to support every state. They support the states that make semantic sense.
- Unsupported states must be ignored by implementation, not error at runtime.

### 3. Slot Map Schema

Canonical slot defaults for components and per-item overrides:

```ts
export function slotsSchema<const T extends readonly [string, ...string[]]>(
  slotNames: T,
) {
  return z
    .object(
      Object.fromEntries(
        slotNames.map((slot) => [slot, statefulElementSchema.optional()]),
      ) as Record<T[number], z.ZodOptional<typeof statefulElementSchema>>,
    )
    .strict();
}
```

This is the heart of the system.

Every component that renders internal visible surfaces must expose:

- component-level slot defaults
- item-level slot overrides where items exist

### 4. Canonical Alias Normalization

Aliases are allowed only as authoring sugar and must normalize immediately to canonical slot form.

Canonical normalization examples:

```ts
itemClassName                  -> slots.item.className
activeItemClassName            -> slots.item.states.current.className
disabledItemClassName          -> slots.item.states.disabled.className
dropdownClassName              -> slots.dropdown.className
dropdownItemClassName          -> slots.dropdownItem.className
activeDropdownItemClassName    -> slots.dropdownItem.states.current.className
tabClassName                   -> slots.tab.className
activeTabClassName             -> slots.tab.states.active.className
panelClassName                 -> slots.panel.className
headerClassName                -> slots.headerCell.className
cellClassName                  -> slots.cell.className
rowClassName                   -> slots.row.className
activeRowClassName             -> slots.row.states.selected.className
fieldClassName                 -> slots.field.className
labelClassName                 -> slots.label.className
inputClassName                 -> slots.input.className
```

Normalization rules:

1. Normalize at schema-parse or compiler-shape boundary, not inside ad hoc component render code.
2. Canonical `slots` always win if both alias and canonical values are present.
3. New features must target canonical `slots`, not aliases.
4. Aliases must never expose capabilities unavailable in canonical form.

---

## Canonical Manifest Shape

### Primitive

Primitive components keep their root-level styling contract and may add internal `slots` if they
render multiple visible surfaces.

Example:

```json
{
  "type": "tabs",
  "className": "w-full",
  "slots": {
    "tab": {
      "className": "rounded-none",
      "states": {
        "active": {
          "className": "bg-primary/20 text-foreground font-semibold"
        },
        "disabled": { "opacity": 0.5, "cursor": "not-allowed" }
      }
    },
    "panel": {
      "padding": "md"
    }
  }
}
```

### Grouping Component

A grouping component exposes:

- `slots`: component-level defaults for its visible surfaces
- per-item `slots`: overrides for the individual item's visible surfaces

Example:

```json
{
  "navigation": {
    "mode": "top-nav",
    "slots": {
      "item": {
        "className": "rounded-none",
        "states": {
          "hover": { "className": "bg-primary/18" },
          "current": {
            "className": "bg-primary/30 text-foreground font-semibold"
          }
        }
      },
      "dropdownItem": {
        "paddingY": "xs",
        "paddingX": "sm",
        "borderRadius": "none"
      }
    },
    "items": [
      {
        "label": "Dashboard",
        "path": "/"
      },
      {
        "label": "Settings",
        "path": "/settings",
        "slots": {
          "item": {
            "className": "ml-auto text-muted-foreground",
            "states": {
              "current": { "className": "text-warning" }
            }
          }
        }
      }
    ]
  }
}
```

This is the canonical pattern. It is generic enough to work for nav, tabs, accordion, list,
table, field groups, and any future grouped primitive.

### Recursive Declarative Exposure Rule

If a grouped component composes primitives internally, those primitives must remain declaratively
addressable through the parent declaration model.

This is a hard requirement.

#### Meaning

If a grouped component renders:

- an item trigger
- an item label
- an item icon
- a nested floating panel
- a nested menu item
- a nested disclosure surface

then the manifest author must be able to configure those surfaces declaratively through the parent
component's canonical contract.

The parent may expose that control through:

- canonical `slots`
- nested child component config
- or both

But the primitive behavior and surfaces may not disappear into private implementation code.

#### Two acceptable patterns

##### Pattern A: Slot-forwarded composition

The grouped component composes an internal primitive and forwards canonical surface config into it.

Example:

```json
{
  "navigation": {
    "slots": {
      "dropdown": { "className": "p-xs" },
      "dropdownItem": { "className": "rounded-none" }
    }
  }
}
```

##### Pattern B: Explicit nested primitive declaration

The grouped component lets the author declare the primitive directly in a nested structure.

Example:

```json
{
  "type": "nav-dropdown",
  "trigger": {
    "type": "button",
    "label": "More",
    "variant": "ghost"
  },
  "panel": {
    "type": "floating-menu",
    "slots": {
      "panel": { "className": "p-xs" },
      "item": { "className": "rounded-none" }
    }
  }
}
```

Either is acceptable. Hiding the primitive entirely is not.

#### Recursive rule

This requirement applies recursively.

If a grouped component contains a primitive that itself contains styleable internal surfaces:

- those internal surfaces must still be configurable through declarations
- grouped wrappers may set defaults
- grouped wrappers may not terminate the declaration chain

The manifest system must remain configurable all the way down to the visible surface.

### Canonical Shape for Grouped Item Schemas

When a component renders repeated items, the item schema must follow this pattern:

```ts
const exampleItemSchema = z
  .object({
    // item data
    label: z.string(),
    value: z.string().optional(),

    // canonical item-local surface overrides
    slots: slotsSchema(["item", "label", "icon", "badge"]).optional(),
  })
  .strict();
```

Notes:

- item-local `slots` target surfaces rendered by that item
- item-local `slots` are overrides, not a second default layer
- item-local `slots` may omit most surfaces
- item-local `slots` must be strict for the supported slot names of that component

### Canonical Shape for Grouping Component Schemas

When a component renders repeated items or internal visible surfaces, the component config must
follow this pattern:

```ts
const exampleGroupedConfigSchema = baseComponentConfigSchema
  .extend({
    type: z.literal("example-group"),
    items: z.array(exampleItemSchema),
    slots: slotsSchema([
      "root",
      "list",
      "item",
      "label",
      "icon",
      "badge",
    ]).optional(),
  })
  .strict();
```

Notes:

- component-level `slots` define defaults for all matching surfaces
- item-level `slots` override those defaults for one item instance
- root-level style props still apply to the component root
- internal slots never bypass the canonical merge contract

### Canonical Shape for Primitive Schemas

Primitive components that expose visible internal surfaces should also use `slots`.

```ts
const examplePrimitiveConfigSchema = baseComponentConfigSchema
  .extend({
    type: z.literal("example-primitive"),
    slots: slotsSchema([
      "root",
      "trigger",
      "panel",
      "icon",
      "label",
    ]).optional(),
  })
  .strict();
```

This preserves parity between primitive and grouped authoring.

---

## System Boundary and Coverage Rule

This system is universal by target, even if rollout lands in phases.

Phases are a sequencing tool. They are not an exemption list.

### Coverage rule

If Snapshot owns the JSX/HTML for a visible surface, that surface belongs to this system.

This includes:

- primitive components
- grouped components
- composable helper components
- internal-only components
- pre-prod and dogfood-only components
- wrapper components that render other primitives
- future components added after this spec

Temporary non-participating internals are allowed only when Snapshot does not own the actual inner
render tree.

Typical examples:

- native browser chrome inside a file input, date picker, or similar control
- third-party iframe/embed internals
- chart/canvas internals rendered wholly by an external library
- browser-managed selection UI

Even in those cases:

- the containing Snapshot surface must still be styleable
- any Snapshot-rendered wrapper, legend, tooltip, empty state, loading state, or overlay must still
  use the canonical contract

### Implementation consequence

No new component may land outside this contract.

Every component family must be able to answer:

1. which primitive family or families it composes
2. which visible slots it renders
3. how a declaration reaches those slots

If an implementer cannot answer all three, the component is not ready to merge.

### Rollout interpretation

When the coverage matrix later in this doc lists priority areas, read that as:

- first components to upgrade

not:

- only components that matter

The architectural target is still every Snapshot-owned visible component surface.

---

## Declarative Authoring Model

The manifest must separate concerns cleanly.

Do not mix semantic inputs, styling, state, and imperative behavior into one ambiguous bag.

### Canonical declaration layers

Every declaration should fit into one of these layers:

1. **Semantic component fields**
   - typed inputs with component meaning
   - examples: `label`, `items`, `path`, `icon`, `columns`, `fields`, `trigger`, `panel`
2. **Root surface styling**
   - root-level universal style props
   - optional `className`
   - optional `style`
3. **Internal surface styling**
   - `slots`
4. **Conditional rendering and bindings**
   - `visible`
   - `visibleWhen`
   - `fromRef`
   - `expr`
5. **Runtime data**
   - `resources`
6. **Runtime state**
   - `state`
7. **Side effects and orchestration**
   - `action`
   - `on`
   - `events`
   - `workflows`

This separation is foundational because a clean declarative system only scales if authors can tell:

- which field changes data or behavior
- which field changes visuals
- which field changes runtime flow

### `className` is optional, not required

`className` is an escape hatch and utility-class path. It is not the canonical proof of
customizability.

A manifest author must be able to customize a component using only:

- semantic fields
- universal style props
- `slots`
- `states`
- tokens

without needing `className`.

Implications:

- `className` must remain supported
- `className` must not be required for normal customization
- a component that is only truly customizable through `className` is under-specified

### `style` is the lowest-level escape hatch

`style` remains valid for values that are:

- not yet captured by the universal style vocabulary
- too specific to justify immediate schema expansion
- better expressed as raw CSS values than as token references

But `style` is not the primary system.

If a repeated visual need appears across multiple components, the correct fix is to expand the
shared styleable contract or token system, not to keep pushing authors toward raw inline style
objects.

### There is no generic `props` bag

The manifest system must not introduce a catch-all field such as:

- `props`
- `primitiveProps`
- `triggerProps`
- `panelProps`
- `nativeProps`
- `passThroughProps`

when those fields are just untyped bags.

Reason:

- untyped prop bags break schema discoverability
- they make zero-context execution weaker
- they hide API surface from docs and tooling
- they let components fork behavior invisibly

Required rule:

- if a value matters semantically, it must be an explicit typed schema field
- if a value matters visually, it belongs in root style props or `slots`
- if a child primitive needs semantic configuration, use a nested typed child declaration

### Allowed alternative to a prop bag: nested typed child declarations

Nested child declarations are allowed when the parent truly composes a child primitive or child
surface with meaningful semantic inputs.

Good:

- `trigger: { type: "button", ... }`
- `panel: { type: "floating-menu", ... }`
- `emptyState: { type: "empty-state", ... }`
- `footerAction: { type: "button", ... }`

Not good:

- `triggerProps: { ...anything... }`
- `panelProps: { ...anything... }`
- `buttonProps: { ...anything... }`

The difference is that typed child declarations remain:

- schema-validatable
- documentable
- recursively styleable
- zero-context executable

### Authoring decision tree

When deciding where a new declaration belongs, use this order:

1. If it changes semantic behavior or content, add a typed semantic field.
2. If it changes a visible surface's appearance, use root style props or `slots`.
3. If it changes the appearance of a surface in a runtime condition, use `states`.
4. If it is a pure dynamic value, use `fromRef`, `expr`, or computed state.
5. If it fetches or mutates remote data, use `resources`.
6. If it coordinates multiple side effects or branches, use `workflows`.

Do not skip directly to a catch-all field.

---

## Runtime Data, State, and Derived Model

The styling system has to align with the broader manifest runtime model, not float beside it.

Snapshot already has meaningful runtime concepts in the repo:

- `state`
- `resources`
- `workflows`
- `visibleWhen`
- `fromRef`
- `expr`
- `on` / `events`

This spec adopts those concepts and defines how styling interacts with them.

### 1. Semantic props are typed declaration fields

In manifest terms, "props" are not a generic React prop bag.

They are the component's schema-defined fields.

Examples:

- `label`
- `items`
- `path`
- `icon`
- `fields`
- `columns`
- `trigger`
- `open`
- `value`
- `selected`

Rules:

- semantic props remain component-specific and typed
- semantic props may accept literals, `fromRef`, `expr`, or other allowed binding forms where the
  underlying component schema supports them
- semantic props must not be overloaded to carry visual styling intent that belongs in `slots`

### 2. Mutable runtime state belongs in `manifest.state`

Named mutable or persisted state belongs in the manifest's `state` registry.

The current repo already supports key state capabilities:

- scope via `app` or `route`
- defaults
- persistence
- optional compute expressions
- optional data-backed state

System rules:

- use `state` for named runtime values that multiple components may read or write
- do not create one-off component-specific global state channels when named state is the right tool
- if a component needs a controlled semantic input, bind that input from state rather than inventing
  a visual-specific override field

Examples:

- current filter text
- selected entity id
- sidebar open state
- active wizard step
- persisted table density choice

### 3. Pure derived values are not `memo`; they are declarations

There should be no manifest-level `memo` feature.

React memoization is an implementation performance detail, not an author-facing configuration model.

Author-facing derived values should use declarative mechanisms that describe the data dependency
itself:

- `fromRef.transform` for simple transforms
- `expr` for expression-based derivation
- `visibleWhen` for visibility predicates
- `state.compute` for named derived state

Rules for derived declarations:

- they must be pure
- they must be deterministic
- they must be SSR-safe
- they must not perform side effects

If the need is "cache this fetch result", that belongs in `resources`, not a derived field.

If the need is "reuse this expensive render subtree", that is a code-level optimization, not a
manifest feature.

### 4. Async data belongs in `resources`

Remote fetching, cache invalidation, optimistic updates, poll intervals, and resource dependencies
belong in the manifest `resources` model.

Grouped styling must not create a second async configuration path.

Examples of correct usage:

- list/table/form data sources
- option loading
- dependent invalidation
- mutation submission targets

Examples of incorrect usage:

- embedding ad hoc fetch configuration inside slot styling declarations
- teaching grouped components to invent their own cache layer

### 5. Side effects and advanced orchestration belong in `workflows`

Multi-step logic belongs in the existing workflow model.

That includes:

- branching
- retry
- parallel execution
- assignment
- capture
- nested workflow execution

Component events should trigger:

- an `action`
- an `on` handler
- or a named workflow

They should not force authors into custom imperative callback APIs per component family.

### 6. Styling consumes runtime state; it does not replace it

The styling system interacts with runtime state in two ways:

1. runtime determines whether semantic states such as `current`, `selected`, `open`, `invalid`, or
   `disabled` are active
2. slot declarations determine how those active states look

That division is critical.

Runtime computes truth.
Declarations compute appearance.

### 7. Advanced operation taxonomy

When authors need more than static literals, the correct layer is:

1. **Literal declaration**
   - static value
2. **Reference binding**
   - `fromRef`
3. **Pure derivation**
   - `expr`
   - `visibleWhen`
   - `state.compute`
   - `fromRef.transform`
4. **Async data**
   - `resources`
5. **Side effects / orchestration**
   - `action`
   - `on`
   - `workflows`

Use the smallest layer that solves the problem.

Do not use:

- workflows for simple derivation
- slot states for data loading
- arbitrary props for orchestration
- fake `memo` fields for caching

---

## Slot State vs Conditional Surface Rule

Not every runtime difference should be represented as a slot `state`.

Use `states` only when the same visible surface still exists and only its appearance changes.

Good uses of `states`:

- `item.states.current`
- `row.states.selected`
- `input.states.invalid`
- `trigger.states.open`
- `tab.states.active`

Use separate slots when the runtime changes which surface subtree exists.

Good separate-slot examples:

- `emptyState`
- `loadingState`
- `errorState`
- `skeletonRow`
- `bulkActions`
- `footer`

Interpretation rule:

- appearance change on same surface -> `states`
- different rendered surface or subtree -> separate slot

This prevents `states` from becoming a dumping ground for entire alternative layouts.

---

## Primitive Exposure Contract

The recursive exposure rule earlier in the spec is upgraded here into an explicit implementation
contract.

### Core requirement

If a grouped component composes a primitive, the grouped component must preserve both:

- the primitive's behavior
- the primitive's declarative configurability

Reusing primitive code while hiding primitive control is not acceptable.

### Three allowed exposure mechanisms

A grouped component may expose the primitive through any of these mechanisms, so long as the result
is fully declarative and typed:

1. **Slot forwarding**
   - parent `slots` map onto child primitive surfaces
2. **Typed child declaration**
   - parent exposes a nested child config object
3. **Hybrid**
   - parent exposes typed child semantic config and also forwards slot defaults/overrides into the
     child's slots

### What must remain reachable

For every primitive composed inside a grouped component, declarations must be able to reach all
materially visible surfaces.

That means:

- root surface
- visible internal slots such as `icon`, `label`, `panel`, `separator`, `content`, `marker`
- relevant runtime states such as `open`, `current`, `selected`, `disabled`, `invalid`

If the primitive exposes user-visible semantics such as:

- `variant`
- `size`
- `tone`
- `align`
- `placement`
- icon presence
- label content

then the grouped component must either:

- forward those semantics explicitly
- or expose equivalent typed child declarations that preserve them

### Required primitive mapping artifact

Every grouped component that lands under this system must have an explicit mapping in code comments,
docs, or tests that answers:

- parent slot name -> child primitive slot name
- parent semantic field -> child primitive semantic field
- parent runtime state -> child primitive runtime state

Zero-context implementers should not need to reverse-engineer this from render code.

### Concrete examples

#### `nav-dropdown`

A converged `nav-dropdown` should expose declarations strong enough to style/configure:

- trigger button shell
- trigger icon
- trigger label
- floating panel
- dropdown item
- dropdown item icon
- dropdown item label
- separator and label rows where rendered

That can be expressed by:

- parent `slots`
- nested `trigger`
- nested `panel`

but it cannot be hidden behind a bespoke internal dropdown implementation.

#### `auto-form`

A converged `auto-form` should expose declarations strong enough to style/configure:

- field wrapper
- label
- input control
- helper text
- error text
- section wrapper

and each field type must still preserve the declarative power of the underlying input primitive.

#### `data-table`

A converged `data-table` should expose declarations strong enough to style/configure:

- table root
- toolbar
- header row and header cell
- body row and cell
- action triggers
- empty/loading/error surfaces

If action menus or row action triggers compose button/menu primitives, those primitive surfaces must
remain reachable.

### No frozen primitive defaults

The parent wrapper may establish defaults.

The parent wrapper may not permanently freeze child primitive visuals so that the manifest author
cannot override them.

Defaults are acceptable.
Hidden hardcoded policy is not.

---

## Sophisticated Manifest Authoring Examples

These examples are intentionally explicit. They show the intended authoring model after this spec is
implemented.

### Example A: No `className`, only universal props and slots

This is a valid product-grade goal state. `className` is not required.

```json
{
  "navigation": {
    "mode": "top-nav",
    "paddingX": "lg",
    "paddingY": "sm",
    "bg": "surface.elevated",
    "borderRadius": "lg",
    "shadow": "sm",
    "slots": {
      "item": {
        "paddingX": "sm",
        "paddingY": "xs",
        "borderRadius": "md",
        "color": "text.muted",
        "states": {
          "hover": { "bg": "surface.hover", "color": "text.default" },
          "current": {
            "bg": "brand.soft",
            "color": "brand.fg",
            "fontWeight": "semibold"
          }
        }
      },
      "dropdownItem": {
        "paddingX": "sm",
        "paddingY": "xs",
        "states": {
          "hover": { "bg": "surface.hover" },
          "current": { "bg": "brand.soft", "color": "brand.fg" }
        }
      }
    }
  }
}
```

### Example B: Grouped sugar plus item-level override

```json
{
  "navigation": {
    "mode": "sidebar",
    "slots": {
      "item": {
        "borderRadius": "md",
        "states": {
          "current": { "bg": "brand.soft", "color": "brand.fg" }
        }
      },
      "itemBadge": {
        "fontSize": "xs",
        "paddingX": "xs",
        "borderRadius": "full",
        "bg": "surface.subtle"
      }
    },
    "items": [
      {
        "label": "Inbox",
        "path": "/inbox",
        "badge": "12"
      },
      {
        "label": "Revenue",
        "path": "/revenue",
        "badge": "Beta",
        "slots": {
          "item": {
            "states": {
              "current": { "bg": "warning.soft", "color": "warning.fg" }
            }
          },
          "itemBadge": {
            "bg": "warning.soft",
            "color": "warning.fg"
          }
        }
      }
    ]
  }
}
```

### Example C: Typed semantics, runtime state, resources, workflows, and slots together

This illustrates the system boundary.

- semantic behavior stays in typed fields
- state stays in `state`
- async data stays in `resources`
- orchestration stays in `workflows`
- visuals stay in root style props and `slots`

```json
{
  "state": {
    "users.filters.query": {
      "scope": "route",
      "default": "",
      "persist": "sessionStorage"
    },
    "users.filters.hasQuery": {
      "scope": "route",
      "compute": "Boolean(state['users.filters.query'])"
    }
  },
  "resources": {
    "users.list": {
      "endpoint": "/api/users",
      "method": "GET"
    }
  },
  "workflows": {
    "users.row.open": [
      { "type": "assign", "values": { "selectedUserId": "{id}" } },
      { "type": "wait", "duration": 50 }
    ]
  },
  "routes": [
    {
      "id": "users",
      "path": "/users",
      "content": [
        {
          "type": "data-table",
          "id": "usersTable",
          "data": { "resource": "users.list" },
          "visibleWhen": "true",
          "slots": {
            "row": {
              "states": {
                "selected": { "bg": "brand.soft" }
              }
            },
            "headerCell": {
              "fontWeight": "semibold",
              "color": "text.muted"
            }
          }
        }
      ]
    }
  ]
}
```

The exact table/resource binding syntax may evolve with the component schema, but the separation of
concerns above must not.

### Example D: Explicit primitive declaration and grouped sugar must converge

Grouped sugar:

```json
{
  "type": "nav-dropdown",
  "label": "Workspace",
  "slots": {
    "trigger": { "borderRadius": "full" },
    "panel": { "padding": "xs" },
    "item": {
      "states": {
        "hover": { "bg": "surface.hover" }
      }
    }
  }
}
```

Explicit primitive path:

```json
{
  "type": "floating-menu",
  "trigger": {
    "type": "button",
    "label": "Workspace",
    "borderRadius": "full"
  },
  "slots": {
    "panel": { "padding": "xs" },
    "item": {
      "states": {
        "hover": { "bg": "surface.hover" }
      }
    }
  }
}
```

These two authoring paths do not have to be byte-for-byte identical.

They do have to be equivalent in visible customization power.

---

## Forbidden Patterns

The following patterns are explicitly forbidden because they destroy universality or zero-context
execution quality.

### Styling anti-patterns

- requiring `className` for normal customization
- giving grouped items only `className` / `style` while primitives get universal style props
- inventing new visual fields like `activeDropdownItemBg` when canonical `slots` can express it
- driving hover/current visuals through React state where CSS or canonical runtime state is
  sufficient
- mutating DOM styles imperatively for ordinary visual states

### Schema anti-patterns

- generic `props` bags
- generic `primitiveProps` bags
- `passThroughProps` escape hatches
- per-component parallel styling schemas
- aliases that expose more capability than canonical `slots`

### Runtime anti-patterns

- bespoke merge precedence per component
- component-specific visual CSS variable pipelines for item/sub-surface styling
- using workflow orchestration as a substitute for pure derivation
- introducing manifest-level `memo` features for problems already covered by `resources` or pure
  derivation

### Primitive anti-patterns

- grouped components rolling their own dropdown, popover, menu item, trigger, disclosure, or row
  shell when the primitive family exists
- grouped components composing shared primitives internally but hiding the primitive surfaces from
  declarations
- freezing child primitive visuals in wrapper code with no declarative override path

### Coverage anti-patterns

- treating composable helper components as out of scope because they are "internal"
- upgrading grouped nav but not composable nav
- landing new components on bespoke styling APIs while the universal system is in rollout

---

## Merge Contract

Every rendered surface must use one merge algorithm.

### Structural rule

Implementation-owned structural requirements apply first and are not part of the consumer merge
contract. They exist to make the component render correctly.

Examples:

- `display: flex`
- `position: relative`
- `overflow: hidden`
- list reset styles
- alignment required for layout mechanics

### Visual merge order

For a concrete rendered surface, merge in this order:

1. implementation structural base
2. implementation visual defaults for that slot
3. component root style props, if the slot is the root surface
4. component slot default base
5. item slot base, if this is an item surface
6. component slot state styles in canonical state order
7. item slot state styles in canonical state order
8. explicit raw `style` object last

For `className`, concatenate in the same order. Later entries win through normal CSS/Tailwind
precedence.

### Canonical state order

Use one deterministic order across the system:

1. `hover`
2. `focus`
3. `open`
4. `selected`
5. `current`
6. `active`
7. `completed`
8. `invalid`
9. `disabled`

Rationale:

- low-commitment interaction states first
- semantic/selection states next
- terminal/error states later
- `disabled` wins last

### State support rules

- Components only apply the states they can actually compute.
- Unsupported state entries are ignored.
- Per-item state overrides always win over component defaults for the same slot/state.

---

## Naming Standard

Do not invent field names ad hoc.

### Top-level component field names

- `className`
- `style`
- universal style props
- `slots`

### Group item field names

- item data fields
- `slots`

### Slot names

Use short semantic names, not implementation trivia.

Good:

- `root`
- `item`
- `label`
- `icon`
- `badge`
- `trigger`
- `panel`
- `content`
- `separator`
- `headerCell`
- `cell`
- `row`
- `input`
- `helper`
- `error`

Avoid:

- `itemButtonPrimarySurface`
- `tabContentWrapperInner`
- `navDropdownChildButton`

### Collection naming rule

Collection-level slots may be collection-qualified when needed:

- `item`
- `itemLabel`
- `itemIcon`
- `itemBadge`
- `dropdown`
- `dropdownItem`
- `dropdownItemLabel`

Per-item overrides may use the same global slot names for simplicity. Do not create a second
naming system for item-local slots unless required by implementation.

---

## Primitive-First Requirement

This section is the product requirement in engineering terms.

### Requirement

A manifest author must be able to build advanced UI by declaring primitives directly.

Grouping components are allowed only if they preserve that power:

- they may reduce repetition
- they may provide defaults
- they may package common structure
- they may not reduce access to visible surfaces

### Consequences

1. `nav-link`, `nav-dropdown`, `nav-section`, and `nav-user-menu` must participate in the same
   universal styling contract as grouped `navigation.items`.
2. A grouped component may not expose styling surfaces that the corresponding primitive path
   cannot express.
3. A grouped component may not be the only place where a visual capability exists.
4. A grouped component may not privately re-implement a primitive behavior already present in the
   UI library.

### Example standard

If grouped nav supports styling:

- current item
- icon
- badge
- dropdown item

then composable nav primitives must expose those same surfaces declaratively.

If the composable path cannot do it, the grouped path is over-specialized.

### Primitive extraction rule

If multiple grouped components need the same UI behavior, that behavior belongs in a primitive.

Typical examples:

- floating panel / popover positioning
- menu item semantics
- tabs trigger semantics
- accordion trigger/content semantics
- user menu panel behavior

Implementation sequence:

1. extract the primitive
2. define its slot contract
3. cut grouped components over to compose it
4. remove duplicated local implementations

Do not upgrade duplicated implementations in parallel and call the system universal.

### Recursive configuration requirement

Primitives used by grouped components must be exposed to declarations strongly enough that a
manifest author can still configure:

- the primitive root
- the primitive's visible internal slots
- the primitive's relevant runtime states

In other words:

- primitive behavior must be reused
- primitive configurability must also be reused

Reusing a primitive internally while hiding its configuration surface is not sufficient.

### No hidden composition rule

The following is explicitly disallowed:

- a grouped component uses `ButtonControl` internally but does not expose any way to configure the
  trigger surface declaratively
- a grouped component uses `FloatingPanel` internally but does not expose panel/item surface
  declarations
- a grouped component uses an item-shell primitive internally but hardcodes current/selected/disabled
  visuals in the wrapper

Primitive reuse without primitive exposure is only partial convergence and does not meet the bar.

---

## Theme and Token Rules

### One styling path

The system has exactly one visual styling path:

- design tokens
- universal style props
- `className`
- `style`

No parallel per-component visual token resolvers.

### What theme owns

Theme owns:

- token values
- semantic scales
- brand defaults
- behavioral defaults only where they select rendering paths

Theme does **not** own:

- per-item visual differentiation
- per-instance collection visuals
- per-sub-element visual overrides

### Obsolete API rule

Pre-prod means we should remove obsolete visual APIs rather than preserve them.

For nav specifically:

- remove visual properties from `theme.overrides.components.nav`
- update dogfood manifests in the same cutover
- do not keep a compatibility window

---

## Compiler and Runtime Invariants

### 1. One schema fragment, reused everywhere

The same styleable fragment must be reused in:

- component schemas
- manifest schemas
- grouped item schemas
- primitive child schemas

Do not duplicate ad hoc versions of the same contract.

### 2. Compiler is a pass-through for styling declarations

The compiler may normalize shape, but it must not reinterpret styling intent.

Allowed:

- passing `slots` through
- expanding sugar aliases into canonical `slots`
- filling in missing defaults

Not allowed:

- translating per-item styling into bespoke component CSS vars
- synthesizing component-specific styling concepts

### 3. Runtime computes state, not design intent

Runtime is responsible for:

- current route
- selected state
- disabled state
- open/closed state
- validation state

Runtime is **not** responsible for inventing visual policy.

### 4. SSR safety

All merge functions must be pure and deterministic:

- safe on server and client
- no hover state in React where CSS can handle it
- no hydration mismatch from visual-only state handling

### 5. Repository integration points must match reality

This spec must be implemented against the real handoff points in the repo, not against an assumed
compiler path.

Current critical integration points:

- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/component-wrapper.tsx`
- `src/ui/manifest/schema.ts`
- `src/ui/manifest/app.tsx`
- `src/ui/components/layout/nav/schema.ts`
- `src/ui/components/layout/nav/component.tsx`
- `src/ui/components/layout/nav-link/*`
- `src/ui/components/layout/nav-dropdown/*`
- `src/ui/components/layout/nav-section/*`
- `src/ui/components/layout/nav-user-menu/*`
- `src/ui/components/primitives/floating-menu/*`

Implementation rule:

- update the manifest schema and the runtime assembly path together
- do not assume `manifest/compiler.ts` is the only or primary nav shaping layer
- where two schemas or assembly paths exist, shared fragments must be imported rather than copied

The spec is not complete if the canonical contract exists in one path but not the other.

---

## Shared Runtime Utilities

Add a new file:

- `src/ui/components/_base/style-surfaces.ts`

Canonical exports:

```ts
export type RuntimeSurfaceState =
  | "hover"
  | "focus"
  | "open"
  | "selected"
  | "current"
  | "active"
  | "completed"
  | "invalid"
  | "disabled";

export function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string | undefined;

export function mergeStyles(
  ...styles: Array<Record<string, string | number> | undefined | null>
): Record<string, string | number> | undefined;

export function resolveSurfaceStateOrder(
  states: RuntimeSurfaceState[],
): RuntimeSurfaceState[];

export function resolveSurfaceConfig(params: {
  implementationBase?: Record<string, unknown>;
  componentSurface?: Record<string, unknown>;
  itemSurface?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
}): {
  className?: string;
  style?: Record<string, string | number>;
  resolvedConfigForWrapper?: Record<string, unknown>;
};
```

`resolvedConfigForWrapper` exists so sub-surfaces can reuse the same universal style prop
resolution path as `ComponentWrapper`, even when the surface is not itself a top-level component.

That is a critical architectural requirement.

### Required runtime behavior

`resolveSurfaceConfig(...)` must:

1. accept canonical slot config fragments
2. merge universal style props as data, not just `className`/`style`
3. return a resolved object that can be fed into shared style-prop resolution
4. support deterministic state ordering
5. avoid DOM access or browser APIs

### Required implementation pattern

For a rendered sub-surface:

1. compute the active runtime states
2. read component-level slot config for the slot
3. read item-level slot config for the slot, if present
4. resolve merged slot config
5. pass the merged result through the same style-prop resolver family used by top-level components

Do not:

- hand-assemble ad hoc inline style objects for each component forever
- interpret slot config differently by component
- use state-specific `className` fields outside canonical `states`

### Primitive composition helper rule

If a grouped component renders a shared primitive internally, the primitive should accept canonical
surface config rather than forcing the grouped component to flatten everything into bespoke
low-level props.

That keeps the primitive reusable and prevents grouped wrappers from becoming private adapters.

---

## Component Coverage Matrix

The contract lands once. Component coverage may phase in, but the canonical slot model is fixed
from the start.

This matrix is rollout priority, not a list of exempt components.

Anything Snapshot renders and owns is still expected to converge on this model. New components must
ship on this model rather than waiting for a later cleanup phase.

### Navigation

Grouped nav surfaces:

- `root`
- `brand`
- `brandIcon`
- `brandLabel`
- `list`
- `item`
- `itemLabel`
- `itemIcon`
- `itemBadge`
- `dropdown`
- `dropdownItem`
- `dropdownItemLabel`
- `dropdownItemIcon`
- `userMenu`
- `userMenuTrigger`
- `userMenuItem`
- `userAvatar`

Composable nav primitives must align:

- `nav-link`
- `nav-dropdown`
- `nav-section`
- `nav-user-menu`

Behavioral primitive requirement:

- floating panel behavior must converge on shared floating/menu primitives
- nav user menu and nav dropdown must not keep private menu implementations

### Overlay

- dropdown-menu: `root`, `trigger`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`
- context-menu: `root`, `trigger`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`

Behavioral primitive requirement:

- overlay menu surfaces should define the shared primitive behavior contract that nav menus also use

### Navigation Components

- tabs: `root`, `list`, `tab`, `tabLabel`, `tabIcon`, `panel`
- accordion: `root`, `item`, `trigger`, `triggerLabel`, `triggerIcon`, `content`
- breadcrumb: `root`, `item`, `link`, `current`, `separator`, `icon`
- stepper: `root`, `item`, `marker`, `label`, `description`, `connector`, `content`
- tree-view: `root`, `item`, `row`, `label`, `icon`, `badge`, `connector`, `disclosure`, `children`

Behavioral primitive requirement:

- if tabs, accordion, breadcrumb, or stepper share reusable trigger/content primitives, they
  should converge on those primitives rather than retaining isolated local interaction code

### Data

- data-table: `root`, `toolbar`, `headerRow`, `headerCell`, `row`, `cell`, `actionsCell`, `emptyState`, `bulkActions`
- list: `root`, `item`, `itemTitle`, `itemDescription`, `itemIcon`, `itemBadge`
- chart: `root`, `legend`, `legendItem`, `tooltip`, `series`, `axis`, `grid`

### Forms

- auto-form: `root`, `field`, `label`, `input`, `helper`, `error`, `section`
- toggle-group: `root`, `item`, `itemLabel`, `itemIcon`
- wizard: `root`, `steps`, `step`, `stepLabel`, `stepDescription`, `stepMarker`, `stepConnector`, `panel`, `actions`

### Advanced Grouped Systems

- timeline: `root`, `item`, `marker`, `connector`, `title`, `description`, `meta`, `content`
- kanban: `root`, `column`, `columnHeader`, `columnTitle`, `columnCount`, `columnBody`, `card`, `cardTitle`, `cardDescription`, `cardMeta`
- carousel: `root`, `viewport`, `track`, `slide`, `controls`, `prevButton`, `nextButton`, `indicator`, `indicatorItem`

Coverage is complete only when every listed surface can be addressed through the canonical slot
contract where the surface is visibly rendered.

### Coverage implementation rule

For every component in this matrix, a zero-context implementer must answer three questions before
starting edits:

1. What visible surfaces does this component actually render today?
2. Which of those surfaces are styleable only through hardcoded inline styles today?
3. Which schema layer needs `slots` so those surfaces become declaratively reachable?

If the answer is unclear, the implementer must inspect the component code and update the matrix or
the component before proceeding.

### Mandatory Primitive Reuse Matrix

This matrix defines which grouped behaviors must converge on which primitive families.

| Behavior                     | Canonical primitive family                            | Components that must use it or converge on it                                                       |
| ---------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Floating positioned panel    | `FloatingPanel`-family                                | `dropdown-menu`, `nav-dropdown`, `nav-user-menu`, `popover`, future floating menus                  |
| Menu item rendering          | `MenuItem` / `MenuSeparator` / `MenuLabel`-family     | `dropdown-menu`, nav dropdown/menu surfaces, context-menu-like surfaces where semantics align       |
| Button / trigger shell       | `ButtonControl`-family or stricter trigger primitive  | dropdown triggers, popover triggers, grouped action triggers, nav trigger surfaces where applicable |
| Collapsible/disclosure shell | `Collapsible`-family or stricter disclosure primitive | accordion, tree expansion shells, future disclosure-based grouped components                        |
| Link-like navigation shell   | `Link` / navigation-link primitive family             | breadcrumb links, nav links, prefetch-capable nav/link surfaces where semantics align               |
| Interactive item shell       | extracted shared item-shell primitive if needed       | nav item rows, tree rows, stepper step triggers, selectable grouped item rows                       |

Matrix rules:

1. If a component in the right column does not currently use the primitive family, that is
   implementation debt to remove.
2. If the primitive family is insufficient, improve or extract it rather than bypassing it.
3. Grouped components may layer defaults and orchestration on top, but not fork the behavior.

---

## Package-by-Package Cutover Matrix

This matrix is the authoritative package execution list for the foundation cutover.

Every row is written as if a zero-context implementer is starting from scratch. If a package is
listed here, the agent should not reinterpret its role.

### Matrix field meanings

- **Owner**
  - `foundation`: shared repo/runtime infrastructure
  - `primitive`: reusable primitive family
  - `grouped`: grouped or domain composition package
  - `planned primitive`: package that should be created during cutover if extraction is required
- **Target contract**
  - the primitive family or canonical contract the package must end on
- **Required cutover**
  - what must change structurally or behaviorally
- **Priority**
  - `now`: first-stack work
  - `next`: immediately after first-stack work
  - `later`: after core cutover is stable, but still in scope

### Foundation modules

| Path                                            | Owner      | Target contract                              | Required cutover                                                                                                                    | Priority |
| ----------------------------------------------- | ---------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `src/ui/components/_base/schema.ts`             | foundation | canonical styleable element fragments        | export `styleableElementFields`, `styleableElementSchema`, `statefulElementSchema`, `slotsSchema(...)`; remove duplication pressure | now      |
| `src/ui/components/_base/component-wrapper.tsx` | foundation | shared root and sub-surface style resolution | expose reusable resolution path for non-root surfaces; do not stay root-only                                                        | now      |
| `src/ui/components/_base/style-props.ts`        | foundation | single universal style vocabulary            | remain source of style prop semantics; do not fork for grouped surfaces                                                             | now      |
| `src/ui/components/_base/style-surfaces.ts`     | foundation | canonical sub-surface merge runtime          | create new shared merge/state resolution utility                                                                                    | now      |
| `src/ui/manifest/schema.ts`                     | foundation | single manifest-side declarative contract    | import shared slot/state fragments; normalize aliases; keep one manifest vocabulary                                                 | now      |
| `src/ui/manifest/app.tsx`                       | foundation | real nav/runtime handoff alignment           | pass canonical slot/state config through live app assembly path                                                                     | now      |
| `src/ui/entity-pages/AppShellWrapper.tsx`       | foundation | shell parity with app assembly               | ensure entity-page shell path uses same nav contract and does not lag behind main app shell                                         | now      |
| `src/ui/manifest/runtime.tsx`                   | foundation | runtime state/resource/workflow alignment    | remain canonical runtime state/data layer; do not add visual-specific side channels                                                 | next     |
| `src/ui/components/register.ts`                 | foundation | consistent package-root registration         | import from package roots or explicit `schema.ts`; do not invent API shape here                                                     | next     |

### Existing primitive and primitive-adjacent packages

| Path                                              | Owner                            | Target contract                           | Required cutover                                                                                     | Priority |
| ------------------------------------------------- | -------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- |
| `src/ui/components/forms/button`                  | primitive                        | canonical button/trigger family           | normalize package layout; add explicit schema/types story; become the button/trigger source of truth | now      |
| `src/ui/components/primitives/floating-menu`      | primitive                        | canonical floating/menu family            | normalize package layout; add explicit schema/types story; own panel/item/separator/label contract   | now      |
| `src/ui/components/primitives/link`               | primitive                        | canonical link/navigation-link family     | add public types/tests; align grouped link consumers to it                                           | next     |
| `src/ui/components/layout/collapsible`            | primitive-adjacent               | canonical disclosure family seed          | either remain package root for disclosure family or be formalized into primitive disclosure contract | next     |
| `src/ui/components/_base/context-menu-portal.tsx` | foundation -> primitive-adjacent | explicit context/floating primitive infra | stop living as hidden behavior island; either fold into floating/menu family or wrap cleanly         | next     |
| `src/ui/components/_base/button-styles.ts`        | foundation -> primitive-adjacent | button-family infra only                  | subordinate to button/trigger family; must not remain alternate public styling path                  | next     |
| `src/ui/components/primitives/text`               | primitive                        | canonical text primitive                  | add public types/tests as needed; keep slot/state parity if internal slots expand                    | later    |
| `src/ui/components/primitives/stack`              | primitive                        | canonical stack/layout primitive          | add public types/tests as needed; maintain package discipline                                        | later    |
| `src/ui/components/primitives/divider`            | primitive                        | canonical divider/separator primitive     | add public types/tests; align separator-like grouped consumers where semantics fit                   | later    |

### Grouped packages in first cutover wave

| Path                                        | Owner              | Target contract                                              | Required cutover                                                                                                          | Priority |
| ------------------------------------------- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| `src/ui/components/layout/nav`              | grouped            | nav shell over button/link/floating/menu/item-shell families | remove bespoke item/menu rendering; add canonical slots/per-item slots/state handling; preserve grouped/composable parity | now      |
| `src/ui/components/layout/nav-link`         | grouped/composable | nav-link over link/button family                             | stop bespoke button-like rendering; expose canonical slots/states                                                         | now      |
| `src/ui/components/layout/nav-dropdown`     | grouped/composable | nav dropdown over button + floating/menu family              | remove private dropdown implementation; expose trigger/panel/item slots; preserve primitive configurability               | now      |
| `src/ui/components/layout/nav-section`      | grouped/composable | nav grouping shell over canonical slots                      | expose header/content/item surfaces cleanly; do not invent custom visual fields                                           | now      |
| `src/ui/components/layout/nav-user-menu`    | grouped/composable | user menu over button + floating/menu family                 | remove private menu implementation; expose trigger/avatar/panel/item surfaces                                             | now      |
| `src/ui/components/overlay/dropdown-menu`   | grouped            | menu wrapper over button + floating/menu family              | align trigger with button family; keep menu surfaces canonical                                                            | now      |
| `src/ui/components/overlay/context-menu`    | grouped            | context-menu over floating/menu family                       | converge with menu family contract; expose canonical slots/states                                                         | now      |
| `src/ui/components/overlay/popover`         | grouped            | floating content over trigger + panel family                 | remove bespoke outside-click/escape/positioning implementation where shared family covers it                              | now      |
| `src/ui/components/overlay/hover-card`      | grouped            | hover-triggered floating content                             | converge on floating family and canonical trigger/panel/content slots                                                     | next     |
| `src/ui/components/overlay/command-palette` | grouped            | command surface over input + list/menu/item-shell families   | extract missing primitives before exposing grouped sugar; do not keep isolated list/search shell                          | next     |

### Grouped packages in second cutover wave

| Path                                      | Owner   | Target contract                                     | Required cutover                                                                                   | Priority |
| ----------------------------------------- | ------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| `src/ui/components/navigation/tabs`       | grouped | tabs family over trigger/panel/item-shell semantics | expose canonical slots/states; decide whether tabs primitive family is extracted                   | next     |
| `src/ui/components/navigation/accordion`  | grouped | disclosure/item-shell family                        | remove bespoke disclosure shell once primitive contract exists                                     | next     |
| `src/ui/components/navigation/breadcrumb` | grouped | link/separator family                               | remove bespoke hover logic; expose link/current/separator surfaces                                 | next     |
| `src/ui/components/navigation/stepper`    | grouped | item-shell + connector family                       | expose current/completed/disabled semantics canonically; extract connector/item-shell if needed    | next     |
| `src/ui/components/navigation/tree-view`  | grouped | disclosure + item-shell family                      | expose recursive row/disclosure/children surfaces; remove bespoke recursive shell duplication      | next     |
| `src/ui/components/data/list`             | grouped | item-shell + badge/icon family                      | remove bespoke interactive row shell; expose empty/loading/error/list item surfaces                | next     |
| `src/ui/components/data/data-table`       | grouped | table surface + action trigger/menu family          | expose header/cell/row/actions/empty/loading/error; extract reusable table primitives where needed | next     |
| `src/ui/components/forms/auto-form`       | grouped | field-shell + input/label/helper/error families     | stop hiding field/input primitive capability; expose field-level slots and states                  | next     |
| `src/ui/components/forms/toggle-group`    | grouped | segmented/toggle family                             | remove bespoke segmented shell; expose item/itemLabel/itemIcon states                              | next     |
| `src/ui/components/forms/wizard`          | grouped | stepper + field-shell families                      | expose step/panel/actions surfaces; reuse field and stepper primitives instead of local shells     | next     |

### Grouped packages in advanced cutover wave

| Path                                 | Owner   | Target contract                                     | Required cutover                                                                             | Priority |
| ------------------------------------ | ------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| `src/ui/components/content/timeline` | grouped | item-shell + connector family                       | expose marker/connector/content/meta/title surfaces; extract connector/item-shell if missing | later    |
| `src/ui/components/workflow/kanban`  | grouped | board/column/card family over item-shell primitives | expose column/card shells canonically; avoid isolated drag/drop rendering islands            | later    |
| `src/ui/components/media/carousel`   | grouped | carousel primitive family                           | expose viewport/slide/control/indicator surfaces and states canonically                      | later    |

### Planned primitive packages to create when extraction is required

| Target package path                              | Owner             | Target contract                      | Required cutover                                                                                                    | Priority |
| ------------------------------------------------ | ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------- |
| `src/ui/components/primitives/disclosure`        | planned primitive | canonical disclosure family          | extract from `layout/collapsible` plus accordion/tree usage if existing package cannot cleanly serve primitive role | next     |
| `src/ui/components/primitives/item-shell`        | planned primitive | canonical interactive row/item shell | unify selectable/current/disabled repeated rows across nav/list/tree/stepper                                        | next     |
| `src/ui/components/primitives/field-shell`       | planned primitive | canonical field wrapper family       | unify label/input/helper/error/required/invalid shells across forms                                                 | next     |
| `src/ui/components/primitives/table-surface`     | planned primitive | canonical table surface family       | unify header row/cell/body row/cell/action cell shells                                                              | later    |
| `src/ui/components/primitives/connector`         | planned primitive | canonical progress/connector family  | unify stepper/timeline/related connector visuals and semantics                                                      | later    |
| `src/ui/components/primitives/segmented-control` | planned primitive | canonical toggle-group family        | unify segmented/toggle item rendering and states                                                                    | later    |

### Matrix execution rule

If a package appears in this matrix, the implementer must not substitute a different package,
different primitive family, or different slot naming scheme without updating this spec first.

---

## First-Wave Package Action Ledger

This ledger converts the cutover matrix into concrete package actions for the first execution stack.

Use this section when code work starts.

### Foundation and primitive packages

| Path                                              | Must create                                            | Must update                                                        | Must remove or stop relying on                                   | Must prove                                                   |
| ------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/ui/components/_base/style-surfaces.ts`       | canonical merge/state utility module                   | n/a                                                                | ad hoc per-component surface merge code as the long-term pattern | one merge algorithm works for root and non-root surfaces     |
| `src/ui/components/_base/schema.ts`               | exported shared slot/state fragments if absent         | shared styleable/stateful schema fragments                         | duplicated grouped-surface schema fragments                      | grouped surfaces use the same vocabulary as roots            |
| `src/ui/components/_base/component-wrapper.tsx`   | n/a                                                    | shared style resolution hooks/helpers for sub-surfaces as needed   | root-only assumption for universal styling resolution            | sub-surfaces resolve through the same style-prop semantics   |
| `src/ui/manifest/schema.ts`                       | canonical manifest-side slot/state support if absent   | import shared fragments; alias normalization; strict slot handling | bespoke grouped visual fields as canonical API                   | manifest grammar matches spec registries                     |
| `src/ui/components/forms/button`                  | `schema.ts` and `types.ts` if still absent             | package layout, exports, slot contract, tests                      | implicit package contract only through `component.tsx`           | button/trigger family is explicit and reusable               |
| `src/ui/components/primitives/floating-menu`      | `schema.ts`, `types.ts`, `__tests__/` if absent        | package layout, slot contract, public exports                      | implicit/internal-only primitive behavior assumptions            | floating/menu family is explicit and reusable                |
| `src/ui/components/_base/context-menu-portal.tsx` | explicit primitive-family ownership decision if needed | integrate with floating/menu family or document infra role in code | hidden private menu behavior island                              | context-menu behavior is no longer architecturally ambiguous |
| `src/ui/components/_base/button-styles.ts`        | n/a                                                    | ensure button family owns the public contract                      | alternate unofficial button API path                             | button styles are subordinate to button primitive contract   |

### Nav and overlay packages

| Path                                      | Must create                                | Must update                                                                       | Must remove or stop relying on                                                        | Must prove                                               |
| ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `src/ui/components/layout/nav`            | `__tests__/` additions if coverage is thin | grouped slots, per-item slots, state resolution, primitive composition            | bespoke item/dropdown rendering logic as the durable pattern                          | grouped nav equals composable nav in styling power       |
| `src/ui/components/layout/nav-link`       | `__tests__/` if absent                     | canonical slots/states; compose link/button family                                | bespoke button-like/nav-like shell                                                    | link/current/disabled visuals are declarative            |
| `src/ui/components/layout/nav-dropdown`   | `__tests__/` if absent                     | compose button + floating/menu primitives; expose trigger/panel/item slots        | private dropdown panel/menu item implementation                                       | trigger and menu surfaces remain declaratively reachable |
| `src/ui/components/layout/nav-section`    | `__tests__/` if absent                     | canonical header/content slot exposure                                            | custom header-only visual fields as the long-term API                                 | section wrapper does not break slot model                |
| `src/ui/components/layout/nav-user-menu`  | `__tests__/` if absent                     | compose button + floating/menu primitives; expose avatar/trigger/panel/item slots | private user-menu implementation                                                      | user menu uses shared behavior and shared slots          |
| `src/ui/components/overlay/dropdown-menu` | `__tests__/` additions if needed           | converge trigger on button family; align slot names with floating/menu family     | local trigger shell as public pattern                                                 | overlay menu and nav menu share primitive contract       |
| `src/ui/components/overlay/context-menu`  | `__tests__/` if absent                     | converge on floating/menu family and canonical slots                              | context-specific private menu behavior as long-term pattern                           | context menu aligns with menu family semantics           |
| `src/ui/components/overlay/popover`       | `__tests__/` if absent                     | compose trigger/panel primitives; expose panel/content/header/footer slots        | bespoke outside-click/escape/positioning implementation where shared family covers it | popover becomes a real floating-family consumer          |

### First-wave execution rule

The first cutover stack is incomplete if any row above still depends on hidden private behavior after
the stack lands.

---

## First-Wave Primitive Mapping Ledger

This ledger defines the expected primitive composition for first-wave grouped packages.

It exists so an implementer does not have to reverse-engineer which primitive family should sit under
each grouped package.

### Mapping rules

1. The grouped package remains the semantic wrapper.
2. The primitive family owns reusable behavior and visible primitive surfaces.
3. Grouped wrappers must forward declarations to the primitive surfaces they use.
4. If the existing primitive family is too weak, strengthen the primitive family rather than
   bypassing it.

### Nav and overlay mapping

| Grouped package         | Internal primitive expectation                                                                     | Required forwarded surfaces                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `layout/nav`            | link/navigation-link family, item-shell family where needed, floating/menu family for nested menus | `item`, `itemLabel`, `itemIcon`, `itemBadge`, `dropdown`, `dropdownItem`, `dropdownItemLabel`, `dropdownItemIcon`, `userMenuTrigger`, `userMenuItem`, `userAvatar` |
| `layout/nav-link`       | link/navigation-link family                                                                        | `root`, `label`, `icon`, `badge`                                                                                                                                   |
| `layout/nav-dropdown`   | button/trigger family + floating/menu family                                                       | `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`                                                           |
| `layout/nav-user-menu`  | button/trigger family + floating/menu family                                                       | `trigger`, `triggerLabel`, `triggerIcon`, `avatar`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`                                                 |
| `overlay/dropdown-menu` | button/trigger family + floating/menu family                                                       | `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`                                                           |
| `overlay/context-menu`  | floating/menu family                                                                               | `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`                                                                                                     |
| `overlay/popover`       | button/trigger family + floating panel family                                                      | `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `content`, `header`, `title`, `description`, `footer`, `closeButton`                                            |
| `overlay/hover-card`    | hover-trigger family + floating panel family                                                       | `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `content`, `header`, `title`, `description`, `footer`                                                           |

### Second-wave mapping

| Grouped package         | Internal primitive expectation                                        | Required forwarded surfaces                                                                                                           |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `navigation/tabs`       | tabs or trigger/panel primitive family                                | `tab`, `tabLabel`, `tabIcon`, `panel`                                                                                                 |
| `navigation/accordion`  | disclosure family + item-shell family                                 | `item`, `trigger`, `triggerLabel`, `triggerIcon`, `content`                                                                           |
| `navigation/breadcrumb` | link family + divider/separator family                                | `item`, `link`, `current`, `separator`, `icon`                                                                                        |
| `navigation/stepper`    | item-shell family + connector family                                  | `item`, `marker`, `label`, `description`, `connector`, `content`                                                                      |
| `navigation/tree-view`  | disclosure family + item-shell family + connector family where needed | `row`, `label`, `icon`, `badge`, `connector`, `disclosure`, `children`                                                                |
| `data/list`             | item-shell family + badge/icon primitives                             | `item`, `itemTitle`, `itemDescription`, `itemIcon`, `itemBadge`, `emptyState`, `loadingState`, `errorState`                           |
| `data/data-table`       | table-surface family + button/menu families for actions               | `headerRow`, `headerCell`, `row`, `cell`, `actionsCell`, `bulkActions`, `emptyState`, `loadingState`, `errorState`, `pagination`      |
| `forms/auto-form`       | field-shell family + input/button primitive families                  | `field`, `label`, `description`, `input`, `helper`, `error`, `requiredIndicator`, `actions`, `submitButton`                           |
| `forms/toggle-group`    | segmented-control family                                              | `item`, `itemLabel`, `itemIcon`, `indicator`                                                                                          |
| `forms/wizard`          | stepper family + field-shell family + button family                   | `step`, `stepLabel`, `stepDescription`, `stepMarker`, `stepConnector`, `panel`, `actions`, `backButton`, `nextButton`, `submitButton` |

### Mapping execution rule

If an implementer finds a grouped package whose real behavior cannot fit the mapping above, the
correct response is one of:

1. strengthen the primitive family
2. create the planned primitive family
3. update this spec before landing a divergent implementation

It is not acceptable to silently roll a bespoke internal behavior path.

---

## Target Slot Registries

These registries are the authoritative target slot names and state names for the cutover packages.

They are intentionally explicit so a zero-context implementer does not need to infer slot naming
from JSX.

### Registry rules

1. Slot names below are canonical target names.
2. Aliases may normalize into these names, but these names are the public model.
3. Implementers must not create alternate spellings when the registry already defines a slot.
4. If a package needs a genuinely new visible slot, this spec must be updated first.
5. Unsupported states may be ignored at runtime, but supported states must use these names.

### Primitive family registries

```ts
const targetPrimitiveSlotRegistries = {
  "src/ui/components/forms/button": {
    slots: ["root", "label", "icon", "leadingIcon", "trailingIcon", "spinner"],
    states: {
      root: [
        "hover",
        "focus",
        "active",
        "open",
        "selected",
        "current",
        "disabled",
      ],
    },
  },
  "src/ui/components/primitives/floating-menu": {
    slots: [
      "root",
      "trigger",
      "panel",
      "item",
      "itemLabel",
      "itemIcon",
      "separator",
      "label",
    ],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      panel: ["open"],
      item: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/primitives/link": {
    slots: ["root", "label", "icon", "badge"],
    states: {
      root: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/layout/collapsible": {
    slots: ["root", "trigger", "triggerLabel", "triggerIcon", "content"],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      content: ["open"],
    },
  },
  "src/ui/components/primitives/disclosure": {
    slots: ["root", "trigger", "triggerLabel", "triggerIcon", "content"],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      content: ["open"],
    },
  },
  "src/ui/components/primitives/item-shell": {
    slots: [
      "root",
      "label",
      "description",
      "icon",
      "badge",
      "marker",
      "meta",
      "actions",
    ],
    states: {
      root: [
        "hover",
        "focus",
        "active",
        "selected",
        "current",
        "open",
        "completed",
        "invalid",
        "disabled",
      ],
    },
  },
  "src/ui/components/primitives/field-shell": {
    slots: [
      "root",
      "label",
      "description",
      "input",
      "helper",
      "error",
      "requiredIndicator",
    ],
    states: {
      root: ["focus", "invalid", "disabled"],
      input: ["hover", "focus", "active", "invalid", "disabled"],
      label: ["invalid", "disabled"],
      error: ["invalid"],
    },
  },
  "src/ui/components/primitives/table-surface": {
    slots: [
      "root",
      "header",
      "headerRow",
      "headerCell",
      "body",
      "row",
      "cell",
      "actionsCell",
      "footer",
    ],
    states: {
      row: ["hover", "focus", "selected", "current", "disabled"],
      cell: ["selected", "current", "disabled"],
    },
  },
  "src/ui/components/primitives/connector": {
    slots: ["root", "line", "start", "end", "marker"],
    states: {
      root: ["active", "selected", "current", "completed", "disabled"],
    },
  },
  "src/ui/components/primitives/segmented-control": {
    slots: ["root", "item", "itemLabel", "itemIcon", "indicator"],
    states: {
      item: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
} as const;
```

### Nav and overlay registries

```ts
const targetNavigationAndOverlaySlotRegistries = {
  "src/ui/components/layout/nav": {
    slots: [
      "root",
      "brand",
      "brandIcon",
      "brandLabel",
      "list",
      "item",
      "itemLabel",
      "itemIcon",
      "itemBadge",
      "dropdown",
      "dropdownItem",
      "dropdownItemLabel",
      "dropdownItemIcon",
      "userMenu",
      "userMenuTrigger",
      "userMenuItem",
      "userAvatar",
    ],
    itemSlots: ["item", "itemLabel", "itemIcon", "itemBadge"],
    dropdownItemSlots: [
      "dropdownItem",
      "dropdownItemLabel",
      "dropdownItemIcon",
    ],
    states: {
      item: ["hover", "focus", "selected", "current", "open", "disabled"],
      dropdownItem: ["hover", "focus", "selected", "current", "disabled"],
      userMenuTrigger: ["hover", "focus", "open", "disabled"],
      userMenuItem: ["hover", "focus", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/layout/nav-link": {
    slots: ["root", "label", "icon", "badge"],
    states: {
      root: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/layout/nav-dropdown": {
    slots: [
      "root",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "panel",
      "item",
      "itemLabel",
      "itemIcon",
      "separator",
      "label",
    ],
    itemSlots: ["item", "itemLabel", "itemIcon"],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      item: ["hover", "focus", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/layout/nav-section": {
    slots: ["root", "header", "headerLabel", "headerIcon", "content"],
    states: {
      header: ["hover", "focus", "open", "disabled"],
      content: ["open"],
    },
  },
  "src/ui/components/layout/nav-user-menu": {
    slots: [
      "root",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "avatar",
      "panel",
      "item",
      "itemLabel",
      "itemIcon",
      "separator",
      "label",
    ],
    itemSlots: ["item", "itemLabel", "itemIcon"],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      item: ["hover", "focus", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/overlay/dropdown-menu": {
    slots: [
      "root",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "panel",
      "item",
      "itemLabel",
      "itemIcon",
      "separator",
      "label",
    ],
    itemSlots: ["item", "itemLabel", "itemIcon"],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      item: ["hover", "focus", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/overlay/context-menu": {
    slots: [
      "root",
      "trigger",
      "panel",
      "item",
      "itemLabel",
      "itemIcon",
      "separator",
      "label",
    ],
    itemSlots: ["item", "itemLabel", "itemIcon"],
    states: {
      item: ["hover", "focus", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/overlay/popover": {
    slots: [
      "root",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "panel",
      "content",
      "header",
      "title",
      "description",
      "footer",
      "closeButton",
    ],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      panel: ["open"],
      closeButton: ["hover", "focus", "disabled"],
    },
  },
  "src/ui/components/overlay/hover-card": {
    slots: [
      "root",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "panel",
      "content",
      "header",
      "title",
      "description",
      "footer",
    ],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      panel: ["open"],
    },
  },
  "src/ui/components/overlay/command-palette": {
    slots: [
      "root",
      "trigger",
      "panel",
      "search",
      "searchInput",
      "list",
      "item",
      "itemLabel",
      "itemIcon",
      "groupLabel",
      "emptyState",
    ],
    itemSlots: ["item", "itemLabel", "itemIcon"],
    states: {
      trigger: ["hover", "focus", "open", "disabled"],
      searchInput: ["hover", "focus", "active", "invalid", "disabled"],
      item: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
} as const;
```

### Navigation, data, form, and advanced grouped registries

```ts
const targetGroupedSlotRegistries = {
  "src/ui/components/navigation/tabs": {
    slots: ["root", "list", "tab", "tabLabel", "tabIcon", "panel"],
    itemSlots: ["tab", "tabLabel", "tabIcon", "panel"],
    states: {
      tab: ["hover", "focus", "active", "selected", "current", "disabled"],
      panel: ["active"],
    },
  },
  "src/ui/components/navigation/accordion": {
    slots: [
      "root",
      "item",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "content",
    ],
    itemSlots: ["item", "trigger", "triggerLabel", "triggerIcon", "content"],
    states: {
      item: ["open", "disabled"],
      trigger: ["hover", "focus", "open", "disabled"],
      content: ["open"],
    },
  },
  "src/ui/components/navigation/breadcrumb": {
    slots: ["root", "item", "link", "current", "separator", "icon"],
    itemSlots: ["item", "link", "current", "icon"],
    states: {
      link: ["hover", "focus", "current", "disabled"],
      current: ["current"],
    },
  },
  "src/ui/components/navigation/stepper": {
    slots: [
      "root",
      "item",
      "marker",
      "label",
      "description",
      "connector",
      "content",
    ],
    itemSlots: [
      "item",
      "marker",
      "label",
      "description",
      "connector",
      "content",
    ],
    states: {
      item: ["hover", "focus", "selected", "current", "completed", "disabled"],
      marker: ["selected", "current", "completed", "disabled"],
      connector: ["active", "completed", "disabled"],
    },
  },
  "src/ui/components/navigation/tree-view": {
    slots: [
      "root",
      "item",
      "row",
      "label",
      "icon",
      "badge",
      "connector",
      "disclosure",
      "children",
    ],
    itemSlots: [
      "item",
      "row",
      "label",
      "icon",
      "badge",
      "connector",
      "disclosure",
      "children",
    ],
    states: {
      row: ["hover", "focus", "selected", "current", "open", "disabled"],
      disclosure: ["hover", "focus", "open", "disabled"],
      children: ["open"],
    },
  },
  "src/ui/components/data/list": {
    slots: [
      "root",
      "list",
      "item",
      "itemTitle",
      "itemDescription",
      "itemIcon",
      "itemBadge",
      "emptyState",
      "loadingState",
      "errorState",
    ],
    itemSlots: [
      "item",
      "itemTitle",
      "itemDescription",
      "itemIcon",
      "itemBadge",
    ],
    states: {
      item: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/data/data-table": {
    slots: [
      "root",
      "toolbar",
      "headerRow",
      "headerCell",
      "row",
      "cell",
      "actionsCell",
      "bulkActions",
      "emptyState",
      "loadingState",
      "errorState",
      "pagination",
    ],
    itemSlots: ["row", "cell", "actionsCell"],
    states: {
      row: ["hover", "focus", "selected", "current", "disabled"],
      cell: ["selected", "current", "disabled"],
    },
  },
  "src/ui/components/forms/auto-form": {
    slots: [
      "root",
      "section",
      "sectionTitle",
      "field",
      "label",
      "description",
      "input",
      "helper",
      "error",
      "requiredIndicator",
      "actions",
      "submitButton",
    ],
    itemSlots: [
      "field",
      "label",
      "description",
      "input",
      "helper",
      "error",
      "requiredIndicator",
    ],
    states: {
      field: ["focus", "invalid", "disabled"],
      input: ["hover", "focus", "active", "invalid", "disabled"],
      label: ["invalid", "disabled"],
      error: ["invalid"],
      submitButton: ["hover", "focus", "active", "disabled"],
    },
  },
  "src/ui/components/forms/toggle-group": {
    slots: ["root", "item", "itemLabel", "itemIcon", "indicator"],
    itemSlots: ["item", "itemLabel", "itemIcon"],
    states: {
      item: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/forms/wizard": {
    slots: [
      "root",
      "steps",
      "step",
      "stepLabel",
      "stepDescription",
      "stepMarker",
      "stepConnector",
      "panel",
      "actions",
      "backButton",
      "nextButton",
      "submitButton",
    ],
    itemSlots: [
      "step",
      "stepLabel",
      "stepDescription",
      "stepMarker",
      "stepConnector",
    ],
    states: {
      step: ["selected", "current", "completed", "disabled"],
      stepMarker: ["selected", "current", "completed", "disabled"],
      stepConnector: ["active", "completed", "disabled"],
      backButton: ["hover", "focus", "active", "disabled"],
      nextButton: ["hover", "focus", "active", "disabled"],
      submitButton: ["hover", "focus", "active", "disabled"],
    },
  },
  "src/ui/components/content/timeline": {
    slots: [
      "root",
      "item",
      "marker",
      "connector",
      "title",
      "description",
      "meta",
      "content",
    ],
    itemSlots: [
      "item",
      "marker",
      "connector",
      "title",
      "description",
      "meta",
      "content",
    ],
    states: {
      item: ["selected", "current", "completed", "disabled"],
      marker: ["selected", "current", "completed", "disabled"],
      connector: ["active", "completed", "disabled"],
    },
  },
  "src/ui/components/workflow/kanban": {
    slots: [
      "root",
      "column",
      "columnHeader",
      "columnTitle",
      "columnCount",
      "columnBody",
      "card",
      "cardTitle",
      "cardDescription",
      "cardMeta",
      "emptyState",
    ],
    itemSlots: [
      "column",
      "columnHeader",
      "columnTitle",
      "columnCount",
      "columnBody",
      "card",
      "cardTitle",
      "cardDescription",
      "cardMeta",
    ],
    states: {
      column: ["selected", "current", "disabled"],
      card: ["hover", "focus", "active", "selected", "current", "disabled"],
    },
  },
  "src/ui/components/media/carousel": {
    slots: [
      "root",
      "viewport",
      "track",
      "slide",
      "controls",
      "prevButton",
      "nextButton",
      "indicator",
      "indicatorItem",
    ],
    itemSlots: ["slide", "indicatorItem"],
    states: {
      slide: ["active", "selected", "current"],
      prevButton: ["hover", "focus", "active", "disabled"],
      nextButton: ["hover", "focus", "active", "disabled"],
      indicatorItem: [
        "hover",
        "focus",
        "active",
        "selected",
        "current",
        "disabled",
      ],
    },
  },
} as const;
```

### Registry execution rule

The registries above are intended to be strong enough that:

- a schema author knows which slot keys to support
- a runtime implementer knows which state names to compute
- a grouped component author knows which child primitive surfaces must remain reachable
- a test author knows which slot/state combinations must be verified

If implementation finds a real mismatch between a registry and a product surface, update the spec
first and then the code. Do not silently fork the registry in code.

---

## Exception Ledger

This section exists to eliminate implied exceptions.

### Approved exceptions

At the time of this spec revision, there are **no approved architectural exceptions** to:

- the canonical slot/state contract
- the canonical package layout
- the primitive-first rule
- the primitive exposure rule
- the foundation law

### Temporary implementation allowances

The following are implementation allowances, not architectural exceptions:

1. A package may temporarily lack a primitive extraction if that extraction is explicitly listed in
   the cutover matrix and the first package taking the dependency performs the extraction.
2. A package may temporarily lack full `__tests__` coverage only while it is not yet in an active
   cutover stack, but once it is touched materially during cutover, colocated tests are required.
3. A package may temporarily remain in `_base` only if the spec or code comments explicitly state
   whether it is infra-only or being formalized into a primitive family in the current stack.

### Exception process

If an implementer believes an exception is required, the implementer must add a row here before
landing code.

Required fields for any future exception:

- path
- violated rule
- why the rule cannot yet be met
- owner
- expiration condition
- expected deletion or normalization step

If those fields are missing, the exception is not approved.

---

## Mechanical Validation Protocol

This protocol is the final zero-context execution aid.

It tells the implementer how to validate work mechanically instead of relying on memory.

### Required validation output per touched package

For every touched package in the cutover matrix, produce and verify the following facts:

1. package path
2. owner type
3. target primitive family or target contract
4. canonical slot registry entry present
5. canonical state registry entry present
6. package layout status
7. schema support status
8. primitive composition status
9. tests added or updated
10. obsolete behavior removed

### Mechanical package checklist

For every touched package, verify all of the following:

1. `component.tsx` exists.
2. `schema.ts` exists, or the spec explicitly marks the package internal-only.
3. `index.ts` exists and exports the public contract.
4. `types.ts` exists or the absence is justified explicitly.
5. `__tests__/schema.test.ts` exists when the package is manifest-addressable.
6. `__tests__/component.test.tsx` exists when the package renders visible UI.
7. Slot names implemented in schema match the registry in this spec.
8. Runtime state names implemented match the registry in this spec.
9. Grouped packages compose the primitive family named in the mapping ledger.
10. No bespoke private behavior remains where the primitive family already covers the need.
11. No generic prop bag was introduced to tunnel power through the wrapper.
12. No package touched by the stack regressed in structural consistency.

### Mechanical repo-level checklist

For the repo after each cutover stack, verify all of the following:

1. no new package was added outside the canonical package layout
2. no new `_base` file became a hidden primitive family
3. no new grouped package introduced bespoke visual fields instead of canonical slots
4. no new product requirement introduced a parallel declarative model
5. touched internal manifests and docs use the canonical contract

### Validation failure rule

If any checklist item above fails, the stack is not complete.

The implementer must either:

1. fix the code
2. update the spec intentionally
3. or explicitly add a temporary exception row to the exception ledger

Silent divergence is not allowed.

---

## Immediate Execution Program

This section defines the next implementation step for the repo.

This is not a long-horizon migration roadmap.
This is the pre-prod cutover sequence.

### Objective

Land the canonical declarative system and package structure in the real repo fast enough that:

- new work stops adding bespoke patterns immediately
- the highest-risk duplicated primitive behavior is eliminated first
- grouped and primitive paths converge on one contract
- obsolete pre-universal APIs can be removed without compatibility ceremony

### Immediate cutover sequence

#### Step 1: Freeze the package contract

Before touching behavior, lock the repository shape:

- every touched component package must conform to the canonical package layout
- no new component may land without `component.tsx`, `schema.ts`, `index.ts`, and a justified type
  story
- `_base` may not absorb new visible primitive behavior

Immediate targets:

- `src/ui/components/forms/button`
- `src/ui/components/primitives/floating-menu`
- `src/ui/components/layout/split-pane`
- feedback default packages
- primitive packages missing `types.ts`

#### Step 2: Land shared styleable surface infrastructure

Implement the canonical shared schema/runtime pieces first:

- `styleableElementFields`
- `styleableElementSchema`
- `statefulElementSchema`
- `slotsSchema(...)`
- `style-surfaces.ts`

No grouped component cutover should land before this exists.

#### Step 3: Formalize primitive families before grouped cutover

Before nav/overlay/data/forms convergence:

- formalize button/trigger primitive package contract
- formalize floating/menu primitive package contract
- decide which `_base` helpers graduate into explicit primitive infrastructure

This is where the repo stops having hidden primitive capability.

#### Step 4: Cut over nav and overlay together

The first behavioral cutover should be the highest-leverage duplicated area:

- `layout/nav`
- `layout/nav-dropdown`
- `layout/nav-user-menu`
- `overlay/dropdown-menu`
- `overlay/context-menu`
- `overlay/popover`

Required result:

- nav and overlay floating/menu behavior converge on the same primitive family
- grouped nav and composable nav expose equivalent declarative styling power
- no private dropdown/menu implementation remains where the primitive family covers it

#### Step 5: Remove obsolete nav visual paths in the same cutover

Because this is pre-prod:

- update dogfood manifests
- update docs/examples
- remove obsolete nav visual APIs
- remove compatibility resolver code

Do not stage a fake deprecation window.

#### Step 6: Continue domain cutover on the fixed package contract

After nav/overlay:

- data surfaces
- forms and field surfaces
- navigation grouped controls
- advanced grouped systems

By this point the repo should already be locked into the canonical filesystem and declarative model.

### Non-negotiable cutover constraints

1. No compatibility window for obsolete visual APIs.
2. No new grouped component may roll its own primitive behavior while this work is underway.
3. No package touched by the cutover may become less structurally consistent.
4. No grouped component cutover is complete if the primitive path remains weaker.
5. No repo cleanup should be deferred behind hypothetical consumers that do not exist.
6. No new product requirement may introduce a parallel declarative model while this foundation
   cutover is underway.

### Expected first PR stack

The first concrete implementation stack should look like this:

1. package normalization and shared schema/runtime utilities
2. primitive family formalization for button/floating/menu
3. nav + composable nav + overlay convergence
4. obsolete nav visual API removal
5. remaining domain cutovers on the fixed standard

This is the "next step" the spec is intended to drive.

---

## Implementation Phases

## Phase 1: Canonical Styleable Element Contract

### Goal

Create the shared schema fragments so grouped surfaces use the same styling vocabulary as component
roots.

### Deliverables

- export `styleableElementFields`
- export `styleableElementSchema`
- export `statefulElementSchema`
- export `slotsSchema(...)`

### Expected file touch list

- `src/ui/components/_base/schema.ts`
- `src/ui/manifest/schema.ts` if manifest-side shared fragment is needed

### Required tests

- shared schema fragment accepts universal style props
- `states` accepts canonical runtime state names only
- `slotsSchema(...)` is strict for declared slot names

### Exit Criteria

- the styling fragment is shared, not duplicated
- grouped elements can use universal style props, not only `className`/`style`
- tests cover schema acceptance and strict rejection

## Phase 2: Shared Slots, States, and Merge Runtime

### Goal

Implement one runtime merge system for all rendered surfaces.

### Deliverables

- `style-surfaces.ts`
- canonical state order
- merge helpers
- surface resolution utilities

### Expected file touch list

- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/components/_base/component-wrapper.tsx` if helper extraction or shared resolver reuse is required

### Required tests

- merge order for component slot vs item slot
- state precedence
- `className` + style-prop coexistence
- empty/undefined config handling
- SSR-safe pure execution

### Additional required output

- identify candidate behavior primitives that grouped components must compose
- document which current grouped implementations are being replaced versus reused

### Exit Criteria

- one merge contract exists for all components
- no component invents its own merge precedence
- unit tests cover class/style/prop/state precedence

## Phase 3: Navigation + Composable Nav Cutover

### Goal

Land the universal system in the area with the highest product pressure.

### Deliverables

- grouped `navigation.items` uses canonical `slots`
- composable nav primitives use the same slot/state contract
- nav visual APIs in theme are removed in the same cutover

### Expected file touch list

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/app.tsx`
- `src/ui/entity-pages/AppShellWrapper.tsx` if shell parity changes are needed
- `src/ui/components/layout/nav/schema.ts`
- `src/ui/components/layout/nav/component.tsx`
- `src/ui/components/layout/nav-link/schema.ts`
- `src/ui/components/layout/nav-link/component.tsx`
- `src/ui/components/layout/nav-dropdown/schema.ts`
- `src/ui/components/layout/nav-dropdown/component.tsx`
- `src/ui/components/layout/nav-section/schema.ts`
- `src/ui/components/layout/nav-section/component.tsx`
- `src/ui/components/layout/nav-user-menu/schema.ts`
- `src/ui/components/layout/nav-user-menu/component.tsx`
- `src/ui/tokens/schema.ts`
- `src/ui/tokens/resolve.ts`

### Required tests

- grouped nav slot defaults apply
- per-item grouped nav slot overrides win
- composable nav primitives can express the same current/disabled/open visuals
- no React hover state is needed for visual policy
- theme nav visual overrides are rejected after cutover
- nav dropdown and nav user menu compose shared floating/menu primitives rather than bespoke menu implementations
- primitive-backed nav composition still exposes primitive configuration declaratively to the
  manifest author

### Important constraint

Do not land grouped nav customization without composable nav alignment.
Do not preserve bespoke nav menu implementations if equivalent shared primitives exist.

### Exit Criteria

- `navigation.items` and `navigation.template` are stylistically equivalent in capability
- nav hover/current/open/disabled visuals are declarative
- no React hover state for visual policy
- no nav visual CSS variable resolver pipeline remains

## Phase 4: Overlay + Menu Surfaces

### Goal

Upgrade menus to canonical slots, including non-item visible entries.

### Deliverables

- dropdown-menu labels and separators are styleable
- context-menu surfaces are styleable
- floating menu primitives accept canonical slot styling inputs

### Expected file touch list

- `src/ui/components/overlay/dropdown-menu/schema.ts`
- `src/ui/components/overlay/dropdown-menu/component.tsx`
- `src/ui/components/overlay/context-menu/schema.ts`
- `src/ui/components/overlay/context-menu/component.tsx`
- `src/ui/components/primitives/floating-menu/component.tsx`

### Required tests

- menu item slots
- separator slots
- label slots
- destructive/disabled/current state behavior via canonical states where applicable
- nav and overlay menu surfaces share the same primitive behavior contract where behavior overlaps
- popover/dropdown/menu primitives remain declaratively configurable when used inside grouped
  components

### Exit Criteria

- visible menu labels and separators are not hardcoded
- item + separator + label surfaces share one pattern
- grouped menu UIs do not roll their own floating/menu behavior when shared primitives exist

## Phase 5: Data Display Surfaces

### Goal

Upgrade table, list, and chart surfaces.

### Expected file touch list

- `src/ui/components/data/data-table/schema.ts`
- `src/ui/components/data/data-table/component.tsx`
- `src/ui/components/data/list/schema.ts`
- `src/ui/components/data/list/component.tsx`
- `src/ui/components/data/chart/schema.ts`
- `src/ui/components/data/chart/component.tsx`

### Required tests

- header/cell/row slot behavior for table
- list item sub-surface slot behavior
- chart legend/tooltip slot behavior where those surfaces are rendered by Snapshot code
- any extracted interactive item-shell primitives remain configurable through parent declarations

### Exit Criteria

- headers, rows, cells, action cells, and empty states are styleable
- list items and sub-elements are styleable
- chart legend and tooltip surfaces are styleable

## Phase 6: Forms + Field Surfaces

### Goal

Upgrade fields and grouped controls.

### Expected file touch list

- `src/ui/components/forms/auto-form/schema.ts`
- `src/ui/components/forms/auto-form/component.tsx`
- `src/ui/components/forms/toggle-group/schema.ts`
- `src/ui/components/forms/toggle-group/component.tsx`

### Required tests

- field/label/input/helper/error slot behavior
- item-level toggle slot behavior
- invalid/disabled state behavior through canonical states where applicable
- grouped form wrappers do not hide primitive field/input configurability

### Exit Criteria

- field wrapper, label, input, helper, and error surfaces are styleable
- toggle group item surfaces are styleable

## Phase 7: Remove Obsolete Visual APIs

### Goal

Delete pre-universal styling APIs.

### Deliverables

- remove nav visual props from `theme.overrides.components`
- remove resolver code that only supported those props
- remove one-off visual configuration fields superseded by canonical slots

### Expected file touch list

- `src/ui/tokens/schema.ts`
- `src/ui/tokens/resolve.ts`
- docs/examples/manifests that still use obsolete nav visual fields

### Required tests

- schema rejects obsolete visual nav token fields
- no remaining component reads removed nav visual CSS vars

### Exit Criteria

- no obsolete visual path remains
- docs point to one canonical system only

## Phase 8: Docs + Playground + Dogfood

### Goal

Document the canonical system and prove it on real manifests.

### Required examples

- primitive-only sophisticated nav
- grouped nav with slot defaults plus per-item overrides
- tabs, accordion, table, form, and menu examples
- side-by-side primitive vs grouping equivalence where relevant

### Required documentation content

- canonical `slots` / `states` model
- merge order
- alias normalization rules
- primitive vs grouping equivalence principle
- anti-pattern examples showing what not to add
- cutover examples from old nav visual fields to canonical slots

### Exit Criteria

- docs teach the canonical slot/state system first
- playground demonstrates per-surface customization
- dogfood manifests use the canonical API

---

## Guidance on Convenience Aliases

Convenience aliases are allowed only under these rules:

1. They compile directly to canonical `slots` / `states`.
2. They are documented as sugar, not as the primary API.
3. They do not unlock any styling capability unavailable in canonical form.

Example:

- `itemClassName` may exist temporarily as sugar for `slots.item.className`

But:

- it must not be the only documented path
- it must not be the only supported path
- new component work must use canonical `slots`, not proliferate aliases

Default guidance: do not add aliases unless dogfooding proves they materially improve authoring
without obscuring the model.

---

## Agent Checklist

This checklist is intentionally procedural for zero-context execution.

1. Read this spec in full before editing code.
2. Inspect `src/ui/components/_base/schema.ts`, `src/ui/manifest/schema.ts`, and
   `src/ui/components/_base/component-wrapper.tsx` to confirm the current universal style prop
   vocabulary.
3. Use the package-by-package cutover matrix in this spec as the authoritative execution list.
4. Use the target slot registries in this spec as the authoritative slot/state naming source.
5. Use the first-wave package action ledger and primitive mapping ledger when working on first-stack
   packages.
6. Check the exception ledger before assuming any rule may be bypassed.
7. Run the mechanical validation protocol against every touched package before considering the work
   complete.
8. Implement the shared schema fragments first.
9. Implement shared merge/runtime helpers second.
10. Upgrade one product area at a time using canonical `slots`.
11. When upgrading a grouped component, upgrade its primitive/composable equivalent in the same
    phase if one exists.
12. When upgrading a grouped component that currently rolls its own primitive behavior, either
    converge it on an existing primitive or extract a new primitive first.
13. Normalize any temporary aliases into canonical `slots`.
14. Remove obsolete visual APIs in the same cutover once canonical slots fully cover the use case.
15. Normalize touched component packages toward the canonical repository layout unless there is a
    documented reason not to.
16. Add schema and runtime tests before closing a phase.
17. Validate dogfood manifests/examples against the canonical API.
18. Confirm that primitive reuse did not hide primitive configurability from declarations.
19. Reject any solution that expands product capability by adding a new declarative model instead of
    adding primitives and typed semantic composition.

If an implementer cannot explain how a change maps back to the canonical slot/state model in this
spec, the change is probably introducing drift.

---

## Testing Standard

### Schema tests

For every upgraded component:

- valid canonical `slots` accepted
- valid per-item `slots` accepted
- strict mode rejects unknown slot names where appropriate
- sugar aliases, if any, compile to canonical form

### Runtime tests

For every upgraded component:

- base slot defaults apply
- per-item slot overrides win
- state styles apply in canonical order
- unsupported states are ignored safely
- SSR render equals client hydration for visual state inputs

### Dogfood tests

- budget-fe and other internal manifests compile and render through the canonical API
- no obsolete visual API remains in internal manifests after cutover

---

## Definition of Done

The system is complete only when all of the following are true:

1. Every visible render surface in covered components is styleable through the canonical
   styleable-element contract.
2. Grouping components use canonical `slots` and per-item `slots`, not bespoke visual fields.
3. Primitive and grouped forms of the same UI capability are equivalent in styling power.
4. All grouped surfaces can use the same universal style prop vocabulary as component roots.
5. Theme no longer carries per-component visual differentiation APIs for nav.
6. No parallel CSS variable resolver path exists for per-item or per-surface visuals.
7. Internal manifests, docs, and playground examples use the canonical system.
8. Covered components do not depend on generic prop bags or hidden primitive pass-through bags for
   normal customization.
9. Covered components use primitive-backed behavior and preserve declarative access to the primitive
   surfaces they compose.
10. New components merged during rollout adopt the canonical contract immediately rather than
    introducing fresh bespoke styling APIs.
11. Touched component packages conform to the canonical repository layout or have a written,
    justified exception.
12. New product classes can be unlocked by adding primitive families and typed semantic composition
    without adding a new styling, grouping, state, or workflow model.
13. No shipped feature depends on a domain-specific declarative exception that bypasses the canonical
    slot/state/resource/workflow/package contract.
14. The package-by-package cutover matrix and target slot registries in this spec are either
    reflected in code or intentionally updated before divergence is introduced.
15. Every touched package passes the mechanical validation protocol or has an explicit temporary row
    in the exception ledger.

If any visible surface still requires a one-off schema addition for a normal visual customization,
the system is incomplete.
