'use client';

import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { SpacerConfig } from "./types";

const SIZE_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
  "2xl": "var(--sn-spacing-2xl, 2.5rem)",
  "3xl": "var(--sn-spacing-3xl, 3rem)",
};

export function Spacer({ config }: { config: SpacerConfig }) {
  const size =
    (config.size ? SIZE_MAP[config.size] : undefined) ??
    config.size ??
    "var(--sn-spacing-md, 1rem)";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: config.id,
    implementationBase:
      config.axis === "horizontal"
        ? {
            style: {
              width: size,
              minWidth: size,
              flexGrow: config.flex ? 1 : 0,
              flexShrink: 0,
            },
          }
        : {
            style: {
              height: size,
              minHeight: size,
              flexGrow: config.flex ? 1 : 0,
              flexShrink: 0,
            },
          },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });

  return (
    <>
      <div
        aria-hidden="true"
        data-snapshot-id={config.id}
        className={rootSurface.className}
        style={rootSurface.style}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
