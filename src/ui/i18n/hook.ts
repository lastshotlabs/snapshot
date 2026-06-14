'use client';

import { useMemo } from "react";
import { resolveDetectedLocale, resolveTRef } from "./resolve";
import type { I18nConfig } from "./schema";

/**
 * Resolve a translation key against the active locale.
 *
 * @param key - Translation key path (e.g. `page.title`)
 * @param vars - Optional interpolation variables
 * @returns Localized string, or the key when missing
 */
export function useT(
  key: string,
  vars?: Record<string, unknown>,
  options?: { i18n?: I18nConfig; locale?: string },
): string {
  const i18n = options?.i18n;

  const locale = useMemo(
    () =>
      options?.locale ??
      resolveDetectedLocale(i18n, {
        navigatorLanguage:
          typeof navigator !== "undefined" ? navigator.language : undefined,
      }),
    [i18n, options?.locale],
  );

  return useMemo(
    () => resolveTRef({ t: key, vars }, locale, i18n),
    [i18n, key, locale, vars],
  );
}
