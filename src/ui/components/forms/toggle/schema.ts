import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Toggle component.
 *
 * Defines a pressed/unpressed toggle button that publishes its state.
 * Can display text, an icon, or both.
 *
 * @example
 * ```json
 * {
 *   "type": "toggle",
 *   "id": "bold-toggle",
 *   "icon": "bold",
 *   "label": "Bold",
 *   "variant": "outline",
 *   "size": "sm"
 * }
 * ```
 */
export const toggleConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("toggle"),
    /** Button text label. */
    label: z.string().optional(),
    /** Icon name displayed in the button. */
    icon: z.string().optional(),
    /** Initial pressed state. Can be a FromRef. Default: false. */
    pressed: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Visual variant. Default: "default". */
    variant: z.enum(["default", "outline"]).optional(),
    /** Size variant. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Disabled state. Can be a FromRef. */
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Action to execute on toggle. */
    changeAction: actionSchema.optional(),
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
