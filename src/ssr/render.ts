// src/ssr/render.ts
import {
  HydrationBoundary,
  QueryClientProvider,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
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
 * @param element - The React element to render (already constructed with props).
 * @param context - Per-request context containing a fresh `QueryClient`.
 * @param shell - Asset and head tags from bunshot-ssr. `headTags` should already
 *   be populated by the renderer before calling this function.
 * @param timeoutMs - Abort timeout in milliseconds. Default: 5000.
 * @returns A streaming `Response` with `Content-Type: text/html; charset=utf-8`.
 *
 * @internal — called by `createReactRenderer` and `createManifestRenderer`.
 */
export async function renderPage(
  element: React.ReactElement,
  context: SsrRequestContext,
  shell: SsrShellShape,
  timeoutMs = 5000,
): Promise<Response> {
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
    stream = await renderToReadableStream(wrappedElement, {
      signal: controller.signal,
      onError(error: unknown) {
        console.error("[snapshot-ssr] renderToReadableStream error:", error);
      },
    });
  } finally {
    clearTimeout(timeoutId);
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
