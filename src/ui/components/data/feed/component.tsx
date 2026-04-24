"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai/react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { isFromRef } from "../../../context/utils";
import { wsManagerAtom } from "../../../../ws/atom";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { useLiveData } from "../../_base/use-live-data";
import type { FeedConfig } from "./types";
import { FeedBase, type FeedBaseItem, type FeedBaseItemAction } from "./standalone";

function getField(item: Record<string, unknown>, path: string): unknown {
  return item[path];
}

function resolveItems(rawItems: Record<string, unknown>[], config: FeedConfig): FeedBaseItem[] {
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
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const execute = useActionExecutor();

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

  const resolvedItemActions =
    (resolvedStaticConfig.itemActions as FeedConfig["itemActions"] | undefined) ??
    config.itemActions;

  const itemActions: FeedBaseItemAction[] | undefined = useMemo(() => {
    if (!resolvedItemActions || resolvedItemActions.length === 0) return undefined;
    return resolvedItemActions.map((action: NonNullable<FeedConfig["itemActions"]>[number]) => ({
      label: typeof action.label === "string" ? action.label : "Action",
      icon: typeof action.icon === "string" ? action.icon : undefined,
      variant: action.variant === "destructive" ? "destructive" as const : "default" as const,
      onAction: (item: Record<string, unknown>) => {
        void execute(action.action, { item });
      },
    }));
  }, [resolvedItemActions, execute]);

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

  useEffect(() => {
    if (publish) {
      publish(selectedItem);
    }
  }, [publish, selectedItem]);

  const selectItem = useCallback((item: Record<string, unknown>) => {
    setSelectedItem(item);
  }, []);

  const surface = extractSurfaceConfig(config);

  return (
    <FeedBase
      id={config.id}
      items={resolvedItems}
      relativeTime={config.relativeTime}
      groupBy={config.groupBy}
      pageSize={config.pageSize}
      infinite={config.infinite}
      itemActions={itemActions}
      isLoading={loading}
      error={fetchError ? fetchError.message : null}
      emptyMessage={emptyMessage}
      hasNewData={hasNewData}
      onRefresh={refresh}
      onSelectItem={selectItem}
      loadingContent={
        config.loading && !config.loading.disabled ? (
          <AutoSkeleton componentType="feed" config={config.loading} />
        ) : undefined
      }
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
