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

// ── Theme config schema ─────────────────────────────────────────────────────

/** Zod schema for the full theme configuration in the manifest. */
export const themeConfigSchema = z
  .object({
    /** Named flavor preset. Provides all base tokens. */
    flavor: z.string().optional(),
    /** Token overrides applied on top of the flavor. */
    overrides: z
      .object({
        colors: themeColorsSchema.optional(),
        darkColors: themeColorsSchema.optional(),
        radius: radiusSchema.optional(),
        spacing: spacingSchema.optional(),
        font: fontSchema.optional(),
        components: componentTokensSchema.optional(),
      })
      .strict()
      .optional(),
    /** Initial color mode. 'system' follows prefers-color-scheme. */
    mode: z.enum(["light", "dark", "system"]).optional(),
  })
  .strict();
