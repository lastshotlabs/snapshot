// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="toggle-icon">{name}</span>,
}));

describe("Toggle", () => {
  it("toggles pressed state and dispatches the change action", () => {
    executeSpy.mockReset();

    render(
      <Toggle
        config={{
          type: "toggle",
          label: "Bold",
          icon: "bold",
          changeAction: { type: "toggle-bold" } as never,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("toggle"));

    expect(screen.getByTestId("toggle").getAttribute("aria-pressed")).toBe("true");
    expect(executeSpy).toHaveBeenCalledWith({ type: "toggle-bold" }, { pressed: true });
  });
});
