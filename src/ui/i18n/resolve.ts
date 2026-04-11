import type { I18nConfig, TRef } from "./schema";
import { isTRef } from "./schema";

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

function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase();
}

function matchLocale(
  candidate: string | undefined,
  locales: string[],
): string | undefined {
  if (!candidate) {
    return undefined;
  }

  const normalizedCandidate = normalizeLocale(candidate);
  const byExact = locales.find(
    (locale) => normalizeLocale(locale) === normalizedCandidate,
  );
  if (byExact) {
    return byExact;
  }

  const base = normalizedCandidate.split("-")[0];
  if (!base) {
    return undefined;
  }

  return locales.find((locale) => normalizeLocale(locale).split("-")[0] === base);
}

function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) {
    return [];
  }

  return header
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      const q = quality ? Number(quality) : 1;
      return {
        tag: tag?.trim() ?? "",
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
}

function getNestedString(
  value: unknown,
  key: string,
): string | undefined {
  if (value && typeof value === "object" && key in (value as Record<string, unknown>)) {
    const direct = (value as Record<string, unknown>)[key];
    return typeof direct === "string" ? direct : undefined;
  }

  const parts = key.split(".");
  let current: unknown = value;

  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, vars?: Record<string, unknown>): string {
  if (!vars) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value == null ? match : String(value);
  });
}

function devWarn(message: string): void {
  if (
    typeof process !== "undefined" &&
    process.env?.["NODE_ENV"] === "development"
  ) {
    console.warn(message);
  }
}

/**
 * Resolve the active locale according to ordered `i18n.detect` strategies.
 *
 * @param i18n - Manifest i18n config
 * @param options - Candidate locale sources
 * @returns The first matching locale, or the i18n default when configured
 */
export function resolveDetectedLocale(
  i18n: I18nConfig | undefined,
  options: ResolveLocaleOptions,
): string | undefined {
  if (!i18n) {
    return undefined;
  }

  const strategies = i18n.detect ?? ["default"];
  for (const strategy of strategies) {
    if (strategy === "state") {
      const locale = matchLocale(options.stateLocale, i18n.locales);
      if (locale) {
        return locale;
      }
      continue;
    }

    if (strategy === "navigator") {
      const locale = matchLocale(options.navigatorLanguage, i18n.locales);
      if (locale) {
        return locale;
      }
      continue;
    }

    if (strategy === "header") {
      for (const candidate of parseAcceptLanguage(
        options.acceptLanguageHeader,
      )) {
        const locale = matchLocale(candidate, i18n.locales);
        if (locale) {
          return locale;
        }
      }
      continue;
    }

    if (strategy === "default") {
      const locale = matchLocale(i18n.default, i18n.locales);
      if (locale) {
        return locale;
      }
    }
  }

  return matchLocale(i18n.default, i18n.locales);
}

/**
 * Resolve the active runtime locale from state when present, otherwise fall
 * back to the manifest default locale.
 */
export function resolveRuntimeLocale(
  i18n: I18nConfig | undefined,
  stateLocale: unknown,
): string | undefined {
  if (!i18n) {
    return typeof stateLocale === "string" ? stateLocale : undefined;
  }

  return (
    matchLocale(
      typeof stateLocale === "string" ? stateLocale : undefined,
      i18n.locales,
    ) ??
    matchLocale(i18n.default, i18n.locales) ??
    (typeof stateLocale === "string" ? stateLocale : undefined)
  );
}

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
export function resolveTRef(
  ref: TRef,
  locale: string | undefined,
  i18n: I18nConfig | undefined,
): string {
  if (!i18n || !locale) {
    return ref.t;
  }

  const localeStrings = i18n.strings[locale];
  const defaultStrings = i18n.strings[i18n.default];

  const resolved =
    (typeof localeStrings === "object"
      ? getNestedString(localeStrings, ref.t)
      : undefined) ??
    (typeof defaultStrings === "object"
      ? getNestedString(defaultStrings, ref.t)
      : undefined);

  if (resolved == null) {
    devWarn(`[snapshot:i18n] Missing translation key "${ref.t}" for "${locale}"`);
    return ref.t;
  }

  return interpolate(resolved, ref.vars);
}

/**
 * Recursively resolve all `{ t: "..." }` references in a manifest value.
 *
 * @param value - Input value
 * @param options - Locale + i18n config
 * @returns Deep-cloned value with resolved translation refs
 */
export function resolveI18nRefs<T>(
  value: T,
  options: ResolveI18nRefsOptions,
): T {
  const resolve = (input: unknown): unknown => {
    if (isTRef(input)) {
      return resolveTRef(input, options.locale, options.i18n);
    }

    if (Array.isArray(input)) {
      return input.map((item) => resolve(item));
    }

    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>).map(([key, nested]) => [
          key,
          resolve(nested),
        ]),
      );
    }

    return input;
  };

  return resolve(value) as T;
}
