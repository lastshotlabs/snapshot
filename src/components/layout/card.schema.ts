import { z } from "zod";

export const cardConfigSchema = z.object({
  type: z.literal("card"),
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  padding: z.string().optional(),
  shadow: z.string().optional(),
  radius: z.string().optional(),
  className: z.string().optional(),
  children: z.array(z.record(z.unknown())).optional(),
});

export type CardConfig = z.infer<typeof cardConfigSchema>;
