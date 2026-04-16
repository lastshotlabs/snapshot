import type { NotificationBellConfig } from "./types";
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
export declare function NotificationBell({ config, }: {
    config: NotificationBellConfig;
}): import("react/jsx-runtime").JSX.Element | null;
