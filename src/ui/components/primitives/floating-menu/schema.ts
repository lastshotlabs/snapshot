import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { actionSchema } from "../../../actions/types";
import { primitiveTextValueSchema } from "../schema-helpers";

export const floatingMenuSlotNames = [
  "root",
  "trigger",
  "panel",
  "item",
  "itemLabel",
  "itemIcon",
  "separator",
  "label",
] as const;

export const floatingMenuEntrySchema = z.union([
  z
    .object({
      type: z.literal("item"),
      label: primitiveTextValueSchema,
      icon: z.string().optional(),
      action: actionSchema.optional(),
      disabled: z.boolean().optional(),
      destructive: z.boolean().optional(),
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
      text: primitiveTextValueSchema,
      slots: slotsSchema(["label"]).optional(),
    })
    .strict(),
]);

export const floatingMenuConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
  type: z.literal("floating-menu"),
  open: z.boolean().optional(),
  align: z.enum(["start", "center", "end"]).optional(),
  side: z.enum(["top", "bottom"]).optional(),
  triggerLabel: primitiveTextValueSchema.optional(),
  triggerIcon: z.string().optional(),
  items: z.array(floatingMenuEntrySchema).optional(),
  slots: slotsSchema(floatingMenuSlotNames).optional(),
}).strict();
