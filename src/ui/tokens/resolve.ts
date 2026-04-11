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
  GlobalTokens,
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

// ── Known Google Font families ────────────────────────────────────────────────

const KNOWN_GOOGLE_FONTS = new Set([
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Montserrat",
  "Nunito",
  "Raleway",
  "Source Sans Pro",
  "DM Sans",
  "Plus Jakarta Sans",
  "Outfit",
  "Geist",
]);

/**
 * Build a Google Fonts @import URL for a given family name.
 */
function googleFontImport(family: string): string {
  const encoded = family.replace(/\s+/g, "+");
  return `@import url(https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700&display=swap);`;
}

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

// ── Shadow scale ────────────────────────────────────────────────────────────

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

// ── Z-index scale ───────────────────────────────────────────────────────────

const Z_INDEX_MAP: Record<string, number> = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
};

// ── Breakpoint constants ────────────────────────────────────────────────────

const BREAKPOINTS: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
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
  // Already wrapped in oklch()
  if (trimmed.startsWith("oklch(")) return trimmed;
  // Raw L C H format — wrap in oklch()
  const parts = trimmed.split(/\s+/);
  if (
    parts.length === 3 &&
    parts.every((p) => !isNaN(parseFloat(p))) &&
    !trimmed.startsWith("#")
  ) {
    return `oklch(${trimmed})`;
  }
  const [l, c, h] = colorToOklch(trimmed);
  return `oklch(${oklchToString(l, c, h)})`;
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
    lines.push(`  --sn-color-background: ${bg};`);
    if (deriveFg) {
      lines.push(`  --sn-color-foreground: ${deriveForeground(bg)};`);
    }
  }

  // Semantic pairs
  for (const key of FOREGROUND_PAIRS) {
    const value = colors[key];
    if (value) {
      const normalized = normalizeColor(value);
      lines.push(`  --sn-color-${key}: ${normalized};`);
      if (deriveFg) {
        lines.push(
          `  --sn-color-${key}-foreground: ${deriveForeground(normalized)};`,
        );
      }
    }
  }

  // Border, input, ring (no foreground)
  for (const key of ["border", "input", "ring"] as const) {
    const value = colors[key];
    if (value) {
      lines.push(`  --sn-color-${key}: ${normalizeColor(value)};`);
    }
  }

  // Chart colors
  if (colors.chart) {
    for (let i = 0; i < 5; i++) {
      const chartColor = colors.chart[i];
      if (chartColor) {
        lines.push(`  --sn-chart-${i + 1}: ${normalizeColor(chartColor)};`);
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
      lines.push(
        `  --sn-card-shadow: var(--sn-shadow-${components.card.shadow});`,
      );
    }
    if (components.card.padding) {
      lines.push(
        `  --sn-card-padding: calc(var(--sn-spacing-md, 1rem) * ${SPACING_MAP[components.card.padding]});`,
      );
    }
    if (components.card.border !== undefined) {
      lines.push(
        `  --sn-card-border: ${components.card.border ? "1px solid var(--sn-color-border)" : "none"};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(`:root {\n${lines.join("\n")}\n}`);
    }
  }

  if (components.table) {
    const lines: string[] = [];
    if (components.table.striped !== undefined) {
      lines.push(
        `  --sn-table-stripe-bg: ${components.table.striped ? "var(--sn-color-muted)" : "transparent"};`,
      );
    }
    if (components.table.density) {
      const densityMap = { compact: "0.75", default: "1", comfortable: "1.25" };
      lines.push(
        `  --sn-table-density: ${densityMap[components.table.density]};`,
      );
    }
    if (components.table.headerBackground !== undefined) {
      lines.push(
        `  --sn-table-header-bg: ${components.table.headerBackground ? "var(--sn-color-muted)" : "transparent"};`,
      );
    }
    if (components.table.hoverRow !== undefined) {
      lines.push(
        `  --sn-table-hover-bg: ${components.table.hoverRow ? "var(--sn-color-accent)" : "transparent"};`,
      );
    }
    if (components.table.borderStyle) {
      const borderMap = {
        none: "none",
        horizontal: "1px solid var(--sn-color-border)",
        grid: "1px solid var(--sn-color-border)",
      };
      lines.push(
        `  --sn-table-border: ${borderMap[components.table.borderStyle]};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(
        `:root {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.button) {
    const lines: string[] = [];
    if (components.button.weight) {
      const weightMap = { light: "300", medium: "500", bold: "700" };
      lines.push(
        `  --sn-button-weight: ${weightMap[components.button.weight]};`,
      );
    }
    if (components.button.uppercase !== undefined) {
      lines.push(
        `  --sn-button-transform: ${components.button.uppercase ? "uppercase" : "none"};`,
      );
    }
    if (components.button.iconSize) {
      const sizeMap = { sm: "0.875rem", md: "1rem", lg: "1.25rem" };
      lines.push(
        `  --sn-button-icon-size: ${sizeMap[components.button.iconSize]};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(
        `:root {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.input) {
    const lines: string[] = [];
    if (components.input.size) {
      const sizeMap = { sm: "2rem", md: "2.5rem", lg: "3rem" };
      lines.push(`  --sn-input-height: ${sizeMap[components.input.size]};`);
    }
    if (components.input.variant) {
      lines.push(`  --sn-input-variant: ${components.input.variant};`);
    }
    if (lines.length > 0) {
      blocks.push(
        `:root {\n${lines.join("\n")}\n}`,
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
      lines.push(
        `  --sn-modal-overlay: ${overlayMap[components.modal.overlay]};`,
      );
      if (components.modal.overlay === "blur") {
        lines.push(`  --sn-modal-backdrop-filter: blur(4px);`);
      }
    }
    if (components.modal.animation) {
      lines.push(`  --sn-modal-animation: ${components.modal.animation};`);
    }
    if (lines.length > 0) {
      blocks.push(
        `:root {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.nav) {
    const lines: string[] = [];
    if (components.nav.variant) {
      lines.push(`  --sn-nav-variant: ${components.nav.variant};`);
    }
    if (components.nav.activeIndicator) {
      lines.push(
        `  --sn-nav-active-indicator: ${components.nav.activeIndicator};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(`:root {\n${lines.join("\n")}\n}`);
    }
  }

  if (components.badge) {
    const lines: string[] = [];
    if (components.badge.variant) {
      lines.push(`  --sn-badge-variant: ${components.badge.variant};`);
    }
    if (components.badge.rounded !== undefined) {
      lines.push(
        `  --sn-badge-radius: ${components.badge.rounded ? "9999px" : "var(--sn-radius-md)"};`,
      );
    }
    if (lines.length > 0) {
      blocks.push(
        `:root {\n${lines.join("\n")}\n}`,
      );
    }
  }

  if (components.toast) {
    const lines: string[] = [];
    if (components.toast.position) {
      lines.push(`  --sn-toast-position: ${components.toast.position};`);
    }
    if (components.toast.animation) {
      lines.push(`  --sn-toast-animation: ${components.toast.animation};`);
    }
    if (lines.length > 0) {
      blocks.push(
        `:root {\n${lines.join("\n")}\n}`,
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
    // Start with flavor's dark colors, then auto-derive dark variants
    // for any colors the user has overridden
    darkColors = { ...baseFlavor.darkColors };
    if (overrides.colors) {
      const derivedFromOverrides = autoDerivedarkenColors(
        overrides.colors as ThemeColors,
      );
      darkColors = deepMerge(
        darkColors as Record<string, unknown>,
        derivedFromOverrides as Record<string, unknown>,
      ) as ThemeColors;
    }
  } else {
    darkColors = autoDerivedarkenColors(lightColors);
  }

  const darkVars = generateColorVars(darkColors, true);

  // 6. Radius — emit all scale stops so components can reference any size
  const spacingMultiplier = parseFloat(SPACING_MAP[spacing]);
  lightVars.push(`  --sn-radius-none: 0;`);
  lightVars.push(`  --sn-radius-xs: 0.125rem;`);
  lightVars.push(`  --sn-radius-sm: 0.25rem;`);
  lightVars.push(`  --sn-radius-md: ${RADIUS_MAP[radius]};`);
  lightVars.push(`  --sn-radius-lg: 0.75rem;`);
  lightVars.push(`  --sn-radius-xl: 1rem;`);
  lightVars.push(`  --sn-radius-full: 9999px;`);

  // Spacing — emit all scale stops (2xs through 3xl)
  lightVars.push(
    `  --sn-spacing-2xs: ${(0.125 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-xs: ${(0.25 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-sm: ${(0.5 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-md: ${(1 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-lg: ${(1.5 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-xl: ${(2 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-2xl: ${(3 * spacingMultiplier).toFixed(3)}rem;`,
  );
  lightVars.push(
    `  --sn-spacing-3xl: ${(4 * spacingMultiplier).toFixed(3)}rem;`,
  );

  // Font
  if (font.sans) {
    lightVars.push(`  --sn-font-sans: ${font.sans};`);
  }
  if (font.mono) {
    lightVars.push(`  --sn-font-mono: ${font.mono};`);
  }
  if (font.display) {
    lightVars.push(`  --sn-font-display: ${font.display};`);
  }
  if (font.baseSize) {
    lightVars.push(`  --sn-font-size-base: ${font.baseSize}px;`);
  }
  if (font.scale) {
    lightVars.push(`  --sn-font-scale: ${font.scale};`);
  }
  // Font size scale stops — computed from base size when overridden
  const base = font.baseSize ?? 16;
  lightVars.push(`  --sn-font-size-xs: ${(base * 0.75).toFixed(1)}px;`);
  lightVars.push(`  --sn-font-size-sm: ${(base * 0.875).toFixed(1)}px;`);
  lightVars.push(`  --sn-font-size-md: ${base}px;`);
  lightVars.push(`  --sn-font-size-lg: ${(base * 1.125).toFixed(1)}px;`);
  lightVars.push(`  --sn-font-size-xl: ${(base * 1.25).toFixed(1)}px;`);
  lightVars.push(`  --sn-font-size-2xl: ${(base * 1.5).toFixed(1)}px;`);
  lightVars.push(`  --sn-font-size-3xl: ${(base * 1.875).toFixed(1)}px;`);
  lightVars.push(`  --sn-font-size-4xl: ${(base * 2.25).toFixed(1)}px;`);
  // Font weight scale
  lightVars.push(`  --sn-font-weight-light: 300;`);
  lightVars.push(`  --sn-font-weight-normal: 400;`);
  lightVars.push(`  --sn-font-weight-medium: 500;`);
  lightVars.push(`  --sn-font-weight-semibold: 600;`);
  lightVars.push(`  --sn-font-weight-bold: 700;`);

  // Global tokens (durations, easings, opacity, etc.)
  const tokens: GlobalTokens = deepMerge(
    {} as Record<string, unknown>,
    (overrides.tokens ?? {}) as Record<string, unknown>,
  ) as GlobalTokens;

  // Shadow scale
  for (const [key, value] of Object.entries(SHADOW_MAP)) {
    lightVars.push(`  --sn-shadow-${key}: ${value};`);
  }

  // Z-index scale
  for (const [key, value] of Object.entries(Z_INDEX_MAP)) {
    lightVars.push(`  --sn-z-index-${key}: ${value};`);
  }

  // Breakpoint vars (for reference in JS, not media queries)
  for (const [key, value] of Object.entries(BREAKPOINTS)) {
    lightVars.push(`  --sn-bp-${key}: ${value}px;`);
  }

  // Animation/transition durations
  const durations = tokens.durations ?? {};
  lightVars.push(`  --sn-duration-instant: ${durations.instant ?? 50}ms;`);
  lightVars.push(`  --sn-duration-fast: ${durations.fast ?? 150}ms;`);
  lightVars.push(`  --sn-duration-normal: ${durations.normal ?? 250}ms;`);
  lightVars.push(`  --sn-duration-slow: ${durations.slow ?? 500}ms;`);

  // Easing functions
  const easings = tokens.easings ?? {};
  lightVars.push(
    `  --sn-ease-default: ${easings.default ?? "cubic-bezier(0.4, 0, 0.2, 1)"};`,
  );
  lightVars.push(
    `  --sn-ease-in: ${easings.in ?? "cubic-bezier(0.4, 0, 1, 1)"};`,
  );
  lightVars.push(
    `  --sn-ease-out: ${easings.out ?? "cubic-bezier(0, 0, 0.2, 1)"};`,
  );
  lightVars.push(
    `  --sn-ease-in-out: ${easings.inOut ?? "cubic-bezier(0.4, 0, 0.2, 1)"};`,
  );
  lightVars.push(
    `  --sn-ease-spring: ${easings.spring ?? "cubic-bezier(0.32, 0.72, 0, 1)"};`,
  );

  // Opacity scale
  const opacity = tokens.opacity ?? {};
  lightVars.push(`  --sn-opacity-disabled: ${opacity.disabled ?? 0.5};`);
  lightVars.push(`  --sn-opacity-hover: ${opacity.hover ?? 0.8};`);
  lightVars.push(`  --sn-opacity-muted: ${opacity.muted ?? 0.6};`);

  // Line-height scale
  const lineHeight = tokens.lineHeight ?? {};
  lightVars.push(`  --sn-leading-none: ${lineHeight.none ?? 1};`);
  lightVars.push(`  --sn-leading-tight: ${lineHeight.tight ?? 1.25};`);
  lightVars.push(`  --sn-leading-normal: ${lineHeight.normal ?? 1.5};`);
  lightVars.push(`  --sn-leading-relaxed: ${lineHeight.relaxed ?? 1.75};`);
  lightVars.push(`  --sn-leading-loose: ${lineHeight.loose ?? 2};`);

  // Letter-spacing scale
  const tracking = tokens.tracking ?? {};
  lightVars.push(`  --sn-tracking-tight: ${tracking.tight ?? "-0.025em"};`);
  lightVars.push(`  --sn-tracking-normal: ${tracking.normal ?? "0"};`);
  lightVars.push(`  --sn-tracking-wide: ${tracking.wide ?? "0.05em"};`);

  // Border-width scale
  const borderWidth = tokens.borderWidth ?? {};
  lightVars.push(`  --sn-border-none: ${borderWidth.none ?? "0"};`);
  lightVars.push(`  --sn-border-thin: ${borderWidth.thin ?? "1px"};`);
  lightVars.push(`  --sn-border-default: ${borderWidth.default ?? "2px"};`);
  lightVars.push(`  --sn-border-thick: ${borderWidth.thick ?? "4px"};`);

  // Color aliases
  lightVars.push(`  --sn-color-surface: var(--sn-color-card);`);
  lightVars.push(`  --sn-color-text: var(--sn-color-foreground);`);

  // Container max-widths
  lightVars.push(`  --sn-container-xs: 20rem;`);
  lightVars.push(`  --sn-container-sm: 24rem;`);
  lightVars.push(`  --sn-container-md: 32rem;`);
  lightVars.push(`  --sn-container-lg: 42rem;`);
  lightVars.push(`  --sn-container-xl: 56rem;`);
  lightVars.push(`  --sn-container-2xl: 72rem;`);
  lightVars.push(`  --sn-container-full: 100%;`);
  lightVars.push(`  --sn-container-prose: 65ch;`);

  // Focus ring
  lightVars.push(`  --sn-ring-width: 2px;`);
  lightVars.push(`  --sn-ring-offset: 2px;`);
  lightVars.push(
    `  --sn-ring-color: var(--sn-color-ring, var(--sn-color-primary));`,
  );

  // Modal sizes
  lightVars.push(`  --sn-modal-size-sm: 24rem;`);
  lightVars.push(`  --sn-modal-size-md: 32rem;`);
  lightVars.push(`  --sn-modal-size-lg: 42rem;`);
  lightVars.push(`  --sn-modal-size-xl: 56rem;`);

  // 7. Component tokens
  const componentBlocks = generateComponentTokenCss(components);

  // 7.5 Font imports — must appear before any other CSS rules
  const fontImports: string[] = [];

  if (font.url) {
    // Explicit font URL takes priority
    fontImports.push(`@import url(${font.url});`);
  } else {
    // Auto-detect known Google Font families from sans, display, and mono
    const seen = new Set<string>();
    for (const fontName of [font.sans, font.display, font.mono]) {
      if (!fontName) continue;
      // The font value may include fallbacks (e.g. "Inter, sans-serif"),
      // so extract the first family name
      const firstName = fontName.split(",")[0]!.trim().replace(/^['"]|['"]$/g, "");
      if (KNOWN_GOOGLE_FONTS.has(firstName) && !seen.has(firstName)) {
        seen.add(firstName);
        fontImports.push(googleFontImport(firstName));
      }
    }
  }

  // 8. Build CSS output
  const sections: string[] = [];

  // Add color-scheme for native dark scrollbars, form controls, etc.
  lightVars.push(`  color-scheme: light;`);
  darkVars.push(`  color-scheme: dark;`);

  sections.push(`:root {\n${lightVars.join("\n")}\n}`);
  sections.push(`.dark {\n${darkVars.join("\n")}\n}`);

  if (componentBlocks.length > 0) {
    sections.push(componentBlocks.join("\n\n"));
  }

  // Prepend @import statements (CSS requires @import before all other rules)
  const prefix = fontImports.length > 0 ? fontImports.join("\n") + "\n\n" : "";

  return prefix + sections.join("\n\n") + "\n";
}

// ── Framework styles ─────────────────────────────────────────────────────────

/**
 * Returns a CSS string containing framework-level styles:
 *
 * 1. CSS reset (box-sizing, margin, padding, body defaults, font inherit)
 * 2. Component polish CSS — data-attribute-driven styles for page layout,
 *    data-table, stat-card, form, detail-card, and focus rings.
 *
 * All values are parameterized via `--sn-*` token custom properties so the
 * output adapts to whatever theme tokens are active.
 */
export function resolveFrameworkStyles(): string {
  return `/* ── CSS Reset ──────────────────────────────────────────────────────────── */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--sn-font-sans, system-ui, -apple-system, sans-serif);
  font-size: var(--sn-font-size-md, 1rem);
  line-height: var(--sn-leading-normal, 1.5);
  color: var(--sn-color-foreground);
  background: var(--sn-color-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
button, input, textarea, select { font: inherit; }

/* ── Page layout ───────────────────────────────────────────────────────── */

[data-snapshot-page] {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-lg, 1.5rem);
}

/* ── Data table ────────────────────────────────────────────────────────── */

[data-snapshot-component="data-table"] {
  overflow: hidden;
  border: var(--sn-card-border, 1px solid var(--sn-color-border));
  border-radius: var(--sn-radius-lg, 0.75rem);
  background: var(--sn-color-card, #ffffff);
}
[data-snapshot-component="data-table"] [data-table-search] {
  padding: var(--sn-spacing-md, 1rem) var(--sn-spacing-md, 1rem) 0;
}
[data-snapshot-component="data-table"] table {
  font-size: var(--sn-font-size-sm, 0.875rem);
}
[data-snapshot-component="data-table"] thead {
  background: var(--sn-table-header-bg, var(--sn-color-muted));
}
[data-snapshot-component="data-table"] th {
  color: var(--sn-color-muted-foreground, #667085);
  font-size: 0.73rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
[data-snapshot-component="data-table"] td,
[data-snapshot-component="data-table"] th {
  border-bottom: 1px solid var(--sn-color-border, #e5e7eb);
}
[data-snapshot-component="data-table"] tbody tr:last-child td {
  border-bottom: 0;
}
[data-snapshot-component="data-table"] [data-row-action],
[data-snapshot-component="data-table"] [data-bulk-action],
[data-snapshot-component="data-table"] [data-table-pagination] button {
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  background: var(--sn-color-background, #ffffff);
  color: var(--sn-color-foreground, #111827);
  padding: 0.4rem 0.65rem;
  font-weight: 500;
}
[data-snapshot-component="data-table"] [data-table-pagination] {
  padding: 0.75rem var(--sn-spacing-md, 1rem);
}
[data-snapshot-component="data-table"] [data-table-bulk-actions] {
  margin: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
}

/* ── Stat card ─────────────────────────────────────────────────────────── */

[data-snapshot-component="stat-card"] {
  background: var(--sn-color-card, #ffffff);
  border: var(--sn-card-border, 1px solid var(--sn-color-border, #e5e7eb));
  border-radius: var(--sn-radius-lg, 0.75rem);
  box-shadow: var(--sn-card-shadow, var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)));
  padding: var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem));
}

/* ── Form ──────────────────────────────────────────────────────────────── */

[data-snapshot-component="form"] form {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-md, 1rem);
  max-width: min(100%, 36rem);
}
[data-snapshot-component="form"] [data-sn-field] {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
[data-snapshot-component="form"] [data-sn-field] label {
  font-size: var(--sn-font-size-sm, 0.875rem);
  font-weight: 500;
  color: var(--sn-color-foreground, #111);
}
[data-snapshot-component="form"] input[type="text"],
[data-snapshot-component="form"] input[type="email"],
[data-snapshot-component="form"] input[type="password"],
[data-snapshot-component="form"] input[type="number"],
[data-snapshot-component="form"] input[type="date"],
[data-snapshot-component="form"] textarea,
[data-snapshot-component="form"] select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.375rem);
  background: var(--sn-color-background, #fff);
  color: var(--sn-color-foreground, #111);
  font-size: var(--sn-font-size-sm, 0.875rem);
  line-height: 1.5;
  width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
}
[data-snapshot-component="form"] input:focus,
[data-snapshot-component="form"] textarea:focus,
[data-snapshot-component="form"] select:focus {
  outline: none;
  border-color: var(--sn-color-primary, #2563eb);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent);
}
[data-snapshot-component="form"] textarea {
  min-height: 5rem;
  resize: vertical;
}
[data-snapshot-component="form"] [data-sn-field] label:has(input[type="checkbox"]) {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
[data-snapshot-component="form"] input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--sn-color-primary, #2563eb);
}
[data-snapshot-component="form"] [data-sn-field-error] {
  font-size: var(--sn-font-size-xs, 0.75rem);
  color: var(--sn-color-destructive, #dc2626);
}
[data-snapshot-component="form"] [data-sn-submit] {
  padding: 0.5rem 1rem;
  background: var(--sn-color-primary, #2563eb);
  color: var(--sn-color-primary-foreground, #fff);
  border: none;
  border-radius: var(--sn-radius-md, 0.375rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.15s;
}
[data-snapshot-component="form"] [data-sn-submit]:hover { opacity: 0.9; }
[data-snapshot-component="form"] [data-sn-submit]:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Detail card ───────────────────────────────────────────────────────── */

[data-snapshot-component="detail-card"] {
  max-width: 32rem;
}

/* ── Generic component constraints ─────────────────────────────────────── */

[data-snapshot-component] {
  max-width: 100%;
}

/* ── Focus ring for interactive controls ───────────────────────────────── */

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: 2px;
}
`;
}
