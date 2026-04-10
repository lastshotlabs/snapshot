import { fileURLToPath } from "node:url";
import React from "react";
import "../../ui/components/register";
import { describe, expect, it } from "vitest";
import { createManifestRenderer } from "../manifest-renderer";
import { createReactRenderer } from "../renderer";
import type { SsrShellShape } from "../types";
import type { PageLoaderResult } from "../../ui/entity-pages";
import {
  buildDashboardResult,
  buildListResult,
  navigationFixture,
} from "../../ui/entity-pages/__tests__/fixtures";

const emptyShell: SsrShellShape = {
  headTags: "",
  assetTags: "",
};

describe("entity page SSR rendering", () => {
  it("createReactRenderer.renderPage() returns HTML for an entity list page", async () => {
    const renderer = createReactRenderer({
      resolveComponent: async () =>
        (() => React.createElement("div")) as React.ComponentType<
          Record<string, unknown>
        >,
    });

    const response = await renderer.renderPage(
      buildListResult(),
      emptyShell,
      {},
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Posts");
    expect(html).toContain("First Post");
  });

  it("createReactRenderer.renderPage() renders shell navigation when provided", async () => {
    const renderer = createReactRenderer({
      resolveComponent: async () =>
        (() => React.createElement("div")) as React.ComponentType<
          Record<string, unknown>
        >,
    });

    const response = await renderer.renderPage(
      buildListResult({ navigation: navigationFixture }),
      emptyShell,
      {},
    );
    const html = await response.text();

    expect(html).toContain("Control Center");
    expect(html).toContain("Dashboard");
  });

  it("createReactRenderer.renderPage() delegates custom pages to the route renderer", async () => {
    const fixturePath = fileURLToPath(
      new URL("./fixtures/custom-page-route.ts", import.meta.url),
    );
    const customResult: PageLoaderResult = {
      declaration: {
        key: "custom-page",
        declaration: {
          type: "custom",
          path: "/custom",
          title: "Custom",
          handler: { handler: fixturePath },
        },
        entityConfig: null,
        pattern: /^$/,
        paramNames: [],
      },
      data: { type: "custom" },
      entityMeta: {},
      meta: { title: "Custom" },
    };
    const renderer = createReactRenderer({
      resolveComponent: async () =>
        (() =>
          React.createElement(
            "div",
            null,
            "Custom Route",
          )) as React.ComponentType<Record<string, unknown>>,
    });

    const response = await renderer.renderPage(customResult, emptyShell, {});
    const html = await response.text();

    expect(html).toContain("Custom Route");
  });

  it("createManifestRenderer.renderPage() augments the manifest and renders HTML", async () => {
    const renderer = createManifestRenderer({
      manifest: {
        app: { title: "Snapshot App", home: "/home" },
        navigation: {
          mode: "sidebar",
          items: [{ label: "Home", path: "/home" }],
        },
        routes: [
          {
            id: "home",
            path: "/home",
            title: "Home",
            content: [{ type: "heading", text: "Home", level: 1 }],
          },
        ],
      },
    });

    const response = await renderer.renderPage(
      buildDashboardResult(),
      emptyShell,
      {},
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Dashboard");
    expect(html).toContain("Total Posts");
  });

  it("createManifestRenderer.renderPage() rejects custom pages", async () => {
    const renderer = createManifestRenderer({
      manifest: {
        routes: [
          {
            id: "home",
            path: "/",
            title: "Home",
            content: [{ type: "heading", text: "Home", level: 1 }],
          },
        ],
      },
    });

    const customResult: PageLoaderResult = {
      declaration: {
        key: "custom-page",
        declaration: {
          type: "custom",
          path: "/custom",
          title: "Custom",
          handler: { handler: "/tmp/custom.ts" },
        },
        entityConfig: null,
        pattern: /^$/,
        paramNames: [],
      },
      data: { type: "custom" },
      entityMeta: {},
      meta: { title: "Custom" },
    };

    await expect(
      renderer.renderPage(customResult, emptyShell, {}),
    ).rejects.toThrow("Custom page declarations are not supported");
  });
});
