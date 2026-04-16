// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { TreeView } from "../component";

function createWrapper() {
  const registry = new AtomRegistryImpl();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          {children}
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return Wrapper;
}

describe("TreeView", () => {
  afterEach(() => {
    cleanup();
  });

  it("applies canonical row, badge, and children slots", () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <TreeView
          config={{
            type: "tree-view",
            id: "file-tree",
            className: "tree-root-class",
            items: [
              {
                label: "Docs",
                badge: "3",
                expanded: true,
                slots: {
                  row: { className: "docs-row" },
                  badge: { className: "docs-badge" },
                  children: { className: "docs-children" },
                },
                children: [
                  {
                    label: "Report.pdf",
                  },
                ],
              },
            ],
            slots: {
              root: { className: "tree-root" },
              disclosure: { className: "tree-disclosure" },
            },
          }}
        />
      </Wrapper>,
    );

    expect(
      container.querySelector('[data-snapshot-id="file-tree-root"]')?.className,
    ).toContain("tree-root-class");
    expect(
      container.querySelector('[data-snapshot-id="file-tree-root"]')?.className,
    ).toContain("tree-root");
    expect(
      container.querySelector('[data-snapshot-id="file-tree-row-root-0"]')
        ?.className,
    ).toContain("docs-row");
    expect(screen.getByText("3").className).toContain("docs-badge");
    expect(
      container.querySelector('[data-snapshot-id="file-tree-disclosure-root-0"]')
        ?.className,
    ).toContain("tree-disclosure");
    expect(
      container.querySelector('[data-snapshot-id="file-tree-children-root-0"]')
        ?.className,
    ).toContain("docs-children");
  });

  it("toggles a branch open and closed", () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <TreeView
          config={{
            type: "tree-view",
            items: [
              {
                label: "Docs",
                children: [{ label: "Report.pdf" }],
              },
            ],
          }}
        />
      </Wrapper>,
    );

    const row = screen.getByRole("treeitem");
    fireEvent.click(row);
    expect(screen.getByText("Report.pdf")).toBeDefined();
    fireEvent.click(row);
    expect(screen.queryByText("Report.pdf")).toBeNull();
  });
});
