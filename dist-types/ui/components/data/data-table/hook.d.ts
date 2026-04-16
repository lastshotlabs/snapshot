import type { DataTableConfig, UseDataTableResult } from "./types";
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
export declare function useDataTable(config: DataTableConfig): UseDataTableResult;
