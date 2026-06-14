# Snapshot UI Surface

Read this after root `CLAUDE.md` when changing code-first UI, standalone components, tokens, state/context helpers, or public UI exports.

## Read First

- `src/ui.ts`
- `src/ui/components/*/*/standalone.tsx`
- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/components/_base/types.ts`
- `src/ui/tokens/schema.ts`
- `src/ui/tokens/resolve.ts`
- `playground/src/showcase.tsx`
- `apps/docs/src/content/docs/build/styling-and-slots.md`
- `apps/docs/src/content/docs/examples/index.md`
- `apps/docs/src/content/docs/contribute/testing.md`

## Expectations

- Public UI exports should stay code-first and avoid config adapter layers.
- Component prop changes should be reflected in the component's standalone types.
- Styling guidance must match the real slots and state surfaces in `_base/types.ts` and `_base/style-surfaces.ts`.
- If you change a visible UI capability, update the playground section or add one that proves the behavior on `main`.
- If a change alters what app authors should discover, update the top-level docs pages, not just the reference page.

## Required Follow-Through

For UI work, update all relevant layers in the same change:

- JSDoc on public exports in `src/ui.ts`
- public guides under `apps/docs`
- playground showcase coverage
- focused tests in `src/ui/**/__tests__`
- documentation impact map if the changed surface is new
