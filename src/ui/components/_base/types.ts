import { z } from "zod";
import {
  fromRefSchema,
  type FromRef as SharedFromRef,
} from "@lastshotlabs/frontend-contract/refs";
import {
  dataSourceSchema,
  endpointTargetSchema,
  resourceRefSchema,
} from "../../resources";
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

export type ComponentZIndex = Record<string, unknown>;
export type ComponentAnimationConfig = Record<string, unknown>;
export type ComponentBackgroundConfig = Record<string, unknown>;
export type ComponentTransitionConfig = Record<string, unknown>;
export type HoverConfig = Record<string, unknown>;
export type FocusConfig = Record<string, unknown>;
export type ActiveConfig = Record<string, unknown>;
export type ExitAnimationConfig = Record<string, unknown>;

/**
 * Base style fields shared by code-first components.
 */
export const baseComponentConfigSchema = z.object({
  id: z.string().optional(),
  tokens: z.record(z.string()).optional(),
  visibleWhen: z.string().optional(),
  visible: orFromRef(z.boolean()).optional(),
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),
  span: z.union([z.number().int().min(1).max(12), z.record(z.number())]).optional(),
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
  zIndex: componentZIndexSchema.optional(),
  animation: componentAnimationSchema.optional(),
  glass: z.boolean().optional(),
  background: componentBackgroundSchema.optional(),
  transition: componentTransitionSchema.optional(),
  /** Slot overrides for sub-elements. Components extend this with named slots. */
  slots: z.record(z.record(z.unknown())).optional(),
  /** Hover state styling overrides. */
  hover: hoverConfigSchema.optional(),
  /** Focus state styling overrides. */
  focus: focusConfigSchema.optional(),
  /** Active state styling overrides. */
  active: activeConfigSchema.optional(),
  /** Exit animation when the component is removed. */
  exitAnimation: exitAnimationSchema.optional(),
});

/** Base config type inferred from the schema. */
export type BaseComponentConfig = Record<string, unknown>;

/**
 * Typed slot override map. Use the slot-name union as the type parameter for
 * each component to constrain accepted slot names; defaults to free-form
 * `string` keys for callers who haven't migrated yet.
 *
 * @example
 * ```ts
 * type ButtonSlots = SlotOverrides<"root" | "label" | "icon">;
 * ```
 */
export type SlotOverrides<TSlot extends string = string> = Partial<
  Record<TSlot, Record<string, unknown>>
>;
