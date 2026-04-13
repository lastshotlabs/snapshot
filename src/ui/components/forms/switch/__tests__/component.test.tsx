// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("Switch", () => {
  it("toggles checked state and dispatches the action", () => {
    executeSpy.mockReset();

    render(
      <Switch
        config={{
          type: "switch",
          label: "Enable notifications",
          action: { type: "toggle-notifications" } as never,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("switch"));

    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
    expect(executeSpy).toHaveBeenCalledWith({ type: "toggle-notifications" });
  });
});
