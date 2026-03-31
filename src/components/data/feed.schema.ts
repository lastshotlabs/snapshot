import { z } from "zod";

export const feedConfigSchema = z.object({
  type: z.literal("feed"),
  id: z.string().optional(),
  data: z.union([z.string(), z.object({ endpoint: z.string() }).catchall(z.unknown())]),
  titleField: z.string().optional(),
  descriptionField: z.string().optional(),
  timestampField: z.string().optional(),
  avatarField: z.string().optional(),
  limit: z.number().optional(),
  emptyState: z.string().optional(),
  className: z.string().optional(),
});

export type FeedConfig = z.infer<typeof feedConfigSchema>;
