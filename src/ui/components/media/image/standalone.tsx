'use client';

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

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
  format: string;
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

function resolveSrcSet(params: {
  src: string;
  width: number;
  height?: number;
  format: string;
  quality: number;
}): string {
  const widths = [
    Math.max(1, Math.round(params.width * 0.5)),
    params.width,
    Math.min(4096, Math.round(params.width * 2)),
  ];

  return widths
    .map((width) => {
      const height = scaleHeight(params.height, params.width, width);
      const url = buildImageUrl({
        src: params.src,
        width,
        height,
        format: params.format,
        quality: params.quality,
      });

      return `${url} ${width}w`;
    })
    .join(", ");
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SnapshotImageBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Image source URL. */
  src: string;
  /** Image alt text. */
  alt: string;
  /** Display width in pixels. */
  width: number;
  /** Display height in pixels. */
  height?: number;
  /** Output quality (1-100). Default: 75. */
  quality?: number;
  /** Output format. Default: "original". */
  format?: "avif" | "webp" | "jpeg" | "png" | "original";
  /** Responsive sizes attribute. */
  sizes?: string;
  /** Whether to preload the image. Default: false. */
  priority?: boolean;
  /** Placeholder type while loading. Default: "empty". */
  placeholder?: "blur" | "empty" | "skeleton";
  /** Loading strategy. Defaults to "eager" if priority, else "lazy". */
  loading?: "lazy" | "eager";
  /** CSS aspect ratio override. */
  aspectRatio?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, placeholder, image). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone SnapshotImage — an optimized image component with placeholder
 * support. No manifest context required.
 *
 * @example
 * ```tsx
 * <SnapshotImageBase src="/photo.jpg" alt="Photo" width={800} height={600} placeholder="blur" />
 * ```
 */
export function SnapshotImageBase({
  id,
  src,
  alt,
  width,
  height,
  quality = 75,
  format = "original",
  sizes,
  priority = false,
  placeholder = "empty",
  loading: loadingProp,
  aspectRatio,
  className,
  style,
  slots,
}: SnapshotImageBaseProps) {
  const [loaded, setLoaded] = useState(placeholder === "empty");

  useEffect(() => {
    setLoaded(placeholder === "empty");
  }, [placeholder, src]);

  const rootId = id ?? "image";
  const imgSrc = buildImageUrl({ src, width, height, format, quality });
  const srcSet = resolveSrcSet({ src, width, height, format, quality });
  const loading = loadingProp ?? (priority ? "eager" : "lazy");

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "block",
      overflow: "hidden",
      width: "100%",
      style: {
        aspectRatio:
          aspectRatio ??
          (height ? `${width} / ${height}` : undefined),
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const placeholderSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-placeholder`,
    implementationBase: {
      position: "absolute",
      inset: "0",
      display: "block",
      style:
        placeholder === "blur"
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
          placeholder === "skeleton"
            ? {
                animation:
                  "sn-image-shimmer var(--sn-duration-slow, 1.8s) linear infinite",
              }
            : undefined,
      },
    },
    componentSurface: slots?.placeholder,
    activeStates: placeholder === "skeleton" ? ["active"] : [],
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
    componentSurface: slots?.image,
  });

  useEffect(() => {
    if (!priority) {
      return undefined;
    }

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imgSrc;
    link.setAttribute("imagesrcset", srcSet);

    if (sizes) {
      link.setAttribute("imagesizes", sizes);
    }

    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [priority, sizes, imgSrc, srcSet]);

  return (
    <div
      data-snapshot-component="image"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {placeholder !== "empty" ? (
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
        sizes={sizes}
        loading={loading}
        alt={alt}
        style={imageSurface.style}
        onLoad={() => setLoaded(true)}
      />
      <SurfaceStyles
        css={placeholder === "skeleton" ? IMAGE_SHIMMER_KEYFRAMES : undefined}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={placeholderSurface.scopedCss} />
      <SurfaceStyles css={imageSurface.scopedCss} />
    </div>
  );
}
