import { z } from "zod";

/**
 * Schema for a FromRef value — a reference to another component's published value.
 */
export const fromRefSchema = z.object({
  from: z.string(),
});

/**
 * Registry of component schemas keyed by type string.
 * Each component phase registers its schema here.
 */
const componentSchemaRegistry = new Map<string, z.ZodType>();

/**
 * Register a Zod schema for a component type.
 * Used during component initialization to enable manifest validation.
 *
 * @param type - The component type string (e.g. 'modal', 'tabs')
 * @param schema - The Zod schema for the component's config
 */
export function registerComponentSchema(type: string, schema: z.ZodType): void {
  componentSchemaRegistry.set(type, schema);
}

/**
 * Get a registered component schema by type.
 *
 * @param type - The component type to look up
 * @returns The Zod schema, or undefined if not registered
 */
export function getComponentSchema(type: string): z.ZodType | undefined {
  return componentSchemaRegistry.get(type);
}

/**
 * Base component config schema shared by all components.
 */
export const baseComponentConfigSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  visible: z
    .union([z.boolean(), fromRefSchema, z.record(z.unknown())])
    .optional(),
  className: z.string().optional(),
  span: z.union([z.number(), z.record(z.unknown())]).optional(),
});

/**
 * Generic component config schema that delegates validation to registered schemas.
 * Uses superRefine to look up the type-specific schema at validation time.
 */
export const componentConfigSchema: z.ZodType = z
  .object({ type: z.string() })
  .passthrough()
  .superRefine((data, ctx) => {
    const schema = componentSchemaRegistry.get(data.type);
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue(issue);
        }
      }
    } else if (data.type !== "custom") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown component type "${data.type}". Available types: ${[...componentSchemaRegistry.keys()].join(", ")}`,
      });
    }
  });
