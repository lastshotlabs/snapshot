import { z } from "zod";

const fieldSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  type: z
    .enum([
      "text",
      "email",
      "password",
      "number",
      "textarea",
      "select",
      "checkbox",
      "toggle",
      "date",
      "datetime",
      "hidden",
    ])
    .optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  visible: z.union([z.boolean(), z.object({ when: z.string(), equals: z.unknown() })]).optional(),
  span: z.number().optional(),
});

const actionRefSchema = z.object({ action: z.string() }).catchall(z.unknown());

export const formConfigSchema = z.object({
  type: z.literal("form"),
  id: z.string().optional(),
  data: z.union([z.string(), z.object({ endpoint: z.string() }).catchall(z.unknown())]),
  fields: z.union([z.literal("auto"), z.array(fieldSchema)]).optional(),
  columns: z.number().optional(),
  submitLabel: z.string().optional(),
  resetLabel: z.string().optional(),
  onSuccess: actionRefSchema.optional(),
  onError: actionRefSchema.optional(),
  className: z.string().optional(),
});

export type FormConfig = z.infer<typeof formConfigSchema>;
export type FormFieldConfig = z.infer<typeof fieldSchema>;
