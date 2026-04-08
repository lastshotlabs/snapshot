import React, { useMemo, useCallback } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { formatRelativeTime } from "../../_base/utils";
import type { NotificationFeedConfig } from "./types";

// ── Type icons (SVG) ───────────────────────────────────────────────────────

/** Notification type icon colors. */
const typeColorMap: Record<string, string> = {
  info: "var(--sn-color-info, #3b82f6)",
  success: "var(--sn-color-success, #22c55e)",
  warning: "var(--sn-color-warning, #f59e0b)",
  error: "var(--sn-color-destructive, #ef4444)",
};

/**
 * Renders a simple SVG icon based on notification type.
 */
function TypeIcon({ type }: { type: string }) {
  const color = typeColorMap[type] ?? typeColorMap.info!;
  const size = 20;

  const iconStyle: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
  };

  switch (type) {
    case "success":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "warning":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "error":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      );
    default:
      // info
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div
      data-notification-skeleton
      style={{
        display: "flex",
        gap: "var(--sn-spacing-sm, 8px)",
        padding: "var(--sn-spacing-md, 12px)",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "var(--sn-radius-full, 9999px)",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
          opacity: 0.5,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "1em",
            width: "50%",
            borderRadius: "var(--sn-radius-xs, 2px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            opacity: 0.5,
            marginBottom: "var(--sn-spacing-xs, 4px)",
          }}
        />
        <div
          style={{
            height: "0.75em",
            width: "80%",
            borderRadius: "var(--sn-radius-xs, 2px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            opacity: 0.3,
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * Config-driven NotificationFeed component.
 *
 * Renders a scrollable list of notifications with read/unread states,
 * type-based icons, relative timestamps, a "Mark all read" button,
 * and click actions.
 *
 * @param props - Component props containing the NotificationFeed configuration
 */
export function NotificationFeed({
  config,
}: {
  config: NotificationFeedConfig;
}) {
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);

  const titleField = config.titleField ?? "title";
  const messageField = config.messageField ?? "message";
  const timestampField = config.timestampField ?? "timestamp";
  const readField = config.readField ?? "read";
  const typeField = config.typeField ?? "type";
  const showMarkAllRead = config.showMarkAllRead ?? true;

  // Extract items
  const items: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "notifications"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  // Unread count
  const unreadCount = useMemo(
    () => items.filter((item) => !item[readField]).length,
    [items, readField],
  );

  // Handle item click
  const handleItemClick = useCallback(
    (item: Record<string, unknown>) => {
      // Mark as read
      if (config.markReadAction && !item[readField]) {
        void execute(config.markReadAction, { ...item });
      }
      // Item action
      if (config.itemAction) {
        void execute(config.itemAction, { ...item });
      }
    },
    [config.markReadAction, config.itemAction, readField, execute],
  );

  // Handle mark all read
  const handleMarkAllRead = useCallback(() => {
    if (!config.markReadAction) return;
    for (const item of items) {
      if (!item[readField]) {
        void execute(config.markReadAction, { ...item });
      }
    }
  }, [config.markReadAction, items, readField, execute]);

  if (visible === false) return null;

  return (
    <div
      data-snapshot-component="notification-feed"
      className={config.className}
      style={{
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`[data-notification-item]:hover { background-color: var(--sn-color-accent, #f0f9ff) !important; }`}</style>
      {/* Header */}
      <div
        data-notification-header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
          borderBottom: "1px solid var(--sn-color-border, #e2e8f0)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 8px)",
          }}
        >
          <span
            style={{
              fontSize: "var(--sn-font-size-md, 1rem)",
              fontWeight:
                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
              color: "var(--sn-color-foreground, #0f172a)",
            }}
          >
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              data-notification-badge
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                backgroundColor: "var(--sn-color-primary, #2563eb)",
                color: "var(--sn-color-primary-foreground, #fff)",
                borderRadius: "var(--sn-radius-full, 9999px)",
                padding: "0 var(--sn-spacing-xs, 4px)",
                minWidth: "1.5em",
                textAlign: "center",
                display: "inline-block",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {showMarkAllRead && unreadCount > 0 && config.markReadAction && (
          <button
            data-notification-mark-all
            onClick={handleMarkAllRead}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-primary, #2563eb)",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Scrollable list */}
      <div
        data-notification-list
        style={{
          maxHeight: config.maxHeight ?? "auto",
          overflowY: config.maxHeight ? "auto" : undefined,
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {/* Error state */}
        {error && (
          <div
            data-notification-error
            role="alert"
            style={{
              padding: "var(--sn-spacing-md, 12px)",
              color: "var(--sn-color-destructive, #ef4444)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
            }}
          >
            Error: {error.message}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && items.length === 0 && (
          <div
            data-notification-empty
            style={{
              padding: "var(--sn-spacing-xl, 24px)",
              color: "var(--sn-color-muted-foreground, #94a3b8)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
            }}
          >
            {config.emptyMessage ?? "No notifications"}
          </div>
        )}

        {/* Notification items */}
        {!isLoading &&
          !error &&
          items.map((item, idx) => {
            const id = item["id"];
            const itemKey =
              typeof id === "string" || typeof id === "number" ? id : idx;
            const title = String(item[titleField] ?? "");
            const message = String(item[messageField] ?? "");
            const rawTimestamp = item[timestampField];
            const timestamp = rawTimestamp
              ? new Date(String(rawTimestamp))
              : null;
            const isRead = Boolean(item[readField]);
            const notifType = String(item[typeField] ?? "info");

            return (
              <div
                key={itemKey}
                data-notification-item
                data-read={isRead ? "" : undefined}
                role={
                  config.itemAction || config.markReadAction
                    ? "button"
                    : undefined
                }
                tabIndex={
                  config.itemAction || config.markReadAction ? 0 : undefined
                }
                onClick={() => handleItemClick(item)}
                onKeyDown={
                  config.itemAction || config.markReadAction
                    ? (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }
                    : undefined
                }
                style={{
                  display: "flex",
                  gap: "var(--sn-spacing-sm, 8px)",
                  padding:
                    "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
                  borderBottom: "1px solid var(--sn-color-border, #e2e8f0)",
                  borderLeft: isRead
                    ? "3px solid transparent"
                    : "3px solid var(--sn-color-primary, #2563eb)",
                  backgroundColor: isRead
                    ? undefined
                    : "var(--sn-color-accent, #f0f9ff)",
                  cursor:
                    config.itemAction || config.markReadAction
                      ? "pointer"
                      : "default",
                  transition:
                    "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                }}
              >
                {/* Type icon */}
                <div style={{ paddingTop: "2px" }}>
                  <TypeIcon type={notifType} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title */}
                  <div
                    style={{
                      fontSize: "var(--sn-font-size-sm, 0.875rem)",
                      fontWeight: isRead
                        ? "normal"
                        : ("var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"]),
                      color: "var(--sn-color-foreground, #0f172a)",
                    }}
                  >
                    {title}
                  </div>

                  {/* Message */}
                  {message && (
                    <div
                      style={{
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                        color: "var(--sn-color-muted-foreground, #64748b)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginTop: "2px",
                      }}
                    >
                      {message}
                    </div>
                  )}

                  {/* Timestamp */}
                  {timestamp && (
                    <div
                      style={{
                        fontSize: "var(--sn-font-size-xs, 0.75rem)",
                        color: "var(--sn-color-muted-foreground, #94a3b8)",
                        marginTop: "var(--sn-spacing-xs, 4px)",
                      }}
                      title={timestamp.toLocaleString()}
                    >
                      {formatRelativeTime(timestamp, { includeTime: true })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
