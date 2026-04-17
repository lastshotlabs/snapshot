import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Textarea component.
 *
 * Defines a multi-line text input with label, character count,
 * validation, and configurable resize behavior.
 *
 * @example
 * ```json
 * {
 *   "type": "textarea",
 *   "id": "bio-field",
 *   "label": "Bio",
 *   "placeholder": "Tell us about yourself...",
 *   "rows": 5,
 *   "maxLength": 500,
 *   "resize": "vertical"
 * }
 * ```
 */
export const textareaConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("textarea"),
    /** Label text displayed above the textarea. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Placeholder text inside the textarea. */
    placeholder: z.union([z.string(), fromRefSchema]).optional(),
    /** Initial or bound value. Can be a FromRef. */
    value: z.union([z.string(), fromRefSchema]).optional(),
    /** Number of visible rows. Default: 3. */
    rows: z.number().optional(),
    /** Maximum character length. Shows character count when set. */
    maxLength: z.number().optional(),
    /** Whether the field is required. */
    required: z.boolean().optional(),
    /** Disabled state. Can be a FromRef. */
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Read-only state. Can be a FromRef. */
    readonly: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Helper text displayed below the textarea. */
    helperText: z.union([z.string(), fromRefSchema]).optional(),
    /** Error message displayed below the textarea. Can be a FromRef. */
    errorText: z.union([z.string(), fromRefSchema]).optional(),
    /** Resize behavior. Default: "vertical". */
    resize: z.enum(["none", "vertical", "horizontal", "both"]).optional(),
    /** Tiered event action hooks for textarea interactions. */
    on: controlEventActionsSchema.optional(),
    slots: slotsSchema([
      "root",
      "label",
      "requiredIndicator",
      "control",
      "helper",
      "counter",
      "meta",
    ]).optional(),
  })
  .strict();
