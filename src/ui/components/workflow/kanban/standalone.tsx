'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  type CSSProperties,
} from "react";
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

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface KanbanColumnEntry {
  /** Unique key identifying this column (matches the item's column field value). */
  key: string;
  /** Display title for the column header. */
  title: string;
  /** Semantic color name for the column accent border. */
  color?: string;
  /** WIP limit; column header turns destructive when exceeded. */
  limit?: number;
  /** Slot overrides scoped to this column. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface KanbanBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Column definitions. */
  columns: KanbanColumnEntry[];
  /** Data items. */
  items: Record<string, unknown>[];
  /** Whether data is loading. */
  loading?: boolean;
  /** Error object, if any. */
  error?: { message: string } | null;
  /** Field that determines which column an item belongs to. Default: "status". */
  columnField?: string;
  /** Field for card title. Default: "title". */
  titleField?: string;
  /** Field for card description. */
  descriptionField?: string;
  /** Field for assignee name. */
  assigneeField?: string;
  /** Field for priority indicator. */
  priorityField?: string;
  /** Enable drag-and-drop sorting. */
  sortable?: boolean;
  /** Empty column message. */
  emptyMessage?: string;
  /** Called when a card is clicked. */
  onCardClick?: (item: Record<string, unknown>) => void;
  /** Called after drag-and-drop reorder. */
  onReorder?: (payload: { id: string | number; columnKey: string; position: number; item: Record<string, unknown> }) => void;
  /** Called when items change via DnD (for publish). */
  onDndChange?: (payload: { movedItem: Record<string, unknown>; targetColumn: string; position: number }) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

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
  if (left === right) return true;
  if (left.length !== right.length) return false;
  return left.every((leftItem, index) => {
    const rightItem = right[index];
    if (!rightItem) return false;
    if (leftItem === rightItem) return true;
    const leftKeys = Object.keys(leftItem);
    const rightKeys = Object.keys(rightItem);
    if (leftKeys.length !== rightKeys.length) return false;
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
  titleField,
  descriptionField,
  assigneeField,
  priorityField,
  sortable,
  onCardClick,
  slots,
}: {
  item: Record<string, unknown>;
  cardId: string;
  rootId: string;
  titleField: string;
  descriptionField?: string;
  assigneeField?: string;
  priorityField?: string;
  sortable: boolean;
  onCardClick?: (item: Record<string, unknown>) => void;
  slots?: Record<string, Record<string, unknown>>;
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
        titleField={titleField}
        descriptionField={descriptionField}
        assigneeField={assigneeField}
        priorityField={priorityField}
        sortable={sortable}
        onCardClick={onCardClick}
        slots={slots}
      />
    </div>
  );
}

// ── Droppable column body ──────────────────────────────────────────────────

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

// ── Card Content ──────────────────────────────────────────────────────────

function CardContent({
  item,
  cardId,
  rootId,
  titleField,
  descriptionField,
  assigneeField,
  priorityField,
  sortable,
  onCardClick,
  slots,
}: {
  item: Record<string, unknown>;
  cardId: string;
  rootId: string;
  titleField: string;
  descriptionField?: string;
  assigneeField?: string;
  priorityField?: string;
  sortable: boolean;
  onCardClick?: (item: Record<string, unknown>) => void;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const title = String(item[titleField] ?? "");
  const description = descriptionField
    ? String(item[descriptionField] ?? "")
    : undefined;
  const assignee = assigneeField
    ? String(item[assigneeField] ?? "")
    : undefined;
  const priority = priorityField
    ? String(item[priorityField] ?? "")
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
      cursor: sortable
        ? "grab"
        : onCardClick
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
    componentSurface: slots?.card,
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
    componentSurface: slots?.cardTitle,
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
    componentSurface: slots?.cardDescription,
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
    componentSurface: slots?.cardMeta,
    itemSurface: asSurfaceConfig(itemSlots?.cardMeta),
  });

  return (
    <>
      <div
        data-kanban-card
        data-snapshot-id={cardSurfaceId}
        className={cardSurface.className}
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onClick={
          onCardClick
            ? () => onCardClick(item)
            : undefined
        }
        onKeyDown={
          onCardClick
            ? (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCardClick(item);
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

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Standalone KanbanBase — renders a multi-column board with cards, WIP limits,
 * assignee avatars, priority indicators, and optional drag-and-drop reordering. No manifest context required.
 *
 * @example
 * ```tsx
 * <KanbanBase
 *   columns={[
 *     { key: "todo", title: "To Do", color: "info" },
 *     { key: "in-progress", title: "In Progress", color: "warning", limit: 3 },
 *     { key: "done", title: "Done", color: "success" },
 *   ]}
 *   items={[{ id: "1", title: "Task A", status: "todo", assignee: "Jane" }]}
 *   sortable
 *   onCardClick={(item) => console.log(item)}
 * />
 * ```
 */
export function KanbanBase({
  id,
  columns,
  items: rawItems,
  loading = false,
  error,
  columnField = "status",
  titleField = "title",
  descriptionField,
  assigneeField,
  priorityField,
  sortable = false,
  emptyMessage,
  onCardClick,
  onReorder,
  onDndChange,
  className,
  style,
  slots,
}: KanbanBaseProps) {
  const rootId = id ?? "kanban";
  const sensors = useDndSensors();

  // Local item state for DnD reordering
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync from external data
  useEffect(() => {
    setItems((currentItems) =>
      areRecordListsEqual(currentItems, rawItems) ? currentItems : rawItems,
    );
  }, [rawItems]);

  // Get card id
  const getCardId = useCallback(
    (item: Record<string, unknown>): string => {
      const cardIdVal = item.id ?? item._id;
      return typeof cardIdVal === "string" || typeof cardIdVal === "number"
        ? String(cardIdVal)
        : `item-${items.indexOf(item)}`;
    },
    [items],
  );

  // Group items by column
  const grouped = useMemo(() => {
    const map = new Map<string, Record<string, unknown>[]>();
    for (const col of columns) {
      map.set(col.key, []);
    }
    for (const item of items) {
      const colKey = String(item[columnField] ?? "");
      const list = map.get(colKey);
      if (list) list.push(item);
    }
    return map;
  }, [items, columns, columnField]);

  // Find item by DnD id
  const findItem = useCallback(
    (findId: string) =>
      items.find((item: Record<string, unknown>) => getCardId(item) === findId),
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

      const overId = String(over.id);
      const overColumnKey = overId.startsWith("column-")
        ? columns.find((c) => `column-${c.key}` === overId)?.key
        : columns.find((c) => c.key === overId)?.key;
      if (overColumnKey) {
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
    [findItem, columns, columnField, getCardId],
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
        (overId.startsWith("column-")
          ? columns.find((c) => `column-${c.key}` === overId)?.key
          : columns.find((c) => c.key === overId)?.key) ??
        (() => {
          const overItem = findItem(overId);
          return overItem ? String(overItem[columnField] ?? "") : null;
        })();

      if (!targetColumnKey) return;

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

      const targetColItems = items.filter(
        (i: Record<string, unknown>) =>
          String(i[columnField] ?? "") === targetColumnKey ||
          getCardId(i) === String(active.id),
      );
      const position = targetColItems.findIndex(
        (i) => getCardId(i) === String(over.id),
      );

      if (onReorder) {
        onReorder({
          id: active.id as string | number,
          columnKey: targetColumnKey,
          position: Math.max(0, position),
          item: activeItem,
        });
      }

      if (onDndChange) {
        onDndChange({
          movedItem: activeItem,
          targetColumn: targetColumnKey,
          position,
        });
      }
    },
    [findItem, columns, columnField, getCardId, items, onReorder, onDndChange],
  );

  const activeItem = activeId ? findItem(activeId) : null;

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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  const renderColumn = (col: KanbanColumnEntry) => {
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
      componentSurface: slots?.column,
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
      componentSurface: slots?.columnHeader,
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
      componentSurface: slots?.columnTitle,
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
      componentSurface: slots?.columnCount,
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
      componentSurface: slots?.columnBody,
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
      componentSurface: slots?.emptyState,
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

        {/* Column body */}
        {sortable ? (
          <DroppableColumnBody
            columnKey={col.key}
            snapshotId={columnBodySurfaceId}
            className={columnBodySurface.className}
            style={columnBodySurface.style}
          >
            {loading && (
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

            {!loading && !error && colItems.length === 0 && (
              <div
                data-kanban-empty
                data-snapshot-id={emptyStateSurfaceId}
                className={emptyStateSurface.className}
                style={emptyStateSurface.style}
              >
                {emptyMessage ?? "No items"}
              </div>
            )}

            {!loading && !error && (
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
                    titleField={titleField}
                    descriptionField={descriptionField}
                    assigneeField={assigneeField}
                    priorityField={priorityField}
                    sortable={sortable}
                    onCardClick={onCardClick}
                    slots={slots}
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
            {loading && (
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

            {!loading && !error && colItems.length === 0 && (
              <div
                data-kanban-empty
                data-snapshot-id={emptyStateSurfaceId}
                className={emptyStateSurface.className}
                style={emptyStateSurface.style}
              >
                {emptyMessage ?? "No items"}
              </div>
            )}

            {!loading &&
              !error &&
              colItems.map((item) => (
                <CardContent
                  key={getCardId(item)}
                  item={item}
                  cardId={getCardId(item)}
                  rootId={rootId}
                  titleField={titleField}
                  descriptionField={descriptionField}
                  assigneeField={assigneeField}
                  priorityField={priorityField}
                  sortable={sortable}
                  onCardClick={onCardClick}
                  slots={slots}
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
      {columns.map(renderColumn)}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );

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
                titleField={titleField}
                descriptionField={descriptionField}
                assigneeField={assigneeField}
                priorityField={priorityField}
                sortable={sortable}
                onCardClick={onCardClick}
                slots={slots}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  return board;
}
