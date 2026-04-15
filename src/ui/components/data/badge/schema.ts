import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
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
export const badgeConfigSchema = extendComponentSchema({
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
    slots: slotsSchema(["root", "dot", "icon", "label"]).optional(),
  })
  .strict();
