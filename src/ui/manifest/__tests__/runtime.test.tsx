/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import {
  ManifestRuntimeProvider,
  useManifestResourceCache,
  useManifestResourcePolling,
} from "../runtime";
import type { ApiClient } from "../../../api/client";

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
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      Provider,
      null,
      createElement(ManifestRuntimeProvider as React.ComponentType<any>, {
        api,
        manifest: {
          raw: { routes: [] },
          app: {},
          resources: {
            users: {
              method: "GET",
              endpoint: "/api/users",
              pollMs: 50,
            },
            dashboard: {
              method: "GET",
              endpoint: "/api/dashboard",
              dependsOn: ["users"],
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
  it("invalidates dependent resources when a base resource is invalidated", async () => {
    const api = createMockApi({
      "/api/users": [{ id: 1 }],
      "/api/dashboard": { totalUsers: 1 },
    });
    const { result } = renderHook(() => useManifestResourceCache(), {
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
  });

  it("polls resources by invalidating them on the configured interval", () => {
    vi.useFakeTimers();
    const { result } = renderHook(
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

    vi.useRealTimers();
  });
});
