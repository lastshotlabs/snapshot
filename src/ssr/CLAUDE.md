# Snapshot SSR Surface

Read this after root `CLAUDE.md` when changing SSR, manifest rendering, RSC, prefetch, cache, or server action surfaces.

## Read First

- `src/ssr/index.ts`
- `src/ssr/render.ts`
- `src/ssr/renderer.ts`
- `src/ssr/manifest-renderer.ts`
- `src/ssr/rsc.ts`
- `src/ssr/types.ts`
- `src/vite/index.ts`
- `src/vite/rsc-transform.ts`
- `src/vite/prefetch.ts`
- `apps/docs/src/content/docs/contribute/testing.md`
- `apps/docs/src/content/docs/integrate/ssr-rsc.md`
- `apps/docs/src/content/docs/reference/ssr.md`
- `apps/docs/src/content/docs/reference/vite.md`

## Expectations

- SSR and RSC docs must describe current runtime behavior, not intended behavior.
- Any change to server render flow, RSC enablement, manifest renderer behavior, or prefetch behavior requires docs updates in the same change.
- If exports in `src/ssr/index.ts` or `src/vite/index.ts` change, update JSDoc and generated reference inputs.

## Required Follow-Through

- update source-backed SSR/Vite reference content
- update public SSR/RSC integration guides
- update impacted examples
- update proving tests under `src/ssr/__tests__` or `src/vite/__tests__`
- update the documentation impact map for new SSR/Vite surfaces
