// src/ssr/ppr-cache.ts
// In-memory PPR (Partial Prerendering) shell cache.
// Stores pre-computed static shells keyed by route path.
// Populated once at build time; read on every subsequent request.

import type { PprShell } from "./ppr";

// ─── Cache entry ──────────────────────────────────────────────────────────────

/**
 * A single entry in the PPR shell cache.
 *
 * Stored by `PprCache.set()` after build-time shell extraction.
 * Retrieved by `PprCache.get()` at request time to serve the shell immediately.
 */
export interface PprCacheEntry {
  /**
   * The pre-rendered static HTML shell for this route.
   * Includes Suspense fallbacks rendered in-place.
   */
  shellHtml: string;
  /**
   * Unix timestamp (milliseconds) when this entry was cached.
   * Useful for diagnostics and cache-age metrics.
   */
  cachedAt: number;
}

// ─── Cache interface ──────────────────────────────────────────────────────────

/**
 * Interface for the PPR static shell cache.
 *
 * Implementations are free to use any backing store; the default produced by
 * `createPprCache()` is in-process memory (suitable for single-instance servers).
 * For multi-instance deployments, provide a Redis-backed implementation.
 */
export interface PprCache {
  /**
   * Store a pre-computed PPR shell for a route path.
   *
   * @param path - The URL pathname the shell applies to (e.g. `'/dashboard'`).
   * @param shell - The extracted shell result from `extractPprShell()`.
   */
  set(path: string, shell: PprShell): void;

  /**
   * Retrieve the cached PPR shell for a route path, or `undefined` when not cached.
   *
   * @param path - The URL pathname to look up.
   * @returns The cache entry, or `undefined` on a miss.
   */
  get(path: string): PprCacheEntry | undefined;

  /**
   * Returns `true` when a PPR shell is cached for the given path.
   *
   * @param path - The URL pathname to check.
   */
  has(path: string): boolean;

  /**
   * Evict all entries from the cache.
   *
   * Useful in tests and during hot-reloads in development mode.
   */
  clear(): void;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create an in-memory PPR shell cache.
 *
 * At build time, shells are pre-computed for all PPR-enabled routes and stored
 * here via `set()`. At request time, `get()` returns the shell instantly so
 * the HTTP response can begin with the pre-computed HTML without any rendering
 * overhead, while dynamic Suspense slots are streamed in behind it.
 *
 * **Factory, not singleton.** Call `createPprCache()` once at application startup
 * and pass the instance to both `prerenderPprShells()` (build step) and
 * `renderPprPage()` (request handler). Do not share instances across processes.
 *
 * @returns A frozen `PprCache` backed by a plain `Map`.
 */
export function createPprCache(): PprCache {
  // Internal store — Map is faster than plain objects for frequent get/set patterns.
  const store = new Map<string, PprCacheEntry>();

  const cache: PprCache = {
    set(path: string, shell: PprShell): void {
      if (!shell.ok) {
        // Only cache successful extractions.
        console.warn(
          `[snapshot-ssr] PPR shell extraction failed for "${path}" — skipping cache.`,
        );
        return;
      }
      store.set(path, Object.freeze({ shellHtml: shell.shellHtml, cachedAt: Date.now() }));
    },

    get(path: string): PprCacheEntry | undefined {
      return store.get(path);
    },

    has(path: string): boolean {
      return store.has(path);
    },

    clear(): void {
      store.clear();
    },
  };

  return Object.freeze(cache);
}
