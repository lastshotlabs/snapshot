// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Banner } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid="banner-child">{config.id ?? config.type}</div>
  ),
}));

describe("Banner", () => {
  it("renders nested children through the manifest renderer", () => {
    const { container } = render(
      <Banner
        config={{
          type: "banner",
          id: "hero-banner",
          className: "banner-root",
          height: "480px",
          align: "left",
          background: {
            color: "#111827",
            overlay: "linear-gradient(rgba(0,0,0,0.3), transparent)",
          },
          children: [{ type: "markdown", id: "hero-copy", content: "# Hero" } as never],
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-component="banner"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-snapshot-id="hero-banner"]')?.className,
    ).toContain("banner-root");
    expect(
      (container.querySelector('[data-snapshot-id="hero-banner"]') as HTMLElement | null)
        ?.style.height ?? "",
    ).toBe("");
    expect(
      (container.querySelector('[data-snapshot-id="hero-banner"]') as HTMLElement | null)
        ?.style.minHeight,
    ).toBe("480px");
    expect(screen.getByTestId("banner-child").textContent).toContain("hero-copy");
  });
});
