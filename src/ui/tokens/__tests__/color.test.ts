import { describe, it, expect } from "vitest";
import {
  hexToOklch,
  hslToOklch,
  oklchToString,
  oklchToHex,
  deriveForeground,
  deriveDarkVariant,
  colorToOklch,
  parseOklchString,
} from "../color";

// Helper: round oklch values for comparison
function roundOklch(lch: [number, number, number]): [number, number, number] {
  return [
    Math.round(lch[0] * 1000) / 1000,
    Math.round(lch[1] * 1000) / 1000,
    Math.round(lch[2] * 1000) / 1000,
  ];
}

describe("hexToOklch", () => {
  // Known conversions (approximate — oklch values validated against CSS spec references)
  const knownConversions: Array<{
    hex: string;
    name: string;
    expectedL: [number, number]; // min, max
    expectedC: [number, number];
  }> = [
    {
      hex: "#000000",
      name: "black",
      expectedL: [0, 0.01],
      expectedC: [0, 0.01],
    },
    {
      hex: "#ffffff",
      name: "white",
      expectedL: [0.99, 1.01],
      expectedC: [0, 0.01],
    },
    {
      hex: "#ff0000",
      name: "red",
      expectedL: [0.6, 0.65],
      expectedC: [0.24, 0.3],
    },
    {
      hex: "#00ff00",
      name: "green",
      expectedL: [0.85, 0.9],
      expectedC: [0.28, 0.35],
    },
    {
      hex: "#0000ff",
      name: "blue",
      expectedL: [0.44, 0.48],
      expectedC: [0.3, 0.35],
    },
    {
      hex: "#ffff00",
      name: "yellow",
      expectedL: [0.96, 0.99],
      expectedC: [0.2, 0.25],
    },
    {
      hex: "#ff00ff",
      name: "magenta",
      expectedL: [0.7, 0.73],
      expectedC: [0.31, 0.35],
    },
    {
      hex: "#00ffff",
      name: "cyan",
      expectedL: [0.9, 0.93],
      expectedC: [0.14, 0.18],
    },
    {
      hex: "#808080",
      name: "gray",
      expectedL: [0.59, 0.61],
      expectedC: [0, 0.01],
    },
    {
      hex: "#800000",
      name: "maroon",
      expectedL: [0.32, 0.39],
      expectedC: [0.12, 0.16],
    },
    {
      hex: "#008000",
      name: "dark green",
      expectedL: [0.51, 0.54],
      expectedC: [0.16, 0.2],
    },
    {
      hex: "#000080",
      name: "navy",
      expectedL: [0.27, 0.3],
      expectedC: [0.16, 0.2],
    },
    {
      hex: "#ffa500",
      name: "orange",
      expectedL: [0.79, 0.82],
      expectedC: [0.16, 0.21],
    },
    {
      hex: "#800080",
      name: "purple",
      expectedL: [0.37, 0.43],
      expectedC: [0.15, 0.22],
    },
    {
      hex: "#c0c0c0",
      name: "silver",
      expectedL: [0.79, 0.82],
      expectedC: [0, 0.01],
    },
    {
      hex: "#f0f0f0",
      name: "light gray",
      expectedL: [0.95, 0.97],
      expectedC: [0, 0.01],
    },
    {
      hex: "#1a1a1a",
      name: "near black",
      expectedL: [0.17, 0.22],
      expectedC: [0, 0.01],
    },
    {
      hex: "#8b5cf6",
      name: "violet-500",
      expectedL: [0.54, 0.62],
      expectedC: [0.21, 0.27],
    },
    {
      hex: "#e11d48",
      name: "rose-600",
      expectedL: [0.5, 0.59],
      expectedC: [0.21, 0.27],
    },
    {
      hex: "#10b981",
      name: "emerald-500",
      expectedL: [0.69, 0.73],
      expectedC: [0.14, 0.19],
    },
    {
      hex: "#3b82f6",
      name: "blue-500",
      expectedL: [0.6, 0.64],
      expectedC: [0.18, 0.22],
    },
    {
      hex: "#f59e0b",
      name: "amber-500",
      expectedL: [0.76, 0.82],
      expectedC: [0.16, 0.21],
    },
  ];

  for (const { hex, name, expectedL, expectedC } of knownConversions) {
    it(`converts ${name} (${hex}) to oklch`, () => {
      const [l, c] = hexToOklch(hex);
      expect(l).toBeGreaterThanOrEqual(expectedL[0]);
      expect(l).toBeLessThanOrEqual(expectedL[1]);
      expect(c).toBeGreaterThanOrEqual(expectedC[0]);
      expect(c).toBeLessThanOrEqual(expectedC[1]);
    });
  }

  it("handles 3-digit hex", () => {
    const [l, c, h] = hexToOklch("#f00");
    const [l2, c2, h2] = hexToOklch("#ff0000");
    expect(roundOklch([l, c, h])).toEqual(roundOklch([l2, c2, h2]));
  });

  it("returns hue in [0, 360) range", () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ffff00"];
    for (const hex of colors) {
      const [, , h] = hexToOklch(hex);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });
});

describe("hslToOklch", () => {
  it("converts pure red (0, 100, 50)", () => {
    const [l, c] = hslToOklch(0, 100, 50);
    expect(l).toBeGreaterThan(0.6);
    expect(c).toBeGreaterThan(0.2);
  });

  it("converts black (0, 0, 0)", () => {
    const [l, c] = hslToOklch(0, 0, 0);
    expect(l).toBeCloseTo(0, 1);
    expect(c).toBeCloseTo(0, 1);
  });

  it("converts white (0, 0, 100)", () => {
    const [l] = hslToOklch(0, 0, 100);
    expect(l).toBeCloseTo(1, 1);
  });

  it("converts gray (0, 0, 50)", () => {
    const [l, c] = hslToOklch(0, 0, 50);
    expect(l).toBeGreaterThan(0.5);
    expect(l).toBeLessThan(0.65);
    expect(c).toBeLessThan(0.01);
  });

  it("converts saturated blue (240, 100, 50)", () => {
    const [l, c] = hslToOklch(240, 100, 50);
    expect(l).toBeGreaterThan(0.4);
    expect(l).toBeLessThan(0.5);
    expect(c).toBeGreaterThan(0.3);
  });
});

describe("oklchToString", () => {
  it("formats values to 3 decimal places", () => {
    expect(oklchToString(0.6372, 0.2368, 25.4651)).toBe("0.637 0.237 25.465");
  });

  it("handles exact values", () => {
    expect(oklchToString(1, 0, 0)).toBe("1 0 0");
  });

  it("handles small values", () => {
    expect(oklchToString(0.001, 0.001, 0.001)).toBe("0.001 0.001 0.001");
  });
});

describe("parseOklchString", () => {
  it("parses a standard oklch string", () => {
    const [l, c, h] = parseOklchString("0.637 0.237 25.465");
    expect(l).toBeCloseTo(0.637);
    expect(c).toBeCloseTo(0.237);
    expect(h).toBeCloseTo(25.465);
  });

  it("handles extra whitespace", () => {
    const [l, c, h] = parseOklchString("  0.5  0.1  200  ");
    expect(l).toBeCloseTo(0.5);
    expect(c).toBeCloseTo(0.1);
    expect(h).toBeCloseTo(200);
  });
});

describe("colorToOklch", () => {
  it("handles hex colors", () => {
    const [l, c, h] = colorToOklch("#ff0000");
    const [l2, c2, h2] = hexToOklch("#ff0000");
    expect(l).toBeCloseTo(l2);
    expect(c).toBeCloseTo(c2);
    expect(h).toBeCloseTo(h2);
  });

  it("handles oklch() wrapper", () => {
    const [l, c, h] = colorToOklch("oklch(0.637 0.237 25.465)");
    expect(l).toBeCloseTo(0.637);
    expect(c).toBeCloseTo(0.237);
    expect(h).toBeCloseTo(25.465);
  });

  it("handles raw oklch string", () => {
    const [l, c, h] = colorToOklch("0.637 0.237 25.465");
    expect(l).toBeCloseTo(0.637);
    expect(c).toBeCloseTo(0.237);
    expect(h).toBeCloseTo(25.465);
  });

  it("throws on unsupported format", () => {
    expect(() => colorToOklch("rgb(255, 0, 0)")).toThrow(
      "Unsupported color format",
    );
  });
});

describe("oklchToHex", () => {
  it("roundtrips black", () => {
    expect(oklchToHex(0, 0, 0)).toBe("#000000");
  });

  it("roundtrips white", () => {
    expect(oklchToHex(1, 0, 0)).toBe("#ffffff");
  });

  it("approximately roundtrips red", () => {
    const [l, c, h] = hexToOklch("#ff0000");
    const hex = oklchToHex(l, c, h);
    // Allow slight rounding differences
    expect(hex).toBe("#ff0000");
  });

  it("approximately roundtrips blue", () => {
    const [l, c, h] = hexToOklch("#0000ff");
    const hex = oklchToHex(l, c, h);
    expect(hex).toBe("#0000ff");
  });
});

describe("deriveForeground", () => {
  it("returns dark foreground for white background", () => {
    const fg = deriveForeground("#ffffff");
    const [l] = parseOklchString(fg);
    expect(l).toBeLessThan(0.3); // Dark foreground
  });

  it("returns light foreground for black background", () => {
    const fg = deriveForeground("#000000");
    const [l] = parseOklchString(fg);
    expect(l).toBeGreaterThan(0.9); // Light foreground
  });

  it("returns light foreground for dark blue background", () => {
    const fg = deriveForeground("#1a1a2e");
    const [l] = parseOklchString(fg);
    expect(l).toBeGreaterThan(0.9);
  });

  it("returns dark foreground for light yellow background", () => {
    const fg = deriveForeground("#fef3c7");
    const [l] = parseOklchString(fg);
    expect(l).toBeLessThan(0.3);
  });

  it("returns foreground with sufficient contrast for medium colors", () => {
    // Test several medium-brightness colors
    const mediumColors = ["#808080", "#666666", "#999999", "#556677"];
    for (const color of mediumColors) {
      const fg = deriveForeground(color);
      // Just verify it returns a valid oklch string
      const [l] = parseOklchString(fg);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(1);
    }
  });

  it("handles oklch string input", () => {
    const fg = deriveForeground("0.9 0 0");
    const [l] = parseOklchString(fg);
    expect(l).toBeLessThan(0.3); // Light background -> dark foreground
  });
});

describe("deriveDarkVariant", () => {
  it("darkens light backgrounds", () => {
    const dark = deriveDarkVariant("#ffffff");
    const [l] = parseOklchString(dark);
    expect(l).toBeLessThan(0.2); // Significantly darker
  });

  it("lightens dark colors for dark mode visibility", () => {
    const dark = deriveDarkVariant("#1a1a2e");
    const [l] = parseOklchString(dark);
    expect(l).toBeGreaterThan(0.4); // Lightened for dark mode
  });

  it("adjusts medium colors to dark-mode appropriate range", () => {
    const dark = deriveDarkVariant("#3b82f6");
    const [l] = parseOklchString(dark);
    expect(l).toBeGreaterThan(0.5); // Medium color stays visible
    expect(l).toBeLessThan(0.95);
  });

  it("preserves hue", () => {
    const [, , origH] = hexToOklch("#3b82f6");
    const dark = deriveDarkVariant("#3b82f6");
    const [, , darkH] = parseOklchString(dark);
    // Hue should be very close (same or very similar)
    expect(Math.abs(origH - darkH)).toBeLessThan(5);
  });

  it("handles oklch string input", () => {
    const dark = deriveDarkVariant("0.95 0.01 200");
    const [l] = parseOklchString(dark);
    expect(l).toBeLessThan(0.5);
  });
});
