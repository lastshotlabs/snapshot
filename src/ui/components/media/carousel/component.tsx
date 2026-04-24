"use client";

import type { ReactNode } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { CarouselBase } from "./standalone";
import type { CarouselConfig } from "./types";

/**
 * Manifest adapter — resolves children via ComponentRenderer and delegates to CarouselBase.
 */
export function Carousel({ config }: { config: CarouselConfig }) {
  const children = config.children ?? [];
  const surfaceConfig = extractSurfaceConfig(config);

  const slides: ReactNode[] = children.map((child, index) => (
    <ComponentRenderer key={child.id ?? `slide-${index}`} config={child} />
  ));

  return (
    <CarouselBase
      id={config.id}
      autoPlay={config.autoPlay}
      interval={config.interval}
      showArrows={config.showArrows}
      showDots={config.showDots}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {slides}
    </CarouselBase>
  );
}
