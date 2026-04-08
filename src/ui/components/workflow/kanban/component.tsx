import React from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import type { KanbanConfig } from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Map semantic color names to CSS variable references. */
const colorVar = (color: string): string =>
  `var(--sn-color-${color}, currentColor)`;

/** Priority dot color mapping. */
const priorityColorMap: Record<string, string> = {
  high: "var(--sn-color-destructive, #ef4444)",
  medium: "var(--sn-color-warning, #f59e0b)",
  low: "var(--sn-color-info, #3b82f6)",
};

/** Get initials from a name string. */
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

// ── Main component ─────────────────────────────────────────────────────────

/**
 * Config-driven Kanban board component.
 *
 * Renders a horizontal scrollable row of columns, each containing cards
 * sorted by a configurable status/column field. Supports card click actions,
 * assignee avatars, priority indicators, and column WIP limits.
 *
 * Publishes its data via `id` when set.
 *
 * @param props - Component props containing the Kanban configuration
 */
export function Kanban({ config }: { config: KanbanConfig }) {
  const { data, isLoading, error } = useComponentData(
    config.data ?? "",
    undefined,
  );
  const execute = useActionExecutor();

  const columnField = config.columnField ?? "status";
  const titleField = config.titleField ?? "title";

  // Extract items array from response
  const items: Record<string, unknown>[] = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    // Try common response shapes
    for (const key of ["data", "items", "results"]) {
      if (Array.isArray(data[key])) return data[key] as Record<string, unknown>[];
    }
    return [];
  })();

  // Group items by column
  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const col of config.columns) {
    grouped.set(col.key, []);
  }
  for (const item of items) {
    const colKey = String(item[columnField] ?? "");
    const list = grouped.get(colKey);
    if (list) {
      list.push(item);
    }
  }

  return (
    <div
      data-snapshot-component="kanban"
      className={config.className}
      style={{
        display: "flex",
        gap: "var(--sn-spacing-md, 12px)",
        overflowX: "auto",
        padding: "var(--sn-spacing-sm, 8px) 0",
      }}
    >
      {config.columns.map((col) => {
        const colItems = grouped.get(col.key) ?? [];
        const isOverLimit = col.limit != null && colItems.length > col.limit;
        const accentColor = col.color ?? "muted";

        return (
          <div
            key={col.key}
            data-kanban-column={col.key}
            style={{
              minWidth: "min(280px, 85vw)",
              maxWidth: "320px",
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
                padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
                display: "flex",
                alignItems: "center",
                gap: "var(--sn-spacing-sm, 8px)",
              }}
            >
              <span
                style={{
                  fontWeight: "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
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

            {/* Column body */}
            <div
              data-kanban-body
              style={{
                padding: "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px) var(--sn-spacing-sm, 8px)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--sn-spacing-sm, 8px)",
                flex: 1,
                overflowY: "auto",
              }}
            >
              {/* Loading state */}
              {isLoading && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}

              {/* Error state */}
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

              {/* Empty state */}
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

              {/* Cards */}
              {!isLoading &&
                !error &&
                colItems.map((item, idx) => {
                  const id = item["id"];
                  const cardKey =
                    typeof id === "string" || typeof id === "number"
                      ? id
                      : idx;
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
                      key={cardKey}
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
                          "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
                        cursor: config.cardAction ? "pointer" : "default",
                        transition: "box-shadow 150ms ease",
                      }}
                    >
                      {/* Card title */}
                      <div
                        style={{
                          fontWeight: "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                          fontSize: "var(--sn-font-size-sm, 0.875rem)",
                          color: "var(--sn-color-foreground, #0f172a)",
                          marginBottom: description
                            ? "var(--sn-spacing-xs, 4px)"
                            : undefined,
                        }}
                      >
                        {title}
                      </div>

                      {/* Card description */}
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

                      {/* Card footer: assignee + priority */}
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
                                backgroundColor:
                                  "var(--sn-color-primary, #2563eb)",
                                color:
                                  "var(--sn-color-primary-foreground, #fff)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                                fontWeight: "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
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
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
