# Snapshot Docs App

This app is the public documentation product for Snapshot.

## Read First

- `apps/docs/astro.config.mjs`
- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/build/manifest-apps.md`
- `apps/docs/src/content/docs/build/sdk-apps.md`
- `apps/docs/src/content/docs/integrate/ssr-rsc.md`
- `apps/docs/src/content/docs/contribute/overview.md`
- `apps/docs/src/content/docs/contribute/testing.md`
- `scripts/docs/generate-all.ts`
- `docs/documentation-policy.md`

## Expectations

- Public docs explain and orient. Generated reference enumerates contracts.
- Do not hand-maintain source-backed tables that should be generated.
- If a source surface changes, update the relevant guide and generator input in the same change.
- Keep top-level pages truthful about actual Snapshot capabilities on `main`.

## Required Follow-Through

- run `bun run docs:ci`
- update docs links when pages move
