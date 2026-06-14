import { fileURLToPath } from "node:url";
import React from "react";
import { describe, expect, it } from "vitest";
import { createReactRenderer } from "../renderer";
import type { SsrShellShape } from "../types";

const emptyShell: SsrShellShape = {
  headTags: "",
  assetTags: "",
};

describe("entity page SSR rendering", () => {
  it("createReactRenderer.renderPage() rejects removed entity-page declarations", async () => {
    const renderer = createReactRenderer({
      resolveComponent: async () =>
        (() => React.createElement("div")) as React.ComponentType<
          Record<string, unknown>
        >,
    });

    await expect(
      renderer.renderPage({
        declaration: {
          declaration: {
            type: "list",
            path: "/posts",
          },
        },
      }, emptyShell, {}),
    ).rejects.toThrow(
      "Config-driven entity page rendering was removed",
    );
  });

  it("createReactRenderer.renderPage() delegates custom pages to the route renderer", async () => {
    const fixturePath = fileURLToPath(
      new URL("./fixtures/custom-page-route.ts", import.meta.url),
    );
    const customResult = {
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

});
