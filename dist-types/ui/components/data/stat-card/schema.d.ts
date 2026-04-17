import { z } from "zod";
/** Schema for the trend indicator configuration. */
export declare const trendConfigSchema: z.ZodObject<{
    /** Response field containing the comparison value. */
    field: z.ZodString;
    /** Whether an upward trend is good or bad. Default: 'up-is-good'. */
    sentiment: z.ZodOptional<z.ZodEnum<["up-is-good", "up-is-bad"]>>;
    /** How to format the trend value. Default: 'percent'. */
    format: z.ZodOptional<z.ZodEnum<["percent", "absolute"]>>;
}, "strict", z.ZodTypeAny, {
    field: string;
    format?: "absolute" | "percent" | undefined;
    sentiment?: "up-is-good" | "up-is-bad" | undefined;
}, {
    field: string;
    format?: "absolute" | "percent" | undefined;
    sentiment?: "up-is-good" | "up-is-bad" | undefined;
}>;
/**
 * Zod config schema for the StatCard component.
 *
 * Defines all manifest-settable fields for a stat card that displays
 * a single metric with optional trend indicator.
 *
 * @example
 * ```json
 * {
 *   "type": "stat-card",
 *   "data": "GET /api/stats/revenue",
 *   "field": "total",
 *   "label": "Revenue",
 *   "format": "currency",
 *   "trend": { "field": "previousTotal", "sentiment": "up-is-good" }
 * }
 * ```
 */
export declare const statCardConfigSchema: z.ZodType<Record<string, any>>;
