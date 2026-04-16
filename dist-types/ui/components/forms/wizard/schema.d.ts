import { z } from "zod";
import { fieldConfigSchema } from "../auto-form/schema";
export declare const wizardSlotNames: readonly ["root", "progress", "steps", "step", "stepMarker", "stepBody", "stepLabel", "stepDescription", "stepConnector", "panel", "header", "title", "description", "completionState", "completionTitle", "completionDescription", "submitError", "actions", "actionGroup", "backButton", "nextButton", "submitButton"];
/**
 * Re-export for consumers that want to import the field schema directly.
 * @see fieldConfigSchema from auto-form/schema
 */
export { fieldConfigSchema };
/**
 * Schema for a single wizard step.
 */
export declare const wizardStepSchema: z.ZodType<Record<string, any>>;
/**
 * Zod schema for the Wizard component configuration.
 *
 * A multi-step form flow. Each step collects fields independently.
 * On the final step, all accumulated data is submitted to `submitEndpoint`
 * (if set) and published to the page context via `id`.
 */
export declare const wizardSchema: z.ZodType<Record<string, any>>;
