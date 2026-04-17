// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmptyState } from "../component";

const executeSpy = vi.fn();
const refValues: Record<string, unknown> = {
  "emptyState.title": "Resolved title",
  "emptyState.description": "Resolved description",
  "emptyState.actionLabel": "Resolved action",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="empty-state-icon-node">{name}</span>,
}));

afterEach(() => {
  cleanup();
});

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

  it("applies canonical root and action surfaces", () => {
    const { container } = render(
      <EmptyState
        config={{
          type: "empty-state",
          id: "search-empty",
          className: "empty-root",
          title: "No results",
          actionLabel: "Clear filters",
          action: { type: "reset" } as never,
          slots: {
            root: { className: "root-slot" },
            action: { className: "action-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="search-empty"]')?.className,
    ).toContain("root-slot");
    expect(
      container.querySelector('[data-snapshot-id="search-empty"]')?.className,
    ).toContain("empty-root");
    expect(
      container.querySelector('[data-snapshot-id="search-empty-action"]')
        ?.className,
    ).toContain(
      "action-slot",
    );
  });

  it("renders ref-backed copy", () => {
    render(
      <EmptyState
        config={{
          type: "empty-state",
          title: { from: "emptyState.title" } as never,
          description: { from: "emptyState.description" } as never,
          actionLabel: { from: "emptyState.actionLabel" } as never,
          action: { type: "reset" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("empty-state-title").textContent).toBe(
      "Resolved title",
    );
    expect(screen.getByTestId("empty-state-description").textContent).toBe(
      "Resolved description",
    );
    expect(screen.getByTestId("empty-state-action").textContent).toContain(
      "Resolved action",
    );
  });
});
