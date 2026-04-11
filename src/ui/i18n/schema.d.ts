import { z } from "zod";
/** Locale detection strategies for manifest i18n resolution. */
export declare const i18nDetectStrategySchema: z.ZodEnum<["state", "navigator", "default", "header"]>;
/** Translation reference used in text-bearing manifest fields. */
export declare const tRefSchema: z.ZodObject<{
    t: z.ZodString;
    vars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    t: string;
    vars?: Record<string, unknown> | undefined;
}, {
    t: string;
    vars?: Record<string, unknown> | undefined;
}>;
/** Manifest i18n configuration. */
export declare const i18nConfigSchema: z.ZodObject<{
    default: z.ZodString;
    locales: z.ZodArray<z.ZodString, "many">;
    strings: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodType<Record<string, string | Record<string, unknown>>, z.ZodTypeDef, Record<string, string | Record<string, unknown>>>]>>;
    detect: z.ZodOptional<z.ZodArray<z.ZodEnum<["state", "navigator", "default", "header"]>, "many">>;
}, "strict", z.ZodTypeAny, {
    default: string;
    locales: string[];
    strings: Record<string, string | Record<string, string | Record<string, unknown>>>;
    detect?: ("header" | "default" | "navigator" | "state")[] | undefined;
}, {
    default: string;
    locales: string[];
    strings: Record<string, string | Record<string, string | Record<string, unknown>>>;
    detect?: ("header" | "default" | "navigator" | "state")[] | undefined;
}>;
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
