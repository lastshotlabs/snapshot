// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { InlineEdit } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  usePublish: () => mockPublish,
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

describe("InlineEdit", () => {
  it("applies canonical hover state and input slot styling", () => {
    render(
      <InlineEdit
        config={{
          type: "inline-edit",
          id: "inline-edit-demo",
          value: "Snapshot",
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

    const display = screen.getByTestId("inline-edit-display");
    fireEvent.pointerEnter(display);
    expect(display.className).toContain("inline-edit-hover");

    fireEvent.click(display);

    expect(screen.getByTestId("inline-edit-input").className).toContain(
      "inline-edit-input-slot",
    );
  });
});
