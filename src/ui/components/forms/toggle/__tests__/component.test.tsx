// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();
const subscribedValues: Record<string, unknown> = {
  "toolbar.boldLabel": "Bold",
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

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="toggle-icon">{name}</span>,
}));

describe("Toggle", () => {
  it("toggles pressed state and dispatches the change action", () => {
    executeSpy.mockReset();

    const { container } = render(
      <Toggle
        config={{
          type: "toggle",
          id: "bold-toggle",
          className: "toggle-root-class",
          label: { from: "toolbar.boldLabel" },
          icon: "bold",
          on: {
            change: { type: "toggle-bold" } as never,
          },
          slots: {
            root: { className: "toggle-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="bold-toggle"]')?.className,
    ).toContain("toggle-root-class");
    expect(
      container.querySelector('[data-snapshot-id="bold-toggle"]')?.className,
    ).toContain("toggle-root-slot");
    expect(screen.getByText("Bold")).toBeDefined();

    fireEvent.click(screen.getByTestId("toggle"));

    expect(screen.getByTestId("toggle").getAttribute("aria-pressed")).toBe("true");
    expect(executeSpy).toHaveBeenCalledWith(
      { type: "toggle-bold" },
      { id: "bold-toggle", pressed: true, value: true },
    );
  });
});
