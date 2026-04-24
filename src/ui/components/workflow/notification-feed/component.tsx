'use client';

import { useMemo, useCallback } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { NotificationFeedBase } from "./standalone";
import type { NotificationFeedConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, fetches data, delegates to NotificationFeedBase.
 */
export function NotificationFeed({
  config,
}: {
  config: NotificationFeedConfig;
}) {
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const surfaceConfig = extractSurfaceConfig(config, { omit: ["maxHeight"] });

  const readField = config.readField ?? "read";

  const items: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "notifications"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

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

  if (visible === false) return null;

  return (
    <NotificationFeedBase
      id={config.id}
      items={items}
      loading={isLoading}
      error={error}
      titleField={config.titleField}
      messageField={config.messageField}
      timestampField={config.timestampField}
      readField={config.readField}
      typeField={config.typeField}
      showMarkAllRead={config.showMarkAllRead}
      maxHeight={config.maxHeight}
      emptyMessage={emptyMessage}
      clickable={Boolean(config.itemAction || config.markReadAction)}
      onItemClick={handleItemClick}
      onMarkAllRead={config.markReadAction ? handleMarkAllRead : undefined}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
