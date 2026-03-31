import { type TokenCategory, type TokenSet, tokenSetSchema } from "./schema";
import type {
  BreakpointTokens,
  ColorTokens,
  InteractionTokens,
  RadiusTokens,
  ShadowTokens,
  SpacingTokens,
  TransitionTokens,
  TypographyTokens,
  ZIndexTokens,
} from "./schema";

// ── Deep merge utility ───────────────────────────────────────────────────────

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T extends Record<string, unknown>>(base: T, override: DeepPartial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const overrideVal = override[key];
    if (overrideVal === undefined) continue;
    const baseVal = base[key];
    if (
      baseVal !== null &&
      overrideVal !== null &&
      typeof baseVal === "object" &&
      typeof overrideVal === "object" &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overrideVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as DeepPartial<Record<string, unknown>>,
      ) as T[keyof T];
    } else {
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}

// ── Category preset registries ───────────────────────────────────────────────

type CategoryPresetMap<T> = Record<string, T>;

const colorPresets: CategoryPresetMap<ColorTokens> = {
  default: {
    primary: {
      light: "oklch(0.21 0.006 285.89)",
      dark: "oklch(0.92 0.004 286.32)",
    },
    "primary-foreground": {
      light: "oklch(0.98 0.002 247.86)",
      dark: "oklch(0.21 0.006 285.89)",
    },
    secondary: {
      light: "oklch(0.97 0.001 286.38)",
      dark: "oklch(0.27 0.005 286.03)",
    },
    "secondary-foreground": {
      light: "oklch(0.21 0.006 285.89)",
      dark: "oklch(0.98 0.002 247.86)",
    },
    destructive: {
      light: "oklch(0.58 0.22 27.33)",
      dark: "oklch(0.70 0.19 27.33)",
    },
    "destructive-foreground": {
      light: "oklch(0.98 0.002 247.86)",
      dark: "oklch(0.98 0.002 247.86)",
    },
    muted: {
      light: "oklch(0.97 0.001 286.38)",
      dark: "oklch(0.27 0.005 286.03)",
    },
    "muted-foreground": {
      light: "oklch(0.55 0.014 285.94)",
      dark: "oklch(0.71 0.01 286.07)",
    },
    accent: {
      light: "oklch(0.97 0.001 286.38)",
      dark: "oklch(0.27 0.005 286.03)",
    },
    "accent-foreground": {
      light: "oklch(0.21 0.006 285.89)",
      dark: "oklch(0.98 0.002 247.86)",
    },
    background: { light: "oklch(1.0 0 0)", dark: "oklch(0.15 0.005 286.07)" },
    foreground: {
      light: "oklch(0.14 0.005 285.82)",
      dark: "oklch(0.98 0.002 247.86)",
    },
    card: { light: "oklch(1.0 0 0)", dark: "oklch(0.15 0.005 286.07)" },
    "card-foreground": {
      light: "oklch(0.14 0.005 285.82)",
      dark: "oklch(0.98 0.002 247.86)",
    },
    popover: { light: "oklch(1.0 0 0)", dark: "oklch(0.15 0.005 286.07)" },
    "popover-foreground": {
      light: "oklch(0.14 0.005 285.82)",
      dark: "oklch(0.98 0.002 247.86)",
    },
    border: {
      light: "oklch(0.92 0.004 286.32)",
      dark: "oklch(0.27 0.005 286.03)",
    },
    input: {
      light: "oklch(0.92 0.004 286.32)",
      dark: "oklch(0.27 0.005 286.03)",
    },
    ring: {
      light: "oklch(0.21 0.006 285.89)",
      dark: "oklch(0.87 0.006 286.28)",
    },
  },
  ocean: {
    primary: { light: "oklch(0.55 0.15 240)", dark: "oklch(0.70 0.12 240)" },
    "primary-foreground": { light: "oklch(0.99 0 0)", dark: "oklch(0.15 0 0)" },
    secondary: { light: "oklch(0.94 0.03 220)", dark: "oklch(0.25 0.03 220)" },
    "secondary-foreground": {
      light: "oklch(0.25 0.03 220)",
      dark: "oklch(0.94 0.03 220)",
    },
    destructive: { light: "oklch(0.58 0.22 27)", dark: "oklch(0.70 0.19 27)" },
    "destructive-foreground": {
      light: "oklch(0.99 0 0)",
      dark: "oklch(0.99 0 0)",
    },
    muted: { light: "oklch(0.96 0.01 220)", dark: "oklch(0.22 0.02 220)" },
    "muted-foreground": {
      light: "oklch(0.50 0.05 220)",
      dark: "oklch(0.65 0.04 220)",
    },
    accent: { light: "oklch(0.90 0.06 200)", dark: "oklch(0.30 0.05 200)" },
    "accent-foreground": {
      light: "oklch(0.20 0.03 200)",
      dark: "oklch(0.95 0.02 200)",
    },
    background: {
      light: "oklch(0.99 0.005 220)",
      dark: "oklch(0.13 0.02 230)",
    },
    foreground: { light: "oklch(0.15 0.02 230)", dark: "oklch(0.96 0.01 220)" },
    card: { light: "oklch(1.0 0 0)", dark: "oklch(0.16 0.02 230)" },
    "card-foreground": {
      light: "oklch(0.15 0.02 230)",
      dark: "oklch(0.96 0.01 220)",
    },
    popover: { light: "oklch(1.0 0 0)", dark: "oklch(0.16 0.02 230)" },
    "popover-foreground": {
      light: "oklch(0.15 0.02 230)",
      dark: "oklch(0.96 0.01 220)",
    },
    border: { light: "oklch(0.90 0.03 220)", dark: "oklch(0.28 0.03 230)" },
    input: { light: "oklch(0.90 0.03 220)", dark: "oklch(0.28 0.03 230)" },
    ring: { light: "oklch(0.55 0.15 240)", dark: "oklch(0.70 0.12 240)" },
  },
  forest: {
    primary: { light: "oklch(0.50 0.12 155)", dark: "oklch(0.65 0.10 155)" },
    "primary-foreground": { light: "oklch(0.99 0 0)", dark: "oklch(0.12 0 0)" },
    secondary: { light: "oklch(0.94 0.02 140)", dark: "oklch(0.25 0.02 140)" },
    "secondary-foreground": {
      light: "oklch(0.25 0.02 140)",
      dark: "oklch(0.94 0.02 140)",
    },
    destructive: { light: "oklch(0.58 0.20 25)", dark: "oklch(0.68 0.18 25)" },
    "destructive-foreground": {
      light: "oklch(0.99 0 0)",
      dark: "oklch(0.99 0 0)",
    },
    muted: { light: "oklch(0.96 0.01 140)", dark: "oklch(0.22 0.015 140)" },
    "muted-foreground": {
      light: "oklch(0.50 0.03 140)",
      dark: "oklch(0.65 0.03 140)",
    },
    accent: { light: "oklch(0.88 0.05 130)", dark: "oklch(0.28 0.04 130)" },
    "accent-foreground": {
      light: "oklch(0.20 0.02 130)",
      dark: "oklch(0.95 0.01 130)",
    },
    background: {
      light: "oklch(0.99 0.003 140)",
      dark: "oklch(0.12 0.015 150)",
    },
    foreground: {
      light: "oklch(0.15 0.015 150)",
      dark: "oklch(0.96 0.005 140)",
    },
    card: { light: "oklch(1.0 0 0)", dark: "oklch(0.15 0.015 150)" },
    "card-foreground": {
      light: "oklch(0.15 0.015 150)",
      dark: "oklch(0.96 0.005 140)",
    },
    popover: { light: "oklch(1.0 0 0)", dark: "oklch(0.15 0.015 150)" },
    "popover-foreground": {
      light: "oklch(0.15 0.015 150)",
      dark: "oklch(0.96 0.005 140)",
    },
    border: { light: "oklch(0.90 0.02 140)", dark: "oklch(0.27 0.02 150)" },
    input: { light: "oklch(0.90 0.02 140)", dark: "oklch(0.27 0.02 150)" },
    ring: { light: "oklch(0.50 0.12 155)", dark: "oklch(0.65 0.10 155)" },
  },
};

const spacingPresets: CategoryPresetMap<SpacingTokens> = {
  default: {
    px: "1px",
    "0.5": "0.125rem",
    "1": "0.25rem",
    "1.5": "0.375rem",
    "2": "0.5rem",
    "2.5": "0.625rem",
    "3": "0.75rem",
    "3.5": "0.875rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
    "12": "3rem",
    "14": "3.5rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "28": "7rem",
    "32": "8rem",
    "36": "9rem",
    "40": "10rem",
    "44": "11rem",
    "48": "12rem",
    "52": "13rem",
    "56": "14rem",
    "60": "15rem",
    "64": "16rem",
    "72": "18rem",
    "80": "20rem",
    "96": "24rem",
  },
  compact: {
    px: "1px",
    "0.5": "0.0625rem",
    "1": "0.125rem",
    "1.5": "0.1875rem",
    "2": "0.25rem",
    "2.5": "0.3125rem",
    "3": "0.375rem",
    "3.5": "0.4375rem",
    "4": "0.5rem",
    "5": "0.625rem",
    "6": "0.75rem",
    "7": "0.875rem",
    "8": "1rem",
    "9": "1.125rem",
    "10": "1.25rem",
    "12": "1.5rem",
    "14": "1.75rem",
    "16": "2rem",
    "20": "2.5rem",
    "24": "3rem",
    "28": "3.5rem",
    "32": "4rem",
    "36": "4.5rem",
    "40": "5rem",
    "44": "5.5rem",
    "48": "6rem",
    "52": "6.5rem",
    "56": "7rem",
    "60": "7.5rem",
    "64": "8rem",
    "72": "9rem",
    "80": "10rem",
    "96": "12rem",
  },
  spacious: {
    px: "1px",
    "0.5": "0.1875rem",
    "1": "0.375rem",
    "1.5": "0.5625rem",
    "2": "0.75rem",
    "2.5": "0.9375rem",
    "3": "1.125rem",
    "3.5": "1.3125rem",
    "4": "1.5rem",
    "5": "1.875rem",
    "6": "2.25rem",
    "7": "2.625rem",
    "8": "3rem",
    "9": "3.375rem",
    "10": "3.75rem",
    "12": "4.5rem",
    "14": "5.25rem",
    "16": "6rem",
    "20": "7.5rem",
    "24": "9rem",
    "28": "10.5rem",
    "32": "12rem",
    "36": "13.5rem",
    "40": "15rem",
    "44": "16.5rem",
    "48": "18rem",
    "52": "19.5rem",
    "56": "21rem",
    "60": "22.5rem",
    "64": "24rem",
    "72": "27rem",
    "80": "30rem",
    "96": "36rem",
  },
};

const radiusPresets: CategoryPresetMap<RadiusTokens> = {
  default: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  sharp: {
    none: "0",
    sm: "0.125rem",
    md: "0.1875rem",
    lg: "0.25rem",
    xl: "0.375rem",
    "2xl": "0.5rem",
    full: "9999px",
  },
  rounded: {
    none: "0",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  pill: {
    none: "0",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    full: "9999px",
  },
};

const typographyPresets: CategoryPresetMap<TypographyTokens> = {
  default: {
    fontFamily: {
      sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
      mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    fontWeight: {
      thin: "100",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      none: "1",
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },
  mono: {
    fontFamily: {
      sans: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
      serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
      mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
    },
    fontSize: {
      xs: "0.7rem",
      sm: "0.8rem",
      base: "0.9rem",
      lg: "1rem",
      xl: "1.1rem",
      "2xl": "1.3rem",
      "3xl": "1.6rem",
      "4xl": "2rem",
      "5xl": "2.5rem",
    },
    fontWeight: {
      thin: "100",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      none: "1",
      tight: "1.3",
      snug: "1.4",
      normal: "1.6",
      relaxed: "1.7",
      loose: "2",
    },
    letterSpacing: {
      tighter: "-0.03em",
      tight: "-0.015em",
      normal: "0em",
      wide: "0.015em",
      wider: "0.03em",
      widest: "0.06em",
    },
  },
};

const shadowPresets: CategoryPresetMap<ShadowTokens> = {
  default: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    none: "0 0 #0000",
  },
  soft: {
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.03)",
    md: "0 4px 8px -2px rgb(0 0 0 / 0.06)",
    lg: "0 10px 20px -5px rgb(0 0 0 / 0.06)",
    xl: "0 20px 40px -10px rgb(0 0 0 / 0.08)",
    "2xl": "0 25px 60px -15px rgb(0 0 0 / 0.12)",
    none: "0 0 #0000",
  },
};

const breakpointPresets: CategoryPresetMap<BreakpointTokens> = {
  default: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

const zIndexPresets: CategoryPresetMap<ZIndexTokens> = {
  default: {
    dropdown: "1000",
    sticky: "1100",
    overlay: "1200",
    modal: "1300",
    popover: "1400",
    tooltip: "1500",
    toast: "1600",
  },
};

const transitionPresets: CategoryPresetMap<TransitionTokens> = {
  default: {
    duration: { instant: "0ms", fast: "150ms", normal: "250ms", slow: "400ms" },
    easing: {
      "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },
  snappy: {
    duration: { instant: "0ms", fast: "100ms", normal: "175ms", slow: "275ms" },
    easing: {
      "ease-in": "cubic-bezier(0.5, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.1, 1)",
      "ease-in-out": "cubic-bezier(0.5, 0, 0.1, 1)",
      spring: "cubic-bezier(0.22, 1.8, 0.60, 1)",
    },
  },
};

const interactionPresets: CategoryPresetMap<InteractionTokens> = {
  default: {
    "hover:lift": "translateY(-2px)",
    "hover:glow": "0 0 12px 2px var(--color-ring)",
    "hover:darken": "brightness(0.92)",
    "hover:scale-up": "scale(1.03)",
    "press:scale-down": "scale(0.97)",
    "press:darken": "brightness(0.88)",
    "focus:ring": "0 0 0 2px var(--color-background), 0 0 0 4px var(--color-ring)",
    "focus:outline": "2px solid var(--color-ring)",
    "enter:fade-in": "fade-in 150ms ease-out",
    "enter:slide-up": "slide-up 200ms ease-out",
    "enter:scale-in": "scale-in 150ms ease-out",
  },
  subtle: {
    "hover:lift": "translateY(-1px)",
    "hover:glow": "0 0 8px 1px var(--color-ring)",
    "hover:darken": "brightness(0.95)",
    "hover:scale-up": "scale(1.015)",
    "press:scale-down": "scale(0.985)",
    "press:darken": "brightness(0.92)",
    "focus:ring": "0 0 0 1px var(--color-background), 0 0 0 3px var(--color-ring)",
    "focus:outline": "1.5px solid var(--color-ring)",
    "enter:fade-in": "fade-in 200ms ease-out",
    "enter:slide-up": "slide-up 250ms ease-out",
    "enter:scale-in": "scale-in 200ms ease-out",
  },
};

// ── Preset registries ────────────────────────────────────────────────────────

/** All category preset registries, keyed by category name. */
export const categoryPresets = {
  colors: colorPresets,
  spacing: spacingPresets,
  radius: radiusPresets,
  typography: typographyPresets,
  shadows: shadowPresets,
  breakpoints: breakpointPresets,
  zIndex: zIndexPresets,
  transitions: transitionPresets,
  interactions: interactionPresets,
} as const;

// ── Full presets (convenience bundles) ───────────────────────────────────────

/**
 * A full preset is a named bundle of category preset selections.
 * Each key picks which category preset to use.
 */
export interface FullPresetSpec {
  colors?: string;
  spacing?: string;
  radius?: string;
  typography?: string;
  shadows?: string;
  breakpoints?: string;
  zIndex?: string;
  transitions?: string;
  interactions?: string;
}

const fullPresets: Record<string, FullPresetSpec> = {
  default: {}, // all categories use 'default'
  minimal: { radius: "sharp", shadows: "soft", interactions: "subtle" },
  bold: { radius: "rounded", colors: "ocean" },
  forest: {
    colors: "forest",
    radius: "rounded",
    shadows: "soft",
    interactions: "subtle",
  },
};

// ── Token creation ───────────────────────────────────────────────────────────

/**
 * Configuration for createTokens. Supports three levels of composition:
 *
 * 1. `preset` — A full preset name (bundles category selections)
 * 2. `categories` — Per-category preset names (override the full preset)
 * 3. `overrides` — Deep partial token values (override everything)
 */
export interface CreateTokensConfig {
  /** Full preset name. Defaults to `'default'`. */
  preset?: string;
  /** Per-category preset selections. Override the full preset's choices. */
  categories?: Partial<Record<TokenCategory, string>>;
  /** Deep partial overrides applied on top of resolved presets. */
  overrides?: DeepPartial<TokenSet>;
}

/**
 * Creates a validated token set from composable presets + overrides.
 *
 * Resolution order:
 *   full preset → category presets → value overrides
 *
 * @example
 * ```ts
 * // Use defaults
 * createTokens()
 *
 * // Use ocean colors with compact spacing
 * createTokens({ categories: { colors: 'ocean', spacing: 'compact' } })
 *
 * // Full preset + one override
 * createTokens({
 *   preset: 'bold',
 *   overrides: { colors: { primary: { light: '#custom', dark: '#custom' } } }
 * })
 * ```
 */
export function createTokens(config: CreateTokensConfig = {}): TokenSet {
  const presetName = config.preset ?? "default";
  const fullPreset = fullPresets[presetName];
  if (!fullPreset && presetName !== "default") {
    throw new Error(
      `[snapshot] Unknown full preset: "${presetName}". Available: ${Object.keys(fullPresets).join(", ")}`,
    );
  }

  // Merge full preset selections with per-category overrides
  const categorySelections: Record<string, string> = {};
  for (const category of Object.keys(categoryPresets) as TokenCategory[]) {
    categorySelections[category] =
      config.categories?.[category] ?? fullPreset?.[category] ?? "default";
  }

  // Resolve each category
  const resolved: Record<string, unknown> = {};
  for (const [category, presetKey] of Object.entries(categorySelections)) {
    const registry = categoryPresets[category as TokenCategory] as CategoryPresetMap<unknown>;
    const preset = registry[presetKey];
    if (!preset) {
      const available = Object.keys(registry).join(", ");
      throw new Error(
        `[snapshot] Unknown ${category} preset: "${presetKey}". Available: ${available}`,
      );
    }
    resolved[category] = preset;
  }

  // Apply value overrides
  let tokenSet = resolved as TokenSet;
  if (config.overrides) {
    tokenSet = deepMerge(tokenSet, config.overrides as DeepPartial<TokenSet>);
  }

  // Validate
  const result = tokenSetSchema.safeParse(tokenSet);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`[snapshot] Invalid token set after resolution:\n${issues}`);
  }

  return result.data;
}

// ── Preset registration ──────────────────────────────────────────────────────

/**
 * Register a custom category preset.
 *
 * @example
 * ```ts
 * registerCategoryPreset('colors', 'brand', { primary: { light: '...', dark: '...' }, ... })
 * // Now usable: createTokens({ categories: { colors: 'brand' } })
 * ```
 */
export function registerCategoryPreset<C extends TokenCategory>(
  category: C,
  name: string,
  tokens: TokenSet[C],
): void {
  const registry = categoryPresets[category] as CategoryPresetMap<TokenSet[C]>;
  registry[name] = tokens;
}

/**
 * Register a custom full preset.
 *
 * @example
 * ```ts
 * registerFullPreset('brand', { colors: 'brand', radius: 'rounded', spacing: 'compact' })
 * // Now usable: createTokens({ preset: 'brand' })
 * ```
 */
export function registerFullPreset(name: string, spec: FullPresetSpec): void {
  fullPresets[name] = spec;
}
