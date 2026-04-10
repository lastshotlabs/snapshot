// src/ssr/__tests__/cache.test.ts
// Unit tests for snapshot/src/ssr/cache.ts
//
// Tests cover:
// - cache() re-exports React's cache() (per-render memoization)
// - unstable_noStore() sets noStore in the AsyncLocalStorage context
// - withRequestStore() creates a fresh context per invocation
// - getNoStore() reads from the current context
// - getNoStore() returns false outside a withRequestStore context

import { describe, expect, it, vi } from 'vitest';
import { getNoStore, unstable_noStore, withRequestStore } from '../cache';

// ─── withRequestStore + getNoStore ───────────────────────────────────────────

describe('withRequestStore / getNoStore', () => {
  it('returns false when getNoStore() is called outside a request context', () => {
    expect(getNoStore()).toBe(false);
  });

  it('returns false initially inside a fresh request context', async () => {
    const result = await withRequestStore(async () => getNoStore());
    expect(result).toBe(false);
  });

  it('returns true after unstable_noStore() is called inside the context', async () => {
    const result = await withRequestStore(async () => {
      unstable_noStore();
      return getNoStore();
    });
    expect(result).toBe(true);
  });

  it('isolates state between concurrent request contexts', async () => {
    // Two contexts running simultaneously — unstable_noStore in one must not
    // bleed into the other.
    let noStoreInClean: boolean | undefined;

    const dirtyContext = withRequestStore(async () => {
      unstable_noStore();
      // Yield to let the clean context interleave
      await new Promise(resolve => setTimeout(resolve, 5));
      return getNoStore();
    });

    const cleanContext = withRequestStore(async () => {
      // Record state before dirty context's noStore call would have propagated
      await new Promise(resolve => setTimeout(resolve, 1));
      noStoreInClean = getNoStore();
      await new Promise(resolve => setTimeout(resolve, 10));
      return getNoStore();
    });

    const [dirtyResult, cleanResult] = await Promise.all([dirtyContext, cleanContext]);

    expect(dirtyResult).toBe(true);
    expect(cleanResult).toBe(false);
    expect(noStoreInClean).toBe(false);
  });

  it('resets to false on each new withRequestStore() call', async () => {
    // First context: noStore set
    await withRequestStore(async () => {
      unstable_noStore();
    });

    // Second context: noStore must start fresh
    const result = await withRequestStore(async () => getNoStore());
    expect(result).toBe(false);
  });
});

// ─── unstable_noStore ────────────────────────────────────────────────────────

describe('unstable_noStore', () => {
  it('is a no-op when called outside a request context (does not throw)', () => {
    expect(() => unstable_noStore()).not.toThrow();
    // Verify it had no effect on subsequent contexts
  });

  it('mutates the store synchronously — subsequent synchronous reads see it', async () => {
    const results: boolean[] = [];
    await withRequestStore(async () => {
      results.push(getNoStore()); // false before
      unstable_noStore();
      results.push(getNoStore()); // true after
    });
    expect(results).toEqual([false, true]);
  });

  it('is idempotent — calling multiple times does not change the value', async () => {
    const result = await withRequestStore(async () => {
      unstable_noStore();
      unstable_noStore();
      unstable_noStore();
      return getNoStore();
    });
    expect(result).toBe(true);
  });
});

// ─── cache() ─────────────────────────────────────────────────────────────────

describe('cache()', () => {
  // React's cache() is tested exhaustively in the React test suite.
  // Here we verify only the local contract: Snapshot re-exports React's cache()
  // unchanged. Per-render deduplication is owned by React and only applies
  // inside an actual React render tree.

  it('is exported and callable', async () => {
    const { cache } = await import('../cache');
    expect(typeof cache).toBe('function');
  });

  it('returns the wrapped function result shape', async () => {
    const { cache } = await import('../cache');
    const spy = vi.fn(async (id: string) => ({ id }));
    const memoized = cache(spy);

    const a = memoized('user-1');
    const b = memoized('user-1');
    const c = memoized('user-2');
    const results = await Promise.all([a, b, c]);

    expect(results).toEqual([
      { id: 'user-1' },
      { id: 'user-1' },
      { id: 'user-2' },
    ]);
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
