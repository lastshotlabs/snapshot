'use client';

import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { EmbedSchemaConfig } from "./types";

export function Embed({ config }: { config: EmbedSchemaConfig }) {
  const rawUrl = useSubscribe(config.url);
  const rawAspectRatio = useSubscribe(config.aspectRatio);
  const rawTitle = useSubscribe(config.title);
  const url = typeof rawUrl === "string" ? rawUrl : "";
  const aspectRatio =
    typeof rawAspectRatio === "string" ? rawAspectRatio : "16/9";
  const title = typeof rawTitle === "string" ? rawTitle : undefined;
  const rootId = config.id ?? "embed";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      width: "100%",
      overflow: "hidden",
      borderRadius: "lg",
      style: {
        aspectRatio,
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const frameSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-frame`,
    implementationBase: {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      style: {
        border: "none",
      },
    },
    componentSurface: config.slots?.frame,
  });

  return (
    <div
      data-snapshot-component="embed"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <iframe
        src={url}
        title={title ?? "Embedded content"}
        data-snapshot-id={`${rootId}-frame`}
        className={frameSurface.className}
        style={frameSurface.style}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={frameSurface.scopedCss} />
    </div>
  );
}
