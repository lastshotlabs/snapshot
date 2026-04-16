/**
 * Token resolution pipeline.
 *
 * `resolveTokens()` takes a ThemeConfig and produces a CSS string containing
 * all design tokens as CSS custom properties in `:root` and `.dark` blocks,
 * plus component-level scoped properties.
 */
import type { ThemeConfig } from "./types";
/**
 * Resolve a theme configuration into a complete CSS string.
 *
 * Pipeline:
 * 1. Load base flavor (default: neutral)
 * 2. Deep merge overrides onto flavor defaults
 * 3. Convert all colors to oklch
 * 4. Auto-derive foreground colors (contrast-aware)
 * 5. Auto-derive dark mode colors if not provided
 * 6. Map radius/spacing/font to CSS
 * 7. Generate component-level tokens
 * 8. Output CSS string with :root, .dark, and component selectors
 *
 * @param config - Theme configuration (flavor name + overrides)
 * @returns Complete CSS string ready to inject or write to a file
 */
export declare function resolveTokens(config?: ThemeConfig): string;
/**
 * Returns a CSS string containing framework-level styles:
 *
 * 1. CSS reset (box-sizing, margin, padding, body defaults, font inherit)
 * 2. Component polish CSS — data-attribute-driven styles for page layout,
 *    data-table, stat-card, form, detail-card, and focus rings.
 *
 * All values are parameterized via `--sn-*` token custom properties so the
 * output adapts to whatever theme tokens are active.
 */
export declare function resolveFrameworkStyles(options?: {
    respectReducedMotion?: boolean;
}): string;
