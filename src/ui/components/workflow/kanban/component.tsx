import React, { useState, useCallback, useMemo } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe, usePublish } from "../../../context/hooks";
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
import type { DragStartEvent, DragEndEvent, DragOverEvent } from "../../../hooks/use-drag-drop";
import type { KanbanConfig } from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────

const colorVar = (color: string): string =>
  `var(--sn-color-${color}, currentColor)`;

const priorityColorMap: Record<string, string> = {
  high: "var(--sn-color-destructive, #ef4444)",
  medium: "var(--sn-color-warning, #f59e0b)",
  low: "var(--sn-color-info, #3b82f6)",
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
        opacity: 0.5,
      }}
    >
      <div
        style={{
          height: "1em",
          width: "70%",
          borderRadius: "var(--sn-radius-xs, 2px)",
          backgroundColor: "var(--sn-color-muted-foreground, #94a3b8)",
          opacity: 0.3,
          marginBottom: "var(--sn-spacing-xs, 4px)",
        }}
      />
      <div
        style={{
          height: "0.75em",
          width: "90%",
          borderRadius: "var(--sn-radius-xs, 2px)",
          backgroundColor: "var(--sn-color-muted-foreground, #94a3b8)",
          opacity: 0.2,
        }}
      />
    </div>
  );
}

// ── Sortable Card ──────────────────────────────────────────────────────────

function SortableCard({
  item,
  cardId,
  config,
  execute,
}: {
  item: Record<string, unknown>;
  cardId: string;
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={sortableStyle}
    >
      <CardContent item={item} config={config} execute={execute} />
    </div>
  );
}

// ── Droppable column body (allows dropping onto empty columns) ──────────────

function DroppableColumnBody({
  columnKey,
  children,
  style,
}: {
  columnKey: string;
  children: React.ReactNode;
  style: React.CSSProperties;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnKey}` });

  return (
    <div
      ref={setNodeRef}
      data-kanban-body
      style={{
        ...style,
        backgroundColor: isOver
          ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 5%, transparent)"
          : undefined,
        transition: "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      }}
    >
      {children}
    </div>
  );
}

// ── Card Content (shared between sortable and overlay) ─────────────────────

function CardContent({
  item,
  config,
  execute,
}: {
  item: Record<string, unknown>;
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

  return (
    <div
      data-kanban-card
      onClick={
        config.cardAction
          ? () => void execute(config.cardAction!, { ...item })
          : undefined
      }
      style={{
        backgroundColor: "var(--sn-color-card, #fff)",
        borderRadius: "var(--sn-radius-sm, 4px)",
        padding: "var(--sn-spacing-sm, 8px)",
        boxShadow:
          "var(--sn-shadow-sm, 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1))",
        cursor: config.sortable ? "grab" : config.cardAction ? "pointer" : "default",
        transition: "box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontWeight:
            "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-foreground, #0f172a)",
          marginBottom: description
            ? "var(--sn-spacing-xs, 4px)"
            : undefined,
        }}
      >
        {title}
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #64748b)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: "var(--sn-spacing-xs, 4px)",
          }}
        >
          {description}
        </div>
      )}

      {/* Footer: assignee + priority */}
      {(assignee || priority) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "var(--sn-spacing-xs, 4px)",
          }}
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
    setItems(rawItems);
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
    (id: string) => items.find((item) => getCardId(item) === id),
    [items, getCardId],
  );

  // DnD handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(String(event.active.id));
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeItem = findItem(String(active.id));
      if (!activeItem) return;

      // Check if dragged over a column droppable (id: "column-{key}") or another card
      const overId = String(over.id);
      const overColumnKey = overId.startsWith("column-")
        ? config.columns.find((c) => `column-${c.key}` === overId)?.key
        : config.columns.find((c) => c.key === overId)?.key;
      if (overColumnKey) {
        // Dropped on column header — move to that column
        const currentCol = String(activeItem[columnField] ?? "");
        if (currentCol !== overColumnKey) {
          setItems((prev) =>
            prev.map((item) =>
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
          ? config.columns.find((c) => `column-${c.key}` === overId)?.key
          : config.columns.find((c) => c.key === overId)?.key) ??
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
          prev.map((item) =>
            getCardId(item) === String(active.id)
              ? { ...item, [columnField]: targetColumnKey }
              : item,
          ),
        );
      }

      // Get position in target column
      const targetColItems = items.filter(
        (i) =>
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

  // Column content renderer (shared between sortable and static)
  const renderColumn = (col: (typeof config.columns)[number]) => {
    const colItems = grouped.get(col.key) ?? [];
    const isOverLimit = col.limit != null && colItems.length > col.limit;
    const accentColor = col.color ?? "muted";
    const cardIds = colItems.map(getCardId);

    return (
      <div
        key={col.key}
        data-kanban-column={col.key}
        style={{
          minWidth: "min(280px, 85vw)",
          maxWidth: "min(320px, 85vw)",
          flex: "0 0 min(280px, 85vw)",
          backgroundColor: "var(--sn-color-secondary, #f8fafc)",
          borderRadius: "var(--sn-radius-md, 6px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Column header */}
        <div
          data-kanban-header
          style={{
            borderTop: `3px solid ${colorVar(accentColor)}`,
            padding:
              "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 8px)",
          }}
        >
          <span
            style={{
              fontWeight:
                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: isOverLimit
                ? "var(--sn-color-destructive, #ef4444)"
                : undefined,
            }}
          >
            {col.title}
          </span>
          <span
            data-kanban-count
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              backgroundColor: isOverLimit
                ? "var(--sn-color-destructive, #ef4444)"
                : "var(--sn-color-muted, #e5e7eb)",
              color: isOverLimit
                ? "var(--sn-color-destructive-foreground, #fff)"
                : "var(--sn-color-muted-foreground, #64748b)",
              borderRadius: "var(--sn-radius-full, 9999px)",
              padding: "0 var(--sn-spacing-xs, 4px)",
              minWidth: "1.5em",
              textAlign: "center",
              display: "inline-block",
            }}
          >
            {colItems.length}
            {col.limit != null ? `/${col.limit}` : ""}
          </span>
        </div>

        {/* Column body — droppable when sortable so empty columns accept drops */}
        {sortable ? (
          <DroppableColumnBody
            columnKey={col.key}
            style={{
              padding:
                "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px) var(--sn-spacing-sm, 8px)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sn-spacing-sm, 8px)",
              flex: 1,
              overflowY: "auto",
              minHeight: "80px",
            }}
          >
            {isLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {!isLoading && !error && colItems.length === 0 && (
              <div
                data-kanban-empty
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #94a3b8)",
                  textAlign: "center",
                  padding: "var(--sn-spacing-md, 12px)",
                }}
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
            style={{
              padding:
                "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px) var(--sn-spacing-sm, 8px)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sn-spacing-sm, 8px)",
              flex: 1,
              overflowY: "auto",
              minHeight: "60px",
            }}
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
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #94a3b8)",
                  textAlign: "center",
                  padding: "var(--sn-spacing-md, 12px)",
                }}
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
                  config={config}
                  execute={execute}
                />
              ))}
          </div>
        )}
      </div>
    );
  };

  const board = (
    <div
      data-snapshot-component="kanban"
      data-testid="kanban"
      className={config.className}
      style={{
        display: "flex",
        gap: "var(--sn-spacing-md, 12px)",
        overflowX: "auto",
        padding: "var(--sn-spacing-sm, 8px) 0",
        ...(config.style as React.CSSProperties),
      }}
    >
      {config.columns.map(renderColumn)}
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
