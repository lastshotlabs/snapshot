/**
 * Design token system.
 *
 * Provides flavor-based theming, color conversion, token resolution to CSS,
 * and runtime token editing.
 */

export { resolveTokens } from "./resolve";
export { useTokenEditor } from "./editor";
export { defineFlavor, getFlavor, getAllFlavors } from "./flavors";
export {
  themeColorsSchema,
  radiusSchema,
  spacingSchema,
  fontSchema,
  componentTokensSchema,
  themeConfigSchema,
} from "./schema";
export {
  hexToOklch,
  hslToOklch,
  oklchToString,
  oklchToHex,
  deriveForeground,
  deriveDarkVariant,
  colorToOklch,
  parseOklchString,
} from "./color";
export type {
  ThemeConfig,
  ThemeColors,
  Flavor,
  ComponentTokens,
  TokenEditor,
  RadiusScale,
  SpacingScale,
  FontConfig,
  Responsive,
} from "./types";
