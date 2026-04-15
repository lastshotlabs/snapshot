// src/ssr/manifest-renderer.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { QueryClient } from "@tanstack/react-query";
import { AppContextProvider } from "../ui/context/providers";
import { Layout } from "../ui/components/layout/layout";
import { Nav } from "../ui/components/layout/nav";
import { resolveDetectedLocale, resolveI18nRefs } from "../ui/i18n/resolve";
import type { PolicyExpr } from "../ui/policies/types";
import {
  AppShellWrapper,
  isCustomPage,
  mapAppConfig,
  mapNavigation,
  mapPageDeclaration,
  type PageLoaderResult,
} from "../ui/entity-pages";
import { compileManifest } from "../ui/manifest/compiler";
import { evaluateManifestGuard } from "../ui/manifest/guard-registry";
import { ComponentRenderer, PageRenderer } from "../ui/manifest/renderer";
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
import { runManifestSsrMiddleware } from "./middleware-runner";
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

interface RouteLayoutSlotDeclaration {
  name: string;
  required?: boolean;
  fallback?: Record<string, unknown>;
}

type RouteLayoutDeclaration =
  | string
  | {
      type: string;
      props?: Record<string, unknown>;
      slots?: RouteLayoutSlotDeclaration[];
    };

type RouteSlotsDeclaration = Record<string, Record<string, unknown>[]>;

const SLOT_ENABLED_LAYOUT_TYPES = new Set(["sidebar", "top-nav", "stacked"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRawRouteRecord(
  manifest: CompiledManifest,
  routeId: string,
): Record<string, unknown> | undefined {
  const rawRoutes = isRecord(manifest.raw)
    ? ((manifest.raw as Record<string, unknown>)["routes"] as unknown)
    : undefined;
  if (!Array.isArray(rawRoutes)) {
    return undefined;
  }

  return rawRoutes.find(
    (route) => isRecord(route) && route["id"] === routeId,
  ) as Record<string, unknown> | undefined;
}

function readRouteLayouts(
  manifest: CompiledManifest,
  routeId: string,
): RouteLayoutDeclaration[] {
  const rawRoute = getRawRouteRecord(manifest, routeId);
  const layouts = rawRoute?.["layouts"];
  if (!Array.isArray(layouts) || layouts.length === 0) {
    return [manifest.app.shell ?? "full-width"];
  }

  return layouts.filter(
    (layout): layout is RouteLayoutDeclaration =>
      typeof layout === "string" || isRecord(layout),
  );
}

function readRouteSlots(
  manifest: CompiledManifest,
  routeId: string,
): RouteSlotsDeclaration {
  const rawRoute = getRawRouteRecord(manifest, routeId);
  const slots = rawRoute?.["slots"];
  if (!isRecord(slots)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(slots).map(([slotName, slotValue]) => {
      if (!Array.isArray(slotValue)) {
        return [slotName, []];
      }

      return [
        slotName,
        slotValue.filter((entry): entry is Record<string, unknown> =>
          isRecord(entry),
        ),
      ];
    }),
  );
}

function getLayoutType(layout: RouteLayoutDeclaration): string {
  if (typeof layout === "string") {
    return layout;
  }

  return layout.type;
}

function getLayoutProps(
  layout: RouteLayoutDeclaration,
): Record<string, unknown> {
  if (typeof layout === "string") {
    return {};
  }

  return layout.props ?? {};
}

function getLayoutSlots(
  layout: RouteLayoutDeclaration,
): RouteLayoutSlotDeclaration[] {
  if (typeof layout === "string") {
    return [];
  }

  return Array.isArray(layout.slots) ? layout.slots : [];
}

function getBuiltInLayoutSlots(type: string): RouteLayoutSlotDeclaration[] {
  if (!SLOT_ENABLED_LAYOUT_TYPES.has(type)) {
    return [];
  }

  return [
    { name: "header" },
    { name: "sidebar" },
    { name: "main", required: true },
    { name: "footer" },
  ];
}

function layoutSupportsSlots(layout: RouteLayoutDeclaration): boolean {
  return (
    SLOT_ENABLED_LAYOUT_TYPES.has(getLayoutType(layout)) ||
    getLayoutSlots(layout).length > 0
  );
}

function extractRequestHeaders(bsCtx: unknown): Record<string, string> {
  if (!bsCtx || typeof bsCtx !== "object") {
    return {};
  }

  const candidate = bsCtx as Record<string, unknown>;
  const request = candidate["request"];
  if (request instanceof Request) {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  const req = candidate["req"];
  const rawHeaders =
    req && typeof req === "object"
      ? (req as Record<string, unknown>)["headers"]
      : undefined;
  if (rawHeaders && typeof rawHeaders === "object") {
    return Object.fromEntries(
      Object.entries(rawHeaders as Record<string, unknown>).map(
        ([key, value]) => [key, String(value)],
      ),
    );
  }

  return {};
}

function resolveLocalizedManifest(
  manifest: CompiledManifest,
  requestHeaders: Record<string, string>,
): CompiledManifest {
  const locale = resolveDetectedLocale(manifest.raw.i18n, {
    acceptLanguageHeader: requestHeaders["accept-language"],
  });
  if (!locale) {
    return manifest;
  }

  return resolveI18nRefs(manifest, {
    locale,
    i18n: manifest.raw.i18n,
  });
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
  const resolveRouteByPath = (
    pathname: string,
  ): { route: CompiledRoute; params: Record<string, string> } | null => {
    const normalized =
      pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    const exact = compiled.routeMap[normalized];
    if (exact) {
      return { route: exact, params: {} };
    }

    for (const entry of routeEntries) {
      const match = entry.pattern.exec(normalized);
      if (!match) {
        continue;
      }

      const params: Record<string, string> = {};
      for (const name of entry.paramNames) {
        const value = match.groups?.[name];
        if (value !== undefined) {
          params[name] = decodeURIComponent(value);
        }
      }

      return { route: entry.route, params };
    }

    return null;
  };

  const buildManifestRouteElement = (
    runtimeManifest: CompiledManifest,
    route: CompiledRoute,
    currentPath: string,
    isLoading: boolean,
    routeParams: Record<string, string>,
  ): React.ReactElement => {
    const navConfig = runtimeManifest.navigation
      ? ({
          type: "nav",
          items: runtimeManifest.navigation.items,
          collapsible: true,
          userMenu: true,
        } as const)
      : null;
    const routeLayouts = readRouteLayouts(runtimeManifest, route.id);
    const routeSlots = readRouteSlots(runtimeManifest, route.id);
    const slotLayout = routeLayouts.find((layout) => layoutSupportsSlots(layout));
    if (Object.keys(routeSlots).length > 0) {
      const layoutType = slotLayout
        ? getLayoutType(slotLayout)
        : getLayoutType(routeLayouts[0] ?? "full-width");
      const declaredSlots = new Map<string, RouteLayoutSlotDeclaration>();
      for (const slot of getBuiltInLayoutSlots(layoutType)) {
        declaredSlots.set(slot.name, slot);
      }
      if (slotLayout) {
        for (const slot of getLayoutSlots(slotLayout)) {
          declaredSlots.set(slot.name, slot);
        }
      }
      const availableSlots = [...declaredSlots.keys()];
      for (const slotName of Object.keys(routeSlots)) {
        if (!declaredSlots.has(slotName)) {
          throw new Error(
            `Layout "${layoutType}" does not declare slot "${slotName}". Available slots: ${availableSlots.join(", ")}.`,
          );
        }
      }
    }

    const loadingFallback = React.createElement(ComponentRenderer, {
      config: { type: "spinner" },
    });

    const pageNode = isLoading
      ? React.createElement(
          "div",
          {
            "data-snapshot-route-loading": "",
            style: { padding: "1rem" },
          },
          loadingFallback,
        )
      : React.createElement(PageRenderer, {
          page: route.page,
          routeId: currentPath,
          state: runtimeManifest.state,
          resources: runtimeManifest.resources,
        });

    const renderSlot = (
      layoutType: string,
      declaration: RouteLayoutSlotDeclaration | undefined,
      defaultContent?: React.ReactNode,
    ): React.ReactNode => {
      const slotName = declaration?.name ?? "";
      const slotItems = routeSlots[slotName] ?? [];
      const hasRouteContent = slotItems.length > 0;

      const content = hasRouteContent
        ? React.createElement(
            React.Fragment,
            null,
            ...slotItems.map((slotConfig, index) =>
              React.createElement(ComponentRenderer, {
                key: `slot:${slotName}:${index}`,
                config: slotConfig as never,
              }),
            ),
          )
        : declaration?.fallback
          ? React.createElement(ComponentRenderer, {
              config: declaration.fallback as never,
            })
          : (defaultContent ?? null);

      if (!content) {
        if (declaration?.required) {
          throw new Error(
            `Layout "${layoutType}" requires slot "${declaration.name}" but no content was provided.`,
          );
        }
        return null;
      }

      const suspenseFallback = declaration?.fallback
        ? React.createElement(ComponentRenderer, {
            config: declaration.fallback as never,
          })
        : loadingFallback;

      return React.createElement(
        React.Suspense,
        {
          key: `slot-boundary:${layoutType}:${slotName || "main"}`,
          fallback: suspenseFallback,
        },
        content,
      );
    };

    const composedNode = routeLayouts.reduceRight<React.ReactNode>(
      (children, layout, index) => {
        const layoutType = getLayoutType(layout);
        const slotDeclarations = new Map<string, RouteLayoutSlotDeclaration>();
        for (const slot of getBuiltInLayoutSlots(layoutType)) {
          slotDeclarations.set(slot.name, slot);
        }
        for (const slot of getLayoutSlots(layout)) {
          slotDeclarations.set(slot.name, slot);
        }

        const slots = layoutSupportsSlots(layout)
          ? (Object.fromEntries(
              [...slotDeclarations.entries()].map(([slotName, declaration]) => [
                slotName,
                renderSlot(
                  layoutType,
                  declaration,
                  slotName === "main" ? children : undefined,
                ),
              ]),
            ) as Record<string, React.ReactNode>)
          : undefined;

        const navNode =
          navConfig && (layoutType === "sidebar" || layoutType === "top-nav")
            ? React.createElement(Nav, {
                config: navConfig,
                pathname: currentPath,
              })
            : undefined;

        return React.createElement(Layout, {
          key: `layout:${layoutType}:${index}`,
          config: {
            type: "layout",
            variant: layoutType,
            ...getLayoutProps(layout),
          } as Parameters<typeof Layout>[0]["config"],
          nav: navNode,
          slots,
          children,
        });
      },
      pageNode,
    );

    return React.createElement(RouteRuntimeProvider, {
      value: {
        currentPath,
        currentRoute: route,
        match: {
          route,
          params: routeParams,
          parents: [],
          activeRoutes: [route],
        },
        params: routeParams,
        query: {},
        navigate: () => {},
        isPreloading: isLoading,
      },
      children: composedNode,
    });
  };

  const buildManifestFallbackElement = (
    runtimeManifest: CompiledManifest,
    runtimeRouteById: Record<string, CompiledRoute>,
    kind: "error" | "notFound",
    currentPath: string,
  ): React.ReactElement => {
    if (kind === "notFound" && runtimeManifest.app.notFound) {
      const route = runtimeRouteById[runtimeManifest.app.notFound];
      if (route) {
        return buildManifestRouteElement(
          runtimeManifest,
          route,
          currentPath,
          false,
          {},
        );
      }
    }

    if (kind === "error" && runtimeManifest.app.error) {
      if (typeof runtimeManifest.app.error === "string") {
        const route = runtimeRouteById[runtimeManifest.app.error];
        if (route) {
          return buildManifestRouteElement(
            runtimeManifest,
            route,
            currentPath,
            false,
            {},
          );
        }
      } else if (isRecord(runtimeManifest.app.error)) {
        return React.createElement(ComponentRenderer, {
          config: runtimeManifest.app.error as never,
        });
      }
    }

    return React.createElement(ComponentRenderer, {
      config: { type: kind === "notFound" ? "not-found" : "error-page" },
    });
  };

  // Declare as a variable so renderChain can reference render() without `this`
  const manifestRenderer: {
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
      const requestHeaders = extractRequestHeaders(bsCtx);
      const runtimeManifest = resolveLocalizedManifest(compiled, requestHeaders);
      const runtimeRouteById: Record<string, CompiledRoute> = Object.fromEntries(
        runtimeManifest.routes.map((route) => [route.id, route]),
      );
      const routeId = match.filePath.startsWith("manifest:")
        ? match.filePath.slice("manifest:".length)
        : null;

      let activeRoute = routeId ? runtimeRouteById[routeId] : undefined;
      let activeMatch = match;
      const responseHeaders = new Headers();
      let responseStatus: number | undefined;

      const applyResponseOverrides = (response: Response): Response => {
        const nextHeaders = new Headers(response.headers);
        responseHeaders.forEach((value, name) => {
          nextHeaders.set(name, value);
        });

        return new Response(response.body, {
          status: responseStatus ?? response.status,
          statusText: response.statusText,
          headers: nextHeaders,
        });
      };

      const renderWithProviders = async (
        element: React.ReactElement,
        requestMatch: SsrRouteMatchShape,
        headTags: string,
        queryCache: readonly SsrQueryCacheEntry[] = [],
      ): Promise<Response> => {
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
        const requestContext: SsrRequestContext = {
          queryClient,
          match: requestMatch,
        };

        const wrapped = React.createElement(ManifestRuntimeProvider, {
          manifest: runtimeManifest,
          children: React.createElement(AppContextProvider, {
            globals: runtimeManifest.state,
            resources: runtimeManifest.resources,
            children: element,
          }),
        });

        const rendered = await renderPage(
          wrapped,
          requestContext,
          { ...shell, headTags },
          undefined,
          rscOptions,
        );

        return applyResponseOverrides(rendered);
      };

      const buildGuardDeniedElement = (
        route: CompiledRoute,
        requestMatch: SsrRouteMatchShape,
        render: Record<string, unknown>,
      ): React.ReactElement =>
        React.createElement(RouteRuntimeProvider, {
          value: {
            currentPath: requestMatch.url.pathname,
            currentRoute: route,
            match: {
              route,
              params: requestMatch.params as Record<string, string>,
              parents: [],
              activeRoutes: [route],
            },
            params: requestMatch.params as Record<string, string>,
            query: requestMatch.query as Record<string, string>,
            navigate: () => {},
            isPreloading: false,
          },
          children: React.createElement(ComponentRenderer, {
            config: render as never,
          }),
        });

      try {
        const middlewareResult = await runManifestSsrMiddleware({
          manifest: compiled,
          pathname: match.url.pathname,
          url: match.url.toString(),
          method: "GET",
          params: { ...match.params },
          query: { ...match.query },
          requestHeaders,
          workflows: compiled.workflows,
        });

        Object.entries(middlewareResult.response.headers).forEach(
          ([name, value]) => {
            responseHeaders.set(name, value);
          },
        );
        responseStatus = middlewareResult.response.status ?? responseStatus;

        if (middlewareResult.response.redirect) {
          const redirectResponse = Response.redirect(
            middlewareResult.response.redirect.url,
            middlewareResult.response.redirect.permanent ? 308 : 302,
          );
          return applyResponseOverrides(redirectResponse);
        }

        if (middlewareResult.response.halt) {
          const halted = new Response(null, {
            status: middlewareResult.response.status ?? 204,
          });
          return applyResponseOverrides(halted);
        }

        if (middlewareResult.response.rewrite) {
          const rewritten = resolveRouteByPath(
            middlewareResult.response.rewrite,
          );
          if (!rewritten) {
            responseStatus = responseStatus ?? 404;
            const rewrittenUrl = new URL(
              middlewareResult.response.rewrite,
              match.url,
            );
            const fallback = buildManifestFallbackElement(
              runtimeManifest,
              runtimeRouteById,
              "notFound",
              middlewareResult.response.rewrite,
            );
            return renderWithProviders(
              fallback,
              {
                ...match,
                url: rewrittenUrl,
                params: {},
                query: Object.fromEntries(rewrittenUrl.searchParams.entries()),
              },
              shell.headTags,
            );
          }

          activeRoute = runtimeRouteById[rewritten.route.id];
          const rewrittenUrl = new URL(
            middlewareResult.response.rewrite,
            match.url,
          );
          activeMatch = {
            ...match,
            url: rewrittenUrl,
            params: rewritten.params,
            query: Object.fromEntries(rewrittenUrl.searchParams.entries()),
          };
        }

        if (!activeRoute) {
          responseStatus = responseStatus ?? 404;
          const fallback = buildManifestFallbackElement(
            runtimeManifest,
            runtimeRouteById,
            "notFound",
            activeMatch.url.pathname,
          );
          return renderWithProviders(fallback, activeMatch, shell.headTags);
        }

        if (activeRoute.guard) {
          const user = frozen.getUser
            ? ((await frozen
                .getUser(new Headers(requestHeaders))
                .catch((): null => null)) as Record<string, unknown> | null)
            : null;
          const guardResult = evaluateManifestGuard(activeRoute.guard, {
            route: activeRoute,
            user,
            manifest: runtimeManifest,
            policies: (runtimeManifest.raw.policies ?? {}) as Record<
              string,
              PolicyExpr
            >,
            routeContext: {
              id: activeRoute.id,
              path: activeMatch.url.pathname,
              pattern: activeRoute.path,
              params: activeMatch.params as Record<string, string>,
              query: activeMatch.query as Record<string, string>,
            },
          });
          if (!guardResult.allow) {
            if (guardResult.render) {
              const deniedElement = buildGuardDeniedElement(
                activeRoute,
                activeMatch,
                guardResult.render as Record<string, unknown>,
              );
              const deniedHeadTags = activeRoute.page.title
                ? `<title>${escapeHtml(activeRoute.page.title)}</title>`
                : shell.headTags;
              return renderWithProviders(
                deniedElement,
                activeMatch,
                deniedHeadTags,
              );
            }

            const isAuthenticatedGuard =
              typeof activeRoute.guard === "string"
                ? activeRoute.guard === "authenticated"
                : activeRoute.guard.authenticated === true ||
                  activeRoute.guard.name === "authenticated";
            const redirectResponse = Response.redirect(
              guardResult.redirect ?? (isAuthenticatedGuard ? "/login" : "/"),
              302,
            );
            return applyResponseOverrides(redirectResponse);
          }
        }

        const queryCache: SsrQueryCacheEntry[] = [];
        if (activeRoute.preload?.length && frozen.preloadResolvers) {
          for (const preloadTarget of activeRoute.preload) {
            const resourceKey =
              typeof preloadTarget === "string"
                ? preloadTarget
                : preloadTarget.resource;
            const resolver = frozen.preloadResolvers[resourceKey];
            if (!resolver) {
              continue;
            }

            try {
              const data = await resolver(activeMatch.params, bsCtx);
              queryCache.push({
                queryKey: [resourceKey, activeMatch.params] as const,
                data,
              });
            } catch (err) {
              console.warn(
                `[snapshot-ssr] Preload resolver '${resourceKey}' failed:`,
                err,
              );
            }
          }
        }

        const pageElement = buildManifestRouteElement(
          runtimeManifest,
          activeRoute,
          activeMatch.url.pathname,
          false,
          activeMatch.params,
        );
        const headTags = activeRoute.page.title
          ? `<title>${escapeHtml(activeRoute.page.title)}</title>`
          : shell.headTags;

        return renderWithProviders(
          pageElement,
          activeMatch,
          headTags,
          queryCache,
        );
      } catch (error) {
        console.error("[snapshot-ssr] manifest route render failed:", error);
        responseStatus = responseStatus ?? 500;
        const fallback = buildManifestFallbackElement(
          runtimeManifest,
          runtimeRouteById,
          "error",
          activeMatch.url.pathname,
        );
        return renderWithProviders(fallback, activeMatch, shell.headTags);
      }
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
     * Layout composition, slots, middleware, and fallbacks are all handled in `render()`.
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
      const currentRoute = compiledWithEntity.routes.find(
        (route) => route.id === routeId,
      );

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
          ? React.createElement(AppShellWrapper, {
              shell: shellMode,
              navConfig,
              pathname: currentRoute.path,
              children: pageElement,
            })
          : pageElement;
      const element = React.createElement(ManifestRuntimeProvider, {
        manifest: compiledWithEntity,
        children: React.createElement(AppContextProvider, {
          globals: compiledWithEntity.state,
          resources: compiledWithEntity.resources,
          children: React.createElement(RouteRuntimeProvider, {
            value: {
              currentPath: currentRoute.path,
              currentRoute,
              match: {
                route: currentRoute,
                params: {},
                parents: [],
                activeRoutes: [currentRoute],
              },
              params: {},
              query: {},
              navigate: () => {},
              isPreloading: false,
            },
            children: wrappedPage,
          }),
        }),
      });

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
