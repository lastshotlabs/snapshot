import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
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

  const handleClick = () => {
    if (config.clickAction) {
      void execute(config.clickAction as Parameters<typeof execute>[0]);
    }
  };

  return (
    <div
      data-snapshot-component="notification-bell"
      style={{
        display: "inline-flex",
        ...(config.style as React.CSSProperties),
      }}
    >
      <style>{`
[data-snapshot-component="notification-bell"] button:focus { outline: none; }
[data-snapshot-component="notification-bell"] button:focus-visible { outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb)); outline-offset: var(--sn-ring-offset, 2px); }
      `}</style>
      <button
        data-testid="notification-bell"
        className={config.className}
        onClick={handleClick}
        aria-label={
          showBadge
            ? `Notifications (${resolvedCount} unread)`
            : "Notifications"
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "var(--sn-spacing-xs, 0.25rem)",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
          color: "var(--sn-color-foreground, #111827)",
        }}
      >
        <Icon name="bell" size={iconSize} />

        {/* Badge */}
        {showBadge && (
          <span
            data-testid="notification-badge"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: badge.offset,
              right: badge.offset,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: badge.minWidth,
              height: badge.height,
              padding: badge.padding,
              fontSize: badge.fontSize,
              fontWeight: "var(--sn-font-weight-bold, 700)" as string,
              lineHeight: "var(--sn-leading-none, 1)",
              borderRadius: "var(--sn-radius-full, 9999px)",
              backgroundColor: "var(--sn-color-destructive, #ef4444)",
              color: "var(--sn-color-destructive-foreground, #ffffff)",
            }}
          >
            {displayCount}
          </span>
        )}
      </button>
    </div>
  );
}
