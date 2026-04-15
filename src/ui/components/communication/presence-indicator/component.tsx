'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { PresenceIndicatorConfig } from "./types";

/** Status → dot color mapping. */
const STATUS_COLORS: Record<string, string> = {
  online: "var(--sn-color-success, #22c55e)",
  offline: "var(--sn-color-muted-foreground, #6b7280)",
  away: "var(--sn-color-warning, #f59e0b)",
  busy: "var(--sn-color-destructive, #ef4444)",
  dnd: "var(--sn-color-destructive, #ef4444)",
};

/** Status → display label mapping. */
const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
  dnd: "Do Not Disturb",
};

/** Size → dot diameter in px. */
const DOT_SIZES: Record<string, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

/** Size → font size token. */
const FONT_SIZES: Record<string, string> = {
  sm: "var(--sn-font-size-xs, 0.75rem)",
  md: "var(--sn-font-size-sm, 0.875rem)",
  lg: "var(--sn-font-size-md, 1rem)",
};

/**
 * PresenceIndicator — displays online/offline/away/busy/dnd status
 * with a colored dot and optional label.
 *
 * @param props - Component props containing the presence indicator configuration
 */
export function PresenceIndicator({
  config,
}: {
  config: PresenceIndicatorConfig;
}) {
  const visible = useSubscribe(config.visible ?? true);
  const status = useSubscribe(config.status) as string;
  const label = useSubscribe(config.label ?? "") as string;

  if (visible === false) return null;

  const showDot = config.showDot ?? true;
  const showLabel = config.showLabel ?? true;
  const size = config.size ?? "md";
  const dotSize = DOT_SIZES[size] ?? 8;
  const dotColor = STATUS_COLORS[status] ?? STATUS_COLORS.offline!;
  const displayLabel = label || STATUS_LABELS[status] || status;
  const rootId = config.id ?? "presence-indicator";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.dot,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      style: {
        fontSize: FONT_SIZES[size],
        color: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: config.slots?.label,
  });

  return (
    <div
      data-snapshot-component="presence-indicator"
      data-snapshot-id={rootId}
      data-testid="presence-indicator"
      role="status"
      aria-label={displayLabel}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
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
