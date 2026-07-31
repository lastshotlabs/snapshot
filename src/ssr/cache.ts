// src/ssr/cache.ts
// Per-request memoization and ISR opt-out primitives.
//
// Rule 3 note: The `AsyncLocalStorage` instance below is module-level, but it is
// a *request-scoped state container* — it holds no state itself. All request state
// lives inside the value passed to `requestStore.run()`, which is created fresh per
// request and garbage-collected when the async context exits. This is the correct
// Node.js/Bun pattern for per-request context, not a singleton violation.

import { AsyncLocalStorage } from "node:async_hooks";
import { cache } from "react";

// ─── React's cache() — re-exported ───────────────────────────────────────────

/**
 * Per-request memoization for async functions.
 *
 * A thin re-export of React 19's built-in `cache()`. Memoizes the result of `fn`
 * for the duration of a single React render tree, keyed by argument identity.
 * The cache resets automatically between requests because each SSR render creates
 * a new tree — no manual invalidation is needed.
 *
 * @example
 * ```ts
 * import { cache } from '@lastshotlabs/snapshot/ssr';
 *
 * const getUser = cache(async (id: string) => {
 *   return db.users.findById(id);
 * });
 *
 * // Both loaders in the same render receive the same Promise — one DB call.
 * export async function load(ctx: SsrLoadContext) {
 *   const user = await getUser(ctx.params.id);
 *   return { data: { user } };
 * }
 * ```
 */
export { cache };

// ─── Per-request ISR opt-out store ───────────────────────────────────────────

interface RequestStore {
  /** Set to `true` when `unstable_noStore()` is called during this request. */
  noStore: boolean;
}

const requestStore = new AsyncLocalStorage<RequestStore>();

// ─── Public: unstable_noStore() ───────────────────────────────────────────────

/**
 * Opt the current request out of ISR caching.
 *
 * Call this inside a loader when the response must never be stored in the ISR
 * cache — for example, when the page contains personalised or real-time data.
 * The `revalidate` value returned by `load()` is ignored for this request; the
 * response is served fresh and never written to the cache.
 *
 * Must be called within the async context of `renderPage()` (i.e., inside a
 * loader invoked during SSR). Calling it outside that context is a no-op.
 *
 * @example
 * ```ts
 * import { unstable_noStore } from '@lastshotlabs/snapshot/ssr';
 *
 * export async function load(ctx: SsrLoadContext) {
 *   unstable_noStore(); // this response is never cached
 *   const feed = await getLiveActivityFeed(ctx.bsCtx);
 *   return { data: { feed } };
 * }
 * ```
 */
export function unstable_noStore(): void {
  const store = requestStore.getStore();
  if (store) store.noStore = true;
}

// ─── Internal: withRequestStore() ────────────────────────────────────────────

/**
 * Wraps a render function with a fresh per-request `AsyncLocalStorage` context.
 *
 * Called by `renderPage()` before invoking loaders. The `RequestStore` object
 * created here is the single source of truth for `unstable_noStore()` and
 * `getNoStore()` throughout the lifetime of the async render.
 *
 * @param fn - The async function to execute within the request context.
 * @returns The return value of `fn`.
 *
 * @internal
 */
export function withRequestStore<T>(fn: () => Promise<T>): Promise<T> {
  return requestStore.run({ noStore: false }, fn);
}

// ─── Internal: getNoStore() ──────────────────────────────────────────────────

/**
 * Returns whether `unstable_noStore()` was called during the current request.
 *
 * Read by the ISR middleware *after* the renderer returns, via the `IsrSink`
 * mechanism (see `snapshot/src/ssr/render.ts`). Returns `false` when called
 * outside a request context (e.g. in background regeneration where the
 * original AsyncLocalStorage context has already exited).
 *
 * @returns `true` if `unstable_noStore()` was called; `false` otherwise.
 *
 * @internal
 */
export function getNoStore(): boolean {
  return requestStore.getStore()?.noStore ?? false;
}
