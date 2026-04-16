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

import { NavUserMenu } from "../component";

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

describe("NavUserMenu", () => {
  beforeEach(() => {
    execute.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the user trigger and email in the open panel", () => {
    renderWithContext(
      <NavUserMenu
        config={{
          type: "nav-user-menu",
          showEmail: true,
          mode: "full",
        }}
      />,
      { user: { name: "Alice", email: "alice@test.com" } },
    );

    fireEvent.click(screen.getByRole("button", { name: /Alice/ }));
    expect(screen.getByText("alice@test.com")).toBeTruthy();
  });

  it("uses a positioned root so the floating panel is anchored structurally", () => {
    const { container } = renderWithContext(
      <NavUserMenu
        config={{
          type: "nav-user-menu",
          mode: "full",
        }}
      />,
      { user: { name: "Alice" } },
    );

    const root = container.querySelector('[data-snapshot-id="nav-user-menu-root"]');
    expect((root as HTMLElement | null)?.style.position).toBe("relative");
  });

  it("applies component-level root styling through the canonical root surface", () => {
    const { container } = renderWithContext(
      <NavUserMenu
        config={{
          type: "nav-user-menu",
          className: "user-menu-root",
        }}
      />,
      { user: { name: "Alice" } },
    );

    expect(
      container
        .querySelector('[data-snapshot-id="nav-user-menu-root"]')
        ?.classList.contains("user-menu-root"),
    ).toBe(true);
  });

  it("executes menu item actions", () => {
    renderWithContext(
      <NavUserMenu
        config={{
          type: "nav-user-menu",
          items: [
            {
              label: "Sign out",
              action: { type: "navigate", to: "/logout" },
            },
          ],
        }}
      />,
      { user: { name: "Alice" } },
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(execute).toHaveBeenCalledWith({ type: "navigate", to: "/logout" });
  });

  it("applies canonical slot styling to email and avatar image surfaces", () => {
    const { container } = renderWithContext(
      <NavUserMenu
        config={{
          type: "nav-user-menu",
          showEmail: true,
          slots: {
            email: { className: "user-email-slot" },
            avatarImage: { className: "user-avatar-image-slot" },
          },
        }}
      />,
      { user: { name: "Alice", email: "alice@test.com", avatar: "/alice.png" } },
    );

    fireEvent.click(screen.getByRole("button"));

    expect(
      container
        .querySelector('[data-snapshot-id="nav-user-menu-email"]')
        ?.classList.contains("user-email-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="nav-user-menu-avatar-image"]')
        ?.classList.contains("user-avatar-image-slot"),
    ).toBe(true);
  });

  it("returns null when no user exists", () => {
    renderWithContext(<NavUserMenu config={{ type: "nav-user-menu" }} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
