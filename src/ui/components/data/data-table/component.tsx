import React, { useMemo } from "react";
import { useDataTable } from "./hook";
import { useActionExecutor } from "../../../actions/executor";
import type { DataTableConfig, ResolvedColumn } from "./types";

// ── Formatting helpers ──────────────────────────────────────────────────────

function formatCellValue(
  value: unknown,
  column: ResolvedColumn,
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
        blue: { bg: "var(--sn-color-info, oklch(0.546 0.245 262.881))", fg: "var(--sn-color-info-foreground, #fff)" },
        green: { bg: "var(--sn-color-success, oklch(0.586 0.209 145.071))", fg: "var(--sn-color-success-foreground, #fff)" },
        red: { bg: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))", fg: "var(--sn-color-destructive-foreground, #fff)" },
        gray: { bg: "var(--sn-color-muted, oklch(0.97 0 0))", fg: "var(--sn-color-muted-foreground, #64748b)" },
        yellow: { bg: "var(--sn-color-warning, oklch(0.681 0.162 75.834))", fg: "var(--sn-color-warning-foreground, #fff)" },
        success: { bg: "var(--sn-color-success, oklch(0.586 0.209 145.071))", fg: "var(--sn-color-success-foreground, #fff)" },
        warning: { bg: "var(--sn-color-warning, oklch(0.681 0.162 75.834))", fg: "var(--sn-color-warning-foreground, #fff)" },
        info: { bg: "var(--sn-color-info, oklch(0.546 0.245 262.881))", fg: "var(--sn-color-info-foreground, #fff)" },
        destructive: { bg: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))", fg: "var(--sn-color-destructive-foreground, #fff)" },
        muted: { bg: "var(--sn-color-muted, oklch(0.97 0 0))", fg: "var(--sn-color-muted-foreground, #64748b)" },
        primary: { bg: "var(--sn-color-primary, oklch(0.205 0 0))", fg: "var(--sn-color-primary-foreground, #fff)" },
        secondary: { bg: "var(--sn-color-secondary, oklch(0.97 0 0))", fg: "var(--sn-color-secondary-foreground, #0f172a)" },
        accent: { bg: "var(--sn-color-accent, oklch(0.97 0 0))", fg: "var(--sn-color-accent-foreground, #0f172a)" },
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
    default:
      return String(value);
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
                  opacity: 0.5,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
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
  const density = config.density ?? "default";
  const cellPadding = getDensityPadding(density);

  // Determine if we need an actions column
  const hasActions = (config.actions?.length ?? 0) > 0;

  // Column count for skeleton and colSpan
  const totalColumns =
    table.columns.length + (config.selectable ? 1 : 0) + (hasActions ? 1 : 0);

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

  // Bulk actions toolbar
  const showBulkActions =
    config.bulkActions &&
    config.bulkActions.length > 0 &&
    table.selectedIds.length > 0;

  return (
    <div data-snapshot-component="data-table" className={config.className}>
      {/* Search bar */}
      {config.searchable && (
        <div
          data-table-search
          style={{ marginBottom: "var(--sn-spacing-md, 12px)" }}
        >
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={table.search}
            onChange={(e) => table.setSearch(e.target.value)}
            aria-label="Search table"
            style={{
              padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
              borderRadius: "var(--sn-radius-md, 6px)",
              border: "1px solid var(--sn-color-border, #d1d5db)",
              width: "100%",
              maxWidth: "min(320px, 100%)",
            }}
          />
        </div>
      )}

      {/* Bulk actions toolbar */}
      {showBulkActions && (
        <div
          data-table-bulk-actions
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
          }}
        >
          <span>{table.selectedIds.length} selected</span>
          {config.bulkActions!.map((bulkAction, i) => (
            <button
              key={i}
              data-bulk-action
              onClick={() =>
                void execute(bulkAction.action, {
                  selectedRows: table.selectedRows,
                  selectedIds: table.selectedIds,
                  count: table.selectedIds.length,
                })
              }
              style={{ cursor: "pointer" }}
            >
              {bulkAction.label.replace(
                "{count}",
                String(table.selectedIds.length),
              )}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "auto",
        }}
      >
        <thead>
          <tr>
            {/* Select all checkbox */}
            {config.selectable && (
              <th style={{ padding: cellPadding, width: "40px" }}>
                <input
                  type="checkbox"
                  onChange={() => table.toggleAll()}
                  checked={
                    table.rows.length > 0 &&
                    table.rows.every((row, i) => {
                      const id = (row as Record<string, unknown>)["id"];
                      const rowId =
                        typeof id === "string" || typeof id === "number"
                          ? id
                          : i;
                      return table.selection.has(rowId);
                    })
                  }
                  aria-label="Select all rows"
                />
              </th>
            )}

            {/* Column headers */}
            {table.columns.map((col) => (
              <th
                key={col.field}
                style={{
                  padding: cellPadding,
                  textAlign: col.align ?? "left",
                  cursor: col.sortable ? "pointer" : "default",
                  width: col.width,
                  userSelect: "none",
                }}
                onClick={
                  col.sortable
                    ? () => table.setSortColumn(col.field)
                    : undefined
                }
                aria-sort={
                  table.sort?.column === col.field
                    ? table.sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.label}
                {col.sortable && (
                  <SortIndicator column={col.field} sort={table.sort} />
                )}
              </th>
            ))}

            {/* Actions column header */}
            {hasActions && (
              <th style={{ padding: cellPadding, textAlign: "right" }}>
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {/* Loading state */}
          {table.isLoading && (
            <SkeletonRows columnCount={totalColumns} rowCount={5} />
          )}

          {/* Error state */}
          {table.error && (
            <tr>
              <td
                colSpan={totalColumns}
                style={{ padding: cellPadding, textAlign: "center" }}
              >
                <div data-table-error role="alert">
                  Error: {table.error.message}
                </div>
              </td>
            </tr>
          )}

          {/* Empty state */}
          {!table.isLoading && !table.error && table.rows.length === 0 && (
            <tr>
              <td
                colSpan={totalColumns}
                style={{ padding: cellPadding, textAlign: "center" }}
              >
                <div data-table-empty>
                  {config.emptyMessage ?? "No data available"}
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!table.isLoading &&
            !table.error &&
            table.rows.map((row, rowIndex) => {
              const rowRecord = row as Record<string, unknown>;
              const id = rowRecord["id"];
              const rowId =
                typeof id === "string" || typeof id === "number"
                  ? id
                  : rowIndex;

              return (
                <tr
                  key={rowId}
                  data-selected={table.selection.has(rowId) ? "" : undefined}
                  style={{
                    backgroundColor: table.selection.has(rowId)
                      ? "var(--sn-color-accent, #dbeafe)"
                      : undefined,
                  }}
                >
                  {/* Row selection checkbox */}
                  {config.selectable && (
                    <td style={{ padding: cellPadding, width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={table.selection.has(rowId)}
                        onChange={() => table.toggleRow(rowId)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {table.columns.map((col) => (
                    <td
                      key={col.field}
                      style={{
                        padding: cellPadding,
                        textAlign: col.align ?? "left",
                      }}
                    >
                      {formatCellValue(rowRecord[col.field], col)}
                    </td>
                  ))}

                  {/* Row action buttons */}
                  {hasActions && (
                    <td style={{ padding: cellPadding, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--sn-spacing-xs, 4px)",
                          justifyContent: "flex-end",
                        }}
                      >
                        {config.actions!.map((action, actionIndex) => {
                          // Handle visibility
                          if (action.visible === false) return null;
                          // FromRef visibility would need useSubscribe, but for now handle boolean
                          if (
                            typeof action.visible === "boolean" &&
                            !action.visible
                          )
                            return null;

                          return (
                            <button
                              key={actionIndex}
                              data-row-action
                              onClick={() =>
                                void execute(action.action, {
                                  row: rowRecord,
                                  ...rowRecord,
                                })
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
      </div>

      {/* Pagination controls */}
      {table.pagination && table.pagination.totalPages > 1 && (
        <div
          data-table-pagination
          role="navigation"
          aria-label="Table pagination"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sn-spacing-sm, 8px) 0",
            marginTop: "var(--sn-spacing-sm, 8px)",
          }}
        >
          <span>
            Page {table.pagination.currentPage} of {table.pagination.totalPages}
          </span>
          <div style={{ display: "flex", gap: "var(--sn-spacing-xs, 4px)" }}>
            <button
              onClick={() => table.prevPage()}
              disabled={table.pagination!.currentPage <= 1}
              aria-label="Previous page"
              data-testid="table-pagination-prev"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={
                table.pagination!.currentPage >= table.pagination!.totalPages
              }
              aria-label="Next page"
              data-testid="table-pagination-next"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
