import { describe, expect, it } from "vitest";
import {
  extractSurfaceConfig,
  mergeClassNames,
  resolveSurfaceConfig,
  resolveSurfaceStateOrder,
} from "../style-surfaces";

describe("style-surfaces", () => {
  it("merges class names without preserving empties", () => {
    expect(mergeClassNames("root", undefined, "item")).toBe("root item");
  });

  it("applies canonical state precedence", () => {
    expect(resolveSurfaceStateOrder(["hover", "current", "disabled", "active"])).toEqual([
      "hover",
      "current",
      "active",
      "disabled",
    ]);
  });

  it("lets item surface config override component surface config", () => {
    const resolved = resolveSurfaceConfig({
      componentSurface: {
        className: "component-root",
        style: { color: "red" },
      },
      itemSurface: {
        className: "item-root",
        style: { color: "blue" },
      },
    });

    expect(resolved.resolvedConfigForWrapper?.className).toBe("component-root item-root");
    expect(resolved.resolvedConfigForWrapper?.style).toEqual({ color: "blue" });
  });

  it("merges implementation base states before component and item state overrides", () => {
    const resolved = resolveSurfaceConfig({
      implementationBase: {
        style: { color: "red", backgroundColor: "white" },
        states: {
          current: {
            style: { color: "purple", borderColor: "black" },
          },
        },
      },
      componentSurface: {
        states: {
          current: {
            style: { color: "green" },
          },
        },
      },
      itemSurface: {
        states: {
          current: {
            style: { color: "blue" },
          },
        },
      },
      activeStates: ["current"],
    });

    expect(resolved.resolvedConfigForWrapper?.style).toEqual({
      color: "blue",
      backgroundColor: "white",
      borderColor: "black",
    });
  });

  it("extracts only surface-capable fields and can omit semantic collisions", () => {
    expect(
      extractSurfaceConfig(
        {
          className: "root",
          hover: { bg: "accent" },
          width: 320,
          title: "Ignored",
        },
        { omit: ["width"] },
      ),
    ).toEqual({
      className: "root",
      hover: { bg: "accent" },
    });
  });
});
