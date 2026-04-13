# Snapshot

Snapshot is the frontend framework for bunshot-powered backends.

It ships five contributor-facing surfaces:

- SDK runtime in `src/index.ts` and `src/create-snapshot.tsx`
- config-driven UI runtime in `src/ui.ts` and `src/ui/**`
- SSR and Vite integration in `src/ssr/**` and `src/vite/**`
- CLI and scaffold/sync tooling in `src/cli/**`
- docs and canonical examples in `apps/docs/**` and `playground/**`

## What Snapshot Supports On `main`

Snapshot is no longer just an in-progress manifest experiment.

It currently supports:

- manifest-driven app assembly with routes, resources, workflows, overlays, navigation, tokens, slots, and presets
- SDK-driven apps with `createSnapshot`, auth, MFA, passkeys, OAuth, community, webhooks, websocket, SSE, and push primitives
- plugin-driven extension through `definePlugin`, custom components, component groups, and manifest schema generation
- SSR, manifest rendering, RSC-aware rendering, prefetch manifests, PPR, and SSG-oriented Vite integration
- a large config-addressable UI catalog across data, forms, layout, navigation, overlays, content, media, communication, commerce, and workflow

Manifest-first is a first-class path. Custom React and SSR integration are also first-class paths. Do not force everything through one model when the public API already supports several.

## Read Order For Contributors

Before changing Snapshot, contributors and implementation agents must read:

1. `docs/engineering-rules.md`
2. `docs/documentation-policy.md`
3. this file
4. the nearest surface `CLAUDE.md`
5. `apps/docs/src/content/docs/contribute/testing.md`
6. the relevant public entrypoint
7. the relevant schema, runtime, registry, example, and nearest test files

Surface guides:

- `src/ui/CLAUDE.md`
- `src/ssr/CLAUDE.md`
- `src/cli/CLAUDE.md`
- `playground/CLAUDE.md`
- `apps/docs/CLAUDE.md`

## Read Order For App Builders

App-building agents should not scan the repo.

Use this order:

1. `apps/docs/src/content/docs/index.md`
2. `apps/docs/src/content/docs/start-here/index.md`
3. the persona guide for the job:
   - `apps/docs/src/content/docs/build/manifest-apps.md`
   - `apps/docs/src/content/docs/build/sdk-apps.md`
   - `apps/docs/src/content/docs/integrate/ssr-rsc.md`
4. generated reference for the relevant surface
5. `apps/docs/src/content/docs/examples/index.md`
6. only then lower-level source

## Non-Negotiables

- Read actual source before documenting behavior. Guessing is a bug.
- Public API changes must update JSDoc, generated reference inputs, impacted guides, impacted examples, and proving tests in the same change.
- Capability changes must review top-level docs, not just reference pages. At minimum consider:
  - `apps/docs/src/content/docs/index.md`
  - `apps/docs/src/content/docs/start-here/index.md`
  - `apps/docs/src/content/docs/start-here/capabilities.md`
  - `apps/docs/src/content/docs/examples/index.md`
- If a change affects app-builder discovery, update the persona guide that should send readers to it.
- `bun run docs:ci` is the default docs validation path for contributor work.

## Writing Specs

Follow `docs/spec-process.md`.
