/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { ListComponent } from "../component";

function createWrapper() {
  const registry = new AtomRegistryImpl();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return Wrapper;
}

describe("ListComponent", () => {
  it("applies canonical root and item slots", () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ListComponent
          config={{
            type: "list",
            id: "orders",
            items: [
              {
                id: "1",
                title: "Order A",
                description: "Pending",
                slots: {
                  itemTitle: { className: "title-slot" },
                },
              },
            ],
            slots: {
              root: { className: "root-slot" },
              item: { className: "item-slot" },
              itemBody: { className: "body-slot" },
            },
          }}
        />
      </Wrapper>,
    );

    expect(screen.getByTestId("list").className).toContain("root-slot");
    expect(screen.getByTestId("list-item").className).toContain("item-slot");
    expect(
      document.querySelector('[data-snapshot-id="orders-item-body-0"]')?.className,
    ).toContain("body-slot");
    expect(screen.getByText("Order A").className).toContain("title-slot");
  });
});
