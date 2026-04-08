import { z } from "zod";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

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
export const separatorConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("separator"),
    /** Orientation of the divider. Default: "horizontal". */
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    /** Optional centered label text. Supports FromRef for dynamic text. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
