import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const inlineEditSlotNames = [
  "root",
  "display",
  "displayText",
  "displayIcon",
  "input",
] as const;

/**
 * Zod config schema for the InlineEdit component.
 *
 * A click-to-edit text field that toggles between display and edit modes.
 * Publishes `{ value, editing }` to the page context.
 *
 * @example
 * ```json
 * {
 *   "type": "inline-edit",
 *   "id": "title-edit",
 *   "value": "My Title",
 *   "placeholder": "Enter title",
 *   "saveAction": { "type": "api", "method": "PUT", "endpoint": "/api/title", "body": { "from": "title-edit" } }
 * }
 * ```
 */
export const inlineEditConfigSchema = extendComponentSchema({
  /** Component type discriminator. */
  type: z.literal("inline-edit"),
  /** Current value. Supports FromRef for dynamic binding. */
  value: z.union([z.string(), fromRefSchema]).optional(),
  /** Placeholder text when value is empty. Default: "Click to edit". */
  placeholder: z.union([z.string(), fromRefSchema]).optional(),
  /** Input type for the edit field. Default: "text". */
  inputType: z.enum(["text", "number"]).optional(),
  /** Action dispatched on save (Enter or blur). Receives `{ value }` in context. */
  saveAction: actionSchema.optional(),
  /** Whether Escape cancels editing and reverts the value. Default: true. */
  cancelOnEscape: z.boolean().optional(),
  /** Override font size token (e.g. "var(--sn-font-size-lg)"). */
  fontSize: z.string().optional(),
  /** Canonical slot overrides for the display and input surfaces. */
  slots: slotsSchema(inlineEditSlotNames).optional(),
}).strict();
