// @vitest-environment happy-dom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { type: string } }) => (
    <div data-rendered={config.type}>{config.type}</div>
  ),
}));

vi.mock("../../../../hooks/use-breakpoint", () => ({
  useResponsiveValue: (value: unknown) =>
    value && typeof value === "object" && "default" in (value as Record<string, unknown>)
      ? (value as Record<string, unknown>).default
      : value,
}));

import { Grid } from "../component";

describe("Grid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders grid areas and child placement", () => {
    const { container, getAllByText } = render(
      <Grid
        config={{
          type: "grid",
          id: "dashboard-grid",
          areas: ["header header", "sidebar main"],
          columns: "240px 1fr",
          rows: "auto 1fr",
          gap: "md",
          className: "grid-root-class",
          slots: {
            root: { className: "grid-root-slot" },
          },
          children: [
            { type: "text", text: "Header", area: "header" } as never,
            { type: "text", text: "Main", area: "main" } as never,
          ],
        }}
      />,
    );

    const grid = container.firstElementChild as HTMLElement;
    expect(grid.style.display).toBe("grid");
    expect(grid.style.gridTemplateAreas).toContain("\"header header\"");
    expect(grid.style.gap).toContain("var(--sn-spacing-md");
    expect(grid.className).toContain("grid-root-class");
    expect(grid.className).toContain("grid-root-slot");
    expect(getAllByText("text")).toHaveLength(2);
    expect(container.querySelector('[style*="grid-area: header"]')).toBeTruthy();
  });
});
