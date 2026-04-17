// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();
const subscribedValues: Record<string, unknown> = {
  "copy.colorLabel": "Brand color",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("ColorPicker", () => {
  it("dispatches change actions when the value changes", () => {
    executeSpy.mockReset();

    const { container } = render(
      <ColorPicker
        config={{
          type: "color-picker",
          id: "brand-color",
          className: "color-picker-root",
          label: { from: "copy.colorLabel" },
          format: "hex",
          allowCustom: true,
          showAlpha: false,
          on: {
            change: { type: "set-color" } as never,
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="brand-color"]')?.className,
    ).toContain("color-picker-root");
    expect(screen.getByText("Brand color")).toBeDefined();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "#ff0000" },
    });

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "set-color" },
      { id: "brand-color", value: "#ff0000" },
    );
  });
});
