// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { ModalComponent } from "../component";
import { registerComponent } from "../../../../manifest/component-registry";
import { modalStackAtom } from "../../../../actions/modal-manager";
import { createStore } from "jotai/vanilla";
import type { ModalConfig } from "../schema";

/** A simple child component for testing recursive rendering. */
function TestChild({ config }: { config: Record<string, unknown> }) {
  return createElement(
    "div",
    { "data-testid": "test-child" },
    config.text as string,
  );
}

function createWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(Provider, { store }, children);
  };
}

describe("ModalComponent", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    registerComponent("test-child", TestChild);
  });

  const baseConfig: ModalConfig = {
    type: "modal",
    id: "test-modal",
    title: "Test Modal",
    size: "md",
    content: [{ type: "test-child", text: "Hello from modal" }],
  };

  it("renders nothing when modal is not open", () => {
    const { container } = render(
      createElement(ModalComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    expect(
      container.querySelector('[data-snapshot-component="modal"]'),
    ).toBeNull();
  });

  it("renders when modal is open", () => {
    store.set(modalStackAtom, ["test-modal"]);
    const { container } = render(
      createElement(ModalComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    expect(
      container.querySelector('[data-snapshot-component="modal"]'),
    ).not.toBeNull();
  });

  it("renders title", () => {
    store.set(modalStackAtom, ["test-modal"]);
    render(createElement(ModalComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByText("Test Modal")).toBeDefined();
  });

  it("renders child components via ComponentRenderer", () => {
    store.set(modalStackAtom, ["test-modal"]);
    render(createElement(ModalComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    expect(screen.getByTestId("test-child")).toBeDefined();
    expect(screen.getByText("Hello from modal")).toBeDefined();
  });

  it("has correct ARIA attributes", () => {
    store.set(modalStackAtom, ["test-modal"]);
    const { container } = render(
      createElement(ModalComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.getAttribute("aria-label")).toBe("Test Modal");
  });

  it("closes on escape key", () => {
    store.set(modalStackAtom, ["test-modal"]);
    const { container } = render(
      createElement(ModalComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const dialogEl = container.querySelector("[data-snapshot-modal-dialog]");
    expect(dialogEl).not.toBeNull();
    fireEvent.keyDown(dialogEl!, { key: "Escape" });
    // After closing, modal stack should be empty
    expect(store.get(modalStackAtom)).toEqual([]);
  });

  it("closes on overlay click", () => {
    store.set(modalStackAtom, ["test-modal"]);
    const { container } = render(
      createElement(ModalComponent, { config: baseConfig }),
      { wrapper: createWrapper(store) },
    );
    const overlay = container.querySelector("[data-snapshot-modal-overlay]");
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);
    expect(store.get(modalStackAtom)).toEqual([]);
  });

  it("closes on close button click", () => {
    store.set(modalStackAtom, ["test-modal"]);
    render(createElement(ModalComponent, { config: baseConfig }), {
      wrapper: createWrapper(store),
    });
    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    expect(store.get(modalStackAtom)).toEqual([]);
  });

  it("renders without title when none provided", () => {
    store.set(modalStackAtom, ["no-title-modal"]);
    const config: ModalConfig = {
      type: "modal",
      id: "no-title-modal",
      size: "md",
      content: [{ type: "test-child", text: "Body" }],
    };
    const { container } = render(createElement(ModalComponent, { config }), {
      wrapper: createWrapper(store),
    });
    expect(container.querySelector("[data-snapshot-modal-header]")).toBeNull();
  });

  it("renders with full size", () => {
    store.set(modalStackAtom, ["full-modal"]);
    const config: ModalConfig = {
      type: "modal",
      id: "full-modal",
      size: "full",
      content: [],
    };
    const { container } = render(createElement(ModalComponent, { config }), {
      wrapper: createWrapper(store),
    });
    const dialog = container.querySelector("[data-snapshot-modal-dialog]");
    expect(dialog).not.toBeNull();
  });
});
