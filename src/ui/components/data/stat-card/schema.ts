import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  emptyStateConfigSchema,
  errorStateConfigSchema,
  liveConfigSchema,
} from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema, pollConfigSchema } from "../../_base/types";

/** Schema for the trend indicator configuration. */
export const trendConfigSchema = z
  .object({
    /** Response field containing the comparison value. */
    field: z.string(),
    /** Whether an upward trend is good or bad. Default: 'up-is-good'. */
    sentiment: z.enum(["up-is-good", "up-is-bad"]).optional(),
    /** How to format the trend value. Default: 'percent'. */
    format: z.enum(["percent", "absolute"]).optional(),
  })
  .strict();

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
export const statCardConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("stat-card"),
    /** API endpoint to fetch data. Supports FromRef for dependent data. */
    data: dataSourceSchema,
    /** Query parameters. Values can be FromRef for filtered stats. */
    params: z.record(z.union([z.unknown(), fromRefSchema])).optional(),
    /** Response field to display. Default: auto-detect first numeric field. */
    field: z.string().optional(),
    /** Display label. Default: humanized field name. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Number format. */
    format: z
      .enum(["number", "currency", "percent", "compact", "decimal"])
      .optional(),
    /** Currency code (for format: 'currency'). Default: 'USD'. */
    currency: z.string().optional(),
    /** Decimal places. Default: auto. */
    decimals: z.number().int().min(0).optional(),
    /** Prefix text (e.g., "$"). */
    prefix: z.string().optional(),
    /** Suffix text (e.g., "%"). */
    suffix: z.string().optional(),
    /** Lucide icon name. */
    icon: z.string().optional(),
    /** Icon color (semantic token name). */
    iconColor: z.string().optional(),
    /** Trend indicator configuration. */
    trend: trendConfigSchema.optional(),
    /** Click action. */
    action: actionSchema.optional(),
    /** Loading skeleton variant. Default: 'skeleton'. */
    loading: z.enum(["skeleton", "pulse", "spinner"]).optional(),
    /** Error state config. */
    error: errorStateConfigSchema.optional(),
    /** Polling behavior for endpoint-backed stat cards. */
    poll: pollConfigSchema.optional(),
    /** Rich empty state config. */
    empty: emptyStateConfigSchema.optional(),
    /** Live refresh configuration driven by realtime events. */
    live: liveConfigSchema.optional(),
    /** Live region politeness for dynamic metric updates. */
    ariaLive: z.enum(["off", "polite", "assertive"]).default("polite"),
    slots: slotsSchema([
      "root",
      "loading",
      "error",
      "label",
      "valueRow",
      "value",
      "icon",
      "trend",
      "empty",
    ]).optional(),
  }).strict();
