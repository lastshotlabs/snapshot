'use client';

import { useSubscribe } from "../../../context";
import { resolveTemplate } from "../../../expressions/template";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { HeadingBase } from "./standalone";
import type { HeadingConfig } from "./types";

/**
 * Manifest adapter — resolves template text, locale, and route context,
 * then delegates to HeadingBase.
 */
export function Heading({ config }: { config: HeadingConfig }) {
  const routeRuntime = useRouteRuntime();
  const manifest = useManifestRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const text = useSubscribe(config.text);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const level = config.level ?? 2;

  const resolvedText = resolveTemplate(
    typeof text === "string" ? text : String(text ?? ""),
    {
      app: manifest?.app ?? {},
      auth: manifest?.auth ?? {},
      route:
        routeRuntime
          ? {
              id: routeRuntime.currentRoute?.id,
              path: routeRuntime.currentPath,
              pattern: routeRuntime.currentRoute?.path,
              params: routeRuntime.params,
              query: routeRuntime.query,
            }
          : {},
    },
    {
      locale: activeLocale,
      i18n: manifest?.raw.i18n,
    },
  );

  const displayText =
    resolvedText.trim().length > 0
      ? resolvedText
      : resolveTemplate(
          config.fallback ?? "",
          { app: manifest?.app ?? {} },
          {
            locale: activeLocale,
            i18n: manifest?.raw.i18n,
          },
        );

  return (
    <HeadingBase
      id={config.id}
      text={displayText}
      level={level as 1 | 2 | 3 | 4 | 5 | 6}
      align={config.align}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
