// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

afterEach(() => {
  cleanup();
});

describe("Slider", () => {
  it("updates the displayed value and dispatches change actions", () => {
    executeSpy.mockReset();

    render(
      <Slider
        config={{
          type: "slider",
          className: "component-root",
          min: 0,
          max: 100,
          step: 1,
          range: false,
          defaultValue: 50,
          label: "Opacity",
          showValue: true,
          showLimits: false,
          onChange: { type: "set-opacity" } as never,
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="slider"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });

    expect(screen.getByText("75")).toBeTruthy();
    expect(executeSpy).toHaveBeenCalledWith({ type: "set-opacity" }, { value: 75 });
  });

  it("applies distinct start and end input slots in range mode", () => {
    const { container } = render(
      <Slider
        config={{
          type: "slider",
          id: "price-range",
          min: 0,
          max: 100,
          range: true,
          defaultValue: [20, 80],
          slots: {
            inputStart: { className: "input-start-slot" },
            inputEnd: { className: "input-end-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="price-range-input-start"]')
        ?.className,
    ).toContain("input-start-slot");
    expect(
      container.querySelector('[data-snapshot-id="price-range-input-end"]')
        ?.className,
    ).toContain("input-end-slot");
  });
});
