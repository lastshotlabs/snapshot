// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import { atom } from "jotai";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";

const execute = vi.fn();

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => execute,
}));

import { ContextMenu } from "../component";

function createMockRegistry(initialValues?: Record<string, unknown>) {
  const store = createStore();
  const atoms = new Map<string, ReturnType<typeof atom<unknown>>>();

  if (initialValues) {
    for (const [id, value] of Object.entries(initialValues)) {
      const target = atom<unknown>(value);
      atoms.set(id, target);
      store.set(target, value);
    }
  }

  return {
    register(id: string) {
      if (!atoms.has(id)) {
        atoms.set(id, atom<unknown>(undefined));
      }
      return atoms.get(id)!;
    },
    get(id: string) {
      return atoms.get(id);
    },
    unregister(id: string) {
      atoms.delete(id);
    },
    keys() {
      return Array.from(atoms.keys());
    },
    store,
  };
}

function renderWithContext(
  ui: React.ReactElement,
  globals?: Record<string, unknown>,
) {
  const appRegistry = createMockRegistry(globals);
  const pageRegistry = createMockRegistry();

  return render(
    <AppRegistryContext.Provider value={appRegistry}>
      <JotaiProvider store={appRegistry.store}>
        <PageRegistryContext.Provider value={pageRegistry}>
          {ui}
        </PageRegistryContext.Provider>
      </JotaiProvider>
    </AppRegistryContext.Provider>,
  );
}

describe("ContextMenu", () => {
  beforeEach(() => {
    execute.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("opens on right click and executes menu actions", () => {
    renderWithContext(
      <ContextMenu
        config={{
          type: "context-menu",
          triggerText: "Open",
          items: [
            {
              type: "item",
              label: "Edit",
              action: { type: "navigate", to: "/edit" },
            },
          ],
        }}
      />,
    );

    fireEvent.contextMenu(screen.getByTestId("context-menu-area"), {
      clientX: 12,
      clientY: 18,
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(execute).toHaveBeenCalledWith({ type: "navigate", to: "/edit" }, undefined);
  });

  it("respects visible=false", () => {
    renderWithContext(
      <ContextMenu
        config={{
          type: "context-menu",
          triggerText: "Open",
          visible: false,
        }}
      />,
    );

    expect(screen.queryByTestId("context-menu-area")).toBeNull();
  });
});
