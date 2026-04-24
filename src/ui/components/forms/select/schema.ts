import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { dataSourceSchema } from "../../../manifest/resources";
import { fromRefSchema } from "../../_base/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

const selectOptionSchema = z.object({
  label: z.union([z.string(), fromRefSchema]),
  value: z.string(),
});

export const selectConfigSchema = extendComponentSchema({
  type: z.literal("select"),
  options: z.union([z.array(selectOptionSchema), dataSourceSchema]),
  valueField: z.string().optional(),
  labelField: z.string().optional(),
  default: z.union([z.string(), fromRefSchema]).optional(),
  placeholder: z.union([z.string(), fromRefSchema]).optional(),
  on: controlEventActionsSchema.optional(),
  slots: slotsSchema(["root", "control", "label", "requiredIndicator", "helper"]).optional(),
}).strict();
