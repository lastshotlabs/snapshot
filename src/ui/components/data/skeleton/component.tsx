'use client';

import { useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { SkeletonConfig } from "./types";
import { SkeletonBase } from "./standalone";

export function Skeleton({ config }: { config: SkeletonConfig }) {
  const visible = useSubscribe(config.visible ?? true);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <SkeletonBase
      id={config.id}
      variant={config.variant}
      animated={config.animated}
      lines={config.lines}
      width={config.width}
      height={config.height}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
