import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const cardConfigSchema = extendComponentSchema({
  type: z.literal("card"),
  title: z.union([z.string(), fromRefSchema]).optional(),
  subtitle: z.union([z.string(), fromRefSchema]).optional(),
  children: z.array(componentConfigSchema).default([]),
  gap: z.string().optional(),
  slots: slotsSchema([
    "root",
    "header",
    "title",
    "subtitle",
    "content",
    "item",
  ]).optional(),
}).strict();
