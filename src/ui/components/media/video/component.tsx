'use client';

import type { CSSProperties } from "react";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
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
    componentSurface: config.slots?.root,
  });

  return (
    <>
      <video
        data-snapshot-component="video"
        data-snapshot-id={rootId}
        className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
        src={config.src}
        poster={config.poster}
        controls={config.controls !== false}
        autoPlay={config.autoPlay}
        loop={config.loop}
        muted={config.muted ?? config.autoPlay}
        playsInline
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
