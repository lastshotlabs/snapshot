import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Switch component.
 *
 * Defines all manifest-settable fields for a toggle switch
 * that controls a boolean value.
 *
 * @example
 * ```json
 * {
 *   "type": "switch",
 *   "label": "Enable notifications",
 *   "description": "Receive email alerts for new activity",
 *   "defaultChecked": false,
 *   "color": "success"
 * }
 * ```
 */
export const switchConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("switch"),
    /** Label text. Can be a FromRef. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Helper text below the label. */
    description: z.union([z.string(), fromRefSchema]).optional(),
    /** Initial checked state. Default: false. */
    defaultChecked: z.boolean().optional(),
    /** Disabled state. Can be a FromRef. */
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Semantic color when checked. Default: "primary". */
    color: z.enum(["primary", "success", "destructive", "warning"]).optional(),
    /** Size variant. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Tiered event action hooks for switch interactions. */
    on: controlEventActionsSchema.optional(),
    slots: slotsSchema([
      "root",
      "track",
      "thumb",
      "labelGroup",
      "label",
      "description",
    ]).optional(),
  })
  .strict();
