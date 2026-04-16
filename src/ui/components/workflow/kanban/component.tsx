'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
} from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import {
  DndContext,
  SortableContext,
  DragOverlay,
  rectIntersection,
  useSortable,
  useDroppable,
  verticalListSortingStrategy,
  useDndSensors,
  getSortableStyle,
} from "../../../hooks/use-drag-drop";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "../../../hooks/use-drag-drop";
import { getInitials } from "../../_base/utils";
import type { KanbanColumnConfig, KanbanConfig } from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────

const colorVar = (color: string): string =>
  `var(--sn-color-${color}, currentColor)`;

const priorityColorMap: Record<string, string> = {
  high: "var(--sn-color-destructive, #ef4444)",
  medium: "var(--sn-color-warning, #f59e0b)",
  low: "var(--sn-color-info, #3b82f6)",
};

function asSurfaceConfig(
  value: unknown,
): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function areRecordListsEqual(
  left: Record<string, unknown>[],
  right: Record<string, unknown>[],
): boolean {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }

  return left.every((leftItem, index) => {
    const rightItem = right[index];
    if (!rightItem) {
      return false;
    }
    if (leftItem === rightItem) {
      return true;
    }

    const leftKeys = Object.keys(leftItem);
    const rightKeys = Object.keys(rightItem);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightItem, key) &&
        Object.is(leftItem[key], rightItem[key]),
    );
  });
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      data-kanban-skeleton
      style={{
        padding: "var(--sn-spacing-sm, 8px)",
        borderRadius: "var(--sn-radius-sm, 4px)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        opacity: "var(--sn-opacity-muted, 0.5)",
      }}
    >
      <div
        style={{
          height: "1em",
          width: "70%",
          borderRadius: "var(--sn-radius-xs, 2px)",
          backgroundColor: "var(--sn-color-muted-foreground, #94a3b8)",
          opacity: "var(--sn-opacity-disabled, 0.3)",
          marginBottom: "var(--sn-spacing-xs, 4px)",
        }}
      />
      <div
        style={{
          height: "0.75em",
          width: "90%",
          borderRadius: "var(--sn-radius-xs, 2px)",
          backgroundColor: "var(--sn-color-muted-foreground, #94a3b8)",
          opacity: "var(--sn-opacity-disabled, 0.2)",
        }}
      />
    </div>
  );
}

// ── Sortable Card ──────────────────────────────────────────────────────────

function SortableCard({
  item,
  cardId,
  rootId,
  config,
  execute,
}: {
  item: Record<string, unknown>;
  cardId: string;
  rootId: string;
  config: KanbanConfig;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardId });

  const sortableStyle = getSortableStyle(transform, transition, isDragging);

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={sortableStyle}>
      <CardContent
        item={item}
        cardId={cardId}
        rootId={rootId}
        config={config}
        execute={execute}
      />
    </div>
  );
}

// ── Droppable column body (allows dropping onto empty columns) ──────────────

function DroppableColumnBody({
  columnKey,
  snapshotId,
  className,
  children,
  style,
}: {
  columnKey: string;
  snapshotId: string;
  className?: string;
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnKey}` });

  return (
    <div
      ref={setNodeRef}
      data-kanban-body
      data-snapshot-id={snapshotId}
      className={className}
      style={{
        ...style,
        backgroundColor: isOver
          ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 5%, transparent)"
          : undefined,
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      }}
    >
      {children}
    </div>
  );
}

// ── Card Content (shared between sortable and overlay) ─────────────────────

function CardContent({
  item,
  cardId,
  rootId,
  config,
  execute,
}: {
  item: Record<string, unknown>;
  cardId: string;
  rootId: string;
  config: KanbanConfig;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const titleField = config.titleField ?? "title";
  const title = String(item[titleField] ?? "");
  const description = config.descriptionField
    ? String(item[config.descriptionField] ?? "")
    : undefined;
  const assignee = config.assigneeField
    ? String(item[config.assigneeField] ?? "")
    : undefined;
  const priority = config.priorityField
    ? String(item[config.priorityField] ?? "")
    : undefined;
  const itemSlots = asSurfaceConfig(item.slots);
  const cardSurfaceId = `${rootId}-card-${cardId}`;
  const titleSurfaceId = `${cardSurfaceId}-title`;
  const descriptionSurfaceId = `${cardSurfaceId}-description`;
  const metaSurfaceId = `${cardSurfaceId}-meta`;

  const cardSurface = resolveSurfacePresentation({
    surfaceId: cardSurfaceId,
    implementationBase: {
      bg: "var(--sn-color-card, #fff)",
      borderRadius: "sm",
      padding: "sm",
      shadow: "sm",
      cursor: config.sortable
        ? "grab"
        : config.cardAction
          ? "pointer"
          : "default",
      hover: {
        shadow: "md",
      },
      focus: {
        ring: true,
      },
      active: {
        scale: 0.98,
      },
      states: {
        current: {
          shadow: "lg",
        },
      },
      style: {
        transition:
          "box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: config.slots?.card,
    itemSurface: asSurfaceConfig(itemSlots?.card),
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: titleSurfaceId,
    implementationBase: {
      fontWeight: "semibold",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #0f172a)",
      style: {
        marginBottom: description ? "var(--sn-spacing-xs, 4px)" : undefined,
      },
    },
    componentSurface: config.slots?.cardTitle,
    itemSurface: asSurfaceConfig(itemSlots?.cardTitle),
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: descriptionSurfaceId,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #64748b)",
      overflow: "hidden",
      style: {
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        marginBottom: "var(--sn-spacing-xs, 4px)",
      } as CSSProperties,
    },
    componentSurface: config.slots?.cardDescription,
    itemSurface: asSurfaceConfig(itemSlots?.cardDescription),
  });
  const metaSurface = resolveSurfacePresentation({
    surfaceId: metaSurfaceId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      style: {
        marginTop: "var(--sn-spacing-xs, 4px)",
      },
    },
    componentSurface: config.slots?.cardMeta,
    itemSurface: asSurfaceConfig(itemSlots?.cardMeta),
  });

  return (
    <>
      <div
        data-kanban-card
        data-snapshot-id={cardSurfaceId}
        className={cardSurface.className}
        role={config.cardAction ? "button" : undefined}
        tabIndex={config.cardAction ? 0 : undefined}
        onClick={
          config.cardAction
            ? () => void execute(config.cardAction!, { ...item })
            : undefined
        }
        onKeyDown={
          config.cardAction
            ? (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void execute(config.cardAction!, { ...item });
                }
              }
            : undefined
        }
        style={cardSurface.style}
      >
      {/* Title */}
        <div
          data-snapshot-id={titleSurfaceId}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {title}
        </div>

      {/* Description */}
        {description && (
          <div
            data-snapshot-id={descriptionSurfaceId}
            className={descriptionSurface.className}
            style={descriptionSurface.style}
          >
            {description}
          </div>
        )}

      {/* Footer: assignee + priority */}
        {(assignee || priority) && (
          <div
            data-snapshot-id={metaSurfaceId}
            className={metaSurface.className}
            style={metaSurface.style}
          >
            {assignee ? (
              <div
                data-kanban-assignee
                title={assignee}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "var(--sn-radius-full, 9999px)",
                  backgroundColor: "var(--sn-color-primary, #2563eb)",
                  color: "var(--sn-color-primary-foreground, #fff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  fontWeight:
                    "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                }}
              >
                {getInitials(assignee)}
              </div>
            ) : (
              <span />
            )}

            {priority && (
              <div
                data-kanban-priority={priority}
                title={`Priority: ${priority}`}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "var(--sn-radius-full, 9999px)",
                  backgroundColor:
                    priorityColorMap[priority.toLowerCase()] ??
                    "var(--sn-color-muted, #e5e7eb)",
                }}
              />
            )}
          </div>
        )}
      </div>
      <SurfaceStyles css={cardSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={metaSurface.scopedCss} />
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * Config-driven Kanban board with optional drag-and-drop.
 *
 * When `sortable: true`, cards can be dragged between columns.
 * On drop, the `reorderAction` is dispatched with the card's id,
 * the target column key, and the new position index.
 *
 * @param props - Component props containing the Kanban configuration
 */
export function Kanban({ config }: { config: KanbanConfig }) {
  const { data, isLoading, error } = useComponentData(
    config.data ?? "",
    undefined,
  );
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const sensors = useDndSensors();

  const columnField = config.columnField ?? "status";
  const sortable = config.sortable ?? false;

  // Extract items from response
  const rawItems: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  // Local item state for DnD reordering
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync from server data
  React.useEffect(() => {
    setItems((currentItems) =>
      areRecordListsEqual(currentItems, rawItems) ? currentItems : rawItems,
    );
  }, [rawItems]);

  // Get card id
  const getCardId = useCallback(
    (item: Record<string, unknown>): string => {
      const id = item.id ?? item._id;
      return typeof id === "string" || typeof id === "number"
        ? String(id)
        : `item-${items.indexOf(item)}`;
    },
    [items],
  );

  // Group items by column
  const grouped = useMemo(() => {
    const map = new Map<string, Record<string, unknown>[]>();
    for (const col of config.columns) {
      map.set(col.key, []);
    }
    for (const item of items) {
      const colKey = String(item[columnField] ?? "");
      const list = map.get(colKey);
      if (list) list.push(item);
    }
    return map;
  }, [items, config.columns, columnField]);

  // Find item by DnD id
  const findItem = useCallback(
    (id: string) =>
      items.find((item: Record<string, unknown>) => getCardId(item) === id),
    [items, getCardId],
  );

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeItem = findItem(String(active.id));
      if (!activeItem) return;

      // Check if dragged over a column droppable (id: "column-{key}") or another card
      const overId = String(over.id);
      const overColumnKey = overId.startsWith("column-")
        ? config.columns.find((c: KanbanColumnConfig) => `column-${c.key}` === overId)
            ?.key
        : config.columns.find((c: KanbanColumnConfig) => c.key === overId)?.key;
      if (overColumnKey) {
        // Dropped on column header — move to that column
        const currentCol = String(activeItem[columnField] ?? "");
        if (currentCol !== overColumnKey) {
          setItems((prev) =>
            prev.map((item: Record<string, unknown>) =>
              getCardId(item) === String(active.id)
                ? { ...item, [columnField]: overColumnKey }
                : item,
            ),
          );
        }
      }
    },
    [findItem, config.columns, columnField, getCardId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeItem = findItem(String(active.id));
      if (!activeItem) return;

      const overId = String(over.id);
      const targetColumnKey =
        // Dropped on a column droppable zone (id: "column-{key}")
        (overId.startsWith("column-")
          ? config.columns.find((c: KanbanColumnConfig) => `column-${c.key}` === overId)
              ?.key
          : config.columns.find((c: KanbanColumnConfig) => c.key === overId)?.key) ??
        // Dropped on another card — find which column that card is in
        (() => {
          const overItem = findItem(overId);
          return overItem ? String(overItem[columnField] ?? "") : null;
        })();

      if (!targetColumnKey) return;

      // Move item to target column if different
        const currentCol = String(activeItem[columnField] ?? "");
        if (currentCol !== targetColumnKey) {
          setItems((prev) =>
            prev.map((item: Record<string, unknown>) =>
              getCardId(item) === String(active.id)
                ? { ...item, [columnField]: targetColumnKey }
                : item,
          ),
        );
      }

      // Get position in target column
      const targetColItems = items.filter(
        (i: Record<string, unknown>) =>
          String(i[columnField] ?? "") === targetColumnKey ||
          getCardId(i) === String(active.id),
      );
      const position = targetColItems.findIndex(
        (i) => getCardId(i) === String(over.id),
      );

      // Dispatch reorder action
      if (config.reorderAction) {
        void execute(config.reorderAction, {
          id: active.id,
          columnKey: targetColumnKey,
          position: Math.max(0, position),
          item: activeItem,
        });
      }

      // Publish updated state
      if (publish) {
        publish({
          movedItem: activeItem,
          targetColumn: targetColumnKey,
          position,
        });
      }
    },
    [findItem, config, columnField, getCardId, items, execute, publish],
  );

  if (visible === false) return null;

  const activeItem = activeId ? findItem(activeId) : null;
  const rootId = config.id ?? "kanban";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      gap: "md",
      overflow: "auto",
      style: {
        overflowX: "auto",
        padding: "var(--sn-spacing-sm, 8px) 0",
      },
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });

  // Column content renderer (shared between sortable and static)
  const renderColumn = (col: (typeof config.columns)[number]) => {
    const colItems = grouped.get(col.key) ?? [];
    const isOverLimit = col.limit != null && colItems.length > col.limit;
    const accentColor = col.color ?? "muted";
    const cardIds = colItems.map(getCardId);
    const columnSurfaceId = `${rootId}-column-${col.key}`;
    const columnHeaderSurfaceId = `${columnSurfaceId}-header`;
    const columnTitleSurfaceId = `${columnSurfaceId}-title`;
    const columnCountSurfaceId = `${columnSurfaceId}-count`;
    const columnBodySurfaceId = `${columnSurfaceId}-body`;
    const emptyStateSurfaceId = `${columnSurfaceId}-empty`;
    const columnSurface = resolveSurfacePresentation({
      surfaceId: columnSurfaceId,
      implementationBase: {
        bg: "var(--sn-color-secondary, #f8fafc)",
        borderRadius: "md",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        style: {
          minWidth: "min(280px, 85vw)",
          maxWidth: "min(320px, 85vw)",
          flex: "0 0 min(280px, 85vw)",
        },
      },
      componentSurface: config.slots?.column,
      itemSurface: col.slots?.column,
    });
    const columnHeaderSurface = resolveSurfacePresentation({
      surfaceId: columnHeaderSurfaceId,
      implementationBase: {
        display: "flex",
        alignItems: "center",
        gap: "sm",
        hover: {
          bg: "color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 40%, transparent)",
        },
        style: {
          borderTop: `3px solid ${colorVar(accentColor)}`,
          padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
        },
      },
      componentSurface: config.slots?.columnHeader,
      itemSurface: col.slots?.columnHeader,
    });
    const columnTitleSurface = resolveSurfacePresentation({
      surfaceId: columnTitleSurfaceId,
      implementationBase: {
        fontWeight: "semibold",
        fontSize: "sm",
        color: isOverLimit
          ? "var(--sn-color-destructive, #ef4444)"
          : "var(--sn-color-foreground, #0f172a)",
      },
      componentSurface: config.slots?.columnTitle,
      itemSurface: col.slots?.columnTitle,
    });
    const columnCountSurface = resolveSurfacePresentation({
      surfaceId: columnCountSurfaceId,
      implementationBase: {
        fontSize: "xs",
        borderRadius: "full",
        textAlign: "center",
        display: "inline-block",
        style: {
          backgroundColor: isOverLimit
            ? "var(--sn-color-destructive, #ef4444)"
            : "var(--sn-color-muted, #e5e7eb)",
          color: isOverLimit
            ? "var(--sn-color-destructive-foreground, #fff)"
            : "var(--sn-color-muted-foreground, #64748b)",
          padding: "0 var(--sn-spacing-xs, 4px)",
          minWidth: "1.5em",
        },
      },
      componentSurface: config.slots?.columnCount,
      itemSurface: col.slots?.columnCount,
    });
    const columnBodySurface = resolveSurfacePresentation({
      surfaceId: columnBodySurfaceId,
      implementationBase: {
        display: "flex",
        flexDirection: "column",
        gap: "sm",
        style: {
          flex: 1,
          overflowY: "auto",
          minHeight: sortable ? "80px" : "60px",
          padding:
            "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px) var(--sn-spacing-sm, 8px)",
        },
      },
      componentSurface: config.slots?.columnBody,
      itemSurface: col.slots?.columnBody,
    });
    const emptyStateSurface = resolveSurfacePresentation({
      surfaceId: emptyStateSurfaceId,
      implementationBase: {
        fontSize: "xs",
        color: "var(--sn-color-muted-foreground, #94a3b8)",
        textAlign: "center",
        padding: "md",
      },
      componentSurface: config.slots?.emptyState,
    });

    return (
      <div
        key={col.key}
        data-kanban-column={col.key}
        data-snapshot-id={columnSurfaceId}
        className={columnSurface.className}
        style={columnSurface.style}
      >
        {/* Column header */}
        <div
          data-kanban-header
          data-snapshot-id={columnHeaderSurfaceId}
          className={columnHeaderSurface.className}
          style={columnHeaderSurface.style}
        >
          <span
            data-snapshot-id={columnTitleSurfaceId}
            className={columnTitleSurface.className}
            style={columnTitleSurface.style}
          >
            {col.title}
          </span>
          <span
            data-kanban-count
            data-snapshot-id={columnCountSurfaceId}
            className={columnCountSurface.className}
            style={columnCountSurface.style}
          >
            {colItems.length}
            {col.limit != null ? `/${col.limit}` : ""}
          </span>
        </div>

        {/* Column body — droppable when sortable so empty columns accept drops */}
        {sortable ? (
          <DroppableColumnBody
            columnKey={col.key}
            snapshotId={columnBodySurfaceId}
            className={columnBodySurface.className}
            style={columnBodySurface.style}
          >
            {isLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {error && (
              <div
                data-kanban-error
                role="alert"
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-destructive, #ef4444)",
                  textAlign: "center",
                  padding: "var(--sn-spacing-sm, 8px)",
                }}
              >
                Error loading data
              </div>
            )}

            {!isLoading && !error && colItems.length === 0 && (
              <div
                data-kanban-empty
                data-snapshot-id={emptyStateSurfaceId}
                className={emptyStateSurface.className}
                style={emptyStateSurface.style}
              >
                {config.emptyMessage ?? "No items"}
              </div>
            )}

            {!isLoading && !error && (
              <SortableContext
                items={cardIds}
                strategy={verticalListSortingStrategy}
              >
                {colItems.map((item) => (
                  <SortableCard
                    key={getCardId(item)}
                    item={item}
                    cardId={getCardId(item)}
                    rootId={rootId}
                    config={config}
                    execute={execute}
                  />
                ))}
              </SortableContext>
            )}
          </DroppableColumnBody>
        ) : (
          <div
            data-kanban-body
            data-snapshot-id={columnBodySurfaceId}
            className={columnBodySurface.className}
            style={columnBodySurface.style}
          >
            {isLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {error && (
              <div
                data-kanban-error
                role="alert"
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-destructive, #ef4444)",
                  textAlign: "center",
                  padding: "var(--sn-spacing-sm, 8px)",
                }}
              >
                Error loading data
              </div>
            )}

            {!isLoading && !error && colItems.length === 0 && (
              <div
                data-kanban-empty
                data-snapshot-id={emptyStateSurfaceId}
                className={emptyStateSurface.className}
                style={emptyStateSurface.style}
              >
                {config.emptyMessage ?? "No items"}
              </div>
            )}

            {!isLoading &&
              !error &&
              colItems.map((item) => (
                <CardContent
                  key={getCardId(item)}
                  item={item}
                  cardId={getCardId(item)}
                  rootId={rootId}
                  config={config}
                  execute={execute}
                />
              ))}
          </div>
        )}
        <SurfaceStyles css={columnSurface.scopedCss} />
        <SurfaceStyles css={columnHeaderSurface.scopedCss} />
        <SurfaceStyles css={columnTitleSurface.scopedCss} />
        <SurfaceStyles css={columnCountSurface.scopedCss} />
        <SurfaceStyles css={columnBodySurface.scopedCss} />
        <SurfaceStyles css={emptyStateSurface.scopedCss} />
      </div>
    );
  };

  const board = (
    <div
      data-snapshot-component="kanban"
      data-testid="kanban"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {config.columns.map(renderColumn)}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );

  // Wrap with DnD context when sortable
  if (sortable) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {board}
        <DragOverlay>
          {activeItem ? (
            <div style={{ width: "min(280px, 85vw)" }}>
              <CardContent
                item={activeItem}
                cardId={activeId ?? "active"}
                rootId={rootId}
                config={config}
                execute={execute}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  return board;
}
