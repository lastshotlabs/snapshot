// @vitest-environment happy-dom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { type: string } }) => (
    <div data-rendered={config.type}>{config.type}</div>
  ),
}));

import { Section } from "../component";

describe("Section", () => {
  afterEach(() => {
    cleanup();
  });

  it("applies alignment, height, and bleed styles", () => {
    const { container } = render(
      <Section
        config={{
          type: "section",
          id: "hero-section",
          height: "screen",
          align: "center",
          justify: "between",
          bleed: true,
          className: "section-root-class",
          slots: {
            root: { className: "section-root-slot" },
          },
          children: [{ type: "text", text: "Hero" }] as never,
        }}
      />,
    );

    const element = container.firstElementChild as HTMLElement;
    expect(element.style.minHeight).toBe("100vh");
    expect(element.style.alignItems).toBe("center");
    expect(element.style.justifyContent).toBe("space-between");
    expect(element.style.marginInline).toContain("var(--sn-spacing-lg");
    expect(element.className).toContain("section-root-class");
    expect(element.className).toContain("section-root-slot");
  });
});
