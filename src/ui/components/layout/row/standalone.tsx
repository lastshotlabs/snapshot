'use client';

import type { CSSProperties, ReactNode } from "react";
import { useResponsiveValue } from "../../../hooks/use-breakpoint";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Token maps ───────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  none: "0",
  "2xs": "var(--sn-spacing-2xs, 0.125rem)",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
  "2xl": "var(--sn-spacing-2xl, 2.5rem)",
};

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
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered inside the row. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Row -- a horizontal flex container.
 * No manifest context required.
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
