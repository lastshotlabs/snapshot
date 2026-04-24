'use client';

import type { CSSProperties } from "react";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { resolveOptionalPrimitiveValue } from "../resolve-value";
import { DividerBase } from "./standalone";
import type { DividerConfig } from "./types";

export function Divider({ config }: { config: DividerConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const resolvedConfig = useResolveFrom({
    label: config.label,
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
  const resolvedLabel = resolveOptionalPrimitiveValue(resolvedConfig.label, {
    context: templateContext,
    locale: activeLocale,
    i18n: manifest?.raw.i18n,
  });

  return (
    <DividerBase
      label={resolvedLabel}
      orientation={config.orientation}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
