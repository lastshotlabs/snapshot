import { useState, useMemo, useCallback, useEffect, useContext } from "react";
import { useSubscribe } from "../../../context/hooks";
import { usePublish } from "../../../context/hooks";
import { isFromRef } from "../../../context/utils";
import { SnapshotApiContext } from "../../../actions/executor";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime } from "../../../manifest/runtime";
import type {
  DataTableConfig,
  ResolvedColumn,
  UseDataTableResult,
} from "./types";

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Humanize a camelCase or snake_case field name into a display label.
 * "firstName" -> "First Name", "created_at" -> "Created At"
 */
function humanizeFieldName(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Infer a display format from a runtime value.
 */
function inferFormat(
  value: unknown,
): "number" | "boolean" | "date" | undefined {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/.test(value)
  ) {
    return "date";
  }
  return undefined;
}

/**
 * Auto-detect columns from the first row of data.
 */
function autoDetectColumns(rows: Record<string, unknown>[]): ResolvedColumn[] {
  const firstRow = rows[0];
  if (!firstRow) return [];
  return Object.entries(firstRow).map(([field, value]) => ({
    field,
    label: humanizeFieldName(field),
    sortable: true,
    format: inferFormat(value),
  }));
}

/**
 * Resolve explicit column configs into ResolvedColumn objects.
 */
function resolveColumns(
  configs: DataTableConfig["columns"],
  rows: Record<string, unknown>[],
): ResolvedColumn[] {
  if (configs === "auto") return autoDetectColumns(rows);
  return configs.map((col) => ({
    field: col.field,
    label: col.label ?? humanizeFieldName(col.field),
    sortable: col.sortable ?? false,
    format: col.format,
    badgeColors: col.badgeColors,
    avatarField: col.avatarField,
    linkTextField: col.linkTextField,
    prefix: col.prefix,
    suffix: col.suffix,
    width: col.width,
    align: col.align,
  }));
}

/**
 * Get the ID value from a row. Uses 'id' field, falling back to index.
 */
function getRowId(
  row: Record<string, unknown>,
  index: number,
): string | number {
  const id = row["id"];
  if (typeof id === "string" || typeof id === "number") return id;
  return index;
}

/**
 * Compare two values for sorting.
 */
function compareValues(
  a: unknown,
  b: unknown,
  direction: "asc" | "desc",
): number {
  const mult = direction === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return mult;
  if (b == null) return -mult;
  if (typeof a === "number" && typeof b === "number") return (a - b) * mult;
  return String(a).localeCompare(String(b)) * mult;
}

/**
 * Check if a row matches a search query across specified fields.
 */
function rowMatchesSearch(
  row: Record<string, unknown>,
  query: string,
  searchFields?: string[],
): boolean {
  const lowerQuery = query.toLowerCase();
  const fields = searchFields ?? Object.keys(row);
  return fields.some((field) => {
    const value = row[field];
    if (value == null) return false;
    return String(value).toLowerCase().includes(lowerQuery);
  });
}

/**
 * Check if a row matches all active filters.
 */
function rowMatchesFilters(
  row: Record<string, unknown>,
  filters: Record<string, unknown>,
): boolean {
  for (const [field, filterValue] of Object.entries(filters)) {
    if (filterValue == null || filterValue === "") continue;
    const cellValue = row[field];
    if (String(cellValue) !== String(filterValue)) return false;
  }
  return true;
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * Headless hook for managing data table state.
 *
 * Provides sorting, pagination, filtering, selection, and search
 * functionality without any rendering. Resolves `FromRef` values
 * in the `data` and `params` fields via `useSubscribe`.
 *
 * @param config - DataTable configuration (from Zod schema)
 * @returns All state and handlers needed to render a data table
 *
 * @example
 * ```tsx
 * const table = useDataTable({
 *   type: 'data-table',
 *   data: 'GET /api/users',
 *   columns: 'auto',
 *   pagination: { type: 'offset', pageSize: 10 },
 *   selectable: true,
 *   searchable: true,
 * })
 *
 * // table.rows — current page rows
 * // table.sort — current sort state
 * // table.setSortColumn('name') — toggle sort
 * // table.selectedRows — selected row objects
 * ```
 */
export function useDataTable(config: DataTableConfig): UseDataTableResult {
  // Resolve FromRef for data source
  const resolvedData = useSubscribe(config.data);

  // Resolve FromRef for params
  const resolvedParams: Record<string, unknown> = {};
  const paramEntries = config.params ? Object.entries(config.params) : [];
  for (const [key, value] of paramEntries) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    resolvedParams[key] = useSubscribe(value);
  }

  // Publish state when id is set
  const publish = usePublish(config.id);

  // State
  const [allRows, setAllRows] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sort, setSort] = useState<{
    column: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [selection, setSelection] = useState<Set<string | number>>(new Set());
  const [search, setSearch] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);

  // API client for endpoint fetching
  const api = useContext(SnapshotApiContext);
  const runtime = useManifestRuntime();

  // Determine if data is from a FromRef (already resolved) or needs fetching
  const isDataFromRef = isFromRef(config.data);
  const isResolvedResource = isResourceRef(resolvedData);

  // Handle inline data (arrays passed directly or from FromRef)
  useEffect(() => {
    if (isDataFromRef || Array.isArray(resolvedData)) {
      if (Array.isArray(resolvedData)) {
        setAllRows(resolvedData as Record<string, unknown>[]);
        setIsLoading(false);
        setError(null);
      } else if (resolvedData != null && typeof resolvedData === "object") {
        // Object with a data array (e.g., { data: [...], total: 100 })
        const obj = resolvedData as Record<string, unknown>;
        if (Array.isArray(obj["data"])) {
          setAllRows(obj["data"] as Record<string, unknown>[]);
        } else {
          setAllRows([]);
        }
        setIsLoading(false);
        setError(null);
      } else if (resolvedData == null) {
        setAllRows([]);
        setIsLoading(false);
      }
    }
  }, [isDataFromRef, resolvedData]);

  // Handle data from endpoint string — fetch via API client
  useEffect(() => {
    if (isDataFromRef || (typeof resolvedData !== "string" && !isResolvedResource)) {
      return;
    }
    if (!api) {
      // No API client available yet — stay in loading state
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const request = resolveEndpointTarget(
          isResolvedResource ? resolvedData : (resolvedData as string),
          runtime?.resources,
          resolvedParams,
        );
        const url = buildRequestUrl(request.endpoint, request.params);

        let result: unknown;
        switch (request.method) {
          case "POST":
            result = await api.post(url, undefined);
            break;
          case "PUT":
            result = await api.put(url, undefined);
            break;
          default:
            result = await api.get(url);
        }

        if (cancelled) return;

        // Handle response: array directly, or object with data array
        if (Array.isArray(result)) {
          setAllRows(result as Record<string, unknown>[]);
        } else if (result != null && typeof result === "object") {
          const obj = result as Record<string, unknown>;
          if (Array.isArray(obj["data"])) {
            setAllRows(obj["data"] as Record<string, unknown>[]);
          } else {
            setAllRows([obj] as Record<string, unknown>[]);
          }
        } else {
          setAllRows([]);
        }
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch data"),
          );
          setAllRows([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDataFromRef,
    resolvedData,
    isResolvedResource,
    api,
    runtime?.resources,
    refreshCounter,
    JSON.stringify(resolvedParams),
  ]);

  // Resolve columns
  const columns = useMemo(
    () => resolveColumns(config.columns, allRows),
    [config.columns, allRows],
  );

  // Search fields
  const searchFields = useMemo(() => {
    if (typeof config.searchable === "object" && config.searchable.fields) {
      return config.searchable.fields;
    }
    return undefined;
  }, [config.searchable]);

  // Filter + search + sort pipeline
  const processedRows = useMemo(() => {
    let rows = [...allRows];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      rows = rows.filter((row) => rowMatchesFilters(row, filters));
    }

    // Apply search
    if (search) {
      rows = rows.filter((row) => rowMatchesSearch(row, search, searchFields));
    }

    // Apply sort
    if (sort) {
      rows.sort((a, b) =>
        compareValues(a[sort.column], b[sort.column], sort.direction),
      );
    }

    return rows;
  }, [allRows, filters, search, searchFields, sort]);

  // Pagination
  const paginationEnabled = config.pagination !== false;
  const pageSize =
    paginationEnabled && typeof config.pagination === "object"
      ? (config.pagination.pageSize ?? 10)
      : 10;
  const totalRows = processedRows.length;
  const totalPages = paginationEnabled
    ? Math.max(1, Math.ceil(totalRows / pageSize))
    : 1;

  // Clamp current page
  const clampedPage = Math.min(currentPage, totalPages);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Paginated rows
  const rows = useMemo(() => {
    if (!paginationEnabled) return processedRows;
    const start = (clampedPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, paginationEnabled, clampedPage, pageSize]);

  // Selected rows and IDs
  const selectedRows = useMemo(
    () => allRows.filter((row, i) => selection.has(getRowId(row, i))),
    [allRows, selection],
  );

  const selectedIds = useMemo(() => Array.from(selection), [selection]);

  // Handlers
  const setSortColumn = useCallback((column: string) => {
    setSort((prev) => {
      if (prev?.column === column) {
        return { column, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { column, direction: "asc" };
    });
  }, []);

  const goToPage = useCallback(
    (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
    [totalPages],
  );

  const nextPage = useCallback(
    () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    [totalPages],
  );

  const prevPage = useCallback(
    () => setCurrentPage((p) => Math.max(p - 1, 1)),
    [],
  );

  const setFilter = useCallback((field: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const toggleRow = useCallback((id: string | number) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelection((prev) => {
      const visibleIds = rows.map((row, i) => getRowId(row, i));
      const allSelected = visibleIds.every((id) => prev.has(id));
      if (allSelected) {
        // Deselect all visible
        const next = new Set(prev);
        for (const id of visibleIds) {
          next.delete(id);
        }
        return next;
      }
      // Select all visible
      const next = new Set(prev);
      for (const id of visibleIds) {
        next.add(id);
      }
      return next;
    });
  }, [rows]);

  const setSearchQuery = useCallback((query: string) => {
    setSearch(query);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const refetch = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  // Publish state
  useEffect(() => {
    if (publish) {
      publish({
        selected: selectedRows[selectedRows.length - 1] ?? null,
        selectedRows,
        selectedIds,
        filters,
        sort: sort ? { field: sort.column, direction: sort.direction } : null,
        page: clampedPage,
        search,
        data: processedRows,
      });
    }
  }, [
    publish,
    selectedRows,
    selectedIds,
    filters,
    sort,
    clampedPage,
    search,
    processedRows,
  ]);

  const pagination = paginationEnabled
    ? {
        currentPage: clampedPage,
        totalPages,
        pageSize,
        totalRows,
      }
    : null;

  return {
    columns,
    rows,
    sort,
    setSortColumn,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    filters,
    setFilter,
    selection,
    toggleRow,
    toggleAll,
    selectedRows,
    selectedIds,
    search,
    setSearch: setSearchQuery,
    isLoading,
    error,
    refetch,
    data: processedRows,
  };
}
