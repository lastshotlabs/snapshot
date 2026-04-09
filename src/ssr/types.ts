// src/ssr/types.ts
import type { QueryClient } from "@tanstack/react-query";
import type { SnapshotInstance } from "../types";
import type { ManifestConfig } from "../ui/manifest/types";

// ─── Structural shapes (no cross-repo import from bunshot-ssr) ────────────────

/**
 * Structural equivalent of `SsrRouteMatch` from `@lastshotlabs/bunshot-ssr`.
 *
 * Defined here without importing from bunshot-ssr to avoid cross-repo coupling.
 * TypeScript structural typing ensures compatibility at the consumer's compile time.
 */
export interface ServerRouteMatchShape {
  /** Absolute file path to the server route, or `manifest:<routeId>` for manifest routes. */
  readonly filePath: string;
  /** Absolute path to a separate `meta.ts` file (directory form), or `null`. */
  readonly metaFilePath: string | null;
  /** Dynamic route segment values extracted from the URL. */
  readonly params: Readonly<Record<string, string>>;
  /** Parsed query string params. */
  readonly query: Readonly<Record<string, string>>;
  /** The full request URL. */
  readonly url: URL;
  /**
   * Absolute path to a co-located `loading.ts` file (Phase 28).
   * When present, the renderer wraps the page in a `React.Suspense` boundary
   * whose fallback is the component exported from this file.
   * `null` when no loading convention file is co-located.
   */
  readonly loadingFilePath?: string | null;
  /**
   * Absolute path to a co-located `error.ts` file (Phase 28).
   * When present, the renderer wraps the page in an `SsrErrorBoundary`
   * whose fallback is the component exported from this file.
   * `null` when no error convention file is co-located.
   */
  readonly errorFilePath?: string | null;
  /**
   * Absolute path to a co-located `not-found.ts` file (Phase 28).
   * When `load()` returns `{ notFound: true }`, this component is rendered
   * with a 404 HTTP status instead of the SPA shell fallback.
   * `null` when no not-found convention file is co-located.
   */
  readonly notFoundFilePath?: string | null;
  /**
   * The `generateStaticParams` function exported from this route module, if any.
   *
   * Populated by the renderer after dynamically importing the route file.
   * `undefined` when the route module does not export `generateStaticParams`.
   *
   * Used at build time by the static-params scanner to enumerate all concrete
   * URL paths for pre-rendering. Not called at request time.
   */
  readonly generateStaticParams?: ((ctx: unknown) => Promise<Record<string, string>[]> | Record<string, string>[]) | undefined;
}

/**
 * Structural equivalent of `IsrSink` from `@lastshotlabs/bunshot-ssr`.
 *
 * Mutable — written to by `renderPage()` after render completes.
 * The middleware reads these fields to decide whether to cache the response.
 *
 * @internal
 */
export interface IsrSinkShape {
  /** The `revalidate` value from `load()`. */
  revalidate?: number | false;
  /** The `tags` array from `load()`. */
  tags?: readonly string[];
  /**
   * Set to `true` when the loader called `unstable_noStore()`.
   * When `true`, the middleware skips the ISR cache write.
   */
  noStore?: boolean;
}

/**
 * Structural equivalent of `SsrShell` from `@lastshotlabs/bunshot-ssr`.
 *
 * Contains the HTML tag strings injected into the document `<head>` by bunshot-ssr.
 * Also carries the `_isr` sink which the renderer populates after calling `load()`.
 */
export interface SsrShellShape {
  /** HTML tags for title, meta, OG, Twitter, JSON-LD. */
  readonly headTags: string;
  /** `<link>` and `<script>` tags from the Vite asset manifest. */
  readonly assetTags: string;
  /** Optional CSP nonce for inline scripts. */
  readonly nonce?: string;
  /**
   * Framework-internal ISR sink. Populated by the renderer after calling `load()`.
   * The ISR middleware reads this to decide whether to cache the response.
   *
   * @internal Do not use in application code.
   */
  readonly _isr?: IsrSinkShape;
  /**
   * Whether the current request is in draft mode.
   *
   * Set by the bunshot-ssr middleware to `true` when the request carries the
   * draft mode cookie. The renderer reads this and exposes it as `ctx.draftMode()`
   * in every route load function.
   *
   * When `true`, the ISR cache is bypassed for this request.
   *
   * @internal Do not use in application code outside of renderer implementations.
   */
  readonly _draftMode?: boolean;
}

// ─── Per-request isolation ────────────────────────────────────────────────────

/**
 * Per-request SSR context. Created fresh for every render call.
 * Never shared between concurrent requests.
 */
export interface SsrRequestContext {
  /**
   * A fresh `QueryClient` for this single request.
   * Discarded after the render completes. Never shared across requests.
   */
  readonly queryClient: QueryClient;
  /** The resolved route match. */
  readonly match: ServerRouteMatchShape;
}

// ─── Renderer config ──────────────────────────────────────────────────────────

/**
 * Configuration for `createReactRenderer()`.
 */
export interface SnapshotSsrConfig {
  /**
   * The `SnapshotInstance` returned by `createSnapshot()`.
   * Optional — used only for auth resolution context when available.
   * Each SSR request creates a fresh, isolated `QueryClient`.
   */
  snapshot?: SnapshotInstance<Record<string, unknown>>;

  /**
   * Resolves the React component to render for a given server route match.
   *
   * The server route file path (e.g., `/app/server/routes/posts/[slug].ts`) maps
   * to the corresponding client React component. This function is the bridge.
   *
   * Dynamic `import()` inside this function is correct and expected.
   *
   * @param match - The resolved server route (has `filePath`, `params`, `url`).
   * @returns The React component constructor to render.
   *
   * @example
   * ```ts
   * resolveComponent: async (match) => {
   *   const rel = match.filePath
   *     .replace(serverRoutesDir + '/', '')
   *     .replace(/\[([^\]]+)\]/g, '$$$1')  // [slug] → $slug
   *     .replace(/\.ts$/, '.tsx')
   *   const module = await import(clientRoutesDir + '/' + rel)
   *   return module.default
   * }
   * ```
   */
  resolveComponent: (
    match: ServerRouteMatchShape,
  ) => Promise<React.ComponentType<Record<string, unknown>>>;

  /**
   * Timeout in milliseconds for server-side rendering.
   *
   * If the React tree does not finish streaming within this window,
   * the render is aborted and the request falls through to the SPA.
   * @default 5000
   */
  renderTimeoutMs?: number;
}

// ─── Consumer-facing server route types ───────────────────────────────────────
// Structural equivalents of bunshot-ssr types, so consumers only import from
// @lastshotlabs/snapshot/ssr and not from both packages.

/**
 * A TanStack Query cache entry to pre-seed during SSR.
 *
 * The `queryKey` must match exactly the key used by the corresponding client-side
 * `useQuery()` hook. On hydration, the client reads this entry from the dehydrated
 * state and skips the network request.
 */
export interface SsrQueryCacheEntry {
  /** Must match the client-side `useQuery` queryKey exactly. */
  readonly queryKey: readonly unknown[];
  /** The data to cache. Must be JSON-serializable. */
  readonly data: unknown;
}

/**
 * Successful result from a server route's `load()` function.
 *
 * Both `data` and `queryCache` must be JSON-serializable — they are embedded
 * in the HTML as dehydrated state for client hydration.
 */
export interface SsrLoadResult {
  /** Arbitrary data passed as `loaderData` prop to the rendered React component. */
  readonly data: Record<string, unknown>;
  /** TanStack Query cache entries to pre-seed. Prevents client-side refetch. */
  readonly queryCache?: ReadonlyArray<SsrQueryCacheEntry>;
}

/**
 * Signal from a server route's `load()` that the client should be redirected.
 *
 * @example
 * ```ts
 * export async function load(ctx: SsrLoadContext) {
 *   if (!await ctx.getUser()) return { redirect: '/login' }
 * }
 * ```
 */
export interface SsrRedirectResult {
  /** The URL to redirect to. May be relative (`/login`) or absolute. */
  readonly redirect: string;
  /**
   * HTTP redirect status code.
   * @default 302
   */
  readonly status?: 301 | 302 | 307 | 308;
}

/**
 * Signal from a server route's `load()` that the resource was not found.
 *
 * bunshot-ssr falls through to the SPA, which renders its own 404 page.
 */
export interface SsrNotFoundResult {
  readonly notFound: true;
}

/**
 * All valid return types from a server route's `load()` function.
 */
export type SsrLoaderReturn =
  | SsrLoadResult
  | SsrRedirectResult
  | SsrNotFoundResult;

/**
 * The context object passed to every server route `load()` and `meta()` function.
 *
 * Provides request data and direct access to the bunshot instance for DB calls
 * without HTTP round-trips.
 *
 * @example
 * ```ts
 * // server/routes/posts/[slug].ts
 * import type { SsrLoadContext, SsrLoaderReturn } from '@lastshotlabs/snapshot/ssr'
 *
 * export async function load(ctx: SsrLoadContext): Promise<SsrLoaderReturn> {
 *   const user = await ctx.getUser()
 *   if (!user) return { redirect: '/login' }
 *   const post = await getPost(ctx.params.slug, ctx.bsCtx)
 *   if (!post) return { notFound: true }
 *   return { data: { post }, queryCache: [{ queryKey: ['post', ctx.params.slug], data: post }] }
 * }
 * ```
 */
export interface SsrLoadContext {
  /** Dynamic route segment values. */
  readonly params: Readonly<Record<string, string>>;
  /** Parsed query string. */
  readonly query: Readonly<Record<string, string>>;
  /** The full request URL. */
  readonly url: URL;
  /** Raw request headers. Read-only. */
  readonly headers: Readonly<Headers>;
  /**
   * Resolve the authenticated user from the request session.
   * Returns `null` when no valid session is present.
   */
  getUser(): Promise<{ id: string; email: string; roles: string[] } | null>;
  /**
   * The raw bunshot context (typed `unknown` to avoid a hard dep on bunshot-core).
   * Cast to `BunshotContext` inside the route file with `import type` from bunshot-core.
   */
  readonly bsCtx: unknown;
  /**
   * Returns the draft mode status for the current request.
   *
   * When `isEnabled` is `true`, the request carries the draft mode cookie.
   * Use this to fetch unpublished/draft content from your CMS instead of
   * the published version. The ISR cache is automatically bypassed for
   * draft requests.
   *
   * Draft mode is enabled via `GET /api/draft/enable?secret=<token>` and
   * disabled via `GET /api/draft/disable`.
   *
   * @returns An object with `isEnabled: boolean`.
   *
   * @example
   * ```ts
   * export async function load(ctx: SsrLoadContext) {
   *   const { isEnabled } = ctx.draftMode();
   *   const post = isEnabled
   *     ? await cms.getDraftPost(ctx.params.slug)
   *     : await cms.getPublishedPost(ctx.params.slug);
   *   return { data: { post } };
   * }
   * ```
   */
  draftMode(): { isEnabled: boolean };
}

// ─── Manifest renderer config ─────────────────────────────────────────────────

/**
 * Server-side resolver for a single named manifest resource.
 *
 * Called instead of an HTTP fetch during SSR preload. Receives the extracted
 * URL params and the full BunshotContext for direct DB/adapter access.
 *
 * @param params - Dynamic URL params extracted from the matched route path.
 * @param bsCtx - The BunshotContext (typed `unknown` — cast inside the resolver).
 * @returns The data to cache under `[resourceKey, params]` queryKey.
 */
export type ManifestPreloadResolver = (
  params: Readonly<Record<string, string>>,
  bsCtx: unknown,
) => Promise<unknown>;

/**
 * Configuration for `createManifestRenderer()`.
 *
 * The manifest is compiled at construction time — route patterns and resource
 * maps are resolved once, not per request.
 */
export interface ManifestSsrConfig {
  /**
   * The raw Snapshot manifest config object.
   * Compiled via `compileManifest()` at construction time.
   */
  manifest: ManifestConfig;
  /**
   * Server-side resolvers for named resources declared in `manifest.resources`.
   *
   * Map resource key → async function. When provided, the resolver is called
   * directly during SSR preload (no HTTP). When omitted for a key, that resource
   * is skipped during SSR and fetched client-side after hydration.
   *
   * @example
   * ```ts
   * preloadResolvers: {
   *   listPosts: async (params, bsCtx) => {
   *     const { threadAdapter } = (bsCtx as BunshotContext)
   *       .pluginState.get('bunshot-community');
   *     return threadAdapter.list({ containerId: params.containerId });
   *   },
   * }
   * ```
   */
  preloadResolvers?: Record<string, ManifestPreloadResolver>;
  /**
   * Resolve the authenticated user from request headers for guard checks.
   *
   * Called when a route declares `guard.authenticated: true` or `guard.roles`.
   * Returns `null` when no valid session exists.
   *
   * When omitted, all `guard.authenticated: true` routes redirect to
   * `guard.redirectTo` (default: `/login`).
   */
  getUser?: (
    headers: Headers,
  ) => Promise<{ id: string; roles: string[] } | null>;
}
