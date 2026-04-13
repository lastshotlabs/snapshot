---
title: Contributor Testing
description: The source-backed testing patterns Snapshot contributors should reuse instead of rediscovering.
draft: false
---

Snapshot testing is contract work, not cleanup work.

Use this page when you are implementing Snapshot itself and need to know which suites prove which layer of the framework.

## Read These First

1. `docs/engineering-rules.md`
2. `src/test-setup.ts`
3. the nearest surface `CLAUDE.md`
4. the closest existing test file for the surface you are changing

## Test Stack

`bun test` preloads `src/test-setup.ts`, which installs the shared happy-dom globals used across the repo.

Use `@vitest-environment jsdom` on suites that need interactive DOM behavior, `@testing-library/react`, hooks, or event handling. Current examples:

- `src/create-snapshot.test.tsx`
- `src/ui/manifest/__tests__/runtime.test.tsx`
- `src/ui/actions/__tests__/executor.test.ts`
- `src/ui/components/forms/auto-form/__tests__/component.test.tsx`

Use `renderToStaticMarkup` in component suites to prove SSR safety for the modified surface. Current examples:

- `src/ui/components/layout/nav/__tests__/component.test.tsx`
- `src/ui/components/data/save-indicator/__tests__/component.test.tsx`
- `src/ui/components/feedback/default-error/__tests__/component.test.tsx`

## Which Tests Match Which Contract

Use the nearest existing pattern instead of inventing a new one.

| Surface | What to prove | Current source-backed patterns |
|---|---|---|
| SDK bootstrap and shared platform contract | factory defaults, auth contract, manifest overrides, realtime bootstrap | `src/create-snapshot.test.tsx`, `src/auth/__tests__/contract.test.ts` |
| Manifest schema and compiler contract | valid shapes, invalid shapes, defaults, route and navigation invariants | `src/ui/manifest/__tests__/schema.test.ts`, `src/ui/manifest/__tests__/compiler.test.ts`, `src/cli/__tests__/manifest-validate.test.ts` |
| Manifest runtime and renderer behavior | resource invalidation, preload behavior, route rendering, auth wiring | `src/ui/manifest/__tests__/runtime.test.tsx`, `src/ui/manifest/__tests__/renderer.test.tsx`, `src/ui/manifest/__tests__/app.test.tsx` |
| Actions and workflows | observable state and resource effects from action config | `src/ui/actions/__tests__/executor.test.ts`, `src/ui/actions/__tests__/types.test.ts`, `src/ui/workflows/__tests__/engine.test.ts` |
| Component schema contract | accepted config, rejected config, defaults, `from` refs, slots, states | component `schema.test.ts` files such as `src/ui/components/forms/button/__tests__/schema.test.ts` and `src/ui/components/overlay/modal/__tests__/schema.test.ts` |
| Component runtime contract | rendered output, event behavior, state publishing, SSR safety | component `component.test.tsx` files such as `src/ui/components/forms/button/__tests__/component.test.tsx`, `src/ui/components/layout/nav/__tests__/component.test.tsx`, `src/ui/components/forms/auto-form/__tests__/component.test.tsx` |
| SSR and renderer contract | response shape, shell injection, render chain structure, cache and state serialization | `src/ssr/__tests__/render.test.tsx`, `src/ssr/__tests__/renderer.test.tsx`, `src/ssr/__tests__/state.test.ts` |
| Vite plugin and sync contract | plugin hooks, virtual entry behavior, sync triggers, production shell output | `src/vite/__tests__/plugin.test.ts`, `src/vite/__tests__/prefetch.test.ts`, `src/vite/__tests__/rsc-transform.test.ts` |
| CLI and scaffold contract | manifest validation, sync output, generated template expectations | `src/cli/__tests__/manifest-validate.test.ts`, `src/cli/__tests__/sync.test.ts`, `src/cli/__tests__/templates.test.ts` |

## `from` Refs And Runtime State

Snapshot no longer has a shared `<TestPageContext>` helper. The real patterns in `main` are:

- `AppContextProvider` plus `PageContextProvider` for context-hook tests, as shown in `src/ui/context/__tests__/providers.test.tsx`
- explicit `AppRegistryContext` plus `PageRegistryContext` wrappers with seeded atoms for component and action suites, as shown in `src/ui/components/forms/button/__tests__/component.test.tsx`, `src/ui/components/layout/nav/__tests__/component.test.tsx`, and `src/ui/actions/__tests__/executor.test.ts`
- `ManifestRuntimeProvider` wrappers when the test depends on resource cache, route runtime, or manifest behavior, as shown in `src/ui/manifest/__tests__/runtime.test.tsx` and `src/ui/components/forms/auto-form/__tests__/component.test.tsx`

If a feature depends on `global.*`, route state, resource invalidation, or overlay state, copy the closest existing wrapper shape before writing assertions.

## Fastest Contributor Flow

1. Find the nearest existing test file in the same surface.
2. Copy the fixture shape and wrapper pattern from that file.
3. Add schema assertions first if the public config changed.
4. Add runtime assertions second for the visible behavior.
5. Add `renderToStaticMarkup` coverage if the change touches a component surface.
6. Run `bun test` and `bun run docs:ci`.

## Definition Of Incomplete

The change is incomplete if one of these moved and the matching tests did not:

- exported SDK, SSR, Vite, or CLI behavior
- manifest schema or manifest runtime behavior
- component schema, slot and state contract, or component runtime behavior
- auth, realtime, community, content, or other visible user-facing contracts

If you changed the contract and did not update the nearest proving test, the work is incomplete.
