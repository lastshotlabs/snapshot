'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ColumnBase } from "./standalone";
import type { ColumnConfig } from "./types";

export function Column({ config }: { config: ColumnConfig }) {
  const gap = useResponsiveValue(config.gap);
  const rootId = config.id ?? "column";
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: config.slots?.item,
  });

  return (
    <ColumnBase
      id={config.id}
      gap={gap}
      align={config.align}
      justify={config.justify}
      overflow={config.overflow}
      maxHeight={config.maxHeight}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
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
      <SurfaceStyles css={itemSurface.scopedCss} />
    </ColumnBase>
  );
}
