// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";

const refValues: Record<string, unknown> = {
  "navDropdown.label": "Resolved Products",
};

vi.mock("../../../../context/index", async () => {
  const actual = await vi.importActual("../../../../context/index");

  return {
    ...actual,
    useSubscribe: (value: unknown) =>
      value &&
      typeof value === "object" &&
      "from" in (value as Record<string, unknown>)
        ? refValues[(value as { from: string }).from]
        : value,
  };
});

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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
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
    vi.runAllTimers();
    expect(screen.getByTestId("nav-dropdown-item-item-a")).toBeTruthy();
  });

  it("anchors the dropdown to a positioned root and applies width to the panel", () => {
    const { container } = renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          className: "component-root",
          label: "Products",
          width: "18rem",
          items: [{ type: "text", id: "item-a" } as never],
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-id="nav-dropdown-root"]');
    expect((root as HTMLElement | null)?.className).toContain("component-root");
    expect((root as HTMLElement | null)?.className).toContain("slot-root");
    expect((root as HTMLElement | null)?.style.position).toBe("relative");
    expect((root as HTMLElement | null)?.style.width).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    vi.runAllTimers();
    const panel = container.querySelector('[data-snapshot-id="nav-dropdown-panel"]');
    expect((panel as HTMLElement | null)?.style.minWidth).toBe("18rem");
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

  it("supports hover-triggered opening when configured", () => {
    const { container } = renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          label: "Products",
          trigger: "hover",
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-id="nav-dropdown-root"]');
    fireEvent.pointerEnter(root as HTMLElement);
    vi.runAllTimers();
    expect(screen.getByTestId("nav-dropdown-item-item-a")).toBeTruthy();
  });

  it("forwards onNavigate to nav-link items", () => {
    const onNavigate = vi.fn();

    renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          label: "Products",
          items: [
            {
              type: "nav-link",
              id: "item-a",
              label: "Pricing",
              path: "/pricing",
            } as never,
          ],
        }}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    fireEvent.click(screen.getByRole("link", { name: "Pricing" }));

    expect(onNavigate).toHaveBeenCalledWith("/pricing");
  });

  it("applies dropdown item slots to nav-link children without duplicating the interactive surface on the wrapper", () => {
    const { container } = renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          label: "Products",
          slots: {
            item: {
              className: "dropdown-item-slot",
              width: "100%",
            },
          },
          items: [
            {
              type: "nav-link",
              id: "item-a",
              label: "Dashboard",
              path: "/",
            } as never,
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    const wrapper = container.querySelector('[data-snapshot-id="nav-dropdown-item-0"]');
    const link = screen.getByRole("link", { name: "Dashboard" });

    expect(wrapper?.className).not.toContain("dropdown-item-slot");
    expect(link.className).toContain("dropdown-item-slot");
    expect((link as HTMLElement).style.width).toBe("100%");
  });

  it("renders ref-backed labels", () => {
    renderWithContext(
      <NavDropdown
        config={{
          type: "nav-dropdown",
          label: { from: "navDropdown.label" } as never,
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Resolved Products" }),
    ).toBeTruthy();
  });
});
