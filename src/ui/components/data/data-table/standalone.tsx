'use client';

import React, { useCallback, useMemo, useState, type ReactNode } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DataTableBaseColumn {
  /** Data field key in the row object. */
  field: string;
  /** Column header label. */
  label: string;
  /** Whether this column is sortable. */
  sortable?: boolean;
  /** Display format for cell values. */
  format?:
    | "date"
    | "number"
    | "currency"
    | "badge"
    | "boolean"
    | "avatar"
    | "progress"
    | "link"
    | "code";
  /** Badge color mapping keyed by cell value. */
  badgeColors?: Record<string, string>;
  /** Field key for the avatar image source. */
  avatarField?: string;
  /** Field key for link display text. */
  linkTextField?: string;
  /** Divisor for currency formatting (e.g. 100 for cents-to-dollars). */
  divisor?: number;
  /** Prefix prepended to formatted values. */
  prefix?: string;
  /** Suffix appended to formatted values. */
  suffix?: string;
  /** CSS width for the column. */
  width?: string;
  /** Text alignment for the column. */
  align?: "left" | "center" | "right";
}

export interface DataTableBasePagination {
  /** Current page number (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Number of rows per page. */
  pageSize: number;
  /** Total number of rows across all pages. */
  totalRows: number;
}

export interface DataTableBaseSort {
  /** The column field being sorted. */
  column: string;
  /** Sort direction. */
  direction: "asc" | "desc";
}

export interface DataTableBaseRowAction {
  /** Action button label. */
  label: string;
  /** Optional icon name. */
  icon?: string;
  /** Button variant (e.g. "destructive"). */
  variant?: string;
  /** Callback invoked with the row data. */
  onAction: (row: Record<string, unknown>) => void;
}

export interface DataTableBaseBulkAction {
  /** Action button label (may contain "{count}" placeholder). */
  label: string;
  /** Optional icon name. */
  icon?: string;
  /** Button variant (e.g. "destructive"). */
  variant?: string;
  /** Callback invoked with all selected rows. */
  onAction: (rows: Record<string, unknown>[]) => void;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface DataTableBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Column definitions. */
  columns: DataTableBaseColumn[];
  /** Row data. */
  rows: Record<string, unknown>[];
  /** Sort state. */
  sort?: DataTableBaseSort | null;
  /** Callback when sort changes. */
  onSortChange?: (column: string) => void;
  /** Pagination state. */
  pagination?: DataTableBasePagination | null;
  /** Callback to go to a page. */
  onPageChange?: (page: number) => void;
  /** Whether row selection is enabled. */
  selectable?: boolean;
  /** Selected row IDs. */
  selection?: Set<string | number>;
  /** Toggle row selection. */
  onToggleRow?: (id: string | number) => void;
  /** Toggle all row selection. */
  onToggleAll?: () => void;
  /** Row ID field. */
  rowIdField?: string;
  /** Whether search is enabled. */
  searchable?: boolean;
  /** Search input placeholder text. */
  searchPlaceholder?: string;
  /** Current search query. */
  search?: string;
  /** Callback when search changes. */
  onSearchChange?: (query: string) => void;
  /** Row actions. */
  rowActions?: DataTableBaseRowAction[];
  /** Bulk actions. */
  bulkActions?: DataTableBaseBulkAction[];
  /** Selected rows for bulk actions. */
  selectedRows?: Record<string, unknown>[];
  /** Whether data is loading. */
  isLoading?: boolean;
  /** Error message. */
  error?: string | null;
  /** Empty state message. */
  emptyMessage?: string;
  /** Whether new data is available. */
  hasNewData?: boolean;
  /** Callback to refresh data. */
  onRefresh?: () => void;
  /** Callback when a row is clicked. */
  onRowClick?: (row: Record<string, unknown>) => void;
  /** Whether the table is striped. */
  striped?: boolean;
  /** Whether the table has hoverable rows. */
  hoverable?: boolean;
  /** Whether the table is compact. */
  compact?: boolean;
  /** Custom loading content. */
  loadingContent?: ReactNode;
  /** Custom error content. */
  errorContent?: ReactNode;
  /** Custom empty content. */
  emptyContent?: ReactNode;
  /** Custom toolbar content rendered above the table. */
  toolbarContent?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, headerCell, pagination). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Formatting helpers ──────────────────────────────────────────────────────

const BADGE_COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  blue: { bg: "var(--sn-color-info, #3b82f6)", fg: "var(--sn-color-info-foreground, #fff)" },
  green: { bg: "var(--sn-color-success, #22c55e)", fg: "var(--sn-color-success-foreground, #fff)" },
  red: { bg: "var(--sn-color-destructive, #dc2626)", fg: "var(--sn-color-destructive-foreground, #fff)" },
  gray: { bg: "var(--sn-color-muted, #e5e7eb)", fg: "var(--sn-color-muted-foreground, #64748b)" },
  yellow: { bg: "var(--sn-color-warning, #d97706)", fg: "var(--sn-color-warning-foreground, #fff)" },
  success: { bg: "var(--sn-color-success, #22c55e)", fg: "var(--sn-color-success-foreground, #fff)" },
  warning: { bg: "var(--sn-color-warning, #d97706)", fg: "var(--sn-color-warning-foreground, #fff)" },
  info: { bg: "var(--sn-color-info, #3b82f6)", fg: "var(--sn-color-info-foreground, #fff)" },
  destructive: { bg: "var(--sn-color-destructive, #dc2626)", fg: "var(--sn-color-destructive-foreground, #fff)" },
  muted: { bg: "var(--sn-color-muted, #e5e7eb)", fg: "var(--sn-color-muted-foreground, #64748b)" },
  primary: { bg: "var(--sn-color-primary, #111827)", fg: "var(--sn-color-primary-foreground, #fff)" },
  secondary: { bg: "var(--sn-color-secondary, #f3f4f6)", fg: "var(--sn-color-secondary-foreground, #0f172a)" },
};

function getFieldValue(row: Record<string, unknown>, path: string): unknown {
  return row[path];
}

function formatCellValue(
  value: unknown,
  column: DataTableBaseColumn,
  row?: Record<string, unknown>,
): React.ReactNode {
  if (value == null) return "\u2014";

  // Apply prefix/suffix
  const addPrefixSuffix = (content: React.ReactNode): React.ReactNode => {
    if (!column.prefix && !column.suffix) return content;
    return <>{column.prefix}{content}{column.suffix}</>;
  };

  switch (column.format) {
    case "date": {
      try {
        return addPrefixSuffix(new Intl.DateTimeFormat().format(new Date(String(value))));
      } catch {
        return addPrefixSuffix(String(value));
      }
    }
    case "number": {
      if (typeof value === "number") return addPrefixSuffix(new Intl.NumberFormat().format(value));
      return addPrefixSuffix(String(value));
    }
    case "currency": {
      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isNaN(numericValue)) {
        const divisor = column.divisor;
        const adjusted = divisor && divisor !== 1 ? numericValue / divisor : numericValue;
        return addPrefixSuffix(
          new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(adjusted),
        );
      }
      return addPrefixSuffix(String(value));
    }
    case "badge": {
      const colorName = column.badgeColors?.[String(value)] ?? "muted";
      const colors = BADGE_COLOR_MAP[colorName] ?? BADGE_COLOR_MAP.muted!;
      return (
        <span
          data-badge=""
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
          {String(value).replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      );
    }
    case "boolean":
      return value ? "\u2713" : "\u2717";
    case "avatar": {
      const src = column.avatarField && row
        ? String(getFieldValue(row, column.avatarField) ?? "")
        : "";
      const name = String(value);
      const initials = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sn-spacing-xs, 0.25rem)" }}>
          {src ? (
            <img
              src={src}
              alt={name}
              style={{ width: "1.5rem", height: "1.5rem", borderRadius: "var(--sn-radius-full, 9999px)", objectFit: "cover" }}
            />
          ) : (
            <span style={{
              width: "1.5rem", height: "1.5rem", borderRadius: "var(--sn-radius-full, 9999px)",
              backgroundColor: "var(--sn-color-primary, #2563eb)", color: "var(--sn-color-primary-foreground, #fff)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--sn-font-size-xs, 0.625rem)", fontWeight: "var(--sn-font-weight-semibold, 600)" as unknown as number,
            }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sn-spacing-sm, 0.5rem)" }}>
          <div style={{
            flex: 1, height: "var(--sn-spacing-2xs, 6px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            borderRadius: "var(--sn-radius-full, 9999px)", overflow: "hidden",
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%",
              backgroundColor: pct >= 100 ? "var(--sn-color-success, #22c55e)" : "var(--sn-color-primary, #2563eb)",
              borderRadius: "var(--sn-radius-full, 9999px)",
              transition: "width var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
            }} />
          </div>
          <span style={{ fontSize: "var(--sn-font-size-xs, 0.75rem)", color: "var(--sn-color-muted-foreground, #6b7280)", minWidth: "2.5em", textAlign: "right" }}>
            {Math.round(pct)}%
          </span>
        </div>
      );
    }
    case "link": {
      const url = String(value);
      const text = column.linkTextField && row
        ? String(getFieldValue(row, column.linkTextField) ?? url)
        : url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--sn-color-info, #3b82f6)", textDecoration: "underline" }}
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </a>
      );
    }
    case "code":
      return (
        <code style={{
          fontFamily: "var(--sn-font-mono, monospace)", fontSize: "var(--sn-font-size-xs, 0.75rem)",
          backgroundColor: "var(--sn-color-secondary, #f3f4f6)", padding: "var(--sn-spacing-2xs, 1px) var(--sn-spacing-xs, 0.25rem)",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
        }}>
          {String(value)}
        </code>
      );
    default:
      return addPrefixSuffix(String(value));
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone DataTable — feature-rich data table with sorting, pagination,
 * selection, and search. No manifest context required.
 *
 * @example
 * ```tsx
 * <DataTableBase
 *   columns={[
 *     { field: "name", label: "Name", sortable: true },
 *     { field: "status", label: "Status", format: "badge", badgeColors: { active: "green", inactive: "gray" } },
 *     { field: "revenue", label: "Revenue", format: "currency", divisor: 100 },
 *   ]}
 *   rows={[{ id: 1, name: "Acme", status: "active", revenue: 150000 }]}
 *   searchable
 *   selectable
 * />
 * ```
 */
export function DataTableBase({
  id,
  columns,
  rows,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  selectable = false,
  selection,
  onToggleRow,
  onToggleAll,
  rowIdField = "id",
  searchable = false,
  searchPlaceholder = "Search...",
  search,
  onSearchChange,
  rowActions,
  bulkActions,
  selectedRows,
  isLoading = false,
  error,
  emptyMessage = "No data available",
  hasNewData = false,
  onRefresh,
  onRowClick,
  striped = false,
  hoverable = true,
  compact = false,
  loadingContent,
  errorContent,
  emptyContent,
  toolbarContent,
  className,
  style,
  slots,
}: DataTableBaseProps) {
  const rootId = id ?? "data-table";
  const cellPadding = compact
    ? "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)"
    : "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      overflow: "hidden",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "var(--sn-radius-md, 0.5rem)",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  const paginationSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pagination`,
    componentSurface: slots?.pagination,
  });

  const resolveHeaderCellSurface = (
    surfaceId: string,
    baseStyle: Record<string, string | number | undefined>,
  ) => {
    return resolveSurfacePresentation({
      surfaceId,
      implementationBase: {
        style: baseStyle,
      },
      componentSurface: slots?.headerCell,
    });
  };

  const allSelected = rows.length > 0 && selection && rows.every((row) => {
    const rowId = row[rowIdField];
    return rowId != null && selection.has(rowId as string | number);
  });

  return (
    <div
      data-snapshot-component="data-table"
      data-testid="data-table"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {/* Toolbar: search + bulk actions + live banner */}
      {(searchable || hasNewData || (bulkActions && selectedRows && selectedRows.length > 0)) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          }}
        >
          {searchable && (
            <div style={{ flex: "1 1 200px", maxWidth: "320px" }}>
              <InputControl
                type="text"
                value={search ?? ""}
                onChangeText={onSearchChange ?? (() => {})}
                placeholder={searchPlaceholder}
                testId="data-table-search"
                surfaceId={`${rootId}-search`}
              />
            </div>
          )}

          {bulkActions && selectedRows && selectedRows.length > 0 && (
            <div role="toolbar" aria-label="Bulk actions" style={{ display: "flex", gap: "var(--sn-spacing-xs, 0.25rem)" }}>
              {bulkActions.map((action, index) => (
                <ButtonControl
                  key={`${action.label}-${index}`}
                  variant={action.variant === "destructive" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => action.onAction(selectedRows)}
                >
                  {action.icon ? <Icon name={action.icon} size={14} /> : null}
                  <span>{action.label.replace("{count}", String(selectedRows.length))}</span>
                </ButtonControl>
              ))}
            </div>
          )}

          {hasNewData && (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sn-spacing-xs, 0.25rem)", marginLeft: "auto" }}>
              <span style={{ fontSize: "var(--sn-font-size-sm, 0.875rem)", color: "var(--sn-color-muted-foreground, #6b7280)" }}>
                New data available
              </span>
              <ButtonControl variant="outline" size="sm" onClick={onRefresh}>
                Refresh
              </ButtonControl>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      {toolbarContent}

      {/* Loading */}
      {isLoading && (
        loadingContent ?? (
          <div
            data-testid="data-table-loading"
            style={{
              padding: "var(--sn-spacing-xl, 2rem)",
              textAlign: "center",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            Loading...
          </div>
        )
      )}

      {/* Error */}
      {!isLoading && error && (
        errorContent ?? (
          <div
            data-testid="data-table-error"
            role="alert"
            style={{
              padding: "var(--sn-spacing-xl, 2rem)",
              textAlign: "center",
              color: "var(--sn-color-destructive, #dc2626)",
            }}
          >
            {error}
          </div>
        )
      )}

      {/* Empty */}
      {!isLoading && !error && rows.length === 0 && (
        emptyContent ?? (
          <div
            data-testid="data-table-empty"
            style={{
              padding: "var(--sn-spacing-xl, 2rem)",
              textAlign: "center",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {emptyMessage}
          </div>
        )
      )}

      {/* Table */}
      {!isLoading && !error && rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                  backgroundColor: "var(--sn-color-muted, #f9fafb)",
                }}
              >
                {selectable && (() => {
                  const selectSurface = resolveHeaderCellSurface(
                    `${rootId}-header-cell-select`,
                    { padding: cellPadding, width: "40px", textAlign: "center" },
                  );
                  return (
                    <th
                      data-snapshot-id={`${rootId}-header-cell-select`}
                      className={selectSurface.className}
                      style={selectSurface.style}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onToggleAll}
                        aria-label="Select all rows"
                      />
                    </th>
                  );
                })()}
                {columns.map((col) => {
                  const headerSurface = resolveHeaderCellSurface(
                    `${rootId}-header-cell-${col.field}`,
                    {
                      padding: cellPadding,
                      textAlign: col.align ?? "left",
                      fontWeight: "var(--sn-font-weight-semibold, 600)" as unknown as number,
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                      cursor: col.sortable && onSortChange ? "pointer" : undefined,
                      userSelect: "none",
                      width: col.width,
                      whiteSpace: "nowrap",
                    },
                  );
                  return (
                    <th
                      key={col.field}
                      data-snapshot-id={`${rootId}-header-cell-${col.field}`}
                      className={headerSurface.className}
                      style={headerSurface.style}
                      onClick={col.sortable && onSortChange ? () => onSortChange(col.field) : undefined}
                      aria-sort={col.sortable ? (sort?.column === col.field ? (sort.direction === "asc" ? "ascending" : "descending") : "none") : undefined}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sn-spacing-2xs, 0.125rem)" }}>
                        {col.label}
                        {col.sortable && sort?.column === col.field && (
                          <span aria-label={sort.direction === "asc" ? "sorted ascending" : "sorted descending"}>
                            {sort.direction === "asc" ? "\u25B2" : "\u25BC"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
                {rowActions && rowActions.length > 0 && (() => {
                  const actionsSurface = resolveHeaderCellSurface(
                    `${rootId}-header-cell-actions`,
                    { padding: cellPadding, width: "auto", textAlign: "right" },
                  );
                  return (
                    <th
                      data-snapshot-id={`${rootId}-header-cell-actions`}
                      className={actionsSurface.className}
                      style={actionsSurface.style}
                    >
                      <span style={{ color: "var(--sn-color-muted-foreground, #6b7280)" }}>Actions</span>
                    </th>
                  );
                })()}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const rowId = row[rowIdField] as string | number | undefined;
                const isSelected = rowId != null && selection?.has(rowId);
                return (
                  <tr
                    key={rowId ?? rowIndex}
                    data-testid="data-table-row"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{
                      borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                      cursor: onRowClick ? "pointer" : undefined,
                      backgroundColor: isSelected
                        ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 5%, var(--sn-color-card, #fff))"
                        : striped && rowIndex % 2 === 1
                          ? "var(--sn-color-muted, #f9fafb)"
                          : undefined,
                      transition: hoverable ? "background-color var(--sn-duration-fast, 150ms)" : undefined,
                    }}
                    onMouseEnter={
                      hoverable
                        ? (e) => {
                            if (!isSelected) {
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                "var(--sn-color-accent, #f3f4f6)";
                            }
                          }
                        : undefined
                    }
                    onMouseLeave={
                      hoverable
                        ? (e) => {
                            if (!isSelected) {
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                striped && rowIndex % 2 === 1
                                  ? "var(--sn-color-muted, #f9fafb)"
                                  : "";
                            }
                          }
                        : undefined
                    }
                  >
                    {selectable && (
                      <td style={{ padding: cellPadding, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected ?? false}
                          onChange={() => rowId != null && onToggleRow?.(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select row ${rowId ?? rowIndex}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const rawValue = getFieldValue(row, col.field);
                      return (
                        <td
                          key={col.field}
                          style={{
                            padding: cellPadding,
                            textAlign: col.align ?? "left",
                            color: "var(--sn-color-foreground, #111827)",
                          }}
                        >
                          {formatCellValue(rawValue, col, row)}
                        </td>
                      );
                    })}
                    {rowActions && rowActions.length > 0 && (
                      <td style={{ padding: cellPadding, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "var(--sn-spacing-2xs, 0.125rem)", justifyContent: "flex-end" }}>
                          {rowActions.map((action, actionIndex) => (
                            <ButtonControl
                              key={`${action.label}-${actionIndex}`}
                              variant="ghost"
                              size="sm"
                              ariaLabel={action.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onAction(row);
                              }}
                            >
                              {action.icon ? <Icon name={action.icon} size={14} /> : null}
                              <span>{action.label}</span>
                            </ButtonControl>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          data-snapshot-id={`${rootId}-pagination`}
          className={paginationSurface.className}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            ...paginationSurface.style,
          }}
        >
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div style={{ display: "flex", gap: "var(--sn-spacing-xs, 0.25rem)" }}>
            <ButtonControl
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </ButtonControl>
            <ButtonControl
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </ButtonControl>
          </div>
        </div>
      )}

      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
