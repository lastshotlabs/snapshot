'use client';

import React, { useEffect, useMemo } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useComponentData } from "../../_base/use-component-data";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { TimelineBase } from "./standalone";
import type { TimelineItemEntry } from "./standalone";
import type { TimelineConfig, TimelineItem } from "./types";

/**
 * Resolve timeline items from either static config or API data.
 */
function useTimelineItems(
  config: TimelineConfig,
  staticItems: TimelineItem[],
): {
  items: TimelineItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const hasEndpoint = config.data !== undefined;
  const { data, isLoading, error, refetch } = useComponentData(
    hasEndpoint ? config.data! : "SKIP",
  );

  const items = useMemo((): TimelineItem[] => {
    if (!hasEndpoint) {
      return staticItems;
    }
    if (!data) return [];

    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)["data"])
        ? ((data as Record<string, unknown>)["data"] as unknown[])
        : Array.isArray((data as Record<string, unknown>)["items"])
          ? ((data as Record<string, unknown>)["items"] as unknown[])
          : [];

    return rawItems.map((item: unknown) => {
      const record = item as Record<string, unknown>;
      return {
        title: String(record[config.titleField ?? "title"] ?? ""),
        description: record[config.descriptionField ?? "description"] as
          | string
          | undefined,
        date: record[config.dateField ?? "date"] as string | undefined,
      };
    });
  }, [data, hasEndpoint, config, staticItems]);

  return {
    items,
    isLoading: hasEndpoint ? isLoading : false,
    error: hasEndpoint ? error : null,
    refetch,
  };
}

/**
 * Manifest adapter — resolves config refs, wires actions/publish, and delegates to TimelineBase.
 */
export function Timeline({ config }: { config: TimelineConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ items: config.items });
  const staticItems = useMemo<TimelineItem[]>(
    () =>
      (((resolvedConfig.items as TimelineConfig["items"] | undefined) ??
        config.items ??
        []) as TimelineItem[]).map((item) => ({
        ...item,
        title: resolveOptionalPrimitiveValue(item.title, primitiveOptions) ?? "",
        description: resolveOptionalPrimitiveValue(
          item.description,
          primitiveOptions,
        ),
      })),
    [config.items, primitiveOptions, resolvedConfig.items],
  );
  const { items, isLoading, error } = useTimelineItems(config, staticItems);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);

  useEffect(() => {
    if (publish && items.length > 0) {
      publish({ items, count: items.length });
    }
  }, [publish, items]);

  if (visible === false) {
    return null;
  }

  const handleItemClick = config.action
    ? (item: TimelineItemEntry, index: number) =>
        void execute(config.action!, { ...item, index })
    : undefined;

  const surfaceConfig = extractSurfaceConfig(config);

  const baseItems: TimelineItemEntry[] = items.map((item) => ({
    title: item.title ?? "",
    description: item.description,
    date: item.date,
    icon: item.icon,
    color: item.color,
    slots: item.slots as Record<string, Record<string, unknown>> | undefined,
    children: Array.isArray(item.content) && item.content.length > 0
      ? React.createElement(
          React.Fragment,
          null,
          ...item.content.map((child: Record<string, unknown>, ci: number) =>
            React.createElement(ComponentRenderer, {
              key: (child.id as string) ?? ci,
              config: child as Parameters<typeof ComponentRenderer>[0]["config"],
            }),
          ),
        )
      : undefined,
  }));

  return (
    <TimelineBase
      id={config.id}
      items={baseItems}
      variant={config.variant}
      showConnector={config.showConnector}
      loading={isLoading}
      error={error ? <div>Error loading timeline</div> : undefined}
      onItemClick={handleItemClick}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
