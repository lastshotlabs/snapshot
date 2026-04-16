'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { SectionConfig } from "./types";

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

export function Section({ config }: { config: SectionConfig }) {
  const rootId = config.id ?? "section";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      minHeight:
        config.height === "screen"
          ? "100vh"
          : config.height === "auto"
            ? undefined
            : config.height,
      alignItems: config.align ? ALIGN_MAP[config.align] : undefined,
      justifyContent: config.justify ? JUSTIFY_MAP[config.justify] : undefined,
      style: config.bleed
        ? {
            marginInline: "calc(-1 * var(--sn-spacing-lg, 1.5rem))",
            paddingInline: "var(--sn-spacing-lg, 1.5rem)",
          }
        : undefined,
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["height"] }),
    itemSurface: config.slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: config.slots?.item,
  });

  return (
    <div
      data-snapshot-component="section"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {(config.children ?? []).map((child, index) => (
        <div
          key={child.id ?? `section-child-${index}`}
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
