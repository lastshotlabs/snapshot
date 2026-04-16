import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the QuickAdd component.
 *
 * Defines all manifest-settable fields for an inline creation bar
 * that allows quick item entry with a text input and submit button.
 *
 * @example
 * ```json
 * {
 *   "type": "quick-add",
 *   "placeholder": "Add a task...",
 *   "submitAction": { "type": "api", "method": "POST", "endpoint": "/api/tasks" },
 *   "clearOnSubmit": true
 * }
 * ```
 */
export const quickAddConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("quick-add"),
    /** Input placeholder text. Default: "Add new item...". */
    placeholder: z.union([z.string(), fromRefSchema]).optional(),
    /** Left icon name. Default: "plus". */
    icon: z.string().optional(),
    /** Action dispatched on submit with `{ value: string }` payload. */
    submitAction: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Whether Enter key submits. Default: true. */
    submitOnEnter: z.boolean().optional(),
    /** Whether to show the submit button. Default: true. */
    showButton: z.boolean().optional(),
    /** Submit button text. Default: "Add". */
    buttonText: z.union([z.string(), fromRefSchema]).optional(),
    /** Whether to clear input after submit. Default: true. */
    clearOnSubmit: z.boolean().optional(),
    slots: slotsSchema(["root", "icon", "input", "button"]).optional(),
  }).strict();
