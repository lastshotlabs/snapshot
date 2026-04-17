import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/** Schema for single-value and ranged slider controls with optional value display/actions. */
export const sliderConfigSchema = extendComponentSchema({
  type: z.literal("slider"),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().positive().default(1),
  defaultValue: z
    .union([z.number(), z.tuple([z.number(), z.number()])])
    .optional(),
  range: z.boolean().default(false),
  label: z.union([z.string(), fromRefSchema]).optional(),
  showValue: z.boolean().default(false),
  showLimits: z.boolean().default(false),
  suffix: z.union([z.string(), fromRefSchema]).optional(),
  on: controlEventActionsSchema.optional(),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
  slots: slotsSchema([
    "root",
    "header",
    "label",
    "value",
    "rail",
    "track",
    "fill",
    "input",
    "inputStart",
    "inputEnd",
    "limits",
    "minLabel",
    "maxLabel",
  ]).optional(),
}).strict();
