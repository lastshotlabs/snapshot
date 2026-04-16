import type { StatCardConfig } from "./types";
/**
 * StatCard component — a data-fetching card that displays a single metric
 * with optional trend indicator.
 *
 * Fetches data from the configured endpoint, formats the value according
 * to the format config, and optionally shows a trend arrow with color
 * coding based on sentiment.
 *
 * @param props - Component props containing the stat card configuration
 *
 * @example
 * ```json
 * {
 *   "type": "stat-card",
 *   "id": "revenue-card",
 *   "data": "GET /api/stats/revenue",
 *   "field": "total",
 *   "label": "Revenue",
 *   "format": "currency",
 *   "trend": { "field": "previousTotal", "sentiment": "up-is-good" }
 * }
 * ```
 */
export declare function StatCard({ config }: {
    config: StatCardConfig;
}): import("react/jsx-runtime").JSX.Element | null;
