// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { DrawerComponent } from "../component";
import { registerComponent } from "../../../../manifest/component-registry";
import { modalStackAtom } from "../../../../actions/modal-manager";
import { createStore } from "jotai/vanilla";
import type { DrawerConfig } from "../schema";

function TestChild({ config }: { config: Record<string, unknown> }) {
  return createElement(
    "div",
    { "data-testid": "drawer-child" },
    config.text as string,
  );
}

function createWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(Provider, { store }, children);
  };
}

describe("DrawerComponent", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    registerComponent("test-child", TestChild);
  });

  const baseConfig: DrawerConfig = {
    type: "drawer",
    id: "test-drawer",
    title: "User Details",
    size: "md",
    side: "right",
    content: [{ type: "test-child", text: "Drawer content" }],
  };

  it("renders nothing when drawer is not open", () => {
    const { container } = render(
      createElement(DrawerComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    expect(
      container.querySelector('[data-snapshot-component="drawer"]'),
    ).toBeNull();
  });

  it("renders when drawer is open", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    const { container } = render(
      createElement(DrawerComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    expect(
      container.querySelector('[data-snapshot-component="drawer"]'),
    ).not.toBeNull();
  });

  it("renders title", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    render(createElement(DrawerComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByText("User Details")).toBeDefined();
  });

  it("renders child components", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    render(createElement(DrawerComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByTestId("drawer-child")).toBeDefined();
  });

  it("sets data-side attribute", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    const { container } = render(
      createElement(DrawerComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const panel = container.querySelector("[data-snapshot-drawer-panel]");
    expect(panel?.getAttribute("data-side")).toBe("right");
  });

  it("renders left-side drawer", () => {
    store.set(modalStackAtom, ["left-drawer"]);
    const config: DrawerConfig = {
      ...baseConfig,
      id: "left-drawer",
      side: "left",
    };
    const { container } = render(createElement(DrawerComponent, { config }), {
      wrapper: createWrapper(store),
    });
    const panel = container.querySelector("[data-snapshot-drawer-panel]");
    expect(panel?.getAttribute("data-side")).toBe("left");
  });

  it("closes on escape key", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    const { container } = render(
      createElement(DrawerComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const panel = container.querySelector("[data-snapshot-drawer-panel]");
    fireEvent.keyDown(panel!, { key: "Escape" });
    expect(store.get(modalStackAtom)).toEqual([]);
  });

  it("closes on overlay click", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    const { container } = render(
      createElement(DrawerComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const overlay = container.querySelector("[data-snapshot-drawer-overlay]");
    fireEvent.click(overlay!);
    expect(store.get(modalStackAtom)).toEqual([]);
  });

  it("closes on close button click", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    render(createElement(DrawerComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    fireEvent.click(screen.getByLabelText("Close"));
    expect(store.get(modalStackAtom)).toEqual([]);
  });

  it("has correct ARIA attributes", () => {
    store.set(modalStackAtom, ["test-drawer"]);
    const { container } = render(
      createElement(DrawerComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
  });
});
