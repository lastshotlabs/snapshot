import { z } from "zod";
/** Locale detection strategies for manifest i18n resolution. */
export declare const i18nDetectStrategySchema: any;
/** Translation reference used in text-bearing manifest fields. */
export declare const tRefSchema: any;
/** Manifest i18n configuration. */
export declare const i18nConfigSchema: any;
/** Type for `{ "t": "..." }` translation references. */
export type TRef = z.infer<typeof tRefSchema>;
/** Type for the `manifest.i18n` block. */
export type I18nConfig = z.infer<typeof i18nConfigSchema>;
/**
 * Check whether a value is a translation reference.
 *
 * @param value - Unknown input
 * @returns True when the value matches `TRef`
 */
export declare function isTRef(value: unknown): value is TRef;
