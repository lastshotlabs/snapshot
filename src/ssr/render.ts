// src/ssr/render.ts
import {
  HydrationBoundary,
  QueryClientProvider,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { getNoStore, withRequestStore } from "./cache";
import type { PprCacheEntry } from "./ppr-cache";
import type { RscOptions } from "./rsc";
import { serializeQueryState } from "./state";
import type { SsrRequestContext, SsrShellShape } from "./types";

// ─── HTML document template ───────────────────────────────────────────────────

/**
 * Build the HTML preamble (everything before the React stream).
 *
 * Injection order inside `<head>`:
 * 1. Charset and viewport (always first)
 * 2. `shell.headTags` — title, meta, OG, Twitter, JSON-LD
 * 3. `shell.assetTags` — hashed `<link>` and `<script>` from Vite manifest
 * 4. Dehydrated state — inline `<script>` for QueryClient hydration
 *
 * @internal
 */
function buildPreamble(shell: SsrShellShape, dehydratedState: string): string {
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    shell.headTags,
    shell.assetTags,
    dehydratedState,
    "</head>",
    "<body>",
    '<div id="root">',
  ]
    .filter((line) => line !== "")
    .join("\n");
}

const POSTAMBLE = "\n</div>\n</body>\n</html>";

// ─── Core render function ─────────────────────────────────────────────────────

/**
 * Render a React element tree to a streaming HTML `Response`.
 *
 * Creates per-request `QueryClient` and `HydrationBoundary` wrapping the
 * element, dehydrates the cache into the HTML, and streams the response.
 *
 * **Per-request isolation:** The `context.queryClient` is created fresh by the
 * caller for each request. This function wraps it with providers and then allows
 * it to be garbage-collected. Never pass a shared or cached `QueryClient`.
 *
 * **Streaming:** Uses React 19's `renderToReadableStream`. The `<head>` preamble
 * is written synchronously before the React stream begins. Suspense boundaries
 * stream in as their promises resolve.
 *
 * **Abort on timeout:** An `AbortController` is created per call. If the render
 * does not complete within `timeoutMs`, `controller.abort()` is called and the
 * stream rejects. The caller (bunshot-ssr middleware) catches this and falls
 * through to the SPA.
 *
 * **ISR opt-out:** The entire render executes within a `withRequestStore()` async
 * context (from `./cache`). If any loader calls `unstable_noStore()` during the
 * render, `getNoStore()` returns `true` after the render completes and
 * `shell._isr.noStore` is set to signal the ISR middleware to skip the cache write.
 *
 * **RSC mode:** When `rscOptions` is provided, the function performs a two-pass
 * React Server Components render instead of the standard single-pass render:
 * 1. The React tree is rendered to the RSC flight format via
 *    `react-server-dom-webpack/server`.
 * 2. The RSC flight stream is piped through `react-dom/server` to produce HTML.
 * When `rscOptions` is omitted, the existing single-pass render is used unchanged.
 *
 * @param element - The React element to render (already constructed with props).
 * @param context - Per-request context containing a fresh `QueryClient`.
 * @param shell - Asset and head tags from bunshot-ssr. `headTags` should already
 *   be populated by the renderer before calling this function.
 * @param timeoutMs - Abort timeout in milliseconds. Default: 5000.
 * @param rscOptions - Optional RSC manifest. When provided, enables RSC two-pass
 *   rendering. When omitted, standard SSR is used (no RSC).
 * @returns A streaming `Response` with `Content-Type: text/html; charset=utf-8`.
 *
 * @internal — called by `createReactRenderer` and `createManifestRenderer`.
 */
export function renderPage(
  element: React.ReactElement,
  context: SsrRequestContext,
  shell: SsrShellShape,
  timeoutMs = 5000,
  rscOptions?: RscOptions,
): Promise<Response> {
  return withRequestStore(async () => {
    const { queryClient } = context;

    // Serialize dehydrated QueryClient cache for client hydration
    const dehydratedState = serializeQueryState(queryClient, shell.nonce);

    // Build preamble (everything before the React stream)
    const preamble = buildPreamble(shell, dehydratedState);

    // Wrap the element with providers
    const wrappedElement = React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        HydrationBoundary,
        { state: dehydrate(queryClient) },
        element,
      ),
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let stream: ReadableStream<Uint8Array>;
    try {
      if (rscOptions) {
        // ── RSC two-pass render ──────────────────────────────────────────────
        // Pass 1: Render the React tree to the RSC flight format.
        //   `react-server-dom-webpack/server` is an optional peer dep; we import
        //   it dynamically to avoid bundling it when RSC is not in use.
        //
        // Pass 2: Pipe the RSC flight stream through React DOM's server renderer
        //   to produce an HTML response the browser can display immediately.
        //
        // The `components` map from the RSC manifest resolves client references
        // (files marked with 'use client') to their browser chunk URLs so the
        // server flight encoder can embed the correct asset URLs in the payload.
        //
        // NOTE: The exact `react-server-dom-webpack` API shape depends on the
        // installed version (>=18.3). We use `as unknown as T` at the import
        // boundary per Rule 5 — the dep is optional and not in devDependencies.
        type RsdwServer = {
          renderToReadableStream: (
            element: React.ReactElement,
            clientManifest: Readonly<Record<string, string>>,
            options?: { signal?: AbortSignal; onError?: (err: unknown) => void },
          ) => ReadableStream<Uint8Array>;
        };

        const rsdwServer = (await import(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — optional peer dep, not in devDependencies
          'react-server-dom-webpack/server'
        )) as unknown as RsdwServer;

        // Pass 1: RSC flight stream
        const rscStream = rsdwServer.renderToReadableStream(
          wrappedElement,
          rscOptions.manifest.components,
          {
            signal: controller.signal,
            onError(error: unknown) {
              console.error('[snapshot-ssr] RSC flight render error:', error);
            },
          },
        );

        // Pass 2: HTML stream from RSC flight payload.
        // We pass the RSC stream as the bootstrap data for the client reference
        // resolver so React DOM can emit the full HTML with embedded RSC payload.
        //
        // The stream produced here is a standard ReadableStream<Uint8Array> that
        // can be concatenated with the preamble and postamble below.
        type RsdwClient = {
          createFromReadableStream: (
            stream: ReadableStream<Uint8Array>,
            options?: { serverConsumerManifest?: Readonly<Record<string, string>> },
          ) => Promise<React.ReactElement>;
        };

        const rsdwClient = (await import(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — optional peer dep, not in devDependencies
          'react-server-dom-webpack/client'
        )) as unknown as RsdwClient;

        const reconstructedElement = await rsdwClient.createFromReadableStream(
          rscStream,
          { serverConsumerManifest: rscOptions.manifest.components },
        );

        stream = await renderToReadableStream(reconstructedElement, {
          signal: controller.signal,
          onError(error: unknown) {
            console.error('[snapshot-ssr] RSC HTML render error:', error);
          },
        });
      } else {
        // ── Standard single-pass SSR ─────────────────────────────────────────
        stream = await renderToReadableStream(wrappedElement, {
          signal: controller.signal,
          onError(error: unknown) {
            console.error("[snapshot-ssr] renderToReadableStream error:", error);
          },
        });
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // After the render (and therefore after any loaders have run), check whether
    // unstable_noStore() was called. If so, signal the ISR middleware to skip the
    // cache write by setting noStore on the ISR sink. The _isr object is mutable
    // by contract — the middleware creates it and the renderer writes to it.
    if (shell._isr && getNoStore()) {
      shell._isr.noStore = true;
    }

    const encoder = new TextEncoder();
    const preambleBytes = encoder.encode(preamble);
    const postambleBytes = encoder.encode(POSTAMBLE);

    const body = buildConcatenatedStream(preambleBytes, stream, postambleBytes);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  });
}

/**
 * Concatenate three parts into a single `ReadableStream`:
 * preamble bytes → React stream → postamble bytes.
 *
 * @internal
 */
function buildConcatenatedStream(
  preamble: Uint8Array,
  reactStream: ReadableStream<Uint8Array>,
  postamble: Uint8Array,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(preamble);

        const reader = reactStream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }

        controller.enqueue(postamble);
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

// ─── PPR streaming renderer ───────────────────────────────────────────────────

/**
 * Options for `renderPprPage()`.
 */
export interface RenderPprOptions {
  /**
   * The full React element tree for the page, including all providers and
   * Suspense boundaries. Used to generate the dynamic update scripts that
   * fill Suspense holes after the shell has been sent.
   */
  element: React.ReactElement;
  /**
   * Pre-computed static shell from the PPR cache. When provided, the shell HTML
   * is sent as the first chunk of the response for immediate first paint.
   *
   * When `undefined`, the function falls back to `renderPage()` (standard SSR).
   */
  shell?: PprCacheEntry;
  /**
   * Pre-built `<head>` HTML string (charset, viewport, meta, asset tags,
   * dehydrated state). Injected before the shell body content.
   */
  head: string;
  /**
   * Client JS URLs to inject via `bootstrapScripts` in `renderToReadableStream`.
   * These are the hashed module chunks that hydrate the page on the client.
   */
  scripts: string[];
}

/**
 * Render a PPR (Partial Prerendering) route.
 *
 * When a pre-computed shell is available in the PPR cache, this function:
 * 1. Immediately sends the shell HTML (including Suspense fallbacks) as the
 *    first chunk of a streaming `Response` — this achieves instant TTFB.
 * 2. Pipes `renderToReadableStream` output after the shell. React's streaming
 *    renderer emits inline `<script>` chunks that replace each Suspense
 *    fallback with the resolved dynamic content as promises settle.
 *
 * When no shell is cached, the function returns a standard streaming SSR
 * response via `renderPage()` as a transparent fallback so the route still
 * works correctly before build-time pre-rendering has run.
 *
 * **Streaming contract:**
 * - Response uses `Transfer-Encoding: chunked` and `Content-Type: text/html`.
 * - The shell chunk is written before any async work begins.
 * - React's hydration `<script>` tags keep the client in sync with the server.
 *
 * @param options - PPR render options including the element tree, shell, head,
 *   and bootstrap script URLs.
 * @returns A streaming `Response` with `Content-Type: text/html; charset=utf-8`.
 */
export async function renderPprPage(options: RenderPprOptions): Promise<Response> {
  const { element, shell, head, scripts } = options;

  // ── No cached shell — fall back to standard SSR ───────────────────────────
  // This path is taken before build-time pre-rendering has populated the cache,
  // or for routes where shell extraction failed.
  if (!shell) {
    console.warn(
      "[snapshot-ssr] renderPprPage called without a cached shell — falling back to standard SSR.",
    );
    // Build a minimal streaming response using the element tree directly.
    const fallbackStream = await renderToReadableStream(element, {
      bootstrapScripts: scripts,
      onError(error: unknown) {
        console.error("[snapshot-ssr] PPR fallback renderToReadableStream error:", error);
      },
    });

    const encoder = new TextEncoder();
    const headBytes = encoder.encode(head);
    const body = buildConcatenatedStream(headBytes, fallbackStream, new Uint8Array(0));

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  }

  // ── PPR fast path: shell first, then dynamic update scripts ──────────────
  //
  // Architecture:
  //   chunk 1  →  shell HTML  (pre-computed static content + Suspense fallbacks)
  //   chunk 2+ →  React dynamic stream (inline <script> tags filling Suspense holes)
  //
  // React's renderToReadableStream in React 19 automatically emits <script>
  // chunks that instruct the browser to replace each Suspense fallback with the
  // resolved children. We send the shell up-front so the browser can paint
  // immediately, then let React's stream fill in the dynamic content.
  //
  // The `head` parameter already contains the full <head> block built by the
  // caller (preamble: <!DOCTYPE html><html><head>...</head><body><div id="root">).
  // The shell HTML is the React-rendered body content with fallbacks in-place.
  // After that, React's dynamic stream closes </div></body></html>.

  const encoder = new TextEncoder();
  const headBytes = encoder.encode(head);
  const shellBytes = encoder.encode(shell.shellHtml);

  // Start the full React stream for dynamic slot resolution.
  // bootstrapScripts causes React to emit <script type="module"> tags that
  // hydrate the client bundle. The stream itself emits additional inline
  // <script> chunks to flush resolved Suspense boundaries.
  const dynamicStream = await renderToReadableStream(element, {
    bootstrapScripts: scripts,
    onError(error: unknown) {
      console.error("[snapshot-ssr] PPR dynamic renderToReadableStream error:", error);
    },
  });

  // Build the concatenated response stream:
  //   head bytes → shell bytes → dynamic React stream
  //
  // The dynamic stream from React 19 includes the hydration scripts and the
  // out-of-order Suspense content that fills the fallback slots in the shell.
  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // 1. Send <head> preamble immediately.
        controller.enqueue(headBytes);

        // 2. Send pre-computed shell HTML with Suspense fallbacks.
        controller.enqueue(shellBytes);

        // 3. Pipe the dynamic React stream (Suspense resolution scripts).
        const reader = dynamicStream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) controller.enqueue(value);
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(responseStream, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Ppr": "shell",
    },
  });
}
