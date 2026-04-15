'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context";
import { resolveTemplate } from "../../../expressions/template";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { HeadingConfig } from "./types";

const HEADING_SIZE: Record<number, string> = {
  1: "var(--sn-font-size-4xl, 2.25rem)",
  2: "var(--sn-font-size-3xl, 1.875rem)",
  3: "var(--sn-font-size-2xl, 1.5rem)",
  4: "var(--sn-font-size-xl, 1.25rem)",
  5: "var(--sn-font-size-lg, 1.125rem)",
  6: "var(--sn-font-size-md, 1rem)",
};

/**
 * Heading component for manifest-driven page titles and section headings.
 *
 * Resolves FromRef and template-backed text, then renders an `h1`-`h6`
 * element with Snapshot token-based typography defaults.
 */
export function Heading({ config }: { config: HeadingConfig }) {
  const routeRuntime = useRouteRuntime();
  const manifest = useManifestRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const text = useSubscribe(config.text);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const level = config.level ?? 2;
  const Tag = `h${level}` as const;
  const rootId = config.id ?? "heading";

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

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      style: {
        fontSize: HEADING_SIZE[level],
        fontWeight:
          level <= 2
            ? "var(--sn-font-weight-bold, 700)"
            : "var(--sn-font-weight-semibold, 600)",
        lineHeight: "var(--sn-leading-tight, 1.25)",
        textAlign: config.align ?? "left",
        letterSpacing:
          level <= 2
            ? "var(--sn-tracking-tight, -0.025em)"
            : "var(--sn-tracking-normal, 0)",
        color: "var(--sn-color-foreground, #111827)",
        margin: 0,
      },
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });

  return (
    <>
      <Tag
        data-snapshot-component="heading"
        data-snapshot-id={rootId}
        className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
      >
        {displayText}
      </Tag>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
