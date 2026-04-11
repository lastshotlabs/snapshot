# Phase H: Missing Components — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | H.1 | Chart Enhancement | Not started | Data |
> | H.2 | Feed Enhancement | Not started | Data |
> | H.3 | Wizard Enhancement | Not started | Forms |
> | H.4 | Command Palette Enhancement | Not started | Overlay |
> | H.5 | Toast with Undo | Not started | Overlay |
> | H.6 | Date Picker | Not started | Forms |
> | H.7 | Slider | Not started | Forms |
> | H.8 | Color Picker | Not started | Forms |
> | H.9 | Auto Skeleton Loading | Not started | Data |
> | H.10 | Auto Empty States | Not started | Data |
>
> **Priority:** P2 — extends the component library for production-complete applications.
> **Depends on:** Phase A (CSS Foundation), Phase D (Interactivity — actions, DnD), Phase E (State — expressions).
> **Blocks:** Nothing directly — components are additive.

---

## Vision

### Before (Today)

Snapshot has 76 registered components across 15 domain groups. Most cover CRUD scenarios
well. But production applications need richer variants and a few missing primitives:

1. **Chart is basic.** `src/ui/components/data/chart/` supports bar, line, pie, donut, and
   area variants. No sparkline, funnel, radar, treemap, or scatter. No click actions on
   chart elements. No aspect ratio control.
2. **Feed is basic.** `src/ui/components/data/feed/` renders a list of items with timestamps.
   No infinite scroll, no relative timestamps ("2 hours ago"), no per-item action menus,
   no date-based grouping.
3. **Wizard is basic.** `src/ui/components/forms/wizard/` renders multi-step forms with
   step navigation. No per-step validation (before advancing), no skip logic, no async
   validation, no step-specific actions.
4. **Command palette is basic.** `src/ui/components/overlay/command-palette/` renders a
   searchable command list. No Ctrl+K auto-registration from manifest shortcuts, no dynamic
   search endpoint for server-side results, no recent items.
5. **Toast has no undo.** `src/ui/actions/toast.ts` shows toast notifications. No `undo`
   action config for "Undo" button with timer-based revert.
6. **No date picker component.** Forms use native `<input type="date">`. No config-driven
   date picker with modes (single, range, multiple), presets, and min/max.
7. **No slider component.** No range input with min/max/step, dual-thumb range mode.
8. **No color picker component.** No color input with format selection, swatches, and custom
   color support.
9. **No auto-skeleton loading.** Data components show a spinner while loading. No automatic
   skeleton placeholder that mimics the component's shape.
10. **No auto-empty states.** Data components show a text message when empty. No config-driven
    empty state with icon, title, description, and action button.

### After (This Spec)

1. Chart supports sparkline, funnel, radar, treemap, scatter, click actions, aspect ratio.
2. Feed supports infinite scroll, relative timestamps, per-item actions, groupBy.
3. Wizard supports step validation, skip, async validation, step actions.
4. Command palette auto-registers shortcuts, supports dynamic search, recent items.
5. Toast supports undo action with timer.
6. Date picker component with single/range/multiple modes and presets.
7. Slider component with min/max/step and dual-thumb range.
8. Color picker component with format, swatches, and custom colors.
9. Data components auto-render skeleton loading states.
10. Data components auto-render empty states with icon, title, and action.

---

## What Already Exists on Main

### Chart Component

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/data/chart/schema.ts` | ~120 | `chartConfigSchema`: `variant` (bar, line, pie, donut, area), `data`, `xAxis`, `yAxis`, `legend`, `tooltip`. No sparkline/funnel/radar/treemap/scatter. No `onClick`. No `aspectRatio`. |
| `src/ui/components/data/chart/component.tsx` | ~300 | Renders charts using canvas or SVG. Supports 5 variants. |

### Feed Component

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/data/feed/schema.ts` | ~80 | `feedConfigSchema`: `items`, `timestamp`, `avatar`, `content`. No `infinite`, `groupBy`, `relativeTime`, per-item `actions`. |
| `src/ui/components/data/feed/component.tsx` | ~200 | Renders feed items chronologically. Absolute timestamps. |

### Wizard Component

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/forms/wizard/schema.ts` | ~100 | `wizardConfigSchema`: `steps` (label, content, icon), `orientation`. No `validate`, `skip`, `asyncValidate`, `actions` per step. |
| `src/ui/components/forms/wizard/component.tsx` | ~250 | Multi-step form with navigation. No validation before step advance. |

### Command Palette Component

| File | Lines | What Exists |
|---|---|---|
| `src/ui/components/overlay/command-palette/schema.ts` | ~70 | `commandPaletteConfigSchema`: `items` (label, action, icon, shortcut). Static items only. No `searchEndpoint`, no `recentItems`. |
| `src/ui/components/overlay/command-palette/component.tsx` | ~200 | Renders searchable command list. Client-side fuzzy filter. |

### Toast System

| File | Lines | What Exists |
|---|---|---|
| `src/ui/actions/toast.ts` | ~120 | `ToastContainer`, `useToastManager()`. Toast types: success, error, warning, info. Duration-based auto-dismiss. No `undo`. |

### Skeleton Component

| File | What |
|---|---|
| `src/ui/components/data/skeleton/` | Standalone skeleton component. Can be placed manually. Not auto-generated. |

### Empty State Component

| File | What |
|---|---|
| `src/ui/components/data/empty-state/` | Standalone empty-state component with icon, title, description. Not auto-generated from data component config. |

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
| `src/ui/components/data/chart/schema.ts` | Chart schema | ~120 |
| `src/ui/components/data/chart/component.tsx` | Chart component | ~300 |
| `src/ui/components/data/feed/schema.ts` | Feed schema | ~80 |
| `src/ui/components/data/feed/component.tsx` | Feed component | ~200 |
| `src/ui/components/forms/wizard/schema.ts` | Wizard schema | ~100 |
| `src/ui/components/forms/wizard/component.tsx` | Wizard component | ~250 |
| `src/ui/components/overlay/command-palette/schema.ts` | Command palette schema | ~70 |
| `src/ui/components/overlay/command-palette/component.tsx` | Command palette component | ~200 |
| `src/ui/actions/toast.ts` | Toast system | ~120 |
| `src/ui/components/data/skeleton/` | Skeleton component | ~60 |
| `src/ui/components/data/empty-state/` | Empty state component | ~80 |
| `src/ui/components/_base/use-component-data.ts` | Data fetching hook | ~200 |
| `src/ui/manifest/schema.ts` | All manifest schemas | ~1400 |

---

## Non-Negotiable Engineering Constraints

1. **Manifest-only** (Rule: Config-Driven UI #6) — all enhancements configurable from JSON.
2. **No `any`** (Rule: Code Patterns #3) — strict types on all new props and variants.
3. **SSR safe** (Rule: SSR #3) — no browser APIs in render body.
4. **Semantic tokens only** (Rule: Component #semantic) — all new UI uses `--sn-*` tokens. Verify every CSS variable against the canonical token list.
5. **Component file conventions** (Rule: Component File Conventions) — schema.ts, component.tsx, types.ts, index.ts, __tests__/.
6. **One code path** (Rule: Config-Driven UI #1) — enhance existing components, do not create parallel ones.
7. **Backwards compatible** — all new props optional, existing configs unchanged.
8. **Playground integration** — every new variant/component must have playground fixtures.

---

## Phase H.1: Chart Enhancement

### Goal

Add sparkline, funnel, radar, treemap, and scatter chart variants. Add `onClick` action
on chart elements and `aspectRatio` control.

### Types

Extend `src/ui/components/data/chart/schema.ts`:

```ts
export const chartConfigSchema = z.object({
  // ... existing ...
  /**
   * Chart variant.
   * Existing: bar, line, pie, donut, area.
   * New: sparkline, funnel, radar, treemap, scatter.
   */
  variant: z.enum([
    "bar", "line", "pie", "donut", "area",
    "sparkline", "funnel", "radar", "treemap", "scatter",
  ]),
  /**
   * Aspect ratio for the chart container. e.g. "16/9", "4/3", "1/1".
   * Controls the chart's proportions. Default varies by variant.
   */
  aspectRatio: z.string().optional(),
  /**
   * Action to execute when a chart element is clicked.
   * Context: { value, label, index, dataPoint }
   */
  onClick: actionConfigSchema.optional(),
});
```

### Implementation

**1. Add variant renderers:**

Each new variant gets a render function in the chart component:

```ts
// src/ui/components/data/chart/variants/sparkline.tsx
/**
 * Sparkline — minimal inline chart, no axes, no labels.
 * Designed for compact display (e.g., inside a stat-card).
 */
export function renderSparkline(data: ChartData, config: ChartConfig): ReactNode {
  // SVG path from data points, no axes/legend
  // Uses --sn-color-primary for the line
}

// src/ui/components/data/chart/variants/funnel.tsx
/**
 * Funnel chart — shows progressive narrowing stages.
 */
export function renderFunnel(data: ChartData, config: ChartConfig): ReactNode {
  // Horizontal bars decreasing in width
}

// src/ui/components/data/chart/variants/radar.tsx
/**
 * Radar/spider chart — multivariate data on radial axes.
 */
export function renderRadar(data: ChartData, config: ChartConfig): ReactNode {
  // Polygon on radial grid
}

// src/ui/components/data/chart/variants/treemap.tsx
/**
 * Treemap — nested rectangles proportional to value.
 */
export function renderTreemap(data: ChartData, config: ChartConfig): ReactNode {
  // Squarified treemap layout
}

// src/ui/components/data/chart/variants/scatter.tsx
/**
 * Scatter plot — x/y coordinate points.
 */
export function renderScatter(data: ChartData, config: ChartConfig): ReactNode {
  // Dots on x/y axes
}
```

**2. Add click handler:**

```tsx
// In chart component:
const handleElementClick = useCallback((dataPoint: unknown, index: number) => {
  if (!config.onClick) return;
  executeAction(config.onClick, {
    value: dataPoint,
    index,
    label: labels[index],
    dataPoint,
  });
}, [config.onClick, executeAction]);
```

**3. Add aspect ratio:**

```tsx
<div
  data-snapshot-component="chart"
  style={{
    aspectRatio: config.aspectRatio ?? getDefaultAspectRatio(config.variant),
    width: "100%",
  }}
>
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/data/chart/variants/sparkline.tsx` |
| Create | `src/ui/components/data/chart/variants/funnel.tsx` |
| Create | `src/ui/components/data/chart/variants/radar.tsx` |
| Create | `src/ui/components/data/chart/variants/treemap.tsx` |
| Create | `src/ui/components/data/chart/variants/scatter.tsx` |
| Modify | `src/ui/components/data/chart/schema.ts` — add variants, aspectRatio, onClick |
| Modify | `src/ui/components/data/chart/component.tsx` — route to variant renderers, click handler, aspect ratio |
| Modify | `src/ui/components/data/chart/types.ts` — updated types |

### Playground Integration

Each new variant gets a fixture in the playground:
- Sparkline with random data, small container.
- Funnel with conversion data (5 stages).
- Radar with 6-axis skill data.
- Treemap with file-size-like hierarchical data.
- Scatter with random x/y points.
- Click action on bar chart logging data point.

### Tests

| File | What |
|---|---|
| `src/ui/components/data/chart/__tests__/schema.test.ts` | Add: each new variant accepted, aspectRatio accepted, onClick accepted. |
| `src/ui/components/data/chart/__tests__/component.test.tsx` | Add: sparkline renders SVG, onClick fires action with data context. |

### Exit Criteria

- [ ] `{ "variant": "sparkline" }` renders a compact inline chart.
- [ ] `{ "variant": "funnel" }` renders a funnel chart.
- [ ] `{ "variant": "radar" }` renders a radar chart.
- [ ] `{ "variant": "treemap" }` renders a treemap.
- [ ] `{ "variant": "scatter" }` renders a scatter plot.
- [ ] `{ "onClick": { "type": "navigate", "to": "/detail/{label}" } }` fires on click.
- [ ] `{ "aspectRatio": "16/9" }` sets chart container proportions.
- [ ] Existing variants (bar, line, pie, donut, area) unchanged.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.2: Feed Enhancement

### Goal

Add infinite scroll, relative timestamps, per-item actions, and date-based grouping
to the feed component.

### Types

Extend `src/ui/components/data/feed/schema.ts`:

```ts
export const feedConfigSchema = z.object({
  // ... existing ...
  /**
   * Enable infinite scroll. When true, loads more items as user scrolls.
   * Uses the IntersectionObserver sentinel from Phase D.3.
   */
  infinite: z.boolean().optional(),
  /**
   * Display timestamps as relative ("2 hours ago") instead of absolute.
   * Updates periodically.
   */
  relativeTime: z.boolean().default(false),
  /**
   * Per-item action menu items. Renders a "..." button on each feed item.
   * Context: { item }
   */
  itemActions: z.array(z.object({
    label: z.string(),
    icon: z.string().optional(),
    action: actionConfigSchema,
    variant: z.enum(["default", "destructive"]).optional(),
  })).optional(),
  /**
   * Group feed items by date. Shows date headers between groups.
   * Uses the timestamp field for grouping.
   */
  groupBy: z.enum(["date", "week", "month"]).optional(),
});
```

### Implementation

**1. Create `src/ui/components/data/feed/relative-time.ts`:**

```ts
/**
 * Format a timestamp as a relative time string.
 * Uses Intl.RelativeTimeFormat where available, falls back to manual formatting.
 */
export function formatRelativeTime(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 604800)}w ago`;

  return date.toLocaleDateString();
}

/**
 * Group items by date period.
 */
export function groupByDate(
  items: Array<{ timestamp: string | number }>,
  period: "date" | "week" | "month",
): Map<string, typeof items> {
  const groups = new Map<string, typeof items>();

  for (const item of items) {
    const date = new Date(item.timestamp);
    let key: string;

    switch (period) {
      case "date":
        key = date.toLocaleDateString();
        break;
      case "week":
        // ISO week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Week of ${weekStart.toLocaleDateString()}`;
        break;
      case "month":
        key = date.toLocaleDateString(undefined, { year: "numeric", month: "long" });
        break;
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  return groups;
}
```

**2. Update feed component** to use `useInfiniteScroll` (from D.3) when `infinite` is set,
render relative timestamps, show per-item action menus, and group items by date.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/data/feed/relative-time.ts` |
| Modify | `src/ui/components/data/feed/schema.ts` — add infinite, relativeTime, itemActions, groupBy |
| Modify | `src/ui/components/data/feed/component.tsx` — all enhancements |
| Modify | `src/ui/components/data/feed/types.ts` — updated types |

### Playground Integration

- Feed with relative timestamps + date grouping.
- Feed with infinite scroll (50+ items).
- Feed with per-item action menus (edit, delete, share).

### Tests

| File | What |
|---|---|
| `src/ui/components/data/feed/__tests__/relative-time.test.ts` (create) | Tests: just now, minutes, hours, days, weeks, groupByDate, groupByMonth. |
| `src/ui/components/data/feed/__tests__/schema.test.ts` | Add: all new props accepted. |

### Exit Criteria

- [ ] `{ "infinite": true }` loads more feed items on scroll.
- [ ] `{ "relativeTime": true }` shows "2 hours ago" instead of "2026-04-11 10:30".
- [ ] `{ "itemActions": [...] }` shows "..." menu on each item.
- [ ] `{ "groupBy": "date" }` groups items under date headers.
- [ ] Existing feed behavior unchanged.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.3: Wizard Enhancement

### Goal

Add per-step validation (block advance if invalid), skip logic, async validation,
and per-step actions to the wizard component.

### Types

Extend `src/ui/components/forms/wizard/schema.ts`:

```ts
export const wizardStepSchema = z.object({
  // ... existing label, content, icon ...
  /**
   * Validation rules for this step. Checked before advancing.
   * If any rule fails, the user cannot proceed.
   */
  validate: z.array(z.object({
    /** Field name to validate. */
    field: z.string(),
    /** Validation rule (same as Phase D.5 fieldValidationSchema). */
    rule: fieldValidationSchema,
  })).optional(),
  /**
   * Whether this step can be skipped.
   * Can be boolean or a condition expression.
   */
  skip: z.union([z.boolean(), z.object({ expr: z.string() })]).optional(),
  /**
   * Async validation endpoint. Called before advancing.
   * Must return { valid: boolean, errors?: Record<string, string> }.
   */
  asyncValidate: z.object({
    endpoint: endpointTargetSchema,
    /** Request body. Form values available as context. */
    body: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
  /**
   * Actions to execute when entering this step.
   */
  onEnter: z.union([actionConfigSchema, z.array(actionConfigSchema)]).optional(),
  /**
   * Actions to execute when leaving this step (before validation).
   */
  onLeave: z.union([actionConfigSchema, z.array(actionConfigSchema)]).optional(),
});
```

### Implementation

**1. Update wizard component:**

```tsx
// Before advancing to next step:
async function handleNext() {
  const step = config.steps[currentStep];

  // Run onLeave actions
  if (step.onLeave) {
    await executeActions(step.onLeave);
  }

  // Sync validation
  if (step.validate) {
    const errors = validateStepFields(step.validate, formValues);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return; // Block advancement
    }
  }

  // Async validation
  if (step.asyncValidate) {
    setValidating(true);
    const result = await callEndpoint(step.asyncValidate.endpoint, {
      body: resolveBody(step.asyncValidate.body, formValues),
    });
    setValidating(false);
    if (!result.valid) {
      setStepErrors(result.errors ?? {});
      return;
    }
  }

  // Skip logic — find next non-skipped step
  let nextStep = currentStep + 1;
  while (nextStep < config.steps.length) {
    const next = config.steps[nextStep];
    if (next.skip === true) {
      nextStep++;
      continue;
    }
    if (typeof next.skip === "object" && next.skip.expr) {
      const shouldSkip = evaluateExpression(next.skip.expr, formValues);
      if (shouldSkip) {
        nextStep++;
        continue;
      }
    }
    break;
  }

  setCurrentStep(nextStep);

  // Run onEnter for new step
  const entering = config.steps[nextStep];
  if (entering?.onEnter) {
    await executeActions(entering.onEnter);
  }
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/components/forms/wizard/schema.ts` — add validate, skip, asyncValidate, onEnter, onLeave |
| Modify | `src/ui/components/forms/wizard/component.tsx` — validation, skip, async, step actions |
| Modify | `src/ui/components/forms/wizard/types.ts` — updated types |

### Tests

| File | What |
|---|---|
| `src/ui/components/forms/wizard/__tests__/schema.test.ts` | Add: validate, skip, asyncValidate, onEnter, onLeave accepted. |
| `src/ui/components/forms/wizard/__tests__/component.test.tsx` | Add: blocks advance on validation failure, skips step, async validation loading state. |

### Exit Criteria

- [ ] `{ "validate": [{ "field": "email", "rule": { "required": true } }] }` blocks advance when email is empty.
- [ ] `{ "skip": true }` skips the step entirely.
- [ ] `{ "skip": { "expr": "plan == 'free'" } }` conditionally skips.
- [ ] `{ "asyncValidate": { "endpoint": "POST /api/validate-step" } }` calls endpoint before advancing.
- [ ] `{ "onEnter": { "type": "api", ... } }` fires when entering a step.
- [ ] Validation errors display inline on the step's fields.
- [ ] Existing wizard behavior unchanged.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.4: Command Palette Enhancement

### Goal

Auto-register manifest shortcuts in the command palette. Add dynamic search endpoint
for server-side results. Add recent items.

### Types

Extend `src/ui/components/overlay/command-palette/schema.ts`:

```ts
export const commandPaletteConfigSchema = z.object({
  // ... existing items ...
  /**
   * Auto-register manifest.shortcuts as commands.
   * When true, all shortcuts with a `label` appear in the palette.
   */
  autoRegisterShortcuts: z.boolean().default(true),
  /**
   * Dynamic search endpoint. Called with the search query.
   * Must return { items: CommandItem[] }.
   */
  searchEndpoint: z.object({
    endpoint: endpointTargetSchema,
    /** Debounce search requests by N ms. Default: 300. */
    debounce: z.number().int().positive().default(300),
    /** Minimum query length before searching. Default: 2. */
    minLength: z.number().int().nonnegative().default(2),
  }).optional(),
  /**
   * Show recent items at the top of the palette.
   * Persists to localStorage.
   */
  recentItems: z.object({
    enabled: z.boolean().default(false),
    /** Maximum number of recent items to show. Default: 5. */
    maxItems: z.number().int().positive().default(5),
  }).optional(),
  /**
   * Keyboard shortcut to open the palette. Default: "ctrl+k".
   */
  shortcut: z.string().default("ctrl+k"),
});
```

### Implementation

**1. Auto-register shortcuts:**

In the command palette component, read the manifest shortcuts config and convert labeled
shortcuts into command items:

```ts
const shortcutCommands = useMemo(() => {
  if (!config.autoRegisterShortcuts || !manifestShortcuts) return [];
  return Object.entries(manifestShortcuts)
    .filter(([_, cfg]) => cfg.label)
    .map(([key, cfg]) => ({
      label: cfg.label!,
      shortcut: key,
      action: cfg.action,
      group: "Shortcuts",
    }));
}, [config.autoRegisterShortcuts, manifestShortcuts]);
```

**2. Dynamic search:**

```ts
const [searchResults, setSearchResults] = useState<CommandItem[]>([]);
const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    if (query.length < (config.searchEndpoint?.minLength ?? 2)) {
      setSearchResults([]);
      return;
    }
    const response = await api.get(config.searchEndpoint!.endpoint, { params: { q: query } });
    setSearchResults(response.items);
  }, config.searchEndpoint?.debounce ?? 300),
  [config.searchEndpoint],
);
```

**3. Recent items:**

Store recently executed commands in localStorage under `sn-recent-commands`. Show at the
top of the palette under a "Recent" group header.

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/components/overlay/command-palette/schema.ts` — add autoRegisterShortcuts, searchEndpoint, recentItems, shortcut |
| Modify | `src/ui/components/overlay/command-palette/component.tsx` — auto-register, dynamic search, recent items |
| Modify | `src/ui/components/overlay/command-palette/types.ts` — updated types |

### Tests

| File | What |
|---|---|
| `src/ui/components/overlay/command-palette/__tests__/schema.test.ts` | Add: all new props accepted. |
| `src/ui/components/overlay/command-palette/__tests__/component.test.tsx` | Add: shortcuts appear as commands, search endpoint called with debounce, recent items persist. |

### Exit Criteria

- [ ] Manifest shortcuts with `label` auto-appear in the command palette.
- [ ] `{ "searchEndpoint": { "endpoint": "GET /api/search" } }` fetches results on type.
- [ ] Search debounces by configured ms.
- [ ] `{ "recentItems": { "enabled": true } }` shows recently used commands.
- [ ] `{ "shortcut": "ctrl+k" }` opens the palette on Ctrl+K.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.5: Toast with Undo

### Goal

Add `undo` action config to toast notifications. Shows an "Undo" button with a countdown
timer. Clicking undo executes the revert action and cancels the original.

### Types

Extend the toast action config in `src/ui/actions/types.ts`:

```ts
export interface ToastAction {
  type: "toast";
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
  /**
   * Undo configuration. Shows an "Undo" button in the toast.
   * If clicked within the duration, the undo action executes
   * and the original action chain is cancelled.
   */
  undo: z.object({
    /** Label for the undo button. Default: "Undo". */
    label: z.string().default("Undo"),
    /** Action to execute when undo is clicked. */
    action: actionConfigSchema,
    /** Undo window in ms. Default: 5000. */
    duration: z.number().int().positive().default(5000),
  }).optional(),
}
```

### Implementation

**1. Update `src/ui/actions/toast.ts`:**

```tsx
// In ToastItem component:
function ToastItem({ toast, onDismiss, executeAction }: ToastItemProps) {
  const [undoTimer, setUndoTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!toast.undo) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const remaining = toast.undo!.duration - (Date.now() - start);
      if (remaining <= 0) {
        clearInterval(timer);
        onDismiss(toast.id);
      } else {
        setUndoTimer(Math.ceil(remaining / 1000));
      }
    }, 100);
    return () => clearInterval(timer);
  }, [toast.undo]);

  const handleUndo = useCallback(() => {
    executeAction(toast.undo!.action);
    onDismiss(toast.id);
  }, [toast.undo, executeAction]);

  return (
    <div data-snapshot-toast="" data-variant={toast.variant}>
      <span>{toast.message}</span>
      {toast.undo && (
        <button
          onClick={handleUndo}
          style={{
            color: "var(--sn-color-primary)",
            fontWeight: "var(--sn-font-weight-medium, 500)",
          }}
        >
          {toast.undo.label ?? "Undo"} {undoTimer !== null ? `(${undoTimer}s)` : ""}
        </button>
      )}
    </div>
  );
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/actions/types.ts` — add `undo` to `ToastAction` |
| Modify | `src/ui/actions/toast.ts` — undo button, timer, revert logic |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/toast.test.ts` | Add: undo button renders, clicking undo fires revert action, undo timer counts down, toast without undo unchanged. |

### Exit Criteria

- [ ] `{ "undo": { "action": { "type": "api", "method": "POST", "endpoint": "/api/restore" } } }` shows Undo button.
- [ ] Clicking Undo executes the revert action.
- [ ] Timer countdown shows remaining seconds.
- [ ] Toast without `undo` behaves as before.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.6: Date Picker

### Goal

Create a new `date-picker` component. Modes: single, range, multiple. Supports presets,
min/max dates, and disabled dates.

### Types

```ts
/**
 * Date picker component configuration.
 */
export const datePickerConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("date-picker"),
  /** Selection mode. */
  mode: z.enum(["single", "range", "multiple"]).default("single"),
  /** Input label. */
  label: z.string().optional(),
  /** Placeholder text. */
  placeholder: z.string().optional(),
  /** Minimum selectable date (ISO string). */
  min: z.string().optional(),
  /** Maximum selectable date (ISO string). */
  max: z.string().optional(),
  /** Disabled date patterns. */
  disabledDates: z.array(z.union([
    z.string(), // ISO date string
    z.object({ dayOfWeek: z.array(z.number().int().min(0).max(6)) }), // e.g. weekends
  ])).optional(),
  /** Preset date ranges for quick selection. */
  presets: z.array(z.object({
    label: z.string(),
    /** Start date expression or literal. */
    start: z.string(),
    /** End date expression or literal. */
    end: z.string(),
  })).optional(),
  /** Date display format. Default: locale default. */
  format: z.string().optional(),
  /** Published value format. Default: ISO string. */
  valueFormat: z.enum(["iso", "unix", "locale"]).default("iso"),
  /** Action to execute on date change. */
  onChange: actionConfigSchema.optional(),
});
```

### Implementation

Create the component following the standard structure:

```
src/ui/components/forms/date-picker/
  schema.ts
  component.tsx
  types.ts
  index.ts
  __tests__/
    schema.test.ts
    component.test.tsx
```

The component renders a calendar grid using CSS Grid. No external date library required.
Uses `Intl.DateTimeFormat` for localized display.

Key tokens: `--sn-color-primary` (selected), `--sn-color-muted` (disabled), `--sn-radius-md`,
`--sn-spacing-sm`, `--sn-font-size-sm`.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/forms/date-picker/schema.ts` |
| Create | `src/ui/components/forms/date-picker/component.tsx` |
| Create | `src/ui/components/forms/date-picker/types.ts` |
| Create | `src/ui/components/forms/date-picker/index.ts` |
| Create | `src/ui/components/forms/date-picker/__tests__/schema.test.ts` |
| Create | `src/ui/components/forms/date-picker/__tests__/component.test.tsx` |
| Modify | `src/ui/manifest/boot-builtins.ts` — register date-picker |
| Modify | `src/ui/components/register.ts` — add date-picker |

### Playground Integration

- Single date selection with min/max.
- Range selection with presets ("Last 7 days", "Last 30 days", "This month").
- Multiple date selection.
- Disabled weekends.

### Tests

| File | What |
|---|---|
| `src/ui/components/forms/date-picker/__tests__/schema.test.ts` | Tests: each mode accepted, presets validate, min/max validate, disabledDates validate. |
| `src/ui/components/forms/date-picker/__tests__/component.test.tsx` | Tests: renders calendar, selects date, range selection, preset applies, disabled dates unclickable, SSR renders. |

### Exit Criteria

- [ ] `{ "type": "date-picker", "mode": "single" }` renders a date picker.
- [ ] `{ "mode": "range" }` allows selecting a date range.
- [ ] `{ "presets": [{ "label": "Last 7 days", "start": "today-7d", "end": "today" }] }` shows preset buttons.
- [ ] `{ "min": "2026-01-01" }` disables dates before January 2026.
- [ ] `{ "disabledDates": [{ "dayOfWeek": [0, 6] }] }` disables weekends.
- [ ] Date picker publishes value via component `id`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.7: Slider

### Goal

Create a new `slider` component. Supports min/max/step, single thumb and dual-thumb
range mode.

### Types

```ts
/**
 * Slider component configuration.
 */
export const sliderConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("slider"),
  /** Minimum value. */
  min: z.number().default(0),
  /** Maximum value. */
  max: z.number().default(100),
  /** Step increment. */
  step: z.number().positive().default(1),
  /** Default value. Single number or [min, max] for range. */
  defaultValue: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  /**
   * Range mode — dual thumbs for selecting a range.
   * When true, value is [min, max].
   */
  range: z.boolean().default(false),
  /** Input label. */
  label: z.string().optional(),
  /** Show current value label above thumb. */
  showValue: z.boolean().default(false),
  /** Show min/max labels at track ends. */
  showLimits: z.boolean().default(false),
  /** Value format suffix (e.g. "%", "px", "$"). */
  suffix: z.string().optional(),
  /** Action on value change. */
  onChange: actionConfigSchema.optional(),
  /** Disabled state. */
  disabled: z.union([z.boolean(), policyExprSchema]).optional(),
});
```

### Implementation

Create the component:

```
src/ui/components/forms/slider/
  schema.ts
  component.tsx
  types.ts
  index.ts
  __tests__/
    schema.test.ts
    component.test.tsx
```

The component renders a native-like slider using a styled `<input type="range">` for
single mode. For range mode, render two styled `<input type="range">` elements overlaid
on a shared track. Uses `--sn-color-primary` for the filled track and `--sn-color-muted`
for the empty track.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/forms/slider/schema.ts` |
| Create | `src/ui/components/forms/slider/component.tsx` |
| Create | `src/ui/components/forms/slider/types.ts` |
| Create | `src/ui/components/forms/slider/index.ts` |
| Create | `src/ui/components/forms/slider/__tests__/schema.test.ts` |
| Create | `src/ui/components/forms/slider/__tests__/component.test.tsx` |
| Modify | `src/ui/manifest/boot-builtins.ts` — register slider |
| Modify | `src/ui/components/register.ts` — add slider |

### Tests

| File | What |
|---|---|
| `src/ui/components/forms/slider/__tests__/schema.test.ts` | Tests: min/max/step accepted, range mode, defaultValue, suffix. |
| `src/ui/components/forms/slider/__tests__/component.test.tsx` | Tests: renders input, publishes value, range mode renders two thumbs, step increments, SSR renders. |

### Exit Criteria

- [ ] `{ "type": "slider", "min": 0, "max": 100 }` renders a slider.
- [ ] `{ "range": true }` renders dual-thumb range slider.
- [ ] `{ "step": 5 }` increments by 5.
- [ ] `{ "showValue": true }` displays current value above thumb.
- [ ] `{ "suffix": "%" }` appends "%" to displayed value.
- [ ] Slider publishes value via component `id`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.8: Color Picker

### Goal

Create a new `color-picker` component. Supports format selection, preset swatches,
and custom color input.

### Types

```ts
/**
 * Color picker component configuration.
 */
export const colorPickerConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("color-picker"),
  /** Color format for the published value. */
  format: z.enum(["hex", "rgb", "hsl"]).default("hex"),
  /** Default color value. */
  defaultValue: z.string().optional(),
  /** Preset color swatches. */
  swatches: z.array(z.string()).optional(),
  /** Allow custom color input (hex input field). Default: true. */
  allowCustom: z.boolean().default(true),
  /** Show opacity/alpha control. */
  showAlpha: z.boolean().default(false),
  /** Input label. */
  label: z.string().optional(),
  /** Action on color change. */
  onChange: actionConfigSchema.optional(),
});
```

### Implementation

Create the component:

```
src/ui/components/forms/color-picker/
  schema.ts
  component.tsx
  types.ts
  index.ts
  __tests__/
    schema.test.ts
    component.test.tsx
```

The component renders a color swatch grid + optional hex input. Uses a native
`<input type="color">` as the advanced picker (accessible, no external dependency).
Swatches are rendered as clickable color squares.

Tokens: `--sn-radius-sm` (swatch border-radius), `--sn-spacing-xs` (swatch gap),
`--sn-color-border` (swatch border).

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/forms/color-picker/schema.ts` |
| Create | `src/ui/components/forms/color-picker/component.tsx` |
| Create | `src/ui/components/forms/color-picker/types.ts` |
| Create | `src/ui/components/forms/color-picker/index.ts` |
| Create | `src/ui/components/forms/color-picker/__tests__/schema.test.ts` |
| Create | `src/ui/components/forms/color-picker/__tests__/component.test.tsx` |
| Modify | `src/ui/manifest/boot-builtins.ts` — register color-picker |
| Modify | `src/ui/components/register.ts` — add color-picker |

### Tests

| File | What |
|---|---|
| `src/ui/components/forms/color-picker/__tests__/schema.test.ts` | Tests: each format, swatches array, allowCustom, showAlpha. |
| `src/ui/components/forms/color-picker/__tests__/component.test.tsx` | Tests: renders swatches, click swatch selects color, custom input updates, format conversion, SSR renders. |

### Exit Criteria

- [ ] `{ "type": "color-picker", "swatches": ["#ff0000", "#00ff00", "#0000ff"] }` renders swatches.
- [ ] Clicking a swatch selects the color.
- [ ] `{ "allowCustom": true }` shows hex input field.
- [ ] `{ "format": "rgb" }` publishes value as `rgb(r, g, b)`.
- [ ] `{ "showAlpha": true }` adds alpha/opacity control.
- [ ] Color picker publishes value via component `id`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.9: Auto Skeleton Loading

### Goal

Add `loading` config to data components that auto-renders a skeleton placeholder matching
the component's shape while data is loading.

### Types

```ts
/**
 * Loading state configuration for data components.
 * When set, renders a skeleton placeholder while data is fetching.
 */
export const loadingConfigSchema = z.object({
  /**
   * Skeleton variant — determines the shape of the placeholder.
   * - "auto" — infers shape from the component type (table rows, card, list items).
   * - "card" — rectangular skeleton.
   * - "list" — multiple horizontal bars.
   * - "table" — table-shaped skeleton with header and rows.
   * - "chart" — chart-shaped skeleton.
   */
  variant: z.enum(["auto", "card", "list", "table", "chart"]).default("auto"),
  /** Number of skeleton rows/items to show. Default: inferred from component config. */
  rows: z.number().int().positive().optional(),
  /** Disable the skeleton (show nothing while loading). */
  disabled: z.boolean().default(false),
});
```

### Implementation

**1. Create `src/ui/components/_base/auto-skeleton.tsx`:**

```tsx
'use client';

import type { ReactNode } from "react";

interface AutoSkeletonProps {
  variant: "auto" | "card" | "list" | "table" | "chart";
  rows: number;
  componentType?: string;
}

const VARIANT_MAP: Record<string, string> = {
  "data-table": "table",
  "list": "list",
  "stat-card": "card",
  "chart": "chart",
  "feed": "list",
  "detail-card": "card",
};

/**
 * Auto-generates a skeleton placeholder that matches the target component's shape.
 * Uses semantic tokens for colors and animations.
 */
export function AutoSkeleton({ variant, rows, componentType }: AutoSkeletonProps): ReactNode {
  const resolvedVariant = variant === "auto"
    ? (componentType ? VARIANT_MAP[componentType] ?? "list" : "list")
    : variant;

  switch (resolvedVariant) {
    case "table":
      return <TableSkeleton rows={rows} />;
    case "list":
      return <ListSkeleton rows={rows} />;
    case "card":
      return <CardSkeleton />;
    case "chart":
      return <ChartSkeleton />;
    default:
      return <ListSkeleton rows={rows} />;
  }
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div data-snapshot-skeleton="table" style={{ display: "flex", flexDirection: "column", gap: "var(--sn-spacing-xs, 0.25rem)" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "var(--sn-spacing-md, 1rem)", padding: "var(--sn-spacing-sm, 0.5rem) 0" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: "1rem", backgroundColor: "var(--sn-color-muted)", borderRadius: "var(--sn-radius-sm, 0.25rem)", animation: "snapshot-skeleton-pulse 2s ease-in-out infinite" }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: "flex", gap: "var(--sn-spacing-md, 1rem)", padding: "var(--sn-spacing-sm, 0.5rem) 0" }}>
          {[1, 2, 3, 4].map((j) => (
            <div key={j} style={{ flex: 1, height: "0.875rem", backgroundColor: "var(--sn-color-muted)", borderRadius: "var(--sn-radius-sm, 0.25rem)", animation: "snapshot-skeleton-pulse 2s ease-in-out infinite", animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div data-snapshot-skeleton="list" style={{ display: "flex", flexDirection: "column", gap: "var(--sn-spacing-sm, 0.5rem)" }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ height: "2.5rem", backgroundColor: "var(--sn-color-muted)", borderRadius: "var(--sn-radius-sm, 0.25rem)", animation: "snapshot-skeleton-pulse 2s ease-in-out infinite", animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div data-snapshot-skeleton="card" style={{ height: "8rem", backgroundColor: "var(--sn-color-muted)", borderRadius: "var(--sn-radius-md, 0.5rem)", animation: "snapshot-skeleton-pulse 2s ease-in-out infinite" }} />
  );
}

function ChartSkeleton() {
  return (
    <div data-snapshot-skeleton="chart" style={{ height: "12rem", backgroundColor: "var(--sn-color-muted)", borderRadius: "var(--sn-radius-md, 0.5rem)", animation: "snapshot-skeleton-pulse 2s ease-in-out infinite" }} />
  );
}
```

**2. Update `useComponentData`** (or each data component) to render `AutoSkeleton` when
loading and `loading` config is present.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/auto-skeleton.tsx` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `loading` |
| Modify | `src/ui/components/data/list/schema.ts` — add `loading` |
| Modify | `src/ui/components/data/chart/schema.ts` — add `loading` |
| Modify | `src/ui/components/data/stat-card/schema.ts` — add `loading` |
| Modify | `src/ui/components/data/feed/schema.ts` — add `loading` |
| Modify | `src/ui/components/data/detail-card/schema.ts` — add `loading` |
| Modify | `src/ui/components/_base/use-component-data.ts` — integrate AutoSkeleton |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/auto-skeleton.test.tsx` (create) | Tests: table skeleton renders header + rows, list skeleton renders bars, auto variant infers from componentType, SSR renders. |

### Exit Criteria

- [ ] `{ "loading": { "variant": "table", "rows": 5 } }` shows 5-row table skeleton while loading.
- [ ] `{ "loading": { "variant": "auto" } }` infers skeleton shape from component type.
- [ ] Skeleton uses `--sn-color-muted` token and pulse animation.
- [ ] `{ "loading": { "disabled": true } }` shows nothing while loading.
- [ ] Existing loading behavior (spinner) used when `loading` is not set.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase H.10: Auto Empty States

### Goal

Add `empty` config to data components. Renders a rich empty state with icon, title,
description, and optional action button when the data set is empty.

### Types

```ts
/**
 * Empty state configuration for data components.
 * Rendered when the component has no data to display.
 */
export const emptyStateConfigSchema = z.object({
  /** Icon name (from the icon registry). */
  icon: z.string().optional(),
  /** Empty state title. */
  title: z.string().default("No data"),
  /** Descriptive text below the title. */
  description: z.string().optional(),
  /**
   * Action button in the empty state.
   * e.g. "Create your first item"
   */
  action: z.object({
    label: z.string(),
    action: actionConfigSchema,
    icon: z.string().optional(),
    variant: z.enum(["default", "primary", "outline"]).default("primary"),
  }).optional(),
});
```

### Implementation

**1. Create `src/ui/components/_base/auto-empty-state.tsx`:**

```tsx
'use client';

import type { ReactNode } from "react";
import { renderIcon } from "../../icons/render";
import { useActionExecutor } from "../../actions/executor";
import { getButtonStyle } from "./button-styles";

interface EmptyStateConfig {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    action: unknown;
    icon?: string;
    variant: "default" | "primary" | "outline";
  };
}

/**
 * Auto-generated empty state for data components.
 * Shows an icon, title, description, and optional action button.
 */
export function AutoEmptyState({ config }: { config: EmptyStateConfig }): ReactNode {
  const executeAction = useActionExecutor();

  return (
    <div
      data-snapshot-empty-state=""
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--sn-spacing-2xl, 3rem) var(--sn-spacing-xl, 2rem)",
        textAlign: "center",
        gap: "var(--sn-spacing-md, 1rem)",
      }}
    >
      {config.icon && (
        <div style={{
          fontSize: "2.5rem",
          color: "var(--sn-color-muted-foreground)",
          opacity: 0.5,
        }}>
          {renderIcon(config.icon)}
        </div>
      )}
      <h3 style={{
        margin: 0,
        fontSize: "var(--sn-font-size-lg, 1.125rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)",
        color: "var(--sn-color-foreground)",
      }}>
        {config.title}
      </h3>
      {config.description && (
        <p style={{
          margin: 0,
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-muted-foreground)",
          maxWidth: "24rem",
        }}>
          {config.description}
        </p>
      )}
      {config.action && (
        <button
          onClick={() => executeAction(config.action!.action as any)}
          style={getButtonStyle(config.action.variant)}
        >
          {config.action.icon && renderIcon(config.action.icon)}
          {config.action.label}
        </button>
      )}
    </div>
  );
}
```

**2. Update data components** to render `AutoEmptyState` when data is empty and `empty`
config is present. Falls back to existing `emptyMessage` text when no `empty` config.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/auto-empty-state.tsx` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `empty` |
| Modify | `src/ui/components/data/list/schema.ts` — add `empty` |
| Modify | `src/ui/components/data/chart/schema.ts` — add `empty` |
| Modify | `src/ui/components/data/stat-card/schema.ts` — add `empty` |
| Modify | `src/ui/components/data/feed/schema.ts` — add `empty` |
| Modify | `src/ui/components/data/detail-card/schema.ts` — add `empty` |
| Modify | `src/ui/components/_base/use-component-data.ts` — integrate AutoEmptyState |

### Playground Integration

- Empty data-table with custom empty state (icon + action button).
- Empty list with description.
- Empty chart with "Add data" action.

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/auto-empty-state.test.tsx` (create) | Tests: renders title, renders icon, renders action button, fires action on click, SSR renders. |

### Exit Criteria

- [ ] `{ "empty": { "icon": "inbox", "title": "No items yet", "description": "Create your first item." } }` renders styled empty state.
- [ ] `{ "empty": { "action": { "label": "Add Item", "action": { "type": "open-modal", "modal": "add-item" } } } }` shows action button.
- [ ] Clicking the action button executes the configured action.
- [ ] Existing `emptyMessage` text still works when `empty` is not set.
- [ ] Empty state uses `--sn-*` semantic tokens.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Four independent tracks:

| Track | Phases | Files Owned |
|---|---|---|
| Data | H.1, H.2, H.9, H.10 | Chart variants, feed enhancements, auto-skeleton, auto-empty-state |
| Forms | H.3, H.6, H.7, H.8 | Wizard enhancements, date-picker, slider, color-picker |
| Overlay | H.4, H.5 | Command palette enhancements, toast undo |

### Why Tracks Are Independent

- **Data** modifies data components and creates new base utilities. No form/overlay overlap.
- **Forms** modifies wizard and creates three new form components. No data/overlay overlap.
- **Overlay** modifies command palette and toast. No data/form overlap.

### File Conflicts

- **H.9 and H.10** both modify data component schemas and `use-component-data.ts`. Run sequentially.
- **H.6, H.7, H.8** all modify `boot-builtins.ts` and `register.ts`. Run sequentially.
- **H.1 and H.2** modify different data components. Can run in parallel.
- **H.4 and H.5** modify different overlay systems. Can run in parallel.

### Recommended Order

Within each track:

**Data track:**
1. H.9 (auto skeleton — utility for all data components)
2. H.10 (auto empty state — utility for all data components)
3. H.1 (chart variants — most variant files)
4. H.2 (feed enhancements — depends on D.3 infinite scroll)

**Forms track:**
1. H.6 (date picker — new component)
2. H.7 (slider — new component)
3. H.8 (color picker — new component)
4. H.3 (wizard — enhancement, depends on D.5 validation)

**Overlay track:**
1. H.5 (toast undo — simpler)
2. H.4 (command palette — depends on D.1 shortcuts)

### Branch Strategy

```
branch: phase-h-components
base: main
```

Alternatively, one branch per track:

```
phase-h-data      (H.1, H.2, H.9, H.10)
phase-h-forms     (H.3, H.6, H.7, H.8)
phase-h-overlay   (H.4, H.5)
```

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Follow the component file conventions exactly: `schema.ts`, `component.tsx`, `types.ts`, `index.ts`.
4. For new components (H.6, H.7, H.8):
   a. Create directory under correct group (`forms/`).
   b. Register in `boot-builtins.ts` and `register.ts`.
   c. Add playground fixture.
5. For enhancements (H.1-H.5, H.9, H.10):
   a. Modify existing schema/component files.
   b. Add tests for new behavior.
   c. Verify existing tests still pass.
6. For each phase:
   a. Run `bun run typecheck && bun test`.
   b. Run `bun run format:check`.
   c. Commit with message: `feat(phase-h.N): <title>`.
7. After all phases:
   a. Run `bun run build`.
   b. Verify all new components/variants appear in playground.
   c. Verify SSR safety.
8. Push branch, do not merge.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| H.1 chart rendering complexity | Start with simplest variants (sparkline, scatter). Use SVG primitives. |
| H.6 date picker i18n | Use `Intl.DateTimeFormat` for all date formatting. Test with non-US locales. |
| H.7 range slider touch support | Use standard `<input type="range">` for baseline touch support. |
| H.9 skeleton flicker | Add a 100ms delay before showing skeleton to avoid flicker on fast loads. |

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Per-Track Checks

- [ ] No `any` casts in new code.
- [ ] All new exports have JSDoc.
- [ ] SSR safe — no `document`/`window` in render body.
- [ ] All new UI uses `--sn-*` semantic tokens exclusively.
- [ ] New components follow file conventions (schema.ts, component.tsx, types.ts, index.ts).
- [ ] New components registered in `boot-builtins.ts`.

### Documentation Checks

- [ ] JSDoc on all new schemas and components.
- [ ] All new schema fields documented with JSDoc.
- [ ] `src/ui.ts` exports updated if applicable.
- [ ] Playground fixtures created for all new components and variants.

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All component tests pass
```

- [ ] All 10 sub-phases have passing tests.
- [ ] Chart: 5 new variants render correctly.
- [ ] Feed: infinite scroll, relative time, grouping, item actions all work.
- [ ] Wizard: validation blocks advance, skip works, async validation works.
- [ ] Command palette: shortcuts auto-registered, dynamic search works, recent items persist.
- [ ] Toast: undo button appears, countdown works, revert action fires.
- [ ] Date picker: single/range/multiple modes, presets, min/max all work.
- [ ] Slider: single and range modes, step increments, value display.
- [ ] Color picker: swatches, custom input, format output.
- [ ] Auto skeleton: matches component shape, uses tokens.
- [ ] Auto empty state: icon, title, description, action button.
- [ ] No TypeScript required for any component feature.
