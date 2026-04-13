// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Row } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid="row-child">{config.id ?? config.type}</div>
  ),
}));

vi.mock("../../../../hooks/use-breakpoint", () => ({
  useResponsiveValue: (value: unknown) => value,
}));

describe("Row", () => {
  it("renders each child through the component renderer", () => {
    render(
      <Row
        config={{
          type: "row",
          gap: "md",
          children: [{ type: "markdown", id: "row-copy", content: "Hello" } as never],
        }}
      />,
    );

    expect(screen.getByTestId("row-child").textContent).toContain("row-copy");
  });
});
