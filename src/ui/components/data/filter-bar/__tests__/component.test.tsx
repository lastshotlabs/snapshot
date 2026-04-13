/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { FilterBar } from "../component";

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

describe("FilterBar", () => {
  it("opens filter options and applies a selection", () => {
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <FilterBar
          config={{
            type: "filter-bar",
            filters: [
              {
                key: "role",
                label: "Role",
                options: [
                  { label: "Admin", value: "admin" },
                  { label: "User", value: "user" },
                ],
              },
            ],
          }}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId("filter-button-role"));
    fireEvent.click(screen.getByRole("option", { name: "Admin" }));

    expect(screen.getByText("Role: Admin")).toBeTruthy();
  });
});
