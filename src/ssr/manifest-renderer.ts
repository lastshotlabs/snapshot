// src/ssr/manifest-renderer.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { QueryClient } from "@tanstack/react-query";
import { SnapshotApiContext } from "../ui/actions/executor";
import { AppContextProvider } from "../ui/context/providers";
import {
  AppShellWrapper,
  isCustomPage,
  mapAppConfig,
  mapNavigation,
  mapPageDeclaration,
  type PageLoaderResult,
} from "../ui/entity-pages";
import { compileManifest } from "../ui/manifest/compiler";
import { PageRenderer } from "../ui/manifest/renderer";
import type {
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
} from "../ui/manifest/types";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
} from "../ui/manifest/runtime";
import { buildHeadTags, escapeHtml } from "./head";
import { renderPage } from "./render";
import type { RscManifest } from "./rsc";
import type {
  ManifestSsrConfig,
  SsrQueryCacheEntry,
  SsrRequestContext,
  SsrShellShape,
} from "./types";

// ─── Internal structural shapes ───────────────────────────────────────────────

/** Structural equivalent of SsrRouteMatch — avoids importing from bunshot-ssr. */
interface SsrRouteMatchShape {
  readonly filePath: string;
  readonly metaFilePath: string | null;
  readonly params: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
  readonly url: URL;
  readonly loadingFilePath?: string | null;
  readonly errorFilePath?: string | null;
  readonly notFoundFilePath?: string | null;
}

/**
 * Structural equivalent of `SsrRouteChain` from `@lastshotlabs/bunshot-ssr`.
 * Defined structurally to avoid cross-repo coupling.
 *
 * @internal
 */
interface SsrRouteChainShape {
  readonly layouts: readonly SsrRouteMatchShape[];
  readonly page: SsrRouteMatchShape;
  readonly slots?: ReadonlyArray<{
    readonly name: string;
    readonly match: SsrRouteMatchShape | null;
  }>;
  readonly intercepted?: boolean;
  readonly middlewareFilePath: string | null;
}

// ─── Route matcher entry ──────────────────────────────────────────────────────

interface ManifestRouteEntry {
  route: CompiledRoute;
  pattern: RegExp;
  paramNames: string[];
}

function buildEntityHeadTags(
  shell: SsrShellShape,
  result: PageLoaderResult,
): string {
  const entityHeadTags = buildHeadTags(
    result.meta as Parameters<typeof buildHeadTags>[0],
  );
  return [shell.headTags, entityHeadTags].filter(Boolean).join("");
}

function applyEntityPageMetadata(
  shell: SsrShellShape,
  result: PageLoaderResult,
): void {
  if (!shell._isr) {
    return;
  }

  shell._isr.revalidate = result.revalidate;
  shell._isr.tags = result.tags;
}

function withEntityPageHeaders(
  response: Response,
  result: PageLoaderResult,
): Response {
  const headers = new Headers(response.headers);

  if (result.revalidate !== undefined) {
    headers.set("x-bunshot-revalidate", String(result.revalidate));
  }

  if (result.tags && result.tags.length > 0) {
    headers.set("x-bunshot-tags", result.tags.join(","));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function buildManifestNavConfig(
  manifest: CompiledManifest,
): Parameters<typeof AppShellWrapper>[0]["navConfig"] {
  if (!manifest.navigation) {
    return undefined;
  }

  return {
    type: "nav",
    items: manifest.navigation.items,
    collapsible: true,
    ...(manifest.app.title
      ? {
          logo: {
            text: manifest.app.title,
            path: manifest.app.home ?? manifest.firstRoute?.path ?? "/",
          },
        }
      : {}),
  };
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
  renderChain(
    chain: SsrRouteChainShape,
    shell: SsrShellShape,
    bsCtx: unknown,
  ): Promise<Response>;
  renderPage(
    result: PageLoaderResult,
    shell: SsrShellShape,
    bsCtx: unknown,
  ): Promise<Response>;
} {
  const frozen = Object.freeze({ ...rawConfig });
  let rscOptions = frozen.rscOptions;

  if (!rscOptions && frozen.manifest.ssr?.rsc) {
    const manifestPath = path.resolve(
      process.cwd(),
      frozen.manifest.ssr.rscManifestPath ?? "./dist/server/rsc-manifest.json",
    );

    try {
      const rscManifest = JSON.parse(
        readFileSync(manifestPath, "utf-8"),
      ) as RscManifest;
      rscOptions = Object.freeze({ manifest: rscManifest });
    } catch (error) {
      console.error(
        `[snapshot-ssr] Failed to load rsc-manifest.json from ${manifestPath}:`,
        String(error),
      );
    }
  }

  const compiled = compileManifest(frozen.manifest);

  // Build route matchers once at construction time — not per request
  const routeEntries: ManifestRouteEntry[] =
    compiled.routes.map(buildRouteEntry);

  // Build an ID-keyed map (the compiled routeMap is keyed by path)
  const routeById: Record<string, CompiledRoute> = Object.fromEntries(
    compiled.routes.map((r) => [r.id, r]),
  );

  // Declare as a variable so renderChain can reference render() without `this`
  const manifestRenderer: {
    resolve(url: URL, bsCtx: unknown): Promise<SsrRouteMatchShape | null>;
    render(match: SsrRouteMatchShape, shell: SsrShellShape, bsCtx: unknown): Promise<Response>;
    renderChain(chain: SsrRouteChainShape, shell: SsrShellShape, bsCtx: unknown): Promise<Response>;
    renderPage(
      result: PageLoaderResult,
      shell: SsrShellShape,
      bsCtx: unknown,
    ): Promise<Response>;
  } = {
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
        for (const preloadTarget of route.preload) {
          const resourceKey =
            typeof preloadTarget === "string"
              ? preloadTarget
              : preloadTarget.resource;
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

      return renderPage(
        element,
        requestContext,
        populatedShell,
        undefined,
        rscOptions,
      );
    },

    /**
     * Render a layout chain for manifest-based routes.
     *
     * Manifest routes do not have file-based `layout.ts` conventions — layouts are
     * declared in the manifest's page composition. However, this method is required
     * by the `BunshotSsrRenderer` contract so that the manifest renderer can be used
     * when the file resolver detects layout files for manifest-routed pages.
     *
     * Implementation: delegates to `render()` using the leaf page match.
     * Manifest page composition already encodes layout nesting in the `PageRenderer`.
     *
     * @param chain - Route chain from bunshot-ssr (layouts are manifest-defined, ignored here).
     * @param shell - Shell from bunshot-ssr.
     * @param bsCtx - Bunshot context.
     */
    async renderChain(
      chain: SsrRouteChainShape,
      shell: SsrShellShape,
      bsCtx: unknown,
    ): Promise<Response> {
      // Manifest renderer delegates chain rendering to render() with the leaf page.
      // Manifest layout composition is handled by PageRenderer, not file-based layouts.
      // Use the local render reference (not this.render) since this is a plain object.
      const response = await manifestRenderer.render(chain.page, shell, bsCtx);

      // Phase 27: propagate interception header
      if (chain.intercepted) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("x-snapshot-interception", "modal");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return response;
    },

    /**
     * Render an entity-driven page by augmenting the existing manifest with a
     * synthetic route for the resolved page declaration.
     */
    async renderPage(
      result: PageLoaderResult,
      shell: SsrShellShape,
      _bsCtx: unknown,
    ): Promise<Response> {
      if (isCustomPage(result.declaration.declaration)) {
        throw new Error(
          "Custom page declarations are not supported by createManifestRenderer().",
        );
      }

      const mapped = mapPageDeclaration(result);
      const routeId = `entity-page:${result.declaration.key}`;
      const augmentedManifest: ManifestConfig = {
        ...frozen.manifest,
        ...(!frozen.manifest.app && result.navigation
          ? { app: mapAppConfig(result.navigation) }
          : {}),
        ...(!frozen.manifest.navigation && result.navigation
          ? { navigation: mapNavigation(result.navigation) }
          : {}),
        routes: [
          ...frozen.manifest.routes,
          {
            id: routeId,
            path: result.declaration.declaration.path,
            ...mapped.page,
          },
        ],
        resources: {
          ...(frozen.manifest.resources ?? {}),
          ...mapped.resources,
        },
        state: {
          ...(frozen.manifest.state ?? {}),
          ...mapped.state,
        },
        overlays: {
          ...(frozen.manifest.overlays ?? {}),
          ...mapped.overlays,
        },
      };
      const compiledWithEntity = compileManifest(augmentedManifest);
      const currentRoute = compiledWithEntity.routes.find((route) => route.id === routeId);

      if (!currentRoute) {
        throw new Error(
          `[snapshot-ssr] Failed to compile entity page "${routeId}".`,
        );
      }

      applyEntityPageMetadata(shell, result);

      const pageElement = React.createElement(PageRenderer, {
        page: currentRoute.page,
        routeId: currentRoute.id,
        state: compiledWithEntity.state,
        resources: compiledWithEntity.resources,
      });
      const navConfig = buildManifestNavConfig(compiledWithEntity);
      const shellMode =
        compiledWithEntity.navigation?.mode ??
        (compiledWithEntity.app.shell === "top-nav"
          ? "top-nav"
          : compiledWithEntity.app.shell === "sidebar"
            ? "sidebar"
            : "none");
      const wrappedPage =
        navConfig && shellMode !== "none"
          ? React.createElement(
              AppShellWrapper,
              {
                shell: shellMode,
                navConfig,
                pathname: currentRoute.path,
                children: pageElement,
              },
            )
          : pageElement;
      const element = React.createElement(
        SnapshotApiContext.Provider,
        { value: null },
        React.createElement(
          ManifestRuntimeProvider,
          {
            manifest: compiledWithEntity,
            children: React.createElement(
              AppContextProvider,
              {
                globals: compiledWithEntity.state,
                resources: compiledWithEntity.resources,
                children: React.createElement(
                  RouteRuntimeProvider,
                  {
                    value: {
                      currentPath: currentRoute.path,
                      currentRoute,
                      params: {},
                      navigate: () => {},
                      isPreloading: false,
                    },
                    children: wrappedPage,
                  },
                ),
              },
            ),
          },
        ),
      );

      const requestContext: SsrRequestContext = {
        queryClient: new QueryClient({
          defaultOptions: {
            queries: { staleTime: Infinity, retry: false },
          },
        }),
        match: {
          filePath: `manifest:${routeId}`,
          metaFilePath: null,
          params: {},
          query: {},
          url: new URL(`http://snapshot.local${currentRoute.path}`),
        },
      };
      const response = await renderPage(
        element,
        requestContext,
        {
          ...shell,
          headTags: buildEntityHeadTags(shell, result),
        },
        undefined,
        rscOptions,
      );

      return withEntityPageHeaders(response, result);
    },
  };

  return manifestRenderer;
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
