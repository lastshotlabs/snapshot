"use client";

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { BoxBase } from "./standalone";
import type { BoxConfig } from "./types";

export function Box({ config }: { config: BoxConfig }) {
  const rootId = config.id ?? "box";
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {
      width: "100%",
    },
    componentSurface: (config.slots as Record<string, unknown> | undefined)?.item as Record<string, unknown> | undefined,
  });

  return (
    <ComponentWrapper type="box" id={config.id} config={config}>
      <BoxBase
        id={config.id}
        as={config.as}
        className={config.className}
        style={config.style as CSSProperties}
        slots={config.slots as Record<string, Record<string, unknown>>}
      >
        {config.children?.map((child, index) => (
          <div
            key={(child as { id?: string }).id ?? index}
            data-snapshot-id={`${rootId}-item`}
            className={itemSurface.className}
            style={itemSurface.style}
          >
            <ComponentRenderer config={child} />
          </div>
        ))}
      </BoxBase>
      <SurfaceStyles css={itemSurface.scopedCss} />
    </ComponentWrapper>
  );
}
