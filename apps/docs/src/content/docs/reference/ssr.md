---
title: SSR Reference
description: Generated from src/ssr/index.ts and the declarations it re-exports.
draft: false
---

Generated from `src/ssr/index.ts`.

| Export | Kind | Source | Description |
|---|---|---|---|
| `__callServerAction__` | function | `src/ssr/action-client.ts` | Called by server action stubs in the client bundle. Routes the call to `POST /_snapshot/action` on the server and returns the action's result. Handles three response shapes from the server: - `{ result }` — returned as-is to the caller - `{ error }` — throws `Error(message)` - `{ redirect }` — navigates via `window.location.href` When the first argument is a `FormData` instance the request is sent as a raw `FormData` body (for `<form action={serverFn}>` usage). Otherwise the call is serialised as JSON. |
| `buildComponentId` | function | `src/ssr/rsc.ts` | Builds the component ID string used as a key in {@link RscManifest.components}. Format: `"{relativePath}#{exportName}"` |
| `createManifestRenderer` | function | `src/ssr/manifest-renderer.ts` | Create a manifest-based SSR renderer.  Resolves routes from the Snapshot manifest config rather than from server route files. Manifest routes declare their data requirements via the `preload` field — keys into `manifest.resources`. Provide `preloadResolvers` to call bunshot adapters directly instead of making HTTP round-trips.  **Route resolution:** The middleware calls `resolve()` after the file-based resolver returns `null`. Both `createReactRenderer` and `createManifestRenderer` can be used together in a composite renderer — file routes take precedence.  **Manifest compilation:** The manifest is compiled and route patterns are built at construction time — not per request.  **Manifest-first:** This renderer works entirely from the manifest JSON config. No TypeScript is required at the consumer to enable SSR for manifest routes. |
| `createPprCache` | function | `src/ssr/ppr-cache.ts` | Create an in-memory PPR shell cache. At build time, shells are pre-computed for all PPR-enabled routes and stored here via `set()`. At request time, `get()` returns the shell instantly so the HTTP response can begin with the pre-computed HTML without any rendering overhead, while dynamic Suspense slots are streamed in behind it. **Factory, not singleton.** Call `createPprCache()` once at application startup and pass the instance to both `prerenderPprShells()` (build step) and `renderPprPage()` (request handler). Do not share instances across processes. |
| `createReactRenderer` | function | `src/ssr/renderer.ts` | Create the official React renderer for `bunshot-ssr`.  Returns an object that satisfies `BunshotSsrRenderer` from `@lastshotlabs/bunshot-ssr` by structural typing. The consumer app imports both packages and wires them together — no forced dependency between repos.  **File-based routing:** `createReactRenderer` relies on bunshot-ssr's built-in file resolver to match URLs to route files. The `resolve()` method returns `null` — the file resolver is authoritative. `render()` is called only when a match was found.  **Per-request isolation:** Every call to `render()` creates a fresh `QueryClient`. The global `snapshot.queryClient` singleton is never used during SSR.  **Config freeze:** The config object is frozen at construction time. |
| `extractPprShell` | function | `src/ssr/ppr.ts` | Render only the static shell of a React tree. Dynamic Suspense boundaries are replaced with their fallback content because `renderToString` emits Suspense fallback markup immediately for any boundary whose children suspend, then terminates without awaiting the async subtree. Wrapping the tree in `StaticShellWrapper` ensures the output contains only the static parts and pre-populated fallback markup. Used at build time to pre-render the static portions of PPR routes. The resulting `shellHtml` is stored in the PPR cache and sent immediately on every subsequent request before dynamic content is streamed. |
| `hasUseClientDirective` | function | `src/ssr/rsc.ts` | Returns `true` if the source file contains a `'use client'` or `"use client"` directive as its first meaningful content (before any non-whitespace, non-comment code). The check is intentionally loose — it matches the directive anywhere in the leading whitespace/comment region of the file, consistent with how bundlers like webpack and Parcel handle it. |
| `hasUseServerDirective` | function | `src/ssr/rsc.ts` | Returns `true` if the source file contains a `'use server'` or `"use server"` directive as its first meaningful content. |
| `ManifestPreloadResolver` | typealias | `src/ssr/types.ts` | Server-side resolver for a single named manifest resource. Called instead of an HTTP fetch during SSR preload. Receives the extracted URL params and the full BunshotContext for direct DB/adapter access. |
| `ManifestSsrConfig` | interface | `src/ssr/types.ts` | Configuration for `createManifestRenderer()`. The manifest is compiled at construction time — route patterns and resource maps are resolved once, not per request. |
| `PprCache` | interface | `src/ssr/ppr-cache.ts` | Interface for the PPR static shell cache. Implementations are free to use any backing store; the default produced by `createPprCache()` is in-process memory (suitable for single-instance servers). For multi-instance deployments, provide a Redis-backed implementation. |
| `PprCacheEntry` | interface | `src/ssr/ppr-cache.ts` | A single entry in the PPR shell cache. Stored by `PprCache.set()` after build-time shell extraction. Retrieved by `PprCache.get()` at request time to serve the shell immediately. |
| `PprShell` | interface | `src/ssr/ppr.ts` | The result of a build-time static shell extraction for a PPR route. |
| `renderPage` | function | `src/ssr/render.ts` | Render a React element tree to a streaming HTML `Response`.  Creates per-request `QueryClient` and `HydrationBoundary` wrapping the element, dehydrates the cache into the HTML, and streams the response.  **Per-request isolation:** The `context.queryClient` is created fresh by the caller for each request. This function wraps it with providers and then allows it to be garbage-collected. Never pass a shared or cached `QueryClient`.  **Streaming:** Uses React 19's `renderToReadableStream`. The `<head>` preamble is written synchronously before the React stream begins. Suspense boundaries stream in as their promises resolve.  **Abort on timeout:** An `AbortController` is created per call. If the render does not complete within `timeoutMs`, `controller.abort()` is called and the stream rejects. The caller (bunshot-ssr middleware) catches this and falls through to the SPA.  **ISR opt-out:** The entire render executes within a `withRequestStore()` async context (from `./cache`). If any loader calls `unstable_noStore()` during the render, `getNoStore()` returns `true` after the render completes and `shell._isr.noStore` is set to signal the ISR middleware to skip the cache write.  **RSC mode:** When `rscOptions` is provided, the function performs a two-pass React Server Components render instead of the standard single-pass render: 1. The React tree is rendered to the RSC flight format via    `react-server-dom-webpack/server`. 2. The RSC flight stream is piped through `react-dom/server` to produce HTML. When `rscOptions` is omitted, the existing single-pass render is used unchanged. |
| `RenderPprOptions` | interface | `src/ssr/render.ts` | Options for `renderPprPage()`. |
| `renderPprPage` | function | `src/ssr/render.ts` | Render a PPR (Partial Prerendering) route.  When a pre-computed shell is available in the PPR cache, this function: 1. Immediately sends the shell HTML (including Suspense fallbacks) as the    first chunk of a streaming `Response` — this achieves instant TTFB. 2. Pipes `renderToReadableStream` output after the shell. React's streaming    renderer emits inline `<script>` chunks that replace each Suspense    fallback with the resolved dynamic content as promises settle.  When no shell is cached, the function returns a standard streaming SSR response via `renderPage()` as a transparent fallback so the route still works correctly before build-time pre-rendering has run.  **Streaming contract:** - Response uses `Transfer-Encoding: chunked` and `Content-Type: text/html`. - The shell chunk is written before any async work begins. - React's hydration `<script>` tags keep the client in sync with the server. |
| `RscManifest` | interface | `src/ssr/rsc.ts` | Maps client component IDs to their output chunk URLs. Generated by the `snapshotSsr()` Vite plugin as `rsc-manifest.json` in the client output directory. The manifest is consumed at runtime by `renderPage()` to resolve client references during the RSC two-pass render. **Key format:** `"{relativePath}#{exportName}"` - `relativePath` — file path relative to the Vite project root, using forward slashes.   Example: `"src/components/Button.tsx"` - `exportName` — the name of the export. Default exports use `"default"`. **Value format:** The hashed chunk URL as it appears in the Vite client manifest. Example: `"assets/Button-Bx2kLm9a.js"` |
| `RscOptions` | interface | `src/ssr/rsc.ts` | Options for RSC-enabled rendering passed to `renderPage()`. When this object is provided, `renderPage()` performs a two-pass RSC render: 1. The React tree is rendered to the RSC flight format using    `react-server-dom-webpack/server`. 2. The RSC flight stream is piped through React DOM server to produce HTML. When omitted, `renderPage()` falls back to the standard single-pass `react-dom/server` render (no RSC). |
| `safeJsonStringify` | function | `src/ssr/state.ts` | JSON-stringify a value with XSS-safe escaping. Escapes `</` as `<\/` and `<!--` as `<\!--` in the JSON output. Both are valid JSON and both prevent the HTML parser from misinterpreting the script content. |
| `ServerRouteMatchShape` | interface | `src/ssr/types.ts` | Structural equivalent of `SsrRouteMatch` from `@lastshotlabs/bunshot-ssr`. Defined here without importing from bunshot-ssr to avoid cross-repo coupling. TypeScript structural typing ensures compatibility at the consumer's compile time. |
| `SnapshotSsrConfig` | interface | `src/ssr/types.ts` | Configuration for `createReactRenderer()`. |
| `SsrForbiddenResult` | interface | `src/ssr/types.ts` | Signal from a server route's `load()` that the user lacks permission. `bunshot-ssr` responds with `403 Forbidden`. Co-locate a `forbidden.ts` convention file to render a custom UI instead of a plain-text fallback. |
| `SsrLoadContext` | interface | `src/ssr/types.ts` | The context object passed to every server route `load()` and `meta()` function. Provides request data and direct access to the bunshot instance for DB calls without HTTP round-trips. |
| `SsrLoaderReturn` | typealias | `src/ssr/types.ts` | All valid return types from a server route's `load()` function. |
| `SsrLoadResult` | interface | `src/ssr/types.ts` | Successful result from a server route's `load()` function. Both `data` and `queryCache` must be JSON-serializable — they are embedded in the HTML as dehydrated state for client hydration. |
| `SsrMeta` | interface | `src/ssr/head.ts` | SsrMeta shape — structural equivalent of `SsrMeta` from `@lastshotlabs/bunshot-ssr`. Defined here so consumers can import from `@lastshotlabs/snapshot/ssr` only, without needing to install bunshot-ssr as a dependency. |
| `SsrNotFoundResult` | interface | `src/ssr/types.ts` | Signal from a server route's `load()` that the resource was not found. bunshot-ssr falls through to the SPA, which renders its own 404 page. |
| `SsrQueryCacheEntry` | interface | `src/ssr/types.ts` | A TanStack Query cache entry to pre-seed during SSR. The `queryKey` must match exactly the key used by the corresponding client-side `useQuery()` hook. On hydration, the client reads this entry from the dehydrated state and skips the network request. |
| `SsrRedirectResult` | interface | `src/ssr/types.ts` | Signal from a server route's `load()` that the client should be redirected. |
| `SsrRequestContext` | interface | `src/ssr/types.ts` | Per-request SSR context. Created fresh for every render call. Never shared between concurrent requests. |
| `SsrShellShape` | interface | `src/ssr/types.ts` | Structural equivalent of `SsrShell` from `@lastshotlabs/bunshot-ssr`. Contains the HTML tag strings injected into the document `<head>` by bunshot-ssr. Also carries the `_isr` sink which the renderer populates after calling `load()`. |
| `SsrUnauthorizedResult` | interface | `src/ssr/types.ts` | Signal from a server route's `load()` that the user is not authenticated. `bunshot-ssr` responds with `401 Unauthorized`. Co-locate an `unauthorized.ts` convention file to render a custom UI instead of a plain-text fallback. |
| `StaticShellWrapper` | function | `src/ssr/ppr.ts` | Wrap a React element so that all Suspense boundaries render only their fallbacks (never await the actual children). Used for static shell extraction. Place this as the outermost wrapper during build-time shell extraction. At request time it is not used — the real React tree renders normally. |
| `unstable_noStore` | function | `src/ssr/cache.ts` | Opt the current request out of ISR caching. Call this inside a loader when the response must never be stored in the ISR cache — for example, when the page contains personalised or real-time data. The `revalidate` value returned by `load()` is ignored for this request; the response is served fresh and never written to the cache. Must be called within the async context of `renderPage()` (i.e., inside a loader invoked during SSR). Calling it outside that context is a no-op. |
| `usePrefetchRoute` | function | `src/ssr/prefetch.ts` | Returns a callback that prefetches the JS chunks and CSS files for a given URL path by injecting `<link rel="prefetch">` tags into `document.head`. The prefetch manifest (`/prefetch-manifest.json`) is loaded once per page load and cached. Duplicate prefetch injections for the same URL are suppressed. Safe to call during SSR — all `document` access is guarded. The returned function is a no-op on the server. |

## Details

#### `__callServerAction__(action: string, module: string, args: unknown[]) => Promise<unknown>`

Called by server action stubs in the client bundle.

Routes the call to `POST /_snapshot/action` on the server and returns the
action's result. Handles three response shapes from the server:

- `{ result }` — returned as-is to the caller
- `{ error }` — throws `Error(message)`
- `{ redirect }` — navigates via `window.location.href`

When the first argument is a `FormData` instance the request is sent as a
raw `FormData` body (for `<form action={serverFn}>` usage). Otherwise the
call is serialised as JSON.

**Parameters:**

| Name | Description |
|------|-------------|
| `action` | The exported function name from the action module. |
| `module` | The module name (relative to the server actions directory). |
| `args` | Arguments to forward to the server function. |

**Returns:** The value returned by the server function.

**Example:**

```ts
// Generated client stub — do not write this manually.
import { __callServerAction__ } from '@lastshotlabs/snapshot/ssr';
export async function createPost(...args: unknown[]) {
  return __callServerAction__('createPost', 'posts', args);
}
```

---

#### `buildComponentId(relativePath: string, exportName: string) => string`

Builds the component ID string used as a key in {@link RscManifest.components}.

Format: `"{relativePath}#{exportName}"`

**Parameters:**

| Name | Description |
|------|-------------|
| `relativePath` | File path relative to the Vite project root, forward-slash separated. Example: `"src/components/Button.tsx"`. |
| `exportName` | Export name. Use `"default"` for default exports. |

**Example:**

```ts
buildComponentId('src/components/Button.tsx', 'default');
// → 'src/components/Button.tsx#default'

buildComponentId('src/components/Button.tsx', 'Button');
// → 'src/components/Button.tsx#Button'
```

---

#### `createManifestRenderer(rawConfig: ManifestSsrConfig) => { resolve(url: URL, bsCtx: unknown): Promise<SsrRouteMatchShape | null>; render(match: SsrRouteMatchShape, shell: SsrShellShape, bsCtx: unknown): Promise<...>; render...`

Create a manifest-based SSR renderer.

Resolves routes from the Snapshot manifest config rather than from server
route files. Manifest routes declare their data requirements via the
`preload` field — keys into `manifest.resources`. Provide `preloadResolvers`
to call bunshot adapters directly instead of making HTTP round-trips.

**Route resolution:** The middleware calls `resolve()` after the file-based
resolver returns `null`. Both `createReactRenderer` and `createManifestRenderer`
can be used together in a composite renderer — file routes take precedence.

**Manifest compilation:** The manifest is compiled and route patterns are built
at construction time — not per request.

**Manifest-first:** This renderer works entirely from the manifest JSON config.
No TypeScript is required at the consumer to enable SSR for manifest routes.

**Parameters:**

| Name | Description |
|------|-------------|
| `rawConfig` | Renderer configuration. Manifest is compiled and route patterns are built at construction time — not per request. |

**Example:**

```ts
import { createSsrPlugin } from '@lastshotlabs/bunshot-ssr'
import { createManifestRenderer } from '@lastshotlabs/snapshot/ssr'
import myManifest from './snapshot.manifest.json'

createSsrPlugin({
  renderer: createManifestRenderer({
    manifest: myManifest,
    preloadResolvers: {
      listPosts: async (params, bsCtx) => {
        const { threadAdapter } = (bsCtx as BunshotContext)
          .pluginState.get('bunshot-community');
        return threadAdapter.list({ containerId: params.containerId });
      },
    },
    getUser: async (headers) => resolveSessionFromHeaders(headers),
  }),
  serverRoutesDir: import.meta.dir + '/server/routes',
  assetsManifest: import.meta.dir + '/dist/.vite/manifest.json',
})
```

---

#### `createPprCache() => PprCache`

Create an in-memory PPR shell cache.

At build time, shells are pre-computed for all PPR-enabled routes and stored
here via `set()`. At request time, `get()` returns the shell instantly so
the HTTP response can begin with the pre-computed HTML without any rendering
overhead, while dynamic Suspense slots are streamed in behind it.

**Factory, not singleton.** Call `createPprCache()` once at application startup
and pass the instance to both `prerenderPprShells()` (build step) and
`renderPprPage()` (request handler). Do not share instances across processes.

**Returns:** A frozen `PprCache` backed by a plain `Map`.

---

#### `createReactRenderer(config: SnapshotSsrConfig) => { resolve(url: URL, bsCtx: unknown): Promise<ServerRouteMatchShape | null>; render(match: ServerRouteMatchShape, shell: SsrShellShape, bsCtx: unknown): Promise<...>; ren...`

Create the official React renderer for `bunshot-ssr`.

Returns an object that satisfies `BunshotSsrRenderer` from
`@lastshotlabs/bunshot-ssr` by structural typing. The consumer app imports
both packages and wires them together — no forced dependency between repos.

**File-based routing:** `createReactRenderer` relies on bunshot-ssr's built-in
file resolver to match URLs to route files. The `resolve()` method returns
`null` — the file resolver is authoritative. `render()` is called only when
a match was found.

**Per-request isolation:** Every call to `render()` creates a fresh
`QueryClient`. The global `snapshot.queryClient` singleton is never used
during SSR.

**Config freeze:** The config object is frozen at construction time.

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | Renderer configuration. `resolveComponent` is required. |

**Returns:** An object with `resolve()` and `render()` satisfying `BunshotSsrRenderer`.

**Example:**

```ts
import { createSsrPlugin } from '@lastshotlabs/bunshot-ssr'
import { createReactRenderer } from '@lastshotlabs/snapshot/ssr'

createSsrPlugin({
  renderer: createReactRenderer({
    resolveComponent: async (match) => {
      const mod = await import(toClientPath(match.filePath))
      return mod.default
    },
  }),
  serverRoutesDir: import.meta.dir + '/server/routes',
  assetsManifest: import.meta.dir + '/dist/.vite/manifest.json',
})
```

---

#### `extractPprShell(element: ReactElement<unknown, string | JSXElementConstructor<any>>) => Promise<PprShell>`

Render only the static shell of a React tree.

Dynamic Suspense boundaries are replaced with their fallback content because
`renderToString` emits Suspense fallback markup immediately for any boundary
whose children suspend, then terminates without awaiting the async subtree.
Wrapping the tree in `StaticShellWrapper` ensures the output contains only
the static parts and pre-populated fallback markup.

Used at build time to pre-render the static portions of PPR routes.
The resulting `shellHtml` is stored in the PPR cache and sent immediately
on every subsequent request before dynamic content is streamed.

**Parameters:**

| Name | Description |
|------|-------------|
| `element` | The React element representing the full page tree. |

**Returns:** A `PprShell` containing the extracted static HTML and a success flag.

---

#### `hasUseClientDirective(code: string) => boolean`

Returns `true` if the source file contains a `'use client'` or `"use client"`
directive as its first meaningful content (before any non-whitespace,
non-comment code).

The check is intentionally loose — it matches the directive anywhere in the
leading whitespace/comment region of the file, consistent with how bundlers
like webpack and Parcel handle it.

**Parameters:**

| Name | Description |
|------|-------------|
| `code` | Raw source text of the file. |

---

#### `hasUseServerDirective(code: string) => boolean`

Returns `true` if the source file contains a `'use server'` or `"use server"`
directive as its first meaningful content.

**Parameters:**

| Name | Description |
|------|-------------|
| `code` | Raw source text of the file. |

---

#### `ManifestPreloadResolver` *(typealias)*

Server-side resolver for a single named manifest resource.

Called instead of an HTTP fetch during SSR preload. Receives the extracted
URL params and the full BunshotContext for direct DB/adapter access.

**Parameters:**

| Name | Description |
|------|-------------|
| `params` | Dynamic URL params extracted from the matched route path. |
| `bsCtx` | The BunshotContext (typed `unknown` — cast inside the resolver). |

**Returns:** The data to cache under `[resourceKey, params]` queryKey.

---

#### `renderPage(element: ReactElement<unknown, string | JSXElementConstructor<any>>, context: SsrRequestContext, shell: SsrShellShape, timeoutMs?: number, rscOptions?: RscOptions | undefined, responseInit?: { ...; }...`

Render a React element tree to a streaming HTML `Response`.

Creates per-request `QueryClient` and `HydrationBoundary` wrapping the
element, dehydrates the cache into the HTML, and streams the response.

**Per-request isolation:** The `context.queryClient` is created fresh by the
caller for each request. This function wraps it with providers and then allows
it to be garbage-collected. Never pass a shared or cached `QueryClient`.

**Streaming:** Uses React 19's `renderToReadableStream`. The `<head>` preamble
is written synchronously before the React stream begins. Suspense boundaries
stream in as their promises resolve.

**Abort on timeout:** An `AbortController` is created per call. If the render
does not complete within `timeoutMs`, `controller.abort()` is called and the
stream rejects. The caller (bunshot-ssr middleware) catches this and falls
through to the SPA.

**ISR opt-out:** The entire render executes within a `withRequestStore()` async
context (from `./cache`). If any loader calls `unstable_noStore()` during the
render, `getNoStore()` returns `true` after the render completes and
`shell._isr.noStore` is set to signal the ISR middleware to skip the cache write.

**RSC mode:** When `rscOptions` is provided, the function performs a two-pass
React Server Components render instead of the standard single-pass render:
1. The React tree is rendered to the RSC flight format via
   `react-server-dom-webpack/server`.
2. The RSC flight stream is piped through `react-dom/server` to produce HTML.
When `rscOptions` is omitted, the existing single-pass render is used unchanged.

**Parameters:**

| Name | Description |
|------|-------------|
| `element` | The React element to render (already constructed with props). |
| `context` | Per-request context containing a fresh `QueryClient`. |
| `shell` | Asset and head tags from bunshot-ssr. `headTags` should already be populated by the renderer before calling this function. |
| `timeoutMs` | Abort timeout in milliseconds. Default: 5000. |
| `rscOptions` | Optional RSC manifest. When provided, enables RSC two-pass rendering. When omitted, standard SSR is used (no RSC). |
| `responseInit` | Optional response overrides (status/headers). |

**Returns:** A streaming `Response` with `Content-Type: text/html; charset=utf-8`.

---

#### `renderPprPage(options: RenderPprOptions) => Promise<Response>`

Render a PPR (Partial Prerendering) route.

When a pre-computed shell is available in the PPR cache, this function:
1. Immediately sends the shell HTML (including Suspense fallbacks) as the
   first chunk of a streaming `Response` — this achieves instant TTFB.
2. Pipes `renderToReadableStream` output after the shell. React's streaming
   renderer emits inline `<script>` chunks that replace each Suspense
   fallback with the resolved dynamic content as promises settle.

When no shell is cached, the function returns a standard streaming SSR
response via `renderPage()` as a transparent fallback so the route still
works correctly before build-time pre-rendering has run.

**Streaming contract:**
- Response uses `Transfer-Encoding: chunked` and `Content-Type: text/html`.
- The shell chunk is written before any async work begins.
- React's hydration `<script>` tags keep the client in sync with the server.

**Parameters:**

| Name | Description |
|------|-------------|
| `options` | PPR render options including the element tree, shell, head, and bootstrap script URLs. |

**Returns:** A streaming `Response` with `Content-Type: text/html; charset=utf-8`.

---

#### `RscManifest` *(interface)*

Maps client component IDs to their output chunk URLs.

Generated by the `snapshotSsr()` Vite plugin as `rsc-manifest.json` in the
client output directory. The manifest is consumed at runtime by `renderPage()`
to resolve client references during the RSC two-pass render.

**Key format:** `"{relativePath}#{exportName}"`
- `relativePath` — file path relative to the Vite project root, using forward slashes.
  Example: `"src/components/Button.tsx"`
- `exportName` — the name of the export. Default exports use `"default"`.

**Value format:** The hashed chunk URL as it appears in the Vite client manifest.
Example: `"assets/Button-Bx2kLm9a.js"`

**Example:**

```json
{
  "components": {
    "src/components/Button.tsx#default": "assets/Button-Bx2kLm9a.js",
    "src/components/PostCard.tsx#PostCard": "assets/PostCard-Lm9aBx2k.js"
  }
}
```

---

#### `safeJsonStringify(value: unknown) => string`

JSON-stringify a value with XSS-safe escaping.

Escapes `</` as `<\/` and `<!--` as `<\!--` in the JSON output.
Both are valid JSON and both prevent the HTML parser from misinterpreting
the script content.

**Parameters:**

| Name | Description |
|------|-------------|
| `value` | Any JSON-serializable value. |

**Returns:** A JSON string safe for embedding in a `<script>` tag.

---

#### `SsrForbiddenResult` *(interface)*

Signal from a server route's `load()` that the user lacks permission.

`bunshot-ssr` responds with `403 Forbidden`. Co-locate a `forbidden.ts`
convention file to render a custom UI instead of a plain-text fallback.

**Example:**

```ts
export async function load(ctx: SsrLoadContext) {
  const user = await ctx.getUser()
  if (!user) return { unauthorized: true }
  if (!user.roles.includes('admin')) return { forbidden: true }
  return { data: { ... } }
}
```

---

#### `SsrLoadContext` *(interface)*

The context object passed to every server route `load()` and `meta()` function.

Provides request data and direct access to the bunshot instance for DB calls
without HTTP round-trips.

**Example:**

```ts
// server/routes/posts/[slug].ts
import type { SsrLoadContext, SsrLoaderReturn } from '@lastshotlabs/snapshot/ssr'

export async function load(ctx: SsrLoadContext): Promise<SsrLoaderReturn> {
  const user = await ctx.getUser()
  if (!user) return { redirect: '/login' }
  const post = await getPost(ctx.params.slug, ctx.bsCtx)
  if (!post) return { notFound: true }
  return { data: { post }, queryCache: [{ queryKey: ['post', ctx.params.slug], data: post }] }
}
```

---

#### `SsrRedirectResult` *(interface)*

Signal from a server route's `load()` that the client should be redirected.

**Example:**

```ts
export async function load(ctx: SsrLoadContext) {
  if (!await ctx.getUser()) return { redirect: '/login' }
}
```

---

#### `SsrUnauthorizedResult` *(interface)*

Signal from a server route's `load()` that the user is not authenticated.

`bunshot-ssr` responds with `401 Unauthorized`. Co-locate an `unauthorized.ts`
convention file to render a custom UI instead of a plain-text fallback.

**Example:**

```ts
export async function load(ctx: SsrLoadContext) {
  const user = await ctx.getUser()
  if (!user) return { unauthorized: true }
  return { data: { ... } }
}
```

---

#### `StaticShellWrapper({ children, }: { children?: ReactNode; }) => ReactElement<unknown, string | JSXElementConstructor<any>>`

Wrap a React element so that all Suspense boundaries render only their
fallbacks (never await the actual children). Used for static shell extraction.

Place this as the outermost wrapper during build-time shell extraction.
At request time it is not used — the real React tree renders normally.

**Parameters:**

| Name | Description |
|------|-------------|
| `props.children` | - The React tree to wrap. |

**Returns:** A React element whose Suspense boundaries resolve to their fallbacks.

---

#### `unstable_noStore() => void`

Opt the current request out of ISR caching.

Call this inside a loader when the response must never be stored in the ISR
cache — for example, when the page contains personalised or real-time data.
The `revalidate` value returned by `load()` is ignored for this request; the
response is served fresh and never written to the cache.

Must be called within the async context of `renderPage()` (i.e., inside a
loader invoked during SSR). Calling it outside that context is a no-op.

**Example:**

```ts
import { unstable_noStore } from '@lastshotlabs/snapshot/ssr';

export async function load(ctx: SsrLoadContext) {
  unstable_noStore(); // this response is never cached
  const feed = await getLiveActivityFeed(ctx.bsCtx);
  return { data: { feed } };
}
```

---

#### `usePrefetchRoute() => (path: string) => void`

Returns a callback that prefetches the JS chunks and CSS files for a given
URL path by injecting `<link rel="prefetch">` tags into `document.head`.

The prefetch manifest (`/prefetch-manifest.json`) is loaded once per page
load and cached. Duplicate prefetch injections for the same URL are suppressed.

Safe to call during SSR — all `document` access is guarded. The returned
function is a no-op on the server.

**Returns:** A stable callback `(path: string) => void`. Call it with the URL path
to prefetch (e.g. `"/posts/my-slug"`).

**Example:**

```tsx
function MyLink() {
  const prefetch = usePrefetchRoute();
  return (
    <a href="/posts" onMouseEnter={() => prefetch('/posts')}>
      Posts
    </a>
  );
}
```

---
