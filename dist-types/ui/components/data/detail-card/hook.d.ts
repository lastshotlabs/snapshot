import type { DetailCardConfig } from "./schema";
import type { UseDetailCardResult } from "./types";
/**
 * Hook that powers the DetailCard component.
 * Resolves FromRefs, fetches data from endpoints, formats fields,
 * and publishes the record data for other components to subscribe to.
 *
 * @param config - The DetailCard configuration
 * @returns Data, fields, title, loading/error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, fields, title, isLoading, error, refetch } = useDetailCard({
 *   type: 'detail-card',
 *   data: { from: 'users-table.selected' },
 *   fields: 'auto',
 * })
 * ```
 */
export declare function useDetailCard(config: DetailCardConfig): UseDetailCardResult;
