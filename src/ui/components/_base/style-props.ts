/**
 * Pure style prop resolution functions.
 *
 * These are SSR-safe — no hooks, no side effects, no DOM access.
 * They take config objects and return CSS strings or CSSProperties.
 */

import type { CSSProperties } from "react";
import { resolveComponentBackgroundStyle } from "./background-style";

// ── Token Maps ────────────────────────────��─────────────────────────────────

const SPACING_MAP: Record<string, string> = {
  none: "0",
  "2xs": "var(--sn-spacing-2xs, 0.125rem)",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 0.75rem)",
  lg: "var(--sn-spacing-lg, 1rem)",
  xl: "var(--sn-spacing-xl, 1.5rem)",
  "2xl": "var(--sn-spacing-2xl, 2rem)",
  "3xl": "var(--sn-spacing-3xl, 3rem)",
};

const RADIUS_MAP: Record<string, string> = {
  none: "0",
  xs: "var(--sn-radius-xs, 0.125rem)",
  sm: "var(--sn-radius-sm, 0.25rem)",
  md: "var(--sn-radius-md, 0.375rem)",
  lg: "var(--sn-radius-lg, 0.75rem)",
  xl: "var(--sn-radius-xl, 1rem)",
  full: "var(--sn-radius-full, 9999px)",
};

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  xs: "var(--sn-shadow-xs, 0 1px 2px rgba(0,0,0,0.05))",
  sm: "var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1))",
  md: "var(--sn-shadow-md, 0 4px 6px rgba(0,0,0,0.1))",
  lg: "var(--sn-shadow-lg, 0 10px 15px rgba(0,0,0,0.1))",
  xl: "var(--sn-shadow-xl, 0 20px 25px rgba(0,0,0,0.1))",
};

const COLOR_MAP: Record<string, string> = {
  primary: "var(--sn-color-primary)",
  secondary: "var(--sn-color-secondary)",
  accent: "var(--sn-color-accent)",
  muted: "var(--sn-color-muted)",
  destructive: "var(--sn-color-destructive)",
  success: "var(--sn-color-success)",
  warning: "var(--sn-color-warning)",
  info: "var(--sn-color-info)",
  background: "var(--sn-color-background)",
  foreground: "var(--sn-color-foreground)",
  card: "var(--sn-color-card)",
  popover: "var(--sn-color-popover)",
  border: "var(--sn-color-border)",
  input: "var(--sn-color-input)",
  "primary-foreground": "var(--sn-color-primary-foreground)",
  "secondary-foreground": "var(--sn-color-secondary-foreground)",
  "muted-foreground": "var(--sn-color-muted-foreground)",
  "accent-foreground": "var(--sn-color-accent-foreground)",
  "destructive-foreground": "var(--sn-color-destructive-foreground)",
  "success-foreground": "var(--sn-color-success-foreground)",
  "warning-foreground": "var(--sn-color-warning-foreground)",
  "info-foreground": "var(--sn-color-info-foreground)",
  "card-foreground": "var(--sn-color-card-foreground)",
  "popover-foreground": "var(--sn-color-popover-foreground)",
};

const FONT_SIZE_MAP: Record<string, string> = {
  xs: "var(--sn-font-size-xs, 0.75rem)",
  sm: "var(--sn-font-size-sm, 0.875rem)",
  base: "var(--sn-font-size-base, 1rem)",
  lg: "var(--sn-font-size-lg, 1.125rem)",
  xl: "var(--sn-font-size-xl, 1.25rem)",
  "2xl": "var(--sn-font-size-2xl, 1.5rem)",
  "3xl": "var(--sn-font-size-3xl, 1.875rem)",
  "4xl": "var(--sn-font-size-4xl, 2.25rem)",
};

const FONT_WEIGHT_MAP: Record<string, string> = {
  light: "var(--sn-font-weight-light, 300)",
  normal: "var(--sn-font-weight-normal, 400)",
  medium: "var(--sn-font-weight-medium, 500)",
  semibold: "var(--sn-font-weight-semibold, 600)",
  bold: "var(--sn-font-weight-bold, 700)",
};

const LINE_HEIGHT_MAP: Record<string, string> = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
};

const LETTER_SPACING_MAP: Record<string, string> = {
  tight: "-0.025em",
  normal: "0",
  wide: "0.025em",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function resolve(
  value: unknown,
  map: Record<string, string>,
): string | undefined {
  if (value == null) return undefined;
  const v = String(value);
  return map[v] ?? v;
}

/** Resolve a color token name to a CSS var, or pass through raw values. */
export function resolveColor(value: string): string {
  return COLOR_MAP[value] ?? value;
}

/** Resolve a shadow token name to a CSS value. */
export function resolveShadow(value: string): string {
  return SHADOW_MAP[value] ?? value;
}

/** Resolve a radius token name to a CSS value. */
export function resolveRadius(value: string): string {
  return RADIUS_MAP[value] ?? value;
}

/**
 * Extract the base value from a responsive prop.
 * If the value is a responsive object `{ default, sm?, md?, ... }`, returns `default`.
 * Otherwise returns the value as-is.
 */
function baseValue(value: unknown): unknown {
  if (
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "default" in (value as Record<string, unknown>)
  ) {
    return (value as Record<string, unknown>).default;
  }
  return value;
}

// ── resolveStyleProps ───────────────────────────────────────────────────────

/**
 * Resolve token-aware style props to React CSSProperties.
 *
 * Pure function — no hooks, no side effects, no DOM. SSR-safe.
 * For responsive values, uses the `default` breakpoint.
 */
export function resolveStyleProps(
  config: Record<string, unknown>,
): CSSProperties {
  const s: CSSProperties = {};

  const background = baseValue(config.background);
  if (background != null && typeof background === "string") {
    s.background = resolveColor(background);
  }

  const backgroundColor = baseValue(config.backgroundColor);
  if (backgroundColor != null && typeof backgroundColor === "string") {
    s.backgroundColor = resolveColor(backgroundColor);
  }

  const padding = baseValue(config.padding);
  if (padding != null) s.padding = resolve(padding, SPACING_MAP);

  const paddingX = baseValue(config.paddingX);
  if (paddingX != null) {
    const v = resolve(paddingX, SPACING_MAP);
    s.paddingLeft = v;
    s.paddingRight = v;
  }

  const paddingY = baseValue(config.paddingY);
  if (paddingY != null) {
    const v = resolve(paddingY, SPACING_MAP);
    s.paddingTop = v;
    s.paddingBottom = v;
  }

  const margin = baseValue(config.margin);
  if (margin != null) s.margin = resolve(margin, SPACING_MAP);

  const marginX = baseValue(config.marginX);
  if (marginX != null) {
    const v = resolve(marginX, SPACING_MAP);
    s.marginLeft = v;
    s.marginRight = v;
  }

  const marginY = baseValue(config.marginY);
  if (marginY != null) {
    const v = resolve(marginY, SPACING_MAP);
    s.marginTop = v;
    s.marginBottom = v;
  }

  const gap = baseValue(config.gap);
  if (gap != null) s.gap = resolve(gap, SPACING_MAP);

  const width = baseValue(config.width);
  if (width != null) s.width = width as string;

  const minWidth = baseValue(config.minWidth);
  if (minWidth != null) s.minWidth = minWidth as string;

  const maxWidth = baseValue(config.maxWidth);
  if (maxWidth != null) s.maxWidth = maxWidth as string;

  const height = baseValue(config.height);
  if (height != null) s.height = height as string;

  const minHeight = baseValue(config.minHeight);
  if (minHeight != null) s.minHeight = minHeight as string;

  const maxHeight = baseValue(config.maxHeight);
  if (maxHeight != null) s.maxHeight = maxHeight as string;

  if (config.bg != null) {
    if (typeof config.bg === "string") {
      s.background = resolveColor(config.bg);
    }
    if (typeof config.bg === "object" && !Array.isArray(config.bg)) {
      Object.assign(
        s,
        resolveComponentBackgroundStyle(
          config.bg as Parameters<typeof resolveComponentBackgroundStyle>[0],
        ),
      );
    }
  }

  if (config.color != null) {
    s.color = resolve(config.color, COLOR_MAP);
  }

  if (config.borderRadius != null) {
    s.borderRadius = resolve(config.borderRadius, RADIUS_MAP);
  }

  if (config.border != null) {
    s.border = config.border as string;
  }

  if (config.shadow != null) {
    s.boxShadow = resolve(config.shadow, SHADOW_MAP);
  }

  if (config.opacity != null) {
    s.opacity = config.opacity as number;
  }

  if (config.overflow != null) {
    s.overflow = config.overflow as string;
  }

  if (config.cursor != null) {
    s.cursor = config.cursor as string;
  }

  if (config.position != null) {
    s.position = config.position as CSSProperties["position"];
  }

  if (config.inset != null) {
    s.inset = config.inset as string;
  }

  const display = baseValue(config.display);
  if (display != null) {
    s.display = display as string;
  }

  const flexDirection = baseValue(config.flexDirection);
  if (flexDirection != null) {
    s.flexDirection = flexDirection as CSSProperties["flexDirection"];
  }

  if (config.alignItems != null) {
    s.alignItems = resolve(config.alignItems, ALIGN_MAP);
  }

  if (config.justifyContent != null) {
    s.justifyContent = resolve(config.justifyContent, JUSTIFY_MAP);
  }

  if (config.flexWrap != null) {
    s.flexWrap = config.flexWrap as CSSProperties["flexWrap"];
  }

  if (config.flex != null) {
    s.flex = config.flex as string;
  }

  if (config.gridTemplateColumns != null) {
    s.gridTemplateColumns = config.gridTemplateColumns as string;
  }

  if (config.gridTemplateRows != null) {
    s.gridTemplateRows = config.gridTemplateRows as string;
  }

  if (config.gridColumn != null) {
    s.gridColumn = config.gridColumn as string;
  }

  if (config.gridRow != null) {
    s.gridRow = config.gridRow as string;
  }

  if (config.textAlign != null) {
    s.textAlign = config.textAlign as CSSProperties["textAlign"];
  }

  const fontSize = baseValue(config.fontSize);
  if (fontSize != null) {
    s.fontSize = resolve(fontSize, FONT_SIZE_MAP);
  }

  if (config.fontWeight != null) {
    s.fontWeight =
      typeof config.fontWeight === "number"
        ? config.fontWeight
        : (resolve(
            config.fontWeight,
            FONT_WEIGHT_MAP,
          ) as CSSProperties["fontWeight"]);
  }

  if (config.lineHeight != null) {
    s.lineHeight = resolve(config.lineHeight, LINE_HEIGHT_MAP);
  }

  if (config.letterSpacing != null) {
    s.letterSpacing = resolve(config.letterSpacing, LETTER_SPACING_MAP);
  }

  return s;
}

// ── resolveInteractiveCSS ───────────────────────────────────────────────────

/** Hover state config shape. */
export interface HoverConfig {
  bg?: string;
  color?: string;
  shadow?: string;
  borderRadius?: string;
  border?: string;
  opacity?: number;
  transform?: string;
  scale?: number;
}

/** Focus state config shape. */
export interface FocusConfig {
  bg?: string;
  color?: string;
  shadow?: string;
  ring?: boolean | string;
  outline?: string;
}

/** Active state config shape. */
export interface ActiveConfig {
  bg?: string;
  color?: string;
  transform?: string;
  scale?: number;
}

/**
 * Generate scoped CSS for interactive states (hover, focus, active).
 *
 * Uses `[data-snapshot-id="<id>"]` as the selector.
 * Returns null when no interactive props are present.
 */
export function resolveInteractiveCSS(
  id: string,
  hover?: HoverConfig,
  focus?: FocusConfig,
  active?: ActiveConfig,
): string | null {
  const rules: string[] = [];
  const sel = `[data-snapshot-id="${id}"]`;
  const important = (declaration: string): string => `${declaration} !important`;

  if (hover) {
    const props: string[] = [];
    if (hover.bg) props.push(important(`background: ${resolveColor(hover.bg)}`));
    if (hover.color) props.push(important(`color: ${resolveColor(hover.color)}`));
    if (hover.shadow)
      props.push(important(`box-shadow: ${resolveShadow(hover.shadow)}`));
    if (hover.opacity != null) props.push(important(`opacity: ${hover.opacity}`));
    if (hover.transform || hover.scale != null) {
      const parts: string[] = [];
      if (hover.transform) parts.push(hover.transform as string);
      if (hover.scale != null) parts.push(`scale(${hover.scale})`);
      props.push(important(`transform: ${parts.join(" ")}`));
    }
    if (hover.border) props.push(important(`border: ${hover.border}`));
    if (hover.borderRadius)
      props.push(important(`border-radius: ${resolveRadius(hover.borderRadius)}`));
    if (props.length)
      rules.push(
        `${sel}:hover { ${props.join("; ")}; transition: all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease); }`,
      );
  }

  if (focus) {
    const props: string[] = [];
    if (focus.bg) props.push(important(`background: ${resolveColor(focus.bg)}`));
    if (focus.color) props.push(important(`color: ${resolveColor(focus.color)}`));
    if (focus.shadow)
      props.push(important(`box-shadow: ${resolveShadow(focus.shadow)}`));
    if (focus.ring === true)
      props.push(
        important(
          `outline: 2px solid var(--sn-ring-color, var(--sn-color-primary))`,
        ),
        important(`outline-offset: var(--sn-ring-offset, 2px)`),
      );
    else if (typeof focus.ring === "string")
      props.push(
        important(`outline: 2px solid ${resolveColor(focus.ring)}`),
        important("outline-offset: 2px"),
      );
    if (focus.outline) props.push(important(`outline: ${focus.outline}`));
    if (props.length)
      rules.push(`${sel}:focus-visible { ${props.join("; ")} }`);
  }

  if (active) {
    const props: string[] = [];
    if (active.bg) props.push(important(`background: ${resolveColor(active.bg)}`));
    if (active.color) props.push(important(`color: ${resolveColor(active.color)}`));
    if (active.transform || active.scale != null) {
      const parts: string[] = [];
      if (active.transform) parts.push(active.transform as string);
      if (active.scale != null) parts.push(`scale(${active.scale})`);
      props.push(important(`transform: ${parts.join(" ")}`));
    }
    if (props.length) rules.push(`${sel}:active { ${props.join("; ")} }`);
  }

  return rules.length ? rules.join("\n") : null;
}

// ── resolveResponsiveCSS ────────────────────────────────────────────────────

const BREAKPOINTS: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/** Map style prop names to CSS property names for responsive CSS generation. */
const PROP_TO_CSS: Record<string, string | string[]> = {
  padding: "padding",
  paddingX: "padding-inline",
  paddingY: "padding-block",
  margin: "margin",
  marginX: "margin-inline",
  marginY: "margin-block",
  gap: "gap",
  width: "width",
  minWidth: "min-width",
  maxWidth: "max-width",
  height: "height",
  minHeight: "min-height",
  maxHeight: "max-height",
  fontSize: "font-size",
  display: "display",
  flexDirection: "flex-direction",
};

/** Resolve a token value based on the prop name. */
function resolveTokenValue(prop: string, value: string): string {
  if (
    [
      "padding",
      "paddingX",
      "paddingY",
      "margin",
      "marginX",
      "marginY",
      "gap",
    ].includes(prop)
  ) {
    return SPACING_MAP[value] ?? value;
  }
  if (prop === "fontSize") return FONT_SIZE_MAP[value] ?? value;
  return value;
}

/**
 * Generate responsive CSS media queries for breakpoint-mapped style props.
 *
 * Uses `[data-snapshot-id="<id>"]` as the selector.
 * Returns null when no responsive props are present.
 */
export function resolveResponsiveCSS(
  id: string,
  config: Record<string, unknown>,
): string | null {
  const defaultRules: string[] = [];
  const bpRulesMap: Record<string, string[]> = {};

  for (const [prop, value] of Object.entries(config)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    if (!("default" in (value as Record<string, unknown>))) continue;

    const cssProps = PROP_TO_CSS[prop];
    if (!cssProps) continue;

    const responsive = value as Record<string, string>;
    const cssPropNames = typeof cssProps === "string" ? [cssProps] : cssProps;

    for (const [bp, bpValue] of Object.entries(responsive)) {
      if (bpValue == null) continue;
      const resolved = resolveTokenValue(prop, String(bpValue));
      if (bp === "default") {
        for (const cssProp of cssPropNames) {
          defaultRules.push(`${cssProp}: ${resolved}`);
        }
      } else {
        if (!bpRulesMap[bp]) bpRulesMap[bp] = [];
        for (const cssProp of cssPropNames) {
          bpRulesMap[bp]!.push(`${cssProp}: ${resolved}`);
        }
      }
    }
  }

  const sel = `[data-snapshot-id="${id}"]`;
  const css: string[] = [];

  // Skip default rules — they're handled by inline styles via resolveStyleProps
  for (const bp of ["sm", "md", "lg", "xl", "2xl"] as const) {
    const rules = bpRulesMap[bp];
    if (!rules?.length) continue;
    const minWidth = BREAKPOINTS[bp];
    if (minWidth) {
      css.push(
        `@media (min-width: ${minWidth}px) { ${sel} { ${rules.join("; ")}; } }`,
      );
    }
  }

  return css.length ? css.join("\n") : null;
}
