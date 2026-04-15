'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { resolveComponentBackgroundStyle } from "../../_base/background-style";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { CardConfig } from "./types";

const GAP_MAP: Record<string, string> = {
  none: "0",
  "2xs": "var(--sn-spacing-2xs, 0.125rem)",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
  "2xl": "var(--sn-spacing-2xl, 2.5rem)",
};

export function Card({ config }: { config: CardConfig }) {
  const gap = useResponsiveValue(config.gap);
  const resolvedGap = gap ? GAP_MAP[gap] ?? gap : GAP_MAP.md;
  const title = useSubscribe(config.title ?? "");
  const subtitle = useSubscribe(config.subtitle ?? "");
  const backgroundStyle = resolveComponentBackgroundStyle(config.background);
  const rootId = config.id ?? "card";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: resolvedGap,
      style: {
        backgroundColor: "var(--sn-color-card, #ffffff)",
        border:
          "var(--sn-card-border, 1px solid var(--sn-color-border, #e5e7eb))",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow:
          "var(--sn-card-shadow, var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)))",
        padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
        ...(backgroundStyle ?? {}),
      },
    },
    componentSurface: config.slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
    },
    componentSurface: config.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "lg",
      fontWeight: "semibold",
      lineHeight: "tight",
      style: {
        margin: 0,
      },
    },
    componentSurface: config.slots?.title,
  });
  const subtitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-subtitle`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      style: {
        margin: 0,
      },
    },
    componentSurface: config.slots?.subtitle,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: resolvedGap,
    },
    componentSurface: config.slots?.content,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: config.slots?.item,
  });

  return (
    <ComponentWrapper type="card" id={config.id} config={config}>
      <div
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {(title || subtitle) ? (
          <div
            data-snapshot-id={`${rootId}-header`}
            className={headerSurface.className}
            style={headerSurface.style}
          >
            {title ? (
              <h3
                data-snapshot-id={`${rootId}-title`}
                className={titleSurface.className}
                style={titleSurface.style}
              >
                {String(title)}
              </h3>
            ) : null}
            {subtitle ? (
              <p
                data-snapshot-id={`${rootId}-subtitle`}
                className={subtitleSurface.className}
                style={subtitleSurface.style}
              >
                {String(subtitle)}
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {(config.children ?? []).map((child, index) => (
            <div
              key={child.id ?? `card-child-${index}`}
              data-snapshot-id={`${rootId}-item`}
              className={itemSurface.className}
              style={
                typeof config.animation?.stagger === "number"
                  ? ({
                      ...(itemSurface.style ?? {}),
                      ["--sn-stagger-index" as "--sn-stagger-index"]: index,
                    } as CSSProperties)
                  : itemSurface.style
              }
            >
              <ComponentRenderer config={child} />
            </div>
          ))}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={subtitleSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
    </ComponentWrapper>
  );
}
