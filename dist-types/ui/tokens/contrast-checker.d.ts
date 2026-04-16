import type { ThemeConfig } from "./types";
/**
 * Warn when manifest theme color pairs fail WCAG AA contrast.
 */
export declare function validateContrast(theme: ThemeConfig | undefined): void;
