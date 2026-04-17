import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const navDropdownSlotNames = [
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

export const navDropdownConfigSchema = extendComponentSchema({
  type: z.literal("nav-dropdown"),
  label: z.union([z.string(), fromRefSchema]),
  icon: z.string().optional(),
  trigger: z.enum(["click", "hover"]).optional(),
  current: z.boolean().optional(),
  disabled: z.boolean().optional(),
  align: z.enum(["start", "center", "end"]).optional(),
  width: z.string().optional(),
  items: z.array(componentConfigSchema),
  roles: z.array(z.string()).optional(),
  authenticated: z.boolean().optional(),
  slots: slotsSchema(navDropdownSlotNames).optional(),
}).strict();
