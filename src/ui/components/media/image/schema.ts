import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

/** Schema for optimized image components rendered through Snapshot's image route. */
export const snapshotImageSchema = extendComponentSchema({
  type: z.literal("image"),
  src: z.string().min(1),
  width: z.number().int().positive().max(4096),
  height: z.number().int().positive().max(4096).optional(),
  quality: z.number().int().min(1).max(100).default(75),
  format: z
    .enum(["avif", "webp", "jpeg", "png", "original"])
    .default("original"),
  sizes: z.string().optional(),
  priority: z.boolean().default(false),
  placeholder: z.enum(["blur", "empty", "skeleton"]).default("empty"),
  loading: z.enum(["lazy", "eager"]).optional(),
  aspectRatio: z.string().optional(),
  alt: z.string(),
  slots: slotsSchema(["root", "placeholder", "image"]).optional(),
}).strict();
