/**
 * Token resolution pipeline.
 *
 * `resolveTokens()` takes a ThemeConfig and produces a CSS string containing
 * all design tokens as CSS custom properties in `:root` and `.dark` blocks,
 * plus component-level scoped properties.
 */

import type {
  ThemeConfig,
  ThemeColors,
  RadiusScale,
  SpacingScale,
  FontConfig,
  ComponentTokens,
  Flavor,
} from "./types";
import {
  colorToOklch,
  oklchToString,
  deriveForeground,
  deriveDarkVariant,
} from "./color";
import { getFlavor } from "./flavors";

// ── Radius mapping ───────────────────────────────────────────────────────────

const RADIUS_MAP: Record<RadiusScale, string> = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
};

// ── Spacing mapping ──────────────────────────────────────────────────────────

const SPACING_MAP: Record<SpacingScale, string> = {
  compact: "0.75",
  default: "1",
  comfortable: "1.25",
  spacious: "1.5",
};

// ── Semantic color keys that get foreground auto-derivation ───────────────────

const FOREGROUND_PAIRS = [
  "primary",
  "secondary",
  "muted",
  "accent",
  "destructive",
  "success",
  "warning",
  "info",
  "card",
  "popover",
  "sidebar",
] as const;

const BACKGROUND_PAIR = "background" as const;

// ── Color normalization ──────────────────────────────────────────────────────

/**
 * Normalize a color value to oklch string format (L C H).
 * Accepts hex, oklch(), or raw oklch string.
 */
function normalizeColor(color: string): string {
  const trimmed = color.trim();
  // Already in L C H format (3 numbers separated by spaces)
  const parts = trimmed.split(/\s+/);
  if (
    parts.length === 3 &&
    parts.every((p) => !isNaN(parseFloat(p))) &&
    !trimmed.startsWith("#")
  ) {
    return trimmed;
  }
  const [l, c, h] = colorToOklch(trimmed);
  return oklchToString(l, c, h);
}

// ── Deep merge helper ────────────────────────────────────────────────────────

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T>,
): T {
  const result = { ...base };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const overrideVal = overrides[key];
    if (overrideVal === undefined) continue;
    const baseVal = result[key];
    if (
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      overrideVal &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}

// ── CSS generation for colors ────────────────────────────────────────────────

function generateColorVars(colors: ThemeColors, deriveFg: boolean): string[] {
  const lines: string[] = [];

  // Background/foreground pair
  if (colors.background) {
    const bg = normalizeColor(colors.background);
    lines.push(`  --background: ${bg};`);
    if (deriveFg) {
      lines.push(`  --foreground: ${deriveForeground(bg)};`);
    }
  }

  // Semantic pairs
  for (const key of FOREGROUND_PAIRS) {
    const value = colors[key];
    if (value) {
      const normalized = normalizeColor(value);
      lines.push(`  --${key}: ${normalized};`);
      if (deriveFg) {
        lines.push(`  --${key}-foreground: ${deriveForeground(normalized)};`);
      }
    }
  }

  // Border, input, ring (no foreground)
  for (const key of ["border", "input", "ring"] as const) {
    const value = colors[key];
    if (value) {
      lines.push(`  --${key}: ${normalizeColor(value)};`);
    }
  }

  // Chart colors
  if (colors.chart) {
    for (let i = 0; i < 5; i++) {
      const chartColor = colors.chart[i];
      if (chartColor) {
        lines.push(`  --chart-${i + 1}: ${normalizeColor(chartColor)};`);
      }
    }
  }

  return lines;
}

// ── Auto-derive dark colors ──────────────────────────────────────────────────

function autoDerivedarkenColors(lightColors: ThemeColors): ThemeColors {
  const dark: ThemeColors = {};

  if (lightColors.background) {
    dark.background = deriveDarkVariant(lightColors.background);
  }

  for (const key of FOREGROUND_PAIRS) {
    const value = lightColors[key];
    if (value) {
      dark[key] = deriveDarkVariant(value);
    }
  }

  for (const key of ["border", "input", "ring"] as const) {
    const value = lightColors[key];
    if (value) {
      dark[key] = deriveDarkVariant(value);
    }
  }

  if (lightColors.chart) {
    dark.chart = lightColors.chart.map((c) => deriveDarkVariant(c)) as [
      string,
      string,
      string,
      string,
      string,
    ];
  }

  return dark;
}

// ── Component token CSS ──────────────────────────────────────────────────────

function generateComponentTokenCss(components: ComponentTokens): string[] {
  const blocks: string[] = [];

  if (components.card) {
    const lines: string[] = [];
    if (components.card.shadow) {
      lines.push(`  --card-shadow: var(--shadow-${components.card.shadow});`);
    }
    if (components.card.padding) {
      lines.push(
        `  --card-padding: calc(var(--spacing-base, 1rem) * ${SPACING_MAP[components.card.padding]});`,
      );
    }
    if (components.card.border !== undefined) {
      lines.push(
        `  --card-border: ${components.card.border ? "1px solid oklch(var(--border))" : "none"};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(`[data-snapshot-component="card"] {\n${lines.join("\n")}\n}`);
    }
  }

  if (components.table) {
    const lines: string[] = [];
    if (components.table.striped !== undefined) {
      lines.push(
        `  --table-stripe-bg: ${components.table.striped ? "oklch(var(--muted))" : "transparent"};`,
      );
    }
    if (components.table.density) {
      const densityMap = { compact: "0.75", default: "1", comfortable: "1.25" };
      lines.push(`  --table-density: ${densityMap[components.table.density]};`);
    }
    if (components.table.headerBackground !== undefined) {
      lines.push(
        `  --table-header-bg: ${components.table.headerBackground ? "oklch(var(--muted))" : "transparent"};`,
      );
    }
    if (components.table.hoverRow !== undefined) {
      lines.push(
        `  --table-hover-bg: ${components.table.hoverRow ? "oklch(var(--accent))" : "transparent"};`,
      );
    }
    if (components.table.borderStyle) {
      const borderMap = {
        none: "none",
        horizontal: "1px solid oklch(var(--border))",
        grid: "1px solid oklch(var(--border))",
      };
      lines.push(
        `  --table-border: ${borderMap[components.table.borderStyle]};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(
        `[data-snapshot-component="table"] {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.button) {
    const lines: string[] = [];
    if (components.button.weight) {
      const weightMap = { light: "300", medium: "500", bold: "700" };
      lines.push(`  --button-weight: ${weightMap[components.button.weight]};`);
    }
    if (components.button.uppercase !== undefined) {
      lines.push(
        `  --button-transform: ${components.button.uppercase ? "uppercase" : "none"};`,
      );
    }
    if (components.button.iconSize) {
      const sizeMap = { sm: "0.875rem", md: "1rem", lg: "1.25rem" };
      lines.push(
        `  --button-icon-size: ${sizeMap[components.button.iconSize]};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(
        `[data-snapshot-component="button"] {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.input) {
    const lines: string[] = [];
    if (components.input.size) {
      const sizeMap = { sm: "2rem", md: "2.5rem", lg: "3rem" };
      lines.push(`  --input-height: ${sizeMap[components.input.size]};`);
    }
    if (components.input.variant) {
      lines.push(`  --input-variant: ${components.input.variant};`);
    }
    if (lines.length > 0) {
      blocks.push(
        `[data-snapshot-component="input"] {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.modal) {
    const lines: string[] = [];
    if (components.modal.overlay) {
      const overlayMap = {
        light: "rgba(0, 0, 0, 0.3)",
        dark: "rgba(0, 0, 0, 0.7)",
        blur: "rgba(0, 0, 0, 0.4)",
      };
      lines.push(`  --modal-overlay: ${overlayMap[components.modal.overlay]};`);
      if (components.modal.overlay === "blur") {
        lines.push(`  --modal-backdrop-filter: blur(4px);`);
      }
    }
    if (components.modal.animation) {
      lines.push(`  --modal-animation: ${components.modal.animation};`);
    }
    if (lines.length > 0) {
      blocks.push(
        `[data-snapshot-component="modal"] {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.nav) {
    const lines: string[] = [];
    if (components.nav.variant) {
      lines.push(`  --nav-variant: ${components.nav.variant};`);
    }
    if (components.nav.activeIndicator) {
      lines.push(
        `  --nav-active-indicator: ${components.nav.activeIndicator};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(`[data-snapshot-component="nav"] {\n${lines.join("\n")}\n}`);
    }
  }

  if (components.badge) {
    const lines: string[] = [];
    if (components.badge.variant) {
      lines.push(`  --badge-variant: ${components.badge.variant};`);
    }
    if (components.badge.rounded !== undefined) {
      lines.push(
        `  --badge-radius: ${components.badge.rounded ? "9999px" : "var(--radius)"};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(
        `[data-snapshot-component="badge"] {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.toast) {
    const lines: string[] = [];
    if (components.toast.position) {
      lines.push(`  --toast-position: ${components.toast.position};`);
    }
    if (components.toast.animation) {
      lines.push(`  --toast-animation: ${components.toast.animation};`);
    }
    if (lines.length > 0) {
      blocks.push(
        `[data-snapshot-component="toast"] {\n${lines.join("\n")}\n}`,
      );
    }
  }

  return blocks;
}

// ── Main resolution function ─────────────────────────────────────────────────

/**
 * Resolve a theme configuration into a complete CSS string.
 *
 * Pipeline:
 * 1. Load base flavor (default: neutral)
 * 2. Deep merge overrides onto flavor defaults
 * 3. Convert all colors to oklch
 * 4. Auto-derive foreground colors (contrast-aware)
 * 5. Auto-derive dark mode colors if not provided
 * 6. Map radius/spacing/font to CSS
 * 7. Generate component-level tokens
 * 8. Output CSS string with :root, .dark, and component selectors
 *
 * @param config - Theme configuration (flavor name + overrides)
 * @returns Complete CSS string ready to inject or write to a file
 */
export function resolveTokens(config: ThemeConfig = {}): string {
  // 1. Load base flavor
  const flavorName = config.flavor ?? "neutral";
  const baseFlavor = getFlavor(flavorName);
  if (!baseFlavor) {
    throw new Error(
      `Unknown flavor: "${flavorName}". Use defineFlavor() to register custom flavors.`,
    );
  }

  // 2. Merge overrides
  const overrides = config.overrides ?? {};
  const lightColors: ThemeColors = deepMerge(
    baseFlavor.colors as Record<string, unknown>,
    (overrides.colors ?? {}) as Record<string, unknown>,
  ) as ThemeColors;

  const radius: RadiusScale = overrides.radius ?? baseFlavor.radius;
  const spacing: SpacingScale = overrides.spacing ?? baseFlavor.spacing;
  const font: FontConfig = deepMerge(
    (baseFlavor.font ?? {}) as Record<string, unknown>,
    (overrides.font ?? {}) as Record<string, unknown>,
  ) as FontConfig;
  const components: ComponentTokens = deepMerge(
    (baseFlavor.components ?? {}) as Record<string, unknown>,
    (overrides.components ?? {}) as Record<string, unknown>,
  ) as ComponentTokens;

  // 3-4. Generate light mode color vars (colors get normalized + foreground derived)
  const lightVars = generateColorVars(lightColors, true);

  // 5. Dark mode colors
  let darkColors: ThemeColors;
  if (overrides.darkColors) {
    // Explicit dark overrides — merge with flavor dark or auto-derived
    const baseDark =
      baseFlavor.darkColors ?? autoDerivedarkenColors(lightColors);
    darkColors = deepMerge(
      baseDark as Record<string, unknown>,
      overrides.darkColors as Record<string, unknown>,
    ) as ThemeColors;
  } else if (baseFlavor.darkColors) {
    darkColors = baseFlavor.darkColors;
  } else {
    darkColors = autoDerivedarkenColors(lightColors);
  }

  const darkVars = generateColorVars(darkColors, true);

  // 6. Radius, spacing, font
  lightVars.push(`  --radius: ${RADIUS_MAP[radius]};`);
  lightVars.push(`  --spacing-unit: ${SPACING_MAP[spacing]};`);

  if (font.sans) {
    lightVars.push(`  --font-sans: ${font.sans};`);
  }
  if (font.mono) {
    lightVars.push(`  --font-mono: ${font.mono};`);
  }
  if (font.display) {
    lightVars.push(`  --font-display: ${font.display};`);
  }
  if (font.baseSize) {
    lightVars.push(`  --font-size-base: ${font.baseSize}px;`);
  }
  if (font.scale) {
    lightVars.push(`  --font-scale: ${font.scale};`);
  }

  // 7. Component tokens
  const componentBlocks = generateComponentTokenCss(components);

  // 8. Build CSS output
  const sections: string[] = [];

  sections.push(`:root {\n${lightVars.join("\n")}\n}`);
  sections.push(`.dark {\n${darkVars.join("\n")}\n}`);

  if (componentBlocks.length > 0) {
    sections.push(componentBlocks.join("\n\n"));
  }

  return sections.join("\n\n") + "\n";
}
