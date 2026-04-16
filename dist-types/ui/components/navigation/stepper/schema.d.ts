import { z } from "zod";
export declare const stepperSlotNames: readonly ["root", "item", "marker", "label", "description", "connector", "content"];
/**
 * Schema for a single step within the stepper.
 */
export declare const stepConfigSchema: z.ZodType<Record<string, any>>;
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
export declare const stepperConfigSchema: z.ZodType<Record<string, any>>;
