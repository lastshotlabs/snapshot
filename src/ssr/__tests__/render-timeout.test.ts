import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SsrRequestContext, SsrShellShape } from "../types";

const renderToReadableStreamMock = vi.fn(
  (
    _element: React.ReactElement,
    options?: { signal?: AbortSignal },
  ) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        options?.signal?.addEventListener("abort", () => {
          controller.error(new Error("render aborted"));
        });
      },
    }),
);

vi.mock("react-dom/server", async () => {
  const actual = await vi.importActual<typeof import("react-dom/server")>(
    "react-dom/server",
  );
  return {
    ...actual,
    renderToReadableStream: renderToReadableStreamMock,
  };
});

describe("renderPage timeout lifecycle", () => {
  afterEach(() => {
    vi.useRealTimers();
    renderToReadableStreamMock.mockClear();
  });

  it("keeps the abort timer alive until the response stream settles", async () => {
    vi.useFakeTimers();
    const { renderPage } = await import("../render");

    const response = await renderPage(
      React.createElement("div", null, "timeout"),
      {
        queryClient: new QueryClient(),
        match: {
          filePath: "/fake/route.ts",
          metaFilePath: null,
          params: {},
          query: {},
          url: new URL("http://localhost/"),
        },
      } satisfies SsrRequestContext,
      {
        headTags: "",
        assetTags: "",
      } satisfies SsrShellShape,
      25,
    );

    const textPromise = response.text().catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(30);

    const error = await textPromise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("render aborted");
  });
});
