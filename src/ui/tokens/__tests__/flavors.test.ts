import { beforeAll, describe, expect, it } from "vitest";
import {
  defineFlavor,
  getAllFlavors,
  getFlavor,
  registerBuiltInFlavors,
} from "../flavors";

beforeAll(() => {
  registerBuiltInFlavors();
});

describe("built-in flavors", () => {
  const expectedFlavors = [
    "neutral",
    "slate",
    "midnight",
    "violet",
    "rose",
    "emerald",
    "ocean",
    "sunset",
  ];

  for (const name of expectedFlavors) {
    it(`has built-in flavor "${name}"`, () => {
      const flavor = getFlavor(name);
      expect(flavor).toBeDefined();
      expect(flavor!.name).toBe(name);
    });
  }

  it("all built-in flavors have required fields", () => {
    for (const name of expectedFlavors) {
      const flavor = getFlavor(name)!;
      expect(flavor.displayName).toBeTruthy();
      expect(flavor.colors).toBeDefined();
      expect(flavor.radius).toBeDefined();
      expect(flavor.spacing).toBeDefined();
      expect(flavor.font).toBeDefined();
    }
  });

  it("all built-in flavors have light colors", () => {
    for (const name of expectedFlavors) {
      const flavor = getFlavor(name)!;
      expect(flavor.colors.primary).toBeTruthy();
      expect(flavor.colors.secondary).toBeTruthy();
      expect(flavor.colors.background).toBeTruthy();
      expect(flavor.colors.destructive).toBeTruthy();
    }
  });

  it("all built-in flavors have dark colors", () => {
    for (const name of expectedFlavors) {
      const flavor = getFlavor(name)!;
      expect(flavor.darkColors).toBeDefined();
      expect(flavor.darkColors!.primary).toBeTruthy();
      expect(flavor.darkColors!.background).toBeTruthy();
    }
  });

  it("neutral flavor matches the existing default palette", () => {
    const neutral = getFlavor("neutral")!;
    expect(neutral.colors.background).toBe("1 0 0");
    expect(neutral.colors.primary).toBe("0.205 0 0");
    expect(neutral.darkColors!.background).toBe("0.145 0 0");
    expect(neutral.darkColors!.primary).toBe("0.922 0 0");
  });

  it("violet flavor matches the existing vibrant palette", () => {
    const violet = getFlavor("violet")!;
    expect(violet.colors.primary).toBe("0.52 0.24 285");
    expect(violet.darkColors!.primary).toBe("0.68 0.22 285");
  });

  it("slate flavor matches the existing minimal palette", () => {
    const slate = getFlavor("slate")!;
    expect(slate.colors.primary).toBe("0.3 0.02 264");
    expect(slate.darkColors!.primary).toBe("0.88 0.005 264");
  });

  it("each flavor has visually distinct primary colors", () => {
    const primaries = new Set<string>();
    for (const name of expectedFlavors) {
      const flavor = getFlavor(name)!;
      primaries.add(flavor.colors.primary!);
    }
    // All primaries should be unique
    expect(primaries.size).toBe(expectedFlavors.length);
  });
});

describe("getAllFlavors", () => {
  it("returns all built-in flavors", () => {
    const all = getAllFlavors();
    expect(Object.keys(all)).toContain("neutral");
    expect(Object.keys(all)).toContain("midnight");
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(8);
  });
});

describe("defineFlavor", () => {
  it("registers a new flavor", () => {
    const flavor = defineFlavor("test-custom", {
      displayName: "Test Custom",
      colors: {
        primary: "#ff6600",
        secondary: "#333",
        background: "#fff",
        destructive: "#cc0000",
      },
      radius: "md",
      spacing: "default",
      font: { sans: "Arial" },
    });

    expect(flavor.name).toBe("test-custom");
    expect(flavor.displayName).toBe("Test Custom");
    expect(getFlavor("test-custom")).toBe(flavor);
  });

  it("overwrites existing flavor with same name", () => {
    defineFlavor("overwrite-test", {
      displayName: "Original",
      colors: { primary: "#111" },
      radius: "sm",
      spacing: "default",
      font: {},
    });

    defineFlavor("overwrite-test", {
      displayName: "Replaced",
      colors: { primary: "#222" },
      radius: "lg",
      spacing: "default",
      font: {},
    });

    const flavor = getFlavor("overwrite-test")!;
    expect(flavor.displayName).toBe("Replaced");
    expect(flavor.colors.primary).toBe("#222");
    expect(flavor.radius).toBe("lg");
  });

  it("returns the registered flavor object", () => {
    const flavor = defineFlavor("return-test", {
      displayName: "Return Test",
      colors: {},
      radius: "md",
      spacing: "default",
      font: {},
    });

    expect(flavor.name).toBe("return-test");
    expect(flavor.displayName).toBe("Return Test");
  });
});

describe("getFlavor", () => {
  it("returns undefined for non-existent flavor", () => {
    expect(getFlavor("nonexistent-flavor-xyz")).toBeUndefined();
  });

  it("returns the flavor object for existing flavor", () => {
    const flavor = getFlavor("neutral");
    expect(flavor).toBeDefined();
    expect(flavor!.name).toBe("neutral");
  });
});
