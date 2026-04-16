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
} from "./types";
import {
  colorToOklch,
  oklchToString,
  deriveForeground,
  deriveDarkVariant,
} from "./color";
import { getFlavor } from "./flavors";
import { getRegisteredSchemaTypes } from "../manifest/schema";

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

function getFontFamilyName(
  fontRole: FontConfig["sans"] | FontConfig["mono"] | FontConfig["display"],
): string | undefined {
  if (!fontRole) {
    return undefined;
  }

  return typeof fontRole === "string" ? fontRole : fontRole.family;
}

function getFontWeights(
  fontRole: FontConfig["sans"] | FontConfig["mono"] | FontConfig["display"],
): number[] | undefined {
  if (!fontRole || typeof fontRole === "string") {
    return undefined;
  }

  return fontRole.weights;
}

function getGoogleFontImport(
  family: string,
  weights?: number[],
): string {
  const encoded = family.replace(/\s+/g, "+");
  const normalizedWeights =
    weights && weights.length > 0
      ? [...new Set(weights)].sort((left, right) => left - right).join(";")
      : "300;400;500;600;700";
  return `@import url(https://fonts.googleapis.com/css2?family=${encoded}:wght@${normalizedWeights}&display=swap);`;
}

function getFontFaceRule(
  family: string,
  url: string,
  weights?: number[],
): string {
  const weight = weights?.length === 1 ? `\n  font-weight: ${weights[0]};` : "";
  return `@font-face {\n  font-family: '${family}';\n  src: url('${url}');${weight}\n  font-display: swap;\n}`;
}

const ALL_COMPONENT_TYPES = [
  "stat-card",
  "data-table",
  "form",
  "auto-form",
  "stack",
  "text",
  "link",
  "divider",
  "oauth-buttons",
  "passkey-button",
  "button",
  "detail-card",
  "modal",
  "drawer",
  "tabs",
  "badge",
  "avatar",
  "alert",
  "progress",
  "skeleton",
  "switch",
  "empty-state",
  "accordion",
  "breadcrumb",
  "list",
  "tooltip",
  "timeline",
  "code-block",
  "stepper",
  "tree-view",
  "kanban",
  "calendar",
  "audit-log",
  "notification-feed",
  "dropdown-menu",
  "pricing-table",
  "file-uploader",
  "rich-text-editor",
  "rich-input",
  "emoji-picker",
  "reaction-bar",
  "presence-indicator",
  "typing-indicator",
  "message-thread",
  "comment-section",
  "chat-window",
  "popover",
  "separator",
  "command-palette",
  "input",
  "textarea",
  "toggle",
  "multi-select",
  "context-menu",
  "scroll-area",
  "filter-bar",
  "inline-edit",
  "markdown",
  "tag-selector",
  "entity-picker",
  "highlighted-text",
  "favorite-button",
  "notification-bell",
  "save-indicator",
  "compare-view",
  "quick-add",
  "location-input",
  "avatar-group",
  "link-embed",
  "gif-picker",
  "feed",
  "chart",
  "wizard",
  "spinner",
  "error-page",
  "not-found",
  "offline-banner",
  "carousel",
  "video",
  "embed",
  "vote",
  "banner",
  "split-pane",
  "box",
  "collapsible",
  "icon-button",
  "hover-card",
  "toggle-group",
  "nav-logo",
  "nav-link",
  "nav-dropdown",
  "nav-section",
  "nav-search",
  "nav-user-menu",
] as const;

const SURFACE_COMPONENT_TYPES = [
  "alert",
  "audit-log",
  "avatar-group",
  "banner",
  "calendar",
  "carousel",
  "chart",
  "chat-window",
  "code-block",
  "command-palette",
  "comment-section",
  "compare-view",
  "context-menu",
  "detail-card",
  "dropdown-menu",
  "embed",
  "emoji-picker",
  "entity-picker",
  "error-page",
  "favorite-button",
  "feed",
  "file-uploader",
  "filter-bar",
  "gif-picker",
  "highlighted-text",
  "inline-edit",
  "kanban",
  "link-embed",
  "list",
  "location-input",
  "markdown",
  "message-thread",
  "multi-select",
  "not-found",
  "notification-bell",
  "notification-feed",
  "offline-banner",
  "popover",
  "pricing-table",
  "progress",
  "quick-add",
  "reaction-bar",
  "rich-input",
  "rich-text-editor",
  "save-indicator",
  "scroll-area",
  "separator",
  "skeleton",
  "split-pane",
  "stat-card",
  "stepper",
  "switch",
  "tabs",
  "tag-selector",
  "timeline",
  "toggle",
  "tooltip",
  "tree-view",
  "video",
  "vote",
  "wizard",
].filter((value, index, array) => array.indexOf(value) === index);

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

  /**
   * Resolve a color shorthand to a CSS value.
   *   "primary"    → var(--sn-color-primary)
   *   "muted"      → var(--sn-color-muted)
   *   "primary/20" → color-mix(in oklch, var(--sn-color-primary) 20%, var(--sn-color-background))
   *   raw CSS      → passed through as-is
   */
  /**
   * Resolve a spacing shorthand to CSS.
   *   "xs"       → var(--sn-spacing-xs)
   *   "xs sm"    → var(--sn-spacing-xs) var(--sn-spacing-sm)
   *   raw CSS    → passed through as-is
   */
  const SPACING_TOKENS = new Set(["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]);
  function resolveSpacingRef(value: string): string {
    const trimmed = value.trim();
    // Already raw CSS (contains parens, px, rem, etc.)
    if (/[().]/.test(trimmed)) return trimmed;
    // Split on whitespace — each part could be a token name
    const parts = trimmed.split(/\s+/);
    if (parts.every((p) => SPACING_TOKENS.has(p))) {
      return parts.map((p) => `var(--sn-spacing-${p})`).join(" ");
    }
    return trimmed;
  }

  function resolveColorRef(value: string): string {
    const trimmed = value.trim();
    // Already raw CSS (contains parens, #hex, oklch, etc.)
    if (/[()#]/.test(trimmed)) return trimmed;
    // token/percentage shorthand
    const slashMatch = trimmed.match(/^([a-z][\w-]*)\s*\/\s*(\d{1,3})$/i);
    if (slashMatch) {
      const [, token, pct] = slashMatch;
      return `color-mix(in oklch, var(--sn-color-${token}) ${pct}%, var(--sn-color-background))`;
    }
    // bare token name
    if (/^[a-z][\w-]*$/i.test(trimmed)) {
      return `var(--sn-color-${trimmed})`;
    }
    return trimmed;
  }

  void resolveSpacingRef;
  void resolveColorRef;

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

  if (components.scrollbar) {
    const lines: string[] = [];
    if (components.scrollbar.width) {
      lines.push(`  --sn-scrollbar-width: ${components.scrollbar.width};`);
    }
    if (components.scrollbar.track) {
      lines.push(`  --sn-scrollbar-track: ${components.scrollbar.track};`);
    }
    if (components.scrollbar.thumb) {
      lines.push(`  --sn-scrollbar-thumb: ${components.scrollbar.thumb};`);
    }
    if (components.scrollbar.thumbHover) {
      lines.push(
        `  --sn-scrollbar-thumb-hover: ${components.scrollbar.thumbHover};`,
      );
    }
    if (components.scrollbar.radius) {
      lines.push(
        `  --sn-scrollbar-radius: var(--sn-radius-${components.scrollbar.radius});`,
      );
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
  const sansFamily = getFontFamilyName(font.sans);
  const monoFamily = getFontFamilyName(font.mono);
  const displayFamily = getFontFamilyName(font.display);

  if (sansFamily) {
    lightVars.push(`  --sn-font-sans: ${sansFamily};`);
  }
  if (monoFamily) {
    lightVars.push(`  --sn-font-mono: ${monoFamily};`);
  }
  if (displayFamily) {
    lightVars.push(`  --sn-font-display: ${displayFamily};`);
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
  const fontFaces: string[] = [];
  const seenGoogleFonts = new Set<string>();

  for (const fontRole of [font.sans, font.display, font.mono]) {
    if (!fontRole) {
      continue;
    }

    if (typeof fontRole === "string") {
      const firstName = fontRole
        .split(",")[0]!
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (KNOWN_GOOGLE_FONTS.has(firstName) && !seenGoogleFonts.has(firstName)) {
        seenGoogleFonts.add(firstName);
        fontImports.push(getGoogleFontImport(firstName));
      }
      continue;
    }

    if (fontRole.source === "google") {
      if (!seenGoogleFonts.has(fontRole.family)) {
        seenGoogleFonts.add(fontRole.family);
        fontImports.push(getGoogleFontImport(fontRole.family, fontRole.weights));
      }
      continue;
    }

    fontFaces.push(
      getFontFaceRule(fontRole.family, fontRole.url!, getFontWeights(fontRole)),
    );
  }

  // 8. Build CSS output
  const sections: string[] = [];

  // Add color-scheme for native dark scrollbars, form controls, etc.
  lightVars.push(`  color-scheme: light;`);
  darkVars.push(`  color-scheme: dark;`);

  sections.push(`:root {\n${lightVars.join("\n")}\n}`);
  sections.push(`.dark {\n${darkVars.join("\n")}\n}`);

  if (fontFaces.length > 0) {
    sections.push(fontFaces.join("\n\n"));
  }

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
export function resolveFrameworkStyles(options?: {
  respectReducedMotion?: boolean;
}): string {
  const allComponentSelector = [
    ...new Set([...ALL_COMPONENT_TYPES, ...getRegisteredSchemaTypes()]),
  ]
    .map(
    (type) => `[data-snapshot-component="${type}"]`,
  )
    .join(",\n");
  const surfaceSelector = SURFACE_COMPONENT_TYPES.map(
    (type) => `[data-snapshot-component="${type}"]`,
  ).join(",\n");
  const reducedMotionCss =
    options?.respectReducedMotion === false
      ? ""
      : `
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: var(--sn-duration-instant, 0ms) !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: var(--sn-duration-instant, 0ms) !important;
  }
}
`;
  return `/* ── CSS Reset ──────────────────────────────────────────────────────────── */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html {
  font-family: var(--sn-font-sans, system-ui, -apple-system, sans-serif);
  font-size: var(--sn-font-size-base, 16px);
  line-height: var(--sn-leading-normal, 1.5);
  color: var(--sn-color-foreground, #111827);
  background: var(--sn-color-background, #ffffff);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  text-size-adjust: 100%;
  tab-size: 4;
  -moz-tab-size: 4;
}
body {
  min-height: 100dvh;
  font-family: inherit;
  font-size: var(--sn-font-size-md, 1rem);
  line-height: inherit;
  color: inherit;
  background: inherit;
}
button, input, textarea, select { font: inherit; }
img, picture, video, canvas, svg { display: block; max-width: 100%; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
#root { isolation: isolate; }
a { color: inherit; text-decoration-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 35%, transparent); }
table { width: 100%; border-collapse: collapse; }
code, pre { font-family: var(--sn-font-mono, ui-monospace, SFMono-Regular, monospace); }
pre {
  background: color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 75%, var(--sn-color-card, #ffffff));
  border: var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-lg, 0.75rem);
  overflow: auto;
}

/* ── Page layout ───────────────────────────────────────────────────────── */

[data-snapshot-page] {
  display: grid;
  gap: var(--sn-spacing-lg, 1.5rem);
  width: 100%;
}

${allComponentSelector} {
  max-width: 100%;
  min-width: 0;
}

${surfaceSelector} {
  background: var(--sn-color-card, #ffffff);
  border: var(--sn-card-border, var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb));
  border-radius: var(--sn-radius-lg, 0.75rem);
  box-shadow: var(--sn-card-shadow, var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)));
}

[data-snapshot-component="stack"],
[data-snapshot-component="row"],
[data-snapshot-component="container"],
[data-snapshot-component="grid"],
[data-snapshot-component="section"],
[data-snapshot-component="spacer"],
[data-snapshot-component="text"],
[data-snapshot-component="link"],
[data-snapshot-component="divider"],
[data-snapshot-component="separator"],
[data-snapshot-component="oauth-buttons"],
[data-snapshot-component="passkey-button"],
[data-snapshot-component="box"],
[data-snapshot-component="collapsible"],
[data-snapshot-component="icon-button"],
[data-snapshot-component="toggle-group"],
[data-snapshot-component="nav-logo"],
[data-snapshot-component="nav-link"],
[data-snapshot-component="nav-dropdown"],
[data-snapshot-component="nav-section"],
[data-snapshot-component="nav-search"],
[data-snapshot-component="nav-user-menu"] {
  background: transparent;
  border: none;
  box-shadow: none;
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

/* Layout primitives */

[data-snapshot-component="row"],
[data-snapshot-component="container"],
[data-snapshot-component="grid"],
[data-snapshot-component="section"] {
  width: 100%;
}

[data-snapshot-component="grid"] {
  display: grid;
}

[data-snapshot-component="section"] {
  position: relative;
  isolation: isolate;
}

[data-snapshot-component="spacer"] {
  pointer-events: none;
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

[data-snapshot-component="form"] form,
[data-snapshot-component="auto-form"] form {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-md, 1rem);
  max-width: min(100%, 36rem);
}
[data-snapshot-component="form"] [data-sn-field],
[data-snapshot-component="auto-form"] [data-sn-field] {
  display: flex;
  flex-direction: column;
  gap: var(--sn-spacing-2xs, 0.125rem);
}
[data-snapshot-component="form"] [data-sn-field] label,
[data-snapshot-component="auto-form"] [data-sn-field] label {
  font-size: var(--sn-font-size-sm, 0.875rem);
  font-weight: var(--sn-font-weight-medium, 500);
  color: var(--sn-color-foreground, #111827);
}
[data-snapshot-component="input"] input,
[data-snapshot-component="textarea"] textarea,
[data-snapshot-component="multi-select"] input,
[data-snapshot-component="location-input"] input,
[data-snapshot-component="quick-add"] input,
[data-snapshot-component="tag-selector"] input,
[data-snapshot-component="form"] input[type="text"],
[data-snapshot-component="form"] input[type="email"],
[data-snapshot-component="form"] input[type="password"],
[data-snapshot-component="form"] input[type="number"],
[data-snapshot-component="form"] input[type="date"],
[data-snapshot-component="form"] textarea,
[data-snapshot-component="form"] select,
[data-snapshot-component="auto-form"] input[type="text"],
[data-snapshot-component="auto-form"] input[type="email"],
[data-snapshot-component="auto-form"] input[type="password"],
[data-snapshot-component="auto-form"] input[type="number"],
[data-snapshot-component="auto-form"] input[type="date"],
[data-snapshot-component="auto-form"] textarea,
[data-snapshot-component="auto-form"] select {
  width: 100%;
  min-height: var(--sn-input-height, 2.5rem);
  padding: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
  border: var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb);
  border-radius: var(--sn-radius-md, 0.5rem);
  background: var(--sn-color-background, #ffffff);
  color: var(--sn-color-foreground, #111827);
  font-size: var(--sn-font-size-sm, 0.875rem);
  line-height: var(--sn-leading-normal, 1.5);
  transition:
    border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
    box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
    background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
}
[data-snapshot-component="form"] input:focus,
[data-snapshot-component="form"] textarea:focus,
[data-snapshot-component="form"] select:focus,
[data-snapshot-component="auto-form"] input:focus,
[data-snapshot-component="auto-form"] textarea:focus,
[data-snapshot-component="auto-form"] select:focus,
[data-snapshot-component="input"] input:focus,
[data-snapshot-component="textarea"] textarea:focus {
  outline: none;
  border-color: var(--sn-color-primary, #2563eb);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent);
}
[data-snapshot-component="form"] textarea,
[data-snapshot-component="auto-form"] textarea,
[data-snapshot-component="textarea"] textarea {
  min-height: 5rem;
  resize: vertical;
}
[data-snapshot-component="form"] [data-sn-field] label:has(input[type="checkbox"]),
[data-snapshot-component="auto-form"] [data-sn-field] label:has(input[type="checkbox"]) {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
[data-snapshot-component="form"] input[type="checkbox"],
[data-snapshot-component="auto-form"] input[type="checkbox"],
[data-snapshot-component="switch"] input,
[data-snapshot-component="toggle"] input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--sn-color-primary, #2563eb);
}
[data-snapshot-component="form"] [data-sn-field-error],
[data-snapshot-component="auto-form"] [data-sn-field-error] {
  font-size: var(--sn-font-size-xs, 0.75rem);
  color: var(--sn-color-destructive, #dc2626);
}
[data-snapshot-component="form"] [data-sn-submit],
[data-snapshot-component="auto-form"] [data-sn-submit] {
  padding: 0.5rem 1rem;
  background: var(--sn-color-primary, #2563eb);
  color: var(--sn-color-primary-foreground, #fff);
  border: none;
  border-radius: var(--sn-radius-md, 0.5rem);
  font-size: var(--sn-font-size-sm, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.15s;
}
[data-snapshot-component="form"] [data-sn-submit]:hover,
[data-snapshot-component="auto-form"] [data-sn-submit]:hover { opacity: 0.9; }
[data-snapshot-component="form"] [data-sn-submit]:disabled,
[data-snapshot-component="auto-form"] [data-sn-submit]:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Detail card ───────────────────────────────────────────────────────── */

[data-snapshot-component="detail-card"] {
  max-width: 32rem;
}
[data-snapshot-component="badge"] {
  display: inline-flex;
  align-items: center;
  gap: var(--sn-spacing-xs, 0.25rem);
  border-radius: var(--sn-badge-radius, var(--sn-radius-full, 9999px));
  white-space: nowrap;
}
[data-snapshot-component="avatar"] img,
[data-snapshot-component="avatar"] [data-avatar-fallback],
[data-snapshot-component="avatar"] [data-testid="avatar-initials"] {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
[data-snapshot-component="alert"] {
  padding: var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem);
}
[data-snapshot-component="empty-state"] {
  display: grid;
  place-items: center;
  gap: var(--sn-spacing-md, 1rem);
  min-height: 12rem;
  padding: var(--sn-spacing-xl, 2rem);
  text-align: center;
}
[data-snapshot-component="list"] {
  overflow: hidden;
}
[data-snapshot-component="list"] [data-list-item] {
  border-bottom: var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb);
}
[data-snapshot-component="list"] [data-list-item]:last-child {
  border-bottom: 0;
}
[data-snapshot-component="breadcrumb"] ol {
  list-style: none;
}
[data-snapshot-component="tabs"] [data-tab-list] {
  display: flex;
  gap: var(--sn-spacing-xs, 0.25rem);
  border-bottom: var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb);
  padding-bottom: 0;
}
[data-snapshot-component="tabs"] [data-tab-content] {
  padding-top: var(--sn-spacing-md, 1rem);
}
[data-snapshot-component="modal"] [data-modal-overlay],
[data-snapshot-component="drawer"] [data-drawer-overlay] {
  backdrop-filter: var(--sn-modal-backdrop-filter, none);
  -webkit-backdrop-filter: var(--sn-modal-backdrop-filter, none);
}
[data-snapshot-component="modal"] [data-modal-content],
[data-snapshot-component="drawer"] [data-drawer-content],
[data-snapshot-component="popover"] {
  background: var(--sn-color-card, #ffffff);
  border: var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb);
  box-shadow: var(--sn-shadow-xl, 0 25px 50px -12px rgba(0,0,0,0.25));
}

/* ── Generic component constraints ─────────────────────────────────────── */

[data-snapshot-component] {
  max-width: 100%;
}

/* ── Focus ring for interactive controls ───────────────────────────────── */

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
[role="button"]:focus-visible,
[role="tab"]:focus-visible,
a:focus-visible {
  outline: var(--sn-ring-width, 2px) solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}

/* Scrollbars */

* {
  scrollbar-width: thin;
  scrollbar-color: var(--sn-scrollbar-thumb, var(--sn-color-muted, #e5e7eb)) var(--sn-scrollbar-track, transparent);
}

*::-webkit-scrollbar {
  width: var(--sn-scrollbar-width, 8px);
  height: var(--sn-scrollbar-width, 8px);
}

*::-webkit-scrollbar-track {
  background: var(--sn-scrollbar-track, transparent);
}

*::-webkit-scrollbar-thumb {
  background: var(--sn-scrollbar-thumb, var(--sn-color-muted, #e5e7eb));
  border-radius: var(--sn-scrollbar-radius, var(--sn-radius-full, 9999px));
}

*::-webkit-scrollbar-thumb:hover {
  background: var(--sn-scrollbar-thumb-hover, var(--sn-color-primary, #2563eb));
}

[data-snapshot-skip-links] {
  position: fixed;
  top: var(--sn-spacing-sm, 0.5rem);
  left: var(--sn-spacing-sm, 0.5rem);
  z-index: var(--sn-z-index-toast, 60);
}

[data-snapshot-skip-links] a {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(-200%);
  padding: var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem);
  border-radius: var(--sn-radius-md, 0.5rem);
  background: var(--sn-color-card, #ffffff);
  border: var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb);
  box-shadow: var(--sn-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

[data-snapshot-skip-links] a:focus {
  transform: translateY(0);
}

/* ── Built-in animations ──────────────────────────────────────────────── */

@keyframes sn-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes sn-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sn-fade-down {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sn-slide-left {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes sn-slide-right {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes sn-scale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes snapshot-spinner {
  to { transform: rotate(360deg); }
}
@keyframes sn-bounce {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-8px); }
}
${reducedMotionCss}
`;
}
