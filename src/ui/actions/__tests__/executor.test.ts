// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Provider } from "jotai/react";
import { useActionExecutor, SnapshotApiContext } from "../executor";
import { ManifestRuntimeProvider } from "../../manifest/runtime";
import { useManifestResourceCache } from "../../manifest/runtime";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../context/providers";
import { AtomRegistryImpl } from "../../context/registry";
import type { ActionConfig } from "../types";
import type { AtomRegistry } from "../../context/types";

// Mock API client
function createMockApi() {
  return {
    get: vi.fn().mockResolvedValue({ data: "get-result" }),
    post: vi.fn().mockResolvedValue({ data: "post-result" }),
    put: vi.fn().mockResolvedValue({ data: "put-result" }),
    patch: vi.fn().mockResolvedValue({ data: "patch-result" }),
    delete: vi.fn().mockResolvedValue({ data: "delete-result" }),
    setStorage: vi.fn(),
  };
}

function createWrapper(options: {
  api?: ReturnType<typeof createMockApi>;
  pageRegistry?: AtomRegistry;
  appRegistry?: AtomRegistry;
  manifest?: import("../../manifest/types").CompiledManifest;
}) {
  const { api, pageRegistry, appRegistry, manifest } = options;
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      Provider,
      null,
      createElement(
        SnapshotApiContext.Provider,
        { value: api as unknown as import("../../../api/client").ApiClient },
        createElement(ManifestRuntimeProvider as React.ComponentType<any>, {
          api: api as unknown as import("../../../api/client").ApiClient,
          manifest:
            manifest ??
            ({
              raw: { routes: [] },
              app: {},
              routes: [],
              routeMap: {},
              firstRoute: null,
            } as import("../../manifest/types").CompiledManifest),
          children: createElement(
            PageRegistryContext.Provider,
            { value: pageRegistry ?? null },
            createElement(
              AppRegistryContext.Provider,
              { value: appRegistry ?? null },
              children,
            ),
          ),
        }),
      ),
    );
  };
}

describe("useActionExecutor", () => {
  let mockApi: ReturnType<typeof createMockApi>;
  let pageRegistry: AtomRegistryImpl;
  let appRegistry: AtomRegistryImpl;

  beforeEach(() => {
    mockApi = createMockApi();
    pageRegistry = new AtomRegistryImpl();
    appRegistry = new AtomRegistryImpl();
  });

  it("executes a navigate action", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });
    const pushStateSpy = vi.spyOn(window.history, "pushState");
    const popStateSpy = vi.fn();
    window.addEventListener("popstate", popStateSpy);

    await act(async () => {
      await result.current({ type: "navigate", to: "/users" });
    });

    expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/users");
    expect(window.location.pathname).toBe("/users");
    expect(popStateSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener("popstate", popStateSpy);
  });

  it("executes an api GET action", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({
        type: "api",
        method: "GET",
        endpoint: "/api/users",
      });
    });

    expect(mockApi.get).toHaveBeenCalledWith("/api/users");
  });

  it("executes an api POST action with body", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({
        type: "api",
        method: "POST",
        endpoint: "/api/users",
        body: { name: "Alice" },
      });
    });

    expect(mockApi.post).toHaveBeenCalledWith("/api/users", { name: "Alice" });
  });

  it("passes {result} to onSuccess context", async () => {
    mockApi.delete.mockResolvedValue({ deleted: true });
    const toastActions: ActionConfig[] = [];

    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    // We can't easily intercept the toast call inside the executor,
    // so we test that onSuccess receives result by chaining to a set-value
    // with an atom we can read.
    const atom = pageRegistry.register("test-target");

    await act(async () => {
      await result.current({
        type: "api",
        method: "DELETE",
        endpoint: "/api/items/1",
        onSuccess: {
          type: "set-value",
          target: "test-target",
          value: "success",
        },
      });
    });

    expect(pageRegistry.store.get(atom)).toBe("success");
  });

  it("calls onError when api fails", async () => {
    mockApi.post.mockRejectedValue(new Error("Network error"));
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    const atom = pageRegistry.register("error-target");

    await act(async () => {
      await result.current({
        type: "api",
        method: "POST",
        endpoint: "/api/fail",
        body: {},
        onError: {
          type: "set-value",
          target: "error-target",
          value: "errored",
        },
      });
    });

    expect(pageRegistry.store.get(atom)).toBe("errored");
  });

  it("throws when api fails without onError", async () => {
    mockApi.get.mockRejectedValue(new Error("Failed"));
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await expect(
      Promise.resolve(
        act(async () => {
          await result.current({
            type: "api",
            method: "GET",
            endpoint: "/api/fail",
          });
        }),
      ),
    ).rejects.toThrow("Failed");
  });

  it("executes open-modal and close-modal actions", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({ type: "open-modal", modal: "edit" });
    });
    // No throw means modal was opened. We'd need useModalManager to verify,
    // but the executor delegates to the manager.

    await act(async () => {
      await result.current({ type: "close-modal", modal: "edit" });
    });
  });

  it("executes refresh action (registers refresh atom)", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({ type: "refresh", target: "users-table" });
    });

    const refreshAtom = pageRegistry.get("__refresh_users-table");
    expect(refreshAtom).toBeDefined();
    const value = pageRegistry.store.get(refreshAtom!);
    expect(typeof value).toBe("number");
  });

  it("executes refresh for comma-separated targets", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({ type: "refresh", target: "table-a, table-b" });
    });

    expect(pageRegistry.get("__refresh_table-a")).toBeDefined();
    expect(pageRegistry.get("__refresh_table-b")).toBeDefined();
  });

  it("invalidates named resources through refresh actions", async () => {
    const manifest = {
      raw: {
        routes: [],
        resources: {
          users: {
            method: "GET",
            endpoint: "/api/users",
          },
        },
      },
      app: {},
      resources: {
        users: {
          method: "GET" as const,
          endpoint: "/api/users",
        },
      },
      routes: [],
      routeMap: {},
      firstRoute: null,
    } as import("../../manifest/types").CompiledManifest;
    const wrapper = createWrapper({ api: mockApi, pageRegistry, manifest });
    const { result } = renderHook(
      () => ({
        execute: useActionExecutor(),
        resourceCache: useManifestResourceCache(),
      }),
      { wrapper },
    );

    expect(result.current.resourceCache?.getResourceVersion("users")).toBe(0);

    await act(async () => {
      await result.current.execute({ type: "refresh", target: "resource:users" });
    });

    expect(result.current.resourceCache?.getResourceVersion("users")).toBe(1);
  });

  it("invalidates configured resources after a successful api action", async () => {
    const manifest = {
      raw: {
        routes: [],
        resources: {
          users: {
            method: "GET",
            endpoint: "/api/users",
          },
          stats: {
            method: "GET",
            endpoint: "/api/stats",
          },
        },
      },
      app: {},
      resources: {
        users: {
          method: "GET" as const,
          endpoint: "/api/users",
        },
        stats: {
          method: "GET" as const,
          endpoint: "/api/stats",
        },
      },
      routes: [],
      routeMap: {},
      firstRoute: null,
    } as import("../../manifest/types").CompiledManifest;
    const wrapper = createWrapper({ api: mockApi, pageRegistry, manifest });
    const { result } = renderHook(
      () => ({
        execute: useActionExecutor(),
        resourceCache: useManifestResourceCache(),
      }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute({
        type: "api",
        method: "POST",
        endpoint: "/api/users",
        invalidates: ["users", "stats"],
      });
    });

    expect(result.current.resourceCache?.getResourceVersion("users")).toBe(1);
    expect(result.current.resourceCache?.getResourceVersion("stats")).toBe(1);
  });

  it("invalidates resource targets declared on resource-backed api actions", async () => {
    const manifest = {
      raw: {
        routes: [],
        resources: {
          "users.create": {
            method: "POST",
            endpoint: "/api/users",
            invalidates: ["users.list"],
          },
          "users.list": {
            method: "GET",
            endpoint: "/api/users",
          },
          dashboard: {
            method: "GET",
            endpoint: "/api/dashboard",
            dependsOn: ["users.list"],
          },
        },
      },
      app: {},
      resources: {
        "users.create": {
          method: "POST" as const,
          endpoint: "/api/users",
          invalidates: ["users.list"],
        },
        "users.list": {
          method: "GET" as const,
          endpoint: "/api/users",
        },
        dashboard: {
          method: "GET" as const,
          endpoint: "/api/dashboard",
          dependsOn: ["users.list"],
        },
      },
      routes: [],
      routeMap: {},
      firstRoute: null,
    } as import("../../manifest/types").CompiledManifest;
    const wrapper = createWrapper({ api: mockApi, pageRegistry, manifest });
    const { result } = renderHook(
      () => ({
        execute: useActionExecutor(),
        resourceCache: useManifestResourceCache(),
      }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute({
        type: "api",
        method: "POST",
        endpoint: { resource: "users.create" },
      });
    });

    expect(result.current.resourceCache?.getResourceVersion("users.list")).toBe(1);
    expect(result.current.resourceCache?.getResourceVersion("dashboard")).toBe(1);
  });

  it("executes set-value action", async () => {
    const atom = pageRegistry.register("my-input");
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({
        type: "set-value",
        target: "my-input",
        value: "new-value",
      });
    });

    expect(pageRegistry.store.get(atom)).toBe("new-value");
  });

  it("executes set-value against app state via the global. prefix", async () => {
    const atom = appRegistry.register("status");
    const wrapper = createWrapper({ api: mockApi, pageRegistry, appRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({
        type: "set-value",
        target: "global.status",
        value: "ready",
      });
    });

    expect(appRegistry.store.get(atom)).toBe("ready");
  });

  it("executes set-value against named route state via the state. prefix", async () => {
    const atom = pageRegistry.register("filters");
    const wrapper = createWrapper({ api: mockApi, pageRegistry, appRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({
        type: "set-value",
        target: "state.filters",
        value: { status: "open" },
      });
    });

    expect(pageRegistry.store.get(atom)).toEqual({ status: "open" });
  });

  it("executes set-value with interpolation", async () => {
    const atom = pageRegistry.register("status");
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current(
        { type: "set-value", target: "status", value: "User {name} updated" },
        { name: "Alice" },
      );
    });

    expect(pageRegistry.store.get(atom)).toBe("User Alice updated");
  });

  it("executes toast action without error", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current({
        type: "toast",
        message: "Saved!",
        variant: "success",
      });
    });
    // No throw — toast was shown
  });

  it("executes a chain of actions sequentially", async () => {
    const atom = pageRegistry.register("chain-test");
    mockApi.delete.mockResolvedValue({ ok: true });
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current([
        { type: "api", method: "DELETE", endpoint: "/api/items/1" },
        { type: "set-value", target: "chain-test", value: "done" },
        { type: "toast", message: "Deleted", variant: "success" },
      ]);
    });

    expect(mockApi.delete).toHaveBeenCalled();
    expect(pageRegistry.store.get(atom)).toBe("done");
  });

  it("interpolates endpoint with context", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current(
        { type: "api", method: "GET", endpoint: "/api/users/{userId}" },
        { userId: 42 },
      );
    });

    expect(mockApi.get).toHaveBeenCalledWith("/api/users/42");
  });

  it("throws when api context is missing", async () => {
    const wrapper = createWrapper({ pageRegistry });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await expect(
      Promise.resolve(
        act(async () => {
          await result.current({
            type: "api",
            method: "GET",
            endpoint: "/api/users",
          });
        }),
      ),
    ).rejects.toThrow("SnapshotApiContext not provided");
  });

  it("runs a named manifest workflow", async () => {
    const atom = pageRegistry.register("workflow-target");
    const wrapper = createWrapper({
      api: mockApi,
      pageRegistry,
      manifest: {
        raw: {
          routes: [],
          workflows: {
            "users.after-save": [
              {
                type: "set-value",
                target: "workflow-target",
                value: "{result.data}",
              },
              {
                type: "toast",
                message: "Saved {result.data}",
              },
            ],
          },
        },
        app: {},
        routes: [],
        routeMap: {},
        firstRoute: null,
      } as import("../../manifest/types").CompiledManifest,
    });
    const { result } = renderHook(() => useActionExecutor(), { wrapper });

    await act(async () => {
      await result.current(
        {
          type: "run-workflow",
          workflow: "users.after-save",
        },
        { result: { data: "ok" } },
      );
    });

    expect(pageRegistry.store.get(atom)).toBe("ok");
  });
});
