'use client';

import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Token maps ───────────────────────────────────────────────────────────────

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

export interface SectionBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Section height: "screen" for 100vh, "auto", or a CSS value. */
  height?: string;
  /** Cross-axis alignment. */
  align?: string;
  /** Main-axis justification. */
  justify?: string;
  /** Whether the section bleeds to full width. */
  bleed?: boolean;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item). */
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered inside the section. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Section -- a full-width vertical section with optional height and alignment.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <SectionBase height="screen" align="center" justify="center">
 *   <h1>Hero content</h1>
 * </SectionBase>
 * ```
 */
export function SectionBase({
  id,
  height,
  align,
  justify,
  bleed,
  className,
  style,
  slots,
  children,
}: SectionBaseProps) {
  const rootId = id ?? "section";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      minHeight:
        height === "screen"
          ? "100vh"
          : height === "auto"
            ? undefined
            : height,
      alignItems: align ? ALIGN_MAP[align] : undefined,
      justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
      style: bleed
        ? {
            marginInline: "calc(-1 * var(--sn-spacing-lg, 1.5rem))",
            paddingInline: "var(--sn-spacing-lg, 1.5rem)",
          }
        : undefined,
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <div
      data-snapshot-component="section"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {children}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
