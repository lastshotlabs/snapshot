import { describe, it, expect } from "vitest";
import {
  themeColorsSchema,
  radiusSchema,
  spacingSchema,
  fontSchema,
  componentTokensSchema,
  themeConfigSchema,
} from "../schema";

describe("themeColorsSchema", () => {
  it("accepts an empty object", () => {
    const result = themeColorsSchema.parse({});
    expect(result).toEqual({});
  });

  it("accepts valid color strings", () => {
    const result = themeColorsSchema.parse({
      primary: "#ff0000",
      secondary: "0.5 0.2 260",
      background: "oklch(0.9 0.01 200)",
    });
    expect(result.primary).toBe("#ff0000");
    expect(result.secondary).toBe("0.5 0.2 260");
  });

  it("accepts chart tuple of 5 strings", () => {
    const chart = ["#f00", "#0f0", "#00f", "#ff0", "#0ff"] as const;
    const result = themeColorsSchema.parse({ chart });
    expect(result.chart).toEqual(chart);
  });

  it("rejects chart with wrong length", () => {
    expect(() =>
      themeColorsSchema.parse({ chart: ["#f00", "#0f0"] }),
    ).toThrow();
  });

  it("rejects unknown keys", () => {
    expect(() =>
      themeColorsSchema.parse({ unknownColor: "#ff0000" }),
    ).toThrow();
  });

  it("accepts all valid color keys", () => {
    const allKeys = {
      primary: "#111",
      secondary: "#222",
      muted: "#333",
      accent: "#444",
      destructive: "#555",
      success: "#666",
      warning: "#777",
      info: "#888",
      background: "#999",
      card: "#aaa",
      popover: "#bbb",
      sidebar: "#ccc",
      border: "#ddd",
      input: "#eee",
      ring: "#fff",
      chart: ["#111", "#222", "#333", "#444", "#555"] as [
        string,
        string,
        string,
        string,
        string,
      ],
    };
    const result = themeColorsSchema.parse(allKeys);
    expect(result).toEqual(allKeys);
  });
});

describe("radiusSchema", () => {
  it.each(["none", "xs", "sm", "md", "lg", "xl", "full"] as const)(
    'accepts "%s"',
    (value) => {
      expect(radiusSchema.parse(value)).toBe(value);
    },
  );

  it("rejects invalid value", () => {
    expect(() => radiusSchema.parse("huge")).toThrow();
  });
});

describe("spacingSchema", () => {
  it.each(["compact", "default", "comfortable", "spacious"] as const)(
    'accepts "%s"',
    (value) => {
      expect(spacingSchema.parse(value)).toBe(value);
    },
  );

  it("rejects invalid value", () => {
    expect(() => spacingSchema.parse("tiny")).toThrow();
  });
});

describe("fontSchema", () => {
  it("accepts valid font config", () => {
    const result = fontSchema.parse({
      sans: "Inter",
      mono: "JetBrains Mono",
      display: "Playfair Display",
      baseSize: 16,
      scale: 1.25,
    });
    expect(result.sans).toBe("Inter");
    expect(result.baseSize).toBe(16);
  });

  it("rejects baseSize below 10", () => {
    expect(() => fontSchema.parse({ baseSize: 8 })).toThrow();
  });

  it("rejects baseSize above 24", () => {
    expect(() => fontSchema.parse({ baseSize: 30 })).toThrow();
  });

  it("rejects scale below 1.1", () => {
    expect(() => fontSchema.parse({ scale: 1.0 })).toThrow();
  });

  it("rejects scale above 1.5", () => {
    expect(() => fontSchema.parse({ scale: 2.0 })).toThrow();
  });

  it("rejects unknown keys", () => {
    expect(() => fontSchema.parse({ serif: "Georgia" })).toThrow();
  });
});

describe("componentTokensSchema", () => {
  it("accepts empty object", () => {
    expect(componentTokensSchema.parse({})).toEqual({});
  });

  it("accepts valid card config", () => {
    const result = componentTokensSchema.parse({
      card: { shadow: "md", padding: "comfortable", border: true },
    });
    expect(result.card?.shadow).toBe("md");
    expect(result.card?.padding).toBe("comfortable");
    expect(result.card?.border).toBe(true);
  });

  it("accepts valid table config", () => {
    const result = componentTokensSchema.parse({
      table: {
        striped: true,
        density: "compact",
        headerBackground: true,
        hoverRow: true,
        borderStyle: "grid",
      },
    });
    expect(result.table?.striped).toBe(true);
    expect(result.table?.borderStyle).toBe("grid");
  });

  it("accepts valid button config", () => {
    const result = componentTokensSchema.parse({
      button: { weight: "bold", uppercase: true, iconSize: "lg" },
    });
    expect(result.button?.weight).toBe("bold");
  });

  it("accepts valid input config", () => {
    const result = componentTokensSchema.parse({
      input: { size: "lg", variant: "filled" },
    });
    expect(result.input?.variant).toBe("filled");
  });

  it("accepts valid modal config", () => {
    const result = componentTokensSchema.parse({
      modal: { overlay: "blur", animation: "slide-up" },
    });
    expect(result.modal?.overlay).toBe("blur");
  });

  it("accepts valid nav config", () => {
    const result = componentTokensSchema.parse({
      nav: { variant: "bordered", activeIndicator: "dot" },
    });
    expect(result.nav?.activeIndicator).toBe("dot");
  });

  it("accepts valid badge config", () => {
    const result = componentTokensSchema.parse({
      badge: { variant: "soft", rounded: true },
    });
    expect(result.badge?.variant).toBe("soft");
  });

  it("accepts valid toast config", () => {
    const result = componentTokensSchema.parse({
      toast: { position: "top-center", animation: "pop" },
    });
    expect(result.toast?.position).toBe("top-center");
  });

  it("rejects invalid card shadow", () => {
    expect(() =>
      componentTokensSchema.parse({ card: { shadow: "huge" } }),
    ).toThrow();
  });

  it("rejects unknown component key", () => {
    expect(() => componentTokensSchema.parse({ slider: { min: 0 } })).toThrow();
  });
});

describe("themeConfigSchema", () => {
  it("accepts empty config", () => {
    expect(themeConfigSchema.parse({})).toEqual({});
  });

  it("accepts flavor only", () => {
    const result = themeConfigSchema.parse({ flavor: "midnight" });
    expect(result.flavor).toBe("midnight");
  });

  it("accepts full config", () => {
    const result = themeConfigSchema.parse({
      flavor: "violet",
      overrides: {
        colors: { primary: "#8b5cf6" },
        radius: "lg",
        spacing: "comfortable",
        font: { sans: "Inter" },
        components: { card: { shadow: "md" } },
      },
      mode: "dark",
    });
    expect(result.flavor).toBe("violet");
    expect(result.overrides?.radius).toBe("lg");
    expect(result.mode).toBe("dark");
  });

  it("accepts dark colors in overrides", () => {
    const result = themeConfigSchema.parse({
      overrides: {
        darkColors: { primary: "#3b82f6", background: "#0a0a0a" },
      },
    });
    expect(result.overrides?.darkColors?.primary).toBe("#3b82f6");
  });

  it("rejects invalid mode", () => {
    expect(() => themeConfigSchema.parse({ mode: "auto" })).toThrow();
  });

  it("rejects unknown top-level keys", () => {
    expect(() =>
      themeConfigSchema.parse({ flavor: "neutral", unknownKey: true }),
    ).toThrow();
  });
});
