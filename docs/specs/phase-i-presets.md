# Phase I: Page Presets — Composition Shortcuts — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | I.1 | CrudPage preset — full CRUD wiring | Not started | Presets |
> | I.2 | DashboardPage preset — charts + activity feed | Not started | Presets |
> | I.3 | SettingsPage preset — auto-save + explicit submit | Not started | Presets |
> | I.4 | AuthPage preset — formalize auth screens | Not started | Presets |
>
> **Priority:** P1 — unlocks rapid app scaffolding from minimal manifest config.
> **Depends on:** Phase A (CSS Foundation).
> **Blocks:** Nothing directly — presets are additive.

---

## Vision

### Before (Today)

Page presets exist as factory functions (`crudPage`, `dashboardPage`, `settingsPage`) in
`src/ui/presets/`. They accept high-level options and return `PageConfig` objects. They work
well as TypeScript helpers used in `defineManifest()`, but:

1. **No JSON manifest support.** Presets cannot be activated from pure JSON. A consumer must
   write TypeScript to call `crudPage(...)`. This violates the manifest-first requirement.
2. **CrudPage is complete but lacks filter-bar integration.** Filters are accepted in the
   type definition but not wired into the generated page.
3. **DashboardPage has no chart support.** Only stat cards and an activity list.
4. **SettingsPage has no auto-save mode.** Only explicit submit.
5. **No AuthPage preset.** Auth screens are generated via `buildDefaultAuthFragment()` in
   the compiler, but there is no preset factory for custom auth branding.
6. **Presets are not expandable in `compileManifest()`.** The compiler does not recognize
   a `preset` key in route config and expand it.

### After (This Spec)

1. Presets work from JSON: `{ "preset": "crud", "resource": "users", ... }` in a route's
   page config. `compileManifest()` expands presets at compile time.
2. CrudPage wires filter-bar, empty state, and pagination correctly.
3. DashboardPage accepts charts with `variant` + `endpoint` config.
4. SettingsPage supports `autoSave: true` mode.
5. AuthPage preset formalizes auth screens with custom branding.
6. All presets validate via Zod schemas — invalid preset config is a compile error.

---

## What Already Exists on Main

### Preset Factories (COMPLETE — TypeScript API)

| File | Lines | What It Does |
|---|---|---|
| `src/ui/presets/index.ts` | 37 | Re-exports `crudPage`, `dashboardPage`, `settingsPage` + all types. |
| `src/ui/presets/types.ts` | 247 | Full type definitions: `CrudPageOptions`, `DashboardPageOptions`, `SettingsPageOptions`, plus `ColumnDef`, `FormDef`, `FormFieldDef`, `FilterDef`, `StatDef`, `SettingsSectionDef`. |
| `src/ui/presets/crud-page.ts` | 271 | Factory: heading + create button + data-table + modal + drawer + delete action. Maps columns, form fields, row actions. Uses `slugify()` for IDs. |
| `src/ui/presets/dashboard-page.ts` | 130 | Factory: heading + stat-card row + optional activity list. Maps `StatDef` to stat-card config with trend/format/icon. |
| `src/ui/presets/settings-page.ts` | 151 | Factory: heading + tabs with one form per section. Maps `SettingsSectionDef` to tab + AutoForm. |

### Preset Tests (COMPLETE)

| File | Lines | What It Does |
|---|---|---|
| `src/ui/presets/__tests__/crud-page.test.ts` | 198 | Validates output against `pageConfigSchema`. Tests minimal/full options, column mapping, modal/drawer generation, slug prefixes, toggle-to-checkbox mapping. |
| `src/ui/presets/__tests__/dashboard-page.test.ts` | 194 | Validates stat cards, trend mapping, activity list, icon propagation, span=3 grid. |
| `src/ui/presets/__tests__/settings-page.test.ts` | 272 | Validates tabs, form fields, submit endpoints, data endpoints, method defaults, icons. |

### Compiler (NO preset expansion)

| File | Lines | What It Does |
|---|---|---|
| `src/ui/manifest/compiler.ts` | ~600 | `compileManifest()` parses, resolves env refs, resolves flavors, builds routes. Does NOT check for `preset` key. |

### Auth Fragment (PARTIAL)

| File | What |
|---|---|
| `src/ui/manifest/defaults/auth.ts` | `buildDefaultAuthFragment()` — generates auth routes from `manifest.auth` config. Not a preset factory. |
| `src/ui/manifest/schema.ts:1067-1139` | `authScreenConfigSchema` — has `branding.logo`, `branding.title`, `branding.description`. |

### UI Entry Point (EXPORTS presets)

| File | Lines |
|---|---|
| `src/ui.ts:630-643` | Exports `crudPage`, `dashboardPage`, `settingsPage` + all types from presets. |

---

## Developer Context

### Build & Test Commands

```sh
cd /c/Users/email/projects/snapshot
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier
bun run build            # tsup + oclif manifest
bun test                 # vitest
```

### Key Files

| Path | What | Lines |
|---|---|---|
| `src/ui/presets/types.ts` | Preset option types | 247 |
| `src/ui/presets/crud-page.ts` | CrudPage factory | 271 |
| `src/ui/presets/dashboard-page.ts` | DashboardPage factory | 130 |
| `src/ui/presets/settings-page.ts` | SettingsPage factory | 151 |
| `src/ui/presets/index.ts` | Re-exports | 37 |
| `src/ui/manifest/compiler.ts` | `compileManifest()` | ~600 |
| `src/ui/manifest/schema.ts` | Manifest Zod schemas | ~1400 |
| `src/ui.ts` | UI entry point | 688 |

### Consumer Shape

**Before (TypeScript only):**
```ts
import { crudPage, defineManifest } from "@lastshotlabs/snapshot/ui";

export default defineManifest({
  routes: [
    {
      path: "/users",
      ...crudPage({
        title: "Users",
        listEndpoint: "GET /api/users",
        columns: [{ key: "name", label: "Name" }],
      }),
    },
  ],
});
```

**After (JSON manifest):**
```json
{
  "routes": [
    {
      "path": "/users",
      "preset": "crud",
      "presetConfig": {
        "title": "Users",
        "listEndpoint": "GET /api/users",
        "createEndpoint": "POST /api/users",
        "deleteEndpoint": "DELETE /api/users/{id}",
        "columns": [
          { "key": "name", "label": "Name" },
          { "key": "email", "label": "Email" },
          { "key": "role", "label": "Role", "badge": true }
        ],
        "createForm": {
          "fields": [
            { "key": "name", "type": "text", "label": "Name", "required": true },
            { "key": "email", "type": "email", "label": "Email", "required": true }
          ]
        }
      }
    }
  ]
}
```

---

## Non-Negotiable Engineering Constraints

1. **Manifest-only architecture** (engineering-rules.md) — presets must work from JSON with
   no TypeScript.
2. **No `any`, no unnecessary casts** — all preset configs validated by Zod schemas.
3. **Config schema is the only interface** — preset expansion produces valid `PageConfig`.
4. **SSR safe** — preset factories are pure functions, no browser APIs.
5. **Semantic tokens only** — all generated component configs use `var(--sn-*)` tokens.
6. **Fixed action vocabulary** — preset-generated actions use `navigate`, `api`,
   `open-modal`, `close-modal`, `refresh`, `confirm`, `toast` only.
7. **Tests mandatory** — schema tests, factory output tests, compiler integration tests.

---

## Phase I.1: CrudPage Preset — Full CRUD Wiring

### Goal

Enhance `crudPage()` to wire filter-bar integration, empty-state component, and pagination
config. Add Zod schema for JSON manifest preset expansion. Wire preset expansion into
`compileManifest()`.

### The API

**JSON manifest usage:**
```json
{
  "routes": [
    {
      "path": "/transactions",
      "preset": "crud",
      "presetConfig": {
        "title": "Transactions",
        "listEndpoint": "GET /api/transactions",
        "createEndpoint": "POST /api/transactions",
        "updateEndpoint": "PUT /api/transactions/{id}",
        "deleteEndpoint": "DELETE /api/transactions/{id}",
        "columns": [
          { "key": "description", "label": "Description" },
          { "key": "amount", "label": "Amount", "format": "currency" },
          { "key": "category", "label": "Category", "badge": true },
          { "key": "date", "label": "Date", "format": "date" }
        ],
        "createForm": {
          "fields": [
            { "key": "description", "type": "text", "label": "Description", "required": true },
            { "key": "amount", "type": "number", "label": "Amount", "required": true },
            { "key": "category", "type": "select", "label": "Category", "options": [
              { "label": "Food", "value": "food" },
              { "label": "Transport", "value": "transport" }
            ]}
          ]
        },
        "updateForm": {
          "fields": [
            { "key": "description", "type": "text", "label": "Description", "required": true },
            { "key": "amount", "type": "number", "label": "Amount", "required": true }
          ]
        },
        "filters": [
          { "key": "category", "label": "Category", "type": "select", "options": [
            { "label": "Food", "value": "food" },
            { "label": "Transport", "value": "transport" }
          ]},
          { "key": "search", "label": "Search", "type": "text" }
        ],
        "pagination": { "pageSize": 25 },
        "emptyState": {
          "title": "No transactions yet",
          "description": "Add your first transaction to get started.",
          "icon": "receipt"
        }
      }
    }
  ]
}
```

**TypeScript usage (enhanced):**
```ts
const page = crudPage({
  title: "Transactions",
  listEndpoint: "GET /api/transactions",
  columns: [...],
  filters: [...],
  pagination: { pageSize: 25 },
  emptyState: {
    title: "No transactions yet",
    description: "Add your first transaction to get started.",
    icon: "receipt",
  },
});
```

### Types

Add to `src/ui/presets/types.ts`:

```ts
/**
 * Pagination configuration for the CRUD page table.
 */
export interface PaginationDef {
  /** Number of items per page. Defaults to 20. */
  pageSize?: number;
  /** Pagination style. Defaults to "offset". */
  type?: "offset" | "cursor";
}

/**
 * Empty state configuration for the CRUD page.
 */
export interface EmptyStateDef {
  /** Title text shown in empty state. */
  title: string;
  /** Description text shown below title. */
  description?: string;
  /** Icon name (Lucide) shown in empty state. */
  icon?: string;
}
```

Update `CrudPageOptions`:
```ts
export interface CrudPageOptions {
  // ... existing fields ...
  /** Pagination config for the data table. */
  pagination?: PaginationDef;
  /** Custom empty state when no data exists. */
  emptyState?: EmptyStateDef;
}
```

Add preset schema to `src/ui/presets/schemas.ts` (new file):

```ts
import { z } from "zod";

/** Zod schema for the CRUD preset config used in JSON manifests. */
export const crudPresetConfigSchema = z.object({
  title: z.string().min(1),
  listEndpoint: z.string().min(1),
  createEndpoint: z.string().optional(),
  updateEndpoint: z.string().optional(),
  deleteEndpoint: z.string().optional(),
  columns: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    badge: z.boolean().optional(),
    format: z.enum(["date", "currency", "number", "boolean"]).optional(),
  })).min(1),
  createForm: z.object({
    fields: z.array(z.object({
      key: z.string().min(1),
      type: z.enum(["text", "email", "password", "number", "select", "textarea", "toggle"]),
      label: z.string().min(1),
      required: z.boolean().optional(),
      options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      placeholder: z.string().optional(),
    })),
  }).optional(),
  updateForm: z.object({
    fields: z.array(z.object({
      key: z.string().min(1),
      type: z.enum(["text", "email", "password", "number", "select", "textarea", "toggle"]),
      label: z.string().min(1),
      required: z.boolean().optional(),
      options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      placeholder: z.string().optional(),
    })),
  }).optional(),
  filters: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(["select", "text"]),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  })).optional(),
  pagination: z.object({
    pageSize: z.number().int().positive().optional(),
    type: z.enum(["offset", "cursor"]).optional(),
  }).optional(),
  emptyState: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
  }).optional(),
  id: z.string().optional(),
}).strict();

export type CrudPresetConfig = z.infer<typeof crudPresetConfigSchema>;
```

### Implementation

**1. Update `src/ui/presets/crud-page.ts`:**

Add filter-bar generation when `filters` is present. Insert filter-bar component between
header row and data-table:

```ts
// After header row, before data-table
if (options.filters && options.filters.length > 0) {
  content.push({
    type: "filter-bar",
    id: `${slug}-filters`,
    target: tableId,
    filters: options.filters.map((f) => ({
      field: f.key,
      label: f.label,
      type: f.type,
      ...(f.options ? { options: f.options } : {}),
    })),
  });
}
```

Update pagination config to use `options.pagination`:
```ts
const tableConfig: Record<string, unknown> = {
  type: "data-table",
  id: tableId,
  data: options.listEndpoint,
  columns,
  pagination: {
    type: options.pagination?.type ?? "offset",
    pageSize: options.pagination?.pageSize ?? 20,
  },
  searchable: true,
  emptyMessage: options.emptyState?.title ?? `No ${options.title.toLowerCase()} yet`,
};
```

**2. Create `src/ui/presets/schemas.ts`** with Zod schemas for each preset.

**3. Create `src/ui/presets/expand.ts`:**

```ts
import { crudPage } from "./crud-page";
import { dashboardPage } from "./dashboard-page";
import { settingsPage } from "./settings-page";
import {
  crudPresetConfigSchema,
  dashboardPresetConfigSchema,
  settingsPresetConfigSchema,
  authPresetConfigSchema,
} from "./schemas";
import type { PageConfig } from "../manifest/types";

export type PresetName = "crud" | "dashboard" | "settings" | "auth";

const PRESET_REGISTRY: Record<PresetName, {
  schema: z.ZodType;
  factory: (config: unknown) => PageConfig;
}> = {
  crud: { schema: crudPresetConfigSchema, factory: crudPage as (c: unknown) => PageConfig },
  dashboard: { schema: dashboardPresetConfigSchema, factory: dashboardPage as (c: unknown) => PageConfig },
  settings: { schema: settingsPresetConfigSchema, factory: settingsPage as (c: unknown) => PageConfig },
  auth: { schema: authPresetConfigSchema, factory: authPage as (c: unknown) => PageConfig },
};

/**
 * Expand a preset config into a full PageConfig.
 * Validates the presetConfig against the preset's Zod schema.
 * Throws a ZodError if validation fails.
 */
export function expandPreset(preset: string, presetConfig: unknown): PageConfig {
  const entry = PRESET_REGISTRY[preset as PresetName];
  if (!entry) {
    throw new Error(`Unknown preset "${preset}". Valid presets: ${Object.keys(PRESET_REGISTRY).join(", ")}`);
  }
  const validated = entry.schema.parse(presetConfig);
  return entry.factory(validated);
}
```

**4. Wire into `src/ui/manifest/compiler.ts`:**

In `compileManifest()`, before building routes, check each route for `preset` + `presetConfig`
and expand:

```ts
import { expandPreset } from "../presets/expand";

// Inside compileManifest, in the route processing loop:
for (const route of manifest.routes) {
  if (route.preset && route.presetConfig) {
    const expanded = expandPreset(route.preset, route.presetConfig);
    route.title = expanded.title;
    route.content = expanded.content;
    // Clear preset keys so downstream doesn't see them
    delete route.preset;
    delete route.presetConfig;
  }
}
```

**5. Update `src/ui/manifest/schema.ts`:**

Add `preset` and `presetConfig` fields to `routeConfigSchema`:

```ts
export const routeConfigSchema = z.object({
  // ... existing fields ...
  preset: z.string().optional(),
  presetConfig: z.record(z.unknown()).optional(),
}).refine(
  (data) => {
    // Must have either content or preset, not both
    if (data.preset && data.content) return false;
    if (!data.preset && !data.content) return false;
    return true;
  },
  { message: "Route must have either 'content' or 'preset', not both" },
);
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/presets/schemas.ts` |
| Create | `src/ui/presets/expand.ts` |
| Modify | `src/ui/presets/types.ts` — add `PaginationDef`, `EmptyStateDef`, update `CrudPageOptions` |
| Modify | `src/ui/presets/crud-page.ts` — add filter-bar, pagination config, empty state |
| Modify | `src/ui/presets/index.ts` — re-export new types and schemas |
| Modify | `src/ui/manifest/schema.ts` — add `preset`/`presetConfig` to route schema |
| Modify | `src/ui/manifest/compiler.ts` — call `expandPreset()` during compilation |
| Modify | `src/ui.ts` — export new schemas and `expandPreset` |

### Documentation Impact

- Update `docs/components.md` — add Presets section with JSON manifest examples.
- JSDoc on `expandPreset`, `crudPresetConfigSchema`, new types.

### Tests

| File | What |
|---|---|
| `src/ui/presets/__tests__/crud-page.test.ts` | Add tests: filter-bar generation, pagination config override, custom empty state. |
| `src/ui/presets/__tests__/schemas.test.ts` (create) | Schema validation: valid/invalid crud configs, required fields, strict mode. |
| `src/ui/presets/__tests__/expand.test.ts` (create) | `expandPreset()` with each preset name, unknown preset error, schema validation error. |
| `src/ui/manifest/__tests__/compiler.test.ts` | Add test: manifest with `preset: "crud"` compiles to valid routes. |

### Exit Criteria

- [ ] `crudPage({ ..., filters: [...] })` produces a page with a `filter-bar` component
      targeting the table.
- [ ] `crudPage({ ..., pagination: { pageSize: 50 } })` produces a table with pageSize 50.
- [ ] `expandPreset("crud", validConfig)` returns the same output as `crudPage(validConfig)`.
- [ ] `expandPreset("unknown", {})` throws with descriptive error.
- [ ] Manifest with `{ "preset": "crud", "presetConfig": { ... } }` compiles via
      `compileManifest()` and produces valid routes.
- [ ] `crudPresetConfigSchema.parse(invalidConfig)` throws `ZodError`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase I.2: DashboardPage Preset — Charts + Activity Feed

### Goal

Enhance `dashboardPage()` to accept chart definitions and a configurable activity feed with
limit. Add `charts` support using the existing `Chart` component.

### Types

Add to `src/ui/presets/types.ts`:

```ts
/**
 * A chart definition for the dashboard page.
 */
export interface ChartDef {
  /** Chart variant. */
  variant: "line" | "bar" | "area" | "pie" | "donut";
  /** API endpoint to fetch chart data from. */
  endpoint: string;
  /** Chart title. */
  title?: string;
  /** Series configuration. */
  series?: Array<{
    /** Data field name. */
    field: string;
    /** Display label. */
    label?: string;
    /** Series color (chart-1 through chart-5). */
    color?: string;
  }>;
  /** Grid span (1-12). Defaults to 6 (half width). */
  span?: number;
}

/**
 * Activity feed configuration for the dashboard page.
 */
export interface ActivityFeedDef {
  /** API endpoint to fetch activity from. */
  endpoint: string;
  /** Maximum number of items to display. Defaults to 10. */
  limit?: number;
  /** Title text above the feed. Defaults to "Recent Activity". */
  title?: string;
}
```

Update `DashboardPageOptions`:
```ts
export interface DashboardPageOptions {
  title: string;
  stats: StatDef[];
  /** Chart definitions — rendered in a grid row below stats. */
  charts?: ChartDef[];
  /** Activity feed configuration. Replaces the simple recentActivity string. */
  activityFeed?: ActivityFeedDef;
  /** @deprecated Use activityFeed instead. */
  recentActivity?: string;
  id?: string;
}
```

### Implementation

Update `src/ui/presets/dashboard-page.ts`:

```ts
// After stat cards row, before activity feed
if (options.charts && options.charts.length > 0) {
  const chartChildren = options.charts.map((chart, index) => ({
    type: "chart",
    id: `${slug}-chart-${index}`,
    variant: chart.variant,
    data: chart.endpoint,
    title: chart.title,
    series: chart.series?.map((s) => ({
      field: s.field,
      label: s.label,
      color: s.color,
    })),
    span: chart.span ?? 6,
  }));

  content.push({
    type: "row",
    gap: "md",
    children: chartChildren,
  });
}

// Activity feed — support both new and deprecated API
const activityConfig = options.activityFeed ?? (options.recentActivity ? {
  endpoint: options.recentActivity,
} : undefined);

if (activityConfig) {
  content.push({
    type: "heading",
    text: activityConfig.title ?? "Recent Activity",
    level: 2,
  });

  content.push({
    type: "list",
    id: `${slug}-activity`,
    data: activityConfig.endpoint,
    limit: activityConfig.limit ?? 10,
    emptyMessage: "No recent activity",
  });
}
```

Add `dashboardPresetConfigSchema` to `src/ui/presets/schemas.ts`:

```ts
export const dashboardPresetConfigSchema = z.object({
  title: z.string().min(1),
  stats: z.array(z.object({
    label: z.string().min(1),
    endpoint: z.string().min(1),
    valueKey: z.string().min(1),
    format: z.enum(["number", "currency", "percent"]).optional(),
    trend: z.object({
      key: z.string().min(1),
      positive: z.enum(["up", "down"]).optional(),
    }).optional(),
    icon: z.string().optional(),
  })).min(1),
  charts: z.array(z.object({
    variant: z.enum(["line", "bar", "area", "pie", "donut"]),
    endpoint: z.string().min(1),
    title: z.string().optional(),
    series: z.array(z.object({
      field: z.string().min(1),
      label: z.string().optional(),
      color: z.string().optional(),
    })).optional(),
    span: z.number().int().min(1).max(12).optional(),
  })).optional(),
  activityFeed: z.object({
    endpoint: z.string().min(1),
    limit: z.number().int().positive().optional(),
    title: z.string().optional(),
  }).optional(),
  id: z.string().optional(),
}).strict();
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/presets/types.ts` — add `ChartDef`, `ActivityFeedDef`, update `DashboardPageOptions` |
| Modify | `src/ui/presets/dashboard-page.ts` — add chart row, update activity feed |
| Modify | `src/ui/presets/schemas.ts` — add `dashboardPresetConfigSchema` |
| Modify | `src/ui/presets/index.ts` — export new types |
| Modify | `src/ui.ts` — export new types |

### Tests

| File | What |
|---|---|
| `src/ui/presets/__tests__/dashboard-page.test.ts` | Add tests: charts row generation, chart span defaults, activity feed with limit, deprecated recentActivity compat. |
| `src/ui/presets/__tests__/schemas.test.ts` | Add dashboard schema validation tests. |

### Exit Criteria

- [ ] `dashboardPage({ ..., charts: [{ variant: "line", endpoint: "..." }] })` produces a
      row with chart components.
- [ ] Chart components default to span 6 (two per row in 12-col grid).
- [ ] `activityFeed: { endpoint: "...", limit: 5 }` produces a list with `limit: 5`.
- [ ] Deprecated `recentActivity` string still works (backwards compatible).
- [ ] `dashboardPresetConfigSchema` validates correctly.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase I.3: SettingsPage Preset — Auto-Save & Explicit Submit

### Goal

Enhance `settingsPage()` to support auto-save mode where form changes are debounced and
submitted automatically. Add `settingsPresetConfigSchema` for JSON manifest support.

### Types

Update `SettingsSectionDef` in `src/ui/presets/types.ts`:

```ts
export interface SettingsSectionDef {
  label: string;
  submitEndpoint: string;
  method?: "POST" | "PUT" | "PATCH";
  dataEndpoint?: string;
  fields: FormFieldDef[];
  submitLabel?: string;
  icon?: string;
  /**
   * When true, form changes are auto-saved with debounce.
   * The submit button is hidden and a save indicator is shown instead.
   * @default false
   */
  autoSave?: boolean;
  /**
   * Debounce delay in milliseconds for auto-save. Only used when autoSave is true.
   * @default 1000
   */
  autoSaveDelay?: number;
}
```

### Implementation

Update `src/ui/presets/settings-page.ts`:

```ts
function mapSection(section: SettingsSectionDef): Record<string, unknown> {
  const formFields = section.fields.map(mapFormField);

  const formConfig: Record<string, unknown> = {
    type: "form",
    submit: section.submitEndpoint,
    method: section.method ?? "PATCH",
    fields: formFields,
  };

  if (section.autoSave) {
    formConfig.autoSave = true;
    formConfig.autoSaveDelay = section.autoSaveDelay ?? 1000;
    // No submit button in auto-save mode
  } else {
    formConfig.submitLabel = section.submitLabel ?? "Save Changes";
  }

  formConfig.onSuccess = {
    type: "toast",
    message: `${section.label} settings saved`,
    variant: "success",
  };

  if (section.dataEndpoint) {
    formConfig.data = section.dataEndpoint;
  }

  const tab: Record<string, unknown> = {
    label: section.label,
    content: section.autoSave
      ? [formConfig, { type: "save-indicator", id: `${slugify(section.label)}-save-status` }]
      : [formConfig],
  };

  if (section.icon) {
    tab.icon = section.icon;
  }

  return tab;
}
```

Add `settingsPresetConfigSchema` to `src/ui/presets/schemas.ts`:

```ts
export const settingsPresetConfigSchema = z.object({
  title: z.string().min(1),
  sections: z.array(z.object({
    label: z.string().min(1),
    submitEndpoint: z.string().min(1),
    method: z.enum(["POST", "PUT", "PATCH"]).optional(),
    dataEndpoint: z.string().optional(),
    fields: z.array(z.object({
      key: z.string().min(1),
      type: z.enum(["text", "email", "password", "number", "select", "textarea", "toggle"]),
      label: z.string().min(1),
      required: z.boolean().optional(),
      options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      placeholder: z.string().optional(),
    })),
    submitLabel: z.string().optional(),
    icon: z.string().optional(),
    autoSave: z.boolean().optional(),
    autoSaveDelay: z.number().int().positive().optional(),
  })).min(1),
  id: z.string().optional(),
}).strict();
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/presets/types.ts` — add `autoSave`, `autoSaveDelay` to `SettingsSectionDef` |
| Modify | `src/ui/presets/settings-page.ts` — auto-save mode in `mapSection()` |
| Modify | `src/ui/presets/schemas.ts` — add `settingsPresetConfigSchema` |

### Tests

| File | What |
|---|---|
| `src/ui/presets/__tests__/settings-page.test.ts` | Add tests: auto-save section has no submitLabel, auto-save section has save-indicator, autoSaveDelay defaults to 1000. |
| `src/ui/presets/__tests__/schemas.test.ts` | Add settings schema validation tests. |

### Exit Criteria

- [ ] `settingsPage({ sections: [{ ..., autoSave: true }] })` produces a form with
      `autoSave: true` and no submit button.
- [ ] Auto-save sections include a `save-indicator` component.
- [ ] `autoSaveDelay` defaults to 1000 when not specified.
- [ ] Non-auto-save sections behave identically to current behavior.
- [ ] `settingsPresetConfigSchema` validates correctly.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase I.4: AuthPage Preset — Formalize Auth Screens

### Goal

Create an `authPage()` preset factory that generates branded auth screens (login, register,
forgot-password, etc.) from a simple config. This replaces the current
`buildDefaultAuthFragment()` approach with a composable preset.

### Types

Add to `src/ui/presets/types.ts`:

```ts
/**
 * Branding configuration for auth pages.
 */
export interface AuthBrandingDef {
  /** Logo URL or path. */
  logo?: string;
  /** Application name shown on auth screens. */
  appName?: string;
  /** Tagline shown below the logo. */
  tagline?: string;
  /** Background configuration for the auth page. */
  background?: {
    /** Background image URL. */
    image?: string;
    /** Background color (token reference or CSS value). */
    color?: string;
    /** Background position. */
    position?: string;
  };
}

/**
 * Options for the `authPage` preset factory.
 */
export interface AuthPageOptions {
  /** Which auth screen to generate. */
  screen: "login" | "register" | "forgot-password" | "reset-password" | "verify-email";
  /** Branding configuration. */
  branding?: AuthBrandingDef;
  /** OAuth providers to show buttons for. */
  oauthProviders?: string[];
  /** Whether to show passkey login button. */
  passkey?: boolean;
  /** Custom redirect paths. */
  redirects?: {
    afterLogin?: string;
    afterRegister?: string;
    forgotPassword?: string;
    login?: string;
    register?: string;
  };
  /** ID prefix for context refs. */
  id?: string;
}
```

### Implementation

Create `src/ui/presets/auth-page.ts`:

```ts
import type { PageConfig } from "../manifest/types";
import type { AuthPageOptions } from "./types";

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Builds a manifest PageConfig for an auth screen.
 *
 * @param options - Auth page options
 * @returns A valid manifest PageConfig
 */
export function authPage(options: AuthPageOptions): PageConfig {
  const slug = options.id ?? `auth-${options.screen}`;
  const content: Record<string, unknown>[] = [];

  // Wrapper container for centering
  const authContainer: Record<string, unknown> = {
    type: "container",
    id: slug,
    maxWidth: "sm",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "var(--sn-spacing-lg, 1.5rem)",
    },
    children: [] as Record<string, unknown>[],
  };

  const children = authContainer.children as Record<string, unknown>[];

  // Branding section
  if (options.branding?.logo) {
    children.push({
      type: "image",
      src: options.branding.logo,
      alt: options.branding.appName ?? "Logo",
      width: 120,
      style: { marginBottom: "var(--sn-spacing-lg, 1.5rem)" },
    });
  }

  if (options.branding?.appName) {
    children.push({
      type: "heading",
      text: options.branding.appName,
      level: 1,
      align: "center",
    });
  }

  if (options.branding?.tagline) {
    children.push({
      type: "text",
      text: options.branding.tagline,
      align: "center",
      style: {
        color: "var(--sn-color-muted-foreground, #6b7280)",
        marginBottom: "var(--sn-spacing-lg, 1.5rem)",
      },
    });
  }

  // Screen-specific form
  switch (options.screen) {
    case "login":
      children.push(buildLoginForm(slug, options));
      break;
    case "register":
      children.push(buildRegisterForm(slug, options));
      break;
    case "forgot-password":
      children.push(buildForgotPasswordForm(slug, options));
      break;
    case "reset-password":
      children.push(buildResetPasswordForm(slug, options));
      break;
    case "verify-email":
      children.push(buildVerifyEmailForm(slug, options));
      break;
  }

  content.push(authContainer);

  const titleMap: Record<string, string> = {
    login: "Sign In",
    register: "Create Account",
    "forgot-password": "Forgot Password",
    "reset-password": "Reset Password",
    "verify-email": "Verify Email",
  };

  return {
    title: titleMap[options.screen] ?? "Authentication",
    content: content as PageConfig["content"],
  };
}

function buildLoginForm(slug: string, options: AuthPageOptions): Record<string, unknown> {
  const fields: Record<string, unknown>[] = [
    { name: "email", type: "email", label: "Email", required: true, placeholder: "you@example.com" },
    { name: "password", type: "password", label: "Password", required: true, placeholder: "••••••••" },
  ];

  const form: Record<string, unknown> = {
    type: "form",
    id: `${slug}-form`,
    submit: "auth:login",
    method: "POST",
    fields,
    submitLabel: "Sign In",
    onSuccess: {
      type: "navigate",
      path: options.redirects?.afterLogin ?? "/",
    },
  };

  return {
    type: "card",
    id: `${slug}-card`,
    children: [
      { type: "heading", text: "Sign In", level: 2, align: "center" },
      form,
      ...(options.oauthProviders?.length ? [{
        type: "oauth-buttons",
        providers: options.oauthProviders,
      }] : []),
      ...(options.passkey ? [{
        type: "passkey-button",
        mode: "login",
      }] : []),
      {
        type: "row",
        justify: "between",
        children: [
          { type: "link", text: "Create account", href: options.redirects?.register ?? "/auth/register" },
          { type: "link", text: "Forgot password?", href: options.redirects?.forgotPassword ?? "/auth/forgot-password" },
        ],
      },
    ],
  };
}

function buildRegisterForm(slug: string, options: AuthPageOptions): Record<string, unknown> {
  return {
    type: "card",
    id: `${slug}-card`,
    children: [
      { type: "heading", text: "Create Account", level: 2, align: "center" },
      {
        type: "form",
        id: `${slug}-form`,
        submit: "auth:register",
        method: "POST",
        fields: [
          { name: "email", type: "email", label: "Email", required: true },
          { name: "password", type: "password", label: "Password", required: true },
          { name: "confirmPassword", type: "password", label: "Confirm Password", required: true },
        ],
        submitLabel: "Create Account",
        onSuccess: { type: "navigate", path: options.redirects?.afterRegister ?? "/auth/verify-email" },
      },
      ...(options.oauthProviders?.length ? [{
        type: "oauth-buttons",
        providers: options.oauthProviders,
      }] : []),
      {
        type: "row",
        justify: "center",
        children: [
          { type: "link", text: "Already have an account? Sign in", href: options.redirects?.login ?? "/auth/login" },
        ],
      },
    ],
  };
}

function buildForgotPasswordForm(slug: string, options: AuthPageOptions): Record<string, unknown> {
  return {
    type: "card",
    id: `${slug}-card`,
    children: [
      { type: "heading", text: "Forgot Password", level: 2, align: "center" },
      { type: "text", text: "Enter your email address and we'll send you a reset link.", align: "center" },
      {
        type: "form",
        id: `${slug}-form`,
        submit: "auth:forgotPassword",
        method: "POST",
        fields: [
          { name: "email", type: "email", label: "Email", required: true },
        ],
        submitLabel: "Send Reset Link",
        onSuccess: { type: "toast", message: "Reset link sent. Check your email.", variant: "success" },
      },
      {
        type: "row",
        justify: "center",
        children: [
          { type: "link", text: "Back to sign in", href: options.redirects?.login ?? "/auth/login" },
        ],
      },
    ],
  };
}

function buildResetPasswordForm(slug: string, _options: AuthPageOptions): Record<string, unknown> {
  return {
    type: "card",
    id: `${slug}-card`,
    children: [
      { type: "heading", text: "Reset Password", level: 2, align: "center" },
      {
        type: "form",
        id: `${slug}-form`,
        submit: "auth:resetPassword",
        method: "POST",
        fields: [
          { name: "password", type: "password", label: "New Password", required: true },
          { name: "confirmPassword", type: "password", label: "Confirm Password", required: true },
        ],
        submitLabel: "Reset Password",
        onSuccess: { type: "navigate", path: "/auth/login" },
      },
    ],
  };
}

function buildVerifyEmailForm(slug: string, _options: AuthPageOptions): Record<string, unknown> {
  return {
    type: "card",
    id: `${slug}-card`,
    children: [
      { type: "heading", text: "Verify Your Email", level: 2, align: "center" },
      { type: "text", text: "We've sent a verification email. Click the link in the email to verify your account.", align: "center" },
      {
        type: "button",
        label: "Resend Verification Email",
        variant: "outline",
        action: {
          type: "api",
          method: "POST",
          endpoint: "auth:resendVerification",
          onSuccess: { type: "toast", message: "Verification email sent.", variant: "success" },
        },
      },
    ],
  };
}
```

Add `authPresetConfigSchema` to `src/ui/presets/schemas.ts`:

```ts
export const authPresetConfigSchema = z.object({
  screen: z.enum(["login", "register", "forgot-password", "reset-password", "verify-email"]),
  branding: z.object({
    logo: z.string().optional(),
    appName: z.string().optional(),
    tagline: z.string().optional(),
    background: z.object({
      image: z.string().optional(),
      color: z.string().optional(),
      position: z.string().optional(),
    }).optional(),
  }).optional(),
  oauthProviders: z.array(z.string()).optional(),
  passkey: z.boolean().optional(),
  redirects: z.object({
    afterLogin: z.string().optional(),
    afterRegister: z.string().optional(),
    forgotPassword: z.string().optional(),
    login: z.string().optional(),
    register: z.string().optional(),
  }).optional(),
  id: z.string().optional(),
}).strict();
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/presets/auth-page.ts` |
| Modify | `src/ui/presets/types.ts` — add `AuthBrandingDef`, `AuthPageOptions` |
| Modify | `src/ui/presets/schemas.ts` — add `authPresetConfigSchema` |
| Modify | `src/ui/presets/expand.ts` — register auth preset |
| Modify | `src/ui/presets/index.ts` — export `authPage` + types |
| Modify | `src/ui.ts` — export `authPage`, `AuthPageOptions`, `AuthBrandingDef` |

### Tests

| File | What |
|---|---|
| `src/ui/presets/__tests__/auth-page.test.ts` (create) | Tests: each screen variant generates valid PageConfig, branding props propagate, OAuth buttons included when configured, passkey button included, redirect paths. |
| `src/ui/presets/__tests__/schemas.test.ts` | Add auth schema validation tests. |

### Exit Criteria

- [ ] `authPage({ screen: "login" })` produces a valid PageConfig with login form.
- [ ] `authPage({ screen: "login", branding: { logo: "/logo.png", appName: "MyApp" } })`
      includes image + heading with branding.
- [ ] `authPage({ screen: "login", oauthProviders: ["google"] })` includes oauth-buttons.
- [ ] `authPage({ screen: "login", passkey: true })` includes passkey-button.
- [ ] All 5 screen variants produce valid PageConfig.
- [ ] JSON manifest with `{ "preset": "auth", "presetConfig": { "screen": "login" } }`
      compiles successfully.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Single track — **Presets**. All phases modify the same file set.

### Internal Sequencing

| Phase | Depends On | Why |
|---|---|---|
| I.1 | Nothing | Creates the preset expansion infrastructure (schemas.ts, expand.ts, compiler wiring) |
| I.2 | I.1 | Uses schemas.ts and expand.ts infrastructure |
| I.3 | I.1 | Uses schemas.ts and expand.ts infrastructure |
| I.4 | I.1 | Uses schemas.ts and expand.ts infrastructure |

I.2, I.3, and I.4 could run in parallel after I.1, but since they modify the same files
(`schemas.ts`, `expand.ts`, `index.ts`, `types.ts`), sequential execution is safer.

### Branch Strategy

```
branch: phase-i-presets
base: main
```

Push branch after each phase. Do not merge until all 4 sub-phases pass.

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Read all files in `src/ui/presets/` before modifying.
4. Implement I.1 first — this creates the infrastructure.
5. Run `bun run typecheck && bun test` after I.1.
6. Implement I.2, I.3, I.4 sequentially.
7. Run `bun run typecheck && bun test && bun run format:check` after each.
8. Run `bun run build` at the end.
9. Verify JSDoc on all new exports.
10. Commit each sub-phase separately.

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All preset tests + compiler integration tests pass
```

### Documentation Checks

- [ ] JSDoc on `expandPreset`, `authPage`, all new types, all Zod schemas.
- [ ] `src/ui.ts` exports updated for new presets and types.
- [ ] All factory functions have `@example` JSDoc with TypeScript usage.
