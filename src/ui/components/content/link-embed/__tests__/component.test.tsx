// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { LinkEmbed } from "../component";

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="icon">{name}</span>,
}));

describe("LinkEmbed", () => {
  it("renders a generic card when no platform embed applies", () => {
    const { container } = render(
      <LinkEmbed
        config={{
          type: "link-embed",
          id: "post-preview",
          className: "link-embed-root",
          url: "https://example.com/post",
          allowIframe: false,
          maxWidth: "420px",
          meta: {
            title: "Example Post",
            description: "Preview description",
            siteName: "Example Site",
          },
        }}
      />,
    );

    const root = container.querySelector(
      '[data-snapshot-id="post-preview"]',
    ) as HTMLElement | null;

    expect(screen.getByTestId("link-embed").getAttribute("data-platform")).toBe("generic");
    expect(root?.className).toContain("link-embed-root");
    expect(root?.style.maxWidth).toBe("420px");
    expect(screen.getByText("Example Post")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("https://example.com/post");
  });

  it("renders ref-backed metadata in the generic card", () => {
    const registry = new AtomRegistryImpl();
    registry.store.set(registry.register("link"), {
      title: "Dynamic Post",
      description: "Dynamic description",
      siteName: "Dynamic Site",
    });

    render(
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <LinkEmbed
            config={{
              type: "link-embed",
              url: "https://example.com/post",
              allowIframe: false,
              meta: {
                title: { from: "link.title" },
                description: { from: "link.description" },
                siteName: { from: "link.siteName" },
              },
            }}
          />
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>,
    );

    expect(screen.getByText("Dynamic Post")).toBeTruthy();
    expect(screen.getByText("Dynamic description")).toBeTruthy();
    expect(screen.getByText("Dynamic Site")).toBeTruthy();
  });
});
