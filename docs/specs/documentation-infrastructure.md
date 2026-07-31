# Documentation Infrastructure - Canonical Spec

> **Status**
>
> | Phase | Title                                         | Status      | Track             |
> | ----- | --------------------------------------------- | ----------- | ----------------- |
> | 1     | Governance, Personas, and Agent Discovery     | Completed   | A                 |
> | 2     | Astro Public Docs App Foundation              | Completed   | B                 |
> | 3     | Source-Backed Reference Generation            | Completed   | C                 |
> | 4     | Capability Map and Core Guides                | Completed   | B                 |
> | 5     | Canonical Examples and Playground Integration | In progress | D                 |
> | 6     | Drift Automation and Required CI Path         | In progress | E                 |
> | 7     | Coverage Hardening and README Reduction       | In progress | A + B + C + D + E |
>
> **Priority:** P0 for Snapshot maturity.
> **Depends on:** Nothing external. This is repo-local infrastructure work.

## Vision

### Before

Snapshot has a lot of real capability on `main`, but the documentation system does not express it coherently:

- `README.md` is carrying too much of the public docs load.
- `docs/` mixes internal engineering rules/specs with user-facing guides.
- There is no public docs app, no search layer, and no stable information architecture.
- There is no generated reference for `@lastshotlabs/snapshot`, `@lastshotlabs/snapshot/ui`, `@lastshotlabs/snapshot/ssr`, or `@lastshotlabs/snapshot/vite`.
- There is no default docs validation path in CI.
- There is no explicit contributor/agent discovery flow that tells implementation agents where to read first and what they must update.
- The playground is valuable, but it is not treated as a canonical docs/example asset.

The result is predictable drift. Source evolves faster than docs, top-level pages under-represent actual capabilities, and agents need too much ad hoc prompting to understand the repo and keep documentation current.

### After

Snapshot has a layered documentation system with clear ownership:

1. **Source of truth**
   - JSDoc on public exports
   - Zod schemas and manifest schemas
   - component registry / CLI command source / SSR entrypoints

2. **Generated reference**
   - built directly from source for entrypoints, manifest schema, components, actions, and CLI commands

3. **Human-curated guides**
   - organized by real personas and linked to source-backed examples

4. **Automation**
   - docs generation, docs typecheck, docs impact mapping, docs coverage, example smoke, and a default `docs:ci` path

5. **Agent discovery**
   - root policy plus targeted `CLAUDE.md` files tell framework contributors and app-building agents where to read, what is canonical, and what must be updated in the same change

The main property of the system is the same one Slingshot is moving toward: **docs should be difficult to drift by accident**.

## Target Personas

The public docs app is designed around four real consumers:

1. **Manifest App Builder**
   - Wants to build an app from `snapshot.manifest.json` with minimal custom React.
2. **SDK App Builder**
   - Wants to use `createSnapshot`, hooks, auth, routing helpers, sync output, and custom React.
3. **SSR / Platform Integrator**
   - Wants Snapshot working with slingshot SSR, manifest rendering, RSC, prefetch, and Vite integration.
4. **Snapshot Contributor**
   - Wants to implement or change Snapshot itself without guessing where patterns live or which docs/examples must move with the code.

Agent workflows are a first-class sub-case of persona 4. The system must work for a human contributor, but it must also work for an implementation agent with no conversational context.

## What Already Exists on Main

### Strong assets that should be retained

| Surface                    | Files                                                                | Notes                                                                        |
| -------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Internal repo rules        | `docs/engineering-rules.md`, `docs/spec-process.md`, `CLAUDE.md`     | Good contributor guidance, but not enough for docs automation                |
| Public package entrypoints | `src/index.ts`, `src/ui.ts`, `src/ssr/index.ts`, `src/vite/index.ts` | Clear public surfaces, partially documented by JSDoc                         |
| Schema generation          | `src/schema-generator.ts`, `scripts/generate-manifest-schema.ts`     | Existing generation pipeline can anchor manifest reference                   |
| Manifest schemas           | `src/ui/manifest/schema.ts`                                          | Canonical shape lives here                                                   |
| Component registry         | `src/ui/components/**`, `src/ui/manifest/**`                         | Canonical component catalog is discoverable from source                      |
| Playground                 | `playground/src/showcase.tsx`                                        | Strong visual/example asset, currently disconnected from docs infrastructure |
| Existing guides            | `docs/*.md`, `docs/manifest/*`, `docs/ssr/*`                         | Useful raw material, but uneven and partly stale                             |

### Audited gaps on main

| Gap                                                  | Evidence                                                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No public docs app                                   | No Astro app, no docs-specific package, no docs scripts in `package.json`                                                                                                |
| Internal and public docs are mixed                   | `docs/` contains rules/specs alongside user-facing material                                                                                                              |
| No docs automation                                   | `package.json` has `build`, `typecheck`, `test`, `format`, `format:check` only                                                                                           |
| No explicit docs CI path                             | No `docs:generate`, `docs:typecheck`, `docs:impact`, `docs:coverage`, or `docs:ci`                                                                                       |
| No targeted contributor map for agents               | Only root `CLAUDE.md`; no `src/ui/CLAUDE.md`, `src/ssr/CLAUDE.md`, `src/cli/CLAUDE.md`, `playground/CLAUDE.md`                                                           |
| Top-level docs understate capabilities               | The source contains auth, community, webhooks, SSE, WS, push, manifest UI, presets, plugins, SSR, RSC, Vite transforms, rich content, communication components, and more |
| Existing guides already drift from schema            | `docs/getting-started.md` still documents top-level `nav` and `pages`, while `manifestConfigSchema` on `main` uses `app`, `navigation`, and `routes`                     |
| Playground is not treated as canonical docs evidence | `playground/src/showcase.tsx` demonstrates many components but is not linked to structured docs/reference or CI coverage                                                 |

## Developer Context

### Current build and test commands

```sh
bun run typecheck
bun run format:check
bun run build
bun test
```

### Key files

| Path                          | Why it matters                               |
| ----------------------------- | -------------------------------------------- |
| `CLAUDE.md`                   | Current contributor instructions entrypoint  |
| `docs/engineering-rules.md`   | Non-negotiable engineering rules             |
| `package.json`                | Current script surface; no docs workflow yet |
| `README.md`                   | Currently overloaded public entrypoint       |
| `src/index.ts`                | Root SDK export surface                      |
| `src/ui.ts`                   | UI/config-driven export surface              |
| `src/ssr/index.ts`            | SSR and RSC export surface                   |
| `src/vite/index.ts`           | Vite plugin export surface                   |
| `src/ui/manifest/schema.ts`   | Canonical manifest schema                    |
| `src/schema-generator.ts`     | Existing schema generation pipeline          |
| `playground/src/showcase.tsx` | Largest existing example catalog             |

## Non-Negotiable Engineering Constraints

From `docs/engineering-rules.md`, and extended here for docs infrastructure:

1. **Public API change implies docs change in the same commit.**
2. **JSDoc on public API is mandatory and is source of truth for generated reference.**
3. **Manifest-first claims in docs must match actual manifest-only behavior.**
4. **Examples must be real and verifiable.**
   - No invented APIs, no missing imports, no placeholder snippets.
5. **Internal process docs and public product docs stay separate.**
   - `docs/` remains internal.
   - public docs move to an Astro app.
6. **Contributor/agent instructions are part of the product infrastructure.**
   - `CLAUDE.md` files and policy docs are not optional prose; they define the repo workflow.
7. **Generated reference beats hand-maintained reference.**
   - Human-written pages explain, compare, and teach.
   - Generated pages enumerate contracts.

## Architecture

### Internal vs public docs split

- **Keep `docs/` internal**
  - engineering rules
  - spec process
  - specs
  - contributor policy
- **Create `apps/docs/` for public docs**
  - Astro-based site
  - MDX guides
  - generated reference content
  - example pages and capability map

This split is required. Snapshot currently overloads `docs/` with both internal and public purposes. That is the root of a lot of contributor confusion.

### Recommended public docs stack

Use **Astro** with **Starlight** in `apps/docs/`.

Why:

- Snapshot needs a docs product, not a custom static site project.
- Starlight gives sidebar, search, content collections, and MDX authoring without spending engineering cycles on docs shell infrastructure.
- Astro still leaves room for custom components for generated reference, example embeds, and playground links.

### Source-backed generation inputs

The system will generate reference data from these audited sources:

- `src/index.ts`
- `src/ui.ts`
- `src/ssr/index.ts`
- `src/vite/index.ts`
- `src/ui/manifest/schema.ts`
- component registries and component schemas under `src/ui/components/**`
- CLI command sources under `src/cli/commands/**`
- schema generation code in `src/schema-generator.ts`

### Canonical contributor discovery flow

The repo will explicitly codify this flow for Snapshot contributors and implementation agents:

1. Read `docs/engineering-rules.md`
2. Read `docs/documentation-policy.md`
3. Read root `CLAUDE.md`
4. Read the nearest surface `CLAUDE.md`
   - `src/ui/CLAUDE.md`
   - `src/ssr/CLAUDE.md`
   - `src/cli/CLAUDE.md`
   - `playground/CLAUDE.md`
   - `apps/docs/CLAUDE.md`
5. Read the public entrypoint for the surface being changed
6. Read the relevant schema / runtime / registry files
7. Update code, source docs, generated docs inputs, examples, and impacted guides
8. Run `bun run docs:ci` before closing work

This is the mechanism that prevents "I didn't know where to look" and "I didn't know docs needed updating."

## Phase 1: Governance, Personas, and Agent Discovery

### Goal

Make the contributor workflow explicit, repo-native, and required. Snapshot needs the same "agents know what to do without being reminded" layer Slingshot now has.

### Files to create

| File                           | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `docs/documentation-policy.md` | Canonical docs maintenance policy                        |
| `src/ui/CLAUDE.md`             | UI contributor and agent discovery map                   |
| `src/ssr/CLAUDE.md`            | SSR/RSC contributor and agent discovery map              |
| `src/cli/CLAUDE.md`            | CLI/scaffold/sync contributor and agent discovery map    |
| `playground/CLAUDE.md`         | Playground/example rules and canonical showcase guidance |

### Files to modify

| File                        | Change                                                         |
| --------------------------- | -------------------------------------------------------------- |
| `CLAUDE.md`                 | Point contributors to the docs policy and surface CLAUDE files |
| `docs/engineering-rules.md` | Add the default docs workflow and docs:ci requirement          |

### Required content

- four persona model
- contributor flow
- app-builder discovery flow
- "public surface changed -> docs and examples changed in same commit"
- "generated reference is source-backed; curated guides explain behavior and tradeoffs"
- exact rule that `docs:ci` is the default validation path after any public behavior change

### Exit criteria

- [ ] Snapshot has a repo-level documentation policy.
- [ ] Root `CLAUDE.md` points contributors to that policy.
- [ ] Surface `CLAUDE.md` files exist for UI, SSR, CLI, playground, and docs app.
- [ ] Each `CLAUDE.md` lists real files only and explains update obligations.
- [ ] Engineering rules make `docs:ci` part of the default contributor path.

## Phase 2: Astro Public Docs App Foundation

### Goal

Stand up a public docs product that separates user-facing docs from internal repo process.

### Files to create

| File                                                 | Purpose                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/docs/package.json`                             | Docs app package                                                    |
| `apps/docs/astro.config.mjs`                         | Astro/Starlight config                                              |
| `apps/docs/tsconfig.json`                            | Docs app TS config                                                  |
| `apps/docs/src/content.config.ts`                    | Content collections                                                 |
| `apps/docs/src/content/docs/index.mdx`               | Public entry page                                                   |
| `apps/docs/src/content/docs/start-here/index.mdx`    | Start-here page by persona                                          |
| `apps/docs/src/content/docs/contribute/overview.mdx` | Framework contributor landing page                                  |
| `apps/docs/src/components/*`                         | Shared docs components for generated reference and example callouts |
| `apps/docs/CLAUDE.md`                                | Docs app contribution guidance                                      |

### Files to modify

| File           | Change                                                |
| -------------- | ----------------------------------------------------- |
| `package.json` | Add docs scripts and workspace/package glue as needed |

### Information architecture

Initial top-level sections:

- `Start Here`
- `Build with Manifest`
- `Build with SDK`
- `SSR and RSC`
- `CLI and Sync`
- `UI Catalog`
- `Examples`
- `Reference`
- `Contribute`

### Rules

- public docs live in `apps/docs`, not `docs/`
- internal specs and engineering rules remain in `docs/`
- search/sidebar structure is persona-first, not package-first
- generated reference lives under `Reference`
- docs app is buildable on CI

### Exit criteria

- [ ] `apps/docs` builds successfully.
- [ ] Internal and public docs are separated.
- [ ] Docs app has stable top-level IA for all four personas.
- [ ] A contributor can land on one page and understand where to go next.

## Phase 3: Source-Backed Reference Generation

### Goal

Replace hand-maintained API/reference sprawl with generated pages and generated data, using source as the input contract.

### Files to create

| File                                           | Purpose                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `scripts/docs/generate-api-reference.ts`       | Extract public exports + JSDoc from entrypoints                          |
| `scripts/docs/generate-manifest-reference.ts`  | Extract manifest top-level schema, actions, guards, workflows, resources |
| `scripts/docs/generate-component-reference.ts` | Extract registered component catalog and schema metadata                 |
| `scripts/docs/generate-cli-reference.ts`       | Extract CLI command metadata from command sources                        |
| `scripts/docs/generate-capability-map.ts`      | Build source-backed capability inventory for top-level docs              |
| `apps/docs/src/generated/**`                   | Generated JSON/MDX/TS data consumed by docs pages                        |

### Files to modify

| File                | Change                                                              |
| ------------------- | ------------------------------------------------------------------- |
| `package.json`      | Add `docs:generate`                                                 |
| `src/index.ts`      | Ensure JSDoc quality is sufficient for root API reference           |
| `src/ui.ts`         | Ensure JSDoc quality is sufficient for UI/reference generation      |
| `src/ssr/index.ts`  | Ensure JSDoc quality is sufficient for SSR/RSC reference generation |
| `src/vite/index.ts` | Ensure JSDoc quality is sufficient for Vite reference generation    |

### Generated outputs

- SDK API reference
- UI API reference
- SSR/RSC API reference
- Vite API reference
- manifest top-level schema reference
- action vocabulary reference
- route guard reference
- workflow node reference
- component catalog by domain
- CLI command reference
- capability inventory used by overview pages

### Required behavior

- missing JSDoc on public exports becomes a coverage failure unless explicitly ignored
- generated capability inventory must include high-signal surfaces higher up in the site:
  - auth
  - sync
  - manifest app assembly
  - SSR
  - RSC
  - community
  - realtime
  - push
  - webhooks
  - communication components
  - content/media components
  - presets

This is how Snapshot avoids repeating the current failure mode where top-level docs do not reflect actual capabilities like chat, emoji, community, uploads/content, or SSR/RSC.

### Exit criteria

- [ ] `docs:generate` produces reference data from source.
- [ ] Every public entrypoint has generated reference coverage.
- [ ] Manifest and component reference come from schema/registry source, not hand-maintained tables.
- [ ] Top-level capability inventory is generated from source inputs.

## Phase 4: Capability Map and Core Guides

### Goal

Build the curated public docs layer that explains what Snapshot is, what it can do, and how to choose the right path.

### Files to create

| File                                                              | Purpose                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/docs/src/content/docs/start-here/capabilities.mdx`          | Source-backed high-level capability map                     |
| `apps/docs/src/content/docs/build/manifest-apps.mdx`              | Manifest-first app building path                            |
| `apps/docs/src/content/docs/build/sdk-apps.mdx`                   | Custom React / SDK path                                     |
| `apps/docs/src/content/docs/integrate/ssr-rsc.mdx`                | slingshot SSR, manifest renderer, RSC, prefetch             |
| `apps/docs/src/content/docs/integrate/community-and-realtime.mdx` | community, websockets, SSE, push                            |
| `apps/docs/src/content/docs/integrate/content-and-media.mdx`      | markdown, rich input/editor, file upload, embeds, emoji/gif |
| `apps/docs/src/content/docs/contribute/agent-flow.mdx`            | Contributor/agent implementation flow                       |

### Content requirements

- guides link to generated reference instead of duplicating it
- every guide links to one or more runnable examples
- the start-here surface explicitly answers:
  - what Snapshot can do
  - when to use manifest mode vs SDK mode
  - how Snapshot fits with Slingshot
  - how agents should discover context efficiently

### Important audited correction

The current docs system has at least one confirmed contract drift example:

- `docs/getting-started.md` documents `nav` and `pages`
- `manifestConfigSchema` on `main` uses `app`, `navigation`, and `routes`

Phase 4 must correct this style of drift across the new public guides before publishing them.

### Exit criteria

- [ ] Snapshot has a truthful top-level "what can this framework do?" surface.
- [ ] Manifest builders, SDK builders, SSR integrators, and contributors each have a clear onboarding path.
- [ ] Higher-level docs now reflect community/realtime/content/SSR capabilities present in source.
- [ ] No core guide duplicates contract tables that are already generated elsewhere.

## Phase 5: Canonical Examples and Playground Integration

### Goal

Make examples a first-class part of the documentation system rather than incidental demo code.

### Files to create

| File                             | Purpose                                            |
| -------------------------------- | -------------------------------------------------- |
| `examples/registry.ts`           | Canonical example registry                         |
| `examples/manifest-starter/*`    | Minimal manifest-first example                     |
| `examples/sdk-auth/*`            | SDK/custom React/auth example                      |
| `examples/community-realtime/*`  | Community/chat/realtime example                    |
| `examples/ssr-manifest/*`        | slingshot SSR + Snapshot manifest renderer example |
| `scripts/docs/examples-smoke.ts` | Smoke runner for examples and showcase             |

### Files to modify

| File                          | Change                                                            |
| ----------------------------- | ----------------------------------------------------------------- |
| `playground/src/showcase.tsx` | Register showcase sections in a structured way or export metadata |
| `package.json`                | Add `examples:smoke` and any supporting scripts                   |

### Rules

- Examples are not throwaway folders.
- Every major docs track links to a canonical example.
- Playground remains the visual component catalog.
- `examples/` become the runnable end-to-end product stories.
- Example registry includes:
  - id
  - persona
  - capabilities covered
  - entrypoint/build command
  - docs pages that must link to it

### Exit criteria

- [ ] Snapshot has canonical runnable examples, not just snippets.
- [ ] Docs pages link directly to example folders.
- [ ] Playground sections are documented assets, not isolated demos.
- [ ] Example smoke validation runs in CI.

## Phase 6: Drift Automation and Required CI Path

### Goal

Make docs upkeep the default contributor path and catch common drift mechanically.

### Files to create

| File                                 | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `scripts/docs/typecheck-docs.ts`     | Typecheck code fences and docs-generated examples    |
| `scripts/docs/impact.ts`             | Map source changes to required docs/example surfaces |
| `scripts/docs/coverage.ts`           | Check public export/reference/JSDoc coverage         |
| `docs/documentation-impact-map.json` | Source surface to docs/example mappings              |

### Files to modify

| File                       | Change                                                          |
| -------------------------- | --------------------------------------------------------------- |
| `package.json`             | Add `docs:typecheck`, `docs:impact`, `docs:coverage`, `docs:ci` |
| GitHub Actions / CI config | Make `docs:ci` part of required contributor validation          |

### Required scripts

```sh
bun run docs:generate
bun run docs:typecheck
bun run docs:impact
bun run docs:coverage
bun run examples:smoke
bun run docs:ci
```

### `docs:ci` contract

`docs:ci` must run:

1. docs generation
2. docs typecheck
3. docs impact check
4. docs coverage check
5. example smoke

### Impact map minimum coverage

The impact map must cover at least these source surfaces:

- root SDK/auth
- sync/client generation
- CLI scaffold/init/manifest commands
- UI manifest schema/runtime
- tokens/themes
- actions
- presets
- component domains
  - data
  - forms
  - content
  - communication
  - navigation
  - overlay
  - workflow
- community
- webhooks
- ws/sse/push
- SSR
- RSC
- Vite plugin
- plugin system

### Exit criteria

- [ ] `docs:ci` exists and is the documented default validation path.
- [ ] CI fails if impacted docs/examples were not updated.
- [ ] CI fails if public exports lack JSDoc/reference coverage.
- [ ] CI fails if docs code blocks drift from current source expectations.

## Phase 7: Coverage Hardening and README Reduction

### Goal

Close the loop so Snapshot's top-level developer experience stays truthful as the framework grows.

### Files to modify

| File                                                    | Change                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| `README.md`                                             | Reduce to concise overview + install + key links into public docs |
| `docs/getting-started.md` and old public markdown pages | Either migrate into `apps/docs` or clearly mark/archive them      |
| Generated reference inputs across `src/**`              | Raise JSDoc quality where coverage still fails                    |

### Required outcomes

- README becomes a short front door, not the whole house
- old standalone markdown pages are either migrated or explicitly deprecated
- coverage gaps are tracked to zero for high-value public surfaces first:
  - `src/index.ts`
  - `src/ui.ts`
  - `src/ssr/index.ts`
  - `src/vite/index.ts`
  - `src/ui/manifest/schema.ts`

### Exit criteria

- [ ] README points people to the docs app instead of duplicating most of it.
- [ ] High-value public surfaces have strong generated reference coverage.
- [ ] Old user-facing markdown no longer competes with the new docs app.

## Parallelization and Sequencing

### Track overview

| Track                   | Branch                      | Phases | Owned files                                                                                                      |
| ----------------------- | --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| A - Governance          | `docs/governance`           | 1, 7   | `CLAUDE.md`, `docs/documentation-policy.md`, `docs/engineering-rules.md`, surface `CLAUDE.md` files, `README.md` |
| B - Public Docs App     | `docs/public-site`          | 2, 4   | `apps/docs/**`                                                                                                   |
| C - Generated Reference | `docs/reference-generation` | 3      | `scripts/docs/generate-*.ts`, generated docs data, JSDoc quality on public entrypoints                           |
| D - Examples            | `docs/examples`             | 5      | `examples/**`, `examples/registry.ts`, `playground/**`, example smoke                                            |
| E - Automation          | `docs/automation`           | 6      | docs CI scripts, impact map, package scripts, CI config                                                          |

### Dependencies

- Phase 1 has no dependency.
- Phase 2 has no dependency.
- Phase 3 has no dependency.
- Phase 4 depends on Phases 2 and 3.
- Phase 5 depends on Phase 2.
- Phase 6 depends on Phases 2, 3, and 5.
- Phase 7 depends on Phases 1, 4, 5, and 6.

### Recommended merge order

1. Track A / Phase 1
2. Track B / Phase 2
3. Track C / Phase 3
4. Track B / Phase 4
5. Track D / Phase 5
6. Track E / Phase 6
7. Track A / Phase 7

## Agent Execution Checklist

1. Read `docs/engineering-rules.md`
2. Read `docs/documentation-policy.md`
3. Read root `CLAUDE.md`
4. Read the nearest surface `CLAUDE.md`
5. Read the public entrypoint and source of truth files for the surface
6. Implement the code change
7. Update JSDoc, generated-reference inputs, impacted guides, and impacted examples
8. Run `bun run docs:ci`
9. Run the standard repo checks
10. Do not close the change while source and docs disagree

## Definition of Done

### Functional

- [ ] Snapshot has an Astro-based public docs app.
- [ ] Public docs and internal repo docs are separated.
- [ ] Top-level docs reflect actual current capabilities from source.
- [ ] Generated reference exists for SDK, UI, SSR, Vite, manifest schema, component catalog, and CLI.
- [ ] Contributors and agents have an explicit repo-native discovery/update flow.
- [ ] Canonical runnable examples exist and are linked from guides.
- [ ] Playground is integrated into the docs system as the component showcase.
- [ ] `docs:ci` is the standard required validation path.

### Quality

- [ ] No confirmed contract drift remains between primary guides and `main` schema/export surfaces.
- [ ] Missing JSDoc on high-value public exports is treated as a bug.
- [ ] Example and docs code paths are typechecked.
- [ ] Cross-cutting source surfaces are covered by the impact map.
- [ ] README is concise and points into the docs product.

### Litmus tests

1. An app-building agent can understand the right implementation path by reading `CLAUDE.md`, `documentation-policy.md`, and one "Start Here" page without scanning the entire repo.
2. A framework implementation agent changing `src/ui/manifest/schema.ts` knows exactly which guides, reference outputs, and examples must move with the change.
3. The top-level docs answer "what can Snapshot do?" truthfully, including SSR/RSC, community/realtime, content/media, CLI/sync, and manifest-driven UI.
4. A human no longer needs to remember to tell agents to update docs; the instructions and checks make that the default behavior.
