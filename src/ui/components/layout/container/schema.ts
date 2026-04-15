import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const containerConfigSchema = extendComponentSchema({
  type: z.literal("container"),
  maxWidth: z
    .union([
      z.enum(["xs", "sm", "md", "lg", "xl", "2xl", "full", "prose"]),
      z.number(),
    ])
    .default("xl"),
  padding: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).default("md"),
  center: z.boolean().default(true),
  children: z.array(componentConfigSchema).min(1),
  slots: slotsSchema(["root", "item"]).optional(),
}).strict();
