/**
 * ManifestApp — renders an entire application from a manifest config.
 *
 * Creates a snapshot SDK instance, applies design tokens as CSS custom
 * properties, wraps content in the required context providers, and renders
 * pages via PageRenderer.
 */

import { useEffect, useMemo, useState } from "react";
import { createSnapshot } from "../../create-snapshot";
import { AppContextProvider } from "../context/index";
import { resolveTokens } from "../tokens/resolve";
import { PageRenderer } from "./renderer";
import type { ManifestConfig, ManifestAppProps } from "./types";

// ── Style injection utility ─────────────────────────────────────────────────

/**
 * Creates or updates a `<style>` element in the document head.
 * Used to inject design token CSS at runtime.
 *
 * @param id - Unique id for the style element (for idempotent updates)
 * @param css - The CSS string to inject
 */
export function injectStyleSheet(id: string, css: string): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

// ── ManifestRouter (simplified for Phase 4) ─────────────────────────────────

/** Props for the ManifestRouter component. */
interface ManifestRouterProps {
  /** The manifest config containing page definitions. */
  manifest: ManifestConfig;
}

/**
 * Simplified router for Phase 4.
 *
 * Renders the page matching the current browser path from `manifest.pages`.
 * Falls back to the first page if no match. Full TanStack Router integration
 * is deferred to a later phase.
 *
 * @param props - Contains the manifest with page definitions
 */
function ManifestRouter({ manifest }: ManifestRouterProps) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pageConfig = manifest.pages[currentPath];
  const firstPath = Object.keys(manifest.pages)[0];
  const fallbackPage = firstPath ? manifest.pages[firstPath] : undefined;
  const page = pageConfig ?? fallbackPage;

  if (!page) return null;

  return <PageRenderer page={page} />;
}

// ── ManifestApp ─────────────────────────────────────────────────────────────

/**
 * Renders an entire application from a single manifest config.
 *
 * Creates a snapshot SDK instance (memoized by `apiUrl`), applies theme
 * tokens as injected CSS, and wraps all content in the required providers:
 * QueryProvider, AppContextProvider, and the snapshot API context.
 *
 * For basic usage, this is the only component needed — it handles routing,
 * theming, and context setup automatically.
 *
 * @param props - Manifest config, API URL, and optional snapshot config overrides
 *
 * @example
 * ```tsx
 * import manifest from './snapshot.manifest.json'
 *
 * function App() {
 *   return <ManifestApp manifest={manifest} apiUrl="https://api.myapp.com" />
 * }
 * ```
 */
export function ManifestApp({
  manifest,
  apiUrl,
  snapshotConfig,
}: ManifestAppProps) {
  const snapshot = useMemo(
    () =>
      createSnapshot({
        apiUrl,
        ...snapshotConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiUrl],
  );

  // Apply theme tokens
  useEffect(() => {
    if (manifest.theme) {
      const css = resolveTokens(manifest.theme);
      injectStyleSheet("snapshot-tokens", css);
    }
  }, [manifest.theme]);

  return (
    <snapshot.QueryProvider>
      <AppContextProvider globals={manifest.globals} api={snapshot.api}>
        <ManifestRouter manifest={manifest} />
      </AppContextProvider>
    </snapshot.QueryProvider>
  );
}
