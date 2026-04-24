# Snapshot Docs App

This app is Snapshot's public documentation product. It is also the primary discovery surface for app-building agents.

## Read First

- `apps/docs/astro.config.mjs`
- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/guides/authentication.md`
- `apps/docs/src/content/docs/guides/forms.md`
- `apps/docs/src/content/docs/manifest/quick-start.md`
- `apps/docs/src/content/docs/manifest/examples.md`
- `apps/docs/src/content/docs/contribute/overview.md`
- `apps/docs/src/content/docs/contribute/agent-flow.md`
- `apps/docs/src/content/docs/contribute/testing.md`
- `scripts/docs/generate-all.ts`
- `docs/documentation-policy.md`

## Expectations

- Public docs orient readers. Generated reference enumerates exact contracts.
- Top-level pages must stay honest about what Snapshot can do on `main`.
- Do not leave app builders guessing whether a capability exists. If a feature is real, the top-level docs should reveal it.
- Do not hand-maintain source-backed tables that should be generated.
- Until dedicated runnable example apps land, the playground is the canonical example surface.

## Cross-Cutting Pages

When a user-facing capability changes, review these pages in addition to the local reference page:

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/guides/` (the relevant guide)
- `apps/docs/src/content/docs/manifest/examples.md`

## Required Follow-Through

- update docs links when pages move
- update generator inputs when source-backed reference changes
- update persona guides when discovery flow changes
- run `bun run docs:ci`
