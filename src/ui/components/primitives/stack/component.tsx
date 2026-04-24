'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { StackBase } from "./standalone";
import type { StackConfig } from "./types";

function baseResponsiveValue<T>(value: T | { default: T } | undefined): T | undefined {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "default" in value
  ) {
    return value.default;
  }

  return value;
}

export function Stack({ config }: { config: StackConfig }) {
  const rootId = config.id ?? "stack";
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    componentSurface: config.slots?.item,
  });

  return (
    <StackBase
      gap={config.gap}
      align={config.align}
      justify={config.justify}
      maxWidth={config.maxWidth}
      overflow={config.overflow}
      maxHeight={baseResponsiveValue(config.maxHeight)}
      padding={config.padding}
      staggerDelay={
        typeof config.animation?.stagger === "number"
          ? config.animation.stagger
          : undefined
      }
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {config.children.map((child, index) => (
        <div
          key={child.id ?? `stack-child-${index}`}
          data-snapshot-id={`${rootId}-item-${index}`}
          className={itemSurface.className}
          style={{
            ...(typeof config.animation?.stagger === "number"
              ? {
                  ["--sn-stagger-index" as "--sn-stagger-index"]: index,
                }
              : undefined),
            ...(itemSurface.style ?? {}),
          }}
        >
          <ComponentRenderer config={child} />
        </div>
      ))}
    </StackBase>
  );
}
