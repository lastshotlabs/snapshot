'use client';

import type { CSSProperties } from "react";
import { VideoBase } from "./standalone";
import type { VideoSchemaConfig } from "./types";

/**
 * Manifest adapter — extracts config props and delegates to VideoBase.
 */
export function Video({ config }: { config: VideoSchemaConfig }) {
  return (
    <VideoBase
      id={config.id}
      src={config.src}
      poster={config.poster}
      controls={config.controls !== false}
      autoPlay={config.autoPlay}
      loop={config.loop}
      muted={config.muted ?? config.autoPlay}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
