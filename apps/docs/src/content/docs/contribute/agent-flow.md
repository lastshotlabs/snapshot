---
title: Agent Flow
description: The repo-native discovery and update path for implementation agents changing Snapshot itself.
draft: false
---

Implementation agents should not scan Snapshot blindly.

Use this discovery order:

1. Read `docs/engineering-rules.md`.
2. Read `docs/documentation-policy.md`.
3. Read root `CLAUDE.md`.
4. Read the nearest surface `CLAUDE.md`.
5. Read [Contributor Testing](/contribute/testing/).
6. Read the public entrypoint for the surface you are changing.
7. Read the schema, runtime, registry, generator, example, and nearest test files named by that surface guide.

For manifest UI work, treat these files as the canonical styling and composition pattern library:

- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/components/forms/button/schema.ts`
- `src/ui/components/forms/button/component.tsx`
- `src/ui/components/overlay/popover/schema.ts`
- `src/ui/components/overlay/popover/component.tsx`
- `playground/src/showcase.tsx`

For app-builder-facing discovery truth, treat these files as canonical:

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/examples/index.md`
- `playground/src/showcase.tsx`

Then execute the change in one pass:

1. update the code
2. update JSDoc on affected public exports
3. update generated docs inputs
4. update impacted guides under `apps/docs`
5. update the top-level discovery pages if the capability inventory changed
6. update impacted examples or playground showcase coverage
7. update or add the nearest proving tests for the changed contract
8. update the documentation impact map if the surface is new
9. run `bun run docs:ci`

If you introduce or change a visible manifest UI surface:

- define or update named `slots`
- use canonical runtime state names
- update [Theming and Styling](/guides/theming-and-styling/) when the platform pattern changed
- update any persona guide that should send app builders to the new surface

Canonical contributor instructions live in:

- root `CLAUDE.md`
- `src/ui/CLAUDE.md`
- `src/ssr/CLAUDE.md`
- `src/cli/CLAUDE.md`
- `playground/CLAUDE.md`
- `apps/docs/CLAUDE.md`

If public behavior changed and one of those layers did not move with it, the change is incomplete.
