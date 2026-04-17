"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai/react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { isFromRef } from "../../../context/utils";
import { Icon } from "../../../icons/index";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { wsManagerAtom } from "../../../../ws/atom";
import { AutoEmptyState } from "../../_base/auto-empty-state";
import type { AutoEmptyStateConfig } from "../../_base/auto-empty-state";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { useLiveData } from "../../_base/use-live-data";
import { ButtonControl } from "../../forms/button";
import { formatRelativeTime } from "./relative-time";
import type { FeedConfig, FeedItem } from "./types";

const BADGE_COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  primary: {
    bg: "var(--sn-color-primary, #111827)",
    fg: "var(--sn-color-primary-foreground, #ffffff)",
  },
  secondary: {
    bg: "var(--sn-color-secondary, #f3f4f6)",
    fg: "var(--sn-color-secondary-foreground, #111827)",
  },
  success: {
    bg: "var(--sn-color-success, #16a34a)",
    fg: "var(--sn-color-success-foreground, #ffffff)",
  },
  warning: {
    bg: "var(--sn-color-warning, #d97706)",
    fg: "var(--sn-color-warning-foreground, #ffffff)",
  },
  destructive: {
    bg: "var(--sn-color-destructive, #dc2626)",
    fg: "var(--sn-color-destructive-foreground, #ffffff)",
  },
  info: {
    bg: "var(--sn-color-info, #2563eb)",
    fg: "var(--sn-color-info-foreground, #ffffff)",
  },
  muted: {
    bg: "var(--sn-color-muted, #f3f4f6)",
    fg: "var(--sn-color-muted-foreground, #6b7280)",
  },
};

function getField(item: Record<string, unknown>, path: string): unknown {
  return item[path];
}

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

function resolveItems(rawItems: Record<string, unknown>[], config: FeedConfig): FeedItem[] {
  const itemKeyField = config.itemKey ?? "id";
  return rawItems.map((item, index) => {
    const keyValue = getField(item, itemKeyField);
    const key =
      typeof keyValue === "string" || typeof keyValue === "number"
        ? keyValue
        : index;

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
        badgeColor = config.badge.colorMap?.[badgeValue] ?? "muted";
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

function resolveGroupLabel(
  timestamp: string,
  groupBy: NonNullable<FeedConfig["groupBy"]>,
): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  if (groupBy === "month") {
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (groupBy === "week") {
    const start = new Date(date);
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    return `Week of ${new Intl.DateTimeFormat().format(start)}`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function groupItems(
  items: FeedItem[],
  groupBy: FeedConfig["groupBy"],
): Array<{ label: string; items: FeedItem[] }> {
  if (!groupBy) {
    return [{ label: "", items }];
  }

  const groups = new Map<string, FeedItem[]>();
  for (const item of items) {
    const label = item.timestamp
      ? resolveGroupLabel(item.timestamp, groupBy)
      : "Unknown";
    const bucket = groups.get(label);
    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(label, [item]);
    }
  }

  return Array.from(groups, ([label, groupedItems]) => ({
    label,
    items: groupedItems,
  }));
}

function toAutoEmptyStateConfig(
  empty: FeedConfig["empty"],
): AutoEmptyStateConfig | null {
  if (!empty) {
    return null;
  }

  return {
    id: typeof empty.id === "string" ? empty.id : undefined,
    className: typeof empty.className === "string" ? empty.className : undefined,
    style:
      empty.style && typeof empty.style === "object"
        ? (empty.style as Record<string, string | number>)
        : undefined,
    size:
      empty.size === "sm" || empty.size === "md" || empty.size === "lg"
        ? empty.size
        : undefined,
    icon: typeof empty.icon === "string" ? empty.icon : undefined,
    iconColor:
      typeof empty.iconColor === "string" ? empty.iconColor : undefined,
    title: typeof empty.title === "string" ? empty.title : "No results",
    description:
      typeof empty.description === "string" ? empty.description : undefined,
    slots:
      empty.slots && typeof empty.slots === "object"
        ? (empty.slots as AutoEmptyStateConfig["slots"])
        : undefined,
    ...(empty.action?.action
      ? {
          action: {
            label:
              typeof empty.action.label === "string"
                ? empty.action.label
                : "Action",
            action: empty.action.action,
            icon:
              typeof empty.action.icon === "string"
                ? empty.action.icon
                : undefined,
            variant:
              empty.action.variant === "default" ||
              empty.action.variant === "primary" ||
              empty.action.variant === "outline"
                ? empty.action.variant
                : undefined,
          } satisfies AutoEmptyStateConfig["action"],
        }
      : {}),
  };
}

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
  slots: FeedConfig["slots"];
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
  item: FeedItem;
  onClick: (raw: Record<string, unknown>) => void;
  isSelected: boolean;
  itemActions?: FeedConfig["itemActions"];
  relativeTime: boolean;
  slots: FeedConfig["slots"];
}) {
  const execute = useActionExecutor();
  const itemId = `${rootId}-item-${item.key}`;

  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemId,
    implementationBase: {
      display: "flex",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      cursor: "pointer",
      border:
        "0 solid transparent",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted))",
      },
      states: {
        selected: {
          bg: "var(--sn-color-muted, #f3f4f6)",
        },
      },
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: slots?.item,
    activeStates: isSelected ? ["selected"] : [],
  });
  const avatarImageSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatarImage`,
    implementationBase: {
      style: {
        width: "2rem",
        height: "2rem",
        borderRadius: "var(--sn-radius-full, 9999px)",
        objectFit: "cover",
        flexShrink: 0,
      },
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
        width: "2rem",
        height: "2rem",
        borderRadius: "var(--sn-radius-full, 9999px)",
        flexShrink: 0,
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-primary, #2563eb) 14%, var(--sn-color-muted, #e5e7eb))",
        lineHeight: 1,
      },
    },
    componentSurface: slots?.avatarFallback,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-content`,
    implementationBase: {
      flex: "1",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: slots?.content,
  });
  const headerRowSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-headerRow`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      flexWrap: "wrap",
    },
    componentSurface: slots?.headerRow,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-title`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-card-foreground, #111827)",
    },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-description`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        marginTop: "var(--sn-spacing-2xs, 2px)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.description,
  });
  const timestampSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-timestamp`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
        alignSelf: "flex-start",
        paddingTop: "var(--sn-spacing-2xs, 2px)",
      },
    },
    componentSurface: slots?.timestamp,
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-actions`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      style: {
        flexShrink: 0,
      },
    },
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
            {itemActions.map(
              (
                itemAction: (typeof itemActions)[number],
                index: number,
              ) => {
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
                  hover: {
                    bg: "var(--sn-color-accent, var(--sn-color-muted))",
                  },
                  focus: {
                    ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                  },
                  style: {
                    border:
                      "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
                    backgroundColor:
                      itemAction.variant === "destructive"
                        ? "color-mix(in oklch, var(--sn-color-destructive, #dc2626) 8%, transparent)"
                        : "transparent",
                    padding:
                      "var(--sn-spacing-2xs, 2px) var(--sn-spacing-xs, 4px)",
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
                      void execute(itemAction.action, { item: item.raw });
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
              },
            )}
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

export function Feed({ config }: { config: FeedConfig }) {
  const publish = usePublish(config.id);
  const wsManager = useAtomValue(wsManagerAtom);
  const isRef = isFromRef(config.data);
  const resolvedRef = useSubscribe(config.data);
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const resolvedStaticConfig = useResolveFrom({
    itemActions: config.itemActions,
    empty: config.empty,
  });
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
  } = useComponentData(config.data);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [, setRelativeTick] = useState(0);
  const rootId = config.id ?? "feed";

  const rawRows = useMemo<Record<string, unknown>[]>(() => {
    if (isRef) {
      return Array.isArray(resolvedRef)
        ? (resolvedRef as Record<string, unknown>[])
        : [];
    }
    if (fetchedData == null) {
      return [];
    }
    if (Array.isArray(fetchedData)) {
      return fetchedData as Record<string, unknown>[];
    }
    const asRecord = fetchedData as Record<string, unknown>;
    if (Array.isArray(asRecord.data)) {
      return asRecord.data as Record<string, unknown>[];
    }
    if (Array.isArray(asRecord.items)) {
      return asRecord.items as Record<string, unknown>[];
    }
    return [];
  }, [fetchedData, isRef, resolvedRef]);

  const resolvedItems = useMemo(() => resolveItems(rawRows, config), [config, rawRows]);
  const itemActions =
    (resolvedStaticConfig.itemActions as FeedConfig["itemActions"] | undefined) ??
    config.itemActions;
  const pageSize = config.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(resolvedItems.length / pageSize));
  const visibleItems = useMemo(
    () => resolvedItems.slice(0, page * pageSize),
    [page, pageSize, resolvedItems],
  );
  const groupedItems = useMemo(
    () => groupItems(visibleItems, config.groupBy),
    [config.groupBy, visibleItems],
  );
  const emptyStateConfig = useMemo(
    () =>
      toAutoEmptyStateConfig(
        (resolvedStaticConfig.empty ?? config.empty) as FeedConfig["empty"],
      ),
    [config.empty, resolvedStaticConfig.empty],
  );
  const hasMore = page * pageSize < resolvedItems.length;

  const loadMore = useCallback(() => {
    setPage((currentPage) => Math.min(currentPage + 1, totalPages));
  }, [totalPages]);

  const selectItem = useCallback((item: Record<string, unknown>) => {
    setSelectedItem(item);
  }, []);

  useEffect(() => {
    if (publish) {
      publish(selectedItem);
    }
  }, [publish, selectedItem]);

  useEffect(() => {
    if (!config.relativeTime) {
      return;
    }

    const interval = setInterval(() => {
      setRelativeTick((tick) => tick + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [config.relativeTime]);

  const liveConfig = useMemo(
    () =>
      config.live === true
        ? { event: "*", indicator: false, debounce: undefined }
        : config.live
          ? {
              event: config.live.event,
              indicator: config.live.indicator,
              debounce: config.live.debounce,
            }
          : null,
    [config.live],
  );
  const { hasNewData, refresh } = useLiveData({
    event: liveConfig?.event ?? "*",
    onRefresh: refetch,
    debounce: liveConfig?.debounce,
    indicator: liveConfig?.indicator,
    wsManager,
    enabled: liveConfig !== null,
  });

  const loading = !isRef && isLoading;
  const fetchError = !isRef ? error : null;
  const infiniteScrollRef = useInfiniteScroll({
    hasNextPage: config.infinite ? hasMore : false,
    isLoading: loading,
    loadNextPage: loadMore,
  });

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      overflow: "hidden",
      bg: "var(--sn-color-card, #ffffff)",
      color: "var(--sn-color-card-foreground, #111827)",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const liveBannerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveBanner`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      bg: "var(--sn-color-secondary, #f3f4f6)",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.liveBanner,
  });
  const liveTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveText`,
    implementationBase: {},
    componentSurface: config.slots?.liveText,
  });
  const liveButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveButton`,
    implementationBase: {
      paddingY: "2xs",
      paddingX: "sm",
      borderRadius: "sm",
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: config.slots?.liveButton,
  });
  const loadingStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingState`,
    implementationBase: {
      padding: "md",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      textAlign: "center",
    },
    componentSurface: config.slots?.loadingState,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: {
      padding: "md",
      fontSize: "sm",
      color: "var(--sn-color-destructive, #dc2626)",
      textAlign: "center",
    },
    componentSurface: config.slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {
      padding: "md",
      fontSize: "base",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      textAlign: "center",
    },
    componentSurface: config.slots?.emptyState,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {},
    componentSurface: config.slots?.list,
  });
  const paginationSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pagination`,
    implementationBase: {
      paddingY: "sm",
      paddingX: "md",
      textAlign: "center",
      style: {
        borderTop:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.pagination,
  });
  const loadMoreButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadMoreButton`,
    implementationBase: {
      paddingY: "xs",
      paddingX: "sm",
      fontSize: "sm",
      color: "var(--sn-color-primary, #111827)",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        background: "none",
        border: "none",
      },
    },
    componentSurface: config.slots?.loadMoreButton,
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
              onClick={refresh}
              surfaceId={`${rootId}-liveButton`}
              surfaceConfig={liveButtonSurface.resolvedConfigForWrapper}
              variant="outline"
              size="sm"
            >
              Refresh
            </ButtonControl>
          </div>
        ) : null}

        {loading ? (
          config.loading && !config.loading.disabled ? (
            <div
              data-feed-loading=""
              data-snapshot-id={`${rootId}-loadingState`}
              className={loadingStateSurface.className}
              style={loadingStateSurface.style}
            >
              <AutoSkeleton componentType="feed" config={config.loading} />
            </div>
          ) : (
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

        {fetchError ? (
          <div
            data-feed-error=""
            role="alert"
            data-snapshot-id={`${rootId}-errorState`}
            className={errorStateSurface.className}
            style={errorStateSurface.style}
          >
            Error: {fetchError.message}
          </div>
        ) : null}

        {!loading && !fetchError && visibleItems.length === 0 ? (
          emptyStateConfig ? (
            <AutoEmptyState config={emptyStateConfig} />
          ) : (
            <div
              data-feed-empty=""
              data-snapshot-id={`${rootId}-emptyState`}
              className={emptyStateSurface.className}
              style={emptyStateSurface.style}
            >
              {emptyMessage ?? "No activity yet"}
            </div>
          )
        ) : null}

        {!loading && !fetchError && visibleItems.length > 0 ? (
          <div
            data-feed-list=""
            role="list"
            data-snapshot-id={`${rootId}-list`}
            className={listSurface.className}
            style={listSurface.style}
          >
            {groupedItems.map((group) => (
              <div key={group.label || "default"}>
                {group.label ? (
                  (() => {
                    const groupLabelSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-group-${group.label}`,
                      implementationBase: {
                        paddingY: "sm",
                        paddingX: "md",
                        bg: "var(--sn-color-muted, #f3f4f6)",
                        color: "var(--sn-color-muted-foreground, #6b7280)",
                        fontSize: "xs",
                        fontWeight: "semibold",
                        style: {
                          textTransform: "uppercase",
                          letterSpacing: "var(--sn-tracking-wide, 0.05em)",
                        },
                      },
                      componentSurface: config.slots?.groupLabel,
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
                ) : null}

                {group.items.map((item) => (
                  <FeedItemRow
                    key={item.key}
                    rootId={rootId}
                    item={item}
                    onClick={selectItem}
                    isSelected={selectedItem === item.raw}
                    itemActions={itemActions}
                    relativeTime={config.relativeTime ?? false}
                    slots={config.slots}
                  />
                ))}
              </div>
            ))}

            {config.infinite && hasMore ? (
              <div ref={infiniteScrollRef} aria-hidden="true" style={{ height: "1px" }} />
            ) : null}
          </div>
        ) : null}

        {!loading && !fetchError && hasMore && !config.infinite ? (
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
