# Phase 13+: Next Sprint — Canonical Spec

> **Base:** `origin/main` (32 commits, 31 components shipped)
> **Status:** Draft — pending developer review

| Phase | Title                                              | Status          | Track |
| ----- | -------------------------------------------------- | --------------- | ----- |
| 13-A  | Fix test suite (vitest DOM config)                 | Ready           | A     |
| 13-B  | Page Presets                                       | Ready           | B     |
| 13-C  | Remaining Phase 2 components (Feed, Chart, Wizard) | Ready           | C     |
| 13-D  | Headless hooks surface                             | Blocked by 13-B | B     |

---

## Vision

The foundation is built. 31 production components, a full token system, inter-component
data binding, action vocabulary, and a manifest renderer. The repo is 60% test-passing due
to a config issue, has no page-level compositions (presets), and is missing 4 core Phase 2
components that are needed for real apps (Feed, Chart, Wizard, CommandPalette).

**Before:** You can render individual components from a manifest. Tests are noisy. There are
no presets for common page patterns.

**After:** Tests are clean. You can drop a `CrudPage`, `DashboardPage`, or `SettingsPage`
preset into a manifest and get a full working page with zero component composition. The
remaining high-value Phase 2 components (Feed, Chart) exist and are in the playground.

---

## What Already Exists on Main

> Audited, not assumed.

### Fully Working

- **Token system** — `src/ui/tokens/`: `resolve.ts`, `editor.ts`, `flavors.ts`, `color.ts`,
  `schema.ts`. All 8 flavors defined. `resolveTokens()` and `useTokenEditor()` complete.
- **Context system** — `src/ui/context/`: `usePublish()`, `useSubscribe()`,
  `useResolveFrom()`, `AppContextProvider`, `PageContextProvider`. From-ref resolution with
  `global.` prefix support.
- **Action system** — `src/ui/actions/`: All 9 actions (navigate, api, open-modal,
  close-modal, refresh, set-value, download, confirm, toast). `useActionExecutor()`,
  `useModalManager()`, `useToastManager()`, `useConfirmDialog()`.
- **Manifest system** — `src/ui/manifest/`: `<ManifestApp>`, `<PageRenderer>`,
  `<ComponentRenderer>`, `registerComponent()`, full Zod schema.
- **31 components** — All have `schema.ts`, `component.tsx`, `types.ts`, `index.ts`,
  `__tests__/`. See component inventory below.
- **Playground** — `playground/src/`: `showcase.tsx`, `token-editor.tsx`. Fully runnable.
- **CLI** — `snapshot init`, `snapshot sync`, `snapshot generate`, `snapshot manifest init`,
  `snapshot manifest validate`.
- **Generation layer** — `src/generation/`: `generator.ts`, `app-entry.ts`, `pages.ts`,
  `routes.ts`, `theme.ts`, `config.ts`.

### Component Inventory (31 total)

| Group       | Components                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| layout/     | layout, nav                                                                                              |
| data/       | stat-card, data-table, detail-card, list, badge, avatar, empty-state, alert, progress, skeleton, tooltip |
| forms/      | auto-form, switch                                                                                        |
| overlay/    | modal, drawer, dropdown-menu                                                                             |
| navigation/ | tabs, accordion, breadcrumb, stepper, tree-view                                                          |
| content/    | rich-text-editor, file-uploader, code-block, timeline                                                    |
| workflow/   | kanban, calendar, audit-log, notification-feed                                                           |
| commerce/   | pricing-table                                                                                            |

### Broken: Test Suite

**571 pass, 367 fail, 4 skip** out of 942 total.

Root cause: `vitest.config.ts` sets `environment: "happy-dom"` globally, but component tests
use `@testing-library/react` which requires `jsdom`. Many tests fail with
`document is not defined` or environment-related assertion failures.

Fix: per-file `@vitest-environment jsdom` annotation or split vitest configs by environment.

### Missing

- **Page Presets** — No `src/ui/presets/` directory. Not started.
- **Feed component** — Data stream/activity feed. Not implemented.
- **Chart component** — Data visualization. Not implemented.
- **Wizard component** — Multi-step form flow. Not implemented.
- **CommandPalette** — Search/command UI. Not implemented.
- **Headless hooks surface** — `useDataTable`, `useAutoForm` exist but most components have
  no exported headless hook. `src/ui/hooks/` has only `use-breakpoint.ts`.
- **Auto-field derivation** — CLI sync does not yet infer form fields / table columns from
  OpenAPI response shapes.

---

## Developer Context

### Build & Test Commands

```sh
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier
bun run build            # tsup + oclif manifest
bun test                 # vitest run
bun run lint             # eslint
```

### Key Files

| Path                                 | What                                           | Size       |
| ------------------------------------ | ---------------------------------------------- | ---------- |
| `src/ui.ts`                          | UI entry point — public API surface            | ~100 lines |
| `src/ui/tokens/resolve.ts`           | Token → CSS variable generation                | ~200 lines |
| `src/ui/manifest/renderer.tsx`       | `<PageRenderer>`                               | ~150 lines |
| `src/ui/manifest/schema.ts`          | Manifest Zod schema                            | ~200 lines |
| `src/ui/actions/executor.ts`         | Action dispatch                                | ~250 lines |
| `src/ui/context/hooks.ts`            | `usePublish`, `useSubscribe`, `useResolveFrom` | ~120 lines |
| `src/ui/components/data/data-table/` | Reference component (most complex)             | ~400 lines |
| `src/ui/components/forms/auto-form/` | Reference component (forms)                    | ~300 lines |
| `playground/src/showcase.tsx`        | All components + fixture data                  | ~800 lines |
| `vitest.config.ts`                   | Broken environment config                      | ~20 lines  |

### How Consumers Use This Today

```tsx
// Level 1: pure manifest
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
<ManifestApp manifest={myManifest} />;

// Level 2: manifest + custom
import { PageRenderer } from "@lastshotlabs/snapshot/ui";
<PageContextProvider pageId="users">
  <PageRenderer config={pageConfig} />
</PageContextProvider>;
```

---

## Non-Negotiable Engineering Constraints

From `CLAUDE.md` / `docs/engineering-rules.md`:

1. **`src/ui/` boundary** — All config-driven UI code lives under `src/ui/`. No exceptions.
2. **Component file convention** — `schema.ts`, `component.tsx`, `types.ts`, `index.ts`,
   `__tests__/`. Every component.
3. **Config is the only interface** — Components take `config` prop (from Zod schema). No
   other React props.
4. **Semantic tokens only** — `var(--sn-color-primary)`, not `#2563eb`. Every CSS value
   uses a token from the canonical list in `CLAUDE.md`.
5. **Components fetch their own data** — `useComponentData` for endpoint-bound components.
   Parents never pass data down.
6. **Playground required** — Every component must appear in `playground/src/showcase.tsx`
   with all states (loading, error, empty, populated) and token responsiveness.
7. **Tests ship with the feature** — `schema.test.ts` + `component.test.tsx` for every
   component.
8. **Definition of Done** — `bun run typecheck && bun run format:check && bun run build && bun test` all pass.
9. **No invented token names** — Every CSS variable used must exist in the canonical list.
   `--sn-color-danger` doesn't exist. `--sn-color-destructive` does.
10. **Overlay components animate** — Mounted + animating state pattern. No bare
    `if (!isOpen) return null`.

---

## Phase 13-A: Fix Test Suite

**Goal:** Get the test suite green (or near-green). 367 failing tests are noise that makes
real failures invisible.

### Root Cause

`vitest.config.ts` uses a single `environment: "happy-dom"` for all tests. Component tests
that use `@testing-library/react` need `jsdom`. The fix is to:

1. Keep `happy-dom` for non-DOM tests (token math, schema validation, utility functions)
2. Use `jsdom` for component rendering tests

### Implementation

Two options:

**Option A (preferred): Per-file docblock annotation**
Add `// @vitest-environment jsdom` to the top of every component test file. No config
changes needed. Explicit and easy to audit.

**Option B: Split config**
Two vitest config files — `vitest.config.ts` (happy-dom default) and
`vitest.browser.config.ts` (jsdom for `src/ui/components/**/*.test.tsx`). Cleaner but
requires running two suites.

**Pick Option A.** Simpler, no tooling changes, each test file is self-documenting.

### Files to Modify

- `vitest.config.ts` — add `@testing-library/jest-dom` to `setupFiles` if not present
- All `src/ui/components/**/__tests__/*.test.tsx` — add `// @vitest-environment jsdom`
- All `src/ui/manifest/__tests__/*.test.tsx` — add `// @vitest-environment jsdom`
- All `src/ui/context/__tests__/*.test.tsx` — add `// @vitest-environment jsdom`
- All `src/ui/actions/__tests__/*.test.tsx` — add `// @vitest-environment jsdom`

Non-DOM tests (tokens, schema, utils) stay on `happy-dom` — no annotation needed.

### Exit Criteria

- `bun test` passes ≥ 900/942 tests
- No `document is not defined` failures
- Zero regressions on currently-passing tests

---

## Phase 13-B: Page Presets

**Goal:** Ship composable page-level presets — pre-built manifest fragments for common
patterns (CRUD, Dashboard, Settings) that a consumer drops into their manifest. No new
components needed — presets are just typed manifest config factories.

### What a Preset Is

A preset is a TypeScript function that returns a `PageConfig` (the manifest page schema
type). It accepts high-level options and returns the fully-composed component tree.

```tsx
// Consumer usage — in their snapshot.manifest.json builder
import { crudPage } from "@lastshotlabs/snapshot/ui";

const usersPage = crudPage({
  title: "Users",
  listEndpoint: "GET /api/users",
  createEndpoint: "POST /api/users",
  deleteEndpoint: "DELETE /api/users/{id}",
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", badge: true },
  ],
  createForm: {
    fields: [
      { key: "name", type: "text", label: "Name", required: true },
      { key: "email", type: "email", label: "Email", required: true },
    ],
  },
});
```

### Types

```typescript
// src/ui/presets/types.ts

export interface CrudPageOptions {
  title: string;
  listEndpoint: string;
  createEndpoint?: string;
  updateEndpoint?: string;
  deleteEndpoint?: string;
  columns: ColumnDef[];
  createForm?: FormDef;
  updateForm?: FormDef;
  filters?: FilterDef[];
  /** id prefix for context refs — defaults to slugified title */
  id?: string;
}

export interface DashboardPageOptions {
  title: string;
  stats: StatDef[];
  charts?: ChartDef[]; // requires Chart component (Phase 13-C)
  recentActivity?: string; // endpoint for activity feed
  id?: string;
}

export interface SettingsPageOptions {
  title: string;
  sections: SettingsSectionDef[];
  id?: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  badge?: boolean;
  format?: "date" | "currency" | "number" | "boolean";
}

export interface FormDef {
  fields: FormFieldDef[];
}

export interface FormFieldDef {
  key: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "toggle";
  label: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export interface StatDef {
  label: string;
  endpoint: string;
  valueKey: string;
  format?: "number" | "currency" | "percent";
  trend?: { key: string; positive?: "up" | "down" };
}
```

### Presets to Ship (Phase 13-B)

| Preset          | File                               | Components used                                |
| --------------- | ---------------------------------- | ---------------------------------------------- |
| `crudPage`      | `src/ui/presets/crud-page.ts`      | DataTable, AutoForm, Modal, Drawer, EmptyState |
| `dashboardPage` | `src/ui/presets/dashboard-page.ts` | StatCard, List, EmptyState (Chart when ready)  |
| `settingsPage`  | `src/ui/presets/settings-page.ts`  | AutoForm, Tabs, Modal                          |

### Files to Create

```
src/ui/presets/
  types.ts           ← all preset option types (above)
  crud-page.ts       ← crudPage() factory
  dashboard-page.ts  ← dashboardPage() factory
  settings-page.ts   ← settingsPage() factory
  index.ts           ← re-export all three
```

### Export Surface

Add to `src/ui.ts`:

```typescript
export { crudPage, dashboardPage, settingsPage } from "./ui/presets/index";
export type {
  CrudPageOptions,
  DashboardPageOptions,
  SettingsPageOptions,
} from "./ui/presets/types";
```

### Playground Integration

Add a "Presets" tab to `playground/src/showcase.tsx` showing:

- `crudPage` rendered with mock `/api/users` fixture data
- `dashboardPage` with 4 stat cards and mock activity feed
- `settingsPage` with profile + password + notification sections

Each preset must visually respond to token changes (flavor switch, dark mode).

### Tests

```
src/ui/presets/__tests__/
  crud-page.test.ts       ← valid options produce valid PageConfig, invalid options reject
  dashboard-page.test.ts
  settings-page.test.ts
```

Tests are schema-level (output validation), not rendering tests. Presets return config —
assert the config is valid against the manifest page schema.

### Exit Criteria

- `crudPage(options)` returns a valid `PageConfig` (passes manifest page schema)
- `dashboardPage(options)` returns a valid `PageConfig`
- `settingsPage(options)` returns a valid `PageConfig`
- All three appear in playground with fixture data
- All token changes (flavor, dark mode, font size) visibly affect preset rendering in playground
- `bun test src/ui/presets` passes
- Exported from `@lastshotlabs/snapshot/ui`

---

## Phase 13-C: Feed, Chart, and Wizard Components

**Goal:** Ship the three high-value Phase 2 components missing from the library. These are
needed for `dashboardPage` (Chart, Feed) and complex data-entry flows (Wizard).

### Feed Component

Activity/event stream. Renders a list of timestamped events from an endpoint.

**Config schema (`src/ui/components/data/feed/schema.ts`):**

```typescript
export const feedSchema = z.object({
  id: z.string().optional(),
  data: z.union([z.string(), fromRefSchema]), // endpoint string or from-ref
  itemKey: z.string().default("id"),
  avatar: z.string().optional(), // field path for avatar URL
  title: z.string(), // field path for item title
  description: z.string().optional(), // field path for description
  timestamp: z.string().optional(), // field path for timestamp
  badge: z
    .object({
      field: z.string(),
      colorMap: z.record(z.string()).optional(),
    })
    .optional(),
  emptyMessage: z.string().default("No activity yet"),
  pageSize: z.number().int().default(20),
});
```

**Tokens used:** `--sn-color-card`, `--sn-color-card-foreground`, `--sn-color-muted-foreground`,
`--sn-color-border`, `--sn-spacing-sm`, `--sn-spacing-md`, `--sn-font-size-sm`,
`--sn-font-size-md`, `--sn-radius-md`

### Chart Component

Data visualization — bar, line, area, pie. Wraps a lightweight charting lib. Given the
tech stack (React 19, no existing chart dep), use **Recharts** (already commonly paired
with shadcn/Tailwind patterns and tree-shakes well).

**Config schema (`src/ui/components/data/chart/schema.ts`):**

```typescript
export const chartSchema = z.object({
  id: z.string().optional(),
  data: z.union([z.string(), fromRefSchema]),
  type: z.enum(["bar", "line", "area", "pie", "donut"]).default("bar"),
  xKey: z.string(),
  series: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      color: z.string().optional(), // CSS variable or hex
    }),
  ),
  height: z.number().int().default(300),
  legend: z.boolean().default(true),
  grid: z.boolean().default(true),
  emptyMessage: z.string().default("No data"),
});
```

**Dependency to add:** `recharts` to `devDependencies` + `peerDependencies` in `package.json`.

**Tokens used:** `--sn-chart-1` through `--sn-chart-5` (series colors default),
`--sn-color-card`, `--sn-color-border`, `--sn-color-muted-foreground`, `--sn-font-size-xs`,
`--sn-font-size-sm`, `--sn-radius-md`, `--sn-spacing-md`

### Wizard Component

Multi-step form flow. Manages step state internally, exposes current step data on context
by `id`.

**Config schema (`src/ui/components/forms/wizard/schema.ts`):**

```typescript
export const wizardSchema = z.object({
  id: z.string().optional(),
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      fields: z.array(formFieldSchema), // reuse AutoForm field schema
      submitLabel: z.string().optional(),
    }),
  ),
  submitEndpoint: z.string().optional(),
  submitLabel: z.string().default("Submit"),
  onComplete: actionSchema.optional(),
  allowSkip: z.boolean().default(false),
});
```

**Tokens used:** `--sn-color-primary`, `--sn-color-primary-foreground`, `--sn-color-muted`,
`--sn-color-muted-foreground`, `--sn-color-border`, `--sn-spacing-md`, `--sn-spacing-lg`,
`--sn-radius-md`, `--sn-font-size-sm`, `--sn-font-size-lg`

### Files to Create

```
src/ui/components/data/feed/
  schema.ts, component.tsx, types.ts, index.ts
  __tests__/component.test.tsx, schema.test.ts

src/ui/components/data/chart/
  schema.ts, component.tsx, types.ts, index.ts
  __tests__/component.test.tsx, schema.test.ts

src/ui/components/forms/wizard/
  schema.ts, component.tsx, types.ts, index.ts
  hook.ts                        ← useWizard() headless hook
  __tests__/component.test.tsx, schema.test.ts, hook.test.ts
```

### Files to Modify

- `src/ui/components/register.ts` — register Feed, Chart, Wizard
- `src/ui.ts` — export new schemas
- `playground/src/showcase.tsx` — add Feed, Chart, Wizard sections with fixture data
- `package.json` — add `recharts` peer dep

### Exit Criteria

- Feed renders a list of events from a fixture array. Shows empty state. Pageable.
- Chart renders bar/line/pie from fixture data. Switches type via config. Colors from
  `--sn-chart-*` tokens.
- Wizard renders multi-step form. Advances on Next. Submits on final step. Publishes
  accumulated data by `id`.
- All three appear in playground with all states demonstrated.
- All token changes visibly affect all three components in playground.
- `bun test src/ui/components/data/feed src/ui/components/data/chart src/ui/components/forms/wizard` passes.

---

## Phase 13-D: Headless Hooks Surface

**Goal:** Export headless hooks for the 5 most-complex components. Blocked until 13-B and
13-C ship (hooks must match what the components actually do).

### Hooks to Export

| Hook              | Extracts from                                  | File                    |
| ----------------- | ---------------------------------------------- | ----------------------- |
| `useDataTable`    | `data-table/hook.ts` (already exists)          | expose from `src/ui.ts` |
| `useAutoForm`     | extract from `auto-form/hook.ts`               | expose from `src/ui.ts` |
| `useWizard`       | `wizard/hook.ts` (Phase 13-C)                  | expose from `src/ui.ts` |
| `useModalManager` | `actions/modal-manager.ts` (already exists)    | already exported        |
| `useFeed`         | extract from `feed/component.tsx` (Phase 13-C) | expose from `src/ui.ts` |

### Files to Modify

- `src/ui/hooks/index.ts` — consolidate hooks
- `src/ui.ts` — export `useDataTable`, `useAutoForm`, `useWizard`, `useFeed`

### Exit Criteria

- All 5 hooks importable from `@lastshotlabs/snapshot/ui`
- Each has JSDoc with usage example
- Each has tests in `src/ui/hooks/__tests__/`

---

## Parallelization & Sequencing

### Track Overview

| Track | Phases                       | File ownership                                                                   |
| ----- | ---------------------------- | -------------------------------------------------------------------------------- |
| A     | 13-A (test fix)              | `vitest.config.ts`, all `__tests__/*.tsx`                                        |
| B     | 13-B (presets), 13-D (hooks) | `src/ui/presets/`, `src/ui/hooks/`, `src/ui.ts`                                  |
| C     | 13-C (Feed, Chart, Wizard)   | `src/ui/components/data/feed/`, `.../chart/`, `.../forms/wizard/`, `playground/` |

**Tracks A, B, C are independent.** A only touches test infrastructure. B creates new files
in `src/ui/presets/` and adds exports to `src/ui.ts`. C creates new component directories
and adds entries to `src/ui/components/register.ts`. No file is owned by more than one track.

**13-D (hooks) is blocked until 13-C ships** — `useWizard` and `useFeed` don't exist until
the components do. Run 13-D after 13-C merges.

### Branch Strategy

```
origin/main
├── feature/fix-test-suite        (Track A — 13-A)
├── feature/page-presets          (Track B — 13-B → 13-D after C merges)
└── feature/feed-chart-wizard     (Track C — 13-C)
```

Each track: implement → `bun run typecheck && bun run build && bun test` green → PR to main.
Do not merge until all checks pass.

### Agent Execution Checklist

For each track:

1. Read `CLAUDE.md` in full — especially component file conventions, token usage rules,
   playground rules, and the Definition of Done.
2. Read this spec top to bottom.
3. Read existing reference components: `src/ui/components/data/data-table/` (complex),
   `src/ui/components/forms/auto-form/` (forms), `src/ui/components/overlay/modal/`
   (overlay). Understand the patterns before writing new code.
4. Read `src/ui/tokens/schema.ts` and the canonical token list in `CLAUDE.md` before
   writing any CSS. Do not invent token names.
5. Implement phase by phase. Run `bun run typecheck` after each file. Fix errors before
   moving on.
6. Add playground entries _before_ running the final test suite — visual issues are easier
   to catch in the playground than in test output.
7. Before closing: independently verify JSDoc on every new exported symbol.
8. Before closing: verify every new `docs/` impact (none expected for 13-A; 13-B/C should
   update `docs/components.md`).

### Risk Mitigation

| Risk                                                | Mitigation                                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Chart dep (recharts) not compatible with React 19   | Check peer dep compatibility before adding; fallback to `victory` or `visx`                               |
| Preset config gets out of sync with manifest schema | Preset tests validate output against the manifest Zod schema — schema changes will catch this immediately |
| Test fix (13-A) causes regressions                  | Run full suite before and after; only add `@vitest-environment` annotations, do not touch test logic      |
| Feed/Chart paginate differently from DataTable      | `useComponentData` handles pagination — reuse the existing hook, don't build a new one                    |

---

## Definition of Done

### Per-Phase

```sh
bun run typecheck    # zero errors
bun run build        # clean build
bun test             # all tests pass (no new failures)
bun run format:check # clean
```

### Phase 13-A Specific

- `bun test` passes ≥ 900/942
- No `document is not defined` in output

### Phase 13-B Specific

- `crudPage`, `dashboardPage`, `settingsPage` exported from `@lastshotlabs/snapshot/ui`
- Each preset appears in playground with fixture data and token responsiveness
- Preset output validates against manifest page schema

### Phase 13-C Specific

- Feed, Chart, Wizard in `src/ui/components/register.ts`
- All three in playground with loading/error/empty/populated states
- `recharts` added as peer dep

### Full Completion

- [ ] JSDoc on every new exported symbol (presets, hooks, component schemas)
- [ ] `docs/components.md` updated with Feed, Chart, Wizard
- [ ] Playground showcases all new work with fixture data
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` all green
