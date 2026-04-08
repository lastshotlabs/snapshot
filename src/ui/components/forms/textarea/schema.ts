import { z } from "zod";
import { actionSchema } from "../../../actions/types";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

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
export const textareaConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("textarea"),
    /** Label text displayed above the textarea. */
    label: z.string().optional(),
    /** Placeholder text inside the textarea. */
    placeholder: z.string().optional(),
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
    helperText: z.string().optional(),
    /** Error message displayed below the textarea. Can be a FromRef. */
    errorText: z.union([z.string(), fromRefSchema]).optional(),
    /** Resize behavior. Default: "vertical". */
    resize: z.enum(["none", "vertical", "horizontal", "both"]).optional(),
    /** Action to execute on value change (debounced). */
    changeAction: actionSchema.optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
    /** Inline styles. */
    style: z.record(z.string()).optional(),
  })
  .strict();
