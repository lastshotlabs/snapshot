"use client";

import type { CSSProperties } from "react";
import { usePrefetchRoute } from "../../../../ssr/prefetch";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { PrefetchLinkBase } from "./standalone";
import type { PrefetchLinkProps } from "./schema";

/**
 * Manifest adapter — wires the SSR prefetch route hook into PrefetchLinkBase.
 */
export function PrefetchLink(config: PrefetchLinkProps) {
  const prefetchRoute = usePrefetchRoute();
  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <PrefetchLinkBase
      id={config.id}
      to={config.to}
      prefetch={config.prefetch}
      target={config.target}
      rel={config.rel}
      onPrefetch={prefetchRoute}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {config.children}
    </PrefetchLinkBase>
  );
}
