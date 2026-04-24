'use client';

import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Lookup maps ──────────────────────────────────────────────────────────────

/** Status to dot color mapping. */
const STATUS_COLORS: Record<string, string> = {
  online: "var(--sn-color-success, #22c55e)",
  offline: "var(--sn-color-muted-foreground, #6b7280)",
  away: "var(--sn-color-warning, #f59e0b)",
  busy: "var(--sn-color-destructive, #ef4444)",
  dnd: "var(--sn-color-destructive, #ef4444)",
};

/** Status to display label mapping. */
const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
  dnd: "Do Not Disturb",
};

/** Size to dot diameter in px. */
const DOT_SIZES: Record<string, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

/** Size to font size token. */
const FONT_SIZES: Record<string, string> = {
  sm: "var(--sn-font-size-xs, 0.75rem)",
  md: "var(--sn-font-size-sm, 0.875rem)",
  lg: "var(--sn-font-size-md, 1rem)",
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface PresenceIndicatorBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Status string: "online" | "offline" | "away" | "busy" | "dnd". */
  status: string;
  /** Custom label text. Falls back to status name. */
  label?: string;
  /** Whether to show the status dot. Default: true. */
  showDot?: boolean;
  /** Whether to show the status label. Default: true. */
  showLabel?: boolean;
  /** Size variant. Default: "md". */
  size?: "sm" | "md" | "lg";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, dot, label). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone PresenceIndicator — displays online/offline/away/busy/dnd status
 * with a colored dot and optional label. No manifest context required.
 *
 * @example
 * ```tsx
 * <PresenceIndicatorBase status="online" size="md" />
 * ```
 */
export function PresenceIndicatorBase({
  id,
  status,
  label,
  showDot = true,
  showLabel = true,
  size = "md",
  className,
  style,
  slots,
}: PresenceIndicatorBaseProps) {
  const dotSize = DOT_SIZES[size] ?? 8;
  const dotColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline!;
  const displayLabel = label || STATUS_LABELS[status] || status;
  const rootId = id ?? "presence-indicator";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const dotSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dot`,
    implementationBase: {
      display: "inline-block",
      style: {
        width: dotSize,
        height: dotSize,
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: dotColor,
        flexShrink: 0,
      },
    },
    componentSurface: slots?.dot,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      style: {
        fontSize: FONT_SIZES[size],
        color: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: slots?.label,
  });

  return (
    <div
      data-snapshot-component="presence-indicator"
      data-snapshot-id={rootId}
      data-testid="presence-indicator"
      role="status"
      aria-label={displayLabel}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {showDot && (
        <span
          data-snapshot-id={`${rootId}-dot`}
          data-testid="presence-dot"
          className={dotSurface.className}
          style={dotSurface.style}
        />
      )}
      {showLabel && (
        <span
          data-snapshot-id={`${rootId}-label`}
          data-testid="presence-label"
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {displayLabel}
        </span>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={dotSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
