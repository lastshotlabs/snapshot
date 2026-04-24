'use client';

import type { CSSProperties } from "react";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import {
  resolveOptionalPrimitiveValue,
  resolvePrimitiveValue,
} from "../resolve-value";
import { LinkBase } from "./standalone";
import type { LinkConfig } from "./types";

export function Link({
  config,
  onNavigate,
}: {
  config: LinkConfig;
  onNavigate?: (to: string) => void;
}) {
  const routeRuntime = useRouteRuntime();
  const manifest = useManifestRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
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
  const templateOptions = {
    locale: activeLocale,
    i18n: manifest?.raw.i18n,
  };
  const resolvedConfig = useResolveFrom({
    text: config.text,
    to: config.to,
    badge: config.badge,
  });
  const text = resolvePrimitiveValue(resolvedConfig.text, {
    context: templateContext,
    ...templateOptions,
  });
  const to = resolvePrimitiveValue(resolvedConfig.to, {
    context: templateContext,
    ...templateOptions,
  });
  const badge = resolveOptionalPrimitiveValue(resolvedConfig.badge, {
    context: templateContext,
    ...templateOptions,
  });
  const currentPath = routeRuntime?.currentPath;
  const routeIsCurrent =
    typeof currentPath === "string" && typeof to === "string"
      ? config.matchChildren !== false
        ? currentPath === to || currentPath.startsWith(`${to}/`)
        : currentPath === to
      : false;
  const isCurrent = config.current ?? routeIsCurrent;

  const handleNavigate = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
      return;
    }

    if (routeRuntime?.navigate) {
      routeRuntime.navigate(target);
    }
  };

  return (
    <LinkBase
      text={text}
      to={to}
      icon={config.icon}
      badge={badge}
      external={config.external}
      disabled={config.disabled}
      current={isCurrent}
      align={config.align}
      variant={config.variant}
      onNavigate={handleNavigate}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
