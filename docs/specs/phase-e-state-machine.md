# Phase E: State Machine — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | E.1 | Expression Language | Not started | Expressions |
> | E.2 | Computed State | Not started | State |
> | E.3 | URL State Sync | Not started | State |
> | E.4 | Persistent State | Not started | State |
> | E.5 | Client-Side Filter/Sort | Not started | Data |
> | E.6 | Branch Action | Not started | Actions |
> | E.7 | For-Each Action | Not started | Actions |
>
> **Priority:** P1 — enables dynamic, reactive UIs without custom code.
> **Depends on:** Phase A (CSS Foundation), Phase D (Interactivity — D.4/D.5 for form field expressions).
> **Blocks:** Phase F (Real-Time) benefits from E.1 expressions for event condition evaluation.

---

## Vision

### Before (Today)

Snapshot has a robust data binding system (`from-ref` with 14 transforms, `resolveTemplate`,
`resolveFromRef`, policy expressions) and a state layer (Jotai atoms via `AppContext`/
`PageContext`). But there are gaps:

1. **No general expression language.** The expression parser in `src/ui/expressions/parser.ts`
   supports `||`, `&&`, `==`, `!=`, `>=`, `<=`, `>`, `<`, `!`, and built-in functions
   (`defined`, `empty`, `length`). But it has no arithmetic (`+`, `-`, `*`, `/`), no ternary
   (`? :`), no string operations (`concat`, `includes`), and no `Math`/`String` builtins.
   Consumers cannot write `{ "expr": "price * quantity" }` or `{ "expr": "status == 'active' ? 'Yes' : 'No'" }`.
2. **No computed state.** State atoms are simple read/write. There is no way to declare
   derived state like `{ "compute": "{ subtotal } + { tax }" }` that auto-updates when
   dependencies change.
3. **No URL state sync.** Data-table filters, sort, and tab selection do not sync to URL
   query params. Refreshing or sharing a URL loses UI state.
4. **No persistent state.** State resets on page refresh. No `localStorage`/`sessionStorage`
   persistence.
5. **No client-side filter/sort.** All filtering and sorting requires an API call. Small
   datasets cannot be filtered in-memory.
6. **No branch action.** The action vocabulary has no conditional execution. No way to do
   "if X, do action A, else do action B" without a workflow.
7. **No for-each action.** No way to execute an action for each item in a list.

### After (This Spec)

1. Full expression language: arithmetic, ternary, string ops, Math/String builtins.
2. `{ "compute": "..." }` in state definitions for derived atoms.
3. `urlSync` prop on data-table and tabs syncs state to URL query params.
4. `persist` prop on state definitions for localStorage/sessionStorage.
5. `clientFilter`/`clientSort` on data components for in-memory operations.
6. `branch` action type for conditional execution.
7. `for-each` action type for iterating over lists.

---

## What Already Exists on Main

### Expression Parser

| File | Lines | What Exists |
|---|---|---|
| `src/ui/expressions/parser.ts` | ~200 | Tokenizer + recursive-descent parser. Supports: `\|\|`, `&&`, `==`, `!=`, `>=`, `<=`, `>`, `<`, `!`. Built-in functions: `defined(ref)`, `empty(ref)`, `length(ref)`. Returns AST, evaluates against context. Never uses `eval()`. |
| `src/ui/expressions/template.ts` | ~100 | `resolveTemplate()` — replaces `{ref}` placeholders in strings with context values. |
| `src/ui/expressions/use-expression.ts` | ~30 | `useExpression()` hook — evaluates an expression string in React context. |

### State System

| File | Lines | What Exists |
|---|---|---|
| `src/ui/context/providers.tsx` | ~150 | `AppContextProvider`, `PageContextProvider`. Creates Jotai atom registries. |
| `src/ui/context/registry.ts` | ~100 | `AtomRegistry` — maps string IDs to Jotai atoms. `get(id)`, `set(id, value)`. |
| `src/ui/context/from-ref.ts` | ~200 | `resolveFromRef()` — resolves `{ from: "id" }` refs with 14 transforms: uppercase, lowercase, trim, length, number, boolean, string, json, keys, values, first, last, count, sum, join, split, default. |
| `src/ui/context/hooks.ts` | ~80 | `usePublish()`, `useSubscribe()`, `useResolveFrom()`. |
| `src/ui/state/hooks.ts` | ~60 | `useStateValue()`, `useSetStateValue()`. |
| `src/ui/state/registry.ts` | ~50 | State atom registry. |
| `src/ui/state/types.ts` | ~30 | State types. |

### Policy Expressions

| File | Lines | What Exists |
|---|---|---|
| `src/ui/policies/evaluate.ts` | ~100 | `evaluatePolicy()` — evaluates policy expressions for guard/visibility logic. |
| `src/ui/policies/types.ts` | ~20 | `PolicyExpr` type. |

### Data Components

| File | What |
|---|---|
| `src/ui/components/data/data-table/component.tsx` | Data table with server-side pagination, sort, and search. No client-side filter/sort. |
| `src/ui/components/navigation/tabs/component.tsx` | Tab component. No URL sync. |

### Action Executor

| File | What |
|---|---|
| `src/ui/actions/executor.ts` | Handles 17 action types. No `branch` or `for-each`. |
| `src/ui/workflows/engine.ts` | Workflow engine with step execution. Separate from action executor. |

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
| `src/ui/expressions/parser.ts` | Expression tokenizer + parser + evaluator | ~200 |
| `src/ui/expressions/template.ts` | Template string resolver | ~100 |
| `src/ui/expressions/use-expression.ts` | Expression React hook | ~30 |
| `src/ui/context/from-ref.ts` | FromRef resolver with 14 transforms | ~200 |
| `src/ui/context/registry.ts` | Jotai atom registry | ~100 |
| `src/ui/context/hooks.ts` | Context hooks (publish, subscribe, resolveFrom) | ~80 |
| `src/ui/state/hooks.ts` | State value hooks | ~60 |
| `src/ui/policies/evaluate.ts` | Policy expression evaluator | ~100 |
| `src/ui/actions/executor.ts` | Action executor (17 types) | ~400 |
| `src/ui/actions/types.ts` | Action type definitions | ~200 |
| `src/ui/manifest/schema.ts` | All manifest schemas | ~1400 |
| `src/ui/workflows/engine.ts` | Workflow step engine | ~300 |

---

## Non-Negotiable Engineering Constraints

1. **No `eval()`** — expression evaluation is always AST-based. The existing parser uses
   recursive descent. Extend it, do not replace it with `eval()` or `new Function()`.
2. **Manifest-only** (Rule: Config-Driven UI #6) — all state features configurable from JSON.
3. **No `any`** (Rule: Code Patterns #3) — strict types on all expression nodes and state types.
4. **One code path** (Rule: Config-Driven UI #1) — extend existing `resolveFromRef`, not a parallel system.
5. **SSR safe** (Rule: SSR #3) — localStorage/sessionStorage access in `useEffect` only.
6. **Semantic tokens** — any UI rendered by filter/sort controls uses `--sn-*` tokens.
7. **Backwards compatible** — existing expressions, from-refs, and state continue to work unchanged.

---

## Phase E.1: Expression Language

### Goal

Extend `src/ui/expressions/parser.ts` to support arithmetic (`+`, `-`, `*`, `/`, `%`),
ternary (`? :`), string concatenation, and safe builtins (`Math.floor`, `Math.ceil`,
`Math.round`, `Math.abs`, `Math.min`, `Math.max`, `String.includes`, `String.startsWith`,
`String.endsWith`, `String.toLowerCase`, `String.toUpperCase`, `String.trim`,
`String.length`). Add `{ "expr": "..." }` as a recognized key in `useResolveFrom()`.

### Types

Extend the AST node types in `src/ui/expressions/parser.ts`:

```ts
type AstNode =
  // existing
  | { type: "literal"; value: unknown }
  | { type: "ref"; path: string }
  | { type: "call"; name: "defined" | "empty" | "length"; ref: string }
  | { type: "unary"; operator: "!" | "-"; operand: AstNode }
  | { type: "binary"; operator: string; left: AstNode; right: AstNode }
  // new
  | { type: "ternary"; condition: AstNode; consequent: AstNode; alternate: AstNode }
  | {
      type: "method-call";
      object: AstNode;
      method: string;
      args: AstNode[];
    }
  | {
      type: "builtin-call";
      namespace: "Math" | "String";
      method: string;
      args: AstNode[];
    };
```

Zod schema for expression values in manifest:

```ts
/**
 * An expression value. Evaluated safely via AST parsing.
 * Supports arithmetic, comparison, ternary, string ops, and builtins.
 *
 * Examples:
 *   { "expr": "price * quantity" }
 *   { "expr": "status == 'active' ? 'Yes' : 'No'" }
 *   { "expr": "Math.floor(total / count)" }
 *   { "expr": "String.includes(name, 'admin')" }
 */
export const exprSchema = z.object({
  expr: z.string(),
});
```

### Implementation

**1. Extend tokenizer in `src/ui/expressions/parser.ts`:**

Add tokens for: `+`, `-`, `*`, `/`, `%`, `?`, `:`, `.`, `,`, `(`, `)`.

```ts
const OPERATOR_TOKENS = [
  "||", "&&", "==", "!=", ">=", "<=", ">", "<", "!",
  "+", "-", "*", "/", "%",  // arithmetic
  "?", ":",                  // ternary
];
```

**2. Extend parser:**

Precedence (low to high):
1. Ternary (`? :`)
2. Logical OR (`||`)
3. Logical AND (`&&`)
4. Equality (`==`, `!=`)
5. Comparison (`>`, `<`, `>=`, `<=`)
6. Addition/subtraction (`+`, `-`)
7. Multiplication/division/modulo (`*`, `/`, `%`)
8. Unary (`!`, `-`)
9. Method calls (`Math.floor(x)`)
10. Primary (literals, refs, parenthesized)

```ts
function parseTernary(tokens: Token[], pos: number, ctx: ExpressionContext): { node: AstNode; pos: number } {
  let { node: condition, pos: nextPos } = parseOr(tokens, pos, ctx);

  if (tokens[nextPos]?.value === "?") {
    nextPos += 1; // skip ?
    const { node: consequent, pos: afterCons } = parseTernary(tokens, nextPos, ctx);

    if (tokens[afterCons]?.value !== ":") {
      throw new Error("Expected ':' in ternary expression");
    }

    const { node: alternate, pos: afterAlt } = parseTernary(tokens, afterCons + 1, ctx);
    return {
      node: { type: "ternary", condition, consequent, alternate },
      pos: afterAlt,
    };
  }

  return { node: condition, pos: nextPos };
}
```

**3. Add safe builtins allowlist:**

```ts
const SAFE_BUILTINS: Record<string, Record<string, (...args: unknown[]) => unknown>> = {
  Math: {
    floor: (x: unknown) => Math.floor(Number(x)),
    ceil: (x: unknown) => Math.ceil(Number(x)),
    round: (x: unknown) => Math.round(Number(x)),
    abs: (x: unknown) => Math.abs(Number(x)),
    min: (...args: unknown[]) => Math.min(...args.map(Number)),
    max: (...args: unknown[]) => Math.max(...args.map(Number)),
  },
  String: {
    includes: (str: unknown, search: unknown) => String(str).includes(String(search)),
    startsWith: (str: unknown, search: unknown) => String(str).startsWith(String(search)),
    endsWith: (str: unknown, search: unknown) => String(str).endsWith(String(search)),
    toLowerCase: (str: unknown) => String(str).toLowerCase(),
    toUpperCase: (str: unknown) => String(str).toUpperCase(),
    trim: (str: unknown) => String(str).trim(),
    length: (str: unknown) => String(str).length,
    slice: (str: unknown, start: unknown, end?: unknown) =>
      String(str).slice(Number(start), end !== undefined ? Number(end) : undefined),
  },
};
```

**4. Integrate with `useResolveFrom()`:**

In `src/ui/context/from-ref.ts` or `src/ui/context/hooks.ts`, when resolving a value,
check for the `expr` key:

```ts
function resolveValue(config: unknown, context: ResolveFromRefContext): unknown {
  if (config && typeof config === "object" && "expr" in config) {
    return evaluateExpression((config as { expr: string }).expr, buildExprContext(context));
  }
  if (config && typeof config === "object" && "from" in config) {
    return resolveFromRef(config as FromRef, context);
  }
  return config;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/expressions/parser.ts` — arithmetic, ternary, method calls, builtins |
| Modify | `src/ui/context/from-ref.ts` — handle `{ expr: "..." }` alongside `{ from: "..." }` |
| Modify | `src/ui/context/hooks.ts` — `useResolveFrom` handles expr |
| Modify | `src/ui/manifest/schema.ts` — add `exprSchema` |

### Documentation Impact

- JSDoc on all new AST node types.
- JSDoc on `SAFE_BUILTINS` with examples.
- Update `docs/expressions.md` if it exists, or create it.

### Tests

| File | What |
|---|---|
| `src/ui/expressions/__tests__/parser.test.ts` | Add: arithmetic (`2 + 3` = 5, `price * qty`), ternary (`x > 0 ? 'yes' : 'no'`), modulo, builtins (`Math.floor(3.7)` = 3, `String.includes('hello', 'ell')` = true), precedence (2 + 3 * 4 = 14). |
| `src/ui/context/__tests__/from-ref.test.ts` | Add: `{ expr: "a + b" }` resolves with context values. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `exprSchema` validates `{ expr: "..." }`. |

### Exit Criteria

- [ ] `{ "expr": "price * quantity" }` evaluates to correct product.
- [ ] `{ "expr": "status == 'active' ? 'Yes' : 'No'" }` evaluates ternary correctly.
- [ ] `{ "expr": "Math.floor(total / count)" }` uses safe Math builtin.
- [ ] `{ "expr": "String.includes(name, 'admin')" }` calls safe String builtin.
- [ ] `{ "expr": "2 + 3 * 4" }` respects precedence (= 14, not 20).
- [ ] Unknown builtins throw a parse error (no arbitrary code execution).
- [ ] Existing `||`, `&&`, `==` expressions continue to work.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase E.2: Computed State

### Goal

Add `{ "compute": "..." }` in state definitions. Creates a Jotai derived atom that
re-evaluates when its dependencies change.

### Types

```ts
/**
 * A computed state value. The expression is evaluated against the current
 * state context. Dependencies are auto-detected from {ref} references.
 *
 * Example:
 *   { "id": "total", "compute": "{ subtotal } + { tax }" }
 */
export const computedStateSchema = z.object({
  /** Unique state identifier. */
  id: z.string(),
  /** Expression to compute. References to other state values use {id} syntax. */
  compute: z.string(),
});

/**
 * State definition — either a simple value or a computed expression.
 */
export const stateDefinitionSchema = z.union([
  z.object({
    id: z.string(),
    defaultValue: z.unknown(),
    persist: z.enum(["localStorage", "sessionStorage"]).optional(),
  }),
  computedStateSchema,
]);
```

### Implementation

**1. Update `src/ui/state/registry.ts`:**

When a state definition has `compute`, create a Jotai `atom((get) => ...)` that:
- Parses `{ref}` references in the compute string.
- Subscribes to each referenced atom via `get(atomRegistry.get(ref))`.
- Evaluates the expression with current values.

```ts
import { atom } from "jotai";
import { evaluateExpression } from "../expressions/parser";

export function createComputedAtom(
  computeExpr: string,
  registry: AtomRegistry,
): ReturnType<typeof atom> {
  // Extract {ref} dependencies from the expression
  const deps = extractDependencies(computeExpr);

  return atom((get) => {
    const context: Record<string, unknown> = {};
    for (const dep of deps) {
      const depAtom = registry.get(dep);
      if (depAtom) {
        context[dep] = get(depAtom);
      }
    }
    return evaluateExpression(computeExpr, context);
  });
}

function extractDependencies(expr: string): string[] {
  const refs: string[] = [];
  const regex = /\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    refs.push(match[1]!.trim());
  }
  return [...new Set(refs)];
}
```

**2. Update state initialization in `src/ui/context/providers.tsx`:**

During page/app context setup, iterate state definitions. For `compute` defs,
call `createComputedAtom`. For simple defs, create regular atoms.

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/state/registry.ts` — add `createComputedAtom()` |
| Modify | `src/ui/state/types.ts` — add computed state types |
| Modify | `src/ui/context/providers.tsx` — register computed atoms |
| Modify | `src/ui/manifest/schema.ts` — add `computedStateSchema`, `stateDefinitionSchema` |

### Tests

| File | What |
|---|---|
| `src/ui/state/__tests__/registry.test.ts` | Add: computed atom evaluates expression, re-evaluates when dependency changes, circular detection. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: computed state validates, simple state validates. |

### Exit Criteria

- [ ] `{ "id": "total", "compute": "{ subtotal } + { tax }" }` creates derived atom.
- [ ] Changing `subtotal` or `tax` automatically re-evaluates `total`.
- [ ] Computed state can reference other computed state (chained derivations).
- [ ] Circular references are detected and throw a clear error at compile time.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase E.3: URL State Sync

### Goal

Add `urlSync` prop to data-table and tabs. Maps component state to URL query parameters.
Refreshing the page restores the state. Sharing the URL reproduces the same view.

### Types

```ts
/**
 * URL state synchronization config.
 * Maps component state keys to URL query parameter names.
 */
export const urlSyncConfigSchema = z.union([
  z.boolean(),
  z.object({
    /** Map of state key to URL param name. */
    params: z.record(z.string(), z.string()),
    /** Replace history entry instead of pushing. Default: true. */
    replace: z.boolean().default(true),
  }),
]);
```

For data-table: `urlSync: true` syncs `page`, `pageSize`, `sort`, `sortDirection`, `search`.

For tabs: `urlSync: true` syncs `activeTab`.

### Implementation

**1. Create `src/ui/hooks/use-url-sync.ts`:**

```ts
'use client';

import { useEffect, useCallback, useRef } from "react";

export interface UseUrlSyncOptions {
  /** Map of state key to URL param name. */
  params: Record<string, string>;
  /** Current state values. */
  state: Record<string, unknown>;
  /** Callback when URL params should update state. */
  onStateFromUrl: (state: Record<string, string>) => void;
  /** Replace or push history entries. */
  replace?: boolean;
  /** Whether sync is enabled. */
  enabled: boolean;
}

/**
 * Bidirectional sync between component state and URL query parameters.
 *
 * On mount: reads URL params and calls onStateFromUrl.
 * On state change: updates URL params.
 * On popstate: reads URL params and calls onStateFromUrl.
 */
export function useUrlSync(options: UseUrlSyncOptions): void {
  const { params, state, onStateFromUrl, replace = true, enabled } = options;
  const isInitialized = useRef(false);

  // Read from URL on mount
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const stateFromUrl: Record<string, string> = {};
    let hasParams = false;

    for (const [stateKey, paramName] of Object.entries(params)) {
      const value = urlParams.get(paramName);
      if (value !== null) {
        stateFromUrl[stateKey] = value;
        hasParams = true;
      }
    }

    if (hasParams) {
      onStateFromUrl(stateFromUrl);
    }

    isInitialized.current = true;
  }, [enabled]); // Only on mount

  // Write to URL on state change
  useEffect(() => {
    if (!enabled || !isInitialized.current || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    for (const [stateKey, paramName] of Object.entries(params)) {
      const value = state[stateKey];
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(paramName, String(value));
      } else {
        url.searchParams.delete(paramName);
      }
    }

    const newUrl = url.pathname + url.search;
    if (newUrl !== window.location.pathname + window.location.search) {
      if (replace) {
        window.history.replaceState(null, "", newUrl);
      } else {
        window.history.pushState(null, "", newUrl);
      }
    }
  }, [enabled, state, params, replace]);

  // Listen for popstate (back/forward navigation)
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    function handlePopstate() {
      const urlParams = new URLSearchParams(window.location.search);
      const stateFromUrl: Record<string, string> = {};
      for (const [stateKey, paramName] of Object.entries(params)) {
        const value = urlParams.get(paramName);
        if (value !== null) {
          stateFromUrl[stateKey] = value;
        }
      }
      onStateFromUrl(stateFromUrl);
    }

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [enabled, params, onStateFromUrl]);
}
```

**2. Update data-table component** to call `useUrlSync` when `urlSync` is truthy.

**3. Update tabs component** to call `useUrlSync` when `urlSync` is truthy.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/hooks/use-url-sync.ts` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `urlSync` |
| Modify | `src/ui/components/data/data-table/component.tsx` — wire `useUrlSync` |
| Modify | `src/ui/components/navigation/tabs/schema.ts` — add `urlSync` |
| Modify | `src/ui/components/navigation/tabs/component.tsx` — wire `useUrlSync` |
| Modify | `src/ui.ts` — export `useUrlSync` |

### Tests

| File | What |
|---|---|
| `src/ui/hooks/__tests__/use-url-sync.test.ts` (create) | Tests: reads params from URL on mount, writes state to URL, handles popstate, does nothing when disabled. |
| `src/ui/components/data/data-table/__tests__/schema.test.ts` | Add: `urlSync: true` accepted. |
| `src/ui/components/navigation/tabs/__tests__/schema.test.ts` | Add: `urlSync: true` accepted. |

### Exit Criteria

- [ ] `{ "type": "data-table", "urlSync": true }` syncs page/sort/search to URL.
- [ ] Refreshing the page restores data-table state from URL params.
- [ ] `{ "type": "tabs", "urlSync": true }` syncs active tab to `?tab=X`.
- [ ] Browser back/forward updates component state.
- [ ] SSR safe — `window.location` in `useEffect` only.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase E.4: Persistent State

### Goal

Add `persist: "localStorage" | "sessionStorage"` on state definitions. Read from storage
on mount, write on change.

### Types

```ts
// In stateDefinitionSchema (already defined in E.2):
z.object({
  id: z.string(),
  defaultValue: z.unknown(),
  /** Persist this state value to browser storage. */
  persist: z.enum(["localStorage", "sessionStorage"]).optional(),
})
```

### Implementation

**1. Create `src/ui/state/persist.ts`:**

```ts
'use client';

/**
 * Read a state value from browser storage.
 * Returns undefined if not found or on SSR.
 */
export function readPersistedState(key: string, storage: "localStorage" | "sessionStorage"): unknown {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window[storage].getItem(`sn-state:${key}`);
    return raw !== null ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Write a state value to browser storage.
 * No-op on SSR.
 */
export function writePersistedState(key: string, value: unknown, storage: "localStorage" | "sessionStorage"): void {
  if (typeof window === "undefined") return;
  try {
    window[storage].setItem(`sn-state:${key}`, JSON.stringify(value));
  } catch {
    // Storage full or disabled — silently ignore
  }
}

/**
 * Remove a state value from browser storage.
 */
export function clearPersistedState(key: string, storage: "localStorage" | "sessionStorage"): void {
  if (typeof window === "undefined") return;
  try {
    window[storage].removeItem(`sn-state:${key}`);
  } catch {
    // Ignore
  }
}
```

**2. Create `src/ui/state/use-persisted-atom.ts`:**

```ts
'use client';

import { useEffect } from "react";
import { useAtom } from "jotai";
import type { PrimitiveAtom } from "jotai";
import { readPersistedState, writePersistedState } from "./persist";

/**
 * Wraps a Jotai atom with persistence to browser storage.
 * On mount, reads from storage and sets atom value.
 * On change, writes to storage.
 */
export function usePersistedAtom<T>(
  atom: PrimitiveAtom<T>,
  key: string,
  storage: "localStorage" | "sessionStorage",
): [T, (value: T) => void] {
  const [value, setValue] = useAtom(atom);

  // Read on mount
  useEffect(() => {
    const persisted = readPersistedState(key, storage);
    if (persisted !== undefined) {
      setValue(persisted as T);
    }
  }, [key, storage]); // Only on mount

  // Write on change
  useEffect(() => {
    writePersistedState(key, value, storage);
  }, [key, value, storage]);

  return [value, setValue];
}
```

**3. Wire into state providers** — when a state definition has `persist`, use
`usePersistedAtom` instead of plain `useAtom`.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/state/persist.ts` |
| Create | `src/ui/state/use-persisted-atom.ts` |
| Modify | `src/ui/state/hooks.ts` — integrate persistence |
| Modify | `src/ui/context/providers.tsx` — read persisted initial values |

### Tests

| File | What |
|---|---|
| `src/ui/state/__tests__/persist.test.ts` (create) | Tests: read/write/clear with mock storage, SSR returns undefined, handles parse errors. |
| `src/ui/state/__tests__/use-persisted-atom.test.ts` (create) | Tests: reads initial from storage, writes on change, handles missing key. |

### Exit Criteria

- [ ] `{ "persist": "localStorage" }` persists state value to localStorage.
- [ ] Refreshing the page restores persisted state.
- [ ] `{ "persist": "sessionStorage" }` persists to sessionStorage.
- [ ] SSR safe — no storage access in render.
- [ ] Storage key is namespaced: `sn-state:{id}`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase E.5: Client-Side Filter/Sort

### Goal

Add `clientFilter` and `clientSort` props to data components. Enables in-memory filtering
and sorting without API calls. Useful for small datasets already fetched.

### Types

```ts
/**
 * Client-side filter configuration.
 * Applied in-memory after data is fetched.
 */
export const clientFilterSchema = z.object({
  /** The field/key to filter on. */
  field: z.string(),
  /** Filter operator. */
  operator: z.enum(["equals", "contains", "startsWith", "endsWith", "gt", "lt", "gte", "lte", "in", "notEquals"]),
  /** The value to filter against. Can be a literal or a FromRef. */
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.unknown()), fromRefSchema]),
});

/**
 * Client-side sort configuration.
 */
export const clientSortSchema = z.object({
  /** The field/key to sort by. */
  field: z.string(),
  /** Sort direction. */
  direction: z.enum(["asc", "desc"]).default("asc"),
});
```

### Implementation

**1. Create `src/ui/components/_base/client-data-ops.ts`:**

```ts
/**
 * Client-side data operations — filter and sort.
 * Pure functions, no React dependency.
 */

import { getNestedValue } from "../../context/utils";

export interface ClientFilter {
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte" | "in" | "notEquals";
  value: unknown;
}

export interface ClientSort {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Apply client-side filters to a dataset.
 */
export function applyClientFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: ClientFilter[],
): T[] {
  return data.filter((item) =>
    filters.every((filter) => matchesFilter(item, filter)),
  );
}

function matchesFilter(item: Record<string, unknown>, filter: ClientFilter): boolean {
  const fieldValue = getNestedValue(item, filter.field);
  const filterValue = filter.value;

  switch (filter.operator) {
    case "equals":
      return fieldValue === filterValue;
    case "notEquals":
      return fieldValue !== filterValue;
    case "contains":
      return String(fieldValue).includes(String(filterValue));
    case "startsWith":
      return String(fieldValue).startsWith(String(filterValue));
    case "endsWith":
      return String(fieldValue).endsWith(String(filterValue));
    case "gt":
      return Number(fieldValue) > Number(filterValue);
    case "lt":
      return Number(fieldValue) < Number(filterValue);
    case "gte":
      return Number(fieldValue) >= Number(filterValue);
    case "lte":
      return Number(fieldValue) <= Number(filterValue);
    case "in":
      return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    default:
      return true;
  }
}

/**
 * Apply client-side sorting to a dataset.
 */
export function applyClientSort<T extends Record<string, unknown>>(
  data: T[],
  sorts: ClientSort[],
): T[] {
  return [...data].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = getNestedValue(a, sort.field);
      const bVal = getNestedValue(b, sort.field);
      const comparison = compareValues(aVal, bVal);
      if (comparison !== 0) {
        return sort.direction === "desc" ? -comparison : comparison;
      }
    }
    return 0;
  });
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}
```

**2. Wire into data components** — apply filters and sorts after data fetch, before render.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/client-data-ops.ts` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `clientFilter`, `clientSort` |
| Modify | `src/ui/components/data/data-table/component.tsx` — apply filters/sorts |
| Modify | `src/ui/components/data/list/schema.ts` — add `clientFilter`, `clientSort` |
| Modify | `src/ui/components/data/list/component.tsx` — apply filters/sorts |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/client-data-ops.test.ts` (create) | Tests: each filter operator, multi-filter AND, sort asc/desc, multi-sort, nested field access. |

### Exit Criteria

- [ ] `{ "clientFilter": [{ "field": "status", "operator": "equals", "value": "active" }] }` filters in-memory.
- [ ] `{ "clientSort": [{ "field": "name", "direction": "asc" }] }` sorts in-memory.
- [ ] Filters accept `{ from: "search-input" }` for dynamic values.
- [ ] Multiple filters apply as AND.
- [ ] Multiple sorts apply in order (primary, secondary).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase E.6: Branch Action

### Goal

Add `branch` action type for conditional execution: `{ "type": "branch", "condition": "...", "then": [...], "else": [...] }`.

### Types

```ts
export interface BranchAction {
  type: "branch";
  /**
   * Condition expression. Evaluated against action context.
   * Uses the expression language from E.1.
   */
  condition: string;
  /** Action(s) to execute when condition is truthy. */
  then: ActionConfig | ActionConfig[];
  /** Action(s) to execute when condition is falsy. */
  else?: ActionConfig | ActionConfig[];
}
```

### Implementation

Add to `src/ui/actions/executor.ts`:

```ts
case "branch": {
  const result = evaluateExpression(action.condition, mergedContext);
  const branch = result ? action.then : action.else;
  if (branch) {
    const actions = Array.isArray(branch) ? branch : [branch];
    for (const branchAction of actions) {
      await executeAction(branchAction, mergedContext);
    }
  }
  break;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/actions/types.ts` — add `BranchAction`, add `"branch"` to `ACTION_TYPES` |
| Modify | `src/ui/actions/executor.ts` — handle `branch` |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/executor.test.ts` | Add: branch executes `then` when true, executes `else` when false, skips `else` when missing and false. |

### Exit Criteria

- [ ] `{ "type": "branch", "condition": "role == 'admin'", "then": { "type": "navigate", "to": "/admin" }, "else": { "type": "navigate", "to": "/home" } }` navigates conditionally.
- [ ] Complex conditions work: `{ "condition": "count > 0 && status == 'active'" }`.
- [ ] Missing `else` with false condition does nothing (no error).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase E.7: For-Each Action

### Goal

Add `for-each` action type for iterating over a list and executing an action per item.

### Types

```ts
export interface ForEachAction {
  type: "for-each";
  /**
   * The items to iterate over.
   * Can be a FromRef, a literal array, or an expression.
   */
  items: unknown[] | { from: string } | { expr: string };
  /**
   * Action to execute for each item.
   * Each iteration has `{item}`, `{index}`, `{items}` in context.
   */
  action: ActionConfig;
  /** Action to execute after all iterations complete. */
  onComplete?: ActionConfig;
}
```

### Implementation

Add to `src/ui/actions/executor.ts`:

```ts
case "for-each": {
  let items: unknown[];
  if (Array.isArray(action.items)) {
    items = action.items;
  } else if ("from" in action.items) {
    const resolved = resolveFromRef(action.items as FromRef, fromRefContext);
    items = Array.isArray(resolved) ? resolved : [];
  } else if ("expr" in action.items) {
    const resolved = evaluateExpression((action.items as { expr: string }).expr, mergedContext);
    items = Array.isArray(resolved) ? resolved : [];
  } else {
    items = [];
  }

  for (let index = 0; index < items.length; index++) {
    const itemContext = {
      ...mergedContext,
      item: items[index],
      index,
      items,
    };
    await executeAction(action.action, itemContext);
  }

  if (action.onComplete) {
    await executeAction(action.onComplete, mergedContext);
  }
  break;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/actions/types.ts` — add `ForEachAction`, add `"for-each"` to `ACTION_TYPES` |
| Modify | `src/ui/actions/executor.ts` — handle `for-each` |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/executor.test.ts` | Add: for-each executes action per item, provides item/index/items context, fires onComplete, empty array skips to onComplete. |

### Exit Criteria

- [ ] `{ "type": "for-each", "items": { "from": "selected-items" }, "action": { "type": "api", "method": "DELETE", ... } }` deletes each selected item.
- [ ] `{item}`, `{index}`, `{items}` available in action context.
- [ ] `onComplete` fires after all iterations.
- [ ] Empty items array fires `onComplete` immediately.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Three independent tracks:

| Track | Phases | Files Owned |
|---|---|---|
| Expressions | E.1 | `src/ui/expressions/parser.ts`, `src/ui/context/from-ref.ts` (expr key handling) |
| State | E.2, E.3, E.4 | `src/ui/state/*`, `src/ui/hooks/use-url-sync.ts`, `src/ui/context/providers.tsx` |
| Data | E.5 | `src/ui/components/_base/client-data-ops.ts`, data-table/list schemas |
| Actions | E.6, E.7 | `src/ui/actions/executor.ts`, `src/ui/actions/types.ts` |

### Why Tracks Are Independent

- **Expressions** modifies the parser and context resolution — foundational, no component changes.
- **State** adds computed atoms, URL sync, and persistence — entirely within `src/ui/state/` and hooks.
- **Data** adds client-side filter/sort — new utility file + schema changes on data components.
- **Actions** extends the action executor — contained to `src/ui/actions/`.

### File Conflicts

- E.1 and E.2 share a dependency: E.2 uses `evaluateExpression` from E.1. **E.1 must complete first.**
- E.6 uses `evaluateExpression` from E.1 for condition evaluation. **E.1 must complete first.**
- E.3 and E.4 are independent within the State track but both touch `src/ui/state/`. Run sequentially.
- E.5 touches data-table/list schemas. Independent of State and Actions tracks.

### Recommended Order

1. **E.1** (expression language — everything else depends on it)
2. **E.6** (branch action — uses expressions, small scope)
3. **E.7** (for-each action — independent of E.6 within Actions)
4. **E.2** (computed state — uses expressions)
5. **E.5** (client filter/sort — independent)
6. **E.3** (URL sync — independent hook)
7. **E.4** (persistent state — builds on state infrastructure)

### Branch Strategy

```
branch: phase-e-state-machine
base: main
```

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Start with E.1 (foundation for E.2, E.6).
4. For each phase:
   a. Create/modify files exactly as listed.
   b. Add JSDoc to all new exports.
   c. Run `bun run typecheck && bun test`.
   d. Run `bun run format:check`.
   e. Commit with message: `feat(phase-e.N): <title>`.
5. After all phases:
   a. Run `bun run build`.
   b. Verify no `eval()` anywhere in expression code.
   c. Verify SSR safety.
6. Push branch, do not merge.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Expression parser complexity | Extensive parser tests with precedence edge cases. |
| Computed state circular deps | Detect cycles at registration time, throw clear error. |
| URL sync race conditions | Use ref flag to prevent write-back on initial read. |
| Storage quota exceeded | Catch errors silently in persist.ts. |

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Per-Track Checks

- [ ] No `eval()` or `new Function()` in any expression code.
- [ ] No `any` casts.
- [ ] All new exports have JSDoc.
- [ ] SSR safe — no `window`/`document`/`localStorage` in render body.

### Documentation Checks

- [ ] JSDoc on all new AST node types, builtins, state functions, hooks.
- [ ] All new schema fields documented with JSDoc.
- [ ] `src/ui.ts` exports updated for new hooks and utilities.

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All state machine tests pass
```

- [ ] All 7 sub-phases have passing tests.
- [ ] Expressions evaluate arithmetic, ternary, and builtins correctly.
- [ ] Computed state updates reactively.
- [ ] URL sync round-trips correctly.
- [ ] Client-side filter/sort works on static datasets.
- [ ] Branch and for-each actions execute conditionally/iteratively.
- [ ] No TypeScript required for any state feature.
