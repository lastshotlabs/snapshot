// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../../context/index", () => ({
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../icons/render", () => ({
  renderIcon: (name: string) => <span data-testid="icon-button-icon">{name}</span>,
}));

describe("IconButton", () => {
  it("renders the requested icon and dispatches the action", () => {
    executeSpy.mockReset();

    render(
      <IconButton
        config={{
          type: "icon-button",
          icon: "search",
          ariaLabel: "Search",
          action: { type: "open-search" } as never,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByTestId("icon-button-icon").textContent).toBe("search");
    expect(executeSpy).toHaveBeenCalledWith({ type: "open-search" });
  });
});
