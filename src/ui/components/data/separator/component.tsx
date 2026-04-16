'use client';

import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { SeparatorConfig } from "./types";

export function Separator({ config }: { config: SeparatorConfig }) {
  const label = useSubscribe(config.label ?? undefined) as string | undefined;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    publish?.({ orientation: config.orientation ?? "horizontal" });
  }, [publish, config.orientation]);

  if (visible === false) {
    return null;
  }

  const orientation = config.orientation ?? "horizontal";
  const isVertical = orientation === "vertical";
  const rootId = config.id ?? "separator";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: isVertical
      ? {
          display: "inline-block",
          style: {
            width: "var(--sn-border-thin, 1px)",
            alignSelf: "stretch",
            minHeight: "var(--sn-spacing-lg, 1.5rem)",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
            flexShrink: 0,
          },
        }
      : label
        ? {
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            width: "100%",
          }
        : {
            width: "100%",
            style: {
              height: "var(--sn-border-thin, 1px)",
              backgroundColor: "var(--sn-color-border, #e5e7eb)",
            },
          },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const lineSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-line`,
    implementationBase: {
      flex: "1",
      style: {
        height: "var(--sn-border-thin, 1px)",
        backgroundColor: "var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.line,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
      fontWeight: "medium",
      style: {
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        letterSpacing: "var(--sn-tracking-wide, 0.05em)",
      },
    },
    componentSurface: config.slots?.label,
  });

  if (isVertical) {
    return (
      <>
        <div
          data-snapshot-component="separator"
          role="separator"
          aria-orientation="vertical"
          className={rootSurface.className}
          style={rootSurface.style}
        />
        <SurfaceStyles css={rootSurface.scopedCss} />
      </>
    );
  }

  if (label) {
    return (
      <div
        data-snapshot-component="separator"
        role="separator"
        aria-orientation="horizontal"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-line`}
          className={lineSurface.className}
          style={lineSurface.style}
        />
        <span
          data-snapshot-separator-label=""
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
        </span>
        <div
          data-snapshot-id={`${rootId}-line`}
          className={lineSurface.className}
          style={lineSurface.style}
        />
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={lineSurface.scopedCss} />
        <SurfaceStyles css={labelSurface.scopedCss} />
      </div>
    );
  }

  return (
    <>
      <div
        data-snapshot-component="separator"
        role="separator"
        aria-orientation="horizontal"
        className={rootSurface.className}
        style={rootSurface.style}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
