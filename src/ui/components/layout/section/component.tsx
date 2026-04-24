'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { SectionBase } from "./standalone";
import type { SectionConfig } from "./types";

export function Section({ config }: { config: SectionConfig }) {
  const rootId = config.id ?? "section";
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: (config.slots as Record<string, unknown> | undefined)?.item as Record<string, unknown> | undefined,
  });

  return (
    <SectionBase
      id={config.id}
      height={config.height}
      align={config.align}
      justify={config.justify}
      bleed={config.bleed}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
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
      <SurfaceStyles css={itemSurface.scopedCss} />
    </SectionBase>
  );
}
