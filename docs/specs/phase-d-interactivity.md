# Phase D: Interactivity Engine — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | D.1 | Global Keyboard Shortcuts | Not started | Shortcuts |
> | D.2 | Generic Drag and Drop | Not started | DnD |
> | D.3 | Scroll Behaviors | Not started | Runtime |
> | D.4 | Form Field Dependencies | Not started | Forms |
> | D.5 | Client-Side Validation | Not started | Forms |
> | D.6 | Debounce/Throttle | Not started | Actions |
> | D.7 | Context Menus | Not started | Components |
> | D.8 | Clipboard Action | Not started | Actions |
> | D.9 | Polling | Not started | Runtime |
> | D.10 | Enhanced Confirm | Not started | Actions |
>
> **Priority:** P1 — unlocks real application interactivity beyond CRUD.
> **Depends on:** Phase A (CSS Foundation), Phase B (Layout).
> **Blocks:** Phase E (State Machine) depends on D.4/D.5 for form field logic.

---

## Vision

### Before (Today)

Snapshot renders config-driven pages with data binding and actions, but real applications
need richer interactivity:

1. **Keyboard shortcuts exist but are hardcoded.** `src/ui/shortcuts/` has `registerShortcuts()`,
   `parseShortcut()`, and a listener, but the manifest schema does not expose a `shortcuts`
   config. Consumers cannot declare shortcuts in JSON.
2. **Drag and drop exists but is not manifest-addressable.** `src/ui/hooks/use-drag-drop.ts`
   wraps `@dnd-kit/core` with `DndContext`, `useSortable`, and `arrayMove`. Kanban and
   tree-view use it internally. But list and data-table have no `draggable` or `onReorder`
   prop in their schemas.
3. **No infinite scroll.** Pagination is offset-based. There is no sentinel-based
   IntersectionObserver for append-on-scroll.
4. **Form fields are static.** `auto-form` fields have no `visible` or `required` that
   reads from another field's value. Show/hide logic requires custom code.
5. **No client-side validation.** Form submission goes straight to the API. There is no
   `validate` object on field configs for required, minLength, pattern, etc.
6. **Actions fire immediately.** No `debounce` or `throttle` on action configs.
7. **Context menus are a component but not wired to data components.** `src/ui/components/overlay/context-menu/`
   exists as a registered component. But data-table and list have no `contextMenu` prop.
8. **No clipboard action.** The action vocabulary has `copy` (navigates to copy URL?) but no
   dedicated `copy-to-clipboard` for arbitrary text.
9. **No polling.** Data components fetch once. There is no `poll` config for periodic refresh.
10. **Confirm is basic.** The `confirm` action handler in `src/ui/actions/confirm.ts` supports
    `title` and `message` but not `variant`, `requireInput`, or custom button labels.

### After (This Spec)

1. `manifest.shortcuts` declares global keyboard shortcuts bound to actions.
2. `draggable: true` + `onReorder` on list/data-table enables drag-to-reorder.
3. `pagination.infinite: true` on data components enables sentinel-based infinite scroll.
4. `visible`/`required` on auto-form fields accept `{ from: "field-id" }` for dynamic deps.
5. `validate` object on fields enforces client-side rules before submit.
6. `debounce`/`throttle` on action configs delay execution.
7. `contextMenu` array on data-table/list opens a dropdown on right-click.
8. `copy-to-clipboard` action type copies text to clipboard.
9. `poll` config on data components enables periodic data refresh.
10. Enhanced `confirm` with variant, required input, and custom labels.

---

## What Already Exists on Main

### Shortcuts Module

| File | Lines | What Exists |
|---|---|---|
| `src/ui/shortcuts/index.ts` | ~50 | `registerShortcuts()` — accepts a map, calls `parseShortcut()`, attaches `keydown` listener. |
| `src/ui/shortcuts/parse.ts` | ~80 | `parseShortcut()` — parses `"ctrl+k"` strings into `{ key, ctrl, alt, shift, meta }`. |
| `src/ui/shortcuts/listener.ts` | ~60 | Global keydown handler that matches events to registered shortcuts. |
| `src/ui/shortcuts/types.ts` | ~20 | `Shortcut` and `ShortcutMap` types. |

### Drag and Drop

| File | Lines | What Exists |
|---|---|---|
| `src/ui/hooks/use-drag-drop.ts` | ~200 | Wraps `@dnd-kit/core`: `DndContext`, `SortableContext`, `useSortable`, `arrayMove`, sensors. Used by kanban and tree-view. |

### Action Executor

| File | Lines | What Exists |
|---|---|---|
| `src/ui/actions/executor.ts` | ~400 | `useActionExecutor()` handles 17 action types: navigate, navigate-external, api, open-modal, close-modal, refresh, set-value, download, copy, emit, submit-form, reset-form, set-theme, confirm, toast, log, track, run-workflow. |
| `src/ui/actions/types.ts` | ~200 | `ACTION_TYPES` const array, per-type interfaces, `ActionConfig` union. |
| `src/ui/actions/confirm.ts` | ~80 | `useConfirmManager()` — renders a confirm dialog with title, message, confirm/cancel. |

### Form Components

| File | What |
|---|---|
| `src/ui/components/forms/auto-form/schema.ts` | Field schemas with `type`, `label`, `defaultValue`, `placeholder`. No `visible`, `required` as FromRef, no `validate`. |
| `src/ui/components/forms/auto-form/component.tsx` | Renders fields, handles submission via action executor. |

### Context Menu Component

| File | What |
|---|---|
| `src/ui/components/overlay/context-menu/` | Registered component with schema. Standalone — not attached to data components. |

### Data Components (no polling, no infinite scroll)

| File | What |
|---|---|
| `src/ui/components/data/data-table/schema.ts` | `pagination` with `pageSize`, `showPageSize`. No `infinite`. |
| `src/ui/components/data/list/schema.ts` | List component. No `draggable`, `onReorder`, `contextMenu`, `poll`. |

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
| `src/ui/shortcuts/index.ts` | Shortcut registration | ~50 |
| `src/ui/shortcuts/parse.ts` | Shortcut string parser | ~80 |
| `src/ui/hooks/use-drag-drop.ts` | DnD hook wrapping @dnd-kit | ~200 |
| `src/ui/actions/executor.ts` | Action executor (17 types) | ~400 |
| `src/ui/actions/types.ts` | Action type definitions | ~200 |
| `src/ui/actions/confirm.ts` | Confirm dialog manager | ~80 |
| `src/ui/components/forms/auto-form/schema.ts` | Auto-form field schemas | ~300 |
| `src/ui/components/data/data-table/schema.ts` | DataTable schema | ~100 |
| `src/ui/components/data/list/schema.ts` | List schema | ~80 |
| `src/ui/components/overlay/context-menu/schema.ts` | Context menu schema | ~60 |
| `src/ui/manifest/schema.ts` | All manifest schemas | ~1400 |
| `src/ui/manifest/app.tsx` | ManifestApp | ~600 |

---

## Non-Negotiable Engineering Constraints

1. **Manifest-only** (Rule: Config-Driven UI #6) — every feature configurable from JSON. No TypeScript required.
2. **No `any`** (Rule: Code Patterns #3) — strict types on all new props and action types.
3. **SSR safe** (Rule: SSR #3) — no `document`, `window`, `navigator` in render body. Browser APIs in `useEffect` only.
4. **One code path** (Rule: Config-Driven UI #1) — extend existing `useActionExecutor`, not a parallel system.
5. **Registries, not switches** (Rule: Config-Driven UI #4) — new action types registered, not hardcoded.
6. **Semantic tokens only** (Rule: Component #semantic) — all UI uses `--sn-*` tokens.
7. **Fixed action vocabulary** (Rule: Component #actions) — new action types added to `ACTION_TYPES`.

---

## Phase D.1: Global Keyboard Shortcuts

### Goal

Add `manifest.shortcuts` config that maps key combinations to actions. `ManifestApp`
calls `registerShortcuts()` from the existing shortcuts module. Support single-key combos
(`ctrl+k`) and chord sequences (`g then d`).

### Types

Add to `src/ui/manifest/schema.ts`:

```ts
import { z } from "zod";

/**
 * A keyboard shortcut binding.
 * Keys use modifier+key format: "ctrl+k", "alt+shift+n".
 * Chord sequences use "then": "g then d" means press g, then d within timeout.
 */
export const shortcutConfigSchema = z.object({
  /** Human-readable label for the shortcut (shown in command palette). */
  label: z.string().optional(),
  /** The action(s) to execute when the shortcut fires. */
  action: z.union([actionConfigSchema, z.array(actionConfigSchema)]),
  /** Whether the shortcut is disabled. Accepts boolean or policy expression. */
  disabled: z.union([z.boolean(), policyExprSchema]).optional(),
});

/** Map of key combo string to shortcut config. */
export const shortcutsConfigSchema = z.record(z.string(), shortcutConfigSchema);
```

Add to manifest root schema:

```ts
export const manifestSchema = z.object({
  // ... existing ...
  /** Global keyboard shortcuts. Keys are combo strings like "ctrl+k". */
  shortcuts: shortcutsConfigSchema.optional(),
});
```

### Implementation

**1. Extend `src/ui/shortcuts/parse.ts` to support chords:**

```ts
/**
 * Parse a chord sequence like "g then d" into an array of Shortcut objects.
 * Single combos return a one-element array.
 */
export function parseChord(input: string): Shortcut[] {
  const parts = input.split(/\s+then\s+/i);
  return parts.map((part) => parseShortcut(part.trim()));
}
```

**2. Add chord detection to `src/ui/shortcuts/listener.ts`:**

```ts
const CHORD_TIMEOUT = 1000; // ms between chord keys

interface ChordState {
  sequence: Shortcut[];
  currentIndex: number;
  timer: ReturnType<typeof setTimeout> | null;
}

// Track in-progress chord sequences
const activeChords = new Map<string, ChordState>();

function handleChordKeydown(event: KeyboardEvent, registeredChords: Map<string, { shortcuts: Shortcut[]; callback: () => void }>): boolean {
  for (const [id, { shortcuts, callback }] of registeredChords) {
    const state = activeChords.get(id) ?? { sequence: shortcuts, currentIndex: 0, timer: null };
    const expected = shortcuts[state.currentIndex];

    if (matchesShortcut(event, expected)) {
      if (state.timer) clearTimeout(state.timer);

      if (state.currentIndex === shortcuts.length - 1) {
        // Chord complete
        activeChords.delete(id);
        callback();
        return true;
      }

      // Advance chord
      state.currentIndex += 1;
      state.timer = setTimeout(() => activeChords.delete(id), CHORD_TIMEOUT);
      activeChords.set(id, state);
      return true;
    }
  }
  return false;
}
```

**3. Wire in `src/ui/manifest/app.tsx`:**

In `ManifestApp`, after compiling the manifest, register shortcuts:

```ts
useEffect(() => {
  if (!compiled.manifest.shortcuts) return;
  const cleanup = registerShortcuts(compiled.manifest.shortcuts, executeAction);
  return cleanup;
}, [compiled.manifest.shortcuts, executeAction]);
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/shortcuts/parse.ts` — add `parseChord()` |
| Modify | `src/ui/shortcuts/listener.ts` — chord detection with timeout |
| Modify | `src/ui/shortcuts/types.ts` — chord-related types |
| Modify | `src/ui/manifest/schema.ts` — add `shortcutsConfigSchema`, add `shortcuts` to manifest |
| Modify | `src/ui/manifest/app.tsx` — register shortcuts from manifest |
| Modify | `src/ui/manifest/types.ts` — add `shortcuts` to `CompiledManifest` |

### Documentation Impact

- JSDoc on `parseChord()`, `shortcutConfigSchema`, `shortcutsConfigSchema`.
- Update `docs/components.md` or create `docs/shortcuts.md` if applicable.

### Tests

| File | What |
|---|---|
| `src/ui/shortcuts/__tests__/parse.test.ts` | Tests: `parseChord("g then d")` returns two shortcuts, single combo returns one-element array, case-insensitive `then`. |
| `src/ui/shortcuts/__tests__/listener.test.ts` | Tests: chord timeout resets, chord completes on final key, single shortcut fires immediately. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add tests: `shortcuts` config validates, shortcut with action array accepted. |

### Exit Criteria

- [ ] `{ "shortcuts": { "ctrl+k": { "action": { "type": "open-modal", "modal": "command-palette" } } } }` opens command palette on Ctrl+K.
- [ ] `{ "shortcuts": { "g then d": { "action": { "type": "navigate", "to": "/dashboard" } } } }` navigates on g-then-d chord.
- [ ] Chord times out after 1000ms — pressing `g` then waiting 2s then `d` does NOT trigger.
- [ ] Disabled shortcut (via policy) does not fire.
- [ ] SSR does not throw (listener attaches in `useEffect`).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.2: Generic Drag and Drop

### Goal

Add `draggable`, `onReorder`, `dropTargets`, and `onDrop` props to list and data-table
schemas. Uses existing `@dnd-kit` integration from `src/ui/hooks/use-drag-drop.ts`.

### Types

Add to list and data-table schemas:

```ts
/**
 * Drag-and-drop reorder configuration.
 */
export const reorderConfigSchema = z.object({
  /** Enable drag handles on items. */
  draggable: z.boolean().default(false),
  /**
   * Action to execute when items are reordered.
   * Context: { oldIndex, newIndex, item, items }
   */
  onReorder: actionConfigSchema.optional(),
  /**
   * Named drop targets this component accepts items from.
   * Items from other draggable components with matching `dragGroup`.
   */
  dropTargets: z.array(z.string()).optional(),
  /**
   * Action to execute when an external item is dropped.
   * Context: { item, source, target }
   */
  onDrop: actionConfigSchema.optional(),
  /** Named group for cross-component drag. */
  dragGroup: z.string().optional(),
});
```

### Implementation

**1. Create `src/ui/components/_base/use-reorderable.ts`:**

```ts
'use client';

import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

export interface UseReorderableOptions {
  items: unknown[];
  onReorder?: (context: { oldIndex: number; newIndex: number; item: unknown; items: unknown[] }) => void;
}

export function useReorderable({ items, onReorder }: UseReorderableOptions) {
  const [orderedItems, setOrderedItems] = useState(items);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((_, i) => String(i) === String(active.id));
    const newIndex = orderedItems.findIndex((_, i) => String(i) === String(over.id));

    const newItems = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(newItems);
    onReorder?.({ oldIndex, newIndex, item: orderedItems[oldIndex], items: newItems });
  }, [orderedItems, onReorder]);

  return { orderedItems, handleDragEnd };
}
```

**2. Update `src/ui/components/data/list/component.tsx`:**

When `draggable: true`, wrap list items in `DndContext` + `SortableContext` from
`use-drag-drop.ts`. Each item gets a drag handle. On drag end, fire `onReorder` action.

**3. Update `src/ui/components/data/data-table/component.tsx`:**

Same pattern — wrap table rows in sortable context when `draggable: true`.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/use-reorderable.ts` |
| Modify | `src/ui/components/data/list/schema.ts` — add reorder props |
| Modify | `src/ui/components/data/list/component.tsx` — DnD wrapper |
| Modify | `src/ui/components/data/data-table/schema.ts` — add reorder props |
| Modify | `src/ui/components/data/data-table/component.tsx` — DnD wrapper |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/use-reorderable.test.ts` (create) | Tests: drag end reorders items, no-op when dropped on same position, fires onReorder callback. |
| `src/ui/components/data/list/__tests__/schema.test.ts` | Add: `draggable: true` accepted, `onReorder` action accepted. |
| `src/ui/components/data/data-table/__tests__/schema.test.ts` | Add: `draggable: true` accepted. |

### Exit Criteria

- [ ] `{ "type": "list", "draggable": true, "onReorder": { "type": "api", ... } }` enables drag reorder.
- [ ] Drag handles appear on items.
- [ ] `onReorder` action fires with `{oldIndex}`, `{newIndex}`, `{item}`.
- [ ] Cross-component drag works with matching `dragGroup`.
- [ ] SSR safe — DnD sensors attach in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.3: Scroll Behaviors

### Goal

Add `pagination.infinite: true` for sentinel-based infinite scroll and a `scroll-to`
action type. Uses IntersectionObserver for append-on-scroll.

### Types

Extend pagination schema:

```ts
export const paginationConfigSchema = z.object({
  // ... existing pageSize, showPageSize ...
  /**
   * Enable infinite scroll. When true, a sentinel element at the bottom of the
   * list triggers the next page fetch automatically.
   */
  infinite: z.boolean().optional(),
  /** Threshold in pixels before the sentinel is visible to trigger prefetch. */
  infiniteThreshold: z.number().positive().default(200),
});
```

Add `scroll-to` action:

```ts
export interface ScrollToAction {
  type: "scroll-to";
  /** CSS selector or component id to scroll to. */
  target: string;
  /** Scroll behavior. */
  behavior?: "smooth" | "instant" | "auto";
  /** Block alignment. */
  block?: "start" | "center" | "end" | "nearest";
}
```

### Implementation

**1. Create `src/ui/hooks/use-infinite-scroll.ts`:**

```ts
'use client';

import { useEffect, useRef, useCallback } from "react";

export interface UseInfiniteScrollOptions {
  /** Whether there is a next page to load. */
  hasNextPage: boolean;
  /** Whether a page is currently loading. */
  isLoading: boolean;
  /** Callback to load the next page. */
  loadNextPage: () => void;
  /** Threshold in pixels. */
  threshold?: number;
}

/**
 * Returns a ref to attach to a sentinel element. When the sentinel
 * enters the viewport, loadNextPage() is called.
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { hasNextPage, isLoading, loadNextPage, threshold = 200 } = options;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: `${threshold}px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isLoading, loadNextPage, threshold]);

  return sentinelRef;
}
```

**2. Add scroll-to handler in `src/ui/actions/executor.ts`:**

```ts
case "scroll-to": {
  if (typeof document === "undefined") break;
  const target = action.target.startsWith("#")
    ? document.querySelector(action.target)
    : document.querySelector(`[data-snapshot-id="${action.target}"]`);
  target?.scrollIntoView({
    behavior: action.behavior ?? "smooth",
    block: action.block ?? "start",
  });
  break;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/hooks/use-infinite-scroll.ts` |
| Modify | `src/ui/actions/types.ts` — add `ScrollToAction`, add `"scroll-to"` to `ACTION_TYPES` |
| Modify | `src/ui/actions/executor.ts` — handle `scroll-to` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `infinite` to pagination |
| Modify | `src/ui/components/data/data-table/component.tsx` — sentinel element when infinite |
| Modify | `src/ui/components/data/list/schema.ts` — add `infinite` to pagination |
| Modify | `src/ui/components/data/list/component.tsx` — sentinel element |
| Modify | `src/ui.ts` — export `useInfiniteScroll` |

### Tests

| File | What |
|---|---|
| `src/ui/hooks/__tests__/use-infinite-scroll.test.ts` (create) | Tests: observer created, loadNextPage called when sentinel visible, no-op when loading. |
| `src/ui/actions/__tests__/executor.test.ts` | Add: scroll-to action finds element and scrolls. |

### Exit Criteria

- [ ] `{ "pagination": { "infinite": true } }` on data-table renders a sentinel that triggers page loads.
- [ ] Scroll loads append to existing data (not replace).
- [ ] `{ "type": "scroll-to", "target": "section-id" }` scrolls to the element.
- [ ] IntersectionObserver only created in `useEffect` (SSR safe).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.4: Form Field Dependencies

### Goal

Allow `visible` and `required` on auto-form fields to accept `{ from: "field-id" }` refs.
Fields show/hide or become required based on other field values.

### Types

Extend auto-form field schema:

```ts
export const fieldDependencySchema = z.union([
  z.boolean(),
  fromRefSchema,
  z.object({
    /** Expression evaluated against form state. */
    expr: z.string(),
  }),
]);

// On each field config:
/** Whether this field is visible. Accepts boolean, FromRef, or expression. */
visible: fieldDependencySchema.optional(),
/** Whether this field is required. Accepts boolean, FromRef, or expression. */
required: fieldDependencySchema.optional(),
```

### Implementation

**1. Create `src/ui/components/forms/auto-form/use-field-deps.ts`:**

```ts
'use client';

import { useMemo } from "react";
import { useResolveFrom } from "../../../context/index";
import { evaluateExpression } from "../../../expressions/parser";

export interface FieldDep {
  visible: boolean;
  required: boolean;
}

/**
 * Resolves dynamic field dependencies (visible/required).
 * Reads from page context or evaluates expressions against form state.
 */
export function useFieldDeps(
  visibleConfig: boolean | { from: string } | { expr: string } | undefined,
  requiredConfig: boolean | { from: string } | { expr: string } | undefined,
  formState: Record<string, unknown>,
): FieldDep {
  const resolveFrom = useResolveFrom();

  return useMemo(() => {
    const visible = resolveDep(visibleConfig, resolveFrom, formState) ?? true;
    const required = resolveDep(requiredConfig, resolveFrom, formState) ?? false;
    return { visible: Boolean(visible), required: Boolean(required) };
  }, [visibleConfig, requiredConfig, formState, resolveFrom]);
}

function resolveDep(
  config: boolean | { from: string } | { expr: string } | undefined,
  resolveFrom: (ref: { from: string }) => unknown,
  formState: Record<string, unknown>,
): unknown {
  if (config === undefined) return undefined;
  if (typeof config === "boolean") return config;
  if ("from" in config) return resolveFrom(config);
  if ("expr" in config) return evaluateExpression(config.expr, formState);
  return undefined;
}
```

**2. Update auto-form rendering** to skip hidden fields and apply required attribute.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/forms/auto-form/use-field-deps.ts` |
| Modify | `src/ui/components/forms/auto-form/schema.ts` — add `visible`, `required` as `fieldDependencySchema` |
| Modify | `src/ui/components/forms/auto-form/component.tsx` — call `useFieldDeps`, skip hidden fields, apply required |
| Modify | `src/ui/components/forms/auto-form/types.ts` — updated types |

### Tests

| File | What |
|---|---|
| `src/ui/components/forms/auto-form/__tests__/use-field-deps.test.ts` (create) | Tests: boolean visible, FromRef visible, expr visible, required defaults to false. |
| `src/ui/components/forms/auto-form/__tests__/schema.test.ts` | Add: `visible: { from: "toggle" }` accepted, `required: { expr: "role == 'admin'" }` accepted. |

### Exit Criteria

- [ ] `{ "visible": { "from": "show-advanced" } }` hides field when `show-advanced` is false.
- [ ] `{ "required": { "expr": "type == 'business'" } }` makes field required when type is business.
- [ ] `{ "visible": false }` statically hides field.
- [ ] Hidden fields are excluded from form submission data.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.5: Client-Side Validation

### Goal

Add `validate` object on auto-form fields: `required`, `minLength`, `maxLength`, `pattern`,
`min`, `max`, `equals`. Validate before submit; show inline errors.

### Types

```ts
export const fieldValidationSchema = z.object({
  /** Field is required. */
  required: z.union([z.boolean(), z.string()]).optional(),
  /** Minimum string length. */
  minLength: z.union([z.number().int().nonnegative(), z.object({ value: z.number(), message: z.string() })]).optional(),
  /** Maximum string length. */
  maxLength: z.union([z.number().int().positive(), z.object({ value: z.number(), message: z.string() })]).optional(),
  /** Regex pattern the value must match. */
  pattern: z.union([z.string(), z.object({ value: z.string(), message: z.string() })]).optional(),
  /** Minimum numeric value. */
  min: z.union([z.number(), z.object({ value: z.number(), message: z.string() })]).optional(),
  /** Maximum numeric value. */
  max: z.union([z.number(), z.object({ value: z.number(), message: z.string() })]).optional(),
  /** Value must equal another field's value. Useful for password confirmation. */
  equals: z.union([z.string(), z.object({ field: z.string(), message: z.string() })]).optional(),
});
```

### Implementation

**1. Create `src/ui/components/forms/auto-form/validate.ts`:**

```ts
import type { z } from "zod";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: string | { value: string; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  equals?: string | { field: string; message: string };
}

/**
 * Validate a form field value against its validation rules.
 * Returns null if valid, or an error message string.
 */
export function validateField(
  value: unknown,
  rules: ValidationRule,
  formValues: Record<string, unknown>,
): string | null {
  const strValue = typeof value === "string" ? value : String(value ?? "");
  const numValue = typeof value === "number" ? value : Number(value);

  // required
  if (rules.required) {
    if (value === undefined || value === null || strValue.trim() === "") {
      return typeof rules.required === "string" ? rules.required : "This field is required";
    }
  }

  // minLength
  if (rules.minLength !== undefined) {
    const { val, msg } = unpackRule(rules.minLength, "minLength");
    if (strValue.length < val) {
      return msg ?? `Must be at least ${val} characters`;
    }
  }

  // maxLength
  if (rules.maxLength !== undefined) {
    const { val, msg } = unpackRule(rules.maxLength, "maxLength");
    if (strValue.length > val) {
      return msg ?? `Must be at most ${val} characters`;
    }
  }

  // pattern
  if (rules.pattern !== undefined) {
    const patternStr = typeof rules.pattern === "string" ? rules.pattern : rules.pattern.value;
    const patternMsg = typeof rules.pattern === "object" ? rules.pattern.message : null;
    if (!new RegExp(patternStr).test(strValue)) {
      return patternMsg ?? `Invalid format`;
    }
  }

  // min / max
  if (rules.min !== undefined) {
    const { val, msg } = unpackRule(rules.min, "min");
    if (numValue < val) return msg ?? `Must be at least ${val}`;
  }
  if (rules.max !== undefined) {
    const { val, msg } = unpackRule(rules.max, "max");
    if (numValue > val) return msg ?? `Must be at most ${val}`;
  }

  // equals
  if (rules.equals !== undefined) {
    const field = typeof rules.equals === "string" ? rules.equals : rules.equals.field;
    const eqMsg = typeof rules.equals === "object" ? rules.equals.message : null;
    if (value !== formValues[field]) {
      return eqMsg ?? `Must match ${field}`;
    }
  }

  return null;
}

function unpackRule(rule: number | { value: number; message: string }, _name: string): { val: number; msg: string | null } {
  if (typeof rule === "number") return { val: rule, msg: null };
  return { val: rule.value, msg: rule.message };
}

/**
 * Validate all fields in a form. Returns errors map (empty = valid).
 */
export function validateForm(
  values: Record<string, unknown>,
  rules: Record<string, ValidationRule>,
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const error = validateField(values[fieldName], fieldRules, values);
    if (error) errors[fieldName] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
```

**2. Update auto-form component** to call `validateForm()` before submit. Display error
messages inline under each field using `--sn-color-destructive` token.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/forms/auto-form/validate.ts` |
| Modify | `src/ui/components/forms/auto-form/schema.ts` — add `validate` to field schemas |
| Modify | `src/ui/components/forms/auto-form/component.tsx` — validate before submit, show errors |
| Modify | `src/ui/components/forms/auto-form/types.ts` — validation types |

### Tests

| File | What |
|---|---|
| `src/ui/components/forms/auto-form/__tests__/validate.test.ts` (create) | Tests: required fails on empty, minLength/maxLength, pattern, min/max, equals, custom messages. |
| `src/ui/components/forms/auto-form/__tests__/schema.test.ts` | Add: validate object accepted on fields. |

### Exit Criteria

- [ ] `{ "validate": { "required": true } }` prevents submit when field is empty.
- [ ] `{ "validate": { "minLength": 8 } }` shows error for short input.
- [ ] `{ "validate": { "pattern": { "value": "^[A-Z]", "message": "Must start with uppercase" } } }` shows custom message.
- [ ] `{ "validate": { "equals": "password" } }` validates against another field's value.
- [ ] Error messages appear inline below the field.
- [ ] Successful validation submits normally.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.6: Debounce/Throttle

### Goal

Add `debounce` and `throttle` (in milliseconds) to action configs. The action executor
wraps the handler accordingly.

### Types

Extend `ActionConfig` base:

```ts
/** Base properties available on all action configs. */
export interface ActionBase {
  /** Debounce execution by N milliseconds. Resets timer on each trigger. */
  debounce?: number;
  /** Throttle execution — fire at most once per N milliseconds. */
  throttle?: number;
}
```

### Implementation

**1. Create `src/ui/actions/timing.ts`:**

```ts
/**
 * Debounce and throttle wrappers for action execution.
 */

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const throttleTimers = new Map<string, number>();

/**
 * Wrap a callback with debounce. Uses a string key to track the timer
 * so the same action definition shares a timer.
 */
export function debounceAction(key: string, fn: () => void, ms: number): void {
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(key, setTimeout(() => {
    debounceTimers.delete(key);
    fn();
  }, ms));
}

/**
 * Wrap a callback with throttle. Drops calls within the cooldown window.
 */
export function throttleAction(key: string, fn: () => void, ms: number): void {
  const lastRun = throttleTimers.get(key) ?? 0;
  const now = Date.now();
  if (now - lastRun < ms) return;
  throttleTimers.set(key, now);
  fn();
}
```

**2. Update `src/ui/actions/executor.ts`:**

Before executing, check `action.debounce` / `action.throttle`. Generate a stable key
from the action type + target. Wrap the execution.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/actions/timing.ts` |
| Modify | `src/ui/actions/types.ts` — add `debounce`, `throttle` to base action |
| Modify | `src/ui/actions/executor.ts` — debounce/throttle wrapper |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/timing.test.ts` (create) | Tests: debounce delays, debounce resets on re-trigger, throttle drops fast calls, throttle allows after window. |
| `src/ui/actions/__tests__/executor.test.ts` | Add: action with `debounce: 300` delays execution. |

### Exit Criteria

- [ ] `{ "type": "api", "debounce": 300, ... }` delays API call by 300ms, resets on re-trigger.
- [ ] `{ "type": "navigate", "throttle": 1000, ... }` navigates at most once per second.
- [ ] Omitting debounce/throttle fires immediately (backwards compatible).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.7: Context Menus

### Goal

Add `contextMenu` array prop to data-table and list. Right-click on a row opens a
dropdown menu with actions. Uses existing `context-menu` component from
`src/ui/components/overlay/context-menu/`.

### Types

```ts
export const contextMenuItemSchema = z.object({
  /** Display label. */
  label: z.string(),
  /** Icon name. */
  icon: z.string().optional(),
  /** Action to execute. Row data available as context. */
  action: actionConfigSchema,
  /** Disable condition. */
  disabled: z.union([z.boolean(), policyExprSchema]).optional(),
  /** Visual separator before this item. */
  separator: z.boolean().optional(),
  /** Destructive styling (red text). */
  variant: z.enum(["default", "destructive"]).optional(),
});
```

### Implementation

**1. Update data-table and list schemas** to add `contextMenu: z.array(contextMenuItemSchema).optional()`.

**2. Update data-table and list components:**

```tsx
// Wrap each row in an onContextMenu handler:
const handleContextMenu = useCallback((event: React.MouseEvent, rowData: unknown) => {
  event.preventDefault();
  setContextMenuState({
    x: event.clientX,
    y: event.clientY,
    rowData,
  });
}, []);

// Render context menu portal when open:
{contextMenuState && (
  <ContextMenuPortal
    x={contextMenuState.x}
    y={contextMenuState.y}
    items={config.contextMenu}
    context={contextMenuState.rowData}
    onClose={() => setContextMenuState(null)}
  />
)}
```

**3. Create `src/ui/components/_base/context-menu-portal.tsx`:**

Renders a positioned dropdown menu at the cursor position. Uses `--sn-*` tokens.
Closes on click-outside or Escape.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/context-menu-portal.tsx` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `contextMenu` |
| Modify | `src/ui/components/data/data-table/component.tsx` — right-click handler |
| Modify | `src/ui/components/data/list/schema.ts` — add `contextMenu` |
| Modify | `src/ui/components/data/list/component.tsx` — right-click handler |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/context-menu-portal.test.tsx` (create) | Tests: renders at coordinates, closes on Escape, fires action on click. |
| `src/ui/components/data/data-table/__tests__/schema.test.ts` | Add: `contextMenu` array accepted. |

### Exit Criteria

- [ ] Right-click on a data-table row opens a context menu at cursor position.
- [ ] Context menu items fire actions with row data as context.
- [ ] Escape or click-outside closes the menu.
- [ ] `{ "variant": "destructive" }` renders item in destructive color.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.8: Clipboard Action

### Goal

Add `copy-to-clipboard` action type. Copies a resolved string to clipboard using
`navigator.clipboard.writeText()`.

### Types

```ts
export interface CopyToClipboardAction {
  type: "copy-to-clipboard";
  /** The text to copy. Supports template interpolation: "{name}'s email: {email}". */
  text: string;
  /** Optional toast message on success. */
  toast?: string;
}
```

### Implementation

Add to `src/ui/actions/executor.ts`:

```ts
case "copy-to-clipboard": {
  if (typeof navigator === "undefined" || !navigator.clipboard) break;
  const text = resolveTemplateValue(action.text, mergedContext);
  await navigator.clipboard.writeText(text);
  if (action.toast) {
    toastManager.add({ type: "success", message: resolveTemplateValue(action.toast, mergedContext) });
  }
  break;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/actions/types.ts` — add `CopyToClipboardAction`, add `"copy-to-clipboard"` to `ACTION_TYPES` |
| Modify | `src/ui/actions/executor.ts` — handle `copy-to-clipboard` |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/executor.test.ts` | Add: copy-to-clipboard writes to clipboard mock, toast shown when configured. |

### Exit Criteria

- [ ] `{ "type": "copy-to-clipboard", "text": "{email}" }` copies resolved email to clipboard.
- [ ] `{ "toast": "Copied!" }` shows success toast after copy.
- [ ] SSR safe — `navigator.clipboard` check before access.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.9: Polling

### Goal

Add `poll` config on data components (data-table, list, chart, stat-card). Periodically
re-fetches data using `setInterval`. Pauses when tab is hidden.

### Types

```ts
export const pollConfigSchema = z.object({
  /** Polling interval in milliseconds. */
  interval: z.number().int().positive().min(1000),
  /** Pause polling when the document is hidden (tab inactive). */
  pauseWhenHidden: z.boolean().default(true),
});
```

### Implementation

**1. Create `src/ui/hooks/use-poll.ts`:**

```ts
'use client';

import { useEffect, useRef } from "react";

export interface UsePollOptions {
  /** Polling interval in ms. */
  interval: number;
  /** Pause when document is hidden. */
  pauseWhenHidden: boolean;
  /** The refetch callback. */
  onPoll: () => void;
  /** Whether polling is enabled. */
  enabled: boolean;
}

/**
 * Periodically calls onPoll at the given interval.
 * Respects document visibility when pauseWhenHidden is true.
 */
export function usePoll({ interval, pauseWhenHidden, onPoll, enabled }: UsePollOptions): void {
  const onPollRef = useRef(onPoll);
  onPollRef.current = onPoll;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (timer) return;
      timer = setInterval(() => onPollRef.current(), interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function handleVisibility() {
      if (!pauseWhenHidden) return;
      if (document.hidden) {
        stop();
      } else {
        onPollRef.current(); // Immediate refresh on return
        start();
      }
    }

    start();

    if (pauseWhenHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      stop();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [interval, pauseWhenHidden, enabled]);
}
```

**2. Wire into data components:** In `useComponentData` or in each data component,
if `poll` config exists, call `usePoll({ onPoll: refetch, ... })`.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/hooks/use-poll.ts` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `poll` |
| Modify | `src/ui/components/data/list/schema.ts` — add `poll` |
| Modify | `src/ui/components/data/chart/schema.ts` — add `poll` |
| Modify | `src/ui/components/data/stat-card/schema.ts` — add `poll` |
| Modify | `src/ui/components/_base/use-component-data.ts` — integrate `usePoll` |
| Modify | `src/ui.ts` — export `usePoll` |

### Tests

| File | What |
|---|---|
| `src/ui/hooks/__tests__/use-poll.test.ts` (create) | Tests: calls onPoll at interval, stops on unmount, pauses when hidden, resumes on visible. |

### Exit Criteria

- [ ] `{ "poll": { "interval": 5000 } }` refreshes data every 5 seconds.
- [ ] `{ "pauseWhenHidden": true }` stops polling when tab is inactive.
- [ ] Returning to the tab triggers an immediate refresh then resumes polling.
- [ ] SSR safe — `document.addEventListener` in `useEffect` only.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase D.10: Enhanced Confirm

### Goal

Expand the `confirm` action with `title`, `description`, `variant`, `requireInput`,
`confirmLabel`, and `cancelLabel`.

### Types

Extend the confirm action:

```ts
export interface ConfirmAction {
  type: "confirm";
  /** Dialog title. */
  title: string;
  /** Dialog description/message. */
  description?: string;
  /** Visual variant — destructive shows red confirm button. */
  variant?: "default" | "destructive";
  /**
   * Require the user to type a specific string to confirm.
   * e.g. "DELETE" — shows an input that must match before confirm is enabled.
   */
  requireInput?: string;
  /** Custom confirm button label. Default: "Confirm". */
  confirmLabel?: string;
  /** Custom cancel button label. Default: "Cancel". */
  cancelLabel?: string;
  /** Action(s) to execute when confirmed. */
  onConfirm: ActionConfig | ActionConfig[];
  /** Action(s) to execute when cancelled (optional). */
  onCancel?: ActionConfig | ActionConfig[];
}
```

### Implementation

**1. Update `src/ui/actions/confirm.ts`:**

Extend the confirm dialog renderer to support:
- `variant: "destructive"` — confirm button uses `--sn-color-destructive`.
- `requireInput` — render an input field. Confirm button disabled until input matches.
- Custom labels.

```tsx
// In the confirm dialog component:
const [inputValue, setInputValue] = useState("");
const isInputValid = !config.requireInput || inputValue === config.requireInput;

<button
  disabled={!isInputValid}
  style={{
    backgroundColor: config.variant === "destructive"
      ? "var(--sn-color-destructive)"
      : "var(--sn-color-primary)",
  }}
  onClick={handleConfirm}
>
  {config.confirmLabel ?? "Confirm"}
</button>
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/actions/types.ts` — expand `ConfirmAction` interface |
| Modify | `src/ui/actions/confirm.ts` — variant, requireInput, custom labels |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/confirm.test.ts` | Add: destructive variant styling, requireInput blocks confirm until match, custom labels rendered. |

### Exit Criteria

- [ ] `{ "variant": "destructive" }` renders red confirm button.
- [ ] `{ "requireInput": "DELETE" }` shows input, disables confirm until "DELETE" typed.
- [ ] `{ "confirmLabel": "Yes, delete", "cancelLabel": "Keep it" }` shows custom labels.
- [ ] `{ "onCancel": { "type": "toast", ... } }` fires cancel action.
- [ ] Existing basic confirm still works (backwards compatible).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Five independent tracks:

| Track | Phases | Files Owned |
|---|---|---|
| Shortcuts | D.1 | `src/ui/shortcuts/*`, manifest schema (shortcuts key) |
| DnD | D.2 | `src/ui/components/_base/use-reorderable.ts`, list/data-table DnD wiring |
| Runtime | D.3, D.9 | `src/ui/hooks/use-infinite-scroll.ts`, `src/ui/hooks/use-poll.ts` |
| Forms | D.4, D.5 | `src/ui/components/forms/auto-form/use-field-deps.ts`, `validate.ts` |
| Actions | D.6, D.7, D.8, D.10 | `src/ui/actions/timing.ts`, `context-menu-portal.tsx`, executor extensions |

### File Conflicts

- **D.3 and D.9** both add hooks but to separate files — no conflict. Both touch data-table/list schemas. Run D.3 first, D.9 second.
- **D.4 and D.5** both modify auto-form. Run D.4 first (deps), then D.5 (validation).
- **D.6, D.7, D.8, D.10** all modify `executor.ts` and/or `types.ts`. Run sequentially within the Actions track.
- **D.1, D.2** are fully independent of each other and all other tracks.

### Why Tracks Are Independent

- **Shortcuts** only touches `src/ui/shortcuts/` and `manifest.shortcuts` schema key.
- **DnD** only touches list/data-table components and the new reorderable hook.
- **Runtime** adds new hooks and pagination schema changes.
- **Forms** is entirely within `src/ui/components/forms/auto-form/`.
- **Actions** extends the action executor and types.

Shared file: `src/ui/manifest/schema.ts` is touched by D.1 (shortcuts), D.3/D.9 (pagination/poll).
These must be coordinated — the Shortcuts track adds a top-level key, Runtime adds nested
props. Merge conflicts will be trivial and additive.

### Branch Strategy

```
branch: phase-d-interactivity
base: main
```

One branch, phases committed sequentially. Alternatively, one branch per track:

```
phase-d-shortcuts    (D.1)
phase-d-dnd          (D.2)
phase-d-runtime      (D.3, D.9)
phase-d-forms        (D.4, D.5)
phase-d-actions      (D.6, D.7, D.8, D.10)
```

### Recommended Order

1. D.8 (clipboard — simplest, ~20 lines)
2. D.6 (debounce/throttle — standalone utility)
3. D.10 (enhanced confirm — contained to confirm.ts)
4. D.1 (shortcuts — extends existing module)
5. D.4 (field deps — needed by D.5)
6. D.5 (validation — builds on D.4)
7. D.2 (DnD — uses existing hook)
8. D.7 (context menus — needs portal component)
9. D.3 (infinite scroll — new hook + component changes)
10. D.9 (polling — new hook + component changes, similar to D.3)

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Pick a track. Start with the simplest phase in that track.
4. For each phase:
   a. Create/modify files exactly as listed.
   b. Add JSDoc to all new exports.
   c. Run `bun run typecheck && bun test`.
   d. Run `bun run format:check`.
   e. Commit with message: `feat(phase-d.N): <title>`.
5. After all phases in a track:
   a. Run `bun run build`.
   b. Verify no `any` casts.
   c. Verify SSR safety (no browser APIs in render body).
6. Push branch, do not merge. Review before merge.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| D.3 IntersectionObserver not available in test env | Mock IntersectionObserver in test setup (already common pattern). |
| D.5 validation edge cases | Extensive unit tests for each rule type. |
| D.7 context menu positioning at viewport edges | Clamp coordinates to viewport bounds in portal. |
| D.9 polling memory leaks | Cleanup in useEffect return. Test with fake timers. |

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
- [ ] SSR safe — no `document`/`window`/`navigator` in render body.
- [ ] All new schema fields have JSDoc comments.
- [ ] Action vocabulary in `ACTION_TYPES` updated for new types.

### Documentation Checks

- [ ] JSDoc on `parseChord()`, `useInfiniteScroll`, `usePoll`, `useFieldDeps`, `validateForm`, `debounceAction`, `throttleAction`.
- [ ] All new schema fields documented with JSDoc.
- [ ] `src/ui.ts` exports updated for new hooks.

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All interactivity tests pass
```

- [ ] All 10 sub-phases have passing tests.
- [ ] Budget-fe can use shortcuts, DnD, infinite scroll, field deps, validation, polling, and context menus from manifest JSON alone.
- [ ] No TypeScript required for any interactivity feature.
