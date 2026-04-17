// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { Embed } from "../component";

describe("Embed", () => {
  it("renders an iframe with the configured source", () => {
    const { container } = render(
      <Embed
        config={{
          type: "embed",
          id: "marketing-embed",
          url: "https://example.com/embed",
          title: "Embedded content",
          className: "embed-root-class",
          slots: {
            root: { className: "embed-root-slot" },
          },
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-component="embed"]');
    expect(root?.className).toContain("embed-root-class");
    expect(root?.className).toContain("embed-root-slot");
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("https://example.com/embed");
    expect(iframe?.getAttribute("title")).toBe("Embedded content");
  });

  it("renders ref-backed url, aspect ratio, and title", () => {
    const registry = new AtomRegistryImpl();
    registry.store.set(registry.register("embed"), {
      url: "https://example.com/video",
      aspectRatio: "4/3",
      title: "Demo video",
    });

    const { container } = render(
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <Embed
            config={{
              type: "embed",
              id: "dynamic-embed",
              url: { from: "embed.url" },
              aspectRatio: { from: "embed.aspectRatio" },
              title: { from: "embed.title" },
            }}
          />
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>,
    );

    const root = container.querySelector('[data-snapshot-component="embed"]') as
      | HTMLElement
      | null;
    const iframe = container.querySelector("iframe");
    expect(root?.style.aspectRatio).toBe("4/3");
    expect(iframe?.getAttribute("src")).toBe("https://example.com/video");
    expect(iframe?.getAttribute("title")).toBe("Demo video");
  });
});
