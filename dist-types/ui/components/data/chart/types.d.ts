import type { z } from "zod";
import type { chartSchema, seriesConfigSchema } from "./schema";
/**
 * Inferred type for the Chart component configuration.
 */
export type ChartConfig = z.infer<typeof chartSchema>;
/**
 * Inferred type for a single chart series config.
 */
export type SeriesConfig = z.infer<typeof seriesConfigSchema>;
