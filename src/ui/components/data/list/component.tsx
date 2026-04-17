'use client';

import React, { useEffect, useId, useMemo, useState } from "react";
import { useAtomValue } from "jotai/react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { AutoEmptyState } from "../../_base/auto-empty-state";
import type { AutoEmptyStateConfig } from "../../_base/auto-empty-state";
import { AutoErrorState } from "../../_base/auto-error-state";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { useComponentData } from "../../_base/use-component-data";
import { applyClientFilters, applyClientSort } from "../../_base/client-data-ops";
import { ContextMenuPortal } from "../../_base/context-menu-portal";
import { useSharedDragDrop } from "../../_base/drag-drop-provider";
import { useLiveData } from "../../_base/use-live-data";
import { useReorderable } from "../../_base/use-reorderable";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import {
  SortableContext,
  useDroppable,
  useSortable,
  verticalListSortingStrategy,
  getSortableStyle,
} from "../../../hooks/use-drag-drop";
import { useVirtualList } from "../../../hooks/use-virtual-list";
import type { ListConfig, ListItemConfig } from "./types";
import type { ActionConfig, ActionExecuteFn } from "../../../actions/types";
import { wsManagerAtom } from "../../../../ws/atom";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

function resolveItemSurface(
  rootId: string,
  item: ListItemConfig,
  index: number,
  slotName:
    | "item"
    | "itemBody"
    | "itemLink"
    | "itemTitle"
    | "itemDescription"
    | "itemIcon"
    | "itemBadge"
    | "divider",
  implementationBase?: Record<string, unknown>,
  fallbackSlot?: Record<string, unknown>,
) {
  return resolveSurfacePresentation({
    surfaceId: `${rootId}-${slotName}-${index}`,
    implementationBase,
    componentSurface: fallbackSlot,
    itemSurface: item.slots?.[slotName],
  });
}

/**
 * Skeleton placeholder row for loading state.
 */
function ListSkeleton({
  rootId,
  index,
  itemSurface,
  iconSurface,
  bodySurface,
  titleSurface,
  descriptionSurface,
}: {
  rootId: string;
  index: number;
  itemSurface: ReturnType<typeof resolveSurfacePresentation>;
  iconSurface: ReturnType<typeof resolveSurfacePresentation>;
  bodySurface: ReturnType<typeof resolveSurfacePresentation>;
  titleSurface: ReturnType<typeof resolveSurfacePresentation>;
  descriptionSurface: ReturnType<typeof resolveSurfacePresentation>;
}) {
  return (
    <div
      data-snapshot-id={`${rootId}-loading-item-${index}`}
      className={itemSurface.className}
      style={itemSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-loading-icon-${index}`}
        className={iconSurface.className}
        style={iconSurface.style}
      />
      <div
        data-snapshot-id={`${rootId}-loading-body-${index}`}
        className={bodySurface.className}
        style={bodySurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-loading-title-${index}`}
          className={titleSurface.className}
          style={titleSurface.style}
        />
        <div
          data-snapshot-id={`${rootId}-loading-description-${index}`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        />
      </div>
    </div>
  );
}

function toAutoEmptyStateConfig(
  empty: ListConfig["empty"],
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
    title: typeof empty.title === "string" ? empty.title : "No items",
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

/**
 * Single list item renderer.
 */
function ListItem({
  rootId,
  itemIndex,
  item,
  selectable,
  showDivider,
  isCard,
  draggable,
  execute,
  onContextMenu,
  slots,
}: {
  rootId: string;
  itemIndex: number;
  item: ListItemConfig;
  selectable: boolean;
  showDivider: boolean;
  isCard: boolean;
  draggable: boolean;
  execute: (action: ActionConfig | ActionConfig[]) => Promise<void>;
  onContextMenu?: (event: React.MouseEvent) => void;
  slots?: ListConfig["slots"];
}) {
  const title = useSubscribe(item.title) as string | undefined;
  const description = useSubscribe(item.description) as string | undefined;
  const badge = useSubscribe(item.badge) as string | undefined;
  const isClickable = selectable && (item.action != null || item.href != null);
  const itemSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "item",
    {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      transition: `background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
      ...(isClickable
        ? {
            hover: {
              bg: "var(--sn-color-accent, #f3f4f6)",
            },
            focus: {
              ring: true,
            },
          }
        : {}),
      ...(isCard
        ? {
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.5rem)",
            boxShadow: "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
            backgroundColor: "var(--sn-color-card, #ffffff)",
          }
        : {}),
      ...(isClickable ? { cursor: "pointer" } : {}),
    },
    slots?.item,
  );
  const iconSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "itemIcon",
    {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
    },
    slots?.itemIcon,
  );
  const titleSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "itemTitle",
    {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: "var(--sn-font-weight-medium, 500)" as unknown as number,
      color: "var(--sn-color-foreground, #111827)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    slots?.itemTitle,
  );
  const bodySurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "itemBody",
    {
      style: {
        flex: 1,
        minWidth: 0,
      },
    },
    slots?.itemBody,
  );
  const descriptionSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "itemDescription",
    {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    slots?.itemDescription,
  );
  const badgeSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "itemBadge",
    badge
      ? {
          display: "inline-flex",
          alignItems: "center",
          style: {
            padding: "0 var(--sn-spacing-xs, 0.25rem)",
            borderRadius: "var(--sn-radius-full, 9999px)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)",
            backgroundColor: `var(--sn-color-${item.badgeColor ?? "primary"}, #2563eb)`,
            color: `var(--sn-color-${item.badgeColor ?? "primary"}-foreground, #ffffff)`,
            lineHeight: "var(--sn-leading-normal, 1.5)",
          },
        }
      : undefined,
    slots?.itemBadge,
  );
  const linkSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "itemLink",
    {
      style: {
        textDecoration: "none",
        color: "inherit",
      },
    },
    slots?.itemLink,
  );
  const dividerSurface = resolveItemSurface(
    rootId,
    item,
    itemIndex,
    "divider",
    {
      style: {
        height: "1px",
        backgroundColor: "var(--sn-color-border, #e5e7eb)",
      },
    },
    slots?.divider,
  );

  const handleClick = () => {
    if (item.action) {
      void execute(item.action);
    }
  };

  const content = (
    <div
      data-list-item=""
      data-testid="list-item"
      onClick={isClickable ? handleClick : undefined}
      onContextMenu={onContextMenu}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      data-snapshot-id={`${rootId}-item-${itemIndex}`}
      className={itemSurface.className}
      style={itemSurface.style}
    >
      {draggable ? (
        <span
          aria-hidden="true"
          data-snapshot-id={`${rootId}-item-icon-${itemIndex}`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name="grip-vertical" size={16} />
        </span>
      ) : null}
      {/* Icon */}
      {item.icon && (
        <span
          aria-hidden="true"
          data-snapshot-id={`${rootId}-item-icon-${itemIndex}`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={item.icon} size={20} />
        </span>
      )}

      {/* Title + Description */}
      <div
        data-snapshot-id={`${rootId}-item-body-${itemIndex}`}
        className={bodySurface.className}
        style={bodySurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-item-title-${itemIndex}`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {title ?? ""}
        </div>
        {description ? (
          <div
            data-snapshot-id={`${rootId}-item-description-${itemIndex}`}
            className={descriptionSurface.className}
            style={descriptionSurface.style}
          >
            {description}
          </div>
        ) : null}
      </div>

      {/* Badge */}
      {badge ? (
        <span
          data-snapshot-id={`${rootId}-item-badge-${itemIndex}`}
          className={badgeSurface.className}
          style={badgeSurface.style}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );

  return (
    <div>
      {item.href && !item.action ? (
        <a
          href={item.href}
          data-snapshot-id={`${rootId}-item-link-${itemIndex}`}
          className={linkSurface.className}
          style={linkSurface.style}
        >
          {content}
        </a>
      ) : (
        content
      )}
      {showDivider && (
        <div
          data-snapshot-id={`${rootId}-divider-${itemIndex}`}
          className={dividerSurface.className}
          style={dividerSurface.style}
        />
      )}
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
      <SurfaceStyles css={linkSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
      <SurfaceStyles css={dividerSurface.scopedCss} />
    </div>
  );
}

/**
 * Sortable wrapper for list items when drag-and-drop is enabled.
 */
function SortableListItem({
  id,
  containerId,
  children,
}: {
  id: string;
  containerId: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      kind: "snapshot-shared-dnd-item",
      containerId,
    },
  });

  const style = getSortableStyle(transform, transition, isDragging);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function DroppableListBody({
  containerId,
  children,
}: {
  containerId: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `container:${containerId}`,
    data: {
      kind: "snapshot-shared-dnd-container",
      containerId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver
          ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 4%, transparent)"
          : undefined,
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * List component — renders a vertical list of items with optional
 * icons, descriptions, badges, and click actions.
 *
 * Supports both static items (via `items` config) and dynamic items
 * fetched from an API endpoint (via `data` config). Provides loading
 * skeletons and an empty state message.
 *
 * @param props.config - The list config from the manifest
 */
export function ListComponent({ config }: { config: ListConfig }) {
  const execute = useActionExecutor();
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const wsManager = useAtomValue(wsManagerAtom);
  const generatedId = useId();
  const variant = config.variant ?? "default";
  const showDivider = config.divider !== false && variant !== "card";
  const selectable = config.selectable ?? false;
  const sortable = config.draggable ?? config.sortable ?? false;
  const dropEnabled =
    sortable ||
    Boolean(config.dropTargets?.length) ||
    config.onDrop !== undefined;
  const containerId = useMemo(
    () => config.id ?? `list-${generatedId.replace(/[:]/g, "")}`,
    [config.id, generatedId],
  );
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    context?: Record<string, unknown>;
  } | null>(null);

  // Fetch data if endpoint is provided
  const { data, isLoading, error, refetch } = useComponentData(
    config.data ?? "",
    undefined,
    { poll: config.poll },
  );

  const resolvedStaticConfig = useResolveFrom({
    items: config.items,
    empty: config.empty,
  });

  // Resolve items: static config or mapped from data
  const hasEndpoint = config.data != null;
  let resolvedItems: ListItemConfig[] = [];
  if (!hasEndpoint && Array.isArray(resolvedStaticConfig.items)) {
    resolvedItems = (resolvedStaticConfig.items as ListItemConfig[]).map(
      (item) => ({
        ...item,
        title: typeof item.title === "string" ? item.title : "",
        description:
          typeof item.description === "string" ? item.description : undefined,
        badge: typeof item.badge === "string" ? item.badge : undefined,
      }),
    );
  } else if (hasEndpoint && data) {
    const dataArray = Array.isArray(data)
      ? data
      : ((data as Record<string, unknown>).items ??
        (data as Record<string, unknown>).data ??
        []);
    if (Array.isArray(dataArray)) {
      resolvedItems = dataArray.map(
        (row: Record<string, unknown>): ListItemConfig => ({
          id:
            typeof row.id === "string" || typeof row.id === "number"
              ? String(row.id)
              : typeof row._id === "string" || typeof row._id === "number"
                ? String(row._id)
                : undefined,
          title: String(row[config.titleField ?? "title"] ?? row.name ?? ""),
          description: config.descriptionField
            ? String(row[config.descriptionField] ?? "")
            : undefined,
          icon: config.iconField
            ? String(row[config.iconField] ?? "")
            : undefined,
        }),
      );
    }
  }

  const resolvedClientFilters = useResolveFrom(
    (config.clientFilter ?? []) as unknown as Record<string, unknown>,
  ) as unknown as Array<{
    field: string;
    operator:
      | "equals"
      | "contains"
      | "startsWith"
      | "endsWith"
      | "gt"
      | "lt"
      | "gte"
      | "lte"
      | "in"
      | "notEquals";
    value: unknown;
  }>;
  const resolvedClientSort = useResolveFrom(
    (config.clientSort ?? []) as unknown as Record<string, unknown>,
  ) as unknown as Array<{
    field: string;
    direction: "asc" | "desc";
  }>;

  const visibleItems = useMemo(() => {
    const normalizedItems = resolvedItems.map((item) => ({
      ...item,
      title: item.title,
      description: item.description,
      icon: item.icon,
      badge: item.badge,
      badgeColor: item.badgeColor,
      href: item.href,
      action: item.action,
      id: item.id,
    }));
    const filtered =
      resolvedClientFilters.length > 0
        ? applyClientFilters(normalizedItems, resolvedClientFilters)
        : normalizedItems;
    return resolvedClientSort.length > 0
      ? applyClientSort(filtered, resolvedClientSort)
      : filtered;
  }, [resolvedClientFilters, resolvedClientSort, resolvedItems]);
  const limitedItems = useMemo(
    () =>
      config.limit && config.limit > 0
        ? visibleItems.slice(0, config.limit)
        : visibleItems,
    [config.limit, visibleItems],
  );
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
  const virtualConfig = useMemo(
    () =>
      typeof config.virtualize === "object"
        ? config.virtualize
        : config.virtualize
          ? { itemHeight: 48, overscan: 5 }
          : null,
    [config.virtualize],
  );
  const virtualList = useVirtualList({
    totalCount: limitedItems.length,
    itemHeight: virtualConfig?.itemHeight ?? 48,
    overscan: virtualConfig?.overscan ?? 5,
  });
  const emptyStateConfig = useMemo(
    () => toAutoEmptyStateConfig((resolvedStaticConfig.empty ?? config.empty) as ListConfig["empty"]),
    [config.empty, resolvedStaticConfig.empty],
  );
  const containerStyle: React.CSSProperties =
    variant === "bordered"
      ? {
          border:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          overflow: "hidden",
        }
      : variant === "card"
        ? {
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          }
        : {};
  const rootId = config.id ?? containerId;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: containerStyle as Record<string, unknown>,
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    componentSurface: config.slots?.list,
  });
  const liveBannerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-live-banner`,
    implementationBase: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.75rem",
      style: {
        padding: "0.75rem 1rem",
        marginBottom: "0.75rem",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
      },
    },
    componentSurface: config.slots?.liveBanner,
  });
  const liveTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-live-text`,
    implementationBase: {},
    componentSurface: config.slots?.liveText,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    componentSurface: config.slots?.loadingState,
  });
  const loadingItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-item`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      },
    },
    componentSurface: config.slots?.loadingItem,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-icon`,
    implementationBase: {
      style: {
        width: "2rem",
        height: "2rem",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.loadingIcon,
  });
  const loadingBodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-body`,
    implementationBase: {
      style: {
        flex: 1,
      },
    },
    componentSurface: config.slots?.loadingBody,
  });
  const loadingTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-title`,
    implementationBase: {
      style: {
        height: "0.75rem",
        width: "40%",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.loadingTitle,
  });
  const loadingDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-description`,
    implementationBase: {
      style: {
        height: "0.625rem",
        width: "60%",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
      },
    },
    componentSurface: config.slots?.loadingDescription,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    componentSurface: config.slots?.errorState,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    componentSurface: config.slots?.emptyState,
  });
  const renderedItems = virtualConfig
    ? virtualList.visibleIndices.map((index) => ({
        item: limitedItems[index]!,
        index,
      }))
    : limitedItems.map((item, index) => ({ item, index }));

  return (
    <div
      data-snapshot-component="list"
      data-testid="list"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {hasNewData ? (
        <div
          data-snapshot-id={`${rootId}-live-banner`}
          className={liveBannerSurface.className}
          style={liveBannerSurface.style}
        >
          <span
            data-snapshot-id={`${rootId}-live-text`}
            className={liveTextSurface.className}
            style={liveTextSurface.style}
          >
            New items available
          </span>
          <ButtonControl type="button" onClick={refresh} variant="outline" size="sm">
            Refresh
          </ButtonControl>
        </div>
      ) : null}
      {/* Loading state */}
      {isLoading && (
        config.loading && !config.loading.disabled ? (
          <div
            data-testid="list-loading"
            data-snapshot-id={`${rootId}-loading`}
            className={loadingSurface.className}
            style={loadingSurface.style}
          >
            <AutoSkeleton componentType="list" config={config.loading} />
          </div>
        ) : (
          <div
            data-testid="list-loading"
            data-snapshot-id={`${rootId}-loading`}
            className={loadingSurface.className}
            style={loadingSurface.style}
          >
            {[0, 1, 2].map((i) => (
              <ListSkeleton
                key={i}
                rootId={rootId}
                index={i}
                itemSurface={loadingItemSurface}
                iconSurface={loadingIconSurface}
                bodySurface={loadingBodySurface}
                titleSurface={loadingTitleSurface}
                descriptionSurface={loadingDescriptionSurface}
              />
            ))}
          </div>
        )
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div
          data-testid="list-error"
          data-snapshot-id={`${rootId}-error`}
          className={errorSurface.className}
          style={errorSurface.style}
        >
          <AutoErrorState
            config={config.error ?? {}}
            onRetry={config.error?.retry !== undefined ? refetch : undefined}
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && limitedItems.length === 0 && (
        emptyStateConfig ? (
          <div
            data-snapshot-id={`${rootId}-empty`}
            className={emptySurface.className}
            style={emptySurface.style}
          >
            <AutoEmptyState config={emptyStateConfig} />
          </div>
        ) : (
          <div
            data-testid="list-empty"
            data-snapshot-id={`${rootId}-empty`}
            className={emptySurface.className}
            style={{
              padding: "var(--sn-spacing-lg, 1.5rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
              ...emptySurface.style,
            }}
          >
            {emptyMessage}
          </div>
        )
      )}

      {/* Items */}
      {!isLoading && !error && dropEnabled ? (
          <ManagedListItems
            rootId={rootId}
            containerId={containerId}
            items={renderedItems.map(({ item }) => item)}
            selectable={selectable}
          showDivider={showDivider}
          isCard={variant === "card"}
          execute={execute}
          draggable={sortable}
          dragGroup={config.dragGroup}
          dropTargets={config.dropTargets}
          contextMenu={config.contextMenu}
            onOpenContextMenu={setContextMenuState}
            onDropAction={config.onDrop}
            reorderAction={config.onReorder ?? config.reorderAction}
            slots={config.slots}
          />
        ) : (
        !isLoading &&
        !error &&
        (
          <div
            data-snapshot-id={`${rootId}-list`}
            className={listSurface.className}
            ref={virtualConfig ? virtualList.containerRef : undefined}
            style={{
              overflowY: virtualConfig ? "auto" : undefined,
              maxHeight: virtualConfig ? `${(virtualConfig.itemHeight ?? 48) * 8}px` : undefined,
              ...listSurface.style,
            }}
          >
            <div style={{ paddingTop: virtualConfig ? `${virtualList.offsetTop}px` : undefined }}>
              {renderedItems.map(({ item, index }) => (
                <ListItem
                  key={index}
                  rootId={rootId}
                  itemIndex={index}
                  item={item}
                  selectable={selectable}
                  showDivider={showDivider && index < renderedItems.length - 1}
                  isCard={variant === "card"}
                  draggable={sortable}
                  execute={execute}
                  slots={config.slots}
                  onContextMenu={
                    config.contextMenu
                      ? (event) => {
                          event.preventDefault();
                          setContextMenuState({
                            x: event.clientX,
                            y: event.clientY,
                            context: item as unknown as Record<string, unknown>,
                          });
                        }
                      : undefined
                  }
                />
              ))}
            </div>
            {virtualConfig ? (
              <div
                aria-hidden="true"
                style={{
                  height: `${Math.max(
                    0,
                    virtualList.totalHeight -
                      virtualList.offsetTop -
                      renderedItems.length * (virtualConfig.itemHeight ?? 48),
                  )}px`,
                }}
              />
            ) : null}
          </div>
        )
      )}
      {config.contextMenu ? (
        <ContextMenuPortal
          items={config.contextMenu}
          state={contextMenuState}
          onClose={() => setContextMenuState(null)}
        />
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={liveBannerSurface.scopedCss} />
      <SurfaceStyles css={liveTextSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={loadingItemSurface.scopedCss} />
      <SurfaceStyles css={loadingIconSurface.scopedCss} />
      <SurfaceStyles css={loadingBodySurface.scopedCss} />
      <SurfaceStyles css={loadingTitleSurface.scopedCss} />
      <SurfaceStyles css={loadingDescriptionSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
    </div>
  );
}

/** Managed list items wrapper with shared DnD registration. */
function ManagedListItems({
  rootId,
  containerId,
  items: initialItems,
  selectable,
  showDivider,
  isCard,
  execute,
  draggable,
  dragGroup,
  dropTargets,
  contextMenu,
  onOpenContextMenu,
  onDropAction,
  reorderAction,
  slots,
}: {
  rootId: string;
  containerId: string;
  items: ListItemConfig[];
  selectable: boolean;
  showDivider: boolean;
  isCard: boolean;
  execute: ActionExecuteFn;
  draggable: boolean;
  dragGroup?: string;
  dropTargets?: string[];
  contextMenu?: ListConfig["contextMenu"];
  onOpenContextMenu: (state: { x: number; y: number; context?: Record<string, unknown> } | null) => void;
  onDropAction?: ActionConfig;
  reorderAction?: ActionConfig;
  slots?: ListConfig["slots"];
}) {
  const sharedDragDrop = useSharedDragDrop();
  const { orderedItems, itemIds, insertItem, moveItem, removeItem } =
    useReorderable({
    items: initialItems,
    getKey: (item) =>
      item.id ??
      item.href ??
      (typeof item.title === "string" ? item.title : undefined),
    onReorder: reorderAction
      ? ({ oldIndex, newIndex, item, items }) =>
          execute(reorderAction, {
            oldIndex,
            newIndex,
            item,
            items,
          })
      : undefined,
    });

  useEffect(() => {
    if (!sharedDragDrop) {
      return;
    }

    return sharedDragDrop.registerContainer({
      id: containerId,
      dragGroup,
      dropTargets,
      moveItem,
      removeItem,
      insertItem,
      onDrop: onDropAction
        ? ({ item, source, target, index, items }) =>
            execute(onDropAction, {
              item,
              source,
              target,
              index,
              items,
            })
        : undefined,
    });
  }, [
    containerId,
    dragGroup,
    dropTargets,
    execute,
    insertItem,
    moveItem,
    onDropAction,
    removeItem,
    sharedDragDrop,
  ]);

  const renderedItems = orderedItems.map((item, index) => {
    const content = (
      <ListItem
        rootId={rootId}
        itemIndex={index}
        item={item}
        selectable={selectable}
        showDivider={showDivider && index < orderedItems.length - 1}
        isCard={isCard}
        draggable={draggable}
        execute={execute}
        slots={slots}
        onContextMenu={
          contextMenu
            ? (event) => {
                event.preventDefault();
                onOpenContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  context: item as unknown as Record<string, unknown>,
                });
              }
            : undefined
        }
      />
    );

    if (!draggable) {
      return <React.Fragment key={itemIds[index]}>{content}</React.Fragment>;
    }

    return (
      <SortableListItem
        key={itemIds[index]}
        id={itemIds[index]!}
        containerId={containerId}
      >
        {content}
      </SortableListItem>
    );
  });

  return (
    <DroppableListBody containerId={containerId}>
      {draggable ? (
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {renderedItems}
        </SortableContext>
      ) : (
        renderedItems
      )}
    </DroppableListBody>
  );
}
