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
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Formatting helpers ──────────────────────────────────────────────────────

function formatCellValue(
  value: unknown,
  column: ResolvedColumn,
  row?: Record<string, unknown>,
): React.ReactNode {
  if (value == null) return "\u2014";

  switch (column.format) {
    case "date": {
      try {
        return new Intl.DateTimeFormat().format(new Date(String(value)));
      } catch {
        return String(value);
      }
    }
    case "number": {
      if (typeof value === "number") {
        return new Intl.NumberFormat().format(value);
      }
      return String(value);
    }
    case "currency": {
      if (typeof value === "number") {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "USD",
        }).format(value);
      }
      return String(value);
    }
    case "badge": {
      const colorName = column.badgeColors?.[String(value)] ?? "muted";
      const badgeColorMap: Record<string, { bg: string; fg: string }> = {
        blue: {
          bg: "var(--sn-color-info, oklch(0.546 0.245 262.881))",
          fg: "var(--sn-color-info-foreground, #fff)",
        },
        green: {
          bg: "var(--sn-color-success, oklch(0.586 0.209 145.071))",
          fg: "var(--sn-color-success-foreground, #fff)",
        },
        red: {
          bg: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
          fg: "var(--sn-color-destructive-foreground, #fff)",
        },
        gray: {
          bg: "var(--sn-color-muted, oklch(0.97 0 0))",
          fg: "var(--sn-color-muted-foreground, #64748b)",
        },
        yellow: {
          bg: "var(--sn-color-warning, oklch(0.681 0.162 75.834))",
          fg: "var(--sn-color-warning-foreground, #fff)",
        },
        success: {
          bg: "var(--sn-color-success, oklch(0.586 0.209 145.071))",
          fg: "var(--sn-color-success-foreground, #fff)",
        },
        warning: {
          bg: "var(--sn-color-warning, oklch(0.681 0.162 75.834))",
          fg: "var(--sn-color-warning-foreground, #fff)",
        },
        info: {
          bg: "var(--sn-color-info, oklch(0.546 0.245 262.881))",
          fg: "var(--sn-color-info-foreground, #fff)",
        },
        destructive: {
          bg: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
          fg: "var(--sn-color-destructive-foreground, #fff)",
        },
        muted: {
          bg: "var(--sn-color-muted, oklch(0.97 0 0))",
          fg: "var(--sn-color-muted-foreground, #64748b)",
        },
        primary: {
          bg: "var(--sn-color-primary, oklch(0.205 0 0))",
          fg: "var(--sn-color-primary-foreground, #fff)",
        },
        secondary: {
          bg: "var(--sn-color-secondary, oklch(0.97 0 0))",
          fg: "var(--sn-color-secondary-foreground, #0f172a)",
        },
        accent: {
          bg: "var(--sn-color-accent, oklch(0.97 0 0))",
          fg: "var(--sn-color-accent-foreground, #0f172a)",
        },
      };
      const colors = badgeColorMap[colorName] ?? badgeColorMap.muted!;
      return (
        <span
          data-badge
          data-color={colorName}
          style={{
            display: "inline-block",
            padding: "var(--sn-spacing-xs, 2px) var(--sn-spacing-sm, 8px)",
            borderRadius: "var(--sn-radius-full, 9999px)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            backgroundColor: colors.bg,
            color: colors.fg,
          }}
        >
          {String(value)}
        </span>
      );
    }
    case "boolean": {
      return value ? "\u2713" : "\u2717";
    }
    case "avatar": {
      const src = column.avatarField
        ? String(row?.[column.avatarField] ?? "")
        : "";
      const name = String(value);
      const initials = name
        .split(/\s+/)
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {src ? (
            <img
              src={src}
              alt={name}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "var(--sn-radius-full, 9999px)",
                objectFit: "cover",
              }}
            />
          ) : (
            <span
              style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "var(--sn-radius-full, 9999px)",
                backgroundColor: "var(--sn-color-primary, #2563eb)",
                color: "var(--sn-color-primary-foreground, #fff)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--sn-font-size-xs, 0.625rem)",
                fontWeight:
                  "var(--sn-font-weight-semibold, 600)" as unknown as number,
              }}
            >
              {initials || "?"}
            </span>
          )}
          <span>{name}</span>
        </span>
      );
    }
    case "progress": {
      const pct = typeof value === "number" ? value : Number(value) || 0;
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "var(--sn-spacing-2xs, 6px)",
              backgroundColor: "var(--sn-color-muted, #e5e7eb)",
              borderRadius: "var(--sn-radius-full, 9999px)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, pct))}%`,
                height: "100%",
                backgroundColor:
                  pct >= 100
                    ? "var(--sn-color-success, #22c55e)"
                    : "var(--sn-color-primary, #2563eb)",
                borderRadius: "var(--sn-radius-full, 9999px)",
                transition:
                  "width var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              minWidth: "2.5em",
              textAlign: "right",
            }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      );
    }
    case "link": {
      const url = String(value);
      const text = column.linkTextField
        ? String(row?.[column.linkTextField] ?? url)
        : url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--sn-color-info, #3b82f6)",
            textDecoration: "underline",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </a>
      );
    }
    case "code": {
      return (
        <code
          style={{
            fontFamily: "var(--sn-font-mono, monospace)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
            padding: "var(--sn-spacing-2xs, 1px) var(--sn-spacing-xs, 0.25rem)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
          }}
        >
          {String(value)}
        </code>
      );
    }
    default: {
      const s = String(value);
      if (column.prefix || column.suffix) {
        return `${column.prefix ?? ""}${s}${column.suffix ?? ""}`;
      }
      return s;
    }
  }
}

// ── Sort indicator ──────────────────────────────────────────────────────────

function SortIndicator({
  column,
  sort,
}: {
  column: string;
  sort: { column: string; direction: "asc" | "desc" } | null;
}) {
  if (!sort || sort.column !== column) return <span aria-hidden> </span>;
  return (
    <span
      aria-label={
        sort.direction === "asc" ? "sorted ascending" : "sorted descending"
      }
    >
      {sort.direction === "asc" ? " \u25B2" : " \u25BC"}
    </span>
  );
}

// ── Density styles ──────────────────────────────────────────────────────────

function getDensityPadding(
  density: "compact" | "default" | "comfortable",
): string {
  switch (density) {
    case "compact":
      return "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)";
    case "comfortable":
      return "var(--sn-spacing-md, 12px) var(--sn-spacing-lg, 16px)";
    default:
      return "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)";
  }
}

function toAutoEmptyStateConfig(
  empty: DataTableConfig["empty"],
): AutoEmptyStateConfig | null {
  if (!empty) {
    return null;
  }

  return {
    icon: empty.icon,
    title: empty.title,
    description: empty.description,
    ...(empty.action?.action
      ? {
          action: {
            label: empty.action.label,
            action: empty.action.action,
            icon: empty.action.icon,
            variant: empty.action.variant,
          },
        }
      : {}),
  };
}

// ── Toolbar button ──────────────────────────────────────────────────────────

function ToolbarButton({
  rootId,
  index,
  item,
  execute,
}: {
  rootId: string;
  index: number;
  item: NonNullable<DataTableConfig["toolbar"]>[number];
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const disabled = useSubscribe(item.disabled ?? false) as boolean;
  const variant = item.variant ?? "outline";
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar-label-${index}`,
    componentSurface: item.slots?.itemLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar-icon-${index}`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: item.slots?.itemIcon,
  });
  return (
    <>
      <ButtonControl
      variant={variant}
      disabled={disabled}
      surfaceId={`${rootId}-toolbar-item-${index}`}
      surfaceConfig={item.slots?.item}
      activeStates={disabled ? ["disabled"] : []}
      onClick={() => {
        if (disabled) return;
        void execute(item.action as Parameters<typeof execute>[0]);
      }}
    >
      {item.icon ? (
        <span
          data-snapshot-id={`${rootId}-toolbar-icon-${index}`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={item.icon} size={14} />
        </span>
      ) : null}
      <span
        data-snapshot-id={`${rootId}-toolbar-label-${index}`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {item.label}
      </span>
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
    </>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function SkeletonRows({
  columnCount,
  rowCount,
}: {
  columnCount: number;
  rowCount: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, i) => (
        <tr key={i} data-skeleton>
          {Array.from({ length: columnCount }, (_, j) => (
            <td key={j} style={{ padding: "var(--sn-spacing-sm, 8px)" }}>
              <div
                style={{
                  height: "1em",
                  borderRadius: "var(--sn-radius-sm, 4px)",
                  backgroundColor: "var(--sn-color-muted, #e5e7eb)",
                  opacity: "var(--sn-opacity-muted, 0.5)" as unknown as number,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Infinite scroll sentinel ─────────────────────────────────────────────────

/**
 * Invisible sentinel element that triggers loading the next page when it
 * enters the viewport via IntersectionObserver.
 */
function SortableTableRow({
  id,
  containerId,
  children,
  className,
  style,
  dataSnapshotId,
  dataSelected,
  onClick,
  onContextMenu,
}: {
  id: string;
  containerId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  dataSnapshotId?: string;
  dataSelected?: string;
  onClick?: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
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

  return (
    <tr
      ref={setNodeRef}
      data-snapshot-id={dataSnapshotId}
      data-selected={dataSelected}
      className={className}
      style={{
        ...style,
        ...getSortableStyle(transform, transition, isDragging),
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      {children}
    </tr>
  );
}

function DroppableTableBody({
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
    <tbody
      ref={setNodeRef}
      style={{
        backgroundColor: isOver
          ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 3%, transparent)"
          : undefined,
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      }}
    >
      {children}
    </tbody>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

/**
 * Config-driven DataTable component.
 *
 * Renders an HTML table with sorting, pagination, filtering, selection,
 * search, row actions, and bulk actions. All behavior is driven by
 * the `DataTableConfig` schema.
 *
 * Publishes state via `usePublish` when `id` is set:
 * `{ selected, selectedRows, selectedIds, filters, sort, page, search, data }`
 *
 * @param props - Component props containing the DataTable configuration
 *
 * @example
 * ```tsx
 * <DataTable config={{
 *   type: 'data-table',
 *   data: { from: 'my-data-source' },
 *   columns: 'auto',
 *   selectable: true,
 *   searchable: true,
 * }} />
 * ```
 */
export function DataTable({ config }: { config: DataTableConfig }) {
  const table = useDataTable(config);
  const execute = useActionExecutor();
  const wsManager = useAtomValue(wsManagerAtom);
  const sharedDragDrop = useSharedDragDrop();
  const generatedId = useId();
  const density = config.density ?? "default";
  const cellPadding = getDensityPadding(density);
  const draggable = config.draggable ?? false;
  const dropEnabled =
    draggable ||
    Boolean(config.dropTargets?.length) ||
    config.onDrop !== undefined;
  const reorderAction = config.onReorder ?? config.reorderAction;
  const containerId = useMemo(
    () => config.id ?? `data-table-${generatedId.replace(/[:]/g, "")}`,
    [config.id, generatedId],
  );
  const rootId = config.id ?? containerId;
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    context?: Record<string, unknown>;
  } | null>(null);
  const {
    orderedItems: orderedRows,
    itemIds: rowIds,
    moveItem,
    removeItem,
    insertItem,
  } = useReorderable({
      items: table.rows,
      getKey: (row) => {
        const record = row as Record<string, unknown>;
        const id = record["id"] ?? record["_id"];
        return typeof id === "string" || typeof id === "number" ? id : undefined;
      },
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
  const renderedRows = dropEnabled ? orderedRows : table.rows;
  const infiniteScrollRef = useInfiniteScroll({
    hasNextPage: table.hasMore,
    isLoading: table.isLoading,
    loadNextPage: table.nextPage,
    threshold:
      typeof config.pagination === "object"
        ? config.pagination.infiniteThreshold
        : undefined,
  });
  // Determine if we need an actions column
  const hasActions = (config.actions?.length ?? 0) > 0;
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
    totalCount: renderedRows.length,
    itemHeight: virtualConfig?.itemHeight ?? 48,
    overscan: virtualConfig?.overscan ?? 5,
  });
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

  // Expandable row state
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set(),
  );
  const toggleExpandRow = useCallback((id: string | number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Column count for skeleton and colSpan
  const totalColumns =
    table.columns.length +
    (draggable ? 1 : 0) +
    (config.selectable ? 1 : 0) +
    (hasActions ? 1 : 0) +
    (config.expandable ? 1 : 0);

  // Search fields placeholder
  const searchPlaceholder = useMemo(() => {
    if (
      typeof config.searchable === "object" &&
      config.searchable.placeholder
    ) {
      return config.searchable.placeholder;
    }
    return "Search...";
  }, [config.searchable]);
  const emptyStateConfig = useMemo(
    () => toAutoEmptyStateConfig(config.empty),
    [config.empty],
  );
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const toolbarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar`,
    componentSurface: config.slots?.toolbar,
  });
  const bulkActionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-bulk-actions`,
    componentSurface: config.slots?.bulkActions,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    componentSurface: config.slots?.loadingState,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    componentSurface: config.slots?.errorState,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    componentSurface: config.slots?.emptyState,
  });
  const paginationSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pagination`,
    componentSurface: config.slots?.pagination,
  });
  const headerRowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header-row`,
    componentSurface: config.slots?.headerRow,
  });
  const headerCellBaseSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header-cell`,
    componentSurface: config.slots?.headerCell,
  });

  // Bulk actions toolbar
  const showBulkActions =
    config.bulkActions &&
    config.bulkActions.length > 0 &&
    table.selectedIds.length > 0;

  useEffect(() => {
    if (!sharedDragDrop || !dropEnabled) {
      return;
    }

    return sharedDragDrop.registerContainer({
      id: containerId,
      dragGroup: config.dragGroup,
      dropTargets: config.dropTargets,
      moveItem,
      removeItem,
      insertItem,
      onDrop: config.onDrop
        ? ({ item, source, target, index, items }) =>
            execute(config.onDrop!, {
              item,
              source,
              target,
              index,
              items,
            })
        : undefined,
    });
  }, [
    config.dragGroup,
    config.dropTargets,
    config.onDrop,
    containerId,
    dropEnabled,
    execute,
    insertItem,
    moveItem,
    removeItem,
    sharedDragDrop,
  ]);

  const renderRow = (
    row: Record<string, unknown>,
    rowIndex: number,
    sortable: boolean,
    sortableId?: string,
  ): React.ReactNode => {
    const id = row["id"];
    const rowId =
      typeof id === "string" || typeof id === "number" ? id : rowIndex;
    const isExpanded = expandedRows.has(rowId);

    const rowStyle = {
      bg: table.selection.has(rowId)
        ? "var(--sn-color-accent, #dbeafe)"
        : undefined,
      cursor:
        config.expandable || config.rowClickAction || draggable
          ? "pointer"
          : undefined,
      hover:
        config.expandable || config.rowClickAction || draggable
          ? {
              bg: table.selection.has(rowId)
                ? "var(--sn-color-accent, #dbeafe)"
                : "var(--sn-color-secondary, #f3f4f6)",
            }
          : undefined,
    };
    const rowSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-row-${rowIndex}`,
      implementationBase: rowStyle,
      componentSurface: config.slots?.row,
      activeStates: table.selection.has(rowId) ? ["selected"] : [],
    });
    const cellSurfaces = table.columns.map((col) =>
      resolveSurfacePresentation({
        surfaceId: `${rootId}-cell-${rowIndex}-${col.field}`,
        implementationBase: {
          padding: cellPadding,
          textAlign: col.align ?? "left",
        },
        componentSurface: config.slots?.cell,
        activeStates: table.selection.has(rowId) ? ["selected"] : [],
      }),
    );
    const actionsCellSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-actions-cell-${rowIndex}`,
      implementationBase: {
        padding: cellPadding,
        textAlign: "right",
      },
      componentSurface: config.slots?.actionsCell,
      activeStates: table.selection.has(rowId) ? ["selected"] : [],
    });

    const rowChildren = (
      <>
        {config.expandable && (
          <td style={{ padding: cellPadding, width: "32px" }}>
            <span
              style={{
                display: "inline-flex",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition:
                  "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              &#x25B6;
            </span>
          </td>
        )}
        {draggable && (
          <td style={{ padding: cellPadding, width: "32px" }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              &#x22EE;
            </span>
          </td>
        )}
        {config.selectable && (
          <td style={{ padding: cellPadding, width: "40px" }}>
            <InputControl
              type="checkbox"
              checked={table.selection.has(rowId)}
              onChangeChecked={() => table.toggleRow(rowId)}
              ariaLabel={`Select row ${rowId}`}
              surfaceId={`${rootId}-row-select-${rowIndex}`}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "var(--sn-color-primary, #2563eb)",
              }}
            />
          </td>
        )}
        {table.columns.map((col) => (
          <td
            key={col.field}
            className={cellSurfaces[table.columns.indexOf(col)]?.className}
            style={cellSurfaces[table.columns.indexOf(col)]?.style}
          >
            {formatCellValue(row[col.field], col, row)}
          </td>
        ))}
        {hasActions && (
          <td
            data-snapshot-id={`${rootId}-actions-cell-${rowIndex}`}
            className={actionsCellSurface.className}
            style={actionsCellSurface.style}
          >
            <div
              style={{
                display: "flex",
                gap: "var(--sn-spacing-xs, 4px)",
                justifyContent: "flex-end",
              }}
            >
              {config.actions!.map((action: NonNullable<DataTableConfig["actions"]>[number], actionIndex: number) => {
                if (
                  action.visible === false ||
                  (typeof action.visible === "boolean" && !action.visible)
                ) {
                  return null;
                }

                return (
                  <ButtonControl
                    key={actionIndex}
                    variant="ghost"
                    surfaceId={`${rootId}-row-action-${rowIndex}-${actionIndex}`}
                    surfaceConfig={action.slots?.item}
                    onClick={() =>
                      void execute(action.action, {
                        row,
                        ...row,
                      })
                    }
                  >
                    {action.icon ? <Icon name={action.icon} size={14} /> : null}
                    {action.label}
                  </ButtonControl>
                );
              })}
            </div>
          </td>
        )}
      </>
    );

    const onRowClick = config.expandable
      ? () => toggleExpandRow(rowId)
      : config.rowClickAction
        ? () =>
            void execute(config.rowClickAction!, {
              row,
              ...row,
            })
        : undefined;

    const onRowContextMenu = config.contextMenu
      ? (event: React.MouseEvent) => {
          event.preventDefault();
          setContextMenuState({
            x: event.clientX,
            y: event.clientY,
            context: { row, ...row },
          });
        }
      : undefined;

    return (
      <React.Fragment key={rowId}>
        {sortable ? (
          <SortableTableRow
            id={sortableId ?? String(rowId)}
            containerId={containerId}
            dataSnapshotId={`${rootId}-row-${rowIndex}`}
            dataSelected={table.selection.has(rowId) ? "" : undefined}
            className={rowSurface.className}
            style={rowSurface.style}
            onClick={onRowClick}
            onContextMenu={onRowContextMenu}
          >
            {rowChildren}
          </SortableTableRow>
        ) : (
          <tr
            data-snapshot-id={`${rootId}-row-${rowIndex}`}
            data-selected={table.selection.has(rowId) ? "" : undefined}
            className={rowSurface.className}
            onClick={onRowClick}
            onContextMenu={onRowContextMenu}
            style={rowSurface.style}
          >
            {rowChildren}
          </tr>
        )}
        {config.expandable && isExpanded && config.expandedContent && (
          <tr data-expanded-row>
            <td
              colSpan={totalColumns}
              style={{
                padding: cellPadding,
                backgroundColor: "var(--sn-color-secondary, #f8fafc)",
                borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
              }}
            >
              {config.expandedContent.map((child, ci) => (
                <ComponentRenderer
                  key={ci}
                  config={child as ComponentConfig}
                />
              ))}
            </td>
          </tr>
        )}
        <SurfaceStyles css={rowSurface.scopedCss} />
        {cellSurfaces.map((surface, cellIndex) => (
          <SurfaceStyles key={`${rowId}-cell-css-${cellIndex}`} css={surface.scopedCss} />
        ))}
        <SurfaceStyles css={actionsCellSurface.scopedCss} />
      </React.Fragment>
    );
  };
  const visibleRowEntries = virtualConfig
    ? virtualList.visibleIndices.map((rowIndex) => ({
        row: renderedRows[rowIndex] as Record<string, unknown>,
        rowIndex,
        sortableId: rowIds[rowIndex],
      }))
    : renderedRows.map((row, rowIndex) => ({
        row: row as Record<string, unknown>,
        rowIndex,
        sortableId: rowIds[rowIndex],
      }));
  const topSpacerHeight = virtualConfig ? virtualList.offsetTop : 0;
  const bottomSpacerHeight = virtualConfig
    ? Math.max(
        0,
        virtualList.totalHeight -
          topSpacerHeight -
          visibleRowEntries.length * (virtualConfig.itemHeight ?? 48),
      )
    : 0;

  return (
    <div
      data-snapshot-component="data-table"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {hasNewData ? (
        <div
          data-table-live-indicator=""
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--sn-radius-md, 0.5rem)",
            backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
          }}
        >
          <span>New data available</span>
          <ButtonControl variant="outline" onClick={refresh}>
            Refresh
          </ButtonControl>
        </div>
      ) : null}
      {/* Table header: search + toolbar */}
      {(config.searchable || config.toolbar?.length) ? (
        <div
          data-table-search
          data-snapshot-id={`${rootId}-toolbar`}
          className={toolbarSurface.className}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: config.searchable ? "space-between" : "flex-end",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            marginBottom: "var(--sn-spacing-md, 12px)",
            ...toolbarSurface.style,
          }}
        >
          {config.searchable && (
            <InputControl
              type="text"
              placeholder={searchPlaceholder}
              value={table.search}
              onChangeText={table.setSearch}
              ariaLabel="Search table"
              surfaceId={`${rootId}-search`}
              style={{
                padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
                borderRadius: "var(--sn-radius-md, 6px)",
                border:
                  "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
                flex: "1 1 auto",
                maxWidth: "min(320px, 100%)",
              }}
            />
          )}
          {config.toolbar?.length ? (
            <div style={{ display: "flex", gap: "var(--sn-spacing-xs, 0.25rem)", flexShrink: 0 }}>
              {config.toolbar.map((item: NonNullable<DataTableConfig["toolbar"]>[number], i: number) => (
                <ToolbarButton key={i} rootId={rootId} index={i} item={item} execute={execute} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Bulk actions toolbar */}
      {showBulkActions && (
        <div
          data-table-bulk-actions
          data-snapshot-id={`${rootId}-bulk-actions`}
          className={bulkActionsSurface.className}
          role="toolbar"
          aria-label="Bulk actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 8px)",
            padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
            marginBottom: "var(--sn-spacing-sm, 8px)",
            backgroundColor: "var(--sn-color-muted, #f3f4f6)",
            borderRadius: "var(--sn-radius-md, 6px)",
            ...bulkActionsSurface.style,
          }}
        >
          <span>{table.selectedIds.length} selected</span>
          {config.bulkActions!.map((bulkAction: NonNullable<DataTableConfig["bulkActions"]>[number], i: number) => (
            <ButtonControl
              key={i}
              variant="ghost"
              surfaceId={`${rootId}-bulk-action-${i}`}
              surfaceConfig={bulkAction.slots?.item}
              onClick={() =>
                void execute(bulkAction.action, {
                  selectedRows: table.selectedRows,
                  selectedIds: table.selectedIds,
                  count: table.selectedIds.length,
                })
              }
            >
              {bulkAction.label.replace(
                "{count}",
                String(table.selectedIds.length),
              )}
            </ButtonControl>
          ))}
        </div>
      )}

      {/* Table */}
      <div
        ref={virtualConfig ? virtualList.containerRef : undefined}
        style={{
          overflowX: "auto",
          overflowY: virtualConfig ? "auto" : undefined,
          maxHeight: virtualConfig ? `${(virtualConfig.itemHeight ?? 48) * 8}px` : undefined,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          <thead>
            <tr
              data-snapshot-id={`${rootId}-header-row`}
              className={headerRowSurface.className}
              style={headerRowSurface.style}
            >
              {/* Expand column header */}
              {config.expandable && (
                <th style={{ padding: cellPadding, width: "32px" }} />
              )}
              {draggable && (
                <th style={{ padding: cellPadding, width: "32px" }} />
              )}
              {/* Select all checkbox */}
              {config.selectable && (
                <th
                  data-snapshot-id={`${rootId}-header-cell-select`}
                  className={headerCellBaseSurface.className}
                  style={{ padding: cellPadding, width: "40px", ...headerCellBaseSurface.style }}
                >
                  <InputControl
                    type="checkbox"
                    checked={
                      renderedRows.length > 0 &&
                      renderedRows.every((row, i) => {
                        const id = (row as Record<string, unknown>)["id"];
                        const rowId =
                          typeof id === "string" || typeof id === "number"
                            ? id
                            : i;
                        return table.selection.has(rowId);
                      })
                    }
                    onChangeChecked={() => table.toggleAll()}
                    ariaLabel="Select all rows"
                    surfaceId={`${rootId}-header-select-all`}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--sn-color-primary, #2563eb)",
                    }}
                  />
                </th>
              )}

              {/* Column headers */}
              {table.columns.map((col) => {
                const isSorted = table.sort?.column === col.field;
                const headerButtonSurface = col.sortable
                  ? resolveSurfacePresentation({
                      surfaceId: `${rootId}-header-button-${col.field}`,
                      implementationBase: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "xs",
                        width: "100%",
                        justifyContent:
                          col.align === "right"
                            ? "flex-end"
                            : col.align === "center"
                              ? "center"
                              : "flex-start",
                        color: isSorted
                          ? "var(--sn-color-primary, #2563eb)"
                          : "var(--sn-color-foreground, #111827)",
                        cursor: "pointer",
                        hover: {
                          color: "var(--sn-color-primary, #2563eb)",
                        },
                        focus: {
                          ring: true,
                        },
                        style: {
                          border: "none",
                          background: "none",
                          padding: 0,
                          textAlign: col.align ?? "left",
                        },
                      },
                      activeStates: isSorted
                        ? (["current", "selected"] as Array<"current" | "selected">)
                        : [],
                    })
                  : null;

                return (
                  <th
                    key={col.field}
                    data-snapshot-id={`${rootId}-header-cell-${col.field}`}
                    className={headerCellBaseSurface.className}
                    style={{
                      padding: cellPadding,
                      textAlign: col.align ?? "left",
                      width: col.width,
                      userSelect: "none",
                      ...headerCellBaseSurface.style,
                    }}
                    aria-sort={
                      table.sort?.column === col.field
                        ? table.sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <>
                        <ButtonControl
                          surfaceId={`${rootId}-header-button-${col.field}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => table.setSortColumn(col.field)}
                          ariaCurrent={isSorted ? "page" : undefined}
                          className={headerButtonSurface?.className}
                          style={headerButtonSurface?.style}
                          activeStates={
                            isSorted
                              ? (["current", "selected"] as Array<"current" | "selected">)
                              : []
                          }
                        >
                          <span>{col.label}</span>
                          <SortIndicator column={col.field} sort={table.sort} />
                        </ButtonControl>
                        <SurfaceStyles css={headerButtonSurface?.scopedCss} />
                      </>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}

              {/* Actions column header */}
              {hasActions && (
                <th
                  data-snapshot-id={`${rootId}-header-cell-actions`}
                  className={headerCellBaseSurface.className}
                  style={{ padding: cellPadding, textAlign: "right", ...headerCellBaseSurface.style }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <DroppableTableBody containerId={containerId}>
            {/* Loading state */}
            {table.isLoading &&
              (config.loading && !config.loading.disabled ? (
                <tr>
                  <td colSpan={totalColumns} style={{ padding: cellPadding }}>
                    <div
                      data-snapshot-id={`${rootId}-loading`}
                      className={loadingSurface.className}
                      style={loadingSurface.style}
                    >
                      <AutoSkeleton componentType="data-table" config={config.loading} />
                    </div>
                  </td>
                </tr>
              ) : (
                <SkeletonRows columnCount={totalColumns} rowCount={5} />
              ))}

            {/* Error state */}
            {table.error && (
              <tr>
                <td
                  colSpan={totalColumns}
                  style={{ padding: cellPadding, textAlign: "center" }}
                >
                  <div
                    data-table-error
                    role="alert"
                    data-snapshot-id={`${rootId}-error`}
                    className={errorSurface.className}
                    style={errorSurface.style}
                  >
                    Error: {table.error.message}
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!table.isLoading && !table.error && renderedRows.length === 0 && (
              <tr>
                <td
                  colSpan={totalColumns}
                  style={{ padding: cellPadding, textAlign: "center" }}
                >
                  {emptyStateConfig ? (
                    <div
                      data-snapshot-id={`${rootId}-empty`}
                      className={emptySurface.className}
                      style={emptySurface.style}
                    >
                      <AutoEmptyState config={emptyStateConfig} />
                    </div>
                  ) : (
                    <div
                      data-table-empty
                      data-snapshot-id={`${rootId}-empty`}
                      className={emptySurface.className}
                      style={emptySurface.style}
                    >
                      {config.emptyMessage ?? "No data available"}
                    </div>
                  )}
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!table.isLoading &&
              !table.error &&
              (draggable ? (
                <SortableContext
                  items={rowIds}
                  strategy={verticalListSortingStrategy}
                >
                  <>
                    {topSpacerHeight > 0 ? (
                      <tr aria-hidden="true">
                        <td colSpan={totalColumns} style={{ height: `${topSpacerHeight}px`, padding: 0 }} />
                      </tr>
                    ) : null}
                    {visibleRowEntries.map(({ row, rowIndex, sortableId }) =>
                      renderRow(row, rowIndex, true, sortableId),
                    )}
                    {bottomSpacerHeight > 0 ? (
                      <tr aria-hidden="true">
                        <td colSpan={totalColumns} style={{ height: `${bottomSpacerHeight}px`, padding: 0 }} />
                      </tr>
                    ) : null}
                  </>
                </SortableContext>
              ) : (
                <>
                  {topSpacerHeight > 0 ? (
                    <tr aria-hidden="true">
                      <td colSpan={totalColumns} style={{ height: `${topSpacerHeight}px`, padding: 0 }} />
                    </tr>
                  ) : null}
                  {visibleRowEntries.map(({ row, rowIndex }) =>
                    renderRow(row, rowIndex, false),
                  )}
                  {bottomSpacerHeight > 0 ? (
                    <tr aria-hidden="true">
                      <td colSpan={totalColumns} style={{ height: `${bottomSpacerHeight}px`, padding: 0 }} />
                    </tr>
                  ) : null}
                </>
              ))}
          </DroppableTableBody>
        </table>
      </div>

      {/* Infinite scroll sentinel */}
      {table.isInfiniteScroll && table.hasMore && (
        <div ref={infiniteScrollRef} style={{ height: 1 }} />
      )}

      {/* Pagination controls (hidden for infinite scroll) */}
      {table.pagination && table.pagination.totalPages > 1 && !table.isInfiniteScroll && (
        <div
          data-table-pagination
          data-snapshot-id={`${rootId}-pagination`}
          className={paginationSurface.className}
          role="navigation"
          aria-label="Table pagination"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sn-spacing-sm, 8px) 0",
            marginTop: "var(--sn-spacing-sm, 8px)",
            ...paginationSurface.style,
          }}
        >
          <span>
            Page {table.pagination.currentPage} of {table.pagination.totalPages}
          </span>
          <div style={{ display: "flex", gap: "var(--sn-spacing-xs, 4px)" }}>
            <ButtonControl
              variant="ghost"
              onClick={() => table.prevPage()}
              disabled={table.pagination!.currentPage <= 1}
              aria-label="Previous page"
              testId="table-pagination-prev"
            >
              Previous
            </ButtonControl>
            <ButtonControl
              variant="ghost"
              onClick={() => table.nextPage()}
              disabled={
                table.pagination!.currentPage >= table.pagination!.totalPages
              }
              aria-label="Next page"
              testId="table-pagination-next"
            >
              Next
            </ButtonControl>
          </div>
        </div>
      )}
      {config.contextMenu ? (
        <ContextMenuPortal
          items={config.contextMenu}
          state={contextMenuState}
          onClose={() => setContextMenuState(null)}
        />
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={toolbarSurface.scopedCss} />
      <SurfaceStyles css={bulkActionsSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
      <SurfaceStyles css={paginationSurface.scopedCss} />
      <SurfaceStyles css={headerRowSurface.scopedCss} />
      <SurfaceStyles css={headerCellBaseSurface.scopedCss} />
    </div>
  );
}
