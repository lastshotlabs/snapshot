import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const sectionConfigSchema = extendComponentSchema({
  type: z.literal("section"),
  height: z.union([z.string(), z.enum(["screen", "auto"])]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z.enum(["start", "center", "end", "between", "around"]).optional(),
  bleed: z.boolean().optional(),
  children: z.array(componentConfigSchema).default([]),
  slots: slotsSchema(["root", "item"]).optional(),
}).strict();
