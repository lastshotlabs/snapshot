// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { TabsComponent } from "../component";
import { registerComponent } from "../../../../manifest/component-registry";
import { createStore } from "jotai/vanilla";
import type { TabsConfig } from "../schema";
import { PageRegistryContext } from "../../../../context/providers";
import { AtomRegistryImpl } from "../../../../context/registry";

function TestChild({ config }: { config: Record<string, unknown> }) {
  return createElement(
    "div",
    { "data-testid": `child-${config.label}` },
    config.label as string,
  );
}

function createWrapper(
  store: ReturnType<typeof createStore>,
  registry?: AtomRegistryImpl,
) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const reg = registry ?? new AtomRegistryImpl();
    return createElement(
      Provider,
      { store },
      createElement(PageRegistryContext.Provider, { value: reg }, children),
    );
  };
}

describe("TabsComponent", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    registerComponent("test-child", TestChild);
  });

  const baseConfig: TabsConfig = {
    type: "tabs",
    children: [
      {
        label: "Tab 1",
        content: [{ type: "test-child", label: "Content 1" }],
      },
      {
        label: "Tab 2",
        content: [{ type: "test-child", label: "Content 2" }],
      },
      {
        label: "Tab 3",
        content: [{ type: "test-child", label: "Content 3" }],
        disabled: true,
      },
    ],
    defaultTab: 0,
    variant: "default",
  };

  it("renders the tab bar with all tab labels", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByText("Tab 1")).toBeDefined();
    expect(screen.getByText("Tab 2")).toBeDefined();
    expect(screen.getByText("Tab 3")).toBeDefined();
  });

  it("renders the data-snapshot-component attribute", () => {
    const { container } = render(
      createElement(TabsComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    expect(
      container.querySelector('[data-snapshot-component="tabs"]'),
    ).not.toBeNull();
  });

  it("shows first tab content by default", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByTestId("child-Content 1")).toBeDefined();
  });

  it("switches tab on click", () => {
    const { container } = render(
      createElement(TabsComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    fireEvent.click(screen.getByText("Tab 2"));
    // Tab 2 content should be visible
    expect(screen.getByTestId("child-Content 2")).toBeDefined();
    // Tab 1 panel should be hidden (display: none)
    const panels = container.querySelectorAll("[data-snapshot-tab-panel]");
    const tab1Panel = panels[0] as HTMLElement;
    expect(tab1Panel.style.display).toBe("none");
  });

  it("does not activate disabled tabs", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    fireEvent.click(screen.getByText("Tab 3"));
    // Tab 1 should still be active (disabled tab click is ignored)
    const tab1Button = screen.getByText("Tab 1");
    expect(tab1Button.getAttribute("aria-selected")).toBe("true");
  });

  it("sets aria-selected on active tab button", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    const tab1 = screen.getByText("Tab 1");
    const tab2 = screen.getByText("Tab 2");
    expect(tab1.getAttribute("aria-selected")).toBe("true");
    expect(tab2.getAttribute("aria-selected")).toBe("false");
  });

  it("renders tab buttons with role=tab", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(3);
  });

  it("renders tablist", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByRole("tablist")).toBeDefined();
  });

  it("renders with pills variant", () => {
    const config: TabsConfig = { ...baseConfig, variant: "pills" };
    const { container } = render(createElement(TabsComponent, { config }), {
      wrapper: createWrapper(store),
    });
    expect(
      container.querySelector('[data-snapshot-component="tabs"]'),
    ).not.toBeNull();
  });

  it("renders with underline variant", () => {
    const config: TabsConfig = { ...baseConfig, variant: "underline" };
    const { container } = render(createElement(TabsComponent, { config }), {
      wrapper: createWrapper(store),
    });
    expect(
      container.querySelector('[data-snapshot-component="tabs"]'),
    ).not.toBeNull();
  });

  it("respects defaultTab config", () => {
    const config: TabsConfig = { ...baseConfig, defaultTab: 1 };
    render(createElement(TabsComponent, { config }), {
      wrapper: createWrapper(store),
    });
    const tab2 = screen.getByText("Tab 2");
    expect(tab2.getAttribute("aria-selected")).toBe("true");
  });

  it("publishes active tab state when id is set", () => {
    const registry = new AtomRegistryImpl();
    const config: TabsConfig = { ...baseConfig, id: "settings-tabs" };
    render(createElement(TabsComponent, { config }), {
      wrapper: createWrapper(store, registry),
    });

    // Switch to tab 2
    fireEvent.click(screen.getByText("Tab 2"));

    const atom = registry.get("settings-tabs");
    expect(atom).toBeDefined();
    const value = registry.store.get(atom!) as {
      activeTab: number;
      label: string;
    };
    expect(value.activeTab).toBe(1);
    expect(value.label).toBe("Tab 2");
  });

  it("renders tab icons when provided", () => {
    const config: TabsConfig = {
      type: "tabs",
      children: [
        { label: "Profile", icon: "user", content: [] },
        { label: "Settings", content: [] },
      ],
      defaultTab: 0,
      variant: "default",
    };
    const { container } = render(createElement(TabsComponent, { config }), {
      wrapper: createWrapper(store),
    });
    expect(container.querySelector("[data-snapshot-tab-icon]")).not.toBeNull();
  });

  it("lazy mounts tab content — unmounted tabs are not rendered", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    // Tab 3 (disabled, never activated) should not be in the DOM
    expect(screen.queryByTestId("child-Content 3")).toBeNull();
  });

  it("keeps previously mounted tab content in DOM after switching", () => {
    render(createElement(TabsComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    // Switch to tab 2
    fireEvent.click(screen.getByText("Tab 2"));
    // Tab 1 content should still be in DOM (just hidden)
    expect(screen.getByTestId("child-Content 1")).toBeDefined();
    // Tab 2 content should be visible
    expect(screen.getByTestId("child-Content 2")).toBeDefined();
  });
});
