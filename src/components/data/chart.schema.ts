import { z } from "zod";

const seriesSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const chartConfigSchema = z.object({
  type: z.literal("chart"),
  id: z.string().optional(),
  variant: z.enum(["line", "bar", "pie", "area", "donut"]),
  data: z.union([z.string(), z.object({ endpoint: z.string() }).catchall(z.unknown())]),
  xField: z.string().optional(),
  yField: z.string().optional(),
  series: z.array(seriesSchema).optional(),
  labelField: z.string().optional(),
  valueField: z.string().optional(),
  title: z.string().optional(),
  height: z.union([z.string(), z.number()]).optional(),
  showLegend: z.boolean().optional(),
  showGrid: z.boolean().optional(),
  emptyState: z.string().optional(),
  className: z.string().optional(),
});

export type ChartConfig = z.infer<typeof chartConfigSchema>;
export type SeriesConfig = z.infer<typeof seriesSchema>;
