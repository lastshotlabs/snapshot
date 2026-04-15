import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the SaveIndicator component.
 *
 * Defines all manifest-settable fields for a save status indicator
 * that shows idle, saving, saved, or error states.
 *
 * @example
 * ```json
 * {
 *   "type": "save-indicator",
 *   "status": { "from": "my-form.saveStatus" },
 *   "savedText": "All changes saved",
 *   "showIcon": true
 * }
 * ```
 */
export const saveIndicatorConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("save-indicator"),
    /** Current save status. Supports FromRef for reactive binding. */
    status: z.union([
      z.enum(["idle", "saving", "saved", "error"]),
      fromRefSchema,
    ]),
    /** Text shown in saved state. Default: "Saved". */
    savedText: z.string().optional(),
    /** Text shown in saving state. Default: "Saving...". */
    savingText: z.string().optional(),
    /** Text shown in error state. Default: "Error saving". */
    errorText: z.string().optional(),
    /** Whether to show status icon. Default: true. */
    showIcon: z.boolean().optional(),
    slots: slotsSchema(["root", "icon", "label"]).optional(),
  })
  .strict();
