/**
 * Pure style prop resolution functions.
 *
 * These are SSR-safe — no hooks, no side effects, no DOM access.
 * They take config objects and return CSS strings or CSSProperties.
 */
import type { CSSProperties } from "react";
/** Resolve a color token name to a CSS var, or pass through raw values. */
export declare function resolveColor(value: string): string;
/** Resolve a shadow token name to a CSS value. */
export declare function resolveShadow(value: string): string;
/** Resolve a radius token name to a CSS value. */
export declare function resolveRadius(value: string): string;
/**
 * Resolve token-aware style props to React CSSProperties.
 *
 * Pure function — no hooks, no side effects, no DOM. SSR-safe.
 * For responsive values, uses the `default` breakpoint.
 */
export declare function resolveStyleProps(config: Record<string, unknown>): CSSProperties;
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
export declare function resolveInteractiveCSS(id: string, hover?: HoverConfig, focus?: FocusConfig, active?: ActiveConfig): string | null;
/**
 * Generate responsive CSS media queries for breakpoint-mapped style props.
 *
 * Uses `[data-snapshot-id="<id>"]` as the selector.
 * Returns null when no responsive props are present.
 */
export declare function resolveResponsiveCSS(id: string, config: Record<string, unknown>): string | null;
