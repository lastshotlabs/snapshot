// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import { afterEach, describe, expect, it, vi } from "vitest";
import { compileManifest } from "../../../../manifest/compiler";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
} from "../../../../manifest/runtime";
import { BreadcrumbComponent } from "../component";

const refValues: Record<string, unknown> = {
  "breadcrumbState.home": "Resolved Home",
  "breadcrumbState.users": "Resolved Users",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }

  if (
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>) &&
    typeof (value as unknown as { from: unknown }).from === "string"
  ) {
    return refValues[(value as unknown as { from: string }).from] as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }

  return value;
}

vi.mock("../../../../context/hooks", async () => {
  const actual = await vi.importActual("../../../../context/hooks");

  return {
    ...actual,
    useResolveFrom: <T,>(value: T) => resolveRefs(value),
  };
});

describe("BreadcrumbComponent", () => {
  afterEach(() => {
    cleanup();
  });

  it("derives breadcrumb items from the current route and navigates in-app", () => {
    const navigate = vi.fn();
    const manifest = compileManifest({
      app: {
        home: "/",
      },
      routes: [
        {
          id: "home",
          path: "/",
          title: "Home",
          breadcrumb: "Home",
          content: [{ type: "heading", text: "Home Page" }],
        },
        {
          id: "users",
          path: "/users",
          title: "Users",
          breadcrumb: "Users",
          content: [{ type: "heading", text: "Users List" }],
        },
        {
          id: "user-detail",
          path: "/users/{id}",
          title: "User {params.id}",
          breadcrumb: "User {params.id}",
          content: [{ type: "heading", text: "User Detail" }],
        },
      ],
    });
    const route = manifest.routes.find(
      (candidate) => candidate.id === "user-detail",
    );
    expect(route).toBeDefined();

    const homeRoute = manifest.routes.find((r) => r.id === "home") ?? null;
    const usersRoute = manifest.routes.find((r) => r.id === "users") ?? null;

    render(
      <Provider store={createStore()}>
        <ManifestRuntimeProvider manifest={manifest}>
          <RouteRuntimeProvider
            value={{
              currentPath: "/users/42",
              currentRoute: route ?? null,
              match: {
                route: route ?? null,
                params: { id: "42" },
                parents: [homeRoute, usersRoute].filter(Boolean) as typeof manifest.routes,
                activeRoutes: [homeRoute, usersRoute, route].filter(Boolean) as typeof manifest.routes,
              },
              params: { id: "42" },
              query: {},
              navigate,
              isPreloading: false,
            }}
          >
            <BreadcrumbComponent
              config={{ type: "breadcrumb", source: "route" }}
            />
          </RouteRuntimeProvider>
        </ManifestRuntimeProvider>
      </Provider>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Users" })).toBeDefined();
    expect(screen.getByText("User 42")).toBeDefined();

    fireEvent.click(screen.getByRole("link", { name: "Users" }));
    expect(navigate).toHaveBeenCalledWith("/users");
  });

  it("applies canonical link slot styling without imperative hover handlers", () => {
    const navigate = vi.fn();
    const manifest = compileManifest({
      app: { home: "/" },
      routes: [
        {
          id: "home",
          path: "/",
          title: "Home",
          breadcrumb: "Home",
          content: [{ type: "heading", text: "Home Page" }],
        },
        {
          id: "users",
          path: "/users",
          title: "Users",
          breadcrumb: "Users",
          content: [{ type: "heading", text: "Users List" }],
        },
      ],
    });
    const route = manifest.routes.find((candidate) => candidate.id === "users");

    render(
      <Provider store={createStore()}>
        <ManifestRuntimeProvider manifest={manifest}>
          <RouteRuntimeProvider
            value={{
              currentPath: "/users",
              currentRoute: route ?? null,
              match: {
                route: route ?? null,
                params: {},
                parents: [],
                activeRoutes: [route].filter(Boolean) as typeof manifest.routes,
              },
              params: {},
              query: {},
              navigate,
              isPreloading: false,
            }}
          >
            <BreadcrumbComponent
              config={{
                type: "breadcrumb",
                className: "component-root",
                source: "manual",
                items: [
                  { label: "Home", path: "/" },
                  { label: "Users" },
                ],
                slots: {
                  root: { className: "slot-root" },
                  link: { className: "breadcrumb-link-slot" },
                },
              }}
            />
          </RouteRuntimeProvider>
        </ManifestRuntimeProvider>
      </Provider>,
    );

    const root = screen.getByTestId("breadcrumb");
    expect(root.className).toContain("component-root");
    expect(root.className).toContain("slot-root");
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.className).toContain("breadcrumb-link-slot");
  });

  it("renders ref-backed manual labels", () => {
    render(
      <Provider store={createStore()}>
        <ManifestRuntimeProvider
          manifest={compileManifest({
            routes: [
              {
                id: "home",
                path: "/",
                title: "Home",
                content: [{ type: "heading", text: "Home" }],
              },
            ],
          })}
        >
          <RouteRuntimeProvider
            value={{
              currentPath: "/users",
              currentRoute: null,
              match: {
                route: null,
                params: {},
                parents: [],
                activeRoutes: [],
              } as never,
              params: {},
              query: {},
              navigate: vi.fn(),
              isPreloading: false,
            }}
          >
            <BreadcrumbComponent
              config={{
                type: "breadcrumb",
                items: [
                  { label: { from: "breadcrumbState.home" } as never, path: "/" },
                  { label: { from: "breadcrumbState.users" } as never },
                ],
              }}
            />
          </RouteRuntimeProvider>
        </ManifestRuntimeProvider>
      </Provider>,
    );

    expect(screen.getByRole("link", { name: "Resolved Home" })).toBeDefined();
    expect(screen.getByText("Resolved Users")).toBeDefined();
  });
});
