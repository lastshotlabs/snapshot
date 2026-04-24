'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface EmbedBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** URL to embed in the iframe. */
  url: string;
  /** CSS aspect ratio string (e.g. "16/9"). Default: "16/9". */
  aspectRatio?: string;
  /** Title for the iframe (accessibility). */
  title?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, frame). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Embed — a responsive iframe container for embedding external
 * content. No manifest context required.
 *
 * @example
 * ```tsx
 * <EmbedBase url="https://www.youtube.com/embed/xyz" aspectRatio="16/9" title="Demo Video" />
 * ```
 */
export function EmbedBase({
  id,
  url,
  aspectRatio = "16/9",
  title,
  className,
  style,
  slots,
}: EmbedBaseProps) {
  const rootId = id ?? "embed";

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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
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
    componentSurface: slots?.frame,
  });

  return (
    <div
      data-snapshot-component="embed"
      data-snapshot-id={rootId}
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
