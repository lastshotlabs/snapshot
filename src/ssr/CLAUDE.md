# Snapshot SSR Surface

Read this after root `CLAUDE.md` when changing SSR, manifest rendering, RSC, PPR, prefetch, cache, or server action surfaces.

## Read First

- `src/ssr/index.ts`
- `src/ssr/render.ts`
- `src/ssr/renderer.ts`
- `src/ssr/manifest-renderer.ts`
- `src/ssr/rsc.ts`
- `src/ssr/ppr.ts`
- `src/ssr/ppr-cache.ts`
- `src/ssr/prefetch.ts`
- `src/ssr/types.ts`
- `src/vite/index.ts`
- `src/vite/rsc-transform.ts`
- `src/vite/prefetch.ts`
- `apps/docs/src/content/docs/server/ssr-rsc.md`
- `apps/docs/src/content/docs/reference/ssr.md`
- `apps/docs/src/content/docs/reference/vite.md`
- `apps/docs/src/content/docs/contribute/testing.md`

## Expectations

- SSR and RSC docs must describe current runtime behavior, not intended behavior.
- Public docs should talk about shipping render modes and integration contracts, not internal phase names.
- If exports in `src/ssr/index.ts` or `src/vite/index.ts` change, update JSDoc and generated reference inputs.
- If the integration path changed, update the app-builder docs that route readers into SSR, not just the reference page.

## Cross-Cutting Docs To Review

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/guides/authentication.md`
- `apps/docs/src/content/docs/server/ssr-rsc.md`
- `apps/docs/src/content/docs/examples/index.md`

## Required Follow-Through

- update source-backed SSR and Vite reference content
- update public SSR and RSC integration guides
- update impacted examples
- update proving tests under `src/ssr/__tests__` or `src/vite/__tests__`
- update the documentation impact map for new SSR or Vite surfaces
