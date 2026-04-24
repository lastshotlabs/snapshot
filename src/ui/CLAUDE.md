# Snapshot UI Surface

Read this after root `CLAUDE.md` when changing config-driven UI, manifest runtime, tokens, components, presets, or entity-page assembly.

## Read First

- `src/ui.ts`
- `src/ui/manifest/schema.ts`
- `src/ui/manifest/index.ts`
- `src/ui/manifest/runtime.tsx`
- `src/ui/manifest/component-registry.tsx`
- `src/ui/manifest/renderer.tsx`
- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/components/_base/component-wrapper.tsx`
- `src/ui/tokens/schema.ts`
- `src/ui/tokens/resolve.ts`
- `src/ui/presets/index.ts`
- `src/ui/entity-pages/index.ts`
- `playground/src/showcase.tsx`
- `apps/docs/src/content/docs/build/manifest-apps.md`
- `apps/docs/src/content/docs/build/styling-and-slots.md`
- `apps/docs/src/content/docs/examples/index.md`
- `apps/docs/src/content/docs/contribute/testing.md`

## Expectations

- Manifest contract changes must be verified against `src/ui/manifest/schema.ts`.
- Component contract changes must be verified against the component's `schema.ts`.
- Styling guidance must match the real slots and state surfaces in `_base/schema.ts` and `_base/style-surfaces.ts`.
- If you change a visible UI capability, update the playground section or add one that proves the behavior on `main`.
- If a change alters what app builders should discover, update the top-level docs pages, not just the reference page.

## Cross-Cutting Docs To Review

UI changes often affect more than one guide. Review:

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/examples/index.md`
- `apps/docs/src/content/docs/build/manifest-apps.md`
- `apps/docs/src/content/docs/build/styling-and-slots.md`
- the relevant reference page under `apps/docs/src/content/docs/reference`

## Required Follow-Through

For UI work, update all relevant layers in the same change:

- JSDoc on public exports in `src/ui.ts`
- generated manifest or component reference inputs
- public guides under `apps/docs`
- playground showcase coverage
- proving tests in `src/ui/**/__tests__`
- documentation impact map if the changed surface is new
