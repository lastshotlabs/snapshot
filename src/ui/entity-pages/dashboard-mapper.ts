import type { PageConfig } from "../manifest/types";
import type { EntityPageMapResult } from "./mapper";
import type {
  EntityDashboardPageDeclaration,
  PageData,
  PageLoaderResult,
} from "./bunshot-types";
import {
  formatFieldLabel,
  inferTimestampField,
  resolvePageTitle,
} from "./utils";

/**
 * Maps an entity-dashboard page declaration to Snapshot page config.
 *
 * @param result - Page loader result from bunshot.
 * @returns Snapshot page config, resources, state, and overlays.
 */
export function mapEntityDashboardPage(
  result: PageLoaderResult,
): EntityPageMapResult {
  const declaration = result.declaration
    .declaration as EntityDashboardPageDeclaration;
  const data = result.data as Extract<PageData, { type: "dashboard" }>;
  const content: Array<Record<string, unknown>> = [
    {
      type: "heading",
      level: 1,
      text: resolvePageTitle(declaration.title, null),
    },
  ];

  const statSpan = Math.floor(12 / Math.min(Math.max(data.stats.length, 1), 4));
  content.push({
    type: "row",
    gap: "md",
    wrap: true,
    children: data.stats.map((stat, index) => ({
      type: "stat-card",
      data: { from: `entityPageData.stats.${index}` },
      field: "value",
      label: stat.label,
      icon: declaration.stats[index]?.icon,
      span: statSpan,
    })),
  });

  if (declaration.chart && data.chart) {
    content.push({
      type: "chart",
      data: { from: "entityPageData.chart" },
      chartType: declaration.chart.chartType,
      xKey: "category",
      series: [
        {
          key: "value",
          label:
            declaration.chart.label ??
            formatFieldLabel(declaration.chart.valueField),
        },
      ],
      height: 320,
    });
  }

  if (declaration.activity && data.activity) {
    const titleField = declaration.activity.fields[0] ?? "id";
    const descriptionField = declaration.activity.fields[1];
    const timestampField = inferTimestampField(declaration.activity.fields);
    const badgeField = declaration.activity.fields.find((fieldName) =>
      ["status", "type", "kind"].includes(fieldName),
    );

    content.push({
      type: "heading",
      level: 2,
      text: "Recent Activity",
    });
    content.push({
      type: "feed",
      data: { from: "entityPageData.activity" },
      itemKey: data.activity.every((item) => item.id != null)
        ? "id"
        : titleField,
      title: titleField,
      ...(descriptionField ? { description: descriptionField } : undefined),
      ...(timestampField ? { timestamp: timestampField } : undefined),
      ...(badgeField ? { badge: { field: badgeField } } : undefined),
      pageSize: declaration.activity.limit ?? data.activity.length,
      emptyMessage: "No activity yet",
    });
  }

  return {
    page: {
      title: resolvePageTitle(declaration.title, null),
      content: content as PageConfig["content"],
    },
    resources: {},
    state: {
      entityPageData: {
        scope: "route",
        default: {
          stats: data.stats,
          activity: data.activity ?? [],
          chart: data.chart ?? [],
        },
      },
    },
    overlays: {},
  };
}
