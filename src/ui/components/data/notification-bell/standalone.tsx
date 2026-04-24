'use client';

import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

/** Icon sizes per size variant (px). */
const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

/** Badge font sizes per size variant. */
const BADGE_SIZE_MAP = {
  sm: {
    fontSize: "var(--sn-font-size-xs, 0.5625rem)",
    minWidth: "14px",
    height: "14px",
    padding: "0 var(--sn-spacing-2xs, 0.1875rem)",
    offset: "-4px",
  },
  md: {
    fontSize: "var(--sn-font-size-xs, 0.625rem)",
    minWidth: "16px",
    height: "16px",
    padding: "0 var(--sn-spacing-2xs, 0.25rem)",
    offset: "-5px",
  },
  lg: {
    fontSize: "var(--sn-font-size-xs, 0.6875rem)",
    minWidth: "18px",
    height: "18px",
    padding: "0 var(--sn-spacing-2xs, 0.3125rem)",
    offset: "-6px",
  },
} as const;

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NotificationBellBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Unread notification count. */
  count?: number;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Maximum count before showing "N+". */
  max?: number;
  /** Callback when the bell is clicked. */
  onClick?: () => void;
  /** ARIA live region behavior. */
  ariaLive?: "polite" | "assertive" | "off";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, button, badge). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NotificationBell — bell icon with unread count badge.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <NotificationBellBase
 *   count={5}
 *   size="md"
 *   max={99}
 *   onClick={() => openNotifications()}
 * />
 * ```
 */
export function NotificationBellBase({
  id,
  count = 0,
  size = "md",
  max = 99,
  onClick,
  ariaLive,
  className,
  style,
  slots,
}: NotificationBellBaseProps) {
  const iconSize = SIZE_MAP[size];
  const badge = BADGE_SIZE_MAP[size];
  const showBadge = count > 0;
  const displayCount = count > max ? `${max}+` : String(count);
  const rootId = id ?? "notification-bell";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const buttonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-button`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      style: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "var(--sn-spacing-xs, 0.25rem)",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        color: "var(--sn-color-foreground, #111827)",
      },
      focus: {
        ring: true,
      },
    },
    componentSurface: slots?.button,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-badge`,
    implementationBase: {
      position: "absolute",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      style: {
        top: badge.offset,
        right: badge.offset,
        minWidth: badge.minWidth,
        height: badge.height,
        padding: badge.padding,
        fontSize: badge.fontSize,
        fontWeight: "var(--sn-font-weight-bold, 700)",
        lineHeight: "var(--sn-leading-none, 1)",
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-destructive, #ef4444)",
        color: "var(--sn-color-destructive-foreground, #ffffff)",
      },
    },
    componentSurface: slots?.badge,
  });

  return (
    <div
      data-snapshot-component="notification-bell"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ButtonControl
        onClick={onClick}
        testId="notification-bell"
        ariaLabel={
          showBadge
            ? `Notifications (${count} unread)`
            : "Notifications"
        }
        ariaLive={ariaLive}
        variant="ghost"
        size="icon"
        surfaceId={`${rootId}-button`}
        surfaceConfig={buttonSurface.resolvedConfigForWrapper}
      >
        <Icon name="bell" size={iconSize} />
        {showBadge && (
          <span
            data-snapshot-id={`${rootId}-badge`}
            data-testid="notification-badge"
            aria-hidden="true"
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {displayCount}
          </span>
        )}
      </ButtonControl>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={buttonSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
    </div>
  );
}
