'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { GridBase } from "./standalone";
import type { GridConfig } from "./types";

function GridItem({
  child,
  index,
  rootId,
  itemSurface,
  stagger,
}: {
  child: GridConfig["children"][number];
  index: number;
  rootId: string;
  itemSurface: ReturnType<typeof resolveSurfacePresentation>;
  stagger?: number;
}) {
  const childArea =
    typeof child === "object" && child && "area" in child
      ? String((child as Record<string, unknown>).area ?? "")
      : "";
  const rawChildSpan =
    typeof child === "object" && child && "span" in child
      ? ((child as Record<string, unknown>).span as
          | number
          | {
              default?: number;
              sm?: number;
              md?: number;
              lg?: number;
              xl?: number;
              "2xl"?: number;
            }
          | undefined)
      : undefined;
  const normalizedChildSpan =
    typeof rawChildSpan === "number"
      ? rawChildSpan
      : rawChildSpan && typeof rawChildSpan === "object"
        ? {
            default: rawChildSpan.default,
            sm: rawChildSpan.sm,
            md: rawChildSpan.md,
            lg: rawChildSpan.lg,
            xl: rawChildSpan.xl,
            "2xl": rawChildSpan["2xl"],
          }
        : undefined;
  const childSpan = useResponsiveValue(
    normalizedChildSpan,
  );

  return (
    <div
      data-snapshot-id={`${rootId}-item`}
      className={itemSurface.className}
      style={{
        ...(itemSurface.style ?? {}),
        ...(childArea ? { gridArea: childArea } : null),
        ...(typeof childSpan === "number"
          ? { gridColumn: `span ${childSpan}` }
          : null),
        ...(typeof stagger === "number"
          ? ({
              ["--sn-stagger-index" as "--sn-stagger-index"]: index,
            } as CSSProperties)
          : null),
      }}
    >
      <ComponentRenderer config={child} />
    </div>
  );
}

export function Grid({ config }: { config: GridConfig }) {
  const areas = useResponsiveValue(config.areas);
  const columns = useResponsiveValue(config.columns);
  const gap = useResponsiveValue(config.gap);
  const rootId = config.id ?? "grid";

  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: (config.slots as Record<string, unknown> | undefined)?.item as Record<string, unknown> | undefined,
  });

  return (
    <GridBase
      id={config.id}
      areas={areas}
      columns={columns}
      gap={gap}
      rows={config.rows}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {config.children.map((child, index) => {
        return (
          <GridItem
            key={child.id ?? `grid-child-${index}`}
            child={child}
            index={index}
            rootId={rootId}
            itemSurface={itemSurface}
            stagger={config.animation?.stagger}
          />
        );
      })}
      <SurfaceStyles css={itemSurface.scopedCss} />
    </GridBase>
  );
}
