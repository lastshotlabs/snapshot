# Snapshot

**Pre-production. No external consumers.** Change anything freely — no deprecation cycles,
no backwards compat, no migration theater. If a pattern is wrong, fix it now.

## What Snapshot Is

Frontend SDK + CLI for bunshot-powered backends:

- **SDK** — TypeScript library (`createSnapshot` factory, hooks, types) for browser
- **CLI** — oclif-based tool (`snapshot init`, `snapshot sync`) for Node/Bun
- **Config-driven UI layer** _(in development)_ — design tokens, config-addressable
  components, page composition from manifest + OpenAPI, inter-component data binding,
  action vocabulary

Never mix browser-only APIs into CLI code or vice versa.

Backend manifest (bunshot) + frontend manifest (snapshot) = complete application.
`bunshot sync` reads the backend OpenAPI spec → generates typed API client + hooks →
generates page components and data bindings from frontend manifest + OpenAPI shapes.

## Manifest-First Requirement

**EVERYTHING runs in manifest mode.** If a feature requires writing React/TypeScript to
activate, it is incomplete. Test: "Can a user enable this by editing manifest JSON with
no TypeScript?" If no, the design is wrong.

## Rules

All engineering rules, code patterns, component conventions, token rules, SSR rules,
testing patterns, and definition of done live in [`docs/engineering-rules.md`](docs/engineering-rules.md).
Documentation workflow rules live in [`docs/documentation-policy.md`](docs/documentation-policy.md).

Before changing Snapshot, contributors and implementation agents must read:

1. `docs/engineering-rules.md`
2. `docs/documentation-policy.md`
3. this file
4. the nearest surface `CLAUDE.md`
5. `apps/docs/src/content/docs/contribute/testing.md`

Surface guides:

- `src/ui/CLAUDE.md`
- `src/ssr/CLAUDE.md`
- `src/cli/CLAUDE.md`
- `playground/CLAUDE.md`
- `apps/docs/CLAUDE.md`

## Writing Specs

Follow [`docs/spec-process.md`](docs/spec-process.md).
