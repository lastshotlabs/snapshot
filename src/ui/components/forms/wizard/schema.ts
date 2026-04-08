import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { orFromRef } from "../../_base/types";
import { fieldConfigSchema } from "../auto-form/schema";

/**
 * Re-export for consumers that want to import the field schema directly.
 * @see fieldConfigSchema from auto-form/schema
 */
export { fieldConfigSchema };

/**
 * Schema for a single wizard step.
 */
export const wizardStepSchema = z.object({
  /** Step heading. */
  title: z.string(),
  /** Optional step description shown below the title. */
  description: z.string().optional(),
  /** Fields to render in this step (reuses AutoForm field schema). */
  fields: z.array(fieldConfigSchema),
  /** Override label for the "Next" / submit button on this step. */
  submitLabel: z.string().optional(),
});

/**
 * Zod schema for the Wizard component configuration.
 *
 * A multi-step form flow. Each step collects fields independently.
 * On the final step, all accumulated data is submitted to `submitEndpoint`
 * (if set) and published to the page context via `id`.
 *
 * Step transitions use a mounted+animating pattern for smooth UX.
 *
 * @example
 * ```json
 * {
 *   "type": "wizard",
 *   "id": "onboarding",
 *   "steps": [
 *     {
 *       "title": "Account Details",
 *       "fields": [
 *         { "name": "email", "type": "email", "required": true },
 *         { "name": "password", "type": "password", "required": true }
 *       ]
 *     },
 *     {
 *       "title": "Profile",
 *       "fields": [
 *         { "name": "name", "type": "text", "label": "Full Name" }
 *       ],
 *       "submitLabel": "Finish"
 *     }
 *   ],
 *   "submitEndpoint": "POST /api/onboard",
 *   "submitLabel": "Complete Setup"
 * }
 * ```
 */
export const wizardSchema = z.object({
  /** Component type discriminator. */
  type: z.literal("wizard"),
  /** Optional component id — publishes accumulated form data to the page context. */
  id: z.string().optional(),
  /** Whether the component is visible. Can be a FromRef for conditional rendering. */
  visible: orFromRef(z.boolean()).optional(),
  /** CSS class name(s) to apply to the component wrapper. */
  className: z.string().optional(),
  /** Inline style overrides as a CSS property map. */
  style: z.record(z.union([z.string(), z.number()])).optional(),
  /** Ordered list of wizard steps. */
  steps: z.array(wizardStepSchema).min(1),
  /** Endpoint to POST all accumulated data to on final step submission. */
  submitEndpoint: z.string().optional(),
  /** Label for the final submit button (when no per-step override is set). */
  submitLabel: z.string().default("Submit"),
  /** Action to execute after successful completion. */
  onComplete: actionSchema.optional(),
  /** Allow users to skip optional steps (steps with no required fields). */
  allowSkip: z.boolean().default(false),
});
