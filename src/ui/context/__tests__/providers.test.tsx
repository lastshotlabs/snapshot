/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useContext } from "react";
import type { ReactNode } from "react";
import {
  AppContextProvider,
  PageContextProvider,
  PageRegistryContext,
  AppRegistryContext,
} from "../providers";
import { usePublish, useSubscribe } from "../hooks";
import type { ApiClient } from "../../../api/client";

/** Helper to create a mock API client. */
function createMockApi(responses: Record<string, unknown> = {}): ApiClient {
  return {
    get: vi.fn(async (endpoint: string) => responses[endpoint]),
    post: vi.fn(async (endpoint: string) => responses[endpoint]),
    put: vi.fn(async (endpoint: string) => responses[endpoint]),
    patch: vi.fn(async (endpoint: string) => responses[endpoint]),
    delete: vi.fn(async (endpoint: string) => responses[endpoint]),
  } as unknown as ApiClient;
}

describe("PageContextProvider", () => {
  it("provides a page registry to children", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PageContextProvider>{children}</PageContextProvider>
    );

    const { result } = renderHook(() => useContext(PageRegistryContext), {
      wrapper,
    });

    expect(result.current).not.toBeNull();
  });

  it("scopes page atoms — new provider creates fresh registry", () => {
    // First page
    const wrapper1 = ({ children }: { children: ReactNode }) => (
      <PageContextProvider>{children}</PageContextProvider>
    );

    const { result: pub1 } = renderHook(() => usePublish("table"), {
      wrapper: wrapper1,
    });

    act(() => {
      pub1.current({ selected: "page-1-data" });
    });

    // Second page (different provider instance)
    const wrapper2 = ({ children }: { children: ReactNode }) => (
      <PageContextProvider>{children}</PageContextProvider>
    );

    const { result: sub2 } = renderHook(() => useSubscribe({ from: "table" }), {
      wrapper: wrapper2,
    });

    // Second page should not see first page's data
    expect(sub2.current).toBeUndefined();
  });
});

describe("AppContextProvider", () => {
  it("provides an app registry to children", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider>{children}</AppContextProvider>
    );

    const { result } = renderHook(() => useContext(AppRegistryContext), {
      wrapper,
    });

    expect(result.current).not.toBeNull();
  });

  it("initializes globals with default values immediately", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider globals={{ cart: { default: { items: [] } } }}>
        <PageContextProvider>{children}</PageContextProvider>
      </AppContextProvider>
    );

    const { result } = renderHook(() => useSubscribe({ from: "global.cart" }), {
      wrapper,
    });

    expect(result.current).toEqual({ items: [] });
  });

  it("fetches data from endpoint when data is specified", async () => {
    const mockApi = createMockApi({
      "/api/cart": { items: [{ id: 1, name: "Widget" }] },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider
        globals={{ cart: { data: "GET /api/cart", default: { items: [] } } }}
        api={mockApi}
      >
        <PageContextProvider>{children}</PageContextProvider>
      </AppContextProvider>
    );

    const { result } = renderHook(() => useSubscribe({ from: "global.cart" }), {
      wrapper,
    });

    // Initially shows default
    expect(result.current).toEqual({ items: [] });

    // After fetch completes
    await waitFor(() => {
      expect(result.current).toEqual({
        items: [{ id: 1, name: "Widget" }],
      });
    });

    expect(mockApi.get).toHaveBeenCalledWith("/api/cart");
  });

  it("fetches data from a named resource when configured", async () => {
    const mockApi = createMockApi({
      "/api/me": { id: 1, name: "Ada" },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider
        globals={{ user: { data: { resource: "current-user" } } }}
        resources={{
          "current-user": {
            method: "GET",
            endpoint: "/api/me",
          },
        }}
        api={mockApi}
      >
        <PageContextProvider>{children}</PageContextProvider>
      </AppContextProvider>
    );

    const { result } = renderHook(() => useSubscribe({ from: "global.user" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toEqual({ id: 1, name: "Ada" });
    });

    expect(mockApi.get).toHaveBeenCalledWith("/api/me");
  });

  it("persists app context across page context changes", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider globals={{ user: { default: "Alice" } }}>
        <PageContextProvider>{children}</PageContextProvider>
      </AppContextProvider>
    );

    const { result } = renderHook(() => useSubscribe({ from: "global.user" }), {
      wrapper,
    });

    expect(result.current).toBe("Alice");
  });

  it("handles globals without data or default", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider globals={{ empty: {} }}>
        <PageContextProvider>{children}</PageContextProvider>
      </AppContextProvider>
    );

    const { result } = renderHook(
      () => useSubscribe({ from: "global.empty" }),
      { wrapper },
    );

    expect(result.current).toBeUndefined();
  });

  it("nested providers do not interfere with each other", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppContextProvider globals={{ outer: { default: "outer-value" } }}>
        <PageContextProvider>{children}</PageContextProvider>
      </AppContextProvider>
    );

    const { result } = renderHook(
      () => useSubscribe({ from: "global.outer" }),
      { wrapper },
    );

    expect(result.current).toBe("outer-value");
  });
});
