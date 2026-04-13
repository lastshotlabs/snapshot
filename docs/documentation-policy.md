# Documentation Policy

Snapshot documentation is a product surface. It is not optional polish.

This repo has four documentation personas:

1. **Manifest App Builder**
   - Builds a Snapshot app primarily from `snapshot.manifest.json`.
2. **SDK App Builder**
   - Builds with `createSnapshot`, hooks, generated API client output, and custom React.
3. **SSR / Platform Integrator**
   - Integrates Snapshot with bunshot SSR, manifest rendering, RSC, prefetch, and Vite.
4. **Snapshot Contributor**
   - Changes Snapshot itself and must keep source, reference, guides, and examples aligned.

## Canonical Sources

These are the only canonical sources for documentation truth:

- Public entrypoints:
  - `src/index.ts`
  - `src/ui.ts`
  - `src/ssr/index.ts`
  - `src/vite/index.ts`
- Manifest and component schemas:
  - `src/ui/manifest/schema.ts`
  - component `schema.ts` files under `src/ui/components/**`
- Runtime and registry files:
  - `src/ui/manifest/**`
  - `src/cli/commands/**`
  - `src/ssr/**`
  - `src/vite/**`
- Canonical examples:
  - `playground/src/showcase.tsx`
  - `examples/**` once the examples registry lands

Generated reference must be built from those sources. Human-written guides explain behavior, tradeoffs, and composition, but they must not become shadow contracts.

## Contributor Flow

When implementing Snapshot changes, contributors and agents must follow this order:

1. Read `docs/engineering-rules.md`
2. Read this file
3. Read root `CLAUDE.md`
4. Read the nearest surface `CLAUDE.md`
5. Read `apps/docs/src/content/docs/contribute/testing.md`
6. Read the relevant public entrypoint
7. Read the relevant schema, runtime, registry, and nearest test files
8. Implement the code change
9. Update JSDoc, generated docs inputs, impacted guides, impacted examples, and proving tests in the same change
10. Run `bun run docs:ci`
11. Run the normal repo checks

## App Builder Discovery Flow

An app-building agent should not scan the whole repo.

Use this discovery order:

1. Public docs app "Start Here" page
2. Persona-specific guide:
   - manifest app builder
   - SDK app builder
   - SSR/platform integrator
3. Generated reference for the relevant entrypoint
4. Canonical example linked from that guide
5. Only then inspect lower-level source if needed

## Update Rules

Any change to public behavior or public shape must update all relevant layers in the same change:

- source code
- JSDoc on public exports
- generated reference inputs
- impacted guides
- impacted examples
- impact map coverage if the changed surface is new

If you changed any of the following and did not update docs, the change is incomplete:

- exported SDK/UI/SSR/Vite APIs
- manifest schema
- CLI commands or scaffold behavior
- SSR/RSC behavior
- component schemas or component runtime behavior
- auth, realtime, community, push, webhook, or sync contracts

## Validation

`bun run docs:ci` is the default documentation validation path for Snapshot contributor work.

`docs:ci` is expected to cover:

- docs generation
- docs typecheck
- docs impact checks
- docs coverage checks
- example smoke checks

Do not treat docs updates as a separate cleanup pass after implementation. They ship with the implementation.
