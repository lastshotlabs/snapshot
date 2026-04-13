// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

describe("Slider", () => {
  it("updates the displayed value and dispatches change actions", () => {
    executeSpy.mockReset();

    render(
      <Slider
        config={{
          type: "slider",
          min: 0,
          max: 100,
          step: 1,
          range: false,
          defaultValue: 50,
          label: "Opacity",
          showValue: true,
          showLimits: false,
          onChange: { type: "set-opacity" } as never,
        }}
      />,
    );

    fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });

    expect(screen.getByText("75")).toBeTruthy();
    expect(executeSpy).toHaveBeenCalledWith({ type: "set-opacity" }, { value: 75 });
  });
});
