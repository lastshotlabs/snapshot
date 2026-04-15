// src/ssr/renderer.ts
import { QueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import React from "react";
import { AppContextProvider } from "../ui/context/providers";
import {
  AppShellWrapper,
  isCustomPage,
  mapNavComponentConfig,
  mapPageDeclaration,
  type CustomPageDeclaration,
  type PageLoaderResult,
} from "../ui/entity-pages";
import { compileManifest } from "../ui/manifest/compiler";
import { PageRenderer } from "../ui/manifest/renderer";
import type { ManifestConfig } from "../ui/manifest/types";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
} from "../ui/manifest/runtime";
import { buildHeadTags } from "./head";
import { renderPage } from "./render";
import type {
  ServerRouteMatchShape,
  SnapshotSsrConfig,
  SsrLoadResult,
  SsrRequestContext,
  SsrShellShape,
} from "./types";

// ─── Route chain shape (structural — avoids cross-repo import) ─────────────────

/**
 * Structural equivalent of `SsrRouteChain` from `@lastshotlabs/bunshot-ssr`.
 * Defined here to avoid cross-repo coupling (Rule 9: structural typing).
 *
 * @internal
 */
interface SsrRouteChainShape {
  readonly layouts: readonly ServerRouteMatchShape[];
  readonly page: ServerRouteMatchShape;
  readonly slots?: ReadonlyArray<{
    readonly name: string;
    readonly match: ServerRouteMatchShape | null;
    readonly defaultFilePath?: string | null;
  }>;
  readonly intercepted?: boolean;
  readonly middlewareFilePath: string | null;
}

// ─── Internal type guards ─────────────────────────────────────────────────────

function isRedirectResult(
  r: unknown,
): r is { redirect: string; status?: number } {
  return typeof r === "object" && r !== null && "redirect" in r;
}

function isNotFoundResult(r: unknown): r is { notFound: true } {
  return typeof r === "object" && r !== null && "notFound" in r;
}

function isForbiddenResult(r: unknown): r is { forbidden: true } {
  return typeof r === "object" && r !== null && "forbidden" in r;
}

function isUnauthorizedResult(r: unknown): r is { unauthorized: true } {
  return typeof r === "object" && r !== null && "unauthorized" in r;
}

function isLoadResult(
  r: unknown,
): r is { data: Record<string, unknown>; queryCache?: unknown[] } {
  return typeof r === "object" && r !== null && "data" in r;
}

// ─── SSR Error Boundary (Phase 28) ───────────────────────────────────────────

/**
 * React class component error boundary for SSR use.
 *
 * Wraps page components when an `error.ts` file is co-located with the route.
 * In production, caught errors render the `FallbackComponent`. The `reset`
 * callback is a no-op during SSR (state cannot be mutated after the stream ends),
 * but is provided for client-side hydration compatibility.
 *
 * @internal
 */
class SsrErrorBoundary extends React.Component<
  {
    FallbackComponent: React.ComponentType<{
      error: Error;
      reset: () => void;
    }>;
    children?: React.ReactNode;
  },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  render(): React.ReactNode {
    if (this.state.error) {
      const err = this.state.error;
      return React.createElement(this.props.FallbackComponent, {
        error: err,
        reset: () => this.setState({ error: null }),
      });
    }
    return this.props.children;
  }
}

// ─── Convention component loader (Phase 28) ──────────────────────────────────

/**
 * Dynamically import a convention component (loading.ts, error.ts, not-found.ts).
 * Returns `null` when the file path is null or the import fails.
 *
 * @internal
 */
async function importConventionComponent(
  filePath: string | null,
): Promise<React.ComponentType<Record<string, unknown>> | null> {
  if (!filePath) return null;
  try {
    const mod = (await import(filePath)) as Record<string, unknown>;
    const component = mod["default"] ?? mod["component"];
    if (typeof component === "function") {
      return component as React.ComponentType<Record<string, unknown>>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Wrap an element in a Suspense boundary when a loading component is available.
 *
 * @internal
 */
function wrapWithSuspense(
  element: React.ReactElement,
  LoadingComponent: React.ComponentType<Record<string, unknown>> | null,
): React.ReactElement {
  if (!LoadingComponent) return element;
  return React.createElement(
    React.Suspense,
    { fallback: React.createElement(LoadingComponent, {}) },
    element,
  );
}

/**
 * Wrap an element in an error boundary when an error component is available.
 *
 * @internal
 */
function wrapWithErrorBoundary(
  element: React.ReactElement,
  ErrorComponent: React.ComponentType<{
    error: Error;
    reset: () => void;
  }> | null,
): React.ReactElement {
  if (!ErrorComponent) return element;
  return React.createElement(
    SsrErrorBoundary,
    { FallbackComponent: ErrorComponent },
    element,
  );
}

// ─── Load context builder ─────────────────────────────────────────────────────

/**
 * Build the `SsrLoadContext` for a given route match and request.
 *
 * Provides direct bunshot adapter access via `bsCtx` without an HTTP round-trip.
 * Auth resolution via `getUser()` calls into bunshot-auth's plugin state.
 * Draft mode status is forwarded from the shell's `_draftMode` flag, which the
 * bunshot-ssr middleware sets based on the incoming request cookie.
 * The `afterFn` parameter, when provided, is exposed as `ctx.after()` so load
 * functions can schedule post-response callbacks without importing from bunshot-ssr.
 *
 * @param match - The resolved route match for this request.
 * @param request - The raw HTTP request (used to read cookies for auth).
 * @param bsCtx - The bunshot context for direct DB/adapter access.
 * @param draftModeEnabled - Whether the request is in draft mode.
 * @param afterFn - Optional scheduler from `shell._after` for post-response callbacks.
 * @internal
 */
function buildLoadContext(
  match: ServerRouteMatchShape,
  request: Request,
  bsCtx: unknown,
  draftModeEnabled = false,
  afterFn?: (cb: () => void | Promise<void>) => void,
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
    /**
     * Returns the draft mode status for the current request.
     *
     * Reflects whether the incoming request carried the bunshot draft mode cookie.
     * The SSR middleware sets `shell._draftMode` before calling the renderer.
     *
     * @returns `{ isEnabled: boolean }` snapshot for this request.
     */
    draftMode(): { isEnabled: boolean } {
      return { isEnabled: draftModeEnabled };
    },
    /**
     * Schedule a callback to run after the HTTP response has been fully sent.
     *
     * Proxies to `shell._after` injected by the bunshot-ssr middleware.
     * When `_after` is not set (e.g. in tests), this is a no-op.
     *
     * @param callback - The async function to execute after the response is sent.
     */
    after(callback: () => void | Promise<void>): void {
      if (afterFn) afterFn(callback);
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

function buildEntityPageMatch(
  filePath: string,
  path: string,
): ServerRouteMatchShape {
  const pathname = path.startsWith("/") ? path : `/${path}`;

  return {
    filePath,
    metaFilePath: null,
    params: Object.freeze({}),
    query: Object.freeze({}),
    url: new URL(`http://snapshot.local${pathname}`),
    loadingFilePath: null,
    errorFilePath: null,
    notFoundFilePath: null,
    forbiddenFilePath: null,
    unauthorizedFilePath: null,
    templateFilePath: null,
  };
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
  const frozen = Object.freeze({ ...config });
  const timeoutMs = frozen.renderTimeoutMs ?? 5000;
  const rscOptions = frozen.rscOptions;

  const reactRenderer: {
    resolve(url: URL, bsCtx: unknown): Promise<ServerRouteMatchShape | null>;
    render(
      match: ServerRouteMatchShape,
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
      const loadContext = buildLoadContext(
        match,
        fakeRequest,
        bsCtx,
        shell._draftMode ?? false,
        shell._after,
      );

      // 1. Dynamic import the route module
      let routeModule: Record<string, unknown>;
      try {
        routeModule = (await import(match.filePath)) as Record<string, unknown>;
      } catch (err) {
        throw new Error(
          `[snapshot-ssr] Failed to import route module ${match.filePath}: ${String(err)}`,
        );
      }

      // Attach generateStaticParams to the match when the route exports it.
      // This makes the function available to the framework at build time without
      // requiring a separate import pass. Structural assignment — match is a plain
      // object produced by the resolver, so we can safely spread-override the field.
      const generateStaticParamsFn = routeModule["generateStaticParams"] as
        | ((
            ctx: unknown,
          ) => Promise<Record<string, string>[]> | Record<string, string>[])
        | undefined;
      if (
        generateStaticParamsFn !== undefined &&
        match.generateStaticParams === undefined
      ) {
        // Widen match to mutable for the one-time attachment.
        (match as { generateStaticParams?: unknown }).generateStaticParams =
          generateStaticParamsFn;
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

      // Handle forbidden (403)
      if (isForbiddenResult(loadResult)) {
        const ForbiddenComponent = await importConventionComponent(
          match.forbiddenFilePath ?? null,
        );
        if (ForbiddenComponent) {
          const element = React.createElement(ForbiddenComponent, {});
          const requestContext: SsrRequestContext = {
            queryClient: new QueryClient({
              defaultOptions: {
                queries: { staleTime: Infinity, retry: false },
              },
            }),
            match,
          };
          const resp = await renderPage(
            element,
            requestContext,
            shell,
            timeoutMs,
            rscOptions,
          );
          return new Response(resp.body, {
            status: 403,
            headers: resp.headers,
          });
        }
        return new Response("Forbidden", {
          status: 403,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // Handle unauthorized (401)
      if (isUnauthorizedResult(loadResult)) {
        const UnauthorizedComponent = await importConventionComponent(
          match.unauthorizedFilePath ?? null,
        );
        if (UnauthorizedComponent) {
          const element = React.createElement(UnauthorizedComponent, {});
          const requestContext: SsrRequestContext = {
            queryClient: new QueryClient({
              defaultOptions: {
                queries: { staleTime: Infinity, retry: false },
              },
            }),
            match,
          };
          const resp = await renderPage(
            element,
            requestContext,
            shell,
            timeoutMs,
            rscOptions,
          );
          return new Response(resp.body, {
            status: 401,
            headers: resp.headers,
          });
        }
        return new Response("Unauthorized", {
          status: 401,
          headers: { "Content-Type": "text/plain" },
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

      // 5b. Write ISR metadata — route segment config takes highest precedence.
      //
      // Resolution order (highest → lowest):
      //   a. `export const dynamic = 'force-dynamic'` → noStore (no caching)
      //   b. `export const dynamic = 'force-static'`  → revalidate = Infinity
      //   c. `export const revalidate = N`            → overrides load() revalidate
      //   d. `load()` return `.revalidate`            → default
      if (shell._isr) {
        const segmentRevalidate = routeModule["revalidate"];
        const segmentDynamic = routeModule["dynamic"];

        let effectiveRevalidate = ssrLoadResult.revalidate;

        if (segmentDynamic === "force-dynamic") {
          shell._isr.noStore = true;
          effectiveRevalidate = undefined;
        } else if (segmentDynamic === "force-static") {
          effectiveRevalidate = Infinity;
        } else if (typeof segmentRevalidate === "number") {
          effectiveRevalidate = segmentRevalidate;
        } else if (segmentRevalidate === false) {
          effectiveRevalidate = Infinity;
        }

        shell._isr.revalidate = effectiveRevalidate;
        shell._isr.tags = ssrLoadResult.tags;
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

      return renderPage(
        element,
        requestContext,
        fullShell,
        timeoutMs,
        rscOptions,
      );
    },

    /**
     * Render a full layout chain to a streaming HTML Response.
     *
     * Executes all layout `load()` functions in parallel (they are independent),
     * then executes the page `load()`. Meta is merged child-overrides-parent.
     * Builds the nested React tree outermost-layout → ... → page, then renders.
     *
     * When `chain.slots` is present, each slot's `load()` is also executed and
     * slot components are passed to the outermost layout as a `slots` prop.
     *
     * When `chain.intercepted` is true, adds `X-Snapshot-Interception: modal`
     * to the response.
     *
     * @param chain - Fully resolved route chain from bunshot-ssr's resolver.
     * @param shell - Shell from bunshot-ssr (asset tags, nonce, ISR sink).
     * @param bsCtx - Bunshot context for DB access and auth.
     */
    async renderChain(
      chain: SsrRouteChainShape,
      shell: SsrShellShape,
      bsCtx: unknown,
    ): Promise<Response> {
      const fakeRequest = new Request(chain.page.url.toString());
      const pageLoadContext = buildLoadContext(
        chain.page,
        fakeRequest,
        bsCtx,
        shell._draftMode ?? false,
        shell._after,
      );

      // 1. Import all route modules in parallel (layouts + page)
      const [layoutModules, pageModule] = await Promise.all([
        Promise.all(
          chain.layouts.map(async (layout) => {
            try {
              return (await import(layout.filePath)) as Record<string, unknown>;
            } catch (err) {
              throw new Error(
                `[snapshot-ssr] Failed to import layout module ${layout.filePath}: ${String(err)}`,
              );
            }
          }),
        ),
        (async () => {
          try {
            return (await import(chain.page.filePath)) as Record<
              string,
              unknown
            >;
          } catch (err) {
            throw new Error(
              `[snapshot-ssr] Failed to import page module ${chain.page.filePath}: ${String(err)}`,
            );
          }
        })(),
      ]);

      // Attach generateStaticParams from the page module to the page match when present.
      // This makes the function available to the framework at build time without a
      // separate import pass (mirrors the same step in render()).
      const pageGenerateStaticParams = pageModule["generateStaticParams"] as
        | ((
            ctx: unknown,
          ) => Promise<Record<string, string>[]> | Record<string, string>[])
        | undefined;
      if (
        pageGenerateStaticParams !== undefined &&
        chain.page.generateStaticParams === undefined
      ) {
        (
          chain.page as { generateStaticParams?: unknown }
        ).generateStaticParams = pageGenerateStaticParams;
      }

      // 2. Execute load() for all layouts in parallel, then page
      const layoutLoadContexts = chain.layouts.map((layout) =>
        buildLoadContext(
          layout,
          fakeRequest,
          bsCtx,
          shell._draftMode ?? false,
          shell._after,
        ),
      );

      const [layoutResults, pageResult] = await Promise.all([
        Promise.all(
          layoutModules.map(async (mod, i) => {
            const loadFn = mod["load"] as
              | ((ctx: unknown) => Promise<unknown>)
              | undefined;
            if (!loadFn) return { data: {} }; // layouts without load() are valid
            return loadFn(layoutLoadContexts[i]);
          }),
        ),
        (async () => {
          const loadFn = pageModule["load"] as
            | ((ctx: unknown) => Promise<unknown>)
            | undefined;
          if (!loadFn) {
            throw new Error(
              `[snapshot-ssr] Page module ${chain.page.filePath} has no exported 'load' function`,
            );
          }
          return loadFn(pageLoadContext);
        })(),
      ]);

      // 3. Page result takes precedence for redirect / not-found
      if (isRedirectResult(pageResult)) {
        return new Response(null, {
          status: pageResult.status ?? 302,
          headers: { Location: pageResult.redirect },
        });
      }

      if (isNotFoundResult(pageResult)) {
        // Phase 28: use co-located not-found.ts when available
        const NotFoundComponent = await importConventionComponent(
          chain.page.notFoundFilePath ?? null,
        );
        if (NotFoundComponent) {
          const element = React.createElement(NotFoundComponent, {});
          const requestContext: SsrRequestContext = {
            queryClient: new QueryClient({
              defaultOptions: {
                queries: { staleTime: Infinity, retry: false },
              },
            }),
            match: chain.page,
          };
          const resp = await renderPage(
            element,
            requestContext,
            shell,
            timeoutMs,
            rscOptions,
          );
          return new Response(resp.body, {
            status: 404,
            headers: resp.headers,
          });
        }
        return new Response("Not Found", { status: 404 });
      }

      // Handle forbidden (403) — use co-located forbidden.ts when available
      if (isForbiddenResult(pageResult)) {
        const ForbiddenComponent = await importConventionComponent(
          chain.page.forbiddenFilePath ?? null,
        );
        if (ForbiddenComponent) {
          const element = React.createElement(ForbiddenComponent, {});
          const requestContext: SsrRequestContext = {
            queryClient: new QueryClient({
              defaultOptions: {
                queries: { staleTime: Infinity, retry: false },
              },
            }),
            match: chain.page,
          };
          const resp = await renderPage(
            element,
            requestContext,
            shell,
            timeoutMs,
            rscOptions,
          );
          return new Response(resp.body, {
            status: 403,
            headers: resp.headers,
          });
        }
        return new Response("Forbidden", {
          status: 403,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // Handle unauthorized (401) — use co-located unauthorized.ts when available
      if (isUnauthorizedResult(pageResult)) {
        const UnauthorizedComponent = await importConventionComponent(
          chain.page.unauthorizedFilePath ?? null,
        );
        if (UnauthorizedComponent) {
          const element = React.createElement(UnauthorizedComponent, {});
          const requestContext: SsrRequestContext = {
            queryClient: new QueryClient({
              defaultOptions: {
                queries: { staleTime: Infinity, retry: false },
              },
            }),
            match: chain.page,
          };
          const resp = await renderPage(
            element,
            requestContext,
            shell,
            timeoutMs,
            rscOptions,
          );
          return new Response(resp.body, {
            status: 401,
            headers: resp.headers,
          });
        }
        return new Response("Unauthorized", {
          status: 401,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // Layout redirects (any layout can redirect)
      for (const layoutResult of layoutResults) {
        if (isRedirectResult(layoutResult)) {
          return new Response(null, {
            status: layoutResult.status ?? 302,
            headers: { Location: layoutResult.redirect },
          });
        }
      }

      if (!isLoadResult(pageResult)) {
        throw new Error(
          `[snapshot-ssr] load() in ${chain.page.filePath} returned an unexpected value`,
        );
      }

      const ssrPageResult = pageResult as SsrLoadResult;

      // 4. Seed QueryClient with all cache entries (layouts + page)
      const queryClient = new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
      });

      for (const result of layoutResults) {
        if (isLoadResult(result)) {
          const lr = result as SsrLoadResult;
          for (const entry of lr.queryCache ?? []) {
            queryClient.setQueryData(entry.queryKey as QueryKey, entry.data);
          }
        }
      }
      for (const entry of ssrPageResult.queryCache ?? []) {
        queryClient.setQueryData(entry.queryKey as QueryKey, entry.data);
      }

      // 5. Write ISR metadata — route segment config takes highest precedence.
      //
      // Resolution order (highest → lowest):
      //   a. `export const dynamic = 'force-dynamic'` → noStore (no caching)
      //   b. `export const dynamic = 'force-static'`  → revalidate = Infinity
      //   c. `export const revalidate = N`            → overrides load() revalidate
      //   d. `load()` return `.revalidate`            → default
      if (shell._isr) {
        const segmentRevalidate = pageModule["revalidate"];
        const segmentDynamic = pageModule["dynamic"];

        let effectiveRevalidate = ssrPageResult.revalidate;

        if (segmentDynamic === "force-dynamic") {
          // Mark as no-store — ISR middleware will not cache this response.
          shell._isr.noStore = true;
          effectiveRevalidate = undefined;
        } else if (segmentDynamic === "force-static") {
          // Treat as fully static — never revalidate.
          effectiveRevalidate = Infinity;
        } else if (typeof segmentRevalidate === "number") {
          // Module-level revalidate overrides load() return value.
          effectiveRevalidate = segmentRevalidate;
        } else if (segmentRevalidate === false) {
          // `export const revalidate = false` → static, equivalent to Infinity.
          effectiveRevalidate = Infinity;
        }

        shell._isr.revalidate = effectiveRevalidate;
        shell._isr.tags = ssrPageResult.tags;
      }

      // 6. Merge meta() — child overrides parent for same keys
      let headTags = "";
      const allMeta: Record<string, unknown> = {};

      for (let i = 0; i < chain.layouts.length; i++) {
        const layoutMod = layoutModules[i]!;
        const layoutResult = layoutResults[i];
        const metaFn = layoutMod["meta"] as
          | ((ctx: unknown, result: unknown) => Promise<unknown>)
          | undefined;
        if (metaFn && isLoadResult(layoutResult)) {
          try {
            const meta = await metaFn(layoutLoadContexts[i], layoutResult);
            if (meta && typeof meta === "object") {
              Object.assign(allMeta, meta);
            }
          } catch (err) {
            console.warn(
              `[snapshot-ssr] meta() in layout ${chain.layouts[i]!.filePath} threw:`,
              err,
            );
          }
        }
      }

      // Page meta overrides layout meta
      const pageMeta = pageModule["meta"] as
        | ((ctx: unknown, result: unknown) => Promise<unknown>)
        | undefined;
      if (pageMeta) {
        try {
          const meta = await pageMeta(pageLoadContext, ssrPageResult);
          if (meta && typeof meta === "object") {
            Object.assign(allMeta, meta);
          }
        } catch (err) {
          console.warn(
            `[snapshot-ssr] meta() in ${chain.page.filePath} threw:`,
            err,
          );
        }
      }

      if (Object.keys(allMeta).length > 0) {
        headTags = buildHeadTags(
          allMeta as Parameters<typeof buildHeadTags>[0],
        );
      }

      // 7. Resolve all layout and page components
      const [layoutComponents, PageComponent] = await Promise.all([
        Promise.all(chain.layouts.map((l) => frozen.resolveComponent(l))),
        frozen.resolveComponent(chain.page),
      ]);

      // 8. Load convention components for the page (Phase 28)
      const [LoadingComponent, ErrorComponent] = await Promise.all([
        importConventionComponent(chain.page.loadingFilePath ?? null),
        importConventionComponent(chain.page.errorFilePath ?? null),
      ]);

      // 9. Resolve slot components when parallel slots are present (Phase 26)
      const slotsMap: Record<string, React.ReactNode> = {};
      if (chain.slots && chain.slots.length > 0) {
        await Promise.all(
          chain.slots.map(async (slot) => {
            if (!slot.match) {
              // Check for a default.ts fallback in this slot directory
              if (slot.defaultFilePath) {
                try {
                  const DefaultComponent = await importConventionComponent(
                    slot.defaultFilePath,
                  );
                  if (DefaultComponent) {
                    slotsMap[slot.name] = React.createElement(
                      DefaultComponent,
                      {},
                    );
                  } else {
                    slotsMap[slot.name] = null;
                  }
                } catch {
                  slotsMap[slot.name] = null;
                }
              } else {
                slotsMap[slot.name] = null;
              }
              return;
            }
            try {
              const slotMod = (await import(slot.match.filePath)) as Record<
                string,
                unknown
              >;
              const slotLoadFn = slotMod["load"] as
                | ((ctx: unknown) => Promise<unknown>)
                | undefined;
              const slotLoadCtx = buildLoadContext(
                slot.match,
                fakeRequest,
                bsCtx,
                shell._draftMode ?? false,
                shell._after,
              );
              const slotResult = slotLoadFn
                ? await slotLoadFn(slotLoadCtx)
                : { data: {} };

              if (!isLoadResult(slotResult)) {
                slotsMap[slot.name] = null;
                return;
              }
              const slotResultTyped = slotResult as SsrLoadResult;

              for (const entry of slotResultTyped.queryCache ?? []) {
                queryClient.setQueryData(
                  entry.queryKey as QueryKey,
                  entry.data,
                );
              }

              const SlotComponent = await frozen.resolveComponent(slot.match);
              slotsMap[slot.name] = React.createElement(SlotComponent, {
                loaderData: slotResultTyped.data,
                params: slot.match.params,
                query: slot.match.query,
              });
            } catch (err) {
              console.warn(
                `[snapshot-ssr] Failed to render slot @${slot.name}:`,
                err,
              );
              slotsMap[slot.name] = null;
            }
          }),
        );
      }

      // 10. Build nested React tree from leaf to root
      //     Page is innermost; layouts wrap outward
      let element: React.ReactElement = React.createElement(PageComponent, {
        loaderData: ssrPageResult.data,
        params: chain.page.params,
        query: chain.page.query,
      });

      // Apply convention wrappers (innermost first, so suspense is outermost of page)
      element = wrapWithErrorBoundary(
        element,
        ErrorComponent as React.ComponentType<{
          error: Error;
          reset: () => void;
        }> | null,
      );
      element = wrapWithSuspense(element, LoadingComponent);

      // Wrap with layouts from innermost to outermost
      for (let i = layoutComponents.length - 1; i >= 0; i--) {
        const LayoutComponent = layoutComponents[i]!;
        const layoutResultForProps = layoutResults[i];
        const layoutData = isLoadResult(layoutResultForProps)
          ? (layoutResultForProps as SsrLoadResult).data
          : {};
        const layoutParams = chain.layouts[i]!.params;

        // The outermost layout (i === 0) receives the slots map (Phase 26)
        const extraProps: Record<string, unknown> =
          i === 0 && Object.keys(slotsMap).length > 0
            ? { slots: slotsMap }
            : {};

        // If this layout level has a co-located template.ts, wrap element in the
        // template first. Templates render identically to layouts during SSR;
        // client-side remounting is enforced by the router giving the template
        // wrapper a navigation-keyed `key` prop.
        const templateFilePath = chain.layouts[i]?.templateFilePath;
        if (templateFilePath) {
          const TemplateComponent =
            await importConventionComponent(templateFilePath);
          if (TemplateComponent) {
            element = React.createElement(TemplateComponent, {
              loaderData: layoutData, // same data as the parent layout
              params: layoutParams,
              children: element,
            });
          }
        }

        element = React.createElement(LayoutComponent, {
          loaderData: layoutData,
          params: layoutParams,
          children: element,
          ...extraProps,
        });
      }

      // 11. Render via renderPage()
      const fullShell: SsrShellShape = { ...shell, headTags };
      const requestContext: SsrRequestContext = {
        queryClient,
        match: chain.page,
      };

      const response = await renderPage(
        element,
        requestContext,
        fullShell,
        timeoutMs,
        rscOptions,
      );

      // Phase 27: add interception header
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
     * Render an entity-driven bunshot page by mapping it onto Snapshot's
     * manifest component system.
     *
     * Custom handler-ref pages are delegated back to the standard route render
     * path using the handler module path as the route file.
     */
    async renderPage(
      result: PageLoaderResult,
      shell: SsrShellShape,
      bsCtx: unknown,
    ): Promise<Response> {
      if (isCustomPage(result.declaration.declaration)) {
        const handlerRef = (
          result.declaration.declaration as CustomPageDeclaration
        ).handler;
        const routeMatch = buildEntityPageMatch(
          handlerRef.handler,
          result.declaration.declaration.path,
        );
        return reactRenderer.render(routeMatch, shell, bsCtx);
      }

      const mapped = mapPageDeclaration(result);
      const routeId = result.declaration.key;
      const rawManifest: ManifestConfig = {
        routes: [
          {
            id: routeId,
            path: result.declaration.declaration.path,
            ...mapped.page,
          },
        ],
        resources: mapped.resources,
        state: mapped.state,
        overlays: mapped.overlays,
      };
      const compiled = compileManifest(rawManifest);
      const currentRoute = compiled.routes[0];

      if (!currentRoute) {
        throw new Error(
          `[snapshot-ssr] Failed to compile entity page "${routeId}".`,
        );
      }

      applyEntityPageMetadata(shell, result);

      const api = frozen.snapshot?.api;
      const pageElement = React.createElement(PageRenderer, {
        page: currentRoute.page,
        routeId: currentRoute.id,
        state: compiled.state,
        resources: compiled.resources,
        api,
      });
      const navConfig = result.navigation
        ? mapNavComponentConfig(result.navigation)
        : undefined;
      const wrappedPage =
        result.navigation && navConfig
          ? React.createElement(AppShellWrapper, {
              shell: result.navigation.shell,
              navConfig,
              pathname: currentRoute.path,
              children: pageElement,
            })
          : pageElement;
      const element = React.createElement(ManifestRuntimeProvider, {
        manifest: compiled,
        api,
        children: React.createElement(AppContextProvider, {
          globals: compiled.state,
          resources: compiled.resources,
          api,
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
        match: buildEntityPageMatch(`__page:${routeId}`, currentRoute.path),
      };
      const response = await renderPage(
        element,
        requestContext,
        {
          ...shell,
          headTags: buildEntityHeadTags(shell, result),
        },
        timeoutMs,
        rscOptions,
      );

      return withEntityPageHeaders(response, result);
    },
  };

  return reactRenderer;
}
