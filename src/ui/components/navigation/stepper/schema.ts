import { z } from "zod";
import { fromRefSchema, componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const stepperSlotNames = [
  "root",
  "item",
  "marker",
  "label",
  "description",
  "connector",
  "content",
] as const;

/**
 * Schema for a single step within the stepper.
 */
export const stepConfigSchema: z.ZodType<Record<string, any>> = z.object({
  /** Display title for this step. */
  title: z.union([z.string(), fromRefSchema]),
  /** Optional description text. */
  description: z.union([z.string(), fromRefSchema]).optional(),
  /** Lucide icon name (overrides the step number). */
  icon: z.string().optional(),
  /** Whether this step is non-interactive. */
  disabled: z.boolean().optional(),
  /** Child components rendered when this step is active. */
  content: z.array(componentConfigSchema).optional(),
  slots: slotsSchema(["item", "marker", "label", "description", "connector", "content"]).optional(),
});

/**
 * Zod config schema for the Stepper component.
 *
 * Defines all manifest-settable fields for a multi-step progress indicator.
 *
 * @example
 * ```json
 * {
 *   "type": "stepper",
 *   "steps": [
 *     { "title": "Account", "description": "Create your account" },
 *     { "title": "Profile", "description": "Fill in details" },
 *     { "title": "Review", "description": "Confirm everything" }
 *   ],
 *   "activeStep": 1
 * }
 * ```
 */
export const stepperConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("stepper"),
    /** Array of step definitions. At least one required. */
    steps: z.array(stepConfigSchema).min(1),
    /** Index of the currently active step. Supports FromRef. Default: 0. */
    activeStep: z.union([z.number(), fromRefSchema]).optional(),
    /** Layout orientation. Default: "horizontal". */
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    /** Visual variant. Default: "default". */
    variant: z.enum(["default", "simple", "dots"]).optional(),
    /** Whether steps are clickable to navigate. Default: false. */
    clickable: z.boolean().optional(),
    slots: slotsSchema(stepperSlotNames).optional(),
  }).strict();
