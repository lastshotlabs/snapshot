import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Badge component.
 *
 * Defines all manifest-settable fields for a badge/pill element
 * used for labels, statuses, and counts.
 *
 * @example
 * ```json
 * {
 *   "type": "badge",
 *   "text": "Active",
 *   "color": "success",
 *   "variant": "soft"
 * }
 * ```
 */
export const badgeConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("badge"),
    /** Badge display text. Supports FromRef for dynamic text. */
    text: z.union([z.string(), fromRefSchema]),
    /** Semantic color. Default: "secondary". */
    color: z
      .enum([
        "primary",
        "secondary",
        "muted",
        "accent",
        "destructive",
        "success",
        "warning",
        "info",
      ])
      .optional(),
    /** Visual variant. Default: "soft". */
    variant: z.enum(["solid", "soft", "outline", "dot"]).optional(),
    /** Size. Default: "md". */
    size: z.enum(["xs", "sm", "md", "lg"]).optional(),
    /** Icon name (rendered as text placeholder). */
    icon: z.string().optional(),
    /** Use pill shape (fully rounded). Default: true. */
    rounded: z.boolean().optional(),
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
