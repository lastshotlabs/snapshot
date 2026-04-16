// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
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
          label: "Brand color",
          format: "hex",
          allowCustom: true,
          showAlpha: false,
          onChange: { type: "set-color" } as never,
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="brand-color"]')?.className,
    ).toContain("color-picker-root");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "#ff0000" },
    });

    expect(executeSpy).toHaveBeenCalledWith({ type: "set-color" }, { value: "#ff0000" });
  });
});
