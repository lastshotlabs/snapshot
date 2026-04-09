// src/ssr/manifest-renderer.ts
import React from "react";
import { QueryClient } from "@tanstack/react-query";
import { compileManifest } from "../ui/manifest/compiler";
import { PageRenderer } from "../ui/manifest/renderer";
import type { CompiledRoute } from "../ui/manifest/types";
import { escapeHtml } from "./head";
import { renderPage } from "./render";
import type {
  ManifestSsrConfig,
  SsrQueryCacheEntry,
  SsrRequestContext,
  SsrShellShape,
} from "./types";

// ─── Internal structural shape ────────────────────────────────────────────────

/** Structural equivalent of SsrRouteMatch — avoids importing from bunshot-ssr. */
interface SsrRouteMatchShape {
  readonly filePath: string;
  readonly metaFilePath: string | null;
  readonly params: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
  readonly url: URL;
}

// ─── Route matcher entry ──────────────────────────────────────────────────────

interface ManifestRouteEntry {
  route: CompiledRoute;
  pattern: RegExp;
  paramNames: string[];
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a manifest-based SSR renderer.
 *
 * Resolves routes from the Snapshot manifest config rather than from server
 * route files. Manifest routes declare their data requirements via the
 * `preload` field — keys into `manifest.resources`. Provide `preloadResolvers`
 * to call bunshot adapters directly instead of making HTTP round-trips.
 *
 * **Route resolution:** The middleware calls `resolve()` after the file-based
 * resolver returns `null`. Both `createReactRenderer` and `createManifestRenderer`
 * can be used together in a composite renderer — file routes take precedence.
 *
 * **Manifest compilation:** The manifest is compiled and route patterns are built
 * at construction time — not per request.
 *
 * **Manifest-first:** This renderer works entirely from the manifest JSON config.
 * No TypeScript is required at the consumer to enable SSR for manifest routes.
 *
 * @param rawConfig - Renderer configuration. Manifest is compiled and route
 *   patterns are built at construction time — not per request.
 *
 * @example
 * ```ts
 * import { createSsrPlugin } from '@lastshotlabs/bunshot-ssr'
 * import { createManifestRenderer } from '@lastshotlabs/snapshot/ssr'
 * import myManifest from './snapshot.manifest.json'
 *
 * createSsrPlugin({
 *   renderer: createManifestRenderer({
 *     manifest: myManifest,
 *     preloadResolvers: {
 *       listPosts: async (params, bsCtx) => {
 *         const { threadAdapter } = (bsCtx as BunshotContext)
 *           .pluginState.get('bunshot-community');
 *         return threadAdapter.list({ containerId: params.containerId });
 *       },
 *     },
 *     getUser: async (headers) => resolveSessionFromHeaders(headers),
 *   }),
 *   serverRoutesDir: import.meta.dir + '/server/routes',
 *   assetsManifest: import.meta.dir + '/dist/.vite/manifest.json',
 * })
 * ```
 */
export function createManifestRenderer(rawConfig: ManifestSsrConfig): {
  resolve(url: URL, bsCtx: unknown): Promise<SsrRouteMatchShape | null>;
  render(
    match: SsrRouteMatchShape,
    shell: SsrShellShape,
    bsCtx: unknown,
  ): Promise<Response>;
} {
  const frozen = Object.freeze({ ...rawConfig });
  const compiled = compileManifest(frozen.manifest);

  // Build route matchers once at construction time — not per request
  const routeEntries: ManifestRouteEntry[] =
    compiled.routes.map(buildRouteEntry);

  // Build an ID-keyed map (the compiled routeMap is keyed by path)
  const routeById: Record<string, CompiledRoute> = Object.fromEntries(
    compiled.routes.map((r) => [r.id, r]),
  );

  return {
    /**
     * Resolve a URL to a manifest route match.
     *
     * Returns `null` if no manifest route matches — middleware falls through to SPA.
     * Routes are matched in declaration order (specific before dynamic).
     *
     * The resolved `filePath` encodes the route ID as `manifest:<id>` so that
     * `render()` can look up the route without re-matching.
     */
    async resolve(
      url: URL,
      _bsCtx: unknown,
    ): Promise<SsrRouteMatchShape | null> {
      const pathname =
        url.pathname.length > 1
          ? url.pathname.replace(/\/$/, "")
          : url.pathname;

      for (const entry of routeEntries) {
        const match = entry.pattern.exec(pathname);
        if (!match) continue;

        const params: Record<string, string> = {};
        for (const name of entry.paramNames) {
          const value = match.groups?.[name];
          if (value !== undefined) params[name] = decodeURIComponent(value);
        }

        const query: Record<string, string> = {};
        url.searchParams.forEach((v, k) => {
          query[k] = v;
        });

        return {
          filePath: `manifest:${entry.route.id}`,
          metaFilePath: null,
          params,
          query,
          url,
        };
      }

      return null;
    },

    /**
     * Render a matched manifest route to a streaming HTML response.
     *
     * Flow:
     * 1. Look up route from compiled manifest by ID encoded in `match.filePath`
     * 2. Evaluate `route.guard` — redirect if auth check fails
     * 3. Call `preloadResolvers` for each key in `route.preload`
     * 4. Seed `QueryClient` with preload results
     * 5. Render `<PageRenderer page={route.page} />` via `renderPage()`
     *
     * @param match - Route match from `resolve()` with `filePath: 'manifest:<id>'`.
     * @param shell - Shell from bunshot-ssr (asset tags, nonce).
     * @param bsCtx - Bunshot context for auth and adapter access.
     */
    async render(
      match: SsrRouteMatchShape,
      shell: SsrShellShape,
      bsCtx: unknown,
    ): Promise<Response> {
      const routeId = match.filePath.startsWith("manifest:")
        ? match.filePath.slice("manifest:".length)
        : null;

      if (!routeId) return buildSpaFallback(shell);

      const route = routeById[routeId];
      if (!route) return buildSpaFallback(shell);

      // Auth guard check
      if (route.guard) {
        const redirectTo = route.guard.redirectTo ?? "/login";
        if (route.guard.authenticated) {
          const user = frozen.getUser
            ? await frozen.getUser(new Headers()).catch((): null => null)
            : null;
          if (!user) {
            return Response.redirect(redirectTo, 302);
          }

          if (route.guard.roles?.length) {
            const hasRole = route.guard.roles.some((r: string) =>
              user.roles.includes(r),
            );
            if (!hasRole) {
              return Response.redirect(route.guard.redirectTo ?? "/", 302);
            }
          }
        }
      }

      // Preload resources via caller-provided resolvers
      const queryCache: SsrQueryCacheEntry[] = [];
      if (route.preload?.length && frozen.preloadResolvers) {
        for (const resourceKey of route.preload) {
          const resolver = frozen.preloadResolvers[resourceKey];
          if (!resolver) continue; // Not provided — client fetches after hydration

          try {
            const data = await resolver(match.params, bsCtx);
            queryCache.push({
              queryKey: [resourceKey, match.params] as const,
              data,
            });
          } catch (err) {
            // Non-fatal: preload failure degrades to client-side fetch
            console.warn(
              `[snapshot-ssr] Preload resolver '${resourceKey}' failed:`,
              err,
            );
          }
        }
      }

      // Create per-request QueryClient and seed cache
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { staleTime: Infinity, retry: false },
        },
      });
      for (const entry of queryCache) {
        queryClient.setQueryData(
          entry.queryKey as readonly unknown[],
          entry.data,
        );
      }

      // Head tags from page title
      const headTags = route.page.title
        ? `<title>${escapeHtml(route.page.title)}</title>`
        : "";

      const populatedShell: SsrShellShape = { ...shell, headTags };

      const requestContext: SsrRequestContext = {
        queryClient,
        match,
      };

      // Render PageRenderer with the fresh QueryClient
      const element = React.createElement(PageRenderer, {
        page: route.page,
        routeId: route.id,
        state: compiled.state,
        resources: compiled.resources,
      });

      return renderPage(element, requestContext, populatedShell);
    },
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Build a regex route entry from a compiled manifest route.
 * Converts TanStack Router `:param` and `:param?` syntax to named capture groups.
 *
 * @internal
 */
function buildRouteEntry(route: CompiledRoute): ManifestRouteEntry {
  const paramNames: string[] = [];
  const segments = route.path === "/" ? [""] : route.path.split("/");
  const parts: string[] = [];

  for (const segment of segments) {
    if (segment === "") {
      parts.push("");
      continue;
    }
    // Optional dynamic: :param?
    const optMatch = /^:([a-zA-Z_$][a-zA-Z0-9_$]*)\?$/.exec(segment);
    if (optMatch) {
      const name = optMatch[1]!;
      paramNames.push(name);
      parts.push(`(?<${name}>[^/]+)?`);
      continue;
    }
    // Required dynamic: :param
    const dynMatch = /^:([a-zA-Z_$][a-zA-Z0-9_$]*)$/.exec(segment);
    if (dynMatch) {
      const name = dynMatch[1]!;
      paramNames.push(name);
      parts.push(`(?<${name}>[^/]+)`);
      continue;
    }
    // Static segment
    parts.push(escapeRegex(segment));
  }

  const pattern = new RegExp(`^${parts.join("/")}$`);
  return { route, pattern, paramNames };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a minimal SPA fallback response for routes not found in the manifest.
 *
 * @internal
 */
function buildSpaFallback(shell: SsrShellShape): Response {
  const html = `<!DOCTYPE html><html><head>${shell.headTags}${shell.assetTags}</head><body><div id="root"></div></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
