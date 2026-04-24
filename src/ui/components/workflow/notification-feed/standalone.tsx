'use client';

import React, { useMemo, useCallback, type CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { formatRelativeTime } from "../../_base/utils";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NotificationFeedBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Notification items. */
  items: Record<string, unknown>[];
  /** Whether data is loading. */
  loading?: boolean;
  /** Error object, if any. */
  error?: { message: string } | null;
  /** Field name that holds the notification title. Default: "title". */
  titleField?: string;
  /** Field name that holds the notification body text. Default: "message". */
  messageField?: string;
  /** Field name that holds the timestamp value. Default: "timestamp". */
  timestampField?: string;
  /** Field name that holds the read/unread boolean. Default: "read". */
  readField?: string;
  /** Field name that holds the notification type (info, success, warning, error). Default: "type". */
  typeField?: string;
  /** Show "Mark all read" button. Default: true. */
  showMarkAllRead?: boolean;
  /** Max height for scrollable list. */
  maxHeight?: string;
  /** Empty state message. */
  emptyMessage?: string;
  /** Whether item click is enabled. */
  clickable?: boolean;
  /** Called when an item is clicked. */
  onItemClick?: (item: Record<string, unknown>) => void;
  /** Called to mark all as read. */
  onMarkAllRead?: () => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const typeColorMap: Record<string, string> = {
  info: "var(--sn-color-info, #3b82f6)",
  success: "var(--sn-color-success, #22c55e)",
  warning: "var(--sn-color-warning, #f59e0b)",
  error: "var(--sn-color-destructive, #ef4444)",
};

function asSurfaceConfig(
  value: unknown,
): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

// ── TypeIcon ──────────────────────────────────────────────────────────────

function TypeIcon({
  type,
  surfaceId,
  className,
  style,
}: {
  type: string;
  surfaceId: string;
  className?: string;
  style?: CSSProperties;
}) {
  const size = 20;
  const iconStyle: CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    ...style,
  };

  switch (type) {
    case "success":
      return (
        <svg
          data-snapshot-id={surfaceId}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
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
          data-snapshot-id={surfaceId}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
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
          data-snapshot-id={surfaceId}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={iconStyle}
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      );
    default:
      return (
        <svg
          data-snapshot-id={surfaceId}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
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

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Standalone NotificationFeedBase — renders a scrollable notification list with type icons,
 * unread indicators, relative timestamps, and a mark-all-read action. No manifest context required.
 *
 * @example
 * ```tsx
 * <NotificationFeedBase
 *   items={[
 *     { id: 1, title: "Deploy succeeded", message: "v2.4.0 is live", type: "success", read: false, timestamp: "2026-04-23T10:00:00Z" },
 *   ]}
 *   clickable
 *   maxHeight="400px"
 *   onItemClick={(item) => console.log(item)}
 *   onMarkAllRead={() => markAllRead()}
 * />
 * ```
 */
export function NotificationFeedBase({
  id,
  items,
  loading = false,
  error,
  titleField = "title",
  messageField = "message",
  timestampField = "timestamp",
  readField = "read",
  typeField = "type",
  showMarkAllRead = true,
  maxHeight,
  emptyMessage,
  clickable = false,
  onItemClick,
  onMarkAllRead,
  className,
  style,
  slots,
}: NotificationFeedBaseProps) {
  const rootId = id ?? "notification-feed";

  const unreadCount = useMemo(
    () => items.filter((item) => !item[readField]).length,
    [items, readField],
  );

  const handleItemClick = useCallback(
    (item: Record<string, unknown>) => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)",
      },
    },
    componentSurface: slots?.header,
  });
  const headerContentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header-content`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 8px)",
    },
    componentSurface: slots?.headerContent,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "md",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #0f172a)",
    },
    componentSurface: slots?.title,
  });
  const unreadBadgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-unread-badge`,
    implementationBase: {
      fontSize: "xs",
      bg: "var(--sn-color-primary, #2563eb)",
      color: "var(--sn-color-primary-foreground, #fff)",
      borderRadius: "full",
      textAlign: "center",
      display: "inline-block",
      style: {
        padding: "0 var(--sn-spacing-xs, 4px)",
        minWidth: "1.5em",
      },
    },
    componentSurface: slots?.unreadBadge,
  });
  const markAllButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-mark-all`,
    implementationBase: {
      color: "var(--sn-color-primary, #2563eb)",
      cursor: "pointer",
      fontSize: "xs",
      bg: "transparent",
      border: "none",
      padding: 0,
      hover: {
        opacity: 0.85,
      },
      focus: {
        ring: true,
      },
    },
    componentSurface: slots?.markAllButton,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      maxHeight: maxHeight ?? "auto",
      overflow: maxHeight ? "auto" : undefined,
    },
    componentSurface: slots?.list,
  });
  const loadingStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-state`,
    implementationBase: {},
    componentSurface: slots?.loadingState,
  });
  const loadingItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-item`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-sm, 8px)",
      padding: "var(--sn-spacing-md, 12px)",
    },
    componentSurface: slots?.loadingItem,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-icon`,
    implementationBase: {
      width: "20px",
      height: "20px",
      borderRadius: "var(--sn-radius-full, 9999px)",
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: slots?.loadingIcon,
  });
  const loadingBodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-body`,
    implementationBase: {
      flex: "1",
      minWidth: 0,
    },
    componentSurface: slots?.loadingBody,
  });
  const loadingTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-title`,
    implementationBase: {
      height: "1em",
      width: "50%",
      borderRadius: "var(--sn-radius-xs, 2px)",
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      style: {
        marginBottom: "var(--sn-spacing-xs, 4px)",
      },
    },
    componentSurface: slots?.loadingTitle,
  });
  const loadingMessageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-message`,
    implementationBase: {
      height: "0.75em",
      width: "80%",
      borderRadius: "var(--sn-radius-xs, 2px)",
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.3,
    },
    componentSurface: slots?.loadingMessage,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error-state`,
    implementationBase: {
      padding: "var(--sn-spacing-md, 12px)",
      color: "var(--sn-color-destructive, #ef4444)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      textAlign: "center",
    },
    componentSurface: slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      padding: "xl",
      color: "var(--sn-color-muted-foreground, #94a3b8)",
      fontSize: "sm",
      textAlign: "center",
    },
    componentSurface: slots?.emptyState,
  });

  return (
    <div
      data-snapshot-component="notification-feed"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-notification-header
        data-snapshot-id={`${rootId}-header`}
        className={headerSurface.className}
        style={headerSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-header-content`}
          className={headerContentSurface.className}
          style={headerContentSurface.style}
        >
          <span
            data-snapshot-id={`${rootId}-title`}
            className={titleSurface.className}
            style={titleSurface.style}
          >
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              data-notification-badge
              data-snapshot-id={`${rootId}-unread-badge`}
              className={unreadBadgeSurface.className}
              style={unreadBadgeSurface.style}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {showMarkAllRead && unreadCount > 0 && onMarkAllRead && (
          <ButtonControl
            type="button"
            surfaceId={`${rootId}-mark-all`}
            surfaceConfig={markAllButtonSurface.resolvedConfigForWrapper}
            onClick={onMarkAllRead}
            variant="ghost"
            size="sm"
          >
            Mark all read
          </ButtonControl>
        )}
      </div>

      <div
        data-notification-list
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
      >
        {loading && (
          <div
            data-snapshot-id={`${rootId}-loading-state`}
            className={loadingStateSurface.className}
            style={loadingStateSurface.style}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                data-snapshot-id={`${rootId}-loading-item-${index}`}
                className={loadingItemSurface.className}
                style={loadingItemSurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-loading-icon-${index}`}
                  className={loadingIconSurface.className}
                  style={loadingIconSurface.style}
                />
                <div
                  data-snapshot-id={`${rootId}-loading-body-${index}`}
                  className={loadingBodySurface.className}
                  style={loadingBodySurface.style}
                >
                  <div
                    data-snapshot-id={`${rootId}-loading-title-${index}`}
                    className={loadingTitleSurface.className}
                    style={loadingTitleSurface.style}
                  />
                  <div
                    data-snapshot-id={`${rootId}-loading-message-${index}`}
                    className={loadingMessageSurface.className}
                    style={loadingMessageSurface.style}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div
            data-notification-error
            role="alert"
            data-snapshot-id={`${rootId}-error-state`}
            className={errorStateSurface.className}
            style={errorStateSurface.style}
          >
            Error: {error.message}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div
            data-notification-empty
            data-snapshot-id={`${rootId}-empty`}
            className={emptyStateSurface.className}
            style={emptyStateSurface.style}
          >
            {emptyMessage ?? "No notifications"}
          </div>
        )}

        {!loading &&
          !error &&
          items.map((item, idx) => {
            const itemId = item.id;
            const itemKey =
              typeof itemId === "string" || typeof itemId === "number" ? itemId : idx;
            const title = String(item[titleField] ?? "");
            const message = String(item[messageField] ?? "");
            const rawTimestamp = item[timestampField];
            const timestamp = rawTimestamp
              ? new Date(String(rawTimestamp))
              : null;
            const isRead = Boolean(item[readField]);
            const notifType = String(item[typeField] ?? "info");
            const itemSlots = asSurfaceConfig(item.slots);

            const itemSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}`,
              implementationBase: {
                cursor: clickable ? "pointer" : "default",
                hover: clickable
                  ? {
                      bg: "var(--sn-color-accent, #f0f9ff)",
                    }
                  : undefined,
                focus: clickable
                  ? {
                      ring: true,
                    }
                  : undefined,
                style: {
                  display: "flex",
                  gap: "var(--sn-spacing-sm, 8px)",
                  padding:
                    "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
                  borderBottom:
                    "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)",
                  borderLeft: isRead
                    ? "var(--sn-border-thick, 3px) solid transparent"
                    : "var(--sn-border-thick, 3px) solid var(--sn-color-primary, #2563eb)",
                  backgroundColor: isRead
                    ? undefined
                    : "var(--sn-color-accent, #f0f9ff)",
                } as CSSProperties,
              },
              componentSurface: slots?.item,
              itemSurface: asSurfaceConfig(itemSlots?.item),
              activeStates: isRead ? [] : ["current"],
            });
            const itemIconSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-icon`,
              implementationBase: {
                color: typeColorMap[notifType] ?? typeColorMap.info!,
                style: {
                  paddingTop: "var(--sn-spacing-2xs, 2px)",
                } as CSSProperties,
              },
              componentSurface: slots?.itemIcon,
              itemSurface: asSurfaceConfig(itemSlots?.itemIcon),
            });
            const itemIconGlyphSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-icon-glyph`,
              implementationBase: {},
              componentSurface: slots?.itemIconGlyph,
              itemSurface: asSurfaceConfig(itemSlots?.itemIconGlyph),
            });
            const itemTitleSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-title`,
              implementationBase: {
                fontSize: "sm",
                fontWeight: isRead ? "normal" : "semibold",
                color: "var(--sn-color-foreground, #0f172a)",
              },
              componentSurface: slots?.itemTitle,
              itemSurface: asSurfaceConfig(itemSlots?.itemTitle),
            });
            const itemBodySurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-body`,
              implementationBase: {
                style: {
                  flex: 1,
                  minWidth: 0,
                },
              },
              componentSurface: slots?.itemBody,
              itemSurface: asSurfaceConfig(itemSlots?.itemBody),
            });
            const itemMessageSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-message`,
              implementationBase: {
                fontSize: "sm",
                color: "var(--sn-color-muted-foreground, #64748b)",
                style: {
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginTop: "var(--sn-spacing-2xs, 2px)",
                } as CSSProperties,
              },
              componentSurface: slots?.itemMessage,
              itemSurface: asSurfaceConfig(itemSlots?.itemMessage),
            });
            const itemTimestampSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-timestamp`,
              implementationBase: {
                fontSize: "xs",
                color: "var(--sn-color-muted-foreground, #94a3b8)",
                style: {
                  marginTop: "var(--sn-spacing-xs, 4px)",
                } as CSSProperties,
              },
              componentSurface: slots?.itemTimestamp,
              itemSurface: asSurfaceConfig(itemSlots?.itemTimestamp),
            });

            return (
              <div
                key={itemKey}
                data-notification-item
                data-unread={!isRead ? "" : undefined}
                data-snapshot-id={`${rootId}-item-${itemKey}`}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                className={itemSurface.className}
                onClick={() => handleItemClick(item)}
                onKeyDown={
                  clickable
                    ? (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }
                    : undefined
                }
                style={itemSurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-item-${itemKey}-icon`}
                  className={itemIconSurface.className}
                  style={itemIconSurface.style}
                >
                  <TypeIcon
                    type={notifType}
                    surfaceId={`${rootId}-item-${itemKey}-icon-glyph`}
                    className={itemIconGlyphSurface.className}
                    style={itemIconGlyphSurface.style}
                  />
                </div>

                <div
                  data-snapshot-id={`${rootId}-item-${itemKey}-body`}
                  className={itemBodySurface.className}
                  style={itemBodySurface.style}
                >
                  <div
                    data-snapshot-id={`${rootId}-item-${itemKey}-title`}
                    className={itemTitleSurface.className}
                    style={itemTitleSurface.style}
                  >
                    {title}
                  </div>

                  {message && (
                    <div
                      data-snapshot-id={`${rootId}-item-${itemKey}-message`}
                      className={itemMessageSurface.className}
                      style={itemMessageSurface.style}
                    >
                      {message}
                    </div>
                  )}

                  {timestamp && (
                    <div
                      data-snapshot-id={`${rootId}-item-${itemKey}-timestamp`}
                      className={itemTimestampSurface.className}
                      style={itemTimestampSurface.style}
                      title={timestamp.toLocaleString()}
                    >
                      {formatRelativeTime(timestamp, { includeTime: true })}
                    </div>
                  )}
                </div>

                <SurfaceStyles css={itemSurface.scopedCss} />
                <SurfaceStyles css={itemBodySurface.scopedCss} />
                <SurfaceStyles css={itemIconSurface.scopedCss} />
                <SurfaceStyles css={itemIconGlyphSurface.scopedCss} />
                <SurfaceStyles css={itemTitleSurface.scopedCss} />
                <SurfaceStyles css={itemMessageSurface.scopedCss} />
                <SurfaceStyles css={itemTimestampSurface.scopedCss} />
              </div>
            );
          })}
      </div>

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={headerContentSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={unreadBadgeSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={loadingStateSurface.scopedCss} />
      <SurfaceStyles css={loadingItemSurface.scopedCss} />
      <SurfaceStyles css={loadingIconSurface.scopedCss} />
      <SurfaceStyles css={loadingBodySurface.scopedCss} />
      <SurfaceStyles css={loadingTitleSurface.scopedCss} />
      <SurfaceStyles css={loadingMessageSurface.scopedCss} />
      <SurfaceStyles css={errorStateSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
    </div>
  );
}
