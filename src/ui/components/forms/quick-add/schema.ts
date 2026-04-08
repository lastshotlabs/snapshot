import { z } from "zod";
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
export const quickAddConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("quick-add"),
    /** Input placeholder text. Default: "Add new item...". */
    placeholder: z.string().optional(),
    /** Left icon name. Default: "plus". */
    icon: z.string().optional(),
    /** Action dispatched on submit with `{ value: string }` payload. */
    submitAction: z.lazy(() => z.record(z.unknown()).pipe(z.any())).optional(),
    /** Whether Enter key submits. Default: true. */
    submitOnEnter: z.boolean().optional(),
    /** Whether to show the submit button. Default: true. */
    showButton: z.boolean().optional(),
    /** Submit button text. Default: "Add". */
    buttonText: z.string().optional(),
    /** Whether to clear input after submit. Default: true. */
    clearOnSubmit: z.boolean().optional(),
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
