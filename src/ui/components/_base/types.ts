import { z } from "zod";

/**
 * Schema for a FromRef value — a reference to another component's published data.
 */
export const fromRefSchema = z.object({
  from: z.string(),
});

/**
 * Creates a Zod schema that accepts either a literal value of type T or a FromRef.
 *
 * @param schema - The Zod schema for the literal value
 * @returns A union schema accepting either the literal or a FromRef
 */
export function orFromRef<T extends z.ZodTypeAny>(
  schema: T,
): z.ZodUnion<[T, typeof fromRefSchema]> {
  return z.union([schema, fromRefSchema]);
}

/**
 * Base config fields shared by all config-driven components.
 * Every component schema should extend this via `.merge()` or `.extend()`.
 */
export const baseComponentConfigSchema = z.object({
  /** Unique identifier for this component instance. Used for from-ref publishing. */
  id: z.string().optional(),
  /** Whether the component is visible. Can be a FromRef for conditional rendering. */
  visible: orFromRef(z.boolean()).optional(),
  /** CSS class name(s) to apply to the component wrapper. */
  className: z.string().optional(),
});

/** Base config type inferred from the schema. */
export type BaseComponentConfig = z.infer<typeof baseComponentConfigSchema>;
