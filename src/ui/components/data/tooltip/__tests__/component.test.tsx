// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TooltipComponent } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { label?: string } }) => (
    <button type="button">{config.label ?? "Trigger"}</button>
  ),
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("TooltipComponent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it("applies canonical slot styling when opened", () => {
    render(
      <TooltipComponent
        config={{
          type: "tooltip",
          id: "tooltip-demo",
          className: "component-root",
          text: "Helpful context",
          delay: 0,
          content: [{ type: "spacer", size: "sm" } as never],
          slots: {
            root: {
              className: "slot-root",
            },
            content: {
              className: "tooltip-content-slot",
            },
            arrow: {
              className: "tooltip-arrow-slot",
            },
          },
        }}
      />,
    );

    fireEvent.pointerEnter(screen.getByTestId("tooltip"));
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("tooltip").className).toContain("component-root");
    expect(screen.getByTestId("tooltip").className).toContain("slot-root");
    expect(screen.getByTestId("tooltip-popup").className).toContain(
      "tooltip-content-slot",
    );
    expect(
      document
        .querySelector('[data-snapshot-id="tooltip-demo-arrow"]')
        ?.className.includes("tooltip-arrow-slot"),
    ).toBe(true);
  });
});
