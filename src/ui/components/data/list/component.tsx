import React, { useState, useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import { Icon } from "../../../icons/index";
import {
  DndContext,
  SortableContext,
  closestCenter,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  useDndSensors,
  getSortableStyle,
} from "../../../hooks/use-drag-drop";
import type { DragEndEvent } from "../../../hooks/use-drag-drop";
import type { ListConfig, ListItemConfig } from "./types";
import type { ActionConfig, ActionExecuteFn } from "../../../actions/types";

/**
 * Badge pill component for list items.
 */
function ListBadge({ text, color }: { text: string; color?: string }) {
  const colorToken = color ?? "primary";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 var(--sn-spacing-xs, 0.25rem)",
        borderRadius: "var(--sn-radius-full, 9999px)",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)" as unknown as number,
        backgroundColor: `var(--sn-color-${colorToken}, #2563eb)`,
        color: `var(--sn-color-${colorToken}-foreground, #ffffff)`,
        lineHeight: 1.5,
      }}
    >
      {text}
    </span>
  );
}

/**
 * Skeleton placeholder row for loading state.
 */
function ListSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      }}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "0.75rem",
            width: "40%",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            marginBottom: "var(--sn-spacing-xs, 0.25rem)",
          }}
        />
        <div
          style={{
            height: "0.625rem",
            width: "60%",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Single list item renderer.
 */
function ListItem({
  item,
  selectable,
  showDivider,
  isCard,
  execute,
}: {
  item: ListItemConfig;
  selectable: boolean;
  showDivider: boolean;
  isCard: boolean;
  execute: (action: ActionConfig | ActionConfig[]) => Promise<void>;
}) {
  const isClickable = selectable && (item.action != null || item.href != null);

  const handleClick = () => {
    if (item.action) {
      void execute(item.action);
    }
  };

  const content = (
    <div
      data-testid="list-item"
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
        cursor: isClickable ? "pointer" : undefined,
        transition: `background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
        ...(isCard
          ? {
              border: "1px solid var(--sn-color-border, #e5e7eb)",
              borderRadius: "var(--sn-radius-md, 0.5rem)",
              boxShadow: "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
              backgroundColor: "var(--sn-color-card, #ffffff)",
            }
          : {}),
      }}
      onMouseEnter={
        isClickable
          ? (e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "var(--sn-color-accent, #f3f4f6)";
            }
          : undefined
      }
      onMouseLeave={
        isClickable
          ? (e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isCard
                ? "var(--sn-color-card, #ffffff)"
                : "";
            }
          : undefined
      }
    >
      {/* Icon */}
      {item.icon && (
        <span
          aria-hidden="true"
          style={{
            color: "var(--sn-color-muted-foreground, #6b7280)",
            flexShrink: 0,
          }}
        >
          <Icon name={item.icon} size={20} />
        </span>
      )}

      {/* Title + Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight:
              "var(--sn-font-weight-medium, 500)" as unknown as number,
            color: "var(--sn-color-foreground, #111827)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>
        {item.description && (
          <div
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.description}
          </div>
        )}
      </div>

      {/* Badge */}
      {item.badge && <ListBadge text={item.badge} color={item.badgeColor} />}
    </div>
  );

  return (
    <>
      {item.href && !item.action ? (
        <a
          href={item.href}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {content}
        </a>
      ) : (
        content
      )}
      {showDivider && (
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
          }}
        />
      )}
    </>
  );
}

/**
 * Sortable wrapper for list items when drag-and-drop is enabled.
 */
function SortableListItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = getSortableStyle(transform, transition, isDragging);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

/**
 * List component — renders a vertical list of items with optional
 * icons, descriptions, badges, and click actions.
 *
 * Supports both static items (via `items` config) and dynamic items
 * fetched from an API endpoint (via `data` config). Provides loading
 * skeletons and an empty state message.
 *
 * @param props.config - The list config from the manifest
 */
export function ListComponent({ config }: { config: ListConfig }) {
  const execute = useActionExecutor();
  const variant = config.variant ?? "default";
  const showDivider = config.divider !== false && variant !== "card";
  const selectable = config.selectable ?? false;
  const sortable = config.sortable ?? false;
  const emptyMessage = config.emptyMessage ?? "No items";

  // Fetch data if endpoint is provided
  const { data, isLoading, error } = useComponentData(config.data ?? "");

  // Resolve items: static config or mapped from data
  const hasEndpoint = config.data != null;
  let resolvedItems: ListItemConfig[] = [];
  if (!hasEndpoint && config.items) {
    resolvedItems = config.items;
  } else if (hasEndpoint && data) {
    const dataArray = Array.isArray(data)
      ? data
      : ((data as Record<string, unknown>).items ??
        (data as Record<string, unknown>).data ??
        []);
    if (Array.isArray(dataArray)) {
      resolvedItems = dataArray.map(
        (row: Record<string, unknown>): ListItemConfig => ({
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

  const containerStyle: React.CSSProperties =
    variant === "bordered"
      ? {
          border: "1px solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          overflow: "hidden",
        }
      : variant === "card"
        ? {
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          }
        : {};

  return (
    <div
      data-snapshot-component="list"
      data-testid="list"
      className={config.className}
      style={{ ...containerStyle, ...(config.style as React.CSSProperties) }}
    >
      <style>{`
[data-snapshot-component="list"] [data-testid="list-item"][role="button"]:focus { outline: none; }
[data-snapshot-component="list"] [data-testid="list-item"][role="button"]:focus-visible { outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb)); outline-offset: var(--sn-ring-offset, 2px); border-radius: var(--sn-radius-md, 0.5rem); }
      `}</style>
      {/* Loading state */}
      {isLoading && (
        <div data-testid="list-loading">
          {[0, 1, 2].map((i) => (
            <ListSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div
          data-testid="list-error"
          style={{
            padding: "var(--sn-spacing-md, 1rem)",
            color: "var(--sn-color-destructive, #dc2626)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            textAlign: "center",
          }}
        >
          {config.errorMessage ?? "Failed to load items"}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && resolvedItems.length === 0 && (
        <div
          data-testid="list-empty"
          style={{
            padding: "var(--sn-spacing-lg, 1.5rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            textAlign: "center",
          }}
        >
          {emptyMessage}
        </div>
      )}

      {/* Items */}
      {!isLoading && !error && sortable ? (
        <SortableListItems
          items={resolvedItems}
          selectable={selectable}
          showDivider={showDivider}
          isCard={variant === "card"}
          execute={execute}
          reorderAction={config.reorderAction}
        />
      ) : (
        !isLoading &&
        !error &&
        resolvedItems.map((item, index) => (
          <ListItem
            key={index}
            item={item}
            selectable={selectable}
            showDivider={showDivider && index < resolvedItems.length - 1}
            isCard={variant === "card"}
            execute={execute}
          />
        ))
      )}
    </div>
  );
}

/** Sortable list items wrapper with DnD context. */
function SortableListItems({
  items: initialItems,
  selectable,
  showDivider,
  isCard,
  execute,
  reorderAction,
}: {
  items: ListItemConfig[];
  selectable: boolean;
  showDivider: boolean;
  isCard: boolean;
  execute: ActionExecuteFn;
  reorderAction?: ActionConfig;
}) {
  const sensors = useDndSensors();
  const [items, setItems] = useState(initialItems);

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const itemIds = items.map((_, i) => `list-item-${i}`);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);

      if (reorderAction) {
        void execute(reorderAction, {
          fromIndex: oldIndex,
          toIndex: newIndex,
          item: items[oldIndex],
          items: reordered.map((it) => it.title),
        });
      }
    },
    [items, itemIds, execute, reorderAction],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <SortableListItem key={itemIds[index]} id={itemIds[index]!}>
            <ListItem
              item={item}
              selectable={selectable}
              showDivider={showDivider && index < items.length - 1}
              isCard={isCard}
              execute={execute}
            />
          </SortableListItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
