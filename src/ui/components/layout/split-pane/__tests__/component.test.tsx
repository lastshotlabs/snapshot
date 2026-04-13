/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div>{config.id ?? config.type}</div>
  ),
}));

import { SplitPane } from "../component";

describe("SplitPane", () => {
  it("renders canonical root and divider slots", () => {
    render(
      <SplitPane
        config={{
          type: "split-pane",
          id: "workspace-split",
          direction: "horizontal",
          children: [
            { type: "text", id: "left-pane", value: "Left" },
            { type: "text", id: "right-pane", value: "Right" },
          ],
          slots: {
            root: { className: "split-root-slot" },
            divider: { className: "split-divider-slot" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-id="workspace-split-root"]');
    const divider = document.querySelector('[data-snapshot-id="workspace-split-divider"]');
    expect(root?.className).toContain("split-root-slot");
    expect(divider?.className).toContain("split-divider-slot");
    expect(screen.getByText("left-pane")).toBeTruthy();
    expect(screen.getByText("right-pane")).toBeTruthy();
  });
});
