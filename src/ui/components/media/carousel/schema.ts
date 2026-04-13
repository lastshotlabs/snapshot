import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const carouselSlotNames = [
  "root",
  "viewport",
  "track",
  "slide",
  "controls",
  "prevButton",
  "nextButton",
  "indicator",
  "indicatorItem",
] as const;

export const carouselConfigSchema = extendComponentSchema({
  type: z.literal("carousel"),
  autoPlay: z.boolean().optional(),
  interval: z.number().positive().optional(),
  showDots: z.boolean().optional(),
  showArrows: z.boolean().optional(),
  children: z.array(componentConfigSchema).optional(),
  slots: slotsSchema(carouselSlotNames).optional(),
}).strict();
