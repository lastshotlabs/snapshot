'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ColumnConfig } from "./types";

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

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

export function Column({ config }: { config: ColumnConfig }) {
  const gap = useResponsiveValue(config.gap);
  const resolvedGap = gap ? GAP_MAP[gap] ?? gap : undefined;
  const rootId = config.id ?? "column";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      gap: resolvedGap,
      alignItems: config.align ? ALIGN_MAP[config.align] : undefined,
      justifyContent: config.justify ? JUSTIFY_MAP[config.justify] : undefined,
      overflow: config.overflow,
      maxHeight: config.maxHeight,
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: config.slots?.item,
  });

  return (
    <div
      data-snapshot-component="column"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      {config.children.map((child, index) => (
        <div
          key={child.id ?? `column-child-${index}`}
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
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
    </div>
  );
}
