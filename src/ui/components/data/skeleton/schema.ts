import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

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
export const skeletonConfigSchema = extendComponentSchema({
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
    slots: slotsSchema(["root", "line", "shape", "title", "body"]).optional(),
  })
  .strict();
