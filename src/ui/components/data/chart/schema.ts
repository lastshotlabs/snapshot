import { z } from "zod";
import { baseComponentConfigSchema, dataSourceSchema } from "../../_base/types";

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
  })
  .strict();

/**
 * Zod schema for the Chart component configuration.
 *
 * Renders a data visualization (bar, line, area, pie, donut) from an endpoint
 * or from-ref. Uses Recharts under the hood. Colors default to
 * `--sn-chart-1` through `--sn-chart-5` tokens.
 */
export const chartSchema = baseComponentConfigSchema
  .extend({
    /** Component type discriminator. */
    type: z.literal("chart"),
    /** Data source: endpoint string (e.g. "GET /api/data") or a FromRef. */
    data: dataSourceSchema,
    /** Chart visualization type. */
    chartType: z.enum(["bar", "line", "area", "pie", "donut"]).default("bar"),
    /** Field name for the X axis (categories); not used for pie/donut. */
    xKey: z.string(),
    /** Data series configuration. */
    series: z.array(seriesConfigSchema),
    /** Chart height in pixels. */
    height: z.number().int().default(300),
    /** Whether to show the legend. */
    legend: z.boolean().default(true),
    /** Whether to show grid lines. */
    grid: z.boolean().default(true),
    /** Message shown when there is no data. */
    emptyMessage: z.string().default("No data"),
  })
  .strict();
