import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Input component.
 *
 * Defines a standalone text input field with label, placeholder,
 * validation, and optional icon.
 *
 * @example
 * ```json
 * {
 *   "type": "input",
 *   "id": "email-field",
 *   "label": "Email",
 *   "inputType": "email",
 *   "placeholder": "you@example.com",
 *   "required": true,
 *   "helperText": "We'll never share your email"
 * }
 * ```
 */
export const inputConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("input"),
    /** Label text displayed above the input. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Placeholder text inside the input. */
    placeholder: z.union([z.string(), fromRefSchema]).optional(),
    /** Initial or bound value. Can be a FromRef. */
    value: z.union([z.string(), fromRefSchema]).optional(),
    /** HTML input type. Default: "text". */
    inputType: z
      .enum(["text", "email", "password", "number", "url", "tel", "search"])
      .optional(),
    /** Whether the field is required. */
    required: z.boolean().optional(),
    /** Disabled state. Can be a FromRef. */
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Read-only state. Can be a FromRef. */
    readonly: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Maximum character length. */
    maxLength: z.number().optional(),
    /** Regex validation pattern. */
    pattern: z.string().optional(),
    /** Helper text displayed below the input. */
    helperText: z.union([z.string(), fromRefSchema]).optional(),
    /** Error message displayed below the input. Can be a FromRef. */
    errorText: z.union([z.string(), fromRefSchema]).optional(),
    /** Left icon name. */
    icon: z.string().optional(),
    /** Tiered event action hooks for input interactions. */
    on: controlEventActionsSchema.optional(),
    slots: slotsSchema([
      "root",
      "label",
      "requiredIndicator",
      "field",
      "icon",
      "control",
      "helper",
    ]).optional(),
  })
  .strict();
