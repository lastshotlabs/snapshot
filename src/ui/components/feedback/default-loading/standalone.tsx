"use client";

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface DefaultLoadingBaseProps {
  /** Pre-resolved label text. */
  label?: string;
  /** Spinner size. */
  size?: "sm" | "md" | "lg";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, spinner, label). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone DefaultLoading — renders a loading spinner with label.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <DefaultLoadingBase label="Loading your data..." size="md" />
 * ```
 */
export function DefaultLoadingBase({
  label,
  size = "md",
  id,
  className,
  style,
  slots,
}: DefaultLoadingBaseProps) {
  const diameter = size === "sm" ? "1rem" : size === "lg" ? "2rem" : "1.5rem";
  const rootId = id ?? "spinner";
  const componentSurface = className || style ? { className, style } : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      color: "var(--sn-color-muted-foreground, #64748b)",
      style: {
        placeItems: "center",
        padding: "var(--sn-spacing-lg, 1.5rem)",
      },
    },
    componentSurface,
    itemSurface: slots?.root,
    activeStates: ["active"],
  });
  const spinnerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-spinner`,
    implementationBase: {
      borderRadius: "full",
      style: {
        width: diameter,
        height: diameter,
        border: "2px solid var(--sn-color-border, #cbd5e1)",
        borderTopColor: "var(--sn-color-primary, #0f172a)",
        animation: "sn-spin 0.8s linear infinite",
      },
    },
    componentSurface: slots?.spinner,
    activeStates: ["active"],
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
    },
    componentSurface: slots?.label,
    activeStates: ["active"],
  });
  const spinCss = `
    @keyframes sn-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-snapshot-feedback="loading"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <span
        aria-hidden="true"
        data-snapshot-id={`${rootId}-spinner`}
        className={spinnerSurface.className}
        style={spinnerSurface.style}
      />
      <span
        data-snapshot-id={`${rootId}-label`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {label ?? "Loading"}
      </span>
      <SurfaceStyles css={spinCss} />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={spinnerSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
