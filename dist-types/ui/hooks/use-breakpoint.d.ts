/**
 * Runtime breakpoint detection hooks.
 *
 * Uses `window.matchMedia` for efficient, event-driven breakpoint detection.
 * Falls back to `"default"` in SSR environments where `window` is unavailable.
 *
 * @module
 */
/** Breakpoint pixel thresholds (mobile-first, min-width). */
export declare const BREAKPOINTS: {
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
    readonly "2xl": 1536;
};
/** All breakpoint names including `"default"` (below `sm`). */
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl" | "2xl";
/**
 * Resolve a responsive value for a given breakpoint.
 *
 * Cascades down: if the active breakpoint isn't defined, falls back to the
 * next smaller breakpoint, then `default`. For flat (non-object) values,
 * returns the value directly.
 *
 * @param value - A flat value or a responsive breakpoint map
 * @param breakpoint - The active breakpoint to resolve for
 * @returns The resolved value for the given breakpoint
 */
export declare function resolveResponsiveValue<T>(value: T | {
    default: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    "2xl"?: T;
}, breakpoint: Breakpoint): T;
/**
 * Returns the currently active breakpoint based on window width.
 *
 * Uses `matchMedia` for efficient, event-driven updates (no resize polling).
 * Returns `"default"` during SSR.
 */
export declare function useBreakpoint(): Breakpoint;
/**
 * Resolve a responsive value to the appropriate value for the current breakpoint.
 *
 * Accepts either a flat value (returned as-is) or a responsive map with
 * breakpoint keys. Falls back to the next smaller defined breakpoint.
 *
 * @param value - A flat value or responsive breakpoint map
 * @returns The resolved value for the current viewport width
 */
export declare function useResponsiveValue<T>(value: T | {
    default: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    "2xl"?: T;
}): T;
