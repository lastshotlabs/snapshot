import { z } from "zod";

const fieldSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  format: z.string().optional(),
  span: z.number().optional(),
  visible: z.boolean().optional(),
});

export const detailConfigSchema = z.object({
  type: z.literal("detail"),
  id: z.string().optional(),
  data: z.union([z.string(), z.object({ endpoint: z.string() }).catchall(z.unknown())]),
  fields: z.union([z.literal("auto"), z.array(fieldSchema)]).optional(),
  columns: z.number().optional(),
  className: z.string().optional(),
});

export type DetailConfig = z.infer<typeof detailConfigSchema>;
export type DetailFieldConfig = z.infer<typeof fieldSchema>;
