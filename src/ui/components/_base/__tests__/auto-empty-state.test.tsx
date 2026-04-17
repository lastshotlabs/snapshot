// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtomRegistryImpl } from "../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../context/providers";
import { AutoEmptyState } from "../auto-empty-state";

const executeSpy = vi.fn();

vi.mock("../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../icons/render", () => ({
  renderIcon: (name: string) => <span data-testid="auto-empty-icon-node">{name}</span>,
}));

afterEach(() => {
  cleanup();
});

describe("AutoEmptyState", () => {
  it("applies canonical root and action surfaces", () => {
    const { container } = render(
      <AutoEmptyState
        config={{
          id: "table-empty",
          className: "empty-root",
          title: "No rows",
          action: { action: { type: "refresh" } as never },
          slots: {
            root: { className: "root-slot" },
            action: { className: "action-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="table-empty"]')?.className,
    ).toContain("empty-root");
    expect(
      container.querySelector('[data-snapshot-id="table-empty"]')?.className,
    ).toContain("root-slot");
    expect(
      container.querySelector('[data-snapshot-id="table-empty-action"]')
        ?.className,
    ).toContain("action-slot");
  });

  it("dispatches the configured action with the default label fallback", () => {
    executeSpy.mockReset();

    render(
      <AutoEmptyState
        config={{
          title: "No rows",
          action: { action: { type: "refresh" } as never },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Action" }));
    expect(executeSpy).toHaveBeenCalledWith({ type: "refresh" });
  });

  it("renders ref-backed title, description, and action label", () => {
    const registry = new AtomRegistryImpl();
    registry.store.set(registry.register("empty"), {
      title: "No matching rows",
      description: "Try widening your filters",
      actionLabel: "Refresh data",
    });

    render(
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <AutoEmptyState
            config={{
              title: { from: "empty.title" } as never,
              description: { from: "empty.description" } as never,
              action: {
                label: { from: "empty.actionLabel" } as never,
                action: { type: "refresh" } as never,
              },
            }}
          />
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>,
    );

    expect(screen.getByText("No matching rows")).toBeTruthy();
    expect(screen.getByText("Try widening your filters")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refresh data" })).toBeTruthy();
  });
});
