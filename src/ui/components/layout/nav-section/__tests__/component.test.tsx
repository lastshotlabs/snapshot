// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const refValues: Record<string, unknown> = {
  "navSection.label": "Resolved Resources",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
}));

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid={`nav-section-item-${config.id ?? config.type}`}>{config.type}</div>
  ),
}));

import { NavSection } from "../component";

describe("NavSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders child items by default", () => {
    render(
      <NavSection
        config={{
          type: "nav-section",
          className: "component-root",
          label: "Resources",
          items: [{ type: "text", id: "item-a" } as never],
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="nav-section"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    expect(screen.getByTestId("nav-section-item-item-a")).toBeTruthy();
  });

  it("toggles collapsed content for collapsible sections", () => {
    render(
      <NavSection
        config={{
          type: "nav-section",
          label: "Resources",
          collapsible: true,
          defaultCollapsed: true,
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    expect(screen.queryByTestId("nav-section-item-item-a")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Resources" }));
    expect(screen.getByTestId("nav-section-item-item-a")).toBeTruthy();
  });

  it("renders ref-backed labels", () => {
    render(
      <NavSection
        config={{
          type: "nav-section",
          label: { from: "navSection.label" } as never,
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Resolved Resources" }),
    ).toBeTruthy();
  });
});
