import { z } from "zod";
import { actionSchema } from "../../../actions/types";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

/**
 * Zod schema for a single context menu item.
 *
 * Items can be interactive (with label + action), separators,
 * or disabled entries.
 */
const contextMenuItemSchema = z.object({
  /** Display label for the menu item. */
  label: z.string(),
  /** Optional icon name (Lucide kebab-case). */
  icon: z.string().optional(),
  /** Action dispatched when the item is clicked. */
  action: actionSchema.optional(),
  /** Visual variant. Destructive items render in red. */
  variant: z.enum(["default", "destructive"]).optional(),
  /** When true, renders a horizontal separator line instead of a clickable item. */
  separator: z.boolean().optional(),
  /** When true, the item is visually muted and non-interactive. */
  disabled: z.boolean().optional(),
});

/**
 * Zod config schema for the ContextMenu component.
 *
 * Defines a right-click context menu that appears at cursor position.
 * The trigger area can display optional text via `triggerText`.
 *
 * @example
 * ```json
 * {
 *   "type": "context-menu",
 *   "triggerText": "Right-click here",
 *   "items": [
 *     { "label": "Edit", "icon": "pencil", "action": { "type": "open-modal", "modal": "edit-modal" } },
 *     { "label": "Delete", "icon": "trash-2", "variant": "destructive", "action": { "type": "confirm", "message": "Delete?" } }
 *   ]
 * }
 * ```
 */
export const contextMenuConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("context-menu"),
    /** Menu items to display on right-click. */
    items: z.array(contextMenuItemSchema).optional(),
    /** Text label shown in the trigger area. */
    triggerText: z.string().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
