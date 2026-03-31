---
name: Prior Work
description: What's been built so far across bunshot and snapshot repos
type: project
---

## Bunshot (backend framework) — /Users/jdd/projects/bunshot

- Mature production-grade Bun + Hono framework
- Monorepo with 12 packages (core, auth, admin, community, webhooks, push, mail, permissions, postgres, bullmq, entity, docs)
- Auth being refactored into sub-packages
- Full auth system: sessions, JWT, OAuth (9 providers), MFA (TOTP, email OTP, WebAuthn), passkeys, SAML, SCIM, M2M
- Multi-backend: memory, SQLite, MongoDB, PostgreSQL, Redis
- WebSocket + SSE, BullMQ jobs, rate limiting, metrics, OpenAPI docs
- Config generation layer built in src/framework/config/generation/
- Entity generation layer in packages/bunshot-entity

## Snapshot (frontend framework) — /Users/jdd/projects/snapshot

### Core (existing, refactored)

- Plugin-based architecture: `createSnapshot(coreConfig, ...plugins)` replaces monolithic factory
- 6 plugins: auth, ws, sse, community, webhooks, push
- ApiClient cleaned: auth concerns decoupled, set via plugin setup
- All hook factories use inline config types (no SnapshotConfig dependency)
- CLI: `snapshot init` (scaffolds project), `snapshot sync` (generates typed API client + hooks with include/exclude filtering)

### Token System (new)

- 9-category Zod schema (colors, spacing, radius, typography, shadows, breakpoints, zIndex, transitions, interactions)
- 3-level composable presets: full presets → category presets → value overrides
- Extensible registries for custom presets
- CSS custom property generation with light/dark mode
- React TokenProvider

### Component Library (new)

- Hierarchical component registry (mirrors bunshot HandlerRegistry)
- 17 built-in components: row, stack, card, sidebar-layout, table, detail, stat-card, feed, chart, form, login, register, forgot-password, nav, breadcrumb, modal, empty-state
- Each component has .tsx implementation + .schema.ts Zod config schema
- Data binding layer: useDataSource, useMutationSource (resolves { from: "id" } refs)
- Page context: inter-component communication via jotai atoms
- Action system: 9-action vocabulary + executeAction dispatcher
- ComponentRenderer: walks config tree, resolves from registry, renders React

### Manifest System (new)

- Frontend manifest Zod schema: theme, auth screens, nav, pages, features, api, ws, sse, environments
- Constraint engine: 8 rules (data-source-required, nav-path-exists, component-id-unique, from-ref-exists, etc.)
- Audit suite: 7 rules (accessibility, UX, performance, security, consistency)
- Handler registry: 6 categories (component, layout, action, validator, formatter, guard)
- Built-in formatters: date, datetime, currency, number, percent, relative-time, truncate, boolean, json

### Generation Pipeline (new)

- 4-phase pipeline: validate schema → check constraints → run audits → generate output
- Page generator: manifest pages → React component files
- Route generator: manifest pages → TanStack Router route tree
- Theme generator: manifest theme → CSS custom properties file
- Pure function: same manifest → same output
