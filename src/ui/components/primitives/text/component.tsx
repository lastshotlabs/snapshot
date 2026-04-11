'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useRouteRuntime } from "../../../manifest/runtime";
import { resolveTemplate } from "../../../expressions/template";

const COLOR_MAP: Record<string, string> = {
  default: "var(--sn-color-foreground)",
  muted: "var(--sn-color-muted-foreground)",
  subtle: "color-mix(in oklch, var(--sn-color-muted-foreground) 75%, transparent)",
};

const SIZE_MAP: Record<string, string> = {
  xs: "var(--sn-font-size-xs, 0.75rem)",
  sm: "var(--sn-font-size-sm, 0.875rem)",
  md: "var(--sn-font-size-md, 1rem)",
  lg: "var(--sn-font-size-lg, 1.125rem)",
};

const WEIGHT_MAP: Record<string, CSSProperties["fontWeight"]> = {
  light: "var(--sn-font-weight-light, 300)",
  normal: "var(--sn-font-weight-normal, 400)",
  medium: "var(--sn-font-weight-medium, 500)",
  semibold: "var(--sn-font-weight-semibold, 600)",
  bold: "var(--sn-font-weight-bold, 700)",
};

export interface TextConfig {
  value: string;
  variant?: "default" | "muted" | "subtle";
  size?: "xs" | "sm" | "md" | "lg";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
  className?: string;
  style?: Record<string, string | number>;
}

export function Text({ config }: { config: TextConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const value = resolveTemplate(
    config.value,
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
  );

  return (
    <p
      className={config.className}
      style={{
        margin: 0,
        color: COLOR_MAP[config.variant ?? "default"],
        fontSize: SIZE_MAP[config.size ?? "md"],
        fontWeight: WEIGHT_MAP[config.weight ?? "normal"],
        textAlign: config.align ?? "left",
        ...(config.style as CSSProperties | undefined),
      }}
    >
      {value}
    </p>
  );
}
