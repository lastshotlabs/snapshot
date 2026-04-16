import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  emptyStateConfigSchema,
  liveConfigSchema,
  loadingConfigSchema,
} from "../../../manifest/schema";
import { dataSourceSchema } from "../../../manifest/resources";
import { pollConfigSchema } from "../../_base/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const chartSlotNames = [
  "root",
  "legend",
  "legendItem",
  "tooltip",
  "series",
  "axis",
  "grid",
] as const;

/**
 * Schema for a single data series in the chart.
 */
export const seriesConfigSchema = z
  .object({
    /** Data key in each data record. */
    key: z.string(),
    /** Display label for this series (legend, tooltip). */
    label: z.string(),
    /** CSS color value or CSS variable (e.g. "var(--sn-chart-1)"). */
    color: z.string().optional(),
    /** Divide numeric series values before display (e.g. cents to dollars). */
    divisor: z.number().positive().optional(),
  })
  .strict();

const lookupConfigSchema = z
  .object({
    resource: z.string(),
    valueField: z.string().optional(),
    labelField: z.string().optional(),
  })
  .strict();

/**
 * Zod schema for the Chart component configuration.
 *
 * Renders a data visualization (bar, line, area, pie, donut) from an endpoint
 * or from-ref. Uses Recharts under the hood. Colors default to
 * `--sn-chart-1` through `--sn-chart-5` tokens.
 */
export const chartSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("chart"),
    /** Data source: endpoint string (e.g. "GET /api/data") or a FromRef. */
    data: dataSourceSchema,
    /** Chart visualization type. */
    chartType: z
      .enum([
        "bar",
        "line",
        "area",
        "pie",
        "donut",
        "sparkline",
        "funnel",
        "radar",
        "treemap",
        "scatter",
      ])
      .default("bar"),
    /** Field name for the X axis (categories); not used for pie/donut. */
    xKey: z.string(),
    /** Optional lookup for display labels on the X axis. */
    xLookup: lookupConfigSchema.optional(),
    /** Data series configuration. */
    series: z.array(seriesConfigSchema),
    /** Chart height in pixels. */
    height: z.number().int().default(300),
    /** CSS aspect ratio for the chart container. */
    aspectRatio: z.string().optional(),
    /** Whether to show the legend. */
    legend: z.boolean().default(true),
    /** Whether to show grid lines. */
    grid: z.boolean().default(true),
    /** Message shown when there is no data. */
    emptyMessage: z.string().default("No data"),
    /** Rich empty state config. */
    empty: emptyStateConfigSchema.optional(),
    /** Hide the entire component (including its container) when there is no data. */
    hideWhenEmpty: z.boolean().default(false),
    /** Automatic loading placeholder config. */
    loading: loadingConfigSchema.optional(),
    /** Live refresh configuration driven by realtime events. */
    live: liveConfigSchema.optional(),
    /** Action executed when a chart element is clicked. */
    onClick: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Polling behavior for endpoint-backed charts. */
    poll: pollConfigSchema.optional(),
    slots: slotsSchema(chartSlotNames).optional(),
})
  .strict();
