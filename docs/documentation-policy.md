# Documentation Policy

Snapshot documentation is a product surface. It ships with the framework, not after it.

## Documentation Personas

Snapshot has four primary documentation personas:

1. **Manifest App Builder**
   - builds primarily from `snapshot.manifest.json`, built-in schemas, presets, workflows, routes, and tokens
2. **SDK App Builder**
   - builds with `createSnapshot`, generated client output, auth/realtime/community/webhook hooks, and custom React
3. **SSR / Platform Integrator**
   - integrates Snapshot with Bunshot SSR, manifest rendering, RSC, Vite, PPR, prefetch, and SSG
4. **Snapshot Contributor**
   - changes Snapshot itself and must keep source, docs, examples, and tests aligned

## Canonical Sources Of Truth

These are the only canonical documentation sources:

- public entrypoints:
  - `src/index.ts`
  - `src/ui.ts`
  - `src/ssr/index.ts`
  - `src/vite/index.ts`
- schemas and source-backed contracts:
  - `src/ui/manifest/schema.ts`
  - `src/ui/components/**/schema.ts`
  - `src/cli/commands/**`
  - `src/ssr/**`
  - `src/vite/**`
  - `src/plugin.ts`
  - `src/schema-generator.ts`
- canonical examples:
  - `playground/src/showcase.tsx`
  - `playground/src/app.tsx`
  - `playground/src/token-editor.tsx`

Generated reference must be derived from those sources. Human-written guides should explain workflow, composition, and tradeoffs without becoming shadow contracts.

## Contributor Discovery Flow

When implementing Snapshot changes, contributors and agents must follow this order:

1. `docs/engineering-rules.md`
2. this file
3. root `CLAUDE.md`
4. the nearest surface `CLAUDE.md`
5. `apps/docs/src/content/docs/contribute/testing.md`
6. the relevant public entrypoint
7. the relevant schema, runtime, registry, example, and nearest test files
8. implement the change
9. update JSDoc, generated reference inputs, impacted guides, impacted examples, and proving tests in the same change
10. run `bun run docs:ci`
11. run the normal repo checks

## App Builder Discovery Flow

App-building agents should not discover Snapshot by crawling the whole repo.

Use this order:

1. docs homepage
   - `apps/docs/src/content/docs/index.md`
2. choose the persona path
   - `apps/docs/src/content/docs/start-here/index.md`
3. read the relevant build or integration guide
   - `build/manifest-apps.md`
   - `build/sdk-apps.md`
   - `integrate/ssr-rsc.md`
4. read generated reference for the surface in use
5. read `apps/docs/src/content/docs/examples/index.md`
6. only then inspect lower-level source when necessary

## Required Update Layers

Any public behavior or public shape change must update all relevant layers in the same change:

- source code
- JSDoc on public exports and important option shapes
- generated reference inputs
- persona guides and integration guides
- top-level discovery pages when the capability inventory changed
- canonical examples or playground coverage
- proving tests
- documentation impact map when the surface is new

## Cross-Cutting Pages That Must Stay Honest

When a capability changes, do not stop at the local page. Review these cross-cutting pages:

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/examples/index.md`

These pages are where drift becomes most expensive because they shape how humans and agents discover the framework.

## Special Rules

- Do not leave public docs speaking about phases, waves, or planned states when the surface is already shipping on `main`.
- Do not write prose that outruns the source contract.
- Do not add example snippets that are looser than the current API shape.
- Until a larger runnable example workspace exists, the playground is the canonical example system and must be kept representative.

## Validation

`bun run docs:ci` is the default documentation validation path for Snapshot contributor work.

`docs:ci` is expected to cover:

- docs generation
- docs typecheck
- docs impact checks
- docs coverage checks
- example smoke checks
- docs build

If public behavior changed and docs did not move with it, the change is incomplete.
