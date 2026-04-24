'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface DividerBaseProps {
  /** Optional label text displayed in the center of a horizontal divider. */
  label?: string;
  /** Orientation of the divider. */
  orientation?: "horizontal" | "vertical";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, lineStart, label, lineEnd). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone Divider — renders a horizontal or vertical separator line,
 * optionally with a centered label. No manifest context required.
 *
 * @example
 * ```tsx
 * <DividerBase orientation="horizontal" label="OR" />
 * ```
 */
export function DividerBase({
  label,
  orientation = "horizontal",
  id,
  className,
  style,
  slots,
}: DividerBaseProps) {
  const rootId = id ?? "divider";
  const componentSurface = className || style ? { className, style } : undefined;

  if (orientation === "vertical") {
    const rootSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-root`,
      implementationBase: {
        style: {
          width: "1px",
          alignSelf: "stretch",
          background: "var(--sn-color-border)",
        },
      },
      componentSurface,
      itemSurface: slots?.root,
    });

    return (
      <>
        <div
          role="separator"
          aria-orientation="vertical"
          data-snapshot-component="divider"
          data-snapshot-id={`${rootId}-root`}
          className={rootSurface.className}
          style={rootSurface.style}
        />
        <SurfaceStyles css={rootSurface.scopedCss} />
      </>
    );
  }

  if (!label) {
    const rootSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-root`,
      implementationBase: {
        border: "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
        style: { borderLeft: "none", borderRight: "none", borderBottom: "none" },
      },
      componentSurface,
      itemSurface: slots?.root,
    });

    return (
      <>
        <div
          role="separator"
          data-snapshot-component="divider"
          data-snapshot-id={`${rootId}-root`}
          className={rootSurface.className}
          style={rootSurface.style}
        />
        <SurfaceStyles css={rootSurface.scopedCss} />
      </>
    );
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "md",
    },
    componentSurface,
    itemSurface: slots?.root,
  });
  const startLineSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-line-start`,
    implementationBase: {
      style: {
        flex: 1,
        height: 0,
        borderTop: "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
      },
    },
    componentSurface: slots?.lineStart,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
    },
    componentSurface: slots?.label,
  });
  const endLineSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-line-end`,
    implementationBase: {
      style: {
        flex: 1,
        height: 0,
        borderTop: "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
      },
    },
    componentSurface: slots?.lineEnd,
  });

  return (
    <>
      <div
        role="separator"
        data-snapshot-component="divider"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-line-start`}
          className={startLineSurface.className}
          style={startLineSurface.style}
        />
        <span
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
        </span>
        <div
          data-snapshot-id={`${rootId}-line-end`}
          className={endLineSurface.className}
          style={endLineSurface.style}
        />
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={startLineSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={endLineSurface.scopedCss} />
    </>
  );
}
