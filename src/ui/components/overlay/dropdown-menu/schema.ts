import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const dropdownMenuSlotNames = [
  "root",
  "trigger",
  "triggerLabel",
  "triggerIcon",
  "panel",
  "item",
  "itemLabel",
  "itemIcon",
  "separator",
  "label",
] as const;

const dropdownMenuItemSchema = z
  .object({
    type: z.literal("item"),
    label: z.union([z.string(), fromRefSchema]),
    icon: z.string().optional(),
    action: actionSchema,
    disabled: z.boolean().optional(),
    destructive: z.boolean().optional(),
    slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
  })
  .strict();

const dropdownMenuSeparatorSchema = z
  .object({
    type: z.literal("separator"),
    slots: slotsSchema(["separator"]).optional(),
  })
  .strict();

const dropdownMenuLabelSchema = z
  .object({
    type: z.literal("label"),
    text: z.union([z.string(), fromRefSchema]),
    slots: slotsSchema(["label"]).optional(),
  })
  .strict();

export const dropdownMenuEntrySchema = z.union([
  dropdownMenuItemSchema,
  dropdownMenuSeparatorSchema,
  dropdownMenuLabelSchema,
]);

export const dropdownMenuConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
  type: z.literal("dropdown-menu"),
  trigger: z
    .object({
      label: z.union([z.string(), fromRefSchema]).optional(),
      icon: z.string().optional(),
      variant: z
        .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
        .optional(),
    })
    .strict(),
  items: z.array(dropdownMenuEntrySchema),
  align: z.enum(["start", "center", "end"]).optional(),
  side: z.enum(["top", "bottom"]).optional(),
  slots: slotsSchema(dropdownMenuSlotNames).optional(),
}).strict();
