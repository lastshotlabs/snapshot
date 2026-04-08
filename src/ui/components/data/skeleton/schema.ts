import { z } from "zod";

/**
 * Zod config schema for the Skeleton component.
 *
 * Defines all manifest-settable fields for a loading placeholder
 * that can substitute any content shape.
 *
 * @example
 * ```json
 * {
 *   "type": "skeleton",
 *   "variant": "text",
 *   "lines": 4,
 *   "animated": true
 * }
 * ```
 */
export const skeletonConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("skeleton"),
    /** Shape variant. Default: "text". */
    variant: z.enum(["text", "circular", "rectangular", "card"]).optional(),
    /** CSS width. Default: "100%". */
    width: z.union([z.string(), z.number()]).optional(),
    /** CSS height. */
    height: z.union([z.string(), z.number()]).optional(),
    /** Number of text lines to show (text variant only). Default: 3. */
    lines: z.number().int().min(1).optional(),
    /** Enable pulse animation. Default: true. */
    animated: z.boolean().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), z.object({ from: z.string() })]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
