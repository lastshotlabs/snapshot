// src/ssr/ppr.ts
// Partial Prerendering — static shell extraction utilities.
// Used at build time to pre-render the static portions of PPR routes.
// Browser-safe: no Node.js built-ins; only react-dom/server + React.

import React from "react";
import { renderToString } from "react-dom/server";

// ─── Context ──────────────────────────────────────────────────────────────────

/**
 * React context used by `StaticShellWrapper` to signal that all `<Suspense>`
 * boundaries should render only their fallback content rather than awaiting
 * their children.
 *
 * @internal
 */
const StaticShellContext = React.createContext<boolean>(false);

// ─── Static shell wrapper ─────────────────────────────────────────────────────

/**
 * Wrap a React element so that all Suspense boundaries render only their
 * fallbacks (never await the actual children). Used for static shell extraction.
 *
 * Place this as the outermost wrapper during build-time shell extraction.
 * At request time it is not used — the real React tree renders normally.
 *
 * @param props.children - The React tree to wrap.
 * @returns A React element whose Suspense boundaries resolve to their fallbacks.
 */
export function StaticShellWrapper({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactElement {
  return React.createElement(
    StaticShellContext.Provider,
    { value: true },
    children,
  );
}

// ─── PPR shell result ─────────────────────────────────────────────────────────

/**
 * The result of a build-time static shell extraction for a PPR route.
 */
export interface PprShell {
  /**
   * The static HTML shell with Suspense fallbacks rendered in-place.
   * This is sent immediately to the browser at request time for fast TTFB.
   */
  shellHtml: string;
  /**
   * True if the shell was successfully extracted without fatal errors.
   * When `false`, the route should fall back to standard SSR.
   */
  ok: boolean;
}

// ─── Shell extractor ──────────────────────────────────────────────────────────

/**
 * Render only the static shell of a React tree.
 *
 * Dynamic Suspense boundaries are replaced with their fallback content because
 * `renderToString` emits Suspense fallback markup immediately for any boundary
 * whose children suspend, then terminates without awaiting the async subtree.
 * Wrapping the tree in `StaticShellWrapper` ensures the output contains only
 * the static parts and pre-populated fallback markup.
 *
 * Used at build time to pre-render the static portions of PPR routes.
 * The resulting `shellHtml` is stored in the PPR cache and sent immediately
 * on every subsequent request before dynamic content is streamed.
 *
 * @param element - The React element representing the full page tree.
 * @returns A `PprShell` containing the extracted static HTML and a success flag.
 */
export async function extractPprShell(
  element: React.ReactElement,
): Promise<PprShell> {
  try {
    // Wrap the element so all Suspense boundaries show their fallbacks.
    const wrapped = React.createElement(StaticShellWrapper, {}, element);
    const shellHtml = renderToString(wrapped);

    return { shellHtml, ok: true };
  } catch (err) {
    console.error("[snapshot-ssr] PPR shell extraction failed:", err);
    return { shellHtml: "", ok: false };
  }
}
