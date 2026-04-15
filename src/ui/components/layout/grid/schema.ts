import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

function responsiveValueSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.union([
    valueSchema,
    z
      .object({
        default: valueSchema,
        sm: valueSchema.optional(),
        md: valueSchema.optional(),
        lg: valueSchema.optional(),
        xl: valueSchema.optional(),
        "2xl": valueSchema.optional(),
      })
      .strict(),
  ]);
}

export const gridConfigSchema = extendComponentSchema({
  type: z.literal("grid"),
  areas: responsiveValueSchema(z.array(z.string())).optional(),
  rows: z.string().optional(),
  columns: responsiveValueSchema(z.union([z.string(), z.number()])).optional(),
  gap: responsiveValueSchema(
    z.enum(["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"]),
  ).optional(),
  children: z.array(componentConfigSchema).min(1),
  slots: slotsSchema(["root", "item"]).optional(),
}).strict();
