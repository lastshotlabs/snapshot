import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const embedConfigSchema = extendComponentSchema({
  type: z.literal("embed"),
  url: z.string(),
  aspectRatio: z.string().optional(),
  title: z.string().optional(),
  slots: slotsSchema(["root", "frame"]).optional(),
}).strict();
