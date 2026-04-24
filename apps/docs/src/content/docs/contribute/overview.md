---
title: Contributor Flow
description: How Snapshot contributors and implementation agents should discover context and keep docs aligned with code.
draft: false
---

Snapshot contributor flow is intentionally narrow so humans and agents do not need to rediscover repo structure on every change.

If you are implementing Snapshot through an agentic workflow, continue with [Contributor Testing](/contribute/testing/) and [Agent Flow](/contribute/agent-flow/) after this page.

## Read In This Order

1. `docs/engineering-rules.md`
2. `docs/documentation-policy.md`
3. root `CLAUDE.md`
4. the nearest surface `CLAUDE.md`
5. [Contributor Testing](/contribute/testing/)
6. the relevant public entrypoint
7. the relevant schema, runtime, registry, example, and nearest test files

## Then Do The Work

1. implement the code change
2. update JSDoc for public exports and important option shapes
3. update generated docs inputs
4. update impacted guides
5. review the cross-cutting discovery pages if the capability inventory changed
6. update impacted examples or playground coverage
7. update or add the proving tests for the changed contract
8. run `bun run docs:ci`

## Cross-Cutting Discovery Pages

When a change affects what users or agents should discover at a high level, review:

- `apps/docs/src/content/docs/index.md`
- `apps/docs/src/content/docs/start-here/index.md`
- `apps/docs/src/content/docs/start-here/installation.md`
- `apps/docs/src/content/docs/examples/index.md`

## What Counts As Incomplete

If you changed any public behavior and skipped one of these layers, the work is incomplete:

- exported SDK, UI, SSR, or Vite surfaces
- manifest schema or runtime behavior
- component schema or component runtime behavior
- CLI scaffold or sync behavior
- top-level discovery pages for a changed capability
- examples or showcase coverage for a visible surface

If any public behavior changed and docs did not move with it, the work is incomplete.
