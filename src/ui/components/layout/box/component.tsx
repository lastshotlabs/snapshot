"use client";

import { createElement } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { BoxConfig } from "./types";

export function Box({ config }: { config: BoxConfig }) {
  const rootId = config.id ?? "box";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
    },
    componentSurface: config.slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {
      width: "100%",
    },
    componentSurface: config.slots?.item,
  });

  return (
    <ComponentWrapper type="box" id={config.id} config={config}>
      {createElement(
        config.as ?? "div",
        {
          "data-snapshot-id": rootId,
          className: rootSurface.className,
          style: rootSurface.style,
        },
        config.children?.map((child, index) => (
          <div
            key={(child as { id?: string }).id ?? index}
            data-snapshot-id={`${rootId}-item`}
            className={itemSurface.className}
            style={itemSurface.style}
          >
            <ComponentRenderer config={child} />
          </div>
        )),
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
    </ComponentWrapper>
  );
}
