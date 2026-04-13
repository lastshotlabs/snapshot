// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid={`nav-dropdown-item-${config.id ?? config.type}`}>{config.type}</div>
  ),
}));

import { NavDropdown } from "../component";

function renderWithContext(
  ui: React.ReactElement,
  globals?: Record<string, unknown>,
) {
  const store = createStore();
  return render(
    <AppRegistryContext.Provider value={globals ? { register() {}, get() {}, unregister() {}, keys() { return []; }, store } as never : null}>
      <JotaiProvider store={store}>
        <PageRegistryContext.Provider value={null}>
          {ui}
        </PageRegistryContext.Provider>
      </JotaiProvider>
    </AppRegistryContext.Provider>,
  );
}

describe("NavDropdown", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens the floating panel and renders items", () => {
    renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          label: "Products",
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    expect(screen.getByTestId("nav-dropdown-item-item-a")).toBeTruthy();
  });

  it("hides when roles do not match", () => {
    renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          label: "Admin",
          roles: ["admin"],
          items: [],
        }}
      />,
    );

    expect(screen.queryByText("Admin")).toBeNull();
  });
});
