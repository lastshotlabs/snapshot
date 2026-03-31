import { z } from "zod";

export const rowConfigSchema = z.object({
  type: z.literal("row"),
  id: z.string().optional(),
  gap: z.string().optional(),
  align: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
  justify: z.enum(["start", "center", "end", "between", "around", "evenly"]).optional(),
  wrap: z.boolean().optional(),
  className: z.string().optional(),
  children: z.array(z.record(z.unknown())),
});

export type RowConfig = z.infer<typeof rowConfigSchema>;
