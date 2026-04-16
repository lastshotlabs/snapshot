'use client';

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { SnapshotImageConfig } from "./types";

const IMAGE_ROUTE = "/_snapshot/image";
const IMAGE_SHIMMER_KEYFRAMES = `
  @keyframes sn-image-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
`;

function buildImageUrl(params: {
  src: string;
  width: number;
  height?: number;
  format: SnapshotImageConfig["format"];
  quality: number;
}): string {
  const searchParams = new URLSearchParams({
    url: params.src,
    w: String(params.width),
    f: params.format,
    q: String(params.quality),
  });

  if (params.height !== undefined) {
    searchParams.set("h", String(params.height));
  }

  return `${IMAGE_ROUTE}?${searchParams.toString()}`;
}

function scaleHeight(
  height: number | undefined,
  sourceWidth: number,
  targetWidth: number,
): number | undefined {
  if (height === undefined) {
    return undefined;
  }

  return Math.max(1, Math.round((height * targetWidth) / sourceWidth));
}

function resolveSrcSet(config: SnapshotImageConfig): string {
  const widths = [
    Math.max(1, Math.round(config.width * 0.5)),
    config.width,
    Math.min(4096, Math.round(config.width * 2)),
  ];

  return widths
    .map((width) => {
      const height = scaleHeight(config.height, config.width, width);
      const url = buildImageUrl({
        src: config.src,
        width,
        height,
        format: config.format,
        quality: config.quality,
      });

      return `${url} ${width}w`;
    })
    .join(", ");
}

export function SnapshotImage({ config }: { config: SnapshotImageConfig }) {
  const [loaded, setLoaded] = useState(config.placeholder === "empty");

  useEffect(() => {
    setLoaded(config.placeholder === "empty");
  }, [config.placeholder, config.src]);

  const rootId = config.id ?? "image";
  const imgSrc = buildImageUrl({
    src: config.src,
    width: config.width,
    height: config.height,
    format: config.format,
    quality: config.quality,
  });
  const srcSet = resolveSrcSet(config);
  const loading = config.loading ?? (config.priority ? "eager" : "lazy");

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "block",
      overflow: "hidden",
      width: "100%",
      style: {
        aspectRatio:
          config.aspectRatio ??
          (config.height ? `${config.width} / ${config.height}` : undefined),
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["width", "height"] }),
    itemSurface: config.slots?.root,
  });
  const placeholderSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-placeholder`,
    implementationBase: {
      position: "absolute",
      inset: "0",
      display: "block",
      style:
        config.placeholder === "blur"
          ? {
              background:
                "linear-gradient(135deg, var(--sn-color-muted, #e5e7eb), var(--sn-color-surface-alt, #f3f4f6))",
              filter: "blur(18px)",
              transform: "scale(1.05)",
            }
          : {
              background:
                "linear-gradient(90deg, var(--sn-color-muted, #e5e7eb) 25%, var(--sn-color-surface-alt, #f3f4f6) 37%, var(--sn-color-muted, #e5e7eb) 63%)",
              backgroundSize: "400% 100%",
            },
      active: {
        style:
          config.placeholder === "skeleton"
            ? {
                animation:
                  "sn-image-shimmer var(--sn-duration-slow, 1.8s) linear infinite",
              }
            : undefined,
      },
    },
    componentSurface: config.slots?.placeholder,
    activeStates: config.placeholder === "skeleton" ? ["active"] : [],
  });
  const imageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-image`,
    implementationBase: {
      display: "block",
      width: "100%",
      height: "100%",
      style: {
        objectFit: "cover",
      },
    },
    componentSurface: config.slots?.image,
  });

  useEffect(() => {
    if (!config.priority) {
      return undefined;
    }

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imgSrc;
    link.setAttribute("imagesrcset", srcSet);

    if (config.sizes) {
      link.setAttribute("imagesizes", config.sizes);
    }

    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [config.priority, config.sizes, imgSrc, srcSet]);

  const rootStyle: CSSProperties = {
    ...(rootSurface.style ?? {}),
    ...((config.style as CSSProperties | undefined) ?? {}),
  };

  return (
    <div
      data-snapshot-component="image"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={rootStyle}
    >
      {config.placeholder !== "empty" ? (
        <div
          data-testid="snapshot-image-placeholder"
          data-snapshot-id={`${rootId}-placeholder`}
          className={placeholderSurface.className}
          style={{
            ...(placeholderSurface.style ?? {}),
            opacity: loaded ? 0 : 1,
            transition: "opacity 180ms ease",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <img
        data-testid="snapshot-image"
        data-snapshot-id={`${rootId}-image`}
        className={imageSurface.className}
        src={imgSrc}
        srcSet={srcSet}
        sizes={config.sizes}
        loading={loading}
        alt={config.alt}
        style={imageSurface.style}
        onLoad={() => setLoaded(true)}
      />
      <SurfaceStyles
        css={config.placeholder === "skeleton" ? IMAGE_SHIMMER_KEYFRAMES : undefined}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={placeholderSurface.scopedCss} />
      <SurfaceStyles css={imageSurface.scopedCss} />
    </div>
  );
}
