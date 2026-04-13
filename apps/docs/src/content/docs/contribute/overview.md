---
title: Contributor Flow
description: How Snapshot contributors and implementation agents should discover context and keep docs aligned with code.
draft: false
---

Snapshot contributor flow is intentionally narrow so humans and agents do not need to rediscover repo structure on every change.

If you are implementing Snapshot through an agentic workflow, continue with [Contributor Testing](/contribute/testing/) and [Agent Flow](/contribute/agent-flow/) after this page.

## Read in this order

1. `docs/engineering-rules.md`
2. `docs/documentation-policy.md`
3. root `CLAUDE.md`
4. the nearest surface `CLAUDE.md`
5. [Contributor Testing](/contribute/testing/)
6. the relevant public entrypoint
7. the relevant schema, runtime, registry, and example files

## Then do the work

1. implement the code change
2. update JSDoc for public exports and important option shapes
3. update generated docs inputs
4. update impacted guides
5. update impacted examples or playground coverage
6. update or add the proving tests for the changed contract
7. run `bun run docs:ci`

## What Counts As Incomplete

If you changed any public behavior and skipped one of these layers, the work is incomplete:

- exported SDK, UI, SSR, or Vite surfaces
- manifest schema or runtime behavior
- component schema or component runtime behavior
- CLI scaffold or sync behavior
- examples or showcase coverage for a visible surface

If any public behavior changed and docs did not move with it, the work is incomplete.
