'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useRouteRuntime } from "../../../manifest/runtime";
import { useManifestRuntime } from "../../../manifest/runtime";
import { resolveTemplate } from "../../../expressions/template";

export interface LinkConfig {
  text: string;
  to: string;
  external?: boolean;
  align?: "left" | "center" | "right";
  variant?: "default" | "muted" | "button";
  className?: string;
  style?: Record<string, string | number>;
}

function getVariantStyle(
  variant: NonNullable<LinkConfig["variant"]>,
): CSSProperties {
  if (variant === "button") {
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
      background: "var(--sn-color-primary)",
      color: "var(--sn-color-primary-foreground)",
      textDecoration: "none",
    };
  }

  return {
    color:
      variant === "muted"
        ? "var(--sn-color-muted-foreground)"
        : "var(--sn-color-primary)",
    textDecoration: "none",
  };
}

export function Link({ config }: { config: LinkConfig }) {
  const routeRuntime = useRouteRuntime();
  const manifest = useManifestRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const text = resolveTemplate(
    config.text,
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
  const to = resolveTemplate(
    config.to,
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
  const align = config.align ?? "left";
  const style: CSSProperties = {
    ...(align !== "left"
      ? {
          display: "block",
          textAlign: align,
        }
      : {}),
    ...getVariantStyle(config.variant ?? "default"),
    ...(config.style as CSSProperties | undefined),
  };

  if (config.external) {
    return (
      <a
        className={config.className}
        href={to}
        target="_blank"
        rel="noreferrer noopener"
        style={style}
      >
        {text}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={config.className}
      onClick={() => routeRuntime?.navigate(to)}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        font: "inherit",
        ...style,
      }}
    >
      {text}
    </button>
  );
}
