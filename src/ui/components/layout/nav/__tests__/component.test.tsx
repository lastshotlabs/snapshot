// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import { atom } from "jotai";
import { renderToStaticMarkup } from "react-dom/server";
import { Nav } from "../component";
import type { NavConfig } from "../schema";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import type { AtomRegistry } from "../../../../context/types";

/**
 * Create a mock AtomRegistry backed by a Jotai store.
 */
function createMockRegistry(
  initialValues?: Record<string, unknown>,
): AtomRegistry {
  const store = createStore();
  const atoms = new Map<string, ReturnType<typeof atom<unknown>>>();

  if (initialValues) {
    for (const [id, value] of Object.entries(initialValues)) {
      const a = atom<unknown>(value);
      atoms.set(id, a);
      store.set(a, value);
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

  return {
    ...render(
      <AppRegistryContext.Provider value={appRegistry}>
        <JotaiProvider store={appRegistry.store}>
          <PageRegistryContext.Provider value={pageRegistry}>
            {ui}
          </PageRegistryContext.Provider>
        </JotaiProvider>
      </AppRegistryContext.Provider>,
    ),
    appRegistry,
  };
}

describe("Nav component", () => {
  const baseConfig: NavConfig = {
    type: "nav",
    items: [
      { label: "Home", path: "/" },
      { label: "Users", path: "/users" },
      { label: "Settings", path: "/settings" },
    ],
  };

  it("renders nav items", () => {
    const { getByText } = renderWithContext(
      <Nav config={baseConfig} pathname="/" />,
    );
    expect(getByText("Home")).not.toBeNull();
    expect(getByText("Users")).not.toBeNull();
    expect(getByText("Settings")).not.toBeNull();
  });

  it("marks active item with aria-current=page", () => {
    const { container } = renderWithContext(
      <Nav config={baseConfig} pathname="/users" />,
    );
    const activeLink = container.querySelector('[aria-current="page"]');
    expect(activeLink).not.toBeNull();
    expect(activeLink?.textContent).toContain("Users");
  });

  it("calls onNavigate when a nav item is clicked", () => {
    const onNavigate = vi.fn();
    const { getByText } = renderWithContext(
      <Nav config={baseConfig} pathname="/" onNavigate={onNavigate} />,
    );
    fireEvent.click(getByText("Settings"));
    expect(onNavigate).toHaveBeenCalledWith("/settings");
  });

  it("renders icon placeholders", () => {
    const config: NavConfig = {
      type: "nav",
      items: [{ label: "Home", path: "/", icon: "home" }],
    };
    const { container } = renderWithContext(
      <Nav config={config} pathname="/" />,
    );
    const icon = container.querySelector("[data-nav-icon]");
    expect(icon).not.toBeNull();
    expect(icon?.querySelector("svg")).not.toBeNull();
  });

  it("renders static badge values", () => {
    const config: NavConfig = {
      type: "nav",
      items: [{ label: "Inbox", path: "/inbox", badge: 3 }],
    };
    const { container } = renderWithContext(
      <Nav config={config} pathname="/" />,
    );
    const badge = container.querySelector("[data-nav-badge]");
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe("3");
  });

  it("does not render badge when value is 0", () => {
    const config: NavConfig = {
      type: "nav",
      items: [{ label: "Inbox", path: "/inbox", badge: 0 }],
    };
    const { container } = renderWithContext(
      <Nav config={config} pathname="/" />,
    );
    const badge = container.querySelector("[data-nav-badge]");
    expect(badge).toBeNull();
  });

  describe("role-based filtering", () => {
    it("hides items when user lacks required role", () => {
      const config: NavConfig = {
        type: "nav",
        items: [
          { label: "Home", path: "/" },
          { label: "Admin", path: "/admin", roles: ["admin"] },
        ],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", role: "viewer" } },
      );
      expect(queryByText("Home")).not.toBeNull();
      expect(queryByText("Admin")).toBeNull();
    });

    it("shows items when user has required role", () => {
      const config: NavConfig = {
        type: "nav",
        items: [
          { label: "Home", path: "/" },
          { label: "Admin", path: "/admin", roles: ["admin"] },
        ],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", role: "admin" } },
      );
      expect(queryByText("Home")).not.toBeNull();
      expect(queryByText("Admin")).not.toBeNull();
    });

    it("shows items when no roles are specified", () => {
      const config: NavConfig = {
        type: "nav",
        items: [{ label: "Public", path: "/public" }],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", role: "viewer" } },
      );
      expect(queryByText("Public")).not.toBeNull();
    });

    it("shows items when user is not logged in and no roles required", () => {
      const config: NavConfig = {
        type: "nav",
        items: [{ label: "Public", path: "/public" }],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      expect(queryByText("Public")).not.toBeNull();
    });

    it("shows authenticated-only items when a user exists", () => {
      const config: NavConfig = {
        type: "nav",
        items: [{ label: "Account", path: "/account", authenticated: true }],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", role: "member" } },
      );
      expect(queryByText("Account")).not.toBeNull();
    });

    it("hides authenticated-only items when no user exists", () => {
      const config: NavConfig = {
        type: "nav",
        items: [{ label: "Account", path: "/account", authenticated: true }],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      expect(queryByText("Account")).toBeNull();
    });

    it("shows guest-only items when no user exists", () => {
      const config: NavConfig = {
        type: "nav",
        items: [{ label: "Sign In", path: "/login", authenticated: false }],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      expect(queryByText("Sign In")).not.toBeNull();
    });

    it("hides guest-only items when a user exists", () => {
      const config: NavConfig = {
        type: "nav",
        items: [{ label: "Sign In", path: "/login", authenticated: false }],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice" } },
      );
      expect(queryByText("Sign In")).toBeNull();
    });
  });

  describe("state-driven visibility and disabled states", () => {
    it("hides items when visible resolves to false", () => {
      const config: NavConfig = {
        type: "nav",
        items: [
          {
            label: "Billing",
            path: "/billing",
            visible: { from: "global.flags.showBilling" },
          },
        ],
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { flags: { showBilling: false } },
      );
      expect(queryByText("Billing")).toBeNull();
    });

    it("disables items when disabled resolves to true", () => {
      const onNavigate = vi.fn();
      const config: NavConfig = {
        type: "nav",
        items: [
          {
            label: "Reports",
            path: "/reports",
            disabled: { from: "global.flags.reportsDisabled" },
          },
        ],
      };
      const { getByRole } = renderWithContext(
        <Nav config={config} pathname="/" onNavigate={onNavigate} />,
        { flags: { reportsDisabled: true } },
      );
      const button = getByRole("button", { name: "Reports" });
      expect(button.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(button);
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe("active state detection", () => {
    it("marks exact path match as active", () => {
      const { container } = renderWithContext(
        <Nav config={baseConfig} pathname="/users" />,
      );
      const activeItem = container.querySelector('[data-active="true"]');
      expect(activeItem).not.toBeNull();
      expect(activeItem?.textContent).toContain("Users");
    });

    it("does not mark non-matching paths as active", () => {
      const { container } = renderWithContext(
        <Nav config={baseConfig} pathname="/other" />,
      );
      const activeItems = container.querySelectorAll('[data-active="true"]');
      expect(activeItems.length).toBe(0);
    });
  });

  describe("collapse toggle", () => {
    it("renders toggle button when collapsible", () => {
      const { container } = renderWithContext(
        <Nav config={baseConfig} pathname="/" />,
      );
      const toggle = container.querySelector("[data-nav-toggle]");
      expect(toggle).not.toBeNull();
    });

    it("does not render toggle when collapsible is false", () => {
      const config: NavConfig = {
        ...baseConfig,
        collapsible: false,
      };
      const { container } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      const toggle = container.querySelector("[data-nav-toggle]");
      expect(toggle).toBeNull();
    });

    it("toggles collapsed state on click", () => {
      const { container } = renderWithContext(
        <Nav config={baseConfig} pathname="/" />,
      );
      const toggle = container.querySelector(
        "[data-nav-toggle]",
      ) as HTMLButtonElement;
      const nav = container.querySelector('[data-snapshot-component="nav"]');

      // Initially expanded (isCollapsed defaults to false)
      expect(nav?.getAttribute("data-collapsed")).toBeNull();

      // Toggle collapsed
      fireEvent.click(toggle);
      expect(nav?.getAttribute("data-collapsed")).toBe("true");

      // Toggle open again
      fireEvent.click(toggle);
      expect(nav?.getAttribute("data-collapsed")).toBeNull();
    });
  });

  describe("user menu", () => {
    it("renders user menu when userMenu is true and user exists", () => {
      const config: NavConfig = {
        ...baseConfig,
        userMenu: true,
      };
      const { container } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", email: "alice@test.com" } },
      );
      const userMenu = container.querySelector("[data-nav-user-menu]");
      expect(userMenu).not.toBeNull();
    });

    it("does not render user menu when no user", () => {
      const config: NavConfig = {
        ...baseConfig,
        userMenu: true,
      };
      const { container } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      const userMenu = container.querySelector("[data-nav-user-menu]");
      expect(userMenu).toBeNull();
    });

    it("renders user name in user menu", () => {
      const config: NavConfig = {
        ...baseConfig,
        userMenu: true,
      };
      const { getByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice" } },
      );
      expect(getByText("Alice")).not.toBeNull();
    });

    it("renders email when showEmail is true", () => {
      const config: NavConfig = {
        ...baseConfig,
        userMenu: { showEmail: true },
      };
      const { getByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", email: "alice@test.com" } },
      );
      expect(getByText("alice@test.com")).not.toBeNull();
    });

    it("does not render email by default", () => {
      const config: NavConfig = {
        ...baseConfig,
        userMenu: true,
      };
      const { queryByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
        { user: { name: "Alice", email: "alice@test.com" } },
      );
      expect(queryByText("alice@test.com")).toBeNull();
    });
  });

  describe("logo", () => {
    it("renders logo text", () => {
      const config: NavConfig = {
        ...baseConfig,
        logo: { text: "MyApp" },
      };
      const { getByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      expect(getByText("MyApp")).not.toBeNull();
    });

    it("renders logo image", () => {
      const config: NavConfig = {
        ...baseConfig,
        logo: { src: "/logo.png", text: "MyApp" },
      };
      const { container } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      expect(img?.getAttribute("src")).toBe("/logo.png");
    });

    it("navigates on logo click when path is set", () => {
      const onNavigate = vi.fn();
      const config: NavConfig = {
        ...baseConfig,
        logo: { text: "MyApp", path: "/" },
      };
      const { getByText } = renderWithContext(
        <Nav config={config} pathname="/users" onNavigate={onNavigate} />,
      );
      fireEvent.click(getByText("MyApp"));
      expect(onNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("nested children", () => {
    it("renders child nav items", () => {
      const config: NavConfig = {
        type: "nav",
        items: [
          {
            label: "Settings",
            children: [
              { label: "Profile", path: "/settings/profile" },
              { label: "Security", path: "/settings/security" },
            ],
          },
        ],
      };
      const { getByText } = renderWithContext(
        <Nav config={config} pathname="/" />,
      );
      expect(getByText("Profile")).not.toBeNull();
      expect(getByText("Security")).not.toBeNull();
    });
  });

  it("sets data-snapshot-component=nav", () => {
    const { container } = renderWithContext(
      <Nav config={baseConfig} pathname="/" />,
    );
    const nav = container.querySelector('[data-snapshot-component="nav"]');
    expect(nav).not.toBeNull();
  });

  it("renders to static markup without throwing", () => {
    expect(() =>
      renderToStaticMarkup(<Nav config={baseConfig} pathname="/" />),
    ).not.toThrow();
  });
});
