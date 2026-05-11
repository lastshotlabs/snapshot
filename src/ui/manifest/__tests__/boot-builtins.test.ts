import { describe, expect, it, vi } from "vitest";

describe("bootBuiltins", () => {
  it("registers built-in manifest components only when called explicitly", async () => {
    vi.resetModules();

    const { getRegisteredComponent } = await import("../component-registry");
    const { getAllFlavors } = await import("../../tokens/flavors");
    const { bootBuiltins } = await import("../boot-builtins");

    expect(getRegisteredComponent("row")).toBeUndefined();
    expect(getAllFlavors()).toHaveProperty("neutral");

    bootBuiltins();

    expect(getRegisteredComponent("row")).toBeDefined();
    expect(getAllFlavors()).toHaveProperty("neutral");

    bootBuiltins();
    expect(getRegisteredComponent("row")).toBeDefined();
  }, 20000);
});
