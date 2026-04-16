/**
 * `dashboardPage` preset factory.
 *
 * Composes a dashboard page from high-level options and returns a valid
 * manifest `PageConfig`. The generated page includes:
 *
 * - A page heading
 * - A responsive row of StatCards (one per stat in `options.stats`)
 * - An optional List component for recent activity (when `recentActivity` endpoint provided)
 */
import type { PageConfig } from "../manifest/types";
import type { DashboardPageOptions } from "./types";
/**
 * Builds a manifest `PageConfig` for a dashboard page.
 *
 * Consumers drop the result into their manifest's `pages` record:
 *
 * ```ts
 * const manifest = {
 *   pages: {
 *     "/dashboard": dashboardPage({
 *       title: "Overview",
 *       stats: [
 *         { label: "Total Users", endpoint: "GET /api/stats/users", valueKey: "count" },
 *         { label: "Revenue", endpoint: "GET /api/stats/revenue", valueKey: "total", format: "currency" },
 *         { label: "Orders", endpoint: "GET /api/stats/orders", valueKey: "total", format: "number" },
 *         { label: "Conversion", endpoint: "GET /api/stats/conversion", valueKey: "rate", format: "percent" },
 *       ],
 *       recentActivity: "GET /api/activity",
 *     }),
 *   },
 * };
 * ```
 *
 * @param options - High-level dashboard page options
 * @returns A valid manifest `PageConfig`
 */
export declare function dashboardPage(options: DashboardPageOptions): PageConfig;
