import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

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
  label: z.string().optional(),
  showValue: z.boolean().default(false),
  showLimits: z.boolean().default(false),
  suffix: z.string().optional(),
  onChange: z.union([actionSchema, z.array(actionSchema)]).optional(),
  disabled: z.boolean().optional(),
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
