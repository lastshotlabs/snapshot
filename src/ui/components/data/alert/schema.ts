import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Alert component.
 *
 * Defines all manifest-settable fields for a notification banner/alert
 * with icon, title, description, and optional action button.
 *
 * @example
 * ```json
 * {
 *   "type": "alert",
 *   "title": "Success",
 *   "description": "Your changes have been saved.",
 *   "variant": "success",
 *   "dismissible": true
 * }
 * ```
 */
export const alertConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("alert"),
    /** Alert title. Supports FromRef for dynamic text. */
    title: z.union([z.string(), fromRefSchema]).optional(),
    /** Alert body text. Supports FromRef for dynamic text. */
    description: z.union([z.string(), fromRefSchema]),
    /** Visual variant. Default: "default". */
    variant: z
      .enum(["info", "success", "warning", "destructive", "default"])
      .optional(),
    /** Override the default variant icon (rendered as text placeholder). */
    icon: z.string().optional(),
    /** Show dismiss (X) button. Default: false. */
    dismissible: z.boolean().optional(),
    /** Optional action to execute when the action button is clicked. */
    action: actionSchema.optional(),
    /** Label for the action button. */
    actionLabel: z.string().optional(),
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
