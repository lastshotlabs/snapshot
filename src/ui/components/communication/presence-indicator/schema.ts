import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the PresenceIndicator component.
 *
 * Displays an online/offline/away/busy/dnd status dot with optional label.
 *
 * @example
 * ```json
 * {
 *   "type": "presence-indicator",
 *   "status": "online",
 *   "label": "John Doe",
 *   "size": "md"
 * }
 * ```
 */
export const presenceIndicatorConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("presence-indicator"),
    /** Status value. Can be a FromRef for dynamic status. */
    status: z.union([
      z.enum(["online", "offline", "away", "busy", "dnd"]),
      fromRefSchema,
    ]),
    /** Label text next to the dot. Can be a FromRef. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Show the colored dot. Default: true. */
    showDot: z.boolean().optional(),
    /** Show the label text. Default: true. */
    showLabel: z.boolean().optional(),
    /** Size variant. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    slots: slotsSchema(["root", "dot", "label"]).optional(),
  }).strict();
