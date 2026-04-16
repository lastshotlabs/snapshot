// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { DropdownMenu } from "../component";
import type { DropdownMenuConfig } from "../types";
import type { ApiClient } from "../../../../../api/client";

function createTestWrapper() {
  const registry = new AtomRegistryImpl();
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  };
}

const baseConfig: DropdownMenuConfig = {
  type: "dropdown-menu",
  trigger: { label: "Actions" },
  items: [
    {
      type: "item",
      label: "Edit",
      action: { type: "navigate", to: "/edit" },
    },
    { type: "separator" },
    {
      type: "item",
      label: "Delete",
      destructive: true,
      action: { type: "navigate", to: "/delete" },
    },
  ],
};

describe("DropdownMenu", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with data-snapshot-component attribute", () => {
    const wrapper = createTestWrapper();
    render(
      <DropdownMenu
        config={{
          ...baseConfig,
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
      { wrapper },
    );

    const menu = screen.getByTestId("dropdown-menu");
    expect(menu.getAttribute("data-snapshot-component")).toBe("dropdown-menu");
    expect(menu.className).toContain("component-root");
    expect(menu.className).toContain("slot-root");
  });

  it("renders trigger button with label", () => {
    const wrapper = createTestWrapper();
    render(<DropdownMenu config={baseConfig} />, { wrapper });

    expect(screen.getByTestId("dropdown-menu-trigger").textContent).toContain(
      "Actions",
    );
  });

  it("menu is not visible initially", () => {
    const wrapper = createTestWrapper();
    render(<DropdownMenu config={baseConfig} />, { wrapper });

    expect(screen.queryByTestId("dropdown-menu-content")).toBeNull();
  });

  it("opens menu on trigger click", () => {
    const wrapper = createTestWrapper();
    render(<DropdownMenu config={baseConfig} />, { wrapper });

    fireEvent.click(screen.getByTestId("dropdown-menu-trigger"));

    expect(screen.getByTestId("dropdown-menu-content")).toBeTruthy();
  });

  it("renders items, separators, and labels", () => {
    const wrapper = createTestWrapper();
    const config: DropdownMenuConfig = {
      ...baseConfig,
      items: [
        { type: "label", text: "Options" },
        {
          type: "item",
          label: "Edit",
          action: { type: "navigate", to: "/edit" },
        },
        { type: "separator" },
        {
          type: "item",
          label: "Delete",
          destructive: true,
          action: { type: "navigate", to: "/delete" },
        },
      ],
    };

    render(<DropdownMenu config={config} />, { wrapper });
    fireEvent.click(screen.getByTestId("dropdown-menu-trigger"));

    expect(screen.getByText("Options")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders trigger with icon", () => {
    const wrapper = createTestWrapper();
    const config: DropdownMenuConfig = {
      ...baseConfig,
      trigger: { icon: "⋮", label: "Menu" },
    };

    render(<DropdownMenu config={config} />, { wrapper });

    const trigger = screen.getByTestId("dropdown-menu-trigger");
    expect(trigger.textContent).toContain("⋮");
    expect(trigger.textContent).toContain("Menu");
  });

  it("sets aria-expanded on trigger", () => {
    const wrapper = createTestWrapper();
    render(<DropdownMenu config={baseConfig} />, { wrapper });

    const trigger = screen.getByTestId("dropdown-menu-trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders disabled items with aria-disabled", () => {
    const wrapper = createTestWrapper();
    const config: DropdownMenuConfig = {
      ...baseConfig,
      items: [
        {
          type: "item",
          label: "Disabled",
          disabled: true,
          action: { type: "navigate", to: "/nope" },
        },
      ],
    };

    render(<DropdownMenu config={config} />, { wrapper });
    fireEvent.click(screen.getByTestId("dropdown-menu-trigger"));

    const item = screen.getByRole("menuitem");
    expect(item.getAttribute("aria-disabled")).toBe("true");
  });
});
