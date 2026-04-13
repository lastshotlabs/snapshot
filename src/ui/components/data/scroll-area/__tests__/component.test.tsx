// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScrollArea } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid="scroll-area-child">{config.id ?? config.type}</div>
  ),
}));

describe("ScrollArea", () => {
  it("renders nested content with scoped scroll markup", () => {
    const { container } = render(
      <ScrollArea
        config={{
          type: "scroll-area",
          maxHeight: "20rem",
          content: [{ type: "markdown", id: "scroll-copy", content: "Hello" } as never],
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-component="scroll-area"]'),
    ).toBeTruthy();
    expect(screen.getByTestId("scroll-area-child").textContent).toContain("scroll-copy");
  });
});
