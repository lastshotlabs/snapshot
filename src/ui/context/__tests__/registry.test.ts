import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import { AtomRegistryImpl } from "../registry";

describe("AtomRegistryImpl", () => {
  it("registers an atom and retrieves it by id", () => {
    const registry = new AtomRegistryImpl();
    const a = registry.register("users-table");
    expect(a).toBeDefined();
    expect(registry.get("users-table")).toBe(a);
  });

  it("returns undefined for unregistered ids", () => {
    const registry = new AtomRegistryImpl();
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("is idempotent — same atom returned on re-register", () => {
    const registry = new AtomRegistryImpl();
    const first = registry.register("foo");
    const second = registry.register("foo");
    expect(first).toBe(second);
  });

  it("unregisters an atom", () => {
    const registry = new AtomRegistryImpl();
    registry.register("bar");
    expect(registry.get("bar")).toBeDefined();
    registry.unregister("bar");
    expect(registry.get("bar")).toBeUndefined();
  });

  it("unregister is safe for non-existent ids", () => {
    const registry = new AtomRegistryImpl();
    expect(() => registry.unregister("nope")).not.toThrow();
  });

  it("returns all registered keys", () => {
    const registry = new AtomRegistryImpl();
    registry.register("a");
    registry.register("b");
    registry.register("c");
    expect(registry.keys()).toEqual(["a", "b", "c"]);
  });

  it("keys() reflects unregistrations", () => {
    const registry = new AtomRegistryImpl();
    registry.register("x");
    registry.register("y");
    registry.unregister("x");
    expect(registry.keys()).toEqual(["y"]);
  });

  it("provides a Jotai store for reading/writing atom values", () => {
    const registry = new AtomRegistryImpl();
    const a = registry.register("test");
    expect(registry.store.get(a)).toBeUndefined();
    registry.store.set(a, 42);
    expect(registry.store.get(a)).toBe(42);
  });

  it("accepts an external store", () => {
    const externalStore = createStore();
    const registry = new AtomRegistryImpl(externalStore);
    expect(registry.store).toBe(externalStore);
  });

  it("sets debug labels for Jotai devtools", () => {
    const registry = new AtomRegistryImpl();
    const a = registry.register("my-component");
    expect(a.debugLabel).toBe("snapshot:my-component");
  });

  it("creates a new atom after re-register following unregister", () => {
    const registry = new AtomRegistryImpl();
    const first = registry.register("temp");
    registry.store.set(first, "old");
    registry.unregister("temp");

    const second = registry.register("temp");
    expect(second).not.toBe(first);
    // New atom starts at undefined
    expect(registry.store.get(second)).toBeUndefined();
  });
});
