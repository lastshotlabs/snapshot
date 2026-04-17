// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import { atom } from "jotai";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid={`popover-child-${config.id ?? config.type}`}>{config.type}</div>
  ),
}));

import { Popover } from "../component";

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

describe("Popover", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens and renders semantic popover sections", () => {
    renderWithContext(
      <Popover
        config={{
          type: "popover",
          trigger: "More",
          title: "Details",
          description: "Context",
          content: [{ type: "text", id: "body" } as never],
          footer: [{ type: "text", id: "footer" } as never],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("Context")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close popover" })).toBeTruthy();
    expect(screen.getByTestId("popover-child-body")).toBeTruthy();
    expect(screen.getByTestId("popover-child-footer")).toBeTruthy();
  });

  it("resolves ref-backed title and description", () => {
    renderWithContext(
      <Popover
        config={{
          type: "popover",
          trigger: "More",
          title: { from: "global.copy.popoverTitle" },
          description: { from: "global.copy.popoverDescription" },
        }}
      />,
      {
        copy: {
          popoverTitle: "Resolved title",
          popoverDescription: "Resolved description",
        },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByText("Resolved title")).toBeTruthy();
    expect(screen.getByText("Resolved description")).toBeTruthy();
  });

  it("respects visible=false", () => {
    renderWithContext(
      <Popover
        config={{
          type: "popover",
          trigger: "More",
          visible: false,
        }}
      />,
    );

    expect(screen.queryByRole("button", { name: "More" })).toBeNull();
  });

  it("uses a positioned root so the floating panel is anchored correctly", () => {
    const { container } = renderWithContext(
      <Popover
        config={{
          type: "popover",
          className: "component-root",
          trigger: "More",
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-id="popover-root"]');
    expect((root as HTMLElement | null)?.className).toContain("component-root");
    expect((root as HTMLElement | null)?.style.position).toBe("relative");
  });
});
