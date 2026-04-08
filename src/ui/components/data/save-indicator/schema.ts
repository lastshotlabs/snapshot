import { z } from "zod";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

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
export const saveIndicatorConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("save-indicator"),
    /** Current save status. Supports FromRef for reactive binding. */
    status: z.union([z.enum(["idle", "saving", "saved", "error"]), fromRefSchema]),
    /** Text shown in saved state. Default: "Saved". */
    savedText: z.string().optional(),
    /** Text shown in saving state. Default: "Saving...". */
    savingText: z.string().optional(),
    /** Text shown in error state. Default: "Error saving". */
    errorText: z.string().optional(),
    /** Whether to show status icon. Default: true. */
    showIcon: z.boolean().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
