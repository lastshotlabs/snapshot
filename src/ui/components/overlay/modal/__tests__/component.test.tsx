// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { ModalComponent } from "../component";
import { registerComponent } from "../../../../manifest/component-registry";
import {
  modalPayloadAtom,
  modalStackAtom,
} from "../../../../actions/modal-manager";
import { createStore } from "jotai/vanilla";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { AtomRegistryImpl } from "../../../../state/registry";
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

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    store = createStore();
    registerComponent("test-child", TestChild);
  });

  const baseConfig: ModalConfig = {
    type: "modal",
    id: "test-modal",
    title: "Test Modal",
    size: "md",
    trapFocus: true,
    returnFocus: true,
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
    const config: ModalConfig = {
      ...baseConfig,
      className: "modal-root",
    };
    const { container } = render(
      createElement(ModalComponent, { config }),
      { wrapper: createWrapper(store) },
    );
    expect(
      container.querySelector('[data-snapshot-component="modal"]'),
    ).not.toBeNull();
    expect(
      container
        .querySelector('[data-snapshot-id="test-modal-root"]')
        ?.classList.contains("modal-root"),
    ).toBe(true);
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
    const dialogEl = container.querySelector("[data-modal-content]");
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
    const overlay = container.querySelector("[data-modal-overlay]");
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

  it("uses shared button controls for close and footer actions", () => {
    store.set(modalStackAtom, ["test-modal"]);
    const config: ModalConfig = {
      ...baseConfig,
      footer: {
        actions: [{ label: "Save", dismiss: true }],
      },
    };

    render(createElement(ModalComponent, { config }), {
      wrapper: createWrapper(store),
    });

    expect(screen.getByTestId("modal-close").getAttribute("data-sn-button")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Save" }).getAttribute("data-sn-button"),
    ).not.toBeNull();
  });

  it("renders without title when none provided", () => {
    store.set(modalStackAtom, ["no-title-modal"]);
    const config: ModalConfig = {
      type: "modal",
      id: "no-title-modal",
      size: "md",
      trapFocus: true,
      returnFocus: true,
      content: [{ type: "test-child", text: "Body" }],
    };
    const { container } = render(createElement(ModalComponent, { config }), {
      wrapper: createWrapper(store),
    });
    expect(container.querySelector("[data-modal-header]")).toBeNull();
  });

  it("renders with full size", () => {
    store.set(modalStackAtom, ["full-modal"]);
    const config: ModalConfig = {
      type: "modal",
      id: "full-modal",
      size: "full",
      trapFocus: true,
      returnFocus: true,
      content: [],
    };
    const { container } = render(createElement(ModalComponent, { config }), {
      wrapper: createWrapper(store),
    });
    const dialog = container.querySelector("[data-modal-content]");
    expect(dialog).not.toBeNull();
  });

  it("runs lifecycle actions with overlay payload and result context", async () => {
    const appRegistry = new AtomRegistryImpl();
    const pageRegistry = new AtomRegistryImpl();
    store.set(modalStackAtom, ["test-modal"]);
    store.set(modalPayloadAtom, {
      "test-modal": { userId: "42" },
    });

    const config: ModalConfig = {
      ...baseConfig,
      onOpen: {
        type: "set-value",
        target: "global.overlayOpened",
        value: "{overlay.payload.userId}",
      },
      onClose: {
        type: "set-value",
        target: "global.overlayClosed",
        value: "{overlay.result.saved}",
      },
      footer: {
        actions: [
          {
            label: "Save",
            action: {
              type: "close-modal",
              modal: "test-modal",
              result: { saved: true },
            },
          },
        ],
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(
        Provider,
        { store },
        createElement(
          AppRegistryContext.Provider,
          { value: appRegistry },
          createElement(
            PageRegistryContext.Provider,
            { value: pageRegistry },
            children,
          ),
        ),
      );

    render(createElement(ModalComponent, { config }), { wrapper });

    expect(appRegistry.store.get(appRegistry.register("overlayOpened"))).toBe(
      "42",
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(appRegistry.store.get(appRegistry.register("overlayClosed"))).toBe(
      true,
    );
  });
});
