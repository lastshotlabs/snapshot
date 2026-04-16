import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../schema";

export const componentGroupConfigSchema = extendComponentSchema({
  type: z.literal("component-group"),
  group: z.string().min(1),
  overrides: z.record(z.record(z.unknown())).optional(),
  slots: slotsSchema(["root"]).optional(),
}).strict();
