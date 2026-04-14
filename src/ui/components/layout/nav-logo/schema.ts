import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const navLogoSlotNames = ["root", "icon", "label"] as const;

export const navLogoConfigSchema = extendComponentSchema({
  type: z.literal("nav-logo"),
  src: z.string().optional(),
  text: z.string().optional(),
  path: z.string().optional(),
  logoHeight: z.string().optional(),
  slots: slotsSchema(navLogoSlotNames).optional(),
}).strict();
