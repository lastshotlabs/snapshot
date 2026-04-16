import type { Flavor, ThemeColors } from "./types";
type FlavorConfig = Omit<Flavor, "name">;
/**
 * Derive a dark-mode color variant from a light-mode color.
 *
 * @param lightColor - Any color accepted by the token color parser
 * @returns Derived dark-mode color string
 */
export declare function deriveDarkVariant(lightColor: string): string;
/**
 * Derive a merged dark palette using parent + overrides precedence.
 *
 * Precedence per color key:
 * 1. `overrides.darkColors[key]`
 * 2. `deriveDarkVariant(overrides.colors[key])`
 * 3. `parent.darkColors[key]`
 * 4. `deriveDarkVariant(parent.colors[key])`
 *
 * @param parent - Parent flavor values
 * @param overrides - Partial flavor overrides from a child declaration
 * @returns Merged dark color map for the extended flavor
 */
export declare function deriveDarkColors(parent: Pick<FlavorConfig, "colors" | "darkColors">, overrides: Pick<Partial<FlavorConfig>, "colors" | "darkColors">): ThemeColors;
export {};
