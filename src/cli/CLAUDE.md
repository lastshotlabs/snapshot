# Snapshot CLI Surface

Read this after root `CLAUDE.md` when changing scaffold, sync, manifest commands, templates, or generated project behavior.

## Read First

- `src/cli/index.ts`
- `src/cli/commands/init.ts`
- `src/cli/commands/sync.ts`
- `src/cli/commands/manifest/init.ts`
- `src/cli/commands/manifest/validate.ts`
- `src/cli/scaffold.ts`
- `src/cli/sync.ts`
- `src/cli/templates/package-json.ts`
- `src/cli/templates/snapshot-lib.ts`
- `src/cli/templates/vite-config.ts`
- `apps/docs/src/content/docs/contribute/testing.md`

## Expectations

- CLI docs must match actual generated output and actual flags.
- If scaffold output changes, update the relevant docs and runnable examples in the same change.
- If sync output or contract changes, update docs for SDK builders and manifest builders.

## Required Follow-Through

- update JSDoc and generated CLI reference inputs
- update app-builder guides under `apps/docs`
- update examples that rely on scaffold or sync behavior
- update proving tests under `src/cli/__tests__`
- update the documentation impact map for new command surfaces
