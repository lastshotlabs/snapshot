'use client';

import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Token maps ───────────────────────────────────────────────────────────────

const MAX_WIDTH_MAP: Record<string, string> = {
  xs: "var(--sn-container-xs, 20rem)",
  sm: "var(--sn-container-sm, 24rem)",
  md: "var(--sn-container-md, 28rem)",
  lg: "var(--sn-container-lg, 32rem)",
  xl: "var(--sn-container-xl, 80rem)",
  "2xl": "var(--sn-container-2xl, 96rem)",
  full: "100%",
  prose: "var(--sn-container-prose, 65ch)",
};

const PADDING_MAP: Record<string, string> = {
  none: "0",
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ContainerBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Max-width token name, raw CSS value, or numeric px value. */
  maxWidth?: string | number;
  /** Inline padding token name. */
  padding?: string;
  /** Whether the container is horizontally centered. Default: true. */
  center?: boolean;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item). */
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered inside the container. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Container -- a centered, max-width-constrained wrapper.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <ContainerBase maxWidth="xl" padding="md">
 *   <p>Centered content</p>
 * </ContainerBase>
 * ```
 */
export function ContainerBase({
  id,
  maxWidth,
  padding,
  center,
  className,
  style,
  slots,
  children,
}: ContainerBaseProps) {
  const rootId = id ?? "container";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
      maxWidth:
        typeof maxWidth === "number"
          ? `${maxWidth}px`
          : MAX_WIDTH_MAP[maxWidth ?? "xl"],
      style: {
        paddingInline: PADDING_MAP[padding ?? "md"],
        marginInline: center === false ? undefined : "auto",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <div
      data-snapshot-component="container"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {children}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
