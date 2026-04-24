'use client';

import React, { useMemo, useCallback } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { KanbanBase } from "./standalone";
import type { KanbanColumnEntry } from "./standalone";
import type { KanbanColumnConfig, KanbanConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, fetches data, delegates to KanbanBase.
 */
export function Kanban({ config }: { config: KanbanConfig }) {
  const { data, isLoading, error } = useComponentData(
    config.data ?? "",
    undefined,
  );
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const resolvedConfig = useResolveFrom({ columns: config.columns });
  const surfaceConfig = extractSurfaceConfig(config);

  const columns = useMemo<KanbanColumnEntry[]>(() => {
    const rawColumns =
      ((resolvedConfig.columns as KanbanConfig["columns"] | undefined) ??
        config.columns) as KanbanConfig["columns"];
    return rawColumns.map((col: KanbanColumnConfig) => ({
      key: col.key,
      title: col.title,
      color: col.color,
      limit: col.limit,
      slots: col.slots as Record<string, Record<string, unknown>> | undefined,
    }));
  }, [config.columns, resolvedConfig.columns]);

  // Extract items from response
  const items: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  const handleCardClick = useCallback(
    (item: Record<string, unknown>) => {
      if (config.cardAction) void execute(config.cardAction, { ...item });
    },
    [config.cardAction, execute],
  );

  const handleReorder = useCallback(
    (payload: { id: string | number; columnKey: string; position: number; item: Record<string, unknown> }) => {
      if (config.reorderAction) {
        void execute(config.reorderAction, {
          id: payload.id,
          columnKey: payload.columnKey,
          position: payload.position,
          item: payload.item,
        });
      }
    },
    [config.reorderAction, execute],
  );

  const handleDndChange = useCallback(
    (payload: { movedItem: Record<string, unknown>; targetColumn: string; position: number }) => {
      if (publish) {
        publish({
          movedItem: payload.movedItem,
          targetColumn: payload.targetColumn,
          position: payload.position,
        });
      }
    },
    [publish],
  );

  if (visible === false) return null;

  return (
    <KanbanBase
      id={config.id}
      columns={columns}
      items={items}
      loading={isLoading}
      error={error}
      columnField={config.columnField}
      titleField={config.titleField}
      descriptionField={config.descriptionField}
      assigneeField={config.assigneeField}
      priorityField={config.priorityField}
      sortable={config.sortable}
      emptyMessage={emptyMessage}
      onCardClick={config.cardAction ? handleCardClick : undefined}
      onReorder={config.reorderAction ? handleReorder : undefined}
      onDndChange={config.id ? handleDndChange : undefined}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
