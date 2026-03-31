import { z } from "zod";

const columnSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  sortable: z.boolean().optional(),
  width: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  format: z.string().optional(),
  visible: z.boolean().optional(),
});

const filterSchema = z.object({
  field: z.string(),
  type: z.enum(["text", "select", "date-range", "number-range"]),
  label: z.string().optional(),
  options: z
    .union([z.literal("auto"), z.array(z.object({ label: z.string(), value: z.string() }))])
    .optional(),
});

const rowActionSchema = z
  .object({
    label: z.string(),
    action: z.string(),
    icon: z.string().optional(),
    variant: z.enum(["default", "destructive"]).optional(),
  })
  .catchall(z.unknown());

const paginationSchema = z.object({
  type: z.enum(["cursor", "offset"]).optional(),
  pageSize: z.number().optional(),
});

export const tableConfigSchema = z.object({
  type: z.literal("table"),
  id: z.string().optional(),
  data: z.union([z.string(), z.object({ endpoint: z.string() }).catchall(z.unknown())]),
  columns: z.union([z.literal("auto"), z.array(columnSchema)]).optional(),
  filters: z.array(filterSchema).optional(),
  actions: z.array(rowActionSchema).optional(),
  pagination: paginationSchema.optional(),
  sortable: z.boolean().optional(),
  selectable: z.boolean().optional(),
  emptyState: z.string().optional(),
  className: z.string().optional(),
});

export type TableConfig = z.infer<typeof tableConfigSchema>;
export type ColumnConfig = z.infer<typeof columnSchema>;
export type FilterConfig = z.infer<typeof filterSchema>;
export type RowActionConfig = z.infer<typeof rowActionSchema>;
