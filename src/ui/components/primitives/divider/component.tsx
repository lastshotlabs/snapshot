'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { resolveTemplate } from "../../../expressions/template";

export interface DividerConfig {
  label?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  style?: Record<string, string | number>;
}

export function Divider({ config }: { config: DividerConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const resolvedLabel = config.label
    ? resolveTemplate(
        config.label,
        {
          app: manifest?.app ?? {},
          auth: manifest?.auth ?? {},
          route: {
            ...(routeRuntime?.currentRoute ?? {}),
            path: routeRuntime?.currentPath,
            params: routeRuntime?.params,
            query: routeRuntime?.query,
          },
        },
        {
          locale: activeLocale,
          i18n: manifest?.raw.i18n,
        },
      )
    : undefined;
  if (config.orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={config.className}
        style={{
          width: "1px",
          alignSelf: "stretch",
          background: "var(--sn-color-border)",
          ...(config.style as CSSProperties | undefined),
        }}
      />
    );
  }

  if (!resolvedLabel) {
    return (
      <div
        role="separator"
        className={config.className}
        style={{
          borderTop:
            "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
          ...(config.style as CSSProperties | undefined),
        }}
      />
    );
  }

  return (
    <div
      role="separator"
      className={config.className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-md, 1rem)",
        ...(config.style as CSSProperties | undefined),
      }}
    >
      <div
        style={{
          flex: 1,
          height: 0,
          borderTop:
            "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
        }}
      />
      <span
        style={{
          color: "var(--sn-color-muted-foreground)",
          fontSize: "var(--sn-font-size-xs, 0.75rem)",
        }}
      >
        {resolvedLabel}
      </span>
      <div
        style={{
          flex: 1,
          height: 0,
          borderTop:
            "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
        }}
      />
    </div>
  );
}
