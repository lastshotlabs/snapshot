import { z } from "zod";

const breadcrumbItemSchema = z.object({
  label: z.string(),
  path: z.string().optional(),
});

export const breadcrumbConfigSchema = z.object({
  type: z.literal("breadcrumb"),
  id: z.string().optional(),
  items: z.array(breadcrumbItemSchema).optional(),
  separator: z.string().optional(),
  autoGenerate: z.boolean().optional(),
  className: z.string().optional(),
});

export type BreadcrumbConfig = z.infer<typeof breadcrumbConfigSchema>;
export type BreadcrumbItemConfig = z.infer<typeof breadcrumbItemSchema>;
