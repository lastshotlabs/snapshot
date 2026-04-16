// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FavoriteButton } from "../component";

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
  Icon: ({ name }: { name: string }) => <span data-testid="favorite-icon">{name}</span>,
}));

describe("FavoriteButton", () => {
  it("toggles active state and executes the toggle action", () => {
    executeSpy.mockReset();
    publishSpy.mockReset();

    render(
      <FavoriteButton
        config={{
          type: "favorite-button",
          className: "component-root",
          active: false,
          toggleAction: { type: "favorite" } as never,
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const button = screen.getByTestId("favorite-button");
    expect(button.className).toContain("component-root");
    expect(button.className).toContain("slot-root");
    fireEvent.click(button);

    expect(executeSpy).toHaveBeenCalledWith({ type: "favorite" });
    expect(screen.getByTestId("favorite-button").getAttribute("data-active")).toBe("true");
  });
});
