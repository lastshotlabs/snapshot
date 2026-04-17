import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const contextMenuSlotNames = [
  "root",
  "trigger",
  "panel",
  "item",
  "itemLabel",
  "itemIcon",
  "separator",
  "label",
] as const;

export const contextMenuItemSchema = z.union([
  z
    .object({
      type: z.literal("item"),
      label: z.union([z.string(), fromRefSchema]),
      icon: z.string().optional(),
      action: actionSchema.optional(),
      variant: z.enum(["default", "destructive"]).optional(),
      disabled: z.boolean().optional(),
      slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("separator"),
      slots: slotsSchema(["separator"]).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("label"),
      text: z.union([z.string(), fromRefSchema]),
      slots: slotsSchema(["label"]).optional(),
    })
    .strict(),
]);

/**
 * Zod schema for the ContextMenu component.
 *
 * Defines a right-click menu with styleable trigger, panel, item, label, and separator surfaces.
 * Visibility can be driven by a boolean or a binding reference.
 */
export const contextMenuConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
  type: z.literal("context-menu"),
  items: z.array(contextMenuItemSchema).optional(),
  triggerText: z.union([z.string(), fromRefSchema]).optional(),
  visible: z.union([z.boolean(), fromRefSchema]).optional(),
  slots: slotsSchema(contextMenuSlotNames).optional(),
}).strict();
