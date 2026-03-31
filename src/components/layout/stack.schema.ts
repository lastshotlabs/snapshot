import { z } from "zod";

export const stackConfigSchema = z.object({
  type: z.literal("stack"),
  id: z.string().optional(),
  gap: z.string().optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  className: z.string().optional(),
  children: z.array(z.record(z.unknown())),
});

export type StackConfig = z.infer<typeof stackConfigSchema>;
