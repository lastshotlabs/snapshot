# Snapshot Playground

The playground is the current canonical example system for Snapshot. It is not disposable demo code.

## Read First

- `playground/src/showcase.tsx`
- `playground/src/app.tsx`
- `playground/src/token-editor.tsx`
- `playground/src/styles.css`
- `src/ui.ts`
- `apps/docs/src/content/docs/examples/index.md`

## Expectations

- New user-facing components and notable composed patterns should be represented in the playground unless there is a clear reason not to.
- Showcase states should be realistic enough to support docs screenshots, examples, and validation.
- If a guide links to the playground, the showcased behavior must reflect current source.
- If a new capability is visible to app builders, update the examples page and any top-level page that should advertise it.

## Required Follow-Through

- keep showcase metadata in sync with the current component catalog
- update docs links when sections or pages move
- do not add placeholder demos that do not reflect real config or runtime behavior
