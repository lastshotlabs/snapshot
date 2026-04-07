/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../registry";
import { PageRegistryContext, AppRegistryContext } from "../providers";
import { usePublish, useSubscribe, useResolveFrom } from "../hooks";

/** Test wrapper that provides both page and app registries. */
function createTestWrapper(
  pageRegistry: AtomRegistryImpl,
  appRegistry?: AtomRegistryImpl,
) {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <AppRegistryContext.Provider value={appRegistry ?? null}>
        <PageRegistryContext.Provider value={pageRegistry}>
          {children}
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  };
}

describe("usePublish", () => {
  it("registers an atom in the page context", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    renderHook(() => usePublish("my-component"), { wrapper });

    expect(registry.keys()).toContain("my-component");
  });

  it("returns a setter function that updates the atom value", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result } = renderHook(() => usePublish("my-component"), {
      wrapper,
    });

    act(() => {
      result.current({ selected: { id: 1, name: "Alice" } });
    });

    const a = registry.get("my-component");
    expect(a).toBeDefined();
    expect(registry.store.get(a!)).toEqual({
      selected: { id: 1, name: "Alice" },
    });
  });

  it("unregisters the atom on unmount", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { unmount } = renderHook(() => usePublish("ephemeral"), { wrapper });

    expect(registry.keys()).toContain("ephemeral");
    unmount();
    expect(registry.keys()).not.toContain("ephemeral");
  });
});

describe("useSubscribe", () => {
  it("returns published values from another component", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    // Publisher
    const { result: publishResult } = renderHook(() => usePublish("source"), {
      wrapper,
    });

    // Subscriber
    const { result: subResult } = renderHook(
      () => useSubscribe({ from: "source" }),
      { wrapper },
    );

    // Initially undefined
    expect(subResult.current).toBeUndefined();

    // After publishing
    act(() => {
      publishResult.current({ value: 42 });
    });

    expect(subResult.current).toEqual({ value: 42 });
  });

  it("resolves nested dot-paths", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result: publishResult } = renderHook(
      () => usePublish("users-table"),
      { wrapper },
    );

    const { result: subResult } = renderHook(
      () => useSubscribe({ from: "users-table.selected.name" }),
      { wrapper },
    );

    act(() => {
      publishResult.current({ selected: { id: 1, name: "Alice" } });
    });

    expect(subResult.current).toBe("Alice");
  });

  it("reads from AppContext with global. prefix", () => {
    const pageRegistry = new AtomRegistryImpl();
    const appRegistry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(pageRegistry, appRegistry);

    // Set up a global value
    const a = appRegistry.register("user");
    appRegistry.store.set(a, { name: "Bob", role: "admin" });

    const { result } = renderHook(() => useSubscribe({ from: "global.user" }), {
      wrapper,
    });

    expect(result.current).toEqual({ name: "Bob", role: "admin" });
  });

  it("reads nested paths from AppContext", () => {
    const pageRegistry = new AtomRegistryImpl();
    const appRegistry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(pageRegistry, appRegistry);

    const a = appRegistry.register("user");
    appRegistry.store.set(a, { name: "Bob", role: "admin" });

    const { result } = renderHook(
      () => useSubscribe({ from: "global.user.name" }),
      { wrapper },
    );

    expect(result.current).toBe("Bob");
  });

  it("passes through static string values", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result } = renderHook(() => useSubscribe("just-a-string"), {
      wrapper,
    });

    expect(result.current).toBe("just-a-string");
  });

  it("passes through static number values", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result } = renderHook(() => useSubscribe(42), { wrapper });

    expect(result.current).toBe(42);
  });

  it("returns undefined when source atom does not exist yet", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result } = renderHook(
      () => useSubscribe({ from: "not-yet-mounted" }),
      { wrapper },
    );

    expect(result.current).toBeUndefined();
  });

  it("supports multiple subscribers to the same id", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result: publishResult } = renderHook(() => usePublish("shared"), {
      wrapper,
    });

    const { result: sub1 } = renderHook(
      () => useSubscribe({ from: "shared" }),
      { wrapper },
    );

    const { result: sub2 } = renderHook(
      () => useSubscribe({ from: "shared" }),
      { wrapper },
    );

    act(() => {
      publishResult.current("hello");
    });

    expect(sub1.current).toBe("hello");
    expect(sub2.current).toBe("hello");
  });
});

describe("useResolveFrom", () => {
  it("resolves all FromRefs in a config object", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    // Set up published values
    const usersAtom = registry.register("users-table");
    registry.store.set(usersAtom, { selected: { id: 5, name: "Alice" } });

    const dateAtom = registry.register("date-range");
    registry.store.set(dateAtom, "30d");

    const { result } = renderHook(
      () =>
        useResolveFrom({
          userId: { from: "users-table.selected.id" },
          period: { from: "date-range" },
          label: "static label",
        }),
      { wrapper },
    );

    expect(result.current).toEqual({
      userId: 5,
      period: "30d",
      label: "static label",
    });
  });

  it("passes through configs with no FromRefs", () => {
    const registry = new AtomRegistryImpl();
    const wrapper = createTestWrapper(registry);

    const { result } = renderHook(() => useResolveFrom({ a: 1, b: "hello" }), {
      wrapper,
    });

    expect(result.current).toEqual({ a: 1, b: "hello" });
  });
});
