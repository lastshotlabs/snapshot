'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { formatRelativeTime } from "./relative-time";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FeedBaseItem {
  /** Unique key for React list rendering. */
  key: string | number;
  /** Avatar image URL. */
  avatar?: string;
  /** Item title text. */
  title: string;
  /** Item description text. */
  description?: string;
  /** ISO timestamp string for the item. */
  timestamp?: string;
  /** Badge text displayed next to the title. */
  badgeValue?: string;
  /** Color token for the badge. */
  badgeColor?: string;
  /** Raw data object passed to action callbacks. */
  raw: Record<string, unknown>;
}

export interface FeedBaseItemAction {
  /** Action button label. */
  label: string;
  /** Optional icon name. */
  icon?: string;
  /** Button variant. */
  variant?: "default" | "destructive";
  /** Callback invoked with the item's raw data. */
  onAction: (item: Record<string, unknown>) => void;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface FeedBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Feed items to display. */
  items: FeedBaseItem[];
  /** Whether to show relative timestamps. */
  relativeTime?: boolean;
  /** Grouping mode. */
  groupBy?: "day" | "week" | "month";
  /** Page size for pagination. */
  pageSize?: number;
  /** Whether to use infinite scroll. */
  infinite?: boolean;
  /** Item actions. */
  itemActions?: FeedBaseItemAction[];
  /** Whether the feed is loading. */
  isLoading?: boolean;
  /** Error message. */
  error?: string | null;
  /** Text shown when feed is empty. */
  emptyMessage?: string;
  /** Whether new data is available. */
  hasNewData?: boolean;
  /** Callback to refresh data. */
  onRefresh?: () => void;
  /** Callback when an item is selected. */
  onSelectItem?: (item: Record<string, unknown>) => void;
  /** Custom loading content. */
  loadingContent?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, item, title, description, timestamp, badge, actions). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGE_COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  primary: { bg: "var(--sn-color-primary, #111827)", fg: "var(--sn-color-primary-foreground, #ffffff)" },
  secondary: { bg: "var(--sn-color-secondary, #f3f4f6)", fg: "var(--sn-color-secondary-foreground, #111827)" },
  success: { bg: "var(--sn-color-success, #16a34a)", fg: "var(--sn-color-success-foreground, #ffffff)" },
  warning: { bg: "var(--sn-color-warning, #d97706)", fg: "var(--sn-color-warning-foreground, #ffffff)" },
  destructive: { bg: "var(--sn-color-destructive, #dc2626)", fg: "var(--sn-color-destructive-foreground, #ffffff)" },
  info: { bg: "var(--sn-color-info, #2563eb)", fg: "var(--sn-color-info-foreground, #ffffff)" },
  muted: { bg: "var(--sn-color-muted, #f3f4f6)", fg: "var(--sn-color-muted-foreground, #6b7280)" },
};

function formatTimestamp(timestamp: string): string {
  try {
    return new Intl.DateTimeFormat().format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

function getFallbackInitials(title: string): string {
  const initials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.match(/[a-zA-Z0-9]/)?.[0] ?? "")
    .join("")
    .toUpperCase();
  return initials || "?";
}

function resolveGroupLabel(
  timestamp: string,
  groupBy: "day" | "week" | "month",
): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown";
  if (groupBy === "month") {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
  }
  if (groupBy === "week") {
    const start = new Date(date);
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    return `Week of ${new Intl.DateTimeFormat().format(start)}`;
  }
  return new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function groupItems(
  items: FeedBaseItem[],
  groupBy?: "day" | "week" | "month",
): Array<{ label: string; items: FeedBaseItem[] }> {
  if (!groupBy) return [{ label: "", items }];
  const groups = new Map<string, FeedBaseItem[]>();
  for (const item of items) {
    const label = item.timestamp
      ? resolveGroupLabel(item.timestamp, groupBy)
      : "Unknown";
    const bucket = groups.get(label);
    if (bucket) bucket.push(item);
    else groups.set(label, [item]);
  }
  return Array.from(groups, ([label, groupedItems]) => ({ label, items: groupedItems }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeedBadge({
  rootId,
  itemKey,
  value,
  color,
  slots,
}: {
  rootId: string;
  itemKey: string | number;
  value: string;
  color: string;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const colors = BADGE_COLOR_MAP[color] ?? BADGE_COLOR_MAP.muted!;
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-${itemKey}-badge`,
    implementationBase: {
      display: "inline",
      paddingY: "2xs",
      paddingX: "xs",
      borderRadius: "md",
      fontSize: "xs",
      fontWeight: "medium",
      style: {
        backgroundColor: colors.bg,
        color: colors.fg,
        lineHeight: "var(--sn-leading-tight, 1.4)",
      },
    },
    componentSurface: slots?.badge,
  });

  return (
    <>
      <span
        data-feed-badge=""
        data-snapshot-id={`${rootId}-item-${itemKey}-badge`}
        className={badgeSurface.className}
        style={badgeSurface.style}
      >
        {value}
      </span>
      <SurfaceStyles css={badgeSurface.scopedCss} />
    </>
  );
}

function FeedItemRow({
  rootId,
  item,
  onClick,
  isSelected,
  itemActions,
  relativeTime,
  slots,
}: {
  rootId: string;
  item: FeedBaseItem;
  onClick: (raw: Record<string, unknown>) => void;
  isSelected: boolean;
  itemActions?: FeedBaseItemAction[];
  relativeTime: boolean;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const itemId = `${rootId}-item-${item.key}`;

  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemId,
    implementationBase: {
      display: "flex",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      cursor: "pointer",
      border: "0 solid transparent",
      hover: { bg: "var(--sn-color-accent, var(--sn-color-muted))" },
      states: { selected: { bg: "var(--sn-color-muted, #f3f4f6)" } },
      style: {
        borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        transition: "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: slots?.item,
    activeStates: isSelected ? ["selected"] : [],
  });
  const avatarImageSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatarImage`,
    implementationBase: {
      style: { width: "2rem", height: "2rem", borderRadius: "var(--sn-radius-full, 9999px)", objectFit: "cover", flexShrink: 0 },
    },
    componentSurface: slots?.avatarImage,
  });
  const avatarFallbackSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatarFallback`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "xs",
      fontWeight: "semibold",
      color: "var(--sn-color-primary, #2563eb)",
      style: {
        width: "2rem", height: "2rem", borderRadius: "var(--sn-radius-full, 9999px)", flexShrink: 0,
        backgroundColor: "color-mix(in oklch, var(--sn-color-primary, #2563eb) 14%, var(--sn-color-muted, #e5e7eb))",
        lineHeight: 1,
      },
    },
    componentSurface: slots?.avatarFallback,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-content`,
    implementationBase: { flex: "1", style: { minWidth: 0 } },
    componentSurface: slots?.content,
  });
  const headerRowSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-headerRow`,
    implementationBase: { display: "flex", alignItems: "center", gap: "sm", flexWrap: "wrap" },
    componentSurface: slots?.headerRow,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-title`,
    implementationBase: { fontSize: "sm", fontWeight: "medium", color: "var(--sn-color-card-foreground, #111827)" },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-description`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: { marginTop: "var(--sn-spacing-2xs, 2px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    componentSurface: slots?.description,
  });
  const timestampSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-timestamp`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: { flexShrink: 0, alignSelf: "flex-start", paddingTop: "var(--sn-spacing-2xs, 2px)" },
    },
    componentSurface: slots?.timestamp,
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-actions`,
    implementationBase: { display: "flex", alignItems: "center", gap: "xs", style: { flexShrink: 0 } },
    componentSurface: slots?.actions,
  });

  return (
    <>
      <div
        data-feed-item=""
        data-selected={isSelected ? "" : undefined}
        data-snapshot-id={itemId}
        onClick={() => onClick(item.raw)}
        className={itemSurface.className}
        style={itemSurface.style}
      >
        {item.avatar ? (
          <img
            src={item.avatar}
            alt=""
            aria-hidden="true"
            data-snapshot-id={`${itemId}-avatarImage`}
            className={avatarImageSurface.className}
            style={avatarImageSurface.style}
          />
        ) : (
          <div
            aria-hidden="true"
            data-feed-avatar-fallback=""
            data-snapshot-id={`${itemId}-avatarFallback`}
            className={avatarFallbackSurface.className}
            style={avatarFallbackSurface.style}
          >
            {getFallbackInitials(item.title)}
          </div>
        )}

        <div
          data-snapshot-id={`${itemId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          <div
            data-snapshot-id={`${itemId}-headerRow`}
            className={headerRowSurface.className}
            style={headerRowSurface.style}
          >
            <span
              data-feed-title=""
              data-snapshot-id={`${itemId}-title`}
              className={titleSurface.className}
              style={titleSurface.style}
            >
              {item.title}
            </span>
            {item.badgeValue && item.badgeColor ? (
              <FeedBadge
                rootId={rootId}
                itemKey={item.key}
                value={item.badgeValue}
                color={item.badgeColor}
                slots={slots}
              />
            ) : null}
          </div>

          {item.description ? (
            <div
              data-feed-description=""
              data-snapshot-id={`${itemId}-description`}
              className={descriptionSurface.className}
              style={descriptionSurface.style}
            >
              {item.description}
            </div>
          ) : null}
        </div>

        {item.timestamp ? (
          <span
            data-feed-timestamp=""
            data-snapshot-id={`${itemId}-timestamp`}
            className={timestampSurface.className}
            style={timestampSurface.style}
          >
            {relativeTime
              ? formatRelativeTime(item.timestamp)
              : formatTimestamp(item.timestamp)}
          </span>
        ) : null}

        {itemActions && itemActions.length > 0 ? (
          <div
            data-snapshot-id={`${itemId}-actions`}
            className={actionsSurface.className}
            style={actionsSurface.style}
          >
            {itemActions.map((itemAction, index) => {
              const itemActionSurface = resolveSurfacePresentation({
                surfaceId: `${itemId}-action-${index}`,
                implementationBase: {
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2xs",
                  borderRadius: "sm",
                  cursor: "pointer",
                  color:
                    itemAction.variant === "destructive"
                      ? "var(--sn-color-destructive, #dc2626)"
                      : "var(--sn-color-muted-foreground, #6b7280)",
                  hover: { bg: "var(--sn-color-accent, var(--sn-color-muted))" },
                  focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
                  style: {
                    border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
                    backgroundColor:
                      itemAction.variant === "destructive"
                        ? "color-mix(in oklch, var(--sn-color-destructive, #dc2626) 8%, transparent)"
                        : "transparent",
                    padding: "var(--sn-spacing-2xs, 2px) var(--sn-spacing-xs, 4px)",
                  },
                },
                componentSurface: slots?.itemAction,
              });

              return (
                <div key={`${itemAction.label}-${index}`}>
                  <ButtonControl
                    type="button"
                    ariaLabel={itemAction.label}
                    surfaceId={`${itemId}-action-${index}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      itemAction.onAction(item.raw);
                    }}
                    surfaceConfig={itemActionSurface.resolvedConfigForWrapper}
                    variant="ghost"
                    size="sm"
                  >
                    {itemAction.icon ? <Icon name={itemAction.icon} size={14} /> : null}
                    <span>{itemAction.label}</span>
                  </ButtonControl>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={avatarImageSurface.scopedCss} />
      <SurfaceStyles css={avatarFallbackSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={headerRowSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={timestampSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * Standalone Feed — feed/activity list with grouping, pagination, and
 * live updates. No manifest context required.
 *
 * @example
 * ```tsx
 * <FeedBase
 *   items={[
 *     { key: 1, title: "New comment", description: "Alice replied to your post", timestamp: "2026-04-23T10:00:00Z", raw: {} },
 *     { key: 2, title: "Issue closed", badgeValue: "Done", badgeColor: "success", raw: {} },
 *   ]}
 *   relativeTime
 *   groupBy="day"
 *   onSelectItem={(item) => openDetail(item)}
 * />
 * ```
 */
export function FeedBase({
  id,
  items,
  relativeTime = false,
  groupBy,
  pageSize = 20,
  infinite = false,
  itemActions,
  isLoading = false,
  error,
  emptyMessage = "No activity yet",
  hasNewData = false,
  onRefresh,
  onSelectItem,
  loadingContent,
  className,
  style,
  slots,
}: FeedBaseProps) {
  const rootId = id ?? "feed";
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [, setRelativeTick] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const visibleItems = useMemo(() => items.slice(0, page * pageSize), [page, pageSize, items]);
  const groupedItems = useMemo(() => groupItems(visibleItems, groupBy), [groupBy, visibleItems]);
  const hasMore = page * pageSize < items.length;

  const loadMore = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const selectItem = useCallback(
    (item: Record<string, unknown>) => {
      setSelectedItem(item);
      onSelectItem?.(item);
    },
    [onSelectItem],
  );

  useEffect(() => {
    if (!relativeTime) return;
    const interval = setInterval(() => setRelativeTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [relativeTime]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      overflow: "hidden",
      bg: "var(--sn-color-card, #ffffff)",
      color: "var(--sn-color-card-foreground, #111827)",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const liveBannerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveBanner`,
    implementationBase: {
      display: "flex", alignItems: "center", justifyContent: "between", gap: "sm", paddingY: "sm", paddingX: "md",
      bg: "var(--sn-color-secondary, #f3f4f6)",
      style: { borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" },
    },
    componentSurface: slots?.liveBanner,
  });
  const liveTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveText`,
    implementationBase: {},
    componentSurface: slots?.liveText,
  });
  const liveButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveButton`,
    implementationBase: {
      paddingY: "2xs", paddingX: "sm", borderRadius: "sm",
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)", cursor: "pointer",
      hover: { bg: "var(--sn-color-accent, var(--sn-color-muted))" },
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
    },
    componentSurface: slots?.liveButton,
  });
  const loadingStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingState`,
    implementationBase: { padding: "md", fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)", textAlign: "center" },
    componentSurface: slots?.loadingState,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: { padding: "md", fontSize: "sm", color: "var(--sn-color-destructive, #dc2626)", textAlign: "center" },
    componentSurface: slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: { padding: "md", fontSize: "base", color: "var(--sn-color-muted-foreground, #6b7280)", textAlign: "center" },
    componentSurface: slots?.emptyState,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {},
    componentSurface: slots?.list,
  });
  const paginationSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pagination`,
    implementationBase: {
      paddingY: "sm", paddingX: "md", textAlign: "center",
      style: { borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" },
    },
    componentSurface: slots?.pagination,
  });
  const loadMoreButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadMoreButton`,
    implementationBase: {
      paddingY: "xs", paddingX: "sm", fontSize: "sm", color: "var(--sn-color-primary, #111827)", cursor: "pointer",
      hover: { bg: "var(--sn-color-accent, var(--sn-color-muted))" },
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      style: { background: "none", border: "none" },
    },
    componentSurface: slots?.loadMoreButton,
  });

  return (
    <>
      <div
        data-snapshot-component="feed"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {hasNewData ? (
          <div
            data-snapshot-id={`${rootId}-liveBanner`}
            className={liveBannerSurface.className}
            style={liveBannerSurface.style}
          >
            <span
              data-snapshot-id={`${rootId}-liveText`}
              className={liveTextSurface.className}
              style={liveTextSurface.style}
            >
              New activity available
            </span>
            <ButtonControl
              type="button"
              onClick={onRefresh}
              surfaceId={`${rootId}-liveButton`}
              surfaceConfig={liveButtonSurface.resolvedConfigForWrapper}
              variant="outline"
              size="sm"
            >
              Refresh
            </ButtonControl>
          </div>
        ) : null}

        {isLoading ? (
          loadingContent ?? (
            <div
              data-feed-loading=""
              data-snapshot-id={`${rootId}-loadingState`}
              className={loadingStateSurface.className}
              style={loadingStateSurface.style}
            >
              Loading...
            </div>
          )
        ) : null}

        {error ? (
          <div
            data-feed-error=""
            role="alert"
            data-snapshot-id={`${rootId}-errorState`}
            className={errorStateSurface.className}
            style={errorStateSurface.style}
          >
            Error: {error}
          </div>
        ) : null}

        {!isLoading && !error && visibleItems.length === 0 ? (
          <div
            data-feed-empty=""
            data-snapshot-id={`${rootId}-emptyState`}
            className={emptyStateSurface.className}
            style={emptyStateSurface.style}
          >
            {emptyMessage}
          </div>
        ) : null}

        {!isLoading && !error && visibleItems.length > 0 ? (
          <div
            data-feed-list=""
            role="list"
            data-snapshot-id={`${rootId}-list`}
            className={listSurface.className}
            style={listSurface.style}
          >
            {groupedItems.map((group) => (
              <div key={group.label || "default"}>
                {group.label
                  ? (() => {
                      const groupLabelSurface = resolveSurfacePresentation({
                        surfaceId: `${rootId}-group-${group.label}`,
                        implementationBase: {
                          paddingY: "sm", paddingX: "md",
                          bg: "var(--sn-color-muted, #f3f4f6)",
                          color: "var(--sn-color-muted-foreground, #6b7280)",
                          fontSize: "xs", fontWeight: "semibold",
                          style: { textTransform: "uppercase", letterSpacing: "var(--sn-tracking-wide, 0.05em)" },
                        },
                        componentSurface: slots?.groupLabel,
                      });

                      return (
                        <div
                          data-snapshot-id={`${rootId}-group-${group.label}`}
                          className={groupLabelSurface.className}
                          style={groupLabelSurface.style}
                        >
                          {group.label}
                          <SurfaceStyles css={groupLabelSurface.scopedCss} />
                        </div>
                      );
                    })()
                  : null}

                {group.items.map((item) => (
                  <FeedItemRow
                    key={item.key}
                    rootId={rootId}
                    item={item}
                    onClick={selectItem}
                    isSelected={selectedItem === item.raw}
                    itemActions={itemActions}
                    relativeTime={relativeTime}
                    slots={slots}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && !error && hasMore && !infinite ? (
          <div
            data-snapshot-id={`${rootId}-pagination`}
            className={paginationSurface.className}
            style={paginationSurface.style}
          >
            <ButtonControl
              type="button"
              onClick={loadMore}
              surfaceId={`${rootId}-loadMoreButton`}
              surfaceConfig={loadMoreButtonSurface.resolvedConfigForWrapper}
              variant="ghost"
              size="sm"
            >
              Load more
            </ButtonControl>
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={liveBannerSurface.scopedCss} />
      <SurfaceStyles css={liveTextSurface.scopedCss} />
      <SurfaceStyles css={loadingStateSurface.scopedCss} />
      <SurfaceStyles css={errorStateSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={paginationSurface.scopedCss} />
    </>
  );
}
