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
          children: [{ type: "markdown", id: "box-copy", content: "Hello" } as never],
        }}
      />,
    );

    expect(container.querySelector("section")).toBeTruthy();
    expect(screen.getByTestId("box-child").textContent).toContain("box-copy");
  });
});
