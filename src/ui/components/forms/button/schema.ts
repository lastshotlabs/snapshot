import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const buttonSlotNames = [
  "root",
  "label",
  "icon",
  "leadingIcon",
] as const;

export const buttonConfigSchema = extendComponentSchema({
  type: z.literal("button"),
  label: z.union([z.string(), fromRefSchema]),
  icon: z.string().optional(),
  variant: z
    .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
    .optional(),
  size: z.enum(["sm", "md", "lg", "icon"]).optional(),
  action: z.union([actionSchema, z.array(actionSchema)]),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
  fullWidth: z.boolean().optional(),
  slots: slotsSchema(buttonSlotNames).optional(),
}).strict();
