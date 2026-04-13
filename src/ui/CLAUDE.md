# Snapshot UI Surface

Read this after root `CLAUDE.md` when changing config-driven UI, manifest runtime, tokens, components, or presets.

## Read First

- `src/ui.ts`
- `src/ui/manifest/schema.ts`
- `src/ui/manifest/index.ts`
- `src/ui/manifest/component-registry.tsx`
- `src/ui/manifest/runtime.tsx`
- `src/ui/manifest/renderer.tsx`
- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/component-wrapper.tsx`
- `src/ui/tokens/resolve.ts`
- `src/ui/tokens/schema.ts`
- `playground/src/showcase.tsx`
- `apps/docs/src/content/docs/contribute/testing.md`

## Expectations

- Manifest contract changes must be verified against `src/ui/manifest/schema.ts`.
- Component contract changes must be verified against the component's `schema.ts`.
- If you change a registered component, update the relevant source-backed docs and playground coverage.
- If you add a new user-facing capability, update the capability map and link at least one canonical example.
- Do not document old manifest shapes after the schema changes. Guides must match current source.

## Required Follow-Through

For UI work, update all relevant layers in the same change:

- JSDoc on public exports in `src/ui.ts`
- generated manifest or component reference inputs
- public guides under `apps/docs`
- playground showcase metadata or examples
- proving tests in `src/ui/**/__tests__`
- documentation impact map if the changed surface is new
