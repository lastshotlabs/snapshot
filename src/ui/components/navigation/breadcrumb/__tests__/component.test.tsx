// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "jotai/react";
import { createStore } from "jotai/vanilla";
import { describe, expect, it, vi } from "vitest";
import { compileManifest } from "../../../../manifest/compiler";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
} from "../../../../manifest/runtime";
import { BreadcrumbComponent } from "../component";

describe("BreadcrumbComponent", () => {
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
    const route = manifest.routes.find((candidate) => candidate.id === "user-detail");
    expect(route).toBeDefined();

    render(
      <Provider store={createStore()}>
        <ManifestRuntimeProvider manifest={manifest}>
          <RouteRuntimeProvider
            value={{
              currentPath: "/users/42",
              currentRoute: route ?? null,
              params: { id: "42" },
              navigate,
              isPreloading: false,
            }}
          >
            <BreadcrumbComponent config={{ type: "breadcrumb", source: "route" }} />
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
});
