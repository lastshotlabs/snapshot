import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SnapshotConfig } from "../../../types";
describe("bootBuiltins", () => {
  it("keeps component registries empty until createSnapshot runs", async () => {
    vi.resetModules();

    const { getRegisteredComponent } = await import("../component-registry");
    const { getAllFlavors } = await import("../../tokens/flavors");
    const { bootBuiltins } = await import("../boot-builtins");

    expect(getRegisteredComponent("row")).toBeUndefined();
    expect(getAllFlavors()).toHaveProperty("neutral");

    const config = {
      apiUrl: "http://localhost",
      manifest: {
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      },
    } satisfies SnapshotConfig;

    expect(config.apiUrl).toBe("http://localhost");

    bootBuiltins();

    expect(getRegisteredComponent("row")).toBeDefined();
    expect(getAllFlavors()).toHaveProperty("neutral");

    bootBuiltins();
    expect(getRegisteredComponent("row")).toBeDefined();

    const source = readFileSync(
      join(process.cwd(), "src", "create-snapshot.tsx"),
      "utf8",
    );
    expect(source.indexOf("bootBuiltins();")).toBeLessThan(
      source.indexOf("mergeContract("),
    );
  }, 20000);
});
