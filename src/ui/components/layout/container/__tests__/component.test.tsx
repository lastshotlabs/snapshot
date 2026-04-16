// @vitest-environment happy-dom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { type: string } }) => (
    <div data-rendered={config.type}>{config.type}</div>
  ),
}));

import { Container } from "../component";

describe("Container", () => {
  afterEach(() => {
    cleanup();
  });

  it("applies max width, padding, and centering", () => {
    const { container } = render(
      <Container
        config={{
          type: "container",
          id: "prose-container",
          maxWidth: "prose",
          padding: "lg",
          center: true,
          className: "container-root-class",
          slots: {
            root: { className: "container-root-slot" },
          },
          children: [{ type: "text", text: "Body" }] as never,
        }}
      />,
    );

    const element = container.firstElementChild as HTMLElement;
    expect(element.style.maxWidth).toContain("var(--sn-container-prose");
    expect(element.style.paddingInline).toContain("var(--sn-spacing-lg");
    expect(element.style.marginInline).toBe("auto");
    expect(element.className).toContain("container-root-class");
    expect(element.className).toContain("container-root-slot");
  });
});
