# Entity Page Renderer — Canonical Spec

> **Last updated:** 2026-04-09
>
> **Companion spec:** `bunshot/docs/specs/entity-driven-ssr-pages.md` (Phases 1-7)
>
> This spec covers the **snapshot-side** implementation: how the React renderer
> maps bunshot's abstract page declarations to Snapshot's component system.
> The bunshot spec defines the manifest schema, page resolution, data loading,
> and renderer contract. This spec implements that contract.
>
> | Phase                                                     | Status  | Track |
> | --------------------------------------------------------- | ------- | ----- |
> | Phase 1: Page declaration mapper                          | Pending | A     |
> | Phase 2: Field type mapping tables                        | Pending | A     |
> | Phase 3: Entity-list page rendering                       | Pending | A     |
> | Phase 4: Entity-detail page rendering                     | Pending | A     |
> | Phase 5: Entity-form page rendering                       | Pending | A     |
> | Phase 6: Entity-dashboard page rendering                  | Pending | A     |
> | Phase 7: Navigation & app shell rendering                 | Pending | A     |
> | Phase 8: Custom page handler ref rendering                | Pending | A     |
> | Phase 9: `renderPage()` on `createReactRenderer`          | Pending | B     |
> | Phase 10: `renderPage()` on `createManifestRenderer`      | Pending | B     |
> | Phase 11: Tests                                           | Pending | C     |
> | Phase 12: Documentation                                   | Pending | C     |

---

## Read This First — Architectural Context

This spec sits in **Layer 3** of a three-layer architecture defined in the
bunshot companion spec:

```
Layer 1: bunshot manifest (app.manifest.json)     ← bunshot spec
Layer 2: bunshot-ssr plugin (resolution + loaders) ← bunshot spec
Layer 3: Renderer (this spec)                      ← YOU ARE HERE
```

By the time this code runs, bunshot has already:

1. Parsed the manifest and validated page declarations
2. Matched a URL to a page declaration
3. Executed the page loader (called entity adapters, fetched data)
4. Built a `PageLoaderResult` containing:
   - `declaration` — the resolved page declaration (type, entity, path, fields, etc.)
   - `data` — loaded entity data (discriminated union by page type)
   - `entityMeta` — field metadata (name, type, optional, enumValues, etc.)
   - `meta` — resolved page title/description
   - `navigation` — app shell/nav config (if declared)
   - `revalidate` / `tags` — ISR config

This spec's job: take `PageLoaderResult` and produce HTML.

**The key insight:** We don't build a new rendering pipeline. We translate
page declarations into Snapshot's **existing** manifest system — the same
`PageConfig`, `ComponentConfig`, `RouteConfig` types that `ManifestApp` and
`PageRenderer` already render. The presets (`crudPage()`, `dashboardPage()`)
already prove this pattern works.

```
PageLoaderResult
    │
    └── mapPageToManifest()     ← NEW: this spec
          │
          ├── entity-list      → heading + filter-bar + data-table
          ├── entity-detail    → heading + detail-card + related tables
          ├── entity-form      → heading + form (AutoForm)
          ├── entity-dashboard → heading + stat-card row + chart + feed
          └── custom           → delegated to handler ref
          │
          └── Snapshot's existing rendering pipeline
                ├── compileManifest() / PageRenderer
                ├── ComponentRenderer
                ├── renderToReadableStream
                └── hydration
```

---

## Vision

Today, Snapshot's `ManifestApp` and `PageRenderer` can render any UI from
JSON config — but someone has to write that JSON. The presets (`crudPage()`,
`dashboardPage()`) generate page configs from high-level options, but they're
programmatic TypeScript functions that must be called from code.

This spec closes the last gap: **generating Snapshot page configs from
bunshot's entity metadata at render time**, so the entire pipeline is
manifest-driven end-to-end. The user declares entities and pages in
`app.manifest.json`; bunshot loads the data; Snapshot renders it. No
code anywhere.

**Before:** A developer who wants a Post list page writes:
- Entity definition in bunshot manifest
- A Snapshot manifest JSON with a `data-table`, `resources`, column config,
  filter config, pagination config, actions, and a navigation section
- OR calls `crudPage()` from TypeScript code

**After:** The developer writes entity fields + page declaration in bunshot's
manifest. The renderer auto-generates the equivalent of `crudPage()` output
from the entity metadata and page declaration config. Zero Snapshot-specific
JSON. Zero TypeScript.

---

## What Already Exists

### Rendering pipeline (fully implemented)

| File | What | Lines |
|------|------|-------|
| `src/ssr/renderer.ts` | `createReactRenderer()` — `render()`, `renderChain()`, component resolution | ~1050 |
| `src/ssr/manifest-renderer.ts` | `createManifestRenderer()` — manifest-mode SSR rendering | ~350 |
| `src/ssr/render.ts` | `renderPage()` — streams React to HTML via `renderToReadableStream` | ~200 |
| `src/ssr/types.ts` | `SnapshotSsrConfig`, `ManifestSsrConfig`, `ServerRouteMatchShape`, `SsrShellShape` | ~500 |

### Manifest system (fully implemented)

| File | What |
|------|------|
| `src/ui/manifest/app.tsx` | `ManifestApp` — full app from JSON (L654) |
| `src/ui/manifest/renderer.tsx` | `PageRenderer` + `ComponentRenderer` |
| `src/ui/manifest/compiler.ts` | `compileManifest()` — Zod validation + route compilation |
| `src/ui/manifest/types.ts` | `ManifestConfig`, `PageConfig`, `RouteConfig`, `ComponentConfig`, `CompiledManifest` |
| `src/ui/manifest/schema.ts` | Zod schemas, component schema registry |
| `src/ui/manifest/component-registry.tsx` | Runtime component registry (`registerComponent()`) |
| `src/ui/manifest/structural.tsx` | Built-in structural components (`row`, `heading`, `button`, `select`) |
| `src/ui/manifest/resources.ts` | `ResourceConfig`, endpoint resolution, cache invalidation |
| `src/ui/manifest/runtime.tsx` | `ManifestRuntimeProvider`, resource cache, route context |

### Components (65+ registered)

| Category | Components |
|----------|------------|
| Data display | `data-table`, `detail-card`, `stat-card`, `badge`, `list`, `feed`, `chart` |
| Forms | `form` (AutoForm), `input`, `textarea`, `toggle`, `switch`, `multi-select`, `inline-edit`, `tag-selector`, `entity-picker`, `wizard` |
| Layout | `row`, `heading`, `tabs`, `accordion`, `stepper`, `separator` |
| Navigation | `breadcrumb`, `tree-view` |
| Overlay | `modal`, `drawer`, `popover`, `dropdown-menu`, `command-palette`, `context-menu` |
| Feedback | `alert`, `progress`, `skeleton`, `empty-state`, `tooltip` |
| Filter | `filter-bar` |
| Content | `timeline`, `code-block`, `rich-text-editor`, `markdown`, `compare-view` |
| Chat | `emoji-picker`, `reaction-bar`, `presence-indicator`, `typing-indicator`, `message-thread`, `chat-window` |
| Workflow | `kanban`, `calendar`, `audit-log`, `notification-feed` |

### Presets (the pattern we follow)

| File | What |
|------|------|
| `src/ui/presets/crud-page.ts` | `crudPage(options)` → heading + data-table + create modal + edit drawer |
| `src/ui/presets/dashboard-page.ts` | `dashboardPage(options)` → heading + stat-cards + activity feed |
| `src/ui/presets/settings-page.ts` | `settingsPage(options)` → heading + tabbed forms |

These are the closest existing pattern to what we're building. The difference:
presets take TypeScript options objects and return `PageConfig`. We take
`PageLoaderResult` (from bunshot) and return the same `PageConfig`.

---

## Developer Context

### Build & Test

```sh
bun run typecheck          # tsc --noEmit
bun run format:check       # Prettier
bun run build              # tsup
bun test                   # vitest
```

### Key Types from bunshot (consumed, not defined here)

These types come from `@lastshotlabs/bunshot-ssr` (published by the bunshot
spec). The snapshot renderer receives them — it does NOT define them.

```ts
// From bunshot-ssr — the renderer contract
interface PageLoaderResult {
  readonly declaration: ResolvedPageDeclaration;
  readonly data: PageData;
  readonly entityMeta: Readonly<Record<string, EntityMeta>>;
  readonly meta: SsrMeta;
  readonly navigation?: NavigationConfig;
  readonly revalidate?: number;
  readonly tags?: readonly string[];
}

type PageData =
  | { readonly type: 'list'; readonly items: readonly Record<string, unknown>[]; readonly total: number; readonly page: number; readonly pageSize: number }
  | { readonly type: 'detail'; readonly item: Readonly<Record<string, unknown>> }
  | { readonly type: 'form-create'; readonly defaults: Readonly<Record<string, unknown>> }
  | { readonly type: 'form-edit'; readonly item: Readonly<Record<string, unknown>> }
  | { readonly type: 'dashboard'; readonly stats: readonly { label: string; value: number }[]; readonly activity?: readonly Record<string, unknown>[]; readonly chart?: readonly Record<string, unknown>[] }
  | { readonly type: 'custom' };

interface EntityMeta {
  readonly name: string;
  readonly namespace?: string;
  readonly fields: Readonly<Record<string, EntityFieldMeta>>;
  readonly softDelete?: { readonly field: string };
}

interface EntityFieldMeta {
  readonly name: string;
  readonly type: 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'enum' | 'json' | 'string[]';
  readonly optional: boolean;
  readonly primary: boolean;
  readonly immutable: boolean;
  readonly enumValues?: readonly string[];
}

// Page declaration types (discriminated union on `type`)
type PageDeclaration =
  | EntityListPageDeclaration
  | EntityDetailPageDeclaration
  | EntityFormPageDeclaration
  | EntityDashboardPageDeclaration
  | CustomPageDeclaration;

// NavigationConfig (renderer-agnostic)
interface NavigationConfig {
  readonly shell: 'sidebar' | 'top-nav' | 'none';
  readonly title?: string;
  readonly logo?: string | { handler: string; params?: Record<string, unknown> };
  readonly items: readonly NavigationItem[];
  readonly userMenu?: readonly NavigationItem[];
}
```

### How Presets Work (the pattern to follow)

Every preset follows the same pattern. `crudPage()` from
`src/ui/presets/crud-page.ts` is the canonical example:

```ts
export function crudPage(options: CrudPageOptions): PageConfig {
  const content: Record<string, unknown>[] = [];

  // 1. Heading row with title + create button
  content.push({
    type: 'row',
    justify: 'between',
    align: 'center',
    content: [
      { type: 'heading', level: 1, text: options.title },
      ...(options.createEndpoint ? [{
        type: 'button',
        label: 'Create',
        variant: 'primary',
        action: { type: 'open-modal', modal: `${options.id ?? 'crud'}-create` },
      }] : []),
    ],
  });

  // 2. Data table
  content.push({
    type: 'data-table',
    id: `${options.id ?? 'crud'}-table`,
    resource: { resource: `${options.id ?? 'crud'}-list` },
    columns: options.columns.map(col => ({
      key: col.key,
      label: col.label,
      type: col.type ?? 'text',
      sortable: col.sortable ?? true,
    })),
    // ... actions, filters, pagination
  });

  return { title: options.title, content };
}
```

**The pattern:**
1. Accept high-level options
2. Build a `content: ComponentConfig[]` array
3. Use existing registered component types (`row`, `heading`, `data-table`, etc.)
4. Return `PageConfig`

Our mappers do the exact same thing, but the "high-level options" come from
`PageLoaderResult` instead of a TypeScript function call.

---

## Non-Negotiable Engineering Constraints

| Rule | Constraint |
|------|------------|
| Manifest-First | Output must be valid Snapshot `PageConfig` — same JSON that `ManifestApp` renders |
| `src/ui/` boundary | All mapper code goes under `src/ui/`. Never import bunshot internals. |
| Components fetch own data | Pre-fetched data injected via Snapshot state, not prop drilling |
| No direct component imports | Components communicate via context system (publish/subscribe) |
| Fixed action vocabulary | Only use the 10 defined action types |
| Token rules | All generated styles use `var(--sn-*)` tokens |
| SSR rules | All output must be serializable across server/client boundary |
| Component conventions | New files follow directory structure: `schema.ts`, `component.tsx`, `types.ts`, `index.ts` |

---

## Phase 1: Page Declaration Mapper — Core Infrastructure

### Goal

Create the mapper infrastructure that translates `PageLoaderResult` into
Snapshot's `PageConfig`. This is the orchestration layer — per-page-type
mappers are implemented in Phases 3-6.

### Implementation

New file: `src/ui/entity-pages/mapper.ts`

```ts
import type { PageConfig } from '../manifest/types';

/**
 * Result of mapping a page declaration to Snapshot's manifest format.
 * Contains the page config, any resources needed for client-side
 * interactions (edit, delete, pagination), and app shell config.
 */
export interface EntityPageMapResult {
  /** The page content config (heading, table, form, etc.). */
  readonly page: PageConfig;
  /**
   * Resources for client-side API calls (pagination, form submit, delete).
   * Server-side data is pre-fetched and injected via state, but client
   * interactions (next page, submit form, delete record) need API endpoints.
   */
  readonly resources: Readonly<Record<string, ResourceConfig>>;
  /**
   * State entries for pre-fetched server-side data.
   * Injected into PageContextProvider so components can subscribe.
   */
  readonly state: Readonly<Record<string, StateValueConfig>>;
  /**
   * Overlays (modals/drawers) needed by this page (e.g., delete confirm).
   */
  readonly overlays: Readonly<Record<string, OverlayConfig>>;
}

/**
 * Maps a bunshot PageLoaderResult to Snapshot's manifest format.
 *
 * This is the main entry point. Dispatches to per-type mappers
 * based on `result.declaration.declaration.type`.
 *
 * @param result - The page loader result from bunshot-ssr
 * @returns Snapshot-compatible page config, resources, state, and overlays
 */
export function mapPageDeclaration(result: PageLoaderResult): EntityPageMapResult {
  const d = result.declaration.declaration;

  switch (d.type) {
    case 'entity-list':
      return mapEntityListPage(result);
    case 'entity-detail':
      return mapEntityDetailPage(result);
    case 'entity-form':
      return mapEntityFormPage(result);
    case 'entity-dashboard':
      return mapEntityDashboardPage(result);
    case 'custom':
      throw new Error(
        'Custom pages are rendered via handler ref, not the entity page mapper. ' +
        'The caller should handle custom pages before calling mapPageDeclaration().',
      );
  }
}
```

New file: `src/ui/entity-pages/index.ts`

```ts
export { mapPageDeclaration } from './mapper';
export type { EntityPageMapResult } from './mapper';
export { mapFieldToDisplay, mapFieldToInput, mapFieldToColumn } from './field-mappers';
export { formatFieldLabel } from './utils';
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/mapper.ts` | **Create** — main mapper dispatch |
| `src/ui/entity-pages/index.ts` | **Create** — barrel export for entity-pages module |
| `src/ui/entity-pages/utils.ts` | **Create** — shared utilities (formatFieldLabel, buildEntityApiPath, etc.) |

### Exit Criteria

- `bun run typecheck` passes
- `mapPageDeclaration()` dispatches to per-type mappers
- Throws clear error for `custom` type (handled separately)
- JSDoc on all exports

---

## Phase 2: Field Type Mapping Tables

### Goal

Define the mapping between bunshot's `FieldType` (8 types) and Snapshot's
component types for three contexts: display (read-only), input (form), and
column (data-table).

### Implementation

New file: `src/ui/entity-pages/field-mappers.ts`

```ts
import type { EntityFieldMeta } from '@lastshotlabs/bunshot-ssr';

// ─── Display mapping (detail-card, read-only views) ─────────────

export interface FieldDisplayConfig {
  /** Snapshot component type for displaying this field's value. */
  readonly type: 'text' | 'number' | 'badge' | 'date' | 'code' | 'tags' | 'boolean';
  /** For enum fields: map of value → badge variant. */
  readonly variants?: Readonly<Record<string, string>>;
}

/**
 * Maps an entity field to its display component configuration.
 *
 * | FieldType  | Display Type | Notes                              |
 * |------------|-------------|-------------------------------------|
 * | string     | text        |                                     |
 * | number     | number      | Formatted with locale               |
 * | integer    | number      | Formatted with locale, no decimals  |
 * | boolean    | boolean     | true/false badge or checkmark       |
 * | date       | date        | Formatted relative or absolute      |
 * | enum       | badge       | Colored badge per enum value        |
 * | json       | code        | Syntax-highlighted JSON block       |
 * | string[]   | tags        | Inline tag list                     |
 */
export function mapFieldToDisplay(field: EntityFieldMeta): FieldDisplayConfig {
  switch (field.type) {
    case 'string':
      return { type: 'text' };
    case 'number':
      return { type: 'number' };
    case 'integer':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'date':
      return { type: 'date' };
    case 'enum':
      return {
        type: 'badge',
        variants: field.enumValues
          ? Object.fromEntries(field.enumValues.map((v, i) => [v, BADGE_VARIANT_CYCLE[i % BADGE_VARIANT_CYCLE.length]]))
          : undefined,
      };
    case 'json':
      return { type: 'code' };
    case 'string[]':
      return { type: 'tags' };
  }
}

// ─── Input mapping (forms) ──────────────────────────────────────

export interface FieldInputConfig {
  /** Snapshot form field input type. */
  readonly inputType: 'input' | 'number' | 'switch' | 'datetime' | 'select' | 'textarea' | 'tag-selector';
  /** HTML input type attribute (for `input` inputType). */
  readonly htmlType?: 'text' | 'number' | 'email' | 'url' | 'tel';
  /** For enum fields: select options. */
  readonly options?: readonly { readonly label: string; readonly value: string }[];
}

/**
 * Maps an entity field to its form input configuration.
 *
 * | FieldType  | Input Type    | HTML Type | Notes                    |
 * |------------|--------------|-----------|--------------------------|
 * | string     | input        | text      |                          |
 * | number     | number       | number    | step="any"               |
 * | integer    | number       | number    | step="1"                 |
 * | boolean    | switch       | —         |                          |
 * | date       | datetime     | —         | datetime-local picker    |
 * | enum       | select       | —         | options from enumValues  |
 * | json       | textarea     | —         | monospace, JSON mode     |
 * | string[]   | tag-selector | —         | tag input                |
 */
export function mapFieldToInput(field: EntityFieldMeta): FieldInputConfig {
  switch (field.type) {
    case 'string':
      return { inputType: 'input', htmlType: 'text' };
    case 'number':
      return { inputType: 'number', htmlType: 'number' };
    case 'integer':
      return { inputType: 'number', htmlType: 'number' };
    case 'boolean':
      return { inputType: 'switch' };
    case 'date':
      return { inputType: 'datetime' };
    case 'enum':
      return {
        inputType: 'select',
        options: field.enumValues?.map(v => ({
          label: formatEnumLabel(v),
          value: v,
        })),
      };
    case 'json':
      return { inputType: 'textarea' };
    case 'string[]':
      return { inputType: 'tag-selector' };
  }
}

// ─── Column mapping (data-table) ────────────────────────────────

export interface FieldColumnConfig {
  /** Snapshot data-table column type. */
  readonly columnType: 'text' | 'number' | 'boolean' | 'date' | 'badge' | 'tags';
  /** For enum fields: badge variant map. */
  readonly variants?: Readonly<Record<string, string>>;
}

/**
 * Maps an entity field to its data-table column configuration.
 *
 * | FieldType  | Column Type | Notes                          |
 * |------------|------------|--------------------------------|
 * | string     | text       |                                |
 * | number     | number     | Right-aligned, formatted       |
 * | integer    | number     | Right-aligned, formatted       |
 * | boolean    | boolean    | Check/cross icon               |
 * | date       | date       | Relative time ("2 hours ago")  |
 * | enum       | badge      | Colored badge                  |
 * | json       | text       | Truncated preview              |
 * | string[]   | tags       | Inline tag pills               |
 */
export function mapFieldToColumn(field: EntityFieldMeta): FieldColumnConfig {
  switch (field.type) {
    case 'string':
      return { columnType: 'text' };
    case 'number':
    case 'integer':
      return { columnType: 'number' };
    case 'boolean':
      return { columnType: 'boolean' };
    case 'date':
      return { columnType: 'date' };
    case 'enum':
      return {
        columnType: 'badge',
        variants: field.enumValues
          ? Object.fromEntries(field.enumValues.map((v, i) => [v, BADGE_VARIANT_CYCLE[i % BADGE_VARIANT_CYCLE.length]]))
          : undefined,
      };
    case 'json':
      return { columnType: 'text' };
    case 'string[]':
      return { columnType: 'tags' };
  }
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Deterministic badge variant cycle for enum values.
 * Ensures consistent coloring across renders.
 */
const BADGE_VARIANT_CYCLE = [
  'default', 'secondary', 'success', 'warning', 'destructive',
  'info', 'outline',
] as const;

/**
 * Converts enum values to human-readable labels.
 * `'draft'` → `'Draft'`, `'in_progress'` → `'In Progress'`,
 * `'PUBLISHED'` → `'Published'`
 */
function formatEnumLabel(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}
```

### Shared Utilities

New file: `src/ui/entity-pages/utils.ts`

```ts
/**
 * Converts camelCase or snake_case field names to human-readable labels.
 * `'createdAt'` → `'Created At'`, `'first_name'` → `'First Name'`
 */
export function formatFieldLabel(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Builds the API endpoint path for an entity.
 *
 * By convention, entity API routes are mounted at `/{storageName}` where
 * storageName is the lowercase pluralized entity name. This matches
 * how bunshot's entity plugin mounts routes.
 *
 * @param entityName - Entity name from manifest (e.g., 'Post')
 * @returns API path (e.g., '/posts')
 */
export function buildEntityApiPath(entityName: string): string {
  // Simple lowercase + 's' pluralization
  // Entity plugin's actual mount path may differ — the page declaration
  // or entity config should eventually carry the canonical API path.
  // For now, follow the convention.
  return `/${entityName.toLowerCase()}s`;
}

/**
 * Builds the API endpoint for a specific entity record.
 *
 * @param entityName - Entity name
 * @param record - Record with `id` field
 * @returns API path (e.g., '/posts/abc123')
 */
export function buildEntityRecordApiPath(
  entityName: string,
  record: Readonly<Record<string, unknown>>,
): string {
  const id = record.id;
  if (!id) throw new Error(`Record for "${entityName}" has no id field`);
  return `${buildEntityApiPath(entityName)}/${String(id)}`;
}

/**
 * Resolves a page title to a static string for use in PageConfig.title.
 *
 * - Static string: returned as-is
 * - Field ref: extracts value from entity record
 * - Template: interpolates `{field}` with record values
 */
export function resolvePageTitle(
  title: string | { field: string } | { template: string },
  item: Readonly<Record<string, unknown>> | null,
): string {
  if (typeof title === 'string') return title;
  if ('field' in title) return item ? String(item[title.field] ?? '') : '';
  if ('template' in title) {
    if (!item) return title.template.replace(/\{(\w+)\}/g, '');
    return title.template.replace(/\{(\w+)\}/g, (_, key) => String(item[key] ?? ''));
  }
  return '';
}
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/field-mappers.ts` | **Create** — field type mapping tables |
| `src/ui/entity-pages/utils.ts` | **Create** — shared utilities |

### Exit Criteria

- `bun run typecheck` passes
- All 8 field types map to display, input, and column configs
- Enum fields generate badge variants and select options
- `formatFieldLabel` handles camelCase and snake_case
- JSDoc on all exports including the mapping tables in comments

### Tests

File: `src/ui/entity-pages/__tests__/field-mappers.test.ts`

Test cases:
- `mapFieldToDisplay` maps all 8 field types correctly
- `mapFieldToDisplay` generates badge variants for enum fields
- `mapFieldToInput` maps all 8 field types correctly
- `mapFieldToInput` generates select options for enum fields
- `mapFieldToColumn` maps all 8 field types correctly
- `mapFieldToColumn` generates badge variants for enum fields
- `formatEnumLabel` converts `'draft'` → `'Draft'`
- `formatEnumLabel` converts `'in_progress'` → `'In Progress'`
- `formatEnumLabel` converts `'PUBLISHED'` → `'Published'`
- `formatFieldLabel` converts `'createdAt'` → `'Created At'`
- `formatFieldLabel` converts `'first_name'` → `'First Name'`
- `resolvePageTitle` handles static string
- `resolvePageTitle` handles field reference with item
- `resolvePageTitle` handles field reference without item (empty string)
- `resolvePageTitle` handles template with item
- `resolvePageTitle` handles template without item (placeholders removed)

---

## Phase 3: Entity-List Page Rendering

### Goal

Map `entity-list` page declarations to a Snapshot page config with:
heading row, optional filter-bar, data-table, and optional create button.

### Implementation

New file: `src/ui/entity-pages/list-mapper.ts`

```ts
import type { PageConfig } from '../manifest/types';
import type { PageLoaderResult, EntityListPageDeclaration, PageData } from '@lastshotlabs/bunshot-ssr';
import type { EntityPageMapResult } from './mapper';
import { mapFieldToColumn } from './field-mappers';
import { formatFieldLabel, buildEntityApiPath, resolvePageTitle } from './utils';

/**
 * Maps an entity-list page declaration to a Snapshot PageConfig.
 *
 * Output structure:
 * ```
 * ┌─────────────────────────────────────┐
 * │ [Heading: "Posts"]    [Create Button]│
 * ├─────────────────────────────────────┤
 * │ [Filter Bar] (if filters declared)  │
 * ├─────────────────────────────────────┤
 * │ [Data Table]                        │
 * │  Title  │ Status  │ Created At      │
 * │  ─────  │ ─────── │ ──────────      │
 * │  ...    │ ...     │ ...             │
 * │                                     │
 * │  [Pagination]                       │
 * └─────────────────────────────────────┘
 * ```
 */
export function mapEntityListPage(result: PageLoaderResult): EntityPageMapResult {
  const d = result.declaration.declaration as EntityListPageDeclaration;
  const meta = result.entityMeta[d.entity];
  const data = result.data as Extract<PageData, { type: 'list' }>;
  const apiPath = buildEntityApiPath(d.entity);

  const content: Record<string, unknown>[] = [];

  // ─── Heading row ──────────────────────────────────────────
  const headingContent: Record<string, unknown>[] = [
    { type: 'heading', level: 1, text: resolvePageTitle(d.title, null) },
  ];
  if (d.actions?.create) {
    headingContent.push({
      type: 'button',
      label: 'Create',
      variant: 'primary',
      action: { type: 'navigate', to: d.actions.create },
    });
  }
  content.push({
    type: 'row',
    justify: 'between',
    align: 'center',
    content: headingContent,
  });

  // ─── Filter bar ───────────────────────────────────────────
  if (d.filters && d.filters.length > 0) {
    content.push({
      type: 'filter-bar',
      id: `${d.entity.toLowerCase()}-filters`,
      filters: d.filters.map(f => {
        const fieldMeta = meta?.fields[f.field];
        return {
          field: f.field,
          label: f.label ?? formatFieldLabel(f.field),
          type: fieldMeta?.type === 'enum'
            ? 'select'
            : fieldMeta?.type === 'boolean'
              ? 'boolean'
              : fieldMeta?.type === 'date'
                ? 'date-range'
                : fieldMeta?.type === 'number' || fieldMeta?.type === 'integer'
                  ? 'number-range'
                  : 'text',
          options: fieldMeta?.enumValues?.map(v => ({ label: formatFieldLabel(v), value: v })),
        };
      }),
    });
  }

  // ─── Data table ───────────────────────────────────────────
  const columns = d.fields.map(fieldName => {
    const fieldMeta = meta?.fields[fieldName];
    const colConfig = fieldMeta ? mapFieldToColumn(fieldMeta) : { columnType: 'text' as const };
    return {
      key: fieldName,
      label: formatFieldLabel(fieldName),
      type: colConfig.columnType,
      sortable: true,
      variants: colConfig.variants,
    };
  });

  const tableConfig: Record<string, unknown> = {
    type: 'data-table',
    id: `${d.entity.toLowerCase()}-table`,
    columns,
    data: { from: 'entityPageData.items' },
    pagination: {
      total: { from: 'entityPageData.total' },
      page: { from: 'entityPageData.page' },
      pageSize: { from: 'entityPageData.pageSize' },
      onChange: {
        type: 'api',
        method: 'GET',
        endpoint: apiPath,
      },
    },
    sortable: true,
  };

  if (d.searchable) {
    tableConfig.searchable = true;
    tableConfig.searchEndpoint = apiPath;
  }

  if (d.rowClick) {
    tableConfig.onRowClick = {
      type: 'navigate',
      to: d.rowClick,
    };
  }

  if (d.actions?.bulkDelete) {
    tableConfig.bulkActions = [{
      label: 'Delete',
      variant: 'destructive',
      action: {
        type: 'confirm',
        title: `Delete selected ${d.entity} records?`,
        message: 'This action cannot be undone.',
        onConfirm: {
          type: 'api',
          method: 'DELETE',
          endpoint: `${apiPath}/batch`,
        },
      },
    }];
  }

  content.push(tableConfig);

  // ─── Resources ────────────────────────────────────────────
  // Client-side resource for pagination, sorting, filtering
  const resources: Record<string, Record<string, unknown>> = {
    [`${d.entity.toLowerCase()}-list`]: {
      method: 'GET',
      endpoint: apiPath,
      params: {
        page: 1,
        pageSize: d.pageSize ?? 20,
        ...(d.defaultSort ? { sort: d.defaultSort.field, order: d.defaultSort.order } : {}),
      },
    },
  };

  // ─── State ────────────────────────────────────────────────
  // Pre-fetched data injected as route-scoped state
  const state: Record<string, Record<string, unknown>> = {
    entityPageData: {
      scope: 'route',
      initial: {
        items: data.items,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
      },
    },
  };

  return {
    page: {
      title: resolvePageTitle(d.title, null),
      content,
    },
    resources,
    state,
    overlays: {},
  };
}
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/list-mapper.ts` | **Create** — entity-list page mapper |

### Exit Criteria

- Entity-list page generates valid `PageConfig` with heading + data-table
- Columns derive types from entity field metadata
- Filter bar generated when `filters` declared
- Search enabled when `searchable` is true
- Create button links to create page when `actions.create` set
- Row click navigates when `rowClick` set
- Bulk delete generates confirm action
- Pre-fetched data injected as route-scoped state
- Client-side resource generated for pagination/sort/filter

### Tests

File: `src/ui/entity-pages/__tests__/list-mapper.test.ts`

Test cases:
- Generates heading with entity title
- Generates data-table with columns for each declared field
- Column types match field metadata (string→text, enum→badge, date→date, etc.)
- Generates create button when `actions.create` is set
- Omits create button when `actions.create` is not set
- Generates filter-bar when `filters` is non-empty
- Filter types match field metadata (enum→select, boolean→boolean, date→date-range)
- Sets `searchable` on data-table when page declares `searchable: true`
- Sets `onRowClick` when `rowClick` is set
- Generates bulk delete action when `actions.bulkDelete` is true
- Pre-fetched data injected in state as `entityPageData`
- Resource generated with correct API endpoint and default sort

---

## Phase 4: Entity-Detail Page Rendering

### Goal

Map `entity-detail` page declarations to a Snapshot page config with:
heading row with actions, field sections via detail-card, and optional
related entity tables.

### Implementation

New file: `src/ui/entity-pages/detail-mapper.ts`

```ts
import type { PageLoaderResult, EntityDetailPageDeclaration, PageData } from '@lastshotlabs/bunshot-ssr';
import type { EntityPageMapResult } from './mapper';
import { mapFieldToDisplay } from './field-mappers';
import { formatFieldLabel, buildEntityApiPath, buildEntityRecordApiPath, resolvePageTitle } from './utils';

/**
 * Maps an entity-detail page declaration to a Snapshot PageConfig.
 *
 * Output structure:
 * ```
 * ┌──────────────────────────────────────────┐
 * │ [Heading: "My Post"]  [Back] [Edit] [Del]│
 * ├──────────────────────────────────────────┤
 * │ [Detail Card — Section 1]               │
 * │  Title:     "My First Post"              │
 * │  Status:    [Published]                  │
 * │  Created:   2 hours ago                  │
 * ├──────────────────────────────────────────┤
 * │ [Detail Card — "Content"]               │
 * │  Body:      "Lorem ipsum..."             │
 * ├──────────────────────────────────────────┤
 * │ [Related: "Comments" — data-table]      │
 * └──────────────────────────────────────────┘
 * ```
 */
export function mapEntityDetailPage(result: PageLoaderResult): EntityPageMapResult {
  const d = result.declaration.declaration as EntityDetailPageDeclaration;
  const meta = result.entityMeta[d.entity];
  const data = result.data as Extract<PageData, { type: 'detail' }>;
  const item = data.item;
  const apiPath = buildEntityApiPath(d.entity);

  const content: Record<string, unknown>[] = [];
  const resources: Record<string, Record<string, unknown>> = {};
  const overlays: Record<string, Record<string, unknown>> = {};

  // ─── Heading row with actions ─────────────────────────────
  const actionButtons: Record<string, unknown>[] = [];
  if (d.actions?.back) {
    actionButtons.push({
      type: 'button',
      label: 'Back',
      variant: 'ghost',
      action: { type: 'navigate', to: d.actions.back },
    });
  }
  if (d.actions?.edit) {
    actionButtons.push({
      type: 'button',
      label: 'Edit',
      variant: 'secondary',
      action: { type: 'navigate', to: d.actions.edit },
    });
  }
  if (d.actions?.delete) {
    actionButtons.push({
      type: 'button',
      label: 'Delete',
      variant: 'destructive',
      action: {
        type: 'confirm',
        title: `Delete this ${d.entity}?`,
        message: 'This action cannot be undone.',
        variant: 'destructive',
        onConfirm: {
          type: 'api',
          method: 'DELETE',
          endpoint: buildEntityRecordApiPath(d.entity, item),
          onSuccess: {
            type: 'navigate',
            to: d.actions.back ?? '/',
          },
        },
      },
    });
  }

  content.push({
    type: 'row',
    justify: 'between',
    align: 'center',
    content: [
      { type: 'heading', level: 1, text: resolvePageTitle(d.title, item) },
      ...(actionButtons.length > 0 ? [{
        type: 'row',
        gap: 2,
        content: actionButtons,
      }] : []),
    ],
  });

  // ─── Detail card sections ─────────────────────────────────
  // Determine sections: explicit sections, flat fields, or all non-primary fields
  const sections = d.sections
    ?? (d.fields ? [{ fields: d.fields }] : [{
      fields: meta
        ? Object.entries(meta.fields)
          .filter(([_, f]) => !f.primary)
          .map(([name]) => name)
        : [],
    }]);

  for (const section of sections) {
    if (section.label) {
      content.push({ type: 'heading', level: 2, text: section.label });
    }

    const fields = section.fields.map(fieldName => {
      const fieldMeta = meta?.fields[fieldName];
      const displayConfig = fieldMeta ? mapFieldToDisplay(fieldMeta) : { type: 'text' as const };
      return {
        key: fieldName,
        label: formatFieldLabel(fieldName),
        value: item[fieldName],
        type: displayConfig.type,
        variants: displayConfig.variants,
      };
    });

    content.push({
      type: 'detail-card',
      fields,
      layout: section.layout ?? 'grid',
    });
  }

  // ─── Related entity sections ──────────────────────────────
  if (d.related) {
    for (const rel of d.related) {
      const relMeta = result.entityMeta[rel.entity];
      const relApiPath = buildEntityApiPath(rel.entity);
      const resourceKey = `related-${rel.entity.toLowerCase()}`;

      content.push({
        type: 'heading',
        level: 2,
        text: rel.label ?? formatFieldLabel(rel.entity),
      });

      content.push({
        type: 'data-table',
        resource: { resource: resourceKey },
        columns: rel.fields.map(fieldName => {
          const fieldMeta = relMeta?.fields[fieldName];
          const colConfig = fieldMeta ? mapFieldToDisplay(fieldMeta) : { type: 'text' as const };
          return {
            key: fieldName,
            label: formatFieldLabel(fieldName),
            type: colConfig.type,
          };
        }),
        compact: true,
      });

      resources[resourceKey] = {
        method: 'GET',
        endpoint: relApiPath,
        params: {
          [rel.foreignKey]: String(item.id),
          limit: rel.limit ?? 10,
        },
      };
    }
  }

  // ─── State ────────────────────────────────────────────────
  const state: Record<string, Record<string, unknown>> = {
    entityPageData: {
      scope: 'route',
      initial: { item },
    },
  };

  return {
    page: {
      title: resolvePageTitle(d.title, item),
      content,
    },
    resources,
    state,
    overlays,
  };
}
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/detail-mapper.ts` | **Create** — entity-detail page mapper |

### Exit Criteria

- Detail page generates heading with resolved title (field ref, template)
- Action buttons (back, edit, delete) generated from `actions` config
- Delete action generates confirm dialog with API call
- Detail-card sections generated from `sections` or flat `fields`
- Falls back to all non-primary fields when neither specified
- Section labels rendered as headings
- Grid vs stack layout respected
- Related entity sections generate data-table + resource
- Pre-fetched item data injected as state

### Tests

File: `src/ui/entity-pages/__tests__/detail-mapper.test.ts`

Test cases:
- Generates heading with static title
- Generates heading with field reference title
- Generates heading with template title
- Generates back button when `actions.back` set
- Generates edit button when `actions.edit` set
- Generates delete button with confirm when `actions.delete` true
- Delete confirm navigates to `actions.back` on success
- Generates detail-card for each section
- Section label rendered as heading
- Fields display types match entity metadata
- Enum fields get badge variants
- Falls back to all non-primary fields when no fields/sections specified
- Grid layout applied by default
- Stack layout applied when specified
- Related section generates heading + data-table + resource
- Related resource includes foreign key filter
- Pre-fetched item injected in state

---

## Phase 5: Entity-Form Page Rendering

### Goal

Map `entity-form` page declarations to a Snapshot page config with:
heading, AutoForm, and submit/cancel actions.

### Implementation

New file: `src/ui/entity-pages/form-mapper.ts`

```ts
import type { PageLoaderResult, EntityFormPageDeclaration, PageData } from '@lastshotlabs/bunshot-ssr';
import type { EntityPageMapResult } from './mapper';
import { mapFieldToInput } from './field-mappers';
import { formatFieldLabel, buildEntityApiPath, buildEntityRecordApiPath, resolvePageTitle } from './utils';

/**
 * Maps an entity-form page declaration to a Snapshot PageConfig.
 *
 * Output structure:
 * ```
 * ┌───────────────────────────────────┐
 * │ [Heading: "New Post"]             │
 * ├───────────────────────────────────┤
 * │ [Form]                           │
 * │  Title:    [_______________]     │
 * │  Slug:     [_______________]     │
 * │  Body:     [_______________]     │
 * │            [_______________]     │
 * │  Status:   [Draft ▾]            │
 * │                                   │
 * │  [Cancel]           [Create Post] │
 * └───────────────────────────────────┘
 * ```
 */
export function mapEntityFormPage(result: PageLoaderResult): EntityPageMapResult {
  const d = result.declaration.declaration as EntityFormPageDeclaration;
  const meta = result.entityMeta[d.entity];
  const isEdit = d.operation === 'update';
  const apiPath = buildEntityApiPath(d.entity);

  const existingItem = isEdit
    ? (result.data as Extract<PageData, { type: 'form-edit' }>).item
    : null;
  const defaults = !isEdit
    ? (result.data as Extract<PageData, { type: 'form-create' }>).defaults
    : {};

  const content: Record<string, unknown>[] = [];

  // ─── Heading ──────────────────────────────────────────────
  content.push({
    type: 'heading',
    level: 1,
    text: resolvePageTitle(d.title, existingItem),
  });

  // ─── Form ─────────────────────────────────────────────────
  const fields = d.fields.map(fieldName => {
    const fieldMeta = meta?.fields[fieldName];
    const override = d.fieldConfig?.[fieldName];
    const inputConfig = fieldMeta ? mapFieldToInput(fieldMeta) : { inputType: 'input' as const };

    const fieldConfig: Record<string, unknown> = {
      name: fieldName,
      label: override?.label ?? formatFieldLabel(fieldName),
      type: override?.inputType ?? inputConfig.inputType,
      required: fieldMeta ? !fieldMeta.optional : true,
      readOnly: override?.readOnly ?? (fieldMeta?.immutable && isEdit) ?? false,
    };

    // Default/existing value
    if (isEdit && existingItem) {
      fieldConfig.defaultValue = existingItem[fieldName];
    } else if (override?.defaultValue !== undefined) {
      fieldConfig.defaultValue = override.defaultValue;
    } else if (defaults[fieldName] !== undefined) {
      fieldConfig.defaultValue = defaults[fieldName];
    }

    // Placeholder
    if (override?.placeholder) {
      fieldConfig.placeholder = override.placeholder;
    }

    // Help text
    if (override?.helpText) {
      fieldConfig.helpText = override.helpText;
    }

    // Enum options
    if (inputConfig.options) {
      fieldConfig.options = inputConfig.options;
    }

    // HTML type
    if (inputConfig.htmlType) {
      fieldConfig.htmlType = inputConfig.htmlType;
    }

    return fieldConfig;
  });

  // Build submit action
  const submitEndpoint = isEdit
    ? buildEntityRecordApiPath(d.entity, existingItem!)
    : apiPath;

  const onSuccessAction: Record<string, unknown> = d.redirect
    ? {
      type: 'navigate',
      to: d.redirect.to.replace(/\{(\w+)\}/g, (_, key) => `{result.${key}}`),
    }
    : { type: 'toast', message: `${d.entity} ${isEdit ? 'updated' : 'created'} successfully` };

  const formConfig: Record<string, unknown> = {
    type: 'form',
    id: `${d.entity.toLowerCase()}-form`,
    fields,
    action: {
      type: 'api',
      method: isEdit ? 'PATCH' : 'POST',
      endpoint: submitEndpoint,
      onSuccess: onSuccessAction,
      onError: { type: 'toast', message: `Failed to ${isEdit ? 'update' : 'create'} ${d.entity}`, variant: 'destructive' },
    },
    submitLabel: isEdit ? `Update ${d.entity}` : `Create ${d.entity}`,
  };

  if (d.cancel) {
    formConfig.cancelLabel = 'Cancel';
    formConfig.cancelAction = { type: 'navigate', to: d.cancel.to };
  }

  content.push(formConfig);

  // ─── State ────────────────────────────────────────────────
  const state: Record<string, Record<string, unknown>> = {};
  if (isEdit && existingItem) {
    state.entityPageData = {
      scope: 'route',
      initial: { item: existingItem },
    };
  }

  return {
    page: {
      title: resolvePageTitle(d.title, existingItem),
      content,
    },
    resources: {},
    state,
    overlays: {},
  };
}
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/form-mapper.ts` | **Create** — entity-form page mapper |

### Exit Criteria

- Create form generates empty form with field defaults
- Edit form pre-populates from existing record
- Field input types derive from entity metadata
- Field overrides (label, placeholder, helpText, inputType, readOnly) applied
- Immutable fields become read-only on edit forms
- Required/optional derives from field metadata
- Enum fields generate select with options
- Submit action uses POST for create, PATCH for update
- Redirect action interpolates result fields
- Cancel action navigates to configured path
- Toast shown on success/error when no redirect configured

### Tests

File: `src/ui/entity-pages/__tests__/form-mapper.test.ts`

Test cases:
- Create form generates heading + form component
- Create form fields have no default values (when none configured)
- Create form applies `defaultValue` from `fieldConfig`
- Edit form pre-populates fields from existing record
- Edit form marks immutable fields as read-only
- Field types match entity metadata (string→input, enum→select, boolean→switch, etc.)
- Field overrides applied: label, placeholder, helpText, inputType
- Enum field generates select options from enumValues
- Submit action is POST for create
- Submit action is PATCH for update
- Redirect action interpolates `{field}` from result
- Cancel action navigates to `cancel.to`
- Toast shown on success when no redirect
- Toast shown on error
- Required fields derived from `!field.optional`

---

## Phase 6: Entity-Dashboard Page Rendering

### Goal

Map `entity-dashboard` page declarations to a Snapshot page config with:
stat cards, optional chart, optional activity feed.

### Implementation

New file: `src/ui/entity-pages/dashboard-mapper.ts`

```ts
import type { PageLoaderResult, EntityDashboardPageDeclaration, PageData } from '@lastshotlabs/bunshot-ssr';
import type { EntityPageMapResult } from './mapper';
import { formatFieldLabel, resolvePageTitle } from './utils';

/**
 * Maps an entity-dashboard page declaration to a Snapshot PageConfig.
 *
 * Output structure:
 * ```
 * ┌───────────────────────────────────────────┐
 * │ [Heading: "Dashboard"]                    │
 * ├──────────┬──────────┬──────────┬──────────┤
 * │ [Stat]   │ [Stat]   │ [Stat]   │ [Stat]   │
 * │ Total    │ Active   │ Revenue  │ Avg      │
 * │ Posts    │ Users    │ $12,345  │ Rating   │
 * │ 142      │ 89       │          │ 4.5      │
 * ├──────────┴──────────┴──────────┴──────────┤
 * │ [Chart]                                   │
 * │  ▌▌  ▌▌▌                                  │
 * │ ▌▌▌▌▌▌▌▌▌▌                                │
 * ├───────────────────────────────────────────┤
 * │ [Activity Feed]                           │
 * │ • New post created — 2 min ago            │
 * │ • User signed up — 5 min ago              │
 * └───────────────────────────────────────────┘
 * ```
 */
export function mapEntityDashboardPage(result: PageLoaderResult): EntityPageMapResult {
  const d = result.declaration.declaration as EntityDashboardPageDeclaration;
  const data = result.data as Extract<PageData, { type: 'dashboard' }>;

  const content: Record<string, unknown>[] = [];

  // ─── Heading ──────────────────────────────────────────────
  content.push({
    type: 'heading',
    level: 1,
    text: resolvePageTitle(d.title, null),
  });

  // ─── Stat cards row ───────────────────────────────────────
  // Each stat card gets span 3 in a 12-column grid (4 per row)
  const statCards = data.stats.map((stat, i) => ({
    type: 'stat-card',
    label: stat.label,
    value: stat.value,
    icon: d.stats[i]?.icon,
    span: Math.floor(12 / Math.min(data.stats.length, 4)),
  }));

  content.push({
    type: 'row',
    gap: 4,
    content: statCards,
  });

  // ─── Chart ────────────────────────────────────────────────
  if (d.chart && data.chart) {
    content.push({
      type: 'chart',
      chartType: d.chart.chartType,
      data: data.chart,
      categoryField: d.chart.categoryField,
      valueField: d.chart.valueField,
      label: d.chart.label,
    });
  }

  // ─── Activity feed ────────────────────────────────────────
  if (d.activity && data.activity) {
    content.push({ type: 'heading', level: 2, text: 'Recent Activity' });
    content.push({
      type: 'feed',
      items: data.activity.map(item => ({
        fields: d.activity!.fields.map(fieldName => ({
          key: fieldName,
          label: formatFieldLabel(fieldName),
          value: item[fieldName],
        })),
        sortField: d.activity!.sortField ?? 'createdAt',
        sortValue: item[d.activity!.sortField ?? 'createdAt'],
      })),
    });
  }

  // ─── State ────────────────────────────────────────────────
  const state: Record<string, Record<string, unknown>> = {
    entityPageData: {
      scope: 'route',
      initial: {
        stats: data.stats,
        activity: data.activity,
        chart: data.chart,
      },
    },
  };

  return {
    page: {
      title: resolvePageTitle(d.title, null),
      content,
    },
    resources: {},
    state,
    overlays: {},
  };
}
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/dashboard-mapper.ts` | **Create** — entity-dashboard page mapper |

### Exit Criteria

- Dashboard generates heading + stat card row
- Stat cards span evenly (12/n columns, max 4 per row)
- Icons passed through from declaration
- Chart rendered when chart data present
- Chart type, category/value fields, label from declaration
- Activity feed rendered when activity data present
- Pre-fetched data injected as state

### Tests

File: `src/ui/entity-pages/__tests__/dashboard-mapper.test.ts`

Test cases:
- Generates heading with title
- Generates stat-card for each stat
- Stat card span is 12/n (3 for 4 stats, 4 for 3 stats, 6 for 2 stats)
- Stat card icon passed from declaration
- Chart generated when chart data present
- Chart omitted when no chart data
- Activity feed generated when activity data present
- Activity feed omitted when no activity data
- Pre-fetched data injected in state

---

## Phase 7: Navigation & App Shell Rendering

### Goal

Map bunshot's renderer-agnostic `NavigationConfig` to Snapshot's existing
navigation manifest format for the app shell.

### Implementation

New file: `src/ui/entity-pages/navigation-mapper.ts`

```ts
import type { NavigationConfig as BunshotNavigationConfig } from '@lastshotlabs/bunshot-ssr';
import type { NavigationConfig as SnapshotNavigationConfig } from '../manifest/types';

/**
 * Maps bunshot's renderer-agnostic NavigationConfig to Snapshot's
 * navigation manifest format.
 *
 * bunshot NavigationConfig:
 *   shell: 'sidebar' | 'top-nav' | 'none'
 *   title, logo, items, userMenu
 *
 * Snapshot NavigationConfig:
 *   mode: 'sidebar' | 'top-nav'
 *   items: { label, path, icon, children }[]
 */
export function mapNavigation(
  config: BunshotNavigationConfig,
): SnapshotNavigationConfig | undefined {
  if (config.shell === 'none') return undefined;

  return {
    mode: config.shell,
    items: config.items.map(item => mapNavigationItem(item)),
  };
}

/**
 * Maps the app-level config (title, logo) to Snapshot's AppConfig format.
 */
export function mapAppConfig(
  config: BunshotNavigationConfig,
): Record<string, unknown> {
  return {
    title: config.title,
    shell: config.shell === 'none' ? 'full-width' : config.shell,
    logo: typeof config.logo === 'string' ? config.logo : undefined,
  };
}

function mapNavigationItem(item: BunshotNavigationConfig['items'][number]): Record<string, unknown> {
  const mapped: Record<string, unknown> = {
    label: item.label,
    path: item.path,
  };
  if (item.icon) mapped.icon = item.icon;
  if (item.children?.length) {
    mapped.children = item.children.map(child => mapNavigationItem(child));
  }
  if (item.badge) {
    mapped.badge = typeof item.badge === 'string'
      ? item.badge
      : { from: `badge-${item.path.replace(/\//g, '-')}` };
  }
  return mapped;
}
```

### Files to Create

| File | Action |
|------|--------|
| `src/ui/entity-pages/navigation-mapper.ts` | **Create** — navigation config mapper |

### Exit Criteria

- Sidebar navigation maps to Snapshot `mode: 'sidebar'`
- Top-nav maps to `mode: 'top-nav'`
- Shell `'none'` returns undefined (no navigation)
- Nav items map label, path, icon
- Nested children map recursively
- App title and logo passed through
- Badge config mapped (static string or entity count ref)

### Tests

File: `src/ui/entity-pages/__tests__/navigation-mapper.test.ts`

Test cases:
- Maps sidebar shell to `mode: 'sidebar'`
- Maps top-nav shell to `mode: 'top-nav'`
- Returns undefined for shell `'none'`
- Maps nav items with label, path, icon
- Maps nested children recursively
- Maps app title and logo
- Maps static string badge
- Maps entity count badge

---

## Phase 8: Custom Page Handler Ref Rendering

### Goal

Handle `custom` page type by dynamically importing the handler ref module
and rendering it as a standard `defineRoute()` page.

### Implementation

In `src/ui/entity-pages/mapper.ts`, add a `mapCustomPage()` export that
returns `null` to signal the caller should fall through to the standard
`render()` / `renderChain()` pipeline:

```ts
/**
 * Custom pages are NOT mapped to Snapshot components.
 * They use a handler ref pointing to a user-provided route module
 * that exports defineRoute(). The caller should detect this and
 * delegate to the standard file-based rendering pipeline.
 *
 * @returns null — signals the caller to use the standard render path
 */
export function isCustomPage(declaration: PageDeclaration): boolean {
  return declaration.type === 'custom';
}
```

In the renderer (Phase 9), custom pages are handled by dynamically importing
the handler ref module and rendering it via the existing `render()` path.
No Snapshot component mapping needed.

### Exit Criteria

- Custom pages are identified and handled separately from entity pages
- No component mapping attempted for custom pages

---

## Phase 9: `renderPage()` on `createReactRenderer`

### Goal

Implement the `renderPage()` method on the React renderer returned by
`createReactRenderer()`. This is the method that bunshot-ssr calls when
a page declaration match is found.

### Implementation

In `src/ssr/renderer.ts`, add `renderPage` to the returned object
(after `renderChain`, after line ~1051):

```ts
async renderPage(
  result: PageLoaderResult,
  shell: SsrShellShape,
  bsCtx: unknown,
): Promise<Response> {
  // Custom pages: delegate to standard render path
  if (isCustomPage(result.declaration.declaration)) {
    // Resolve the handler ref module
    const handlerRef = (result.declaration.declaration as CustomPageDeclaration).handler;
    // Dynamic import the module
    const mod = await import(/* @vite-ignore */ handlerRef.handler);
    const routeMatch: ServerRouteMatchShape = {
      filePath: handlerRef.handler,
      metaFilePath: null,
      params: Object.freeze(result.declaration.params ?? {}),
      query: Object.freeze({}),
      url: new URL('http://localhost'),
      loadingFilePath: null,
      errorFilePath: null,
      notFoundFilePath: null,
      forbiddenFilePath: null,
      unauthorizedFilePath: null,
      templateFilePath: null,
    };
    // Use existing render path
    return this.render(routeMatch, shell, bsCtx);
  }

  // Map page declaration to Snapshot manifest components
  const mapResult = mapPageDeclaration(result);

  // Build navigation config
  const navigation = result.navigation
    ? mapNavigation(result.navigation)
    : undefined;
  const appConfig = result.navigation
    ? mapAppConfig(result.navigation)
    : undefined;

  // Build a minimal ManifestConfig with a single route
  const manifestConfig: ManifestConfig = {
    app: appConfig,
    navigation,
    routes: [{
      id: result.declaration.key,
      path: result.declaration.declaration.path,
      ...mapResult.page,
    }],
    resources: mapResult.resources,
    state: mapResult.state,
  };

  // Compile the manifest
  const compiled = compileManifest(manifestConfig);

  // Resolve the current route
  const currentRoute = compiled.routes[0];
  if (!currentRoute) {
    throw new Error(`Failed to compile entity page route for "${result.declaration.key}"`);
  }

  // Build the React element tree
  const queryClient = new QueryClient();

  const element = createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(
      ManifestRuntimeProvider,
      { manifest: compiled },
      createElement(
        AppContextProvider,
        {
          globals: {},
          resources: compiled.resources ?? {},
          api: null, // SSR — no client-side API needed for initial render
        },
        createElement(
          PageContextProvider,
          { routeId: currentRoute.id },
          result.navigation
            ? createElement(AppShellWrapper, {
                navigation,
                appConfig,
                content: createElement(PageRenderer, {
                  page: currentRoute.page,
                  routeId: currentRoute.id,
                  state: compiled.state,
                  resources: compiled.resources,
                }),
              })
            : createElement(PageRenderer, {
                page: currentRoute.page,
                routeId: currentRoute.id,
                state: compiled.state,
                resources: compiled.resources,
              }),
        ),
      ),
    ),
  );

  // Use existing renderPage utility
  const context: SsrRequestContext = {
    queryClient,
    match: {
      filePath: `__page:${result.declaration.key}`,
      metaFilePath: null,
      params: {},
      query: {},
      url: new URL('http://localhost'),
    },
  };

  const response = await renderPage(element, context, shell, config.renderTimeoutMs);

  // Apply ISR headers
  if (result.revalidate != null) {
    response.headers.set('X-Bunshot-Revalidate', String(result.revalidate));
  }
  if (result.tags?.length) {
    response.headers.set('X-Bunshot-Tags', result.tags.join(','));
  }

  // Apply meta to head
  if (result.meta.title) {
    // Head tags are injected via shell.headTags — the title from meta
    // is already resolved by the loader and included in shell
  }

  return response;
},
```

### AppShellWrapper Component

New file: `src/ui/entity-pages/AppShellWrapper.tsx`

A thin wrapper that renders the app shell (sidebar/top-nav) around page
content during SSR. Reuses Snapshot's existing `Nav` component.

```tsx
'use client';

import { Nav } from '../manifest/nav';

export interface AppShellWrapperProps {
  navigation: SnapshotNavigationConfig | undefined;
  appConfig: Record<string, unknown> | undefined;
  content: React.ReactElement;
}

export function AppShellWrapper({ navigation, appConfig, content }: AppShellWrapperProps) {
  if (!navigation) return content;

  const isSidebar = navigation.mode === 'sidebar';

  return (
    <div className="sn-app-shell" data-layout={navigation.mode}>
      {isSidebar && (
        <aside className="sn-sidebar">
          {appConfig?.title && (
            <div className="sn-sidebar-header">
              <h1 className="sn-app-title">{String(appConfig.title)}</h1>
            </div>
          )}
          <Nav items={navigation.items} mode="sidebar" />
        </aside>
      )}
      {!isSidebar && (
        <header className="sn-top-nav">
          {appConfig?.title && <span className="sn-app-title">{String(appConfig.title)}</span>}
          <Nav items={navigation.items} mode="top-nav" />
        </header>
      )}
      <main className="sn-main-content">
        {content}
      </main>
    </div>
  );
}
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/ssr/renderer.ts` | **Modify** — add `renderPage()` method |
| `src/ui/entity-pages/AppShellWrapper.tsx` | **Create** — app shell wrapper for SSR |

### Exit Criteria

- `renderPage()` produces valid HTML response
- Entity pages render via Snapshot's `PageRenderer` + `ComponentRenderer`
- Custom pages fall through to standard `render()` path
- Navigation renders as sidebar or top-nav
- ISR headers (`X-Bunshot-Revalidate`, `X-Bunshot-Tags`) set on response
- Pre-fetched data available to components via state
- Theme tokens applied

### Tests

File: `src/ssr/__tests__/render-page.test.ts`

Test cases:
- `renderPage()` returns HTML response for entity-list page
- `renderPage()` returns HTML response for entity-detail page
- `renderPage()` returns HTML response for entity-form page
- `renderPage()` returns HTML response for entity-dashboard page
- `renderPage()` delegates custom pages to `render()`
- Navigation renders as sidebar when shell is 'sidebar'
- Navigation renders as top-nav when shell is 'top-nav'
- No navigation rendered when shell is 'none'
- ISR revalidate header set when `revalidate` present
- ISR tags header set when `tags` present
- Pre-fetched data accessible in rendered HTML

---

## Phase 10: `renderPage()` on `createManifestRenderer`

### Goal

Implement `renderPage()` on the manifest renderer. This is used when the
app is already in manifest mode (Snapshot's `ManifestApp` is the app shell)
and entity pages are additional routes within it.

### Implementation

In `src/ssr/manifest-renderer.ts`, add `renderPage` to the returned object:

```ts
async renderPage(
  result: PageLoaderResult,
  shell: SsrShellShape,
  bsCtx: unknown,
): Promise<Response> {
  // Custom pages are not supported in manifest renderer mode
  if (isCustomPage(result.declaration.declaration)) {
    throw new Error(
      'Custom page declarations are not supported with createManifestRenderer(). ' +
      'Use createReactRenderer() for handler ref support.',
    );
  }

  // Map to Snapshot page config
  const mapResult = mapPageDeclaration(result);

  // Merge into the existing compiled manifest as an additional route
  const routeId = `entity-page:${result.declaration.key}`;
  const additionalRoute: CompiledRoute = {
    id: routeId,
    path: result.declaration.declaration.path,
    page: mapResult.page,
  };

  // Merge resources and state
  const mergedResources = { ...compiledManifest.resources, ...mapResult.resources };
  const mergedState = { ...compiledManifest.state, ...mapResult.state };

  // Render using the existing manifest render pipeline
  const queryClient = new QueryClient();

  const element = createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(ManifestApp, {
      manifest: {
        ...compiledManifest.raw,
        routes: [
          ...compiledManifest.raw.routes,
          {
            id: routeId,
            path: result.declaration.declaration.path,
            ...mapResult.page,
          },
        ],
        resources: mergedResources,
        state: mergedState,
      },
      apiUrl: '', // SSR — resolved server-side
    }),
  );

  const context: SsrRequestContext = {
    queryClient,
    match: {
      filePath: `manifest:${routeId}`,
      metaFilePath: null,
      params: {},
      query: {},
      url: new URL('http://localhost'),
    },
  };

  const response = await renderPage(element, context, shell, undefined, rscOptions);

  if (result.revalidate != null) {
    response.headers.set('X-Bunshot-Revalidate', String(result.revalidate));
  }
  if (result.tags?.length) {
    response.headers.set('X-Bunshot-Tags', result.tags.join(','));
  }

  return response;
},
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/ssr/manifest-renderer.ts` | **Modify** — add `renderPage()` method |

### Exit Criteria

- Manifest renderer's `renderPage()` merges entity page into existing manifest
- Entity pages render within the existing ManifestApp shell
- Throws clear error for custom pages (not supported in manifest mode)
- ISR headers applied

---

## Phase 11: Tests

### Goal

Comprehensive test coverage across all mappers and the renderer integration.

### Test Files Summary

| File | Phase | Test Count |
|------|-------|------------|
| `src/ui/entity-pages/__tests__/field-mappers.test.ts` | 2 | 15 |
| `src/ui/entity-pages/__tests__/list-mapper.test.ts` | 3 | 12 |
| `src/ui/entity-pages/__tests__/detail-mapper.test.ts` | 4 | 17 |
| `src/ui/entity-pages/__tests__/form-mapper.test.ts` | 5 | 14 |
| `src/ui/entity-pages/__tests__/dashboard-mapper.test.ts` | 6 | 9 |
| `src/ui/entity-pages/__tests__/navigation-mapper.test.ts` | 7 | 8 |
| `src/ssr/__tests__/render-page.test.ts` | 9 | 11 |

**Total: ~86 test cases**

### Test Fixtures

Create shared test fixtures at `src/ui/entity-pages/__tests__/fixtures.ts`:

```ts
import type { PageLoaderResult, EntityMeta, EntityFieldMeta } from '@lastshotlabs/bunshot-ssr';

export const postEntityMeta: EntityMeta = {
  name: 'Post',
  fields: {
    id: { name: 'id', type: 'string', optional: false, primary: true, immutable: true },
    title: { name: 'title', type: 'string', optional: false, primary: false, immutable: false },
    slug: { name: 'slug', type: 'string', optional: false, primary: false, immutable: false },
    body: { name: 'body', type: 'string', optional: false, primary: false, immutable: false },
    status: { name: 'status', type: 'enum', optional: false, primary: false, immutable: false, enumValues: ['draft', 'published', 'archived'] },
    viewCount: { name: 'viewCount', type: 'integer', optional: true, primary: false, immutable: false },
    tags: { name: 'tags', type: 'string[]', optional: true, primary: false, immutable: false },
    metadata: { name: 'metadata', type: 'json', optional: true, primary: false, immutable: false },
    featured: { name: 'featured', type: 'boolean', optional: false, primary: false, immutable: false },
    createdAt: { name: 'createdAt', type: 'date', optional: false, primary: false, immutable: true },
  },
};

export const samplePosts = [
  { id: '1', title: 'First Post', slug: 'first-post', body: 'Content...', status: 'published', viewCount: 42, tags: ['intro'], featured: true, createdAt: '2026-04-01T00:00:00Z' },
  { id: '2', title: 'Second Post', slug: 'second-post', body: 'More...', status: 'draft', viewCount: 0, tags: [], featured: false, createdAt: '2026-04-02T00:00:00Z' },
];

export function buildListResult(overrides?: Partial<PageLoaderResult>): PageLoaderResult {
  // ... builds a complete PageLoaderResult for entity-list
}

export function buildDetailResult(overrides?: Partial<PageLoaderResult>): PageLoaderResult {
  // ... builds a complete PageLoaderResult for entity-detail
}

// etc.
```

---

## Phase 12: Documentation

### Goal

Document the renderer-side entity page implementation in snapshot's docs.

### New Pages

**`docs/ssr/entity-pages.md`:**

- Overview: how Snapshot renders bunshot's entity page declarations
- Architecture: PageLoaderResult → mapPageDeclaration() → PageConfig → PageRenderer
- Component mapping tables:
  - entity-list → heading + filter-bar + data-table
  - entity-detail → heading + detail-card sections + related tables
  - entity-form → heading + AutoForm
  - entity-dashboard → heading + stat-cards + chart + feed
- Field type mapping tables (3 tables: display, input, column)
- How pre-fetched data flows through Snapshot state
- Navigation rendering (sidebar vs top-nav)
- Client-side interactivity: pagination, form submit, delete actions
- Custom page fallback to handler ref
- Theming: design tokens apply to all entity pages
- Customization: registering custom component overrides
- Relationship to existing Snapshot manifest system

### Existing Pages to Update

- `docs/components.md` — Note that `data-table`, `detail-card`, `form`,
  `stat-card`, `chart`, `filter-bar`, `feed` are used by entity page rendering
- `docs/getting-started.md` — Add entity-driven pages as a path:
  "Define entities in bunshot, get rendered pages automatically"

### JSDoc Requirements

- All functions in `mapper.ts`, `field-mappers.ts`, `utils.ts`
- All per-type mapper functions
- `mapNavigation()`, `mapAppConfig()`
- `AppShellWrapper` component
- `EntityPageMapResult` type
- `FieldDisplayConfig`, `FieldInputConfig`, `FieldColumnConfig` types

### Files to Create/Modify

| File | Action |
|------|--------|
| `docs/ssr/entity-pages.md` | **Create** — renderer-side entity pages docs |
| `docs/components.md` | **Modify** — note entity page usage |
| `docs/getting-started.md` | **Modify** — add entity-driven pages path |

---

## Parallelization & Sequencing

### Track Overview

```
Track A (Mappers)                Track B (Renderers)         Track C (Tests+Docs)
─────────────────                ───────────────────         ────────────────────
Phase 1 (infrastructure)
Phase 2 (field mappers)
Phase 3 (list mapper)
Phase 4 (detail mapper)          
Phase 5 (form mapper)           
Phase 6 (dashboard mapper)      Phase 9 (react renderer)    
Phase 7 (navigation mapper)     Phase 10 (manifest renderer) Phase 11 (tests)
Phase 8 (custom page)                                        Phase 12 (docs)
```

### Dependencies

| Phase | Depends On | Why |
|-------|------------|-----|
| Phase 1 | bunshot Phase 5 | Needs `PageLoaderResult` types published |
| Phase 2 | bunshot Phase 5 | Needs `EntityFieldMeta` type |
| Phase 3 | Phases 1, 2 | Needs mapper infrastructure + field mappers |
| Phase 4 | Phases 1, 2 | Needs mapper infrastructure + field mappers |
| Phase 5 | Phases 1, 2 | Needs mapper infrastructure + field mappers |
| Phase 6 | Phases 1, 2 | Needs mapper infrastructure |
| Phase 7 | Phase 1 | Needs mapper infrastructure |
| Phase 8 | Phase 1 | Needs mapper infrastructure |
| Phase 9 | Phases 3-8 | Needs all mappers |
| Phase 10 | Phases 3-8 | Needs all mappers |
| Phase 11 | Phases 1-10 | Tests everything |
| Phase 12 | Phases 1-10 | Documents everything |

### File Ownership

All files in the `snapshot` repo. No bunshot files are modified.

**Track A owns:**
- `src/ui/entity-pages/mapper.ts`
- `src/ui/entity-pages/index.ts`
- `src/ui/entity-pages/utils.ts`
- `src/ui/entity-pages/field-mappers.ts`
- `src/ui/entity-pages/list-mapper.ts`
- `src/ui/entity-pages/detail-mapper.ts`
- `src/ui/entity-pages/form-mapper.ts`
- `src/ui/entity-pages/dashboard-mapper.ts`
- `src/ui/entity-pages/navigation-mapper.ts`
- `src/ui/entity-pages/AppShellWrapper.tsx`

**Track B owns:**
- `src/ssr/renderer.ts` (`renderPage` method only)
- `src/ssr/manifest-renderer.ts` (`renderPage` method only)

**Track C owns:**
- `src/ui/entity-pages/__tests__/` (all test files)
- `src/ssr/__tests__/render-page.test.ts`
- `docs/ssr/entity-pages.md`
- `docs/components.md` (entity page section only)
- `docs/getting-started.md` (entity-driven pages path only)

### Branch Strategy

```
main
  └── feature/entity-page-renderer
        ├── track-a/mappers         (Phases 1-8)
        ├── track-b/renderers       (Phases 9-10)
        └── track-c/tests-docs      (Phases 11-12)
```

Merge order: A → B → C.

### Agent Execution Checklist

1. Read `CLAUDE.md` (snapshot repo)
2. Read this spec fully
3. Read the bunshot companion spec (Phases 1-5 for type definitions)
4. Pick your track
5. Implement phase by phase
6. After each phase:
   - Run `bun run typecheck`
   - Run `bun run format:check`
   - Run tests for the phase
   - Verify JSDoc on all new exports
   - Commit
7. After all phases:
   - Run `bun run build`
   - Run `bun test`
   - Push branch

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck
bun run format:check
```

### Per-Track Checks

- Zero `any` casts in new files
- All new exports have JSDoc
- No imports from bunshot internals (only `@lastshotlabs/bunshot-ssr` public types)
- All component configs use existing registered component types (no new components)
- All actions use the fixed action vocabulary (10 types)
- All styles use `var(--sn-*)` tokens
- SSR-safe: no browser APIs in render body

### Documentation Checks

- `docs/ssr/entity-pages.md` covers all page types with mapping tables
- `docs/components.md` notes entity page usage
- `docs/getting-started.md` mentions entity-driven pages

### Full Completion Checks

```sh
bun run typecheck
bun run format:check
bun run build
bun test
```

- `renderPage()` produces valid HTML for all 4 entity page types
- Navigation renders correctly in both sidebar and top-nav modes
- Pre-fetched data is accessible in rendered output
- ISR headers present on responses
- Custom pages delegate to standard render path
- All 86 test cases pass
