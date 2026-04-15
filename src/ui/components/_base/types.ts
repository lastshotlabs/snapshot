import { z } from "zod";
import {
  fromRefSchema,
  type FromRef as SharedFromRef,
} from "@lastshotlabs/frontend-contract/refs";
import {
  dataSourceSchema,
  endpointTargetSchema,
  resourceRefSchema,
} from "../../manifest/resources";
import {
  componentAnimationSchema,
  componentBackgroundSchema,
  componentTransitionSchema,
  componentZIndexSchema,
  hoverConfigSchema,
  focusConfigSchema,
  activeConfigSchema,
  exitAnimationSchema,
} from "./schema";

/**
 * Schema for a FromRef value — a reference to another component's published data.
 * Supports optional transforms (uppercase, lowercase, trim, etc.) and transformArg.
 */
export { fromRefSchema };

/** Type for a FromRef value. */
export type FromRef = SharedFromRef;

/**
 * Type guard — returns true if value is a FromRef object.
 */
export function isFromRef(value: unknown): value is FromRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "from" in value &&
    typeof (value as Record<string, unknown>).from === "string"
  );
}

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

export { dataSourceSchema, endpointTargetSchema, resourceRefSchema };

export const pollConfigSchema = z
  .object({
    interval: z.number().int().positive().min(1000),
    pauseWhenHidden: z.boolean().default(true),
  })
  .strict();

export type ComponentZIndex = z.infer<typeof componentZIndexSchema>;
export type ComponentAnimationConfig = z.infer<typeof componentAnimationSchema>;
export type ComponentBackgroundConfig = z.infer<
  typeof componentBackgroundSchema
>;
export type ComponentTransitionConfig = z.infer<
  typeof componentTransitionSchema
>;
export type HoverConfig = z.infer<typeof hoverConfigSchema>;
export type FocusConfig = z.infer<typeof focusConfigSchema>;
export type ActiveConfig = z.infer<typeof activeConfigSchema>;
export type ExitAnimationConfig = z.infer<typeof exitAnimationSchema>;

/**
 * Base config fields shared by all config-driven components.
 * Every component schema should extend this via `.merge()` or `.extend()`.
 */
export const baseComponentConfigSchema = z.object({
  /** Unique identifier for this component instance. Used for from-ref publishing. */
  id: z.string().optional(),
  /** Optional token overrides applied to the wrapper. */
  tokens: z.record(z.string()).optional(),
  /** String expression that controls visibility. */
  visibleWhen: z.string().optional(),
  /** Whether the component is visible. Can be a FromRef for conditional rendering. */
  visible: orFromRef(z.boolean()).optional(),
  /** CSS class name(s) to apply to the component wrapper. */
  className: z.string().optional(),
  /** Inline style overrides as a CSS property map. */
  style: z.record(z.union([z.string(), z.number()])).optional(),
  /** Sticky positioning. */
  sticky: z
    .union([
      z.boolean(),
      z
        .object({
          top: z.string().optional(),
          zIndex: componentZIndexSchema.optional(),
        })
        .strict(),
    ])
    .optional(),
  /** Explicit z-index override. */
  zIndex: componentZIndexSchema.optional(),
  /** Enter animation config. */
  animation: componentAnimationSchema.optional(),
  /** Glass effect shorthand. */
  glass: z.boolean().optional(),
  /** Background fill shorthand. */
  background: componentBackgroundSchema.optional(),
  /** Transition shorthand. */
  transition: componentTransitionSchema.optional(),
});

/** Base config type inferred from the schema. */
export type BaseComponentConfig = z.infer<typeof baseComponentConfigSchema>;
