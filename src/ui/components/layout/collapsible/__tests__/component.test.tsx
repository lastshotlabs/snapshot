// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Collapsible } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div>{config.id ?? config.type}</div>
  ),
}));

vi.mock("../../../../context/index", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../expressions/use-expression", () => ({
  useEvaluateExpression: () => false,
}));

describe("Collapsible", () => {
  it("opens its content when the trigger is clicked", () => {
    const { container } = render(
      <Collapsible
        config={{
          type: "collapsible",
          className: "component-root",
          trigger: { type: "markdown", id: "trigger-copy", content: "Toggle" } as never,
          children: [{ type: "markdown", id: "body-copy", content: "Body" } as never],
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-component="collapsible"]');
    expect((root as HTMLElement | null)?.className).toContain("component-root");
    expect((root as HTMLElement | null)?.className).toContain("slot-root");
    fireEvent.click(screen.getByText("trigger-copy"));

    expect(container.querySelector('[data-collapsible-content][data-open="true"]')).toBeTruthy();
  });

  it("uses the shared button control for its trigger", () => {
    render(
      <Collapsible
        config={{
          type: "collapsible",
          className: "component-root",
          trigger: { type: "markdown", id: "trigger-copy", content: "Toggle" } as never,
          children: [{ type: "markdown", id: "body-copy", content: "Body" } as never],
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="collapsible"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    expect(
      screen.getAllByRole("button")[0]?.getAttribute("data-sn-button"),
    ).not.toBeNull();
  });
});
