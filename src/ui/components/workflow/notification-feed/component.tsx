'use client';

import React, { useMemo, useCallback, type CSSProperties } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { formatRelativeTime } from "../../_base/utils";
import type { NotificationFeedConfig } from "./types";

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
  const color = typeColorMap[type] ?? typeColorMap.info!;
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
          stroke={color}
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
          stroke={color}
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
          stroke={color}
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
          stroke={color}
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
  const rootId = config.id ?? "notification-feed";

  const items: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "notifications"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item[readField]).length,
    [items, readField],
  );

  const handleItemClick = useCallback(
    (item: Record<string, unknown>) => {
      if (config.markReadAction && !item[readField]) {
        void execute(config.markReadAction, { ...item });
      }
      if (config.itemAction) {
        void execute(config.itemAction, { ...item });
      }
    },
    [config.markReadAction, config.itemAction, readField, execute],
  );

  const handleMarkAllRead = useCallback(() => {
    if (!config.markReadAction) return;
    for (const item of items) {
      if (!item[readField]) {
        void execute(config.markReadAction, { ...item });
      }
    }
  }, [config.markReadAction, items, readField, execute]);

  if (visible === false) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      style: {
        padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)",
      },
    },
    componentSurface: config.slots?.header,
  });
  const headerContentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header-content`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 8px)",
    },
    componentSurface: config.slots?.headerContent,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "md",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #0f172a)",
    },
    componentSurface: config.slots?.title,
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
    componentSurface: config.slots?.unreadBadge,
  });
  const markAllButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-mark-all`,
    implementationBase: {
      color: "var(--sn-color-primary, #2563eb)",
      cursor: "pointer",
      fontSize: "xs",
      hover: {
        opacity: 0.85,
      },
      focus: {
        ring: true,
      },
      style: {
        background: "none",
        border: "none",
        padding: 0,
      },
    },
    componentSurface: config.slots?.markAllButton,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      style: {
        maxHeight: config.maxHeight ?? "auto",
        overflowY: config.maxHeight ? "auto" : undefined,
      },
    },
    componentSurface: config.slots?.list,
  });
  const loadingStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-state`,
    implementationBase: {},
    componentSurface: config.slots?.loadingState,
  });
  const loadingItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-item`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-sm, 8px)",
      style: {
        padding: "var(--sn-spacing-md, 12px)",
      },
    },
    componentSurface: config.slots?.loadingItem,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-icon`,
    implementationBase: {
      style: {
        width: "20px",
        height: "20px",
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        opacity: "var(--sn-opacity-muted, 0.5)",
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.loadingIcon,
  });
  const loadingTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-title`,
    implementationBase: {
      style: {
        height: "1em",
        width: "50%",
        borderRadius: "var(--sn-radius-xs, 2px)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        opacity: "var(--sn-opacity-muted, 0.5)",
        marginBottom: "var(--sn-spacing-xs, 4px)",
      },
    },
    componentSurface: config.slots?.loadingTitle,
  });
  const loadingMessageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-message`,
    implementationBase: {
      style: {
        height: "0.75em",
        width: "80%",
        borderRadius: "var(--sn-radius-xs, 2px)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        opacity: "var(--sn-opacity-disabled, 0.3)",
      },
    },
    componentSurface: config.slots?.loadingMessage,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error-state`,
    implementationBase: {
      style: {
        padding: "var(--sn-spacing-md, 12px)",
        color: "var(--sn-color-destructive, #ef4444)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        textAlign: "center",
      },
    },
    componentSurface: config.slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      padding: "xl",
      color: "var(--sn-color-muted-foreground, #94a3b8)",
      fontSize: "sm",
      textAlign: "center",
    },
    componentSurface: config.slots?.emptyState,
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

        {showMarkAllRead && unreadCount > 0 && config.markReadAction && (
          <ButtonControl
            type="button"
            surfaceId={`${rootId}-mark-all`}
            surfaceConfig={markAllButtonSurface.resolvedConfigForWrapper}
            onClick={handleMarkAllRead}
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
        {isLoading && (
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
                <div style={{ flex: 1 }}>
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

        {!isLoading && !error && items.length === 0 && (
          <div
            data-notification-empty
            data-snapshot-id={`${rootId}-empty`}
            className={emptyStateSurface.className}
            style={emptyStateSurface.style}
          >
            {config.emptyMessage ?? "No notifications"}
          </div>
        )}

        {!isLoading &&
          !error &&
          items.map((item, idx) => {
            const id = item.id;
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
            const itemSlots = asSurfaceConfig(item.slots);

            const itemSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}`,
              implementationBase: {
                cursor:
                  config.itemAction || config.markReadAction
                    ? "pointer"
                    : "default",
                hover:
                  config.itemAction || config.markReadAction
                    ? {
                        bg: "var(--sn-color-accent, #f0f9ff)",
                      }
                    : undefined,
                focus:
                  config.itemAction || config.markReadAction
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
              componentSurface: config.slots?.item,
              itemSurface: asSurfaceConfig(itemSlots?.item),
              activeStates: isRead ? [] : ["current"],
            });
            const itemIconSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-icon`,
              implementationBase: {
                style: {
                  paddingTop: "var(--sn-spacing-2xs, 2px)",
                } as CSSProperties,
              },
              componentSurface: config.slots?.itemIcon,
              itemSurface: asSurfaceConfig(itemSlots?.itemIcon),
            });
            const itemTitleSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${itemKey}-title`,
              implementationBase: {
                fontSize: "sm",
                fontWeight: isRead ? "normal" : "semibold",
                color: "var(--sn-color-foreground, #0f172a)",
              },
              componentSurface: config.slots?.itemTitle,
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
              componentSurface: config.slots?.itemBody,
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
              componentSurface: config.slots?.itemMessage,
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
              componentSurface: config.slots?.itemTimestamp,
              itemSurface: asSurfaceConfig(itemSlots?.itemTimestamp),
            });

            return (
              <div
                key={itemKey}
                data-notification-item
                data-unread={!isRead ? "" : undefined}
                data-snapshot-id={`${rootId}-item-${itemKey}`}
                role={
                  config.itemAction || config.markReadAction
                    ? "button"
                    : undefined
                }
                tabIndex={
                  config.itemAction || config.markReadAction ? 0 : undefined
                }
                className={itemSurface.className}
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
                style={itemSurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-item-${itemKey}-icon`}
                  className={itemIconSurface.className}
                  style={itemIconSurface.style}
                >
                  <TypeIcon
                    type={notifType}
                    surfaceId={`${rootId}-item-${itemKey}-icon-svg`}
                    className={undefined}
                    style={undefined}
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
      <SurfaceStyles css={loadingTitleSurface.scopedCss} />
      <SurfaceStyles css={loadingMessageSurface.scopedCss} />
      <SurfaceStyles css={errorStateSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
    </div>
  );
}
