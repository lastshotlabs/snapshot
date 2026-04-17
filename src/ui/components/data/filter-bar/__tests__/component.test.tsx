/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { FilterBar } from "../component";

afterEach(() => {
  cleanup();
});

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
            id: "user-filters",
            className: "filter-bar-root",
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

    expect(
      document
        .querySelector('[data-snapshot-id="user-filters"]')
        ?.classList.contains("filter-bar-root"),
    ).toBe(true);
    expect(screen.getByText("Role: Admin")).toBeTruthy();
  });

  it("renders ref-backed placeholder and filter labels", () => {
    const registry = new AtomRegistryImpl();
    const filtersAtom = registry.register("filters");
    registry.store.set(filtersAtom, {
      searchPlaceholder: "Search people...",
      roleLabel: "Team",
      roleOption: "Managers",
    });

    function RegistryWrapper({ children }: { children: React.ReactNode }) {
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

    render(
      <RegistryWrapper>
        <FilterBar
          config={{
            type: "filter-bar",
            id: "team-filters",
            searchPlaceholder: { from: "filters.searchPlaceholder" },
            filters: [
              {
                key: "role",
                label: { from: "filters.roleLabel" },
                options: [{ label: { from: "filters.roleOption" }, value: "manager" }],
              },
            ],
          }}
        />
      </RegistryWrapper>,
    );

    expect(screen.getByPlaceholderText("Search people...")).toBeTruthy();

    fireEvent.click(screen.getByTestId("filter-button-role"));
    fireEvent.click(screen.getByRole("option", { name: "Managers" }));

    expect(screen.getByText("Team: Managers")).toBeTruthy();
  });
});
