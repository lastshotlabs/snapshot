# Snapshot

Snapshot is the frontend framework for bunshot-powered backends.

It ships five contributor-facing surfaces:

- SDK runtime in `src/index.ts` and `src/create-snapshot.tsx`
- code-first UI runtime in `src/ui.ts` and `src/ui/**`
- SSR and Vite integration in `src/ssr/**` and `src/vite/**`
- CLI and scaffold/sync tooling in `src/cli/**`
- docs and canonical examples in `apps/docs/**` and `playground/**`

## What Snapshot Supports On `main`

Snapshot is a code-first frontend framework for bunshot-powered backends.

It currently supports:

- code-first apps with `createSnapshot`, auth, MFA, passkeys, OAuth, community, webhooks, websocket, SSE, and push primitives
- standalone React UI components with typed props, slots, design tokens, actions, state/context helpers, and hooks
- plugin-driven extension through `definePlugin` and custom SDK integrations
- SSR, RSC-aware rendering, prefetch manifests, PPR, and SSG-oriented Vite integration
- a large standalone UI catalog across data, forms, layout, navigation, overlays, content, media, communication, commerce, and workflow

Code-first is the product path. Keep authoring explicit: TypeScript config, React composition, typed props, and source-backed docs.

## Read Order For Contributors

Before changing Snapshot, contributors and implementation agents must read:

1. `docs/engineering-rules.md`
2. `docs/documentation-policy.md`
3. this file
4. the nearest surface `CLAUDE.md`
5. `apps/docs/src/content/docs/contribute/testing.md`
6. the relevant public entrypoint
7. the relevant component, runtime, registry, example, and nearest test files

Surface guides:

- `src/ui/CLAUDE.md`
- `src/ssr/CLAUDE.md`
- `src/cli/CLAUDE.md`
- `playground/CLAUDE.md`
- `apps/docs/CLAUDE.md`

## Read Order For App Authors

App-authoring agents should not scan the repo.

Use this order:

1. `apps/docs/src/content/docs/index.md`
2. `apps/docs/src/content/docs/start-here/index.md`
3. the guide for the job:
   - SDK/runtime: `apps/docs/src/content/docs/guides/authentication.md` and the relevant guide under `apps/docs/src/content/docs/guides/`
   - UI: `apps/docs/src/content/docs/build/component-library.md`, `apps/docs/src/content/docs/build/styling-and-slots.md`, and `apps/docs/src/content/docs/reference/components.md`
   - SSR: `apps/docs/src/content/docs/server/ssr-rsc.md`
4. `docs/api-cheatsheet.md` — single-file public API quick reference
5. generated reference for the relevant surface
6. `apps/docs/src/content/docs/examples/index.md`
7. only then lower-level source

## Non-Negotiables

- Read actual source before documenting behavior. Guessing is a bug.
- Public API changes must update JSDoc, generated reference inputs, impacted guides, impacted examples, and proving tests in the same change.
- Capability changes must review top-level docs, not just reference pages. At minimum consider:
  - `apps/docs/src/content/docs/index.md`
  - `apps/docs/src/content/docs/start-here/index.md`
  - `apps/docs/src/content/docs/start-here/installation.md`
  - `apps/docs/src/content/docs/examples/index.md`
- If a change affects app-author discovery, update the persona guide that should send readers to it.
- `bun run docs:ci` is the default docs validation path for contributor work.

## Writing Specs

Follow `docs/spec-process.md`.
