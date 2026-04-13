// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="empty-state-icon-node">{name}</span>,
}));

describe("EmptyState", () => {
  it("renders content and dispatches the optional action", () => {
    executeSpy.mockReset();

    render(
      <EmptyState
        config={{
          type: "empty-state",
          title: "No results",
          description: "Try again",
          icon: "search",
          actionLabel: "Clear filters",
          action: { type: "reset" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("empty-state-title").textContent).toBe("No results");
    expect(screen.getByTestId("empty-state-description").textContent).toBe("Try again");
    fireEvent.click(screen.getByTestId("empty-state-action"));
    expect(executeSpy).toHaveBeenCalledWith({ type: "reset" });
  });
});
