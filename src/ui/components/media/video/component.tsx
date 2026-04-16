'use client';

import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { SurfaceStyles } from "../../_base/surface-styles";
import type { VideoSchemaConfig } from "./types";

export function Video({ config }: { config: VideoSchemaConfig }) {
  const rootId = config.id ?? "video";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
      borderRadius: "lg",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });

  return (
    <>
      <video
        data-snapshot-component="video"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        src={config.src}
        poster={config.poster}
        controls={config.controls !== false}
        autoPlay={config.autoPlay}
        loop={config.loop}
        muted={config.muted ?? config.autoPlay}
        playsInline
        style={rootSurface.style}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
