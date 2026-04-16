import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/** Schema for color picker components with optional swatches, alpha, and change actions. */
export const colorPickerConfigSchema = extendComponentSchema({
  type: z.literal("color-picker"),
  format: z.enum(["hex", "rgb", "hsl"]).default("hex"),
  defaultValue: z.string().optional(),
  swatches: z.array(z.string()).optional(),
  allowCustom: z.boolean().default(true),
  showAlpha: z.boolean().default(false),
  label: z.union([z.string(), fromRefSchema]).optional(),
  onChange: z.union([actionSchema, z.array(actionSchema)]).optional(),
  slots: slotsSchema([
    "root",
    "label",
    "controls",
    "picker",
    "input",
    "alpha",
    "alphaLabel",
    "alphaInput",
    "swatches",
    "swatch",
    "value",
  ]).optional(),
}).strict();
