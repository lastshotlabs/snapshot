'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { RowConfig } from "./types";

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

export function Row({ config }: { config: RowConfig }) {
  const gap = useResponsiveValue(config.gap);
  const resolvedGap = gap ? GAP_MAP[gap] ?? gap : undefined;
  const hasSpans = config.children.some(
    (child) =>
      child &&
      typeof child === "object" &&
      "span" in child &&
      (child as Record<string, unknown>).span !== undefined,
  );
  const rootId = config.id ?? "row";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: hasSpans
      ? {
          display: "grid",
          width: "100%",
          gap: resolvedGap,
          alignItems: config.align ? ALIGN_MAP[config.align] : undefined,
          style: {
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          },
        }
      : {
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: resolvedGap,
          alignItems: config.align ? ALIGN_MAP[config.align] : undefined,
          justifyContent: config.justify
            ? JUSTIFY_MAP[config.justify]
            : undefined,
          flexWrap: config.wrap ? "wrap" : undefined,
          overflow: config.overflow,
          maxHeight: config.maxHeight,
        },
    componentSurface: config.slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: config.slots?.item,
  });

  return (
    <ComponentWrapper type="row" id={config.id} config={config}>
      <div
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {config.children.map((child, index) => {
          const itemStyle =
            typeof config.animation?.stagger === "number"
              ? ({
                  ...(itemSurface.style ?? {}),
                  ["--sn-stagger-index" as "--sn-stagger-index"]: index,
                } as CSSProperties)
              : itemSurface.style;

          if (hasSpans) {
            return (
              <ComponentRenderer
                key={child.id ?? `row-child-${index}`}
                config={child}
              />
            );
          }

          return (
            <div
              key={child.id ?? `row-child-${index}`}
              data-snapshot-id={`${rootId}-item`}
              className={itemSurface.className}
              style={itemStyle}
            >
              <ComponentRenderer config={child} />
            </div>
          );
        })}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
    </ComponentWrapper>
  );
}
