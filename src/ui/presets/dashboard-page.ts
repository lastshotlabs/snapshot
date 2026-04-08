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
import type { DashboardPageOptions, StatDef } from "./types";

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Converts a title to a slug suitable for component IDs.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Maps a StatDef to a stat-card component config.
 */
function mapStatCard(stat: StatDef, index: number): Record<string, unknown> {
  const config: Record<string, unknown> = {
    type: "stat-card",
    id: `stat-${slugify(stat.label)}-${index}`,
    data: stat.endpoint,
    field: stat.valueKey,
    label: stat.label,
    span: 3,
  };

  if (stat.format) {
    config.format = stat.format;
  }

  if (stat.icon) {
    config.icon = stat.icon;
  }

  if (stat.trend) {
    config.trend = {
      field: stat.trend.key,
      sentiment: stat.trend.positive === "down" ? "up-is-bad" : "up-is-good",
      format: "percent",
    };
  }

  return config;
}

// ── dashboardPage factory ────────────────────────────────────────────────────

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
export function dashboardPage(options: DashboardPageOptions): PageConfig {
  const slug = options.id ?? slugify(options.title);

  const content: Record<string, unknown>[] = [];

  // Page heading
  content.push({
    type: "heading",
    text: options.title,
    level: 1,
  });

  // Stat cards row — up to 4 per row; each card gets span 3 (12-col grid)
  if (options.stats.length > 0) {
    const statCardChildren = options.stats.map(mapStatCard);

    content.push({
      type: "row",
      gap: "md",
      children: statCardChildren,
    });
  }

  // Optional recent activity list
  if (options.recentActivity) {
    content.push({
      type: "heading",
      text: "Recent Activity",
      level: 2,
    });

    content.push({
      type: "list",
      id: `${slug}-activity`,
      data: options.recentActivity,
      emptyMessage: "No recent activity",
    });
  }

  return {
    title: options.title,
    content: content as PageConfig["content"],
  };
}
