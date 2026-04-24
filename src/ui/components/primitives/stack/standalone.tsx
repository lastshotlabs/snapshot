'use client';

import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Token maps (shared with manifest variant) ────────────────────────────────

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
  stretch: "stretch",
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

const MAX_WIDTH_MAP: Record<string, string> = {
  xs: "var(--sn-container-xs, 20rem)",
  sm: "var(--sn-container-sm, 28rem)",
  md: "var(--sn-container-md, 32rem)",
  lg: "var(--sn-container-lg, 40rem)",
  xl: "var(--sn-container-xl, 48rem)",
  "2xl": "var(--sn-container-2xl, 56rem)",
  full: "100%",
};

const PADDING_MAP: Record<string, string> = {
  none: "0",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
};

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface StackBaseProps {
  /** Gap between children — a token name or CSS value. */
  gap?: string;
  /** Cross-axis alignment. */
  align?: "stretch" | "start" | "center" | "end";
  /** Main-axis justification. */
  justify?: "start" | "center" | "end" | "between" | "around";
  /** Maximum width constraint token. */
  maxWidth?: string;
  /** Overflow behavior. */
  overflow?: string;
  /** Maximum height. */
  maxHeight?: string;
  /** Padding token. */
  padding?: string;
  /** Stagger animation delay per child (ms). */
  staggerDelay?: number;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item). */
  slots?: Record<string, Record<string, unknown>>;

  /** React children rendered inside the stack. */
  children?: ReactNode;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone Stack — a flex-column layout container with token-based spacing.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <StackBase gap="md" align="center" padding="lg">
 *   <p>First item</p>
 *   <p>Second item</p>
 * </StackBase>
 * ```
 */
export function StackBase({
  gap = "md",
  align = "stretch",
  justify = "start",
  maxWidth,
  overflow,
  maxHeight,
  padding,
  staggerDelay,
  id,
  className,
  style,
  slots,
  children,
}: StackBaseProps) {
  const rootId = id ?? "stack";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: GAP_MAP[gap] ?? gap,
      alignItems: ALIGN_MAP[align] ?? align,
      justifyContent: JUSTIFY_MAP[justify] ?? justify,
      width: "100%",
      maxWidth: maxWidth ? MAX_WIDTH_MAP[maxWidth] ?? maxWidth : undefined,
      overflow,
      maxHeight,
      style: {
        padding: padding ? PADDING_MAP[padding] ?? padding : undefined,
        marginInline: maxWidth ? "auto" : undefined,
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    componentSurface: slots?.item,
  });

  return (
    <>
      <div
        data-snapshot-component="stack"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={itemSurface.scopedCss} />
    </>
  );
}
