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
  mergeClassNames,
  mergeStyles,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ListBase, type ListBaseItem } from "./standalone";
import { AdvancedListComponent } from "./component-advanced";

function resolveListSurface(
  rootId: string,
  slots: ListConfig["slots"] | undefined,
  slotName:
    | "root"
    | "list"
    | "dropZone"
    | "sortableItem"
    | "virtualContent"
    | "virtualSpacer"
    | "liveBanner"
    | "liveText"
    | "emptyState"
    | "emptyMessage"
    | "loadingState"
    | "loadingItem"
    | "loadingIcon"
    | "loadingBody"
    | "loadingTitle"
    | "loadingDescription"
    | "errorState",
  implementationBase?: Record<string, unknown>,
  activeStates?: Array<"active">,
) {
  return resolveSurfacePresentation({
    surfaceId: `${rootId}-${slotName}`,
    implementationBase,
    componentSurface: slots?.[slotName],
    activeStates,
  });
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

export function ListComponent({ config }: { config: ListConfig }) {
  const execute = useActionExecutor();
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const wsManager = useAtomValue(wsManagerAtom);
  const generatedId = useId();
  const variant = config.variant ?? "default";
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

  // For simple lists without drag-and-drop, virtual scroll, or context menus,
  // delegate to the standalone component
  const usesDragDrop = sortable || dropEnabled;
  const usesVirtualScroll = config.virtualize != null;
  const usesContextMenu = config.contextMenu != null;
  const usesAdvancedFeatures = usesDragDrop || usesVirtualScroll || usesContextMenu;

  // Convert to standalone items
  const baseItems: ListBaseItem[] = useMemo(
    () =>
      limitedItems.map((item) => ({
        id: item.id,
        title: typeof item.title === "string" ? item.title : "",
        description: typeof item.description === "string" ? item.description : undefined,
        icon: typeof item.icon === "string" ? item.icon : undefined,
        badge: typeof item.badge === "string" ? item.badge : undefined,
        badgeColor: item.badgeColor,
        href: typeof item.href === "string" ? item.href : undefined,
        onAction: item.action
          ? () => void execute(item.action as ActionConfig)
          : undefined,
        slots: item.slots as Record<string, Record<string, unknown>> | undefined,
      })),
    [limitedItems, execute],
  );

  const loading = hasEndpoint ? isLoading : false;
  const fetchError = hasEndpoint ? error : null;
  const surface = extractSurfaceConfig(config);

  // If no advanced features, delegate fully to standalone
  if (!usesAdvancedFeatures) {
    return (
      <ListBase
        id={config.id ?? containerId}
        items={baseItems}
        variant={variant}
        selectable={selectable}
        divider={config.divider !== false && variant !== "card"}
        limit={config.limit}
        isLoading={loading}
        error={fetchError ? fetchError.message : null}
        emptyMessage={emptyMessage}
        hasNewData={hasNewData}
        onRefresh={refresh}
        loadingContent={
          config.loading && !config.loading.disabled ? (
            <AutoSkeleton componentType="list" config={config.loading} />
          ) : undefined
        }
        errorContent={
          fetchError ? (
            <AutoErrorState
              config={config.error ?? {}}
              onRetry={config.error?.retry !== undefined ? refetch : undefined}
            />
          ) : undefined
        }
        emptyContent={
          toAutoEmptyStateConfig((resolvedStaticConfig.empty ?? config.empty) as ListConfig["empty"]) ? (
            <AutoEmptyState
              config={toAutoEmptyStateConfig((resolvedStaticConfig.empty ?? config.empty) as ListConfig["empty"])!}
            />
          ) : undefined
        }
        className={surface?.className as string | undefined}
        style={surface?.style as React.CSSProperties | undefined}
        slots={config.slots}
      />
    );
  }

  // For advanced features (drag-and-drop, virtual scroll, context menus),
  // fall back to the full manifest-based rendering.
  // This is kept inline because these features require manifest-only hooks
  // (useSortable, useDroppable, useVirtualList, ContextMenuPortal, etc.)
  // that cannot be extracted into the standalone.
  return <AdvancedListComponent config={config} />;
}

