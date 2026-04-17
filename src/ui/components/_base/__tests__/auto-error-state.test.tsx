// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutoErrorState } from "../auto-error-state";

vi.mock("../../../icons/render", () => ({
  renderIcon: (name: string) => <span data-testid="auto-error-icon-node">{name}</span>,
}));

describe("AutoErrorState", () => {
  it("applies canonical root and retry surfaces", () => {
    const onRetry = vi.fn();
    const { container } = render(
      <AutoErrorState
        config={{
          id: "chart-error",
          className: "error-root",
          title: "Failed to load",
          retry: { label: "Try again" },
          slots: {
            root: { className: "root-slot" },
            retry: { className: "retry-slot" },
          },
        }}
        onRetry={onRetry}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="chart-error"]')?.className,
    ).toContain("error-root");
    expect(
      container.querySelector('[data-snapshot-id="chart-error"]')?.className,
    ).toContain("root-slot");
    expect(
      container.querySelector('[data-snapshot-id="chart-error-retry"]')
        ?.className,
    ).toContain("retry-slot");
  });

  it("calls onRetry when the retry button is pressed", () => {
    const onRetry = vi.fn();

    render(
      <AutoErrorState
        config={{
          title: "Failed to load",
          retry: { label: "Retry now" },
        }}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry now" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
