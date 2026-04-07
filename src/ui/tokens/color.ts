/**
 * Color conversion utilities for the design token system.
 *
 * All color values are internally represented as oklch(L C H) where:
 * - L = perceptual lightness [0, 1]
 * - C = chroma [0, ~0.4]
 * - H = hue angle [0, 360)
 *
 * No external dependencies. Implements sRGB -> linear RGB -> OKLab -> OKLCH pipeline.
 */

// ── Internal helpers ─────────────────────────────────────────────────────────

/** Convert a single sRGB channel [0,1] to linear RGB. */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Convert a single linear RGB channel to sRGB [0,1]. */
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** Convert linear RGB to OKLab. */
function linearRgbToOklab(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_cbrt = Math.cbrt(l_);
  const m_cbrt = Math.cbrt(m_);
  const s_cbrt = Math.cbrt(s_);

  const L =
    0.2104542553 * l_cbrt + 0.793617785 * m_cbrt - 0.0040720468 * s_cbrt;
  const a =
    1.9779984951 * l_cbrt - 2.428592205 * m_cbrt + 0.4505937099 * s_cbrt;
  const bVal =
    0.0259040371 * l_cbrt + 0.7827717662 * m_cbrt - 0.808675766 * s_cbrt;

  return [L, a, bVal];
}

/** Convert OKLab to linear RGB. */
function oklabToLinearRgb(
  L: number,
  a: number,
  b: number,
): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bOut = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return [r, g, bOut];
}

/** OKLab to OKLCH. */
function oklabToOklch(
  L: number,
  a: number,
  b: number,
): [number, number, number] {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

/** OKLCH to OKLab. */
function oklchToOklab(
  L: number,
  C: number,
  H: number,
): [number, number, number] {
  const hRad = (H * Math.PI) / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

/** Parse a hex color string to RGB [0,1] channels. */
function parseHex(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  }
  const num = parseInt(h, 16);
  return [(num >> 16) / 255, ((num >> 8) & 0xff) / 255, (num & 0xff) / 255];
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert a hex color string to OKLCH values.
 *
 * @param hex - CSS hex color (e.g. "#ff0000", "#f00")
 * @returns Tuple of [lightness, chroma, hue]
 */
export function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = parseHex(hex);
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [L, a, bVal] = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, bVal);
}

/**
 * Convert HSL values to OKLCH.
 *
 * @param h - Hue in degrees [0, 360)
 * @param s - Saturation [0, 100]
 * @param l - Lightness [0, 100]
 * @returns Tuple of [lightness, chroma, hue]
 */
export function hslToOklch(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  // HSL -> sRGB
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  r += m;
  g += m;
  b += m;

  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [L, a, bVal] = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, bVal);
}

/**
 * Format OKLCH values as a CSS-compatible string (without the oklch() wrapper).
 * Output format: "L C H" where L, C, H are rounded to 3 decimal places.
 *
 * @param l - Lightness [0, 1]
 * @param c - Chroma [0, ~0.4]
 * @param h - Hue [0, 360)
 * @returns Formatted string like "0.637 0.237 25.465"
 */
export function oklchToString(l: number, c: number, h: number): string {
  return `${round(l)} ${round(c)} ${round(h)}`;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Parse an oklch string (the CSS variable format "L C H") back to values.
 *
 * @param str - OKLCH string like "0.637 0.237 25.465"
 * @returns Tuple of [lightness, chroma, hue]
 */
export function parseOklchString(str: string): [number, number, number] {
  const parts = str.trim().split(/\s+/);
  return [parseFloat(parts[0]!), parseFloat(parts[1]!), parseFloat(parts[2]!)];
}

/**
 * Convert any supported color string to OKLCH values.
 * Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function.
 *
 * @param color - Color string in any supported format
 * @returns Tuple of [lightness, chroma, hue]
 */
export function colorToOklch(color: string): [number, number, number] {
  const trimmed = color.trim();

  // Already an oklch() wrapper — extract inner values
  if (trimmed.startsWith("oklch(")) {
    const inner = trimmed.slice(6, -1).trim();
    return parseOklchString(inner);
  }

  // Hex color
  if (trimmed.startsWith("#")) {
    return hexToOklch(trimmed);
  }

  // Try parsing as raw oklch string "L C H"
  const parts = trimmed.split(/\s+/);
  if (parts.length === 3 && parts.every((p) => !isNaN(parseFloat(p)))) {
    return parseOklchString(trimmed);
  }

  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Compute relative luminance from OKLCH for WCAG contrast calculations.
 * Uses sRGB relative luminance (rec. 709) from the linear RGB values.
 */
function oklchToRelativeLuminance(l: number, c: number, h: number): number {
  const [la, a, b] = oklchToOklab(l, c, h);
  const [lr, lg, lb] = oklabToLinearRgb(la, a, b);
  // Clamp to [0,1] for out-of-gamut colors
  const rc = Math.max(0, Math.min(1, lr));
  const gc = Math.max(0, Math.min(1, lg));
  const bc = Math.max(0, Math.min(1, lb));
  return 0.2126 * rc + 0.7152 * gc + 0.0722 * bc;
}

/**
 * Calculate WCAG contrast ratio between two colors.
 *
 * @returns Contrast ratio >= 1 (higher is better, 4.5:1 is WCAG AA for normal text)
 */
function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Derive a foreground color that passes WCAG AA contrast (4.5:1) against
 * the given background color. Returns a light or dark foreground.
 *
 * @param backgroundColor - Background color in any supported format
 * @returns OKLCH string for the foreground color
 */
export function deriveForeground(backgroundColor: string): string {
  const [l, c, h] = colorToOklch(backgroundColor);
  const bgLum = oklchToRelativeLuminance(l, c, h);

  // White foreground luminance
  const whiteLum = 1.0;
  // Dark foreground luminance (very dark gray)
  const darkL = 0.145;
  const darkLum = oklchToRelativeLuminance(darkL, 0, 0);

  const whiteContrast = contrastRatio(whiteLum, bgLum);
  const darkContrast = contrastRatio(darkLum, bgLum);

  if (whiteContrast >= darkContrast) {
    // Light foreground on dark background
    return oklchToString(0.985, 0, 0);
  } else {
    // Dark foreground on light background
    return oklchToString(0.145, 0, 0);
  }
}

/**
 * Derive a dark mode variant of a light color.
 * Adjusts lightness and chroma for dark mode readability:
 * - If the color is light (L > 0.5), reduce lightness moderately
 * - If the color is dark (L <= 0.5), increase lightness for dark backgrounds
 * - Boost chroma slightly for vibrancy in dark mode
 *
 * @param lightColor - Light mode color in any supported format
 * @returns OKLCH string for the dark mode variant
 */
export function deriveDarkVariant(lightColor: string): string {
  const [l, c, h] = colorToOklch(lightColor);

  let darkL: number;
  let darkC: number;

  if (l > 0.85) {
    // Very light colors (backgrounds): make very dark
    darkL = 0.15 + (1 - l) * 0.3;
    darkC = Math.min(c * 1.2, 0.03);
  } else if (l > 0.7) {
    // Light-ish colors: reduce lightness to mid-range
    darkL = 0.45 + (l - 0.7) * 0.6;
    darkC = Math.min(c * 1.15, 0.35);
  } else if (l > 0.4) {
    // Medium colors: boost slightly for dark mode visibility
    darkL = Math.min(l + 0.12, 0.78);
    darkC = Math.min(c * 1.1, 0.35);
  } else {
    // Already dark colors: lighten for visibility on dark backgrounds
    darkL = Math.min(l + 0.35, 0.8);
    darkC = Math.min(c * 1.1, 0.35);
  }

  return oklchToString(darkL, darkC, h);
}

/**
 * Convert OKLCH values back to a hex color string.
 * Used for serializing runtime overrides.
 *
 * @param l - Lightness [0, 1]
 * @param c - Chroma [0, ~0.4]
 * @param h - Hue [0, 360)
 * @returns CSS hex color string (e.g. "#ff0000")
 */
export function oklchToHex(l: number, c: number, h: number): string {
  const [la, a, b] = oklchToOklab(l, c, h);
  const [lr, lg, lb] = oklabToLinearRgb(la, a, b);
  const r = Math.round(Math.max(0, Math.min(1, linearToSrgb(lr))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, linearToSrgb(lg))) * 255);
  const bVal = Math.round(Math.max(0, Math.min(1, linearToSrgb(lb))) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bVal.toString(16).padStart(2, "0")}`;
}
