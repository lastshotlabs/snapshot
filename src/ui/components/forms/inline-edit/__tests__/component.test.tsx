// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { InlineEdit } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();
const subscribedValues: Record<string, unknown> = {
  "copy.inlineEditPlaceholder": "Rename this item",
};

vi.mock("../../../../context/hooks", () => ({
  usePublish: () => mockPublish,
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

describe("InlineEdit", () => {
  it("applies canonical root, hover, and input slot styling", () => {
    const { container } = render(
      <InlineEdit
        config={{
          type: "inline-edit",
          id: "inline-edit-demo",
          value: "Snapshot",
          className: "inline-edit-root",
          fontSize: "2rem",
          slots: {
            display: {
              states: {
                hover: {
                  className: "inline-edit-hover",
                },
              },
            },
            input: {
              className: "inline-edit-input-slot",
            },
          },
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-id="inline-edit-demo-root"]');
    const displayText = container.querySelector(
      '[data-snapshot-id="inline-edit-demo-display-text"]',
    );

    expect(root?.className).toContain("inline-edit-root");
    expect((root as HTMLElement | null)?.style.fontSize).toBe("");
    expect((displayText as HTMLElement | null)?.style.fontSize).toBe("2rem");

    const display = screen.getByTestId("inline-edit-display");
    fireEvent.pointerEnter(display);
    expect(display.className).toContain("inline-edit-hover");

    fireEvent.click(display);

    expect(screen.getByTestId("inline-edit-input").className).toContain(
      "inline-edit-input-slot",
    );
  });

  it("renders a ref-backed placeholder when there is no value", () => {
    render(
      <InlineEdit
        config={{
          type: "inline-edit",
          id: "inline-edit-empty",
          value: "",
          placeholder: { from: "copy.inlineEditPlaceholder" },
        }}
      />,
    );

    expect(screen.getByText("Rename this item")).toBeDefined();
  });
});
