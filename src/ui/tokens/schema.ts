import { z } from "zod";

// ── Color schemas ────────────────────────────────────────────────────────────

/** Zod schema for semantic color tokens. Each generates a CSS custom property. */
export const themeColorsSchema = z
  .object({
    /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
    primary: z.string().optional(),
    /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
    secondary: z.string().optional(),
    /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
    muted: z.string().optional(),
    /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
    accent: z.string().optional(),
    /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
    destructive: z.string().optional(),
    /** Success color. Generates `--success` and `--success-foreground`. */
    success: z.string().optional(),
    /** Warning color. Generates `--warning` and `--warning-foreground`. */
    warning: z.string().optional(),
    /** Info color. Generates `--info` and `--info-foreground`. */
    info: z.string().optional(),
    /** Page background. Generates `--background` and `--foreground`. */
    background: z.string().optional(),
    /** Card background. Generates `--card` and `--card-foreground`. */
    card: z.string().optional(),
    /** Popover background. Generates `--popover` and `--popover-foreground`. */
    popover: z.string().optional(),
    /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
    sidebar: z.string().optional(),
    /** Border color. Generates `--border`. */
    border: z.string().optional(),
    /** Input border color. Generates `--input`. */
    input: z.string().optional(),
    /** Focus ring color. Generates `--ring`. */
    ring: z.string().optional(),
    /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
    chart: z
      .tuple([z.string(), z.string(), z.string(), z.string(), z.string()])
      .optional(),
  })
  .strict();

// ── Scale schemas ────────────────────────────────────────────────────────────

/** Zod schema for border radius scale. */
export const radiusSchema = z.enum([
  "none",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "full",
]);

/** Zod schema for spacing density. */
export const spacingSchema = z.enum([
  "compact",
  "default",
  "comfortable",
  "spacious",
]);

// ── Font schema ──────────────────────────────────────────────────────────────

/** Zod schema for font configuration. */
export const fontSchema = z
  .object({
    /** Primary font family (body text, headings). */
    sans: z.string().optional(),
    /** Monospace font family (code, pre). */
    mono: z.string().optional(),
    /** Display font (large headings, hero text). */
    display: z.string().optional(),
    /** Base font size in px. Default: 16. */
    baseSize: z.number().min(10).max(24).optional(),
    /** Type scale ratio. Default: 1.25 (major third). */
    scale: z.number().min(1.1).max(1.5).optional(),
    /** Custom font URL (e.g. Google Fonts @import URL). */
    url: z.string().url().optional(),
  })
  .strict();

// ── Component tokens schema ──────────────────────────────────────────────────

/** Zod schema for component-level token overrides. */
export const componentTokensSchema = z
  .object({
    card: z
      .object({
        shadow: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
        padding: spacingSchema.optional(),
        border: z.boolean().optional(),
      })
      .strict()
      .optional(),
    table: z
      .object({
        striped: z.boolean().optional(),
        density: z.enum(["compact", "default", "comfortable"]).optional(),
        headerBackground: z.boolean().optional(),
        hoverRow: z.boolean().optional(),
        borderStyle: z.enum(["none", "horizontal", "grid"]).optional(),
      })
      .strict()
      .optional(),
    button: z
      .object({
        weight: z.enum(["light", "medium", "bold"]).optional(),
        uppercase: z.boolean().optional(),
        iconSize: z.enum(["sm", "md", "lg"]).optional(),
      })
      .strict()
      .optional(),
    input: z
      .object({
        size: z.enum(["sm", "md", "lg"]).optional(),
        variant: z.enum(["outline", "filled", "underline"]).optional(),
      })
      .strict()
      .optional(),
    modal: z
      .object({
        overlay: z.enum(["light", "dark", "blur"]).optional(),
        animation: z.enum(["fade", "scale", "slide-up", "none"]).optional(),
      })
      .strict()
      .optional(),
    nav: z
      .object({
        variant: z.enum(["minimal", "bordered", "filled"]).optional(),
        activeIndicator: z
          .enum(["background", "border-left", "border-bottom", "dot"])
          .optional(),
      })
      .strict()
      .optional(),
    badge: z
      .object({
        variant: z.enum(["solid", "outline", "soft"]).optional(),
        rounded: z.boolean().optional(),
      })
      .strict()
      .optional(),
    toast: z
      .object({
        position: z
          .enum(["top-right", "top-center", "bottom-right", "bottom-center"])
          .optional(),
        animation: z.enum(["slide", "fade", "pop"]).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

// ── Shadow schema ───────────────────────────────────────────────────────────

/** Zod schema for shadow scale. */
export const shadowSchema = z.enum(["none", "xs", "sm", "md", "lg", "xl"]);

// ── Additional global token schemas ─────────────────────────────────────────

/** Zod schema for global token overrides beyond colors/radius/spacing/font. */
export const globalTokensSchema = z
  .object({
    /** Shadow scale override. Default: uses flavor's shadow scale. */
    shadow: shadowSchema.optional(),
    /** Animation/transition duration scale. */
    durations: z
      .object({
        instant: z.number().min(0).max(200).optional(),
        fast: z.number().min(50).max(500).optional(),
        normal: z.number().min(100).max(1000).optional(),
        slow: z.number().min(200).max(2000).optional(),
      })
      .strict()
      .optional(),
    /** Easing functions. */
    easings: z
      .object({
        default: z.string().optional(),
        in: z.string().optional(),
        out: z.string().optional(),
        inOut: z.string().optional(),
        spring: z.string().optional(),
      })
      .strict()
      .optional(),
    /** Opacity scale overrides. */
    opacity: z
      .object({
        disabled: z.number().min(0).max(1).optional(),
        hover: z.number().min(0).max(1).optional(),
        muted: z.number().min(0).max(1).optional(),
      })
      .strict()
      .optional(),
    /** Line-height scale overrides. */
    lineHeight: z
      .object({
        none: z.number().optional(),
        tight: z.number().optional(),
        normal: z.number().optional(),
        relaxed: z.number().optional(),
        loose: z.number().optional(),
      })
      .strict()
      .optional(),
    /** Letter-spacing scale overrides. */
    tracking: z
      .object({
        tight: z.string().optional(),
        normal: z.string().optional(),
        wide: z.string().optional(),
      })
      .strict()
      .optional(),
    /** Border-width scale overrides. */
    borderWidth: z
      .object({
        none: z.string().optional(),
        thin: z.string().optional(),
        default: z.string().optional(),
        thick: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

/**
 * Zod schema for manifest-declared flavor extensions.
 *
 * All flavor fields are optional except `extends`, which points to the parent
 * flavor that this declaration inherits from.
 */
export const flavorOverrideSchema = z
  .object({
    extends: z.string().min(1),
    displayName: z.string().optional(),
    colors: themeColorsSchema.optional(),
    darkColors: themeColorsSchema.optional(),
    radius: radiusSchema.optional(),
    spacing: spacingSchema.optional(),
    font: fontSchema.optional(),
    components: componentTokensSchema.optional(),
  })
  .strict();

// ── Theme config schema ─────────────────────────────────────────────────────

/** Zod schema for the full theme configuration in the manifest. */
export const themeConfigSchema = z
  .object({
    /** Named flavor preset. Provides all base tokens. */
    flavor: z.string().optional(),
    /** Manifest-declared flavors keyed by flavor name. */
    flavors: z.record(flavorOverrideSchema).optional(),
    /** Token overrides applied on top of the flavor. */
    overrides: z
      .object({
        colors: themeColorsSchema.optional(),
        darkColors: themeColorsSchema.optional(),
        radius: radiusSchema.optional(),
        spacing: spacingSchema.optional(),
        font: fontSchema.optional(),
        components: componentTokensSchema.optional(),
        tokens: globalTokensSchema.optional(),
      })
      .strict()
      .optional(),
    /** Initial color mode. 'system' follows prefers-color-scheme. */
    mode: z.enum(["light", "dark", "system"]).optional(),
    /** Token editor runtime persistence target. */
    editor: z
      .object({
        persist: z
          .union([
            z.literal("none"),
            z.literal("localStorage"),
            z.literal("sessionStorage"),
            z.object({ resource: z.string() }).strict(),
          ])
          .default("localStorage"),
      })
      .strict()
      .optional(),
  })
  .strict();
