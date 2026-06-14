# Snapshot CLI Surface

Read this after root `CLAUDE.md` when changing scaffold, sync, templates, or generated project behavior.

## Read First

- `src/cli/index.ts`
- `src/cli/commands/init.ts`
- `src/cli/commands/sync.ts`
- `src/cli/scaffold.ts`
- `src/cli/sync.ts`
- `src/cli/templates/package-json.ts`
- `src/cli/templates/snapshot-lib.ts`
- `src/cli/templates/vite-config.ts`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/reference/cli.md`
- `apps/docs/src/content/docs/contribute/testing.md`

## Expectations

- CLI docs must match actual generated output, flags, and defaults.
- If scaffold output changes, update the relevant docs and example guidance in the same change.
- If sync behavior changes, update the SDK runtime flow that depends on generated contract output.

## Cross-Cutting Docs To Review

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/examples/index.md`

## Required Follow-Through

- update JSDoc and generated CLI reference inputs
- update app-author guides under `apps/docs`
- update examples that rely on scaffold or sync behavior
- update proving tests under `src/cli/__tests__`
- update the documentation impact map for new command surfaces
