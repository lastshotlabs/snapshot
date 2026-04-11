import type { z } from "zod";
import type { themeColorsSchema, radiusSchema, spacingSchema, fontSchema, shadowSchema, globalTokensSchema, componentTokensSchema, themeConfigSchema } from "./schema";
/** Semantic color tokens. Each generates a CSS custom property. */
export type ThemeColors = z.infer<typeof themeColorsSchema>;
/** Border radius scale. */
export type RadiusScale = z.infer<typeof radiusSchema>;
/** Spacing density. Affects padding, gaps, and margins globally. */
export type SpacingScale = z.infer<typeof spacingSchema>;
/** Font configuration. */
export type FontConfig = z.infer<typeof fontSchema>;
/** Shadow scale. */
export type ShadowScale = z.infer<typeof shadowSchema>;
/** Global token overrides (shadows, durations, opacity, etc.). */
export type GlobalTokens = z.infer<typeof globalTokensSchema>;
/** Component-level token overrides. Per-component styling knobs. */
export type ComponentTokens = z.infer<typeof componentTokensSchema>;
/** Theme configuration in the manifest. */
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
/** Named theme preset. Provides a complete set of design tokens. */
export interface Flavor {
    /** Flavor identifier. */
    name: string;
    /** Human-readable display name. */
    displayName: string;
    /** Light mode colors. */
    colors: ThemeColors;
    /** Dark mode colors. If omitted, auto-derived from light colors. */
    darkColors?: ThemeColors;
    /** Border radius preset. */
    radius: RadiusScale;
    /** Spacing density. */
    spacing: SpacingScale;
    /** Font families. */
    font: FontConfig;
    /** Component-level token overrides. */
    components?: ComponentTokens;
}
/** Return type of useTokenEditor(). */
export interface TokenEditor {
    /** Override a single token at runtime. Instant visual update via CSS custom property. */
    setToken: (path: string, value: string) => void;
    /** Switch to a different flavor at runtime. Resets all overrides. */
    setFlavor: (flavorName: string) => void;
    /** Reset all runtime overrides. Reverts to the CSS file baseline. */
    resetTokens: () => void;
    /** Get current runtime overrides as a manifest-compatible config object. */
    getTokens: () => Partial<NonNullable<ThemeConfig["overrides"]>>;
    /** Get the name of the currently active flavor. */
    currentFlavor: () => string;
    /** Subscribe to token changes. Returns unsubscribe function. */
    subscribe: (listener: (overrides: Partial<NonNullable<ThemeConfig["overrides"]>>) => void) => () => void;
}
/** A breakpoint-aware value. Flat value or responsive map. */
export type Responsive<T> = T | {
    default: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    "2xl"?: T;
};
