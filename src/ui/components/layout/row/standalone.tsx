'use client';

import type { CSSProperties, ReactNode } from "react";
import type { SlotOverrides } from "../../_base/types";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { GAP_MAP } from "../../_base/style-props";

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface RowBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Gap between children -- a token name or raw CSS value. */
  gap?: string;
  /** Cross-axis alignment. */
  align?: string;
  /** Main-axis justification. */
  justify?: string;
  /** Whether children wrap to the next line. */
  wrap?: boolean;
  /** Overflow behavior. */
  overflow?: string;
  /** Maximum height constraint. */
  maxHeight?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item). */
  slots?: SlotOverrides;
  /** React children rendered inside the row. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Row -- a horizontal flex container.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <RowBase gap="md" align="center" justify="between">
 *   <span>Left</span>
 *   <span>Right</span>
 * </RowBase>
 * ```
 */
export function RowBase({
  id,
  gap: gapProp,
  align,
  justify,
  wrap,
  overflow,
  maxHeight,
  className,
  style,
  slots,
  children,
}: RowBaseProps) {
  const gap = useResponsiveValue(gapProp);
  const resolvedGap = gap ? GAP_MAP[gap] ?? gap : undefined;
  const rootId = id ?? "row";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      gap: resolvedGap,
      alignItems: align ? ALIGN_MAP[align] : undefined,
      justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
      flexWrap: wrap ? "wrap" : undefined,
      overflow,
      maxHeight,
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <div
      data-snapshot-component="row"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {children}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
