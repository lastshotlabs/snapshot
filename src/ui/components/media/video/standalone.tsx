'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface VideoBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Video source URL. */
  src: string;
  /** Poster image URL. */
  poster?: string;
  /** Whether to show playback controls. Default: true. */
  controls?: boolean;
  /** Whether to auto-play. */
  autoPlay?: boolean;
  /** Whether to loop. */
  loop?: boolean;
  /** Whether to mute. Defaults to true if autoPlay is set. */
  muted?: boolean;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Video — a styled video element that works with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <VideoBase src="/video.mp4" poster="/thumb.jpg" controls />
 * ```
 */
export function VideoBase({
  id,
  src,
  poster,
  controls = true,
  autoPlay,
  loop,
  muted,
  className,
  style,
  slots,
}: VideoBaseProps) {
  const rootId = id ?? "video";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
      borderRadius: "lg",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <video
        data-snapshot-component="video"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        src={src}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted ?? autoPlay}
        playsInline
        style={rootSurface.style}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
