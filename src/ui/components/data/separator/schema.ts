import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Separator component.
 *
 * A simple visual divider line, either horizontal or vertical.
 * Optionally renders a centered label between the lines.
 *
 * @example
 * ```json
 * {
 *   "type": "separator",
 *   "orientation": "horizontal",
 *   "label": "Or continue with"
 * }
 * ```
 */
export const separatorConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("separator"),
    /** Orientation of the divider. Default: "horizontal". */
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    /** Optional centered label text. Supports FromRef for dynamic text. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    slots: slotsSchema(["root", "line", "label"]).optional(),
  })
  .strict();
