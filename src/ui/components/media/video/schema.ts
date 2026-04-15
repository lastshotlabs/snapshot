import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const videoConfigSchema = extendComponentSchema({
  type: z.literal("video"),
  src: z.string(),
  poster: z.string().optional(),
  controls: z.boolean().optional(),
  autoPlay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
  slots: slotsSchema(["root"]).optional(),
}).strict();
