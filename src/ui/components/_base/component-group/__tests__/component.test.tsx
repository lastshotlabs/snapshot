// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ComponentGroup } from "../component";

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => ({
    raw: {
      componentGroups: {
        hero: {
          components: [{ type: "markdown", id: "title", text: "Old title" }],
        },
      },
    },
  }),
}));

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { text?: string; id?: string } }) => (
    <div data-testid="component-group-child">{config.text ?? config.id}</div>
  ),
}));

describe("ComponentGroup", () => {
  it("renders the named group with per-id overrides applied", () => {
    render(
      <ComponentGroup
        config={{
          type: "component-group",
          className: "component-root",
          group: "hero",
          overrides: {
            title: {
              text: "New title",
            },
          },
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="component-group"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    expect(screen.getByTestId("component-group-child").textContent).toBe("New title");
  });
});
