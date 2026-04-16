'use client';

import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import type { BannerConfig } from "./types";

export function Banner({ config }: { config: BannerConfig }) {
  const height =
    typeof config.height === "string"
      ? config.height
      : config.height?.default ?? "50vh";
  const align = config.align ?? "center";
  const background = config.background;
  const rootId = config.id ?? "banner";

  const alignMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      overflow: "hidden",
      style: {
        alignItems: alignMap[align] ?? "center",
        minHeight: height,
        padding: "var(--sn-spacing-xl, 2rem)",
        ...(background?.image
          ? {
              backgroundImage: `url(${background.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {}),
        ...(background?.color ? { backgroundColor: background.color } : {}),
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["height"] }),
    itemSurface: config.slots?.root,
  });
  const overlaySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-overlay`,
    implementationBase: {
      position: "absolute",
      inset: "0",
      style: {
        background: background?.overlay,
        zIndex: 0,
      },
    },
    componentSurface: config.slots?.overlay,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      style: {
        zIndex: 1,
        alignItems: alignMap[align] ?? "center",
        gap: "var(--sn-spacing-md, 1rem)",
        textAlign: align,
        maxWidth: "var(--sn-container-lg, 42rem)",
      },
    },
    componentSurface: config.slots?.content,
  });

  return (
    <div
      data-snapshot-component="banner"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {background?.overlay ? (
        <div
          data-snapshot-id={`${rootId}-overlay`}
          className={overlaySurface.className}
          style={overlaySurface.style}
        />
      ) : null}
      <div
        data-snapshot-id={`${rootId}-content`}
        className={contentSurface.className}
        style={contentSurface.style}
      >
        {config.children?.map((child, index) => (
          <ComponentRenderer
            key={(child as ComponentConfig).id ?? `banner-child-${index}`}
            config={child as ComponentConfig}
          />
        ))}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={overlaySurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
