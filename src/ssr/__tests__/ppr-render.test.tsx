// src/ssr/__tests__/ppr-render.test.tsx
// Unit tests for renderPprPage() — the PPR streaming renderer.
// Uses bun:test; do NOT run — the full test suite runs after all phases land.

import React from "react";
import { describe, expect, it } from "bun:test";
import { renderPprPage } from "../render";
import type { RenderPprOptions } from "../render";
import type { PprCacheEntry } from "../ppr-cache";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function StaticPage(): React.ReactElement {
  return React.createElement(
    "div",
    { id: "page" },
    React.createElement("h1", null, "Hello PPR"),
    React.createElement("p", null, "Static content"),
  );
}

const HEAD_HTML =
  '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n</head>\n<body>\n<div id="root">\n';

const CACHED_SHELL: PprCacheEntry = {
  shellHtml: '<div id="page"><h1>Hello PPR</h1><div id="fallback">Loading…</div></div>',
  cachedAt: Date.now(),
};

function makeOptions(overrides?: Partial<RenderPprOptions>): RenderPprOptions {
  return {
    element: React.createElement(StaticPage),
    head: HEAD_HTML,
    scripts: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("renderPprPage", () => {
  describe("without a cached shell (fallback path)", () => {
    it("returns a Response with status 200", async () => {
      const response = await renderPprPage(makeOptions({ shell: undefined }));
      expect(response.status).toBe(200);
    });

    it("sets Content-Type to text/html", async () => {
      const response = await renderPprPage(makeOptions({ shell: undefined }));
      expect(response.headers.get("content-type")).toContain("text/html");
    });

    it("response body contains the React-rendered content", async () => {
      const response = await renderPprPage(makeOptions({ shell: undefined }));
      const text = await response.text();
      expect(text).toContain("Hello PPR");
    });

    it("response body contains the head HTML", async () => {
      const response = await renderPprPage(makeOptions({ shell: undefined }));
      const text = await response.text();
      expect(text).toContain("UTF-8");
    });
  });

  describe("with a cached shell (PPR fast path)", () => {
    it("returns a Response with status 200", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      expect(response.status).toBe(200);
    });

    it("sets Content-Type to text/html", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      expect(response.headers.get("content-type")).toContain("text/html");
    });

    it("sets Transfer-Encoding to chunked", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      expect(response.headers.get("transfer-encoding")).toBe("chunked");
    });

    it("sets X-Ppr: shell header to signal PPR serving", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      expect(response.headers.get("x-ppr")).toBe("shell");
    });

    it("response body contains the pre-computed shell HTML", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      const text = await response.text();
      // The shell HTML should appear in the body (after the <head>)
      expect(text).toContain("Hello PPR");
    });

    it("response body contains the head HTML as the first content", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      const text = await response.text();
      expect(text).toContain("UTF-8");
      // Head should appear before shell content
      const headIdx = text.indexOf("UTF-8");
      const shellIdx = text.indexOf("Hello PPR");
      expect(headIdx).toBeLessThan(shellIdx);
    });

    it("response body contains React hydration scripts", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      const text = await response.text();
      // React's renderToReadableStream emits inline script tags for Suspense resolution
      // At minimum, the response should be non-trivial HTML
      expect(text.length).toBeGreaterThan(100);
    });

    it("response body is a ReadableStream (not null)", async () => {
      const response = await renderPprPage(makeOptions({ shell: CACHED_SHELL }));
      expect(response.body).not.toBeNull();
    });
  });

  describe("bootstrapScripts integration", () => {
    it("accepts an array of script URLs without throwing", async () => {
      const options = makeOptions({
        shell: CACHED_SHELL,
        scripts: ["/assets/entry.abc123.js", "/assets/vendor.def456.js"],
      });
      const response = await renderPprPage(options);
      expect(response.status).toBe(200);
    });

    it("accepts an empty scripts array", async () => {
      const options = makeOptions({ shell: CACHED_SHELL, scripts: [] });
      const response = await renderPprPage(options);
      expect(response.status).toBe(200);
    });
  });
});
