import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { useComponentData } from "../../_base/use-component-data";
import { isFromRef } from "../../../context/utils";
import type { FeedConfig, FeedItem } from "./types";

// ── Badge color map ──────────────────────────────────────────────────────────

const BADGE_COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  primary: {
    bg: "var(--sn-color-primary, oklch(0.205 0 0))",
    fg: "var(--sn-color-primary-foreground, #fff)",
  },
  secondary: {
    bg: "var(--sn-color-secondary, oklch(0.97 0 0))",
    fg: "var(--sn-color-secondary-foreground, #0f172a)",
  },
  success: {
    bg: "var(--sn-color-success, oklch(0.586 0.209 145.071))",
    fg: "var(--sn-color-success-foreground, #fff)",
  },
  warning: {
    bg: "var(--sn-color-warning, oklch(0.681 0.162 75.834))",
    fg: "var(--sn-color-warning-foreground, #fff)",
  },
  destructive: {
    bg: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
    fg: "var(--sn-color-destructive-foreground, #fff)",
  },
  info: {
    bg: "var(--sn-color-info, oklch(0.546 0.245 262.881))",
    fg: "var(--sn-color-info-foreground, #fff)",
  },
  muted: {
    bg: "var(--sn-color-muted, oklch(0.97 0 0))",
    fg: "var(--sn-color-muted-foreground, #64748b)",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getField(item: Record<string, unknown>, path: string): unknown {
  return item[path];
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Intl.DateTimeFormat().format(date);
  } catch {
    return ts;
  }
}

function resolveItems(
  rawItems: Record<string, unknown>[],
  config: FeedConfig,
): FeedItem[] {
  return rawItems.map((item, i) => {
    const keyVal = getField(item, config.itemKey);
    const key =
      typeof keyVal === "string" || typeof keyVal === "number" ? keyVal : i;

    const avatar = config.avatar
      ? String(getField(item, config.avatar) ?? "")
      : undefined;
    const title = String(getField(item, config.title) ?? "");
    const description = config.description
      ? String(getField(item, config.description) ?? "")
      : undefined;
    const timestamp = config.timestamp
      ? String(getField(item, config.timestamp) ?? "")
      : undefined;

    let badgeValue: string | undefined;
    let badgeColor: string | undefined;
    if (config.badge) {
      const rawBadge = getField(item, config.badge.field);
      if (rawBadge != null) {
        badgeValue = String(rawBadge);
        const mapped = config.badge.colorMap?.[badgeValue];
        badgeColor = mapped ?? "muted";
      }
    }

    return {
      key,
      avatar,
      title,
      description,
      timestamp,
      badgeValue,
      badgeColor,
      raw: item,
    };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeedBadge({ value, color }: { value: string; color: string }) {
  const colors = BADGE_COLOR_MAP[color] ?? BADGE_COLOR_MAP.muted!;
  return (
    <span
      data-feed-badge
      style={{
        display: "inline-block",
        padding: "var(--sn-spacing-2xs, 2px) var(--sn-spacing-xs, 4px)",
        borderRadius: "var(--sn-radius-md, 6px)",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        backgroundColor: colors.bg,
        color: colors.fg,
        lineHeight: 1.4,
        fontWeight: "var(--sn-font-weight-medium, 500)",
      }}
    >
      {value}
    </span>
  );
}

function FeedItemRow({
  item,
  onClick,
  isSelected,
}: {
  item: FeedItem;
  onClick: (raw: Record<string, unknown>) => void;
  isSelected: boolean;
}) {
  return (
    <div
      data-feed-item
      data-selected={isSelected ? "" : undefined}
      onClick={() => onClick(item.raw)}
      style={{
        display: "flex",
        gap: "var(--sn-spacing-sm, 8px)",
        padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
        borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
        cursor: "pointer",
        backgroundColor: isSelected
          ? "var(--sn-color-muted, #f3f4f6)"
          : undefined,
        transition: "background-color 0.15s ease",
      }}
    >
      {/* Avatar */}
      {item.avatar ? (
        <img
          src={item.avatar}
          alt=""
          aria-hidden="true"
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "var(--sn-radius-full, 9999px)",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "var(--sn-radius-full, 9999px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            flexShrink: 0,
          }}
        />
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 8px)",
            flexWrap: "wrap",
          }}
        >
          <span
            data-feed-title
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: "var(--sn-font-weight-medium, 500)",
              color: "var(--sn-color-card-foreground, #111827)",
            }}
          >
            {item.title}
          </span>
          {item.badgeValue && item.badgeColor && (
            <FeedBadge value={item.badgeValue} color={item.badgeColor} />
          )}
        </div>
        {item.description && (
          <div
            data-feed-description
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              marginTop: "var(--sn-spacing-2xs, 2px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.description}
          </div>
        )}
      </div>

      {/* Timestamp */}
      {item.timestamp && (
        <span
          data-feed-timestamp
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            flexShrink: 0,
            alignSelf: "flex-start",
            paddingTop: "var(--sn-spacing-2xs, 2px)",
          }}
        >
          {formatTimestamp(item.timestamp)}
        </span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Config-driven Feed component.
 *
 * Renders a scrollable activity/event stream from an endpoint or from-ref.
 * Supports avatar, title, description, timestamp, badge rendering, pagination,
 * and empty state. Publishes selected item to page context when `id` is set.
 *
 * @param props.config - Feed configuration from the Zod schema
 *
 * @example
 * ```tsx
 * <Feed config={{
 *   data: 'GET /api/activity',
 *   title: 'message',
 *   description: 'detail',
 *   timestamp: 'createdAt',
 * }} />
 * ```
 */
export function Feed({ config }: { config: FeedConfig }) {
  const publish = usePublish(config.id);

  // Resolve data — either from-ref or endpoint fetch
  const isRef = isFromRef(config.data);
  const resolvedRef = useSubscribe(config.data);
  const { data: fetchedData, isLoading, error } = useComponentData(config.data);

  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Collect raw rows from whichever source is active
  const rawRows = useMemo<Record<string, unknown>[]>(() => {
    if (isRef) {
      if (Array.isArray(resolvedRef)) {
        return resolvedRef as Record<string, unknown>[];
      }
      return [];
    }
    if (fetchedData == null) return [];
    if (Array.isArray(fetchedData))
      return fetchedData as Record<string, unknown>[];
    // Support { data: [...] } or { items: [...] } shapes
    const asRecord = fetchedData as Record<string, unknown>;
    if (Array.isArray(asRecord["data"]))
      return asRecord["data"] as Record<string, unknown>[];
    if (Array.isArray(asRecord["items"]))
      return asRecord["items"] as Record<string, unknown>[];
    return [];
  }, [isRef, resolvedRef, fetchedData]);

  const resolvedItems = useMemo(
    () => resolveItems(rawRows, config),
    [rawRows, config],
  );

  // Pagination
  const pageSize = config.pageSize;
  const totalPages = Math.max(1, Math.ceil(resolvedItems.length / pageSize));
  const visibleItems = useMemo(() => {
    return resolvedItems.slice(0, page * pageSize);
  }, [resolvedItems, page, pageSize]);

  const hasMore = page * pageSize < resolvedItems.length;

  const loadMore = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const selectItem = useCallback((item: Record<string, unknown>) => {
    setSelectedItem(item);
  }, []);

  // Publish selected item when changed
  useEffect(() => {
    if (publish) {
      publish(selectedItem);
    }
  }, [publish, selectedItem]);

  const loading = !isRef && isLoading;
  const fetchError = !isRef ? error : null;

  return (
    <div
      data-snapshot-component="feed"
      style={{
        backgroundColor: "var(--sn-color-card, #fff)",
        color: "var(--sn-color-card-foreground, #111827)",
        borderRadius: "var(--sn-radius-md, 6px)",
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        overflow: "hidden",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Loading state */}
      {loading && (
        <div
          data-feed-loading
          style={{
            padding: "var(--sn-spacing-md, 12px)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            textAlign: "center",
          }}
        >
          Loading…
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div
          data-feed-error
          role="alert"
          style={{
            padding: "var(--sn-spacing-md, 12px)",
            color: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            textAlign: "center",
          }}
        >
          Error: {fetchError.message}
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && visibleItems.length === 0 && (
        <div
          data-feed-empty
          style={{
            padding: "var(--sn-spacing-md, 12px)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-md, 1rem)",
            textAlign: "center",
          }}
        >
          {config.emptyMessage}
        </div>
      )}

      {/* Items */}
      {!loading && !fetchError && visibleItems.length > 0 && (
        <div data-feed-list role="list">
          {visibleItems.map((item) => (
            <FeedItemRow
              key={item.key}
              item={item}
              onClick={selectItem}
              isSelected={selectedItem === item.raw}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && !fetchError && hasMore && (
        <div
          style={{
            padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
            borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
            textAlign: "center",
          }}
        >
          <button
            data-feed-load-more
            onClick={loadMore}
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-primary, oklch(0.205 0 0))",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)",
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
