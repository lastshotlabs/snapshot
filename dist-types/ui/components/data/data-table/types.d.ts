import type { z } from "zod";
import type { dataTableConfigSchema, columnConfigSchema, rowActionSchema, bulkActionSchema } from "./schema";
/** Inferred DataTable configuration type from the Zod schema. */
export type DataTableConfig = z.infer<typeof dataTableConfigSchema>;
/** Inferred column configuration type. */
export type ColumnConfig = z.infer<typeof columnConfigSchema>;
/** Inferred row action type. */
export type RowAction = z.infer<typeof rowActionSchema>;
/** Inferred bulk action type. */
export type BulkAction = z.infer<typeof bulkActionSchema>;
/** Sort state for the data table. */
export interface SortState {
    /** The field name being sorted. */
    column: string;
    /** Sort direction. */
    direction: "asc" | "desc";
}
/** Pagination state for the data table. */
export interface PaginationState {
    /** Current page number (1-based). */
    currentPage: number;
    /** Total number of pages. */
    totalPages: number;
    /** Number of rows per page. */
    pageSize: number;
    /** Total number of rows. */
    totalRows: number;
}
/** Resolved column definition used internally by the hook and component. */
export interface ResolvedColumn {
    /** Field name from the data object. */
    field: string;
    /** Display label for the column header. */
    label: string;
    /** Whether the column is sortable. */
    sortable: boolean;
    /** Display format. */
    format?: "date" | "number" | "currency" | "badge" | "boolean" | "avatar" | "progress" | "link" | "code";
    /** Badge color mapping. */
    badgeColors?: Record<string, string>;
    /** Field for avatar image src. */
    avatarField?: string;
    /** Field for link display text. */
    linkTextField?: string;
    /** Cell value prefix. */
    prefix?: string;
    /** Cell value suffix. */
    suffix?: string;
    /** Column width. */
    width?: string;
    /** Text alignment. */
    align?: "left" | "center" | "right";
}
/**
 * Return type of the `useDataTable` headless hook.
 * Provides all state and handlers needed to render a data table.
 */
export interface UseDataTableResult {
    /** Resolved column definitions (auto-detected or from config). */
    columns: ResolvedColumn[];
    /** Rows visible on the current page after sorting, filtering, and searching. */
    rows: Record<string, unknown>[];
    /** Current sort state, or null if unsorted. */
    sort: SortState | null;
    /** Set the sort column. Toggles direction if already sorting by this column. */
    setSortColumn: (column: string) => void;
    /** Pagination state and controls. Null if pagination is disabled. */
    pagination: PaginationState | null;
    /** Go to a specific page (1-based). */
    goToPage: (page: number) => void;
    /** Go to the next page. No-op if on the last page. */
    nextPage: () => void;
    /** Go to the previous page. No-op if on the first page. */
    prevPage: () => void;
    /** Current filter values keyed by field name. */
    filters: Record<string, unknown>;
    /** Set a filter value for a specific field. */
    setFilter: (field: string, value: unknown) => void;
    /** Set of selected row IDs. */
    selection: Set<string | number>;
    /** Toggle selection of a single row by ID. */
    toggleRow: (id: string | number) => void;
    /** Toggle selection of all visible rows. */
    toggleAll: () => void;
    /** Currently selected rows (full data objects). */
    selectedRows: Record<string, unknown>[];
    /** IDs of currently selected rows. */
    selectedIds: (string | number)[];
    /** Current search query string. */
    search: string;
    /** Set the search query string. */
    setSearch: (query: string) => void;
    /** Whether data is currently loading. */
    isLoading: boolean;
    /** Error from data fetching, or null. */
    error: Error | null;
    /** Trigger a data refetch. */
    refetch: () => void;
    /** All data rows (before pagination, after filtering/sorting/searching). */
    data: Record<string, unknown>[];
    /** Whether infinite scroll mode is active. */
    isInfiniteScroll: boolean;
    /** Whether there are more rows to load (infinite scroll only). */
    hasMore: boolean;
}
