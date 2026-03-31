import { z } from "zod";

export const statCardConfigSchema = z.object({
  type: z.literal("stat-card"),
  id: z.string().optional(),
  data: z.union([z.string(), z.object({ endpoint: z.string() }).catchall(z.unknown())]).optional(),
  label: z.string(),
  valueField: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  format: z.string().optional(),
  trend: z
    .object({
      field: z.string().optional(),
      value: z.number().optional(),
      label: z.string().optional(),
    })
    .optional(),
  icon: z.string().optional(),
  className: z.string().optional(),
});

export type StatCardConfig = z.infer<typeof statCardConfigSchema>;
