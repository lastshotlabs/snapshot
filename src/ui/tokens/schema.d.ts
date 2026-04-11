/** Zod schema for semantic color tokens. Each generates a CSS custom property. */
export declare const themeColorsSchema: any;
/** Zod schema for border radius scale. */
export declare const radiusSchema: any;
/** Zod schema for spacing density. */
export declare const spacingSchema: any;
/** Zod schema for font configuration. */
export declare const fontSchema: any;
/** Zod schema for component-level token overrides. */
export declare const componentTokensSchema: any;
/** Zod schema for shadow scale. */
export declare const shadowSchema: any;
/** Zod schema for global token overrides beyond colors/radius/spacing/font. */
export declare const globalTokensSchema: any;
/**
 * Zod schema for manifest-declared flavor extensions.
 *
 * All flavor fields are optional except `extends`, which points to the parent
 * flavor that this declaration inherits from.
 */
export declare const flavorOverrideSchema: any;
/** Zod schema for the full theme configuration in the manifest. */
export declare const themeConfigSchema: any;
