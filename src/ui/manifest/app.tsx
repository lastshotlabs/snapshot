/**
 * ManifestApp — renders an entire application from a manifest config.
 *
 * Creates a snapshot SDK instance, applies design tokens as CSS custom
 * properties, wraps content in the required context providers, and renders
 * pages via PageRenderer.
 */

import { useEffect, useMemo, useState } from "react";
import { createSnapshot } from "../../create-snapshot";
import { SnapshotApiContext } from "../actions/executor";
import { AppContextProvider } from "../context/index";
import { resolveTokens } from "../tokens/resolve";
import { compileManifest } from "./compiler";
import { ManifestRuntimeProvider } from "./runtime";
import { PageRenderer } from "./renderer";
import type { CompiledManifest, ManifestAppProps } from "./types";

/**
 * Creates or updates a `<style>` element in the document head.
 * Used to inject design token CSS at runtime.
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

interface ManifestRouterProps {
  manifest: CompiledManifest;
  api: ReturnType<typeof createSnapshot>["api"];
}

function ManifestRouter({ manifest, api }: ManifestRouterProps) {
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

  const route =
    manifest.routeMap[currentPath] ??
    (manifest.app.home ? manifest.routeMap[manifest.app.home] : undefined) ??
    manifest.firstRoute ??
    (manifest.app.notFound
      ? manifest.routeMap[manifest.app.notFound]
      : undefined);

  if (!route) {
    return null;
  }

  return (
    <PageRenderer
      page={route.page}
      routeId={route.id}
      state={manifest.state}
      resources={manifest.resources}
      api={api}
    />
  );
}

/**
 * Renders an entire application from a single manifest config.
 */
export function ManifestApp({
  manifest,
  apiUrl,
  snapshotConfig,
}: ManifestAppProps) {
  const compiledManifest = useMemo(() => compileManifest(manifest), [manifest]);
  const snapshot = useMemo(
    () =>
      createSnapshot({
        apiUrl,
        ...snapshotConfig,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiUrl],
  );

  useEffect(() => {
    if (compiledManifest.theme) {
      const css = resolveTokens(compiledManifest.theme);
      injectStyleSheet("snapshot-tokens", css);
    }
  }, [compiledManifest.theme]);

  return (
    <snapshot.QueryProvider>
      <SnapshotApiContext.Provider value={snapshot.api}>
        <ManifestRuntimeProvider manifest={compiledManifest}>
          <AppContextProvider
            globals={compiledManifest.state}
            resources={compiledManifest.resources}
            api={snapshot.api}
          >
            <ManifestRouter manifest={compiledManifest} api={snapshot.api} />
          </AppContextProvider>
        </ManifestRuntimeProvider>
      </SnapshotApiContext.Provider>
    </snapshot.QueryProvider>
  );
}
