import type { I18nConfig, TRef } from "./schema";
/** Normalized locale-to-string map used by i18n resolvers. */
export type I18nStringsByLocale = NonNullable<I18nConfig["strings"]>;
interface ResolveLocaleOptions {
    stateLocale?: string;
    navigatorLanguage?: string;
    acceptLanguageHeader?: string;
}
interface ResolveI18nRefsOptions {
    locale?: string;
    i18n?: I18nConfig;
}
/**
 * Resolve the active locale according to ordered `i18n.detect` strategies.
 *
 * @param i18n - Manifest i18n config
 * @param options - Candidate locale sources
 * @returns The first matching locale, or the i18n default when configured
 */
export declare function resolveDetectedLocale(i18n: I18nConfig | undefined, options: ResolveLocaleOptions): string | undefined;
/**
 * Resolve the active runtime locale from state when present, otherwise fall
 * back to the manifest default locale.
 */
export declare function resolveRuntimeLocale(i18n: I18nConfig | undefined, stateLocale: unknown): string | undefined;
/**
 * Resolve a translation reference for a specific locale.
 *
 * Missing keys return the key and emit a dev warning.
 *
 * @param ref - Translation reference
 * @param locale - Active locale
 * @param i18n - Manifest i18n config
 * @returns Resolved localized string
 */
export declare function resolveTRef(ref: TRef, locale: string | undefined, i18n: I18nConfig | undefined): string;
/**
 * Recursively resolve all `{ t: "..." }` references in a manifest value.
 *
 * @param value - Input value
 * @param options - Locale + i18n config
 * @returns Deep-cloned value with resolved translation refs
 */
export declare function resolveI18nRefs<T>(value: T, options: ResolveI18nRefsOptions): T;
export {};
