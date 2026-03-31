import { z } from "zod";

const actionRefSchema = z.object({ action: z.string() }).catchall(z.unknown());

export const emptyStateConfigSchema = z.object({
  type: z.literal("empty-state"),
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  action: actionRefSchema.optional(),
  actionLabel: z.string().optional(),
  className: z.string().optional(),
});

export type EmptyStateConfig = z.infer<typeof emptyStateConfigSchema>;
