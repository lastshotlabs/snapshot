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

const navigate = vi.fn();

vi.mock("../../../../manifest/runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../manifest/runtime")>();
  return {
    ...actual,
    useManifestRuntime: () => null,
    useRouteRuntime: () => ({
      currentPath: "/",
      navigate,
    }),
    useOverlayRuntime: () => null,
  };
});

import { NavLink } from "../component";

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

describe("NavLink", () => {
  beforeEach(() => {
    navigate.mockClear();
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the resolved label and badge", () => {
    renderWithContext(
      <NavLink
        config={{
          type: "nav-link",
          label: { from: "global.nav.label" },
          path: "/inbox",
          badge: { from: "global.nav.badge" },
        }}
      />,
      { nav: { label: "Inbox", badge: 4 } },
    );

    expect(screen.getByText("Inbox")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("executes navigate on click", () => {
    renderWithContext(
      <NavLink
        config={{
          type: "nav-link",
          label: "Settings",
          path: "/settings",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(navigate).toHaveBeenCalledWith("/settings");
  });

  it("hides when authentication requirements do not match", () => {
    renderWithContext(
      <NavLink
        config={{
          type: "nav-link",
          label: "Account",
          path: "/account",
          authenticated: true,
        }}
      />,
    );

    expect(screen.queryByText("Account")).toBeNull();
  });
});
