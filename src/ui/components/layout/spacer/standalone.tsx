'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Size tokens ──────────────────────────────────────────────────────────────

const SIZE_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
  "2xl": "var(--sn-spacing-2xl, 2.5rem)",
  "3xl": "var(--sn-spacing-3xl, 3rem)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SpacerBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Size token name or raw CSS value. Default: "md". */
  size?: string;
  /** Axis along which the spacer expands. Default: "vertical". */
  axis?: "horizontal" | "vertical";
  /** Whether the spacer should flex-grow. */
  flex?: boolean;
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Spacer -- an empty element that takes up space along an axis.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <SpacerBase size="lg" />
 * <SpacerBase axis="horizontal" size="md" />
 * ```
 */
export function SpacerBase({
  id,
  size: sizeProp,
  axis = "vertical",
  flex,
  className,
  style,
  slots,
}: SpacerBaseProps) {
  const size =
    (sizeProp ? SIZE_MAP[sizeProp] : undefined) ??
    sizeProp ??
    "var(--sn-spacing-md, 1rem)";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: id,
    implementationBase:
      axis === "horizontal"
        ? {
            style: {
              width: size,
              minWidth: size,
              flexGrow: flex ? 1 : 0,
              flexShrink: 0,
            },
          }
        : {
            style: {
              height: size,
              minHeight: size,
              flexGrow: flex ? 1 : 0,
              flexShrink: 0,
            },
          },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <div
        aria-hidden="true"
        data-snapshot-id={id}
        className={rootSurface.className}
        style={rootSurface.style}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
