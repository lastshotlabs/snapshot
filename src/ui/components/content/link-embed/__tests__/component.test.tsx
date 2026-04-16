// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LinkEmbed } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

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
});
