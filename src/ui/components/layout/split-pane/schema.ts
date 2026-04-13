import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const splitPaneSlotNames = [
  "root",
  "pane",
  "firstPane",
  "secondPane",
  "divider",
] as const;

export const splitPaneConfigSchema = extendComponentSchema({
  type: z.literal("split-pane"),
  direction: z.enum(["horizontal", "vertical"]).optional(),
  defaultSplit: z.number().min(0).max(100).optional(),
  minSize: z.number().optional(),
  children: z.array(componentConfigSchema).max(2),
  slots: slotsSchema(splitPaneSlotNames).optional(),
}).strict();
