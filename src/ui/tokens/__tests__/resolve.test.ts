import { beforeAll, describe, expect, it } from "vitest";
import { resolveTokens } from "../resolve";
import { defineFlavor, getFlavor, registerBuiltInFlavors } from "../flavors";

beforeAll(() => {
  registerBuiltInFlavors();
});

describe("resolveTokens", () => {
  it("returns valid CSS with no config (defaults to neutral)", () => {
    const css = resolveTokens();
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
    expect(css).toContain("--sn-color-primary:");
    expect(css).toContain("--sn-color-background:");
    expect(css).toContain("--sn-color-foreground:");
    expect(css).toContain("--sn-radius-md:");
  });

  it("returns valid CSS with empty config", () => {
    const css = resolveTokens({});
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("generates foreground variables automatically", () => {
    const css = resolveTokens();
    expect(css).toContain("--sn-color-primary-foreground:");
    expect(css).toContain("--sn-color-secondary-foreground:");
    expect(css).toContain("--sn-color-card-foreground:");
    expect(css).toContain("--sn-color-popover-foreground:");
    expect(css).toContain("--sn-color-muted-foreground:");
    expect(css).toContain("--sn-color-accent-foreground:");
    expect(css).toContain("--sn-color-destructive-foreground:");
  });

  it("generates chart variables", () => {
    const css = resolveTokens();
    expect(css).toContain("--sn-chart-1:");
    expect(css).toContain("--sn-chart-2:");
    expect(css).toContain("--sn-chart-3:");
    expect(css).toContain("--sn-chart-4:");
    expect(css).toContain("--sn-chart-5:");
  });

  it("generates font variables", () => {
    const css = resolveTokens({
      overrides: {
        font: {
          sans: "Inter",
          mono: "JetBrains Mono",
          baseSize: 16,
          scale: 1.25,
        },
      },
    });
    expect(css).toContain("--sn-font-sans: Inter;");
    expect(css).toContain("--sn-font-mono: JetBrains Mono;");
    expect(css).toContain("--sn-font-size-base: 16px;");
    expect(css).toContain("--sn-font-scale: 1.25;");
  });

  it("generates spacing variables", () => {
    const css = resolveTokens();
    expect(css).toContain("--sn-spacing-md:");
  });

  it("throws for unknown flavor", () => {
    expect(() => resolveTokens({ flavor: "nonexistent" })).toThrow(
      "Unknown flavor",
    );
  });
});

describe("resolveTokens with flavors", () => {
  const flavorNames = [
    "neutral",
    "slate",
    "midnight",
    "violet",
    "rose",
    "emerald",
    "ocean",
    "sunset",
  ];

  for (const name of flavorNames) {
    it(`generates CSS for ${name} flavor`, () => {
      const css = resolveTokens({ flavor: name });
      expect(css).toContain(":root {");
      expect(css).toContain(".dark {");
      expect(css).toContain("--sn-color-primary:");
      expect(css).toContain("--sn-color-background:");
    });
  }

  it("produces different CSS for different flavors", () => {
    const neutralCss = resolveTokens({ flavor: "neutral" });
    const violetCss = resolveTokens({ flavor: "violet" });
    const roseCss = resolveTokens({ flavor: "rose" });

    // All should have required structure
    for (const css of [neutralCss, violetCss, roseCss]) {
      expect(css).toContain(":root {");
      expect(css).toContain(".dark {");
    }

    // But should have different primary colors
    expect(neutralCss).not.toBe(violetCss);
    expect(violetCss).not.toBe(roseCss);
  });
});

describe("resolveTokens with overrides", () => {
  it("merges color overrides onto flavor", () => {
    const css = resolveTokens({
      flavor: "neutral",
      overrides: {
        colors: { primary: "#8b5cf6" },
      },
    });

    // Should contain the overridden primary (converted to oklch)
    expect(css).toContain("--sn-color-primary:");
    // The neutral flavor's background should still be there
    expect(css).toContain("--sn-color-background:");
  });

  it("overrides radius", () => {
    const css = resolveTokens({
      overrides: { radius: "full" },
    });
    expect(css).toContain("--sn-radius-md: 9999px;");
  });

  it("overrides spacing", () => {
    const css = resolveTokens({
      overrides: { spacing: "compact" },
    });
    // compact = 0.75 multiplier, so md = 1 * 0.75 = 0.750rem
    expect(css).toContain("--sn-spacing-md: 0.750rem;");
  });

  it("maps radius enum values correctly", () => {
    const radiusTests: Array<{
      value: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";
      expected: string;
    }> = [
      { value: "none", expected: "0" },
      { value: "xs", expected: "0.125rem" },
      { value: "sm", expected: "0.25rem" },
      { value: "md", expected: "0.5rem" },
      { value: "lg", expected: "0.75rem" },
      { value: "xl", expected: "1rem" },
      { value: "full", expected: "9999px" },
    ];

    for (const { value, expected } of radiusTests) {
      const css = resolveTokens({ overrides: { radius: value } });
      expect(css).toContain(`--sn-radius-md: ${expected};`);
    }
  });

  it("maps spacing enum values correctly", () => {
    const spacingTests: Array<{
      value: "compact" | "default" | "comfortable" | "spacious";
      multiplier: number;
    }> = [
      { value: "compact", multiplier: 0.75 },
      { value: "default", multiplier: 1 },
      { value: "comfortable", multiplier: 1.25 },
      { value: "spacious", multiplier: 1.5 },
    ];

    for (const { value, multiplier } of spacingTests) {
      const css = resolveTokens({ overrides: { spacing: value } });
      const expectedMd = (1 * multiplier).toFixed(3);
      expect(css).toContain(`--sn-spacing-md: ${expectedMd}rem;`);
    }
  });

  it("applies dark color overrides", () => {
    const css = resolveTokens({
      overrides: {
        darkColors: { primary: "#3b82f6" },
      },
    });
    // The dark section should have the overridden primary
    expect(css).toContain(".dark {");
  });

  it("deep merges font overrides", () => {
    const css = resolveTokens({
      flavor: "neutral",
      overrides: {
        font: { sans: "Custom Font" },
      },
    });
    expect(css).toContain("--sn-font-sans: Custom Font;");
  });
});

describe("resolveTokens with component tokens", () => {
  it("generates card component tokens", () => {
    const css = resolveTokens({
      overrides: {
        components: {
          card: { shadow: "md", padding: "comfortable", border: true },
        },
      },
    });
    expect(css).toContain("--sn-card-shadow:");
    expect(css).toContain("--sn-card-padding:");
    expect(css).toContain("--sn-card-border:");
  });

  it("generates table component tokens", () => {
    const css = resolveTokens({
      overrides: {
        components: {
          table: { striped: true, density: "compact", hoverRow: true },
        },
      },
    });
    expect(css).toContain("--sn-table-stripe-bg:");
    expect(css).toContain("--sn-table-density: 0.75;");
    expect(css).toContain("--sn-table-hover-bg:");
  });

  it("generates button component tokens", () => {
    const css = resolveTokens({
      overrides: {
        components: {
          button: { weight: "bold", uppercase: true },
        },
      },
    });
    expect(css).toContain("--sn-button-weight: 700;");
    expect(css).toContain("--sn-button-transform: uppercase;");
  });

  it("generates input component tokens", () => {
    const css = resolveTokens({
      overrides: {
        components: {
          input: { size: "lg", variant: "filled" },
        },
      },
    });
    expect(css).toContain("--sn-input-height: 3rem;");
    expect(css).toContain("--sn-input-variant: filled;");
  });

  it("generates modal component tokens", () => {
    const css = resolveTokens({
      overrides: {
        components: {
          modal: { overlay: "blur", animation: "slide-up" },
        },
      },
    });
    expect(css).toContain("--sn-modal-overlay:");
    expect(css).toContain("--sn-modal-backdrop-filter: blur(4px);");
    expect(css).toContain("--sn-modal-animation: slide-up;");
  });

  it("does not generate component blocks when no components configured", () => {
    const css = resolveTokens({ flavor: "neutral" });
    expect(css).not.toContain("[data-snapshot-component=");
  });

  it("generates multiple component blocks", () => {
    const css = resolveTokens({
      overrides: {
        components: {
          card: { shadow: "sm" },
          table: { striped: true },
          button: { weight: "medium" },
        },
      },
    });
    expect(css).toContain("--sn-card-shadow:");
    expect(css).toContain("--sn-table-stripe-bg:");
    expect(css).toContain("--sn-button-weight:");
  });
});

describe("resolveTokens with custom flavor", () => {
  it("uses a custom-defined flavor", () => {
    defineFlavor("test-resolve-custom", {
      displayName: "Test Custom",
      colors: {
        primary: "#e11d48",
        secondary: "#64748b",
        background: "#fafaf9",
        destructive: "#dc2626",
        card: "#fafaf9",
        popover: "#fafaf9",
        muted: "#f5f5f4",
        accent: "#f5f5f4",
        border: "#e7e5e4",
        input: "#e7e5e4",
        ring: "#e11d48",
      },
      radius: "xl",
      spacing: "comfortable",
      font: { sans: "DM Sans", mono: "Fira Code" },
    });

    const css = resolveTokens({ flavor: "test-resolve-custom" });
    expect(css).toContain(":root {");
    expect(css).toContain("--sn-radius-md: 1rem;");
    expect(css).toContain("--sn-spacing-md:");
    expect(css).toContain("--sn-font-sans: DM Sans;");
    expect(css).toContain("--sn-font-mono: Fira Code;");
  });

  it("auto-derives dark mode when flavor has no darkColors", () => {
    defineFlavor("test-no-dark", {
      displayName: "No Dark",
      colors: {
        primary: "#3b82f6",
        background: "#ffffff",
        secondary: "#64748b",
        destructive: "#ef4444",
      },
      radius: "md",
      spacing: "default",
      font: {},
    });

    const css = resolveTokens({ flavor: "test-no-dark" });
    // Should still have a .dark block with auto-derived colors
    expect(css).toContain(".dark {");
    expect(css).toContain("--sn-color-primary:");
  });
});
