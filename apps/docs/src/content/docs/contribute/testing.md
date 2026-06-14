---
title: Contributor Testing
description: Source-backed testing patterns Snapshot contributors should reuse.
draft: false
---

Snapshot testing is contract work. Use the nearest existing test in the same
surface before inventing a new harness.

## Read First

1. `docs/engineering-rules.md`
2. `src/test-setup.ts`
3. the nearest surface `CLAUDE.md`
4. the closest existing test file for the surface you are changing

## Test Stack

`bun test` preloads `src/test-setup.ts`, which installs the shared happy-dom
globals used across the repo.

Use `@vitest-environment jsdom` on suites that need interactive DOM behavior,
`@testing-library/react`, hooks, or event handling.

Use `renderToStaticMarkup` in component suites to prove SSR safety for the
modified surface.

## Which Tests Match Which Contract

| Surface | What to prove | Current source-backed patterns |
| --- | --- | --- |
| SDK bootstrap | factory defaults, auth contract, realtime bootstrap | `src/create-snapshot.test.tsx`, `src/auth/__tests__/contract.test.ts` |
| Actions and workflows | observable state and effect behavior | `src/ui/actions/__tests__`, `src/ui/workflows/__tests__` |
| Component schema contract | accepted config, rejected config, defaults, refs, slots, states | component `schema.test.ts` files |
| Component runtime contract | rendered output, events, state publishing, SSR safety | component `component.test.tsx` files |
| SSR contract | response shape, shell injection, render chain, cache and state serialization | `src/ssr/__tests__` |
| Vite and sync | plugin hooks, sync triggers, build output | `src/vite/__tests__` |
| CLI and scaffold | sync output and generated template expectations | `src/cli/__tests__` |

## Context Helpers

For UI context tests, use `AppContextProvider` and `PageContextProvider` as
shown in `src/ui/context/__tests__/providers.test.tsx`.

## Fastest Contributor Flow

1. Find the nearest existing test file in the same surface.
2. Copy the fixture shape and wrapper pattern from that file.
3. Add schema or type-level assertions first if the public contract changed.
4. Add runtime assertions second for visible behavior.
5. Add `renderToStaticMarkup` coverage if the change touches a component surface.
6. Run `bun test` and `bun run docs:ci`.
