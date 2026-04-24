// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Box } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid="box-child">{config.id ?? config.type}</div>
  ),
}));

describe("Box", () => {
  it("renders children inside the configured element", () => {
    const { container } = render(
      <Box
        config={{
          type: "box",
          as: "section",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
            item: { className: "item-slot" },
          } as never,
          children: [{ type: "markdown", id: "box-copy", content: "Hello" } as never],
        }}
      />,
    );

    const section = container.querySelector("section");
    expect(section).toBeTruthy();
    expect(section?.className).toContain("component-root");
    expect(section?.className).toContain("slot-root");
    expect(container.querySelector('[data-snapshot-id="box-item"]')?.className).toContain("item-slot");
    expect(screen.getByTestId("box-child").textContent).toContain("box-copy");
  });
});
