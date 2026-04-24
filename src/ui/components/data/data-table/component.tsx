'use client';

import React, { useMemo, useState, useCallback, useEffect, useId } from "react";
import { useAtomValue } from "jotai/react";
import { useDataTable } from "./hook";
import { useActionExecutor } from "../../../actions/executor";
import { AutoEmptyState } from "../../_base/auto-empty-state";
import type { AutoEmptyStateConfig } from "../../_base/auto-empty-state";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { ContextMenuPortal } from "../../_base/context-menu-portal";
import { useSharedDragDrop } from "../../_base/drag-drop-provider";
import { useLiveData } from "../../_base/use-live-data";
import { useReorderable } from "../../_base/use-reorderable";
import { ComponentRenderer } from "../../../manifest/renderer";
import {
  SortableContext,
  useDroppable,
  useSortable,
  verticalListSortingStrategy,
  getSortableStyle,
} from "../../../hooks/use-drag-drop";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { useVirtualList } from "../../../hooks/use-virtual-list";
import type { ComponentConfig } from "../../../manifest/types";
import type { DataTableConfig, ResolvedColumn } from "./types";
import { wsManagerAtom } from "../../../../ws/atom";
import { Icon } from "../../../icons/icon";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import {
  getFieldValue,
  resolveLookupValue,
  useLookupMaps,
} from "../_shared/lookups";
import {
  DataTableBase,
  type DataTableBaseColumn,
  type DataTableBaseRowAction,
  type DataTableBaseBulkAction,
} from "./standalone";

// ── Helpers used only by the advanced path ─────────────────────────────────

function toAutoEmptyStateConfig(
  empty: DataTableConfig["empty"],
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
    title: typeof empty.title === "string" ? empty.title : "No data",
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
 * Inline toolbar button that resolves ref-backed labels.
 */
function AdapterToolbarButton({
  item,
  execute,
}: {
  item: NonNullable<DataTableConfig["toolbar"]>[number];
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const label = useSubscribe(item.label) as string;
  const disabled = useSubscribe(item.disabled ?? false) as boolean;
  const variant = item.variant ?? "outline";
  return (
    <ButtonControl
      variant={variant}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          void execute(item.action as Parameters<typeof execute>[0]);
        }
      }}
    >
      {item.icon ? <Icon name={item.icon} size={14} /> : null}
      <span>{label}</span>
    </ButtonControl>
  );
}

/**
 * Config-driven DataTable component.
 *
 * For simple tables (no drag-and-drop, virtual scroll, context menus,
 * or expandable rows), delegates to the standalone DataTableBase.
 * For advanced features, falls back to the full manifest-based rendering.
 */
export function DataTable({ config }: { config: DataTableConfig }) {
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const resolvedManifestConfig = useResolveFrom({
    columns: Array.isArray(config.columns) ? config.columns : undefined,
    actions: config.actions,
    bulkActions: config.bulkActions,
    toolbar: config.toolbar,
    searchable:
      typeof config.searchable === "object" ? config.searchable : undefined,
    empty: config.empty,
  });
  const runtimeConfig = useMemo<DataTableConfig>(
    () => ({
      ...config,
      columns: Array.isArray(config.columns)
        ? (((resolvedManifestConfig.columns as DataTableConfig["columns"] | undefined) ??
            config.columns) as DataTableConfig["columns"])
        : config.columns,
      actions:
        (resolvedManifestConfig.actions as DataTableConfig["actions"] | undefined) ??
        config.actions,
      bulkActions:
        (resolvedManifestConfig.bulkActions as DataTableConfig["bulkActions"] | undefined) ??
        config.bulkActions,
      toolbar:
        (resolvedManifestConfig.toolbar as DataTableConfig["toolbar"] | undefined) ??
        config.toolbar,
      searchable:
        typeof config.searchable === "object"
          ? (((resolvedManifestConfig.searchable as DataTableConfig["searchable"] | undefined) ??
              config.searchable) as DataTableConfig["searchable"])
          : config.searchable,
      empty:
        (resolvedManifestConfig.empty as DataTableConfig["empty"] | undefined) ??
        config.empty,
    }),
    [config, resolvedManifestConfig],
  );
  const table = useDataTable(runtimeConfig);
  const execute = useActionExecutor();
  const wsManager = useAtomValue(wsManagerAtom);

  // Detect advanced features that require the full manifest rendering path
  const draggable = config.draggable ?? false;
  const dropEnabled =
    draggable ||
    Boolean(config.dropTargets?.length) ||
    config.onDrop !== undefined;
  const usesVirtualScroll = config.virtualize != null;
  const usesContextMenu = config.contextMenu != null;
  const usesExpandable = config.expandable ?? false;
  const usesAdvancedFeatures =
    dropEnabled || usesVirtualScroll || usesContextMenu || usesExpandable;

  const lookupMaps = useLookupMaps(
    table.columns
      .filter((column) => column.lookup)
      .map((column) => ({
        key: column.field,
        lookup: column.lookup!,
      })),
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
    onRefresh: table.refetch,
    debounce: liveConfig?.debounce,
    indicator: liveConfig?.indicator,
    wsManager,
    enabled: liveConfig !== null,
  });

  // Convert resolved columns to standalone column format
  const baseColumns: DataTableBaseColumn[] = useMemo(
    () =>
      table.columns.map((col) => ({
        field: col.field,
        label: col.label,
        sortable: col.sortable,
        format: col.format,
        badgeColors: col.badgeColors,
        avatarField: col.avatarField,
        linkTextField: col.linkTextField,
        divisor: col.divisor,
        prefix: col.prefix,
        suffix: col.suffix,
        width: col.width,
        align: col.align,
      })),
    [table.columns],
  );

  // Resolve row data with lookups applied
  const resolvedRows = useMemo(
    () =>
      table.rows.map((row) => {
        const resolved: Record<string, unknown> = { ...row };
        for (const col of table.columns) {
          if (col.lookup) {
            resolved[col.field] = resolveLookupValue(
              getFieldValue(row, col.field),
              col.lookup,
              lookupMaps,
            );
          }
        }
        return resolved;
      }),
    [table.rows, table.columns, lookupMaps],
  );

  // Convert row actions
  const rowActions: DataTableBaseRowAction[] | undefined = useMemo(() => {
    if (!runtimeConfig.actions || runtimeConfig.actions.length === 0) return undefined;
    return runtimeConfig.actions
      .filter((action: NonNullable<DataTableConfig["actions"]>[number]) => action.visible !== false)
      .map((action: NonNullable<DataTableConfig["actions"]>[number]) => ({
        label: typeof action.label === "string" ? action.label : "",
        icon: typeof action.icon === "string" ? action.icon : undefined,
        variant: action.variant,
        onAction: (row: Record<string, unknown>) => {
          void execute(action.action, { row, ...row });
        },
      }));
  }, [runtimeConfig.actions, execute]);

  // Convert bulk actions
  const bulkActions: DataTableBaseBulkAction[] | undefined = useMemo(() => {
    if (!runtimeConfig.bulkActions || runtimeConfig.bulkActions.length === 0)
      return undefined;
    return runtimeConfig.bulkActions.map((bulkAction: NonNullable<DataTableConfig["bulkActions"]>[number]) => ({
      label: typeof bulkAction.label === "string" ? bulkAction.label : "",
      icon: typeof bulkAction.icon === "string" ? bulkAction.icon : undefined,
      onAction: (rows: Record<string, unknown>[]) => {
        void execute(bulkAction.action, {
          selectedRows: rows,
          selectedIds: table.selectedIds,
          count: rows.length,
        });
      },
    }));
  }, [runtimeConfig.bulkActions, execute, table.selectedIds]);

  const surface = extractSurfaceConfig(config);
  const density = runtimeConfig.density ?? "default";

  const emptyStateConfig = useMemo(
    () => toAutoEmptyStateConfig(runtimeConfig.empty),
    [runtimeConfig.empty],
  );

  // Resolve search placeholder from config
  const searchPlaceholder = useMemo(() => {
    if (typeof runtimeConfig.searchable === "object" && runtimeConfig.searchable.placeholder) {
      return typeof runtimeConfig.searchable.placeholder === "string"
        ? runtimeConfig.searchable.placeholder
        : "Search...";
    }
    return "Search...";
  }, [runtimeConfig.searchable]);

  // Build toolbar content for the standalone path
  const hasToolbar = (runtimeConfig.toolbar?.length ?? 0) > 0;
  const toolbarContent = hasToolbar ? (
    <div style={{ display: "flex", gap: "var(--sn-spacing-xs, 0.25rem)", padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)" }}>
      {runtimeConfig.toolbar!.map((item: NonNullable<DataTableConfig["toolbar"]>[number], i: number) => (
        <AdapterToolbarButton key={i} item={item} execute={execute} />
      ))}
    </div>
  ) : undefined;

  // For simple tables, delegate to the standalone
  if (!usesAdvancedFeatures) {
    return (
      <DataTableBase
        id={config.id}
        columns={baseColumns}
        rows={resolvedRows}
        sort={table.sort}
        onSortChange={table.setSortColumn}
        pagination={table.pagination}
        onPageChange={table.goToPage}
        selectable={runtimeConfig.selectable ?? false}
        selection={table.selection}
        onToggleRow={table.toggleRow}
        onToggleAll={table.toggleAll}
        searchable={!!runtimeConfig.searchable}
        searchPlaceholder={searchPlaceholder}
        search={table.search}
        onSearchChange={table.setSearch}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedRows={table.selectedRows}
        isLoading={table.isLoading}
        error={table.error ? table.error.message : null}
        emptyMessage={emptyMessage}
        hasNewData={hasNewData}
        onRefresh={refresh}
        onRowClick={
          runtimeConfig.rowClickAction
            ? (row) => void execute(runtimeConfig.rowClickAction!, { row, ...row })
            : undefined
        }
        compact={density === "compact"}
        loadingContent={
          config.loading && !config.loading.disabled ? (
            <AutoSkeleton componentType="data-table" config={config.loading} />
          ) : undefined
        }
        emptyContent={
          emptyStateConfig ? (
            <AutoEmptyState config={emptyStateConfig} />
          ) : undefined
        }
        toolbarContent={toolbarContent}
        className={surface?.className as string | undefined}
        style={surface?.style as React.CSSProperties | undefined}
        slots={config.slots}
      />
    );
  }

  // For advanced features (drag-and-drop, virtual scroll, context menus,
  // expandable rows), fall back to the full manifest-based rendering.
  return <AdvancedDataTable config={config} />;
}

// Lazy-load the advanced data table to avoid pulling in the full manifest rendering
// when the standalone path is sufficient.
const AdvancedDataTable = React.lazy(() =>
  import("./component-advanced").then((m) => ({ default: m.AdvancedDataTable })),
);
