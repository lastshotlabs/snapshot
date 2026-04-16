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
/**
 * Convert a hex color string to OKLCH values.
 *
 * @param hex - CSS hex color (e.g. "#ff0000", "#f00")
 * @returns Tuple of [lightness, chroma, hue]
 */
export declare function hexToOklch(hex: string): [number, number, number];
/**
 * Convert HSL values to OKLCH.
 *
 * @param h - Hue in degrees [0, 360)
 * @param s - Saturation [0, 100]
 * @param l - Lightness [0, 100]
 * @returns Tuple of [lightness, chroma, hue]
 */
export declare function hslToOklch(h: number, s: number, l: number): [number, number, number];
/**
 * Format OKLCH values as a CSS-compatible string (without the oklch() wrapper).
 * Output format: "L C H" where L, C, H are rounded to 3 decimal places.
 *
 * @param l - Lightness [0, 1]
 * @param c - Chroma [0, ~0.4]
 * @param h - Hue [0, 360)
 * @returns Formatted string like "0.637 0.237 25.465"
 */
export declare function oklchToString(l: number, c: number, h: number): string;
/**
 * Parse an oklch string (the CSS variable format "L C H") back to values.
 *
 * @param str - OKLCH string like "0.637 0.237 25.465"
 * @returns Tuple of [lightness, chroma, hue]
 */
export declare function parseOklchString(str: string): [number, number, number];
/**
 * Convert any supported color string to OKLCH values.
 * Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function.
 *
 * @param color - Color string in any supported format
 * @returns Tuple of [lightness, chroma, hue]
 */
export declare function colorToOklch(color: string): [number, number, number];
/**
 * Compute relative luminance from OKLCH for WCAG contrast calculations.
 * Uses sRGB relative luminance (rec. 709) from the linear RGB values.
 */
export declare function relativeLuminance(color: string): number;
/** Calculate the WCAG contrast ratio between two supported color values. */
export declare function contrastRatio(left: string, right: string): number;
/** Check whether two colors satisfy WCAG AA contrast for normal or large text. */
export declare function meetsWcagAA(left: string, right: string, largeText?: boolean): boolean;
/**
 * Derive a foreground color that passes WCAG AA contrast (4.5:1) against
 * the given background color. Returns a light or dark foreground.
 *
 * @param backgroundColor - Background color in any supported format
 * @returns OKLCH string for the foreground color
 */
export declare function deriveForeground(backgroundColor: string): string;
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
export declare function deriveDarkVariant(lightColor: string): string;
/**
 * Convert OKLCH values back to a hex color string.
 * Used for serializing runtime overrides.
 *
 * @param l - Lightness [0, 1]
 * @param c - Chroma [0, ~0.4]
 * @param h - Hue [0, 360)
 * @returns CSS hex color string (e.g. "#ff0000")
 */
export declare function oklchToHex(l: number, c: number, h: number): string;
