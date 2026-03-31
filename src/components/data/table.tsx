import { useMemo, useState } from "react";
import type { ApiClient } from "../../api/client";
import { token } from "../../tokens/utils";
import { useDataSource } from "../data-binding";
import { usePublishValue } from "../page-context";
import type { ColumnConfig, TableConfig } from "./table.schema";

interface TableProps {
  config: TableConfig;
  api: ApiClient;
  id?: string;
}

/**
 * Config-driven data table.
 *
 * Fetches data from an API endpoint, renders columns (auto-detected or explicit),
 * supports sorting, pagination, empty state, and row selection.
 *
 * The selected row is published to the page context via the component ID.
 */
export function Table({ config, api, id }: TableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRow, setSelectedRow] = useState<unknown>(null);

  const { data, isLoading, isError, error } = useDataSource(api, {
    source: config.data,
    pagination: config.pagination,
  });

  // Publish selected row to page context
  usePublishValue(id, selectedRow);

  // Resolve rows from data (handles array or paginated envelope)
  const rows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    if (typeof data === "object" && "data" in (data as Record<string, unknown>)) {
      return (data as Record<string, unknown>).data as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  // Auto-detect columns from first row if columns is "auto" or undefined
  const columns: ColumnConfig[] = useMemo(() => {
    if (config.columns && config.columns !== "auto") return config.columns;
    if (rows.length === 0) return [];
    const firstRow = rows[0]!;
    return Object.keys(firstRow).map((field) => ({
      field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
    }));
  }, [config.columns, rows]);

  // Sort rows client-side
  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortField, sortDir]);

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: token("spacing.8"),
          textAlign: "center",
          color: token("colors.muted-foreground"),
        }}
      >
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          padding: token("spacing.8"),
          textAlign: "center",
          color: token("colors.destructive"),
        }}
      >
        Error: {error?.message ?? "Failed to load data"}
      </div>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <div
        style={{
          padding: token("spacing.8"),
          textAlign: "center",
          color: token("colors.muted-foreground"),
        }}
      >
        {config.emptyState ?? "No data"}
      </div>
    );
  }

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: token("typography.fontSize.sm"),
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: `${token("spacing.3")} ${token("spacing.4")}`,
    borderBottom: `1px solid ${token("colors.border")}`,
    fontWeight: token("typography.fontWeight.medium"),
    color: token("colors.muted-foreground"),
    fontSize: token("typography.fontSize.xs"),
    textTransform: "uppercase" as const,
    letterSpacing: token("typography.letterSpacing.wide"),
  };

  const tdStyle: React.CSSProperties = {
    padding: `${token("spacing.3")} ${token("spacing.4")}`,
    borderBottom: `1px solid ${token("colors.border")}`,
  };

  return (
    <div className={config.className} style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {config.selectable && <th style={{ ...thStyle, width: "40px" }} />}
            {columns
              .filter((c) => c.visible !== false)
              .map((col) => (
                <th
                  key={col.field}
                  style={{
                    ...thStyle,
                    width: col.width,
                    textAlign: col.align ?? "left",
                    cursor:
                      col.sortable !== false && config.sortable !== false ? "pointer" : undefined,
                    userSelect: "none",
                  }}
                  onClick={
                    col.sortable !== false && config.sortable !== false
                      ? () => handleSort(col.field)
                      : undefined
                  }
                >
                  {col.label ?? col.field}
                  {sortField === col.field && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            {config.actions && config.actions.length > 0 && (
              <th style={{ ...thStyle, width: "100px" }} />
            )}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr
              key={(row.id as string) ?? i}
              style={{
                backgroundColor: selectedRow === row ? token("colors.accent") : undefined,
                cursor: config.selectable ? "pointer" : undefined,
              }}
              onClick={
                config.selectable
                  ? () => setSelectedRow(row === selectedRow ? null : row)
                  : undefined
              }
            >
              {config.selectable && (
                <td style={tdStyle}>
                  <input type="checkbox" checked={selectedRow === row} readOnly />
                </td>
              )}
              {columns
                .filter((c) => c.visible !== false)
                .map((col) => (
                  <td key={col.field} style={{ ...tdStyle, textAlign: col.align ?? "left" }}>
                    {formatCellValue(row[col.field], col.format)}
                  </td>
                ))}
              {config.actions && config.actions.length > 0 && (
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {/* Actions rendered as data attributes for the action system to wire */}
                  {config.actions.map((action, ai) => (
                    <button
                      key={ai}
                      data-action={JSON.stringify({ ...action, row })}
                      style={{
                        padding: `${token("spacing.1")} ${token("spacing.2")}`,
                        fontSize: token("typography.fontSize.xs"),
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color:
                          action.variant === "destructive"
                            ? token("colors.destructive")
                            : token("colors.primary"),
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCellValue(value: unknown, format?: string): string {
  if (value == null) return "—";
  if (!format) return String(value);

  switch (format) {
    case "date":
      return new Date(value as string | number).toLocaleDateString();
    case "datetime":
      return new Date(value as string | number).toLocaleString();
    case "currency":
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(value as number);
    case "number":
      return new Intl.NumberFormat().format(value as number);
    case "percent":
      return `${(value as number).toFixed(1)}%`;
    case "boolean":
      return value ? "Yes" : "No";
    default:
      return String(value);
  }
}
