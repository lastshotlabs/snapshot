'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SeparatorBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Orientation of the separator. */
  orientation?: "horizontal" | "vertical";
  /** Optional label text displayed in the center of the separator. */
  label?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, line, label). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Separator — a horizontal or vertical line with optional label.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <SeparatorBase
 *   orientation="horizontal"
 *   label="OR"
 * />
 * ```
 */
export function SeparatorBase({
  id,
  orientation = "horizontal",
  label,
  className,
  style,
  slots,
}: SeparatorBaseProps) {
  const isVertical = orientation === "vertical";
  const rootId = id ?? "separator";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: isVertical
      ? {
          display: "inline-block",
          style: {
            width: "var(--sn-border-thin, 1px)",
            alignSelf: "stretch",
            minHeight: "var(--sn-spacing-lg, 1.5rem)",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
            flexShrink: 0,
          },
        }
      : label
        ? {
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            width: "100%",
          }
        : {
            width: "100%",
            style: {
              height: "var(--sn-border-thin, 1px)",
              backgroundColor: "var(--sn-color-border, #e5e7eb)",
            },
          },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const lineSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-line`,
    implementationBase: {
      flex: "1",
      style: {
        height: "var(--sn-border-thin, 1px)",
        backgroundColor: "var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: slots?.line,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
      fontWeight: "medium",
      style: {
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        letterSpacing: "var(--sn-tracking-wide, 0.05em)",
      },
    },
    componentSurface: slots?.label,
  });

  if (isVertical) {
    return (
      <>
        <div
          data-snapshot-component="separator"
          role="separator"
          aria-orientation="vertical"
          className={rootSurface.className}
          style={rootSurface.style}
        />
        <SurfaceStyles css={rootSurface.scopedCss} />
      </>
    );
  }

  if (label) {
    return (
      <div
        data-snapshot-component="separator"
        role="separator"
        aria-orientation="horizontal"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-line`}
          className={lineSurface.className}
          style={lineSurface.style}
        />
        <span
          data-snapshot-separator-label=""
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
        </span>
        <div
          data-snapshot-id={`${rootId}-line`}
          className={lineSurface.className}
          style={lineSurface.style}
        />
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={lineSurface.scopedCss} />
        <SurfaceStyles css={labelSurface.scopedCss} />
      </div>
    );
  }

  return (
    <>
      <div
        data-snapshot-component="separator"
        role="separator"
        aria-orientation="horizontal"
        className={rootSurface.className}
        style={rootSurface.style}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
