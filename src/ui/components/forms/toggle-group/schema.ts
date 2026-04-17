import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const toggleGroupSlotNames = [
  "root",
  "item",
  "itemLabel",
  "itemIcon",
  "indicator",
] as const;

export const toggleGroupConfigSchema = extendComponentSchema({
  type: z.literal("toggle-group"),
  mode: z.enum(["single", "multiple"]).optional(),
  items: z.array(
    z
      .object({
        value: z.string(),
        label: z.union([z.string(), fromRefSchema]).optional(),
        icon: z.string().optional(),
        disabled: z.union([z.boolean(), fromRefSchema]).optional(),
        slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
      })
      .strict(),
  ),
  defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
  value: z.union([z.string(), z.array(z.string()), fromRefSchema]).optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
  variant: z.enum(["outline", "ghost"]).optional(),
  publishTo: z.string().optional(),
  on: controlEventActionsSchema.optional(),
  slots: slotsSchema(toggleGroupSlotNames).optional(),
}).strict();
