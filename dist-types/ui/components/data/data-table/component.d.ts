import type { DataTableConfig } from "./types";
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
export declare function DataTable({ config }: {
    config: DataTableConfig;
}): import("react/jsx-runtime").JSX.Element;
