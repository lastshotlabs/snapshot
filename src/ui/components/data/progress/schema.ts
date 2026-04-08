import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Progress component.
 *
 * Defines all manifest-settable fields for a progress bar/ring
 * that displays determinate or indeterminate progress.
 *
 * @example
 * ```json
 * {
 *   "type": "progress",
 *   "value": 65,
 *   "label": "Upload progress",
 *   "showValue": true,
 *   "color": "primary"
 * }
 * ```
 */
export const progressConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("progress"),
    /** Progress value 0-100. Omit for indeterminate mode. Can be a FromRef. */
    value: z.union([z.number(), fromRefSchema]).optional(),
    /** Maximum value. Default: 100. */
    max: z.number().optional(),
    /** Text label displayed above the bar. Can be a FromRef. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Show percentage text next to the label. Default: false. */
    showValue: z.boolean().optional(),
    /** Bar height variant. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Semantic color for the filled portion. Default: "primary". */
    color: z
      .enum([
        "primary",
        "secondary",
        "accent",
        "destructive",
        "success",
        "warning",
        "info",
      ])
      .optional(),
    /** Display variant. Default: "bar". */
    variant: z.enum(["bar", "circular"]).optional(),
    /** Split the bar into discrete segments. */
    segments: z.number().int().min(1).optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
