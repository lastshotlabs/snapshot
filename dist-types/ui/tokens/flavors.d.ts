/**
 * Flavor registry and built-in flavor definitions.
 *
 * Flavors are named theme presets that provide a complete set of design tokens.
 * The first 4 flavors (neutral, slate, violet) are extracted from the existing
 * hardcoded palettes in `globals-css.ts`. The remaining 5 are new additions.
 */
import type { Flavor } from "./types";
type FlavorConfig = Omit<Flavor, "name">;
/**
 * Define and register a new flavor. If a flavor with the same name already exists,
 * it is replaced.
 *
 * @param name - Unique flavor identifier
 * @param config - Flavor configuration (colors, radius, spacing, font, components)
 * @returns The registered Flavor object
 */
export declare function defineFlavor(name: string, config: FlavorConfig): Flavor;
/**
 * Remove all non-built-in flavors from the registry.
 *
 * Used by manifest compilation so per-manifest flavor declarations do not
 * leak across snapshot instances.
 */
export declare function clearCustomFlavors(): void;
/**
 * Define and register a flavor by extending an existing parent flavor.
 *
 * The child flavor inherits unspecified fields from the parent and derives
 * dark color variants from light-color overrides when explicit dark overrides
 * are not provided.
 *
 * @param name - Unique child flavor identifier
 * @param extendsName - Parent flavor identifier to inherit from
 * @param overrides - Partial flavor overrides applied to the parent
 * @returns The registered merged flavor
 */
export declare function defineFlavorWithExtension(name: string, extendsName: string, overrides: Partial<FlavorConfig>): Flavor;
/**
 * Retrieve a registered flavor by name.
 *
 * @param name - Flavor identifier
 * @returns The Flavor object, or undefined if not found
 */
export declare function getFlavor(name: string): Flavor | undefined;
/**
 * Get all registered flavors as a record.
 *
 * @returns Record of flavor name to Flavor object
 */
export declare function getAllFlavors(): Record<string, Flavor>;
/**
 * Register the built-in flavor presets.
 *
 * This is idempotent so boot can safely call it once per snapshot instance.
 */
export declare function registerBuiltInFlavors(): void;
export {};
