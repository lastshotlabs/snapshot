import { z } from "zod";

export const modalConfigSchema = z.object({
  type: z.literal("modal"),
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
  closeOnOverlay: z.boolean().optional(),
  className: z.string().optional(),
  children: z.array(z.record(z.unknown())).optional(),
});

export type ModalConfig = z.infer<typeof modalConfigSchema>;
