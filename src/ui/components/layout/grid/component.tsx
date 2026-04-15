'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { GridConfig } from "./types";

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

export function Grid({ config }: { config: GridConfig }) {
  const areas = useResponsiveValue(config.areas);
  const columns = useResponsiveValue(config.columns);
  const gap = useResponsiveValue(config.gap);
  const rootId = config.id ?? "grid";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      width: "100%",
      gap: gap ? GAP_MAP[gap] ?? gap : undefined,
      style: {
        gridTemplateAreas: areas?.map((row) => `"${row}"`).join(" "),
        gridTemplateColumns:
          typeof columns === "number"
            ? `repeat(${columns}, minmax(0, 1fr))`
            : columns,
        gridTemplateRows: config.rows,
      },
    },
    componentSurface: config.slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: config.slots?.item,
  });

  return (
    <div
      data-snapshot-component="grid"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      {config.children.map((child, index) => {
        const childArea =
          typeof child === "object" && child && "area" in child
            ? String((child as Record<string, unknown>).area ?? "")
            : "";

        return (
          <div
            key={child.id ?? `grid-child-${index}`}
            data-snapshot-id={`${rootId}-item`}
            className={itemSurface.className}
            style={{
              ...(itemSurface.style ?? {}),
              ...(childArea ? { gridArea: childArea } : null),
              ...(typeof config.animation?.stagger === "number"
                ? ({
                    ["--sn-stagger-index" as "--sn-stagger-index"]: index,
                  } as CSSProperties)
                : null),
            }}
          >
            <ComponentRenderer config={child} />
          </div>
        );
      })}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
    </div>
  );
}
