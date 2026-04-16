/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import {
  useManifestResourceFocusRefetch,
  useManifestResourceMountRefetch,
  ManifestRuntimeProvider,
  useManifestResourceCache,
  useManifestResourcePolling,
} from "../runtime";
import type { ApiClient } from "../../../api/client";
import type { ManifestRuntimeExtensions } from "../types";

function createMockApi(responses: Record<string, unknown>): ApiClient {
  return {
    get: vi.fn(async (endpoint: string) => responses[endpoint]),
    post: vi.fn(async (endpoint: string) => responses[endpoint]),
    put: vi.fn(async (endpoint: string) => responses[endpoint]),
    patch: vi.fn(async (endpoint: string) => responses[endpoint]),
    delete: vi.fn(async (endpoint: string) => responses[endpoint]),
  } as unknown as ApiClient;
}

function createWrapper(options?: { api?: ApiClient }) {
  const api = options?.api;
  const runtimeExtensions: ManifestRuntimeExtensions = {
    resources: {
      mergedTransactions: {
        load: async ({ loadTarget }) => {
          const accounts = (await loadTarget({ resource: "accounts" })) as {
            items?: Array<{ id?: string }>;
          };
          const merged: Array<{ id: string; accountId: string }> = [];
          for (const account of accounts.items ?? []) {
            if (!account.id) {
              continue;
            }
            const transactions = (await loadTarget({
              resource: "accountTransactions",
              params: { accountId: account.id },
            })) as { items?: Array<{ id: string; accountId: string }> };
            merged.push(...(transactions.items ?? []));
          }
          return { items: merged, hasMore: false };
        },
      },
    },
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      Provider,
      null,
      createElement(ManifestRuntimeProvider as React.ComponentType<any>, {
        api,
        manifest: {
          raw: { routes: [] },
          __runtime: runtimeExtensions,
          app: {},
          resources: {
            users: {
              method: "GET",
              endpoint: "/api/users",
              pollMs: 50,
              refetchOnWindowFocus: true,
            },
            dashboard: {
              method: "GET",
              endpoint: "/api/dashboard",
              dependsOn: ["users"],
            },
            flakyUsers: {
              method: "GET",
              endpoint: "/api/flaky-users",
              retry: 2,
              retryDelayMs: 10,
            },
            cursorUsers: {
              method: "GET",
              endpoint: "/api/cursor-users?pageSize=2",
            },
            mountUsers: {
              method: "GET",
              endpoint: "/api/mount-users",
              refetchOnMount: true,
            },
            accounts: {
              method: "GET",
              endpoint: "/api/accounts",
            },
            accountTransactions: {
              method: "GET",
              endpoint: "/api/transactions/by-account",
            },
            mergedTransactions: {
              method: "GET",
              endpoint: "/api/transactions",
            },
          },
          routes: [],
          routeMap: {},
          firstRoute: null,
        },
        children,
      }),
    );
  };
}

describe("ManifestRuntimeProvider", () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("invalidates dependent resources when a base resource is invalidated", async () => {
    const api = createMockApi({
      "/api/users": [{ id: 1 }],
      "/api/dashboard": { totalUsers: 1 },
    });
    const { result, unmount } = renderHook(() => useManifestResourceCache(), {
      wrapper: createWrapper({ api }),
    });

    await act(async () => {
      await result.current?.loadTarget({ resource: "users" });
      await result.current?.loadTarget({ resource: "dashboard" });
    });

    expect(result.current?.getResourceVersion("users")).toBe(0);
    expect(result.current?.getResourceVersion("dashboard")).toBe(0);

    act(() => {
      result.current?.invalidateResource("users");
    });

    expect(result.current?.getResourceVersion("users")).toBe(1);
    expect(result.current?.getResourceVersion("dashboard")).toBe(1);
    expect(result.current?.getData({ resource: "users" })).toBeUndefined();
    expect(result.current?.getData({ resource: "dashboard" })).toBeUndefined();
    unmount();
  });

  it("polls resources by invalidating them on the configured interval", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(
      () => {
        useManifestResourcePolling("users", true);
        return useManifestResourceCache();
      },
      { wrapper: createWrapper() },
    );

    expect(result.current?.getResourceVersion("users")).toBe(0);

    act(() => {
      vi.advanceTimersByTime(55);
    });

    expect(result.current?.getResourceVersion("users")).toBe(1);
    unmount();
  });

  it("retries resource loads when the resource config enables retry", async () => {
    vi.useFakeTimers();
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce([{ id: 1 }]);
    const api = {
      get,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient;
    const { result, unmount } = renderHook(() => useManifestResourceCache(), {
      wrapper: createWrapper({ api }),
    });

    let loadPromise: Promise<unknown> | undefined;
    await act(async () => {
      loadPromise = result.current?.loadTarget({ resource: "flakyUsers" });
      await vi.advanceTimersByTimeAsync(10);
      await loadPromise;
    });

    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, "/api/flaky-users");
    expect(get).toHaveBeenNthCalledWith(2, "/api/flaky-users");
    expect(result.current?.getData({ resource: "flakyUsers" })).toEqual([
      { id: 1 },
    ]);
    unmount();
  });

  it("drains cursor-paginated list resources into a single cached dataset", async () => {
    const get = vi
      .fn()
      .mockImplementation(async (endpoint: string) => {
        if (endpoint === "/api/cursor-users?pageSize=2") {
          return {
            items: [{ id: 1 }, { id: 2 }],
            hasMore: true,
            nextCursor: "page-2",
          };
        }
        if (endpoint === "/api/cursor-users?pageSize=2&cursor=page-2") {
          return {
            items: [{ id: 3 }, { id: 4 }],
            hasMore: true,
            nextCursor: "page-3",
          };
        }
        if (endpoint === "/api/cursor-users?pageSize=2&cursor=page-3") {
          return {
            items: [{ id: 5 }],
            hasMore: false,
          };
        }
        throw new Error(`Unexpected endpoint ${endpoint}`);
      });
    const api = {
      get,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient;
    const { result, unmount } = renderHook(() => useManifestResourceCache(), {
      wrapper: createWrapper({ api }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current?.loadTarget({ resource: "cursorUsers" });
    });

    expect(get).toHaveBeenCalledTimes(3);
    expect(get).toHaveBeenNthCalledWith(1, "/api/cursor-users?pageSize=2");
    expect(get).toHaveBeenNthCalledWith(
      2,
      "/api/cursor-users?pageSize=2&cursor=page-2",
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      "/api/cursor-users?pageSize=2&cursor=page-3",
    );
    expect(data).toEqual({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      hasMore: false,
    });
    expect(result.current?.getData({ resource: "cursorUsers" })).toEqual({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      hasMore: false,
    });
    unmount();
  });

  it("stops merging when a cursor endpoint replays the same page", async () => {
    const get = vi
      .fn()
      .mockImplementation(async (endpoint: string) => {
        if (endpoint === "/api/cursor-users?pageSize=2") {
          return {
            items: [{ id: 1 }, { id: 2 }],
            hasMore: true,
            nextCursor: "stuck-page",
          };
        }
        if (endpoint === "/api/cursor-users?pageSize=2&cursor=stuck-page") {
          return {
            items: [{ id: 1 }, { id: 2 }],
            hasMore: true,
            nextCursor: "stuck-page",
          };
        }
        throw new Error(`Unexpected endpoint ${endpoint}`);
      });
    const api = {
      get,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient;
    const { result, unmount } = renderHook(() => useManifestResourceCache(), {
      wrapper: createWrapper({ api }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current?.loadTarget({ resource: "cursorUsers" });
    });

    expect(get).toHaveBeenCalledTimes(2);
    expect(data).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      hasMore: false,
    });
    expect(result.current?.getData({ resource: "cursorUsers" })).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      hasMore: false,
    });
    unmount();
  });

  it("supports runtime resource loaders that compose other resources", async () => {
    const get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === "/api/accounts") {
        return {
          items: [{ id: "checking" }, { id: "savings" }],
          hasMore: false,
        };
      }
      if (endpoint === "/api/transactions/by-account?accountId=checking") {
        return {
          items: [{ id: "tx-1", accountId: "checking" }],
          hasMore: false,
        };
      }
      if (endpoint === "/api/transactions/by-account?accountId=savings") {
        return {
          items: [{ id: "tx-2", accountId: "savings" }],
          hasMore: false,
        };
      }
      throw new Error(`Unexpected endpoint ${endpoint}`);
    });
    const api = {
      get,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient;
    const { result, unmount } = renderHook(() => useManifestResourceCache(), {
      wrapper: createWrapper({ api }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current?.loadTarget({ resource: "mergedTransactions" });
    });

    expect(get).toHaveBeenCalledTimes(3);
    expect(get).toHaveBeenNthCalledWith(1, "/api/accounts");
    expect(get).toHaveBeenNthCalledWith(
      2,
      "/api/transactions/by-account?accountId=checking",
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      "/api/transactions/by-account?accountId=savings",
    );
    expect(data).toEqual({
      items: [
        { id: "tx-1", accountId: "checking" },
        { id: "tx-2", accountId: "savings" },
      ],
      hasMore: false,
    });
    expect(result.current?.getData({ resource: "mergedTransactions" })).toEqual({
      items: [
        { id: "tx-1", accountId: "checking" },
        { id: "tx-2", accountId: "savings" },
      ],
      hasMore: false,
    });
    unmount();
  });

  it("invalidates resources on window focus when configured", async () => {
    const { result, unmount } = renderHook(
      () => {
        useManifestResourceFocusRefetch("users", true);
        return useManifestResourceCache();
      },
      { wrapper: createWrapper() },
    );

    expect(result.current?.getResourceVersion("users")).toBe(0);

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(result.current?.getResourceVersion("users")).toBe(1);
    unmount();
  });

  it("invalidates resources on mount when configured", () => {
    const { result, unmount } = renderHook(
      () => {
        useManifestResourceMountRefetch("mountUsers", true);
        return useManifestResourceCache();
      },
      { wrapper: createWrapper() },
    );

    expect(result.current?.getResourceVersion("mountUsers")).toBe(1);
    unmount();
  });
});
