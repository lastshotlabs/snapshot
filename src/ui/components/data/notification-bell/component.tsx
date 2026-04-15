'use client';

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { NotificationBellConfig } from "./types";

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

/**
 * NotificationBell component — a config-driven bell icon with unread count badge.
 *
 * Shows a bell icon with an optional red badge displaying the unread count.
 * Badge is hidden when count is 0 or undefined. Counts exceeding `max` are
 * displayed as "{max}+".
 *
 * @param props - Component props containing the notification bell configuration
 *
 * @example
 * ```json
 * {
 *   "type": "notification-bell",
 *   "count": 12,
 *   "clickAction": { "type": "navigate", "to": "/notifications" }
 * }
 * ```
 */
export function NotificationBell({
  config,
}: {
  config: NotificationBellConfig;
}) {
  const resolvedCount = useSubscribe(config.count ?? 0) as number;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  // Publish count
  useEffect(() => {
    if (publish) {
      publish({ count: resolvedCount });
    }
  }, [publish, resolvedCount]);

  if (visible === false) return null;

  const size = config.size ?? "md";
  const max = config.max ?? 99;
  const iconSize = SIZE_MAP[size];
  const badge = BADGE_SIZE_MAP[size];
  const showBadge = resolvedCount > 0;
  const displayCount = resolvedCount > max ? `${max}+` : String(resolvedCount);
  const rootId = config.id ?? "notification-bell";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.button,
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
    componentSurface: config.slots?.badge,
  });

  const handleClick = () => {
    if (config.clickAction) {
      void execute(config.clickAction as Parameters<typeof execute>[0]);
    }
  };

  return (
    <div
      data-snapshot-component="notification-bell"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
    >
      <ButtonControl
        onClick={handleClick}
        testId="notification-bell"
        ariaLabel={
          showBadge
            ? `Notifications (${resolvedCount} unread)`
            : "Notifications"
        }
        ariaLive={config.ariaLive}
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
