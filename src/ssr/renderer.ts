// src/ssr/renderer.ts
import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { buildHeadTags } from "./head";
import { renderPage } from "./render";
import type {
  ServerRouteMatchShape,
  SnapshotSsrConfig,
  SsrLoadResult,
  SsrRequestContext,
  SsrShellShape,
} from "./types";

// ─── Internal type guards ─────────────────────────────────────────────────────

function isRedirectResult(
  r: unknown,
): r is { redirect: string; status?: number } {
  return typeof r === "object" && r !== null && "redirect" in r;
}

function isNotFoundResult(r: unknown): r is { notFound: true } {
  return typeof r === "object" && r !== null && "notFound" in r;
}

function isLoadResult(
  r: unknown,
): r is { data: Record<string, unknown>; queryCache?: unknown[] } {
  return typeof r === "object" && r !== null && "data" in r;
}

// ─── Load context builder ─────────────────────────────────────────────────────

/**
 * Build the `SsrLoadContext` for a given route match and request.
 *
 * Provides direct bunshot adapter access via `bsCtx` without an HTTP round-trip.
 * Auth resolution via `getUser()` calls into bunshot-auth's plugin state.
 *
 * @internal
 */
function buildLoadContext(
  match: ServerRouteMatchShape,
  request: Request,
  bsCtx: unknown,
) {
  const cookieHeader = request.headers.get("cookie");

  return {
    params: match.params,
    query: match.query,
    url: match.url,
    headers: request.headers,
    bsCtx,
    async getUser(): Promise<{
      id: string;
      email: string;
      roles: string[];
    } | null> {
      // bunshot-auth stores its state in pluginState keyed by 'bunshot-auth'
      const ctx = bsCtx as { pluginState?: Map<string, unknown> };
      const authState = ctx.pluginState?.get("bunshot-auth") as
        | { resolveSession?: (cookie: string) => Promise<unknown> }
        | undefined;
      if (!authState?.resolveSession || !cookieHeader) return null;
      try {
        return (await authState.resolveSession(cookieHeader)) as {
          id: string;
          email: string;
          roles: string[];
        } | null;
      } catch {
        return null;
      }
    },
  };
}

// ─── SPA shell fallback ───────────────────────────────────────────────────────

/**
 * Build a minimal SPA shell HTML response for not-found routes.
 *
 * The SPA will handle the 404 UI after hydration.
 *
 * @internal
 */
function buildSpaShell(shell: SsrShellShape): string {
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    shell.assetTags,
    "</head>",
    "<body>",
    '<div id="root"></div>',
    "</body>",
    "</html>",
  ].join("\n");
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create the official React renderer for `bunshot-ssr`.
 *
 * Returns an object that satisfies `BunshotSsrRenderer` from
 * `@lastshotlabs/bunshot-ssr` by structural typing. The consumer app imports
 * both packages and wires them together — no forced dependency between repos.
 *
 * **File-based routing:** `createReactRenderer` relies on bunshot-ssr's built-in
 * file resolver to match URLs to route files. The `resolve()` method returns
 * `null` — the file resolver is authoritative. `render()` is called only when
 * a match was found.
 *
 * **Per-request isolation:** Every call to `render()` creates a fresh
 * `QueryClient`. The global `snapshot.queryClient` singleton is never used
 * during SSR.
 *
 * **Config freeze:** The config object is frozen at construction time.
 *
 * @param config - Renderer configuration. `resolveComponent` is required.
 * @returns An object with `resolve()` and `render()` satisfying `BunshotSsrRenderer`.
 *
 * @example
 * ```ts
 * import { createSsrPlugin } from '@lastshotlabs/bunshot-ssr'
 * import { createReactRenderer } from '@lastshotlabs/snapshot/ssr'
 *
 * createSsrPlugin({
 *   renderer: createReactRenderer({
 *     resolveComponent: async (match) => {
 *       const mod = await import(toClientPath(match.filePath))
 *       return mod.default
 *     },
 *   }),
 *   serverRoutesDir: import.meta.dir + '/server/routes',
 *   assetsManifest: import.meta.dir + '/dist/.vite/manifest.json',
 * })
 * ```
 */
export function createReactRenderer(config: SnapshotSsrConfig): {
  resolve(url: URL, bsCtx: unknown): Promise<ServerRouteMatchShape | null>;
  render(
    match: ServerRouteMatchShape,
    shell: SsrShellShape,
    bsCtx: unknown,
  ): Promise<Response>;
} {
  const frozen = Object.freeze({ ...config });
  const timeoutMs = frozen.renderTimeoutMs ?? 5000;

  return {
    /**
     * Resolve a URL to a server route match.
     *
     * The file-based resolver in bunshot-ssr already handles URL → file matching.
     * This method always returns `null` — the file resolver is authoritative.
     * bunshot-ssr calls `resolveRoute()` before calling `renderer.resolve()`;
     * if that returns a match, `renderer.resolve()` is called as a secondary
     * filter only.
     */
    async resolve(
      _url: URL,
      _bsCtx: unknown,
    ): Promise<ServerRouteMatchShape | null> {
      return null;
    },

    /**
     * Render the resolved route to a streaming HTML `Response`.
     *
     * Flow:
     * 1. Dynamic `import()` the route file
     * 2. Build `SsrLoadContext` with direct bunshot access
     * 3. Call `load()` — handle redirect / notFound / data signals
     * 4. Seed `QueryClient` cache with `queryCache` entries
     * 5. Call `meta()` — build head tags
     * 6. Dynamic `import()` the React component via `resolveComponent()`
     * 7. Call `renderPage()` with the component and the populated `QueryClient`
     *
     * @param match - The resolved server route from bunshot-ssr's file resolver.
     * @param shell - Shell from bunshot-ssr (asset tags, nonce).
     * @param bsCtx - Bunshot context for DB access and auth.
     */
    async render(
      match: ServerRouteMatchShape,
      shell: SsrShellShape,
      bsCtx: unknown,
    ): Promise<Response> {
      // Reconstruct a minimal Request for the load context (headers from real request
      // are not available here — bunshot-ssr doesn't forward the raw Request yet).
      // TODO: forward raw Request when Track A Phase 4 is updated to pass it.
      const fakeRequest = new Request(match.url.toString());
      const loadContext = buildLoadContext(match, fakeRequest, bsCtx);

      // 1. Dynamic import the route module
      let routeModule: Record<string, unknown>;
      try {
        routeModule = (await import(match.filePath)) as Record<string, unknown>;
      } catch (err) {
        throw new Error(
          `[snapshot-ssr] Failed to import route module ${match.filePath}: ${String(err)}`,
        );
      }

      const loadFn = routeModule["load"] as
        | ((ctx: unknown) => Promise<unknown>)
        | undefined;
      if (!loadFn) {
        throw new Error(
          `[snapshot-ssr] Route module ${match.filePath} has no exported 'load' function`,
        );
      }

      // 2. Call load()
      const loadResult = await loadFn(loadContext);

      // 3. Handle redirect
      if (isRedirectResult(loadResult)) {
        return new Response(null, {
          status: loadResult.status ?? 302,
          headers: { Location: loadResult.redirect },
        });
      }

      // 4. Handle not found — return SPA shell (SPA renders its own 404 UI)
      if (isNotFoundResult(loadResult)) {
        return new Response(buildSpaShell(shell), {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      if (!isLoadResult(loadResult)) {
        throw new Error(
          `[snapshot-ssr] load() in ${match.filePath} returned an unexpected value`,
        );
      }

      const ssrLoadResult = loadResult as SsrLoadResult;

      // 5. Create per-request QueryClient and seed cache
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { staleTime: Infinity, retry: false },
        },
      });

      for (const entry of ssrLoadResult.queryCache ?? []) {
        queryClient.setQueryData(
          entry.queryKey as readonly unknown[],
          entry.data,
        );
      }

      // 6. Call meta() — from directory meta.ts or from the same route module
      const metaFn = match.metaFilePath
        ? (((await import(match.metaFilePath)) as Record<string, unknown>)[
            "meta"
          ] as
            | ((ctx: unknown, result: unknown) => Promise<unknown>)
            | undefined)
        : (routeModule["meta"] as
            | ((ctx: unknown, result: unknown) => Promise<unknown>)
            | undefined);

      let headTags = "";
      if (metaFn) {
        try {
          const metaResult = await metaFn(loadContext, ssrLoadResult);
          headTags = buildHeadTags(
            metaResult as Parameters<typeof buildHeadTags>[0],
          );
        } catch (err) {
          // Meta errors are non-fatal — log and continue without custom head tags
          console.warn(
            `[snapshot-ssr] meta() in ${match.filePath} threw:`,
            err,
          );
        }
      }

      // 7. Resolve the React component
      let Component: React.ComponentType<Record<string, unknown>>;
      try {
        Component = await frozen.resolveComponent(match);
      } catch (err) {
        throw new Error(
          `[snapshot-ssr] resolveComponent failed for ${match.filePath}: ${String(err)}`,
        );
      }

      // 8. Build the full shell (bunshot-ssr shell + head tags from meta())
      const fullShell: SsrShellShape = {
        ...shell,
        headTags,
      };

      // 9. Build per-request context
      const requestContext: SsrRequestContext = {
        queryClient,
        match,
      };

      // 10. Render
      const element = React.createElement(Component, {
        loaderData: ssrLoadResult.data,
        params: match.params,
        query: match.query,
      });

      return renderPage(element, requestContext, fullShell, timeoutMs);
    },
  };
}
