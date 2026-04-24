'use client';

import type { CSSProperties } from "react";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useRouteRuntime } from "../../../manifest/runtime";
import { resolvePrimitiveValue } from "../resolve-value";
import { TextBase } from "./standalone";
import type { TextConfig } from "./types";

export function Text({ config }: { config: TextConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const resolvedConfig = useResolveFrom({
    value: config.value,
  });
  const templateContext = {
    app: manifest?.app ?? {},
    auth: manifest?.auth ?? {},
    route: {
      ...(routeRuntime?.currentRoute ?? {}),
      path: routeRuntime?.currentPath,
      params: routeRuntime?.params,
      query: routeRuntime?.query,
    },
  };
  const value = resolvePrimitiveValue(resolvedConfig.value, {
    context: templateContext,
    locale: activeLocale,
    i18n: manifest?.raw.i18n,
  });

  return (
    <TextBase
      value={value}
      variant={config.variant}
      size={config.size}
      weight={config.weight}
      align={config.align}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
