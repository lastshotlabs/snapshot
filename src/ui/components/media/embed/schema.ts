import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const embedConfigSchema = extendComponentSchema({
  type: z.literal("embed"),
  url: z.union([z.string(), fromRefSchema]),
  aspectRatio: z.union([z.string(), fromRefSchema]).optional(),
  title: z.union([z.string(), fromRefSchema]).optional(),
  slots: slotsSchema(["root", "frame"]).optional(),
}).strict();
