import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  endpointTargetSchema,
  fromRefSchema,
} from "../../_base/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import {
  fieldConfigSchema,
  fieldValidationSchema,
} from "../auto-form/schema";

export const wizardSlotNames = [
  "root",
  "progress",
  "steps",
  "step",
  "stepMarker",
  "stepBody",
  "stepLabel",
  "stepDescription",
  "stepConnector",
  "panel",
  "header",
  "title",
  "description",
  "completionState",
  "completionTitle",
  "completionDescription",
  "submitError",
  "actions",
  "actionGroup",
  "backButton",
  "nextButton",
  "submitButton",
] as const;

/**
 * Re-export for consumers that want to import the field schema directly.
 * @see fieldConfigSchema from auto-form/schema
 */
export { fieldConfigSchema };

/**
 * Schema for a single wizard step.
 */
export const wizardStepSchema: z.ZodType<Record<string, any>> = z.object({
  /** Step heading. */
  title: z.union([z.string(), fromRefSchema]),
  /** Optional step description shown below the title. */
  description: z.union([z.string(), fromRefSchema]).optional(),
  /** Fields to render in this step (reuses AutoForm field schema). */
  fields: z.array(fieldConfigSchema),
  /** Override label for the "Next" or submit button on this step. */
  submitLabel: z.union([z.string(), fromRefSchema]).optional(),
  /** Additional per-field validation gates for this step. */
  validate: z
    .array(
      z
        .object({
          field: z.string(),
          rule: fieldValidationSchema,
        })
        .strict(),
    )
    .optional(),
  /** Whether this step can be skipped. */
  skip: z.union([z.boolean(), z.object({ expr: z.string() }).strict()]).optional(),
  /** Async validation endpoint for this step. */
  asyncValidate: z
    .object({
      endpoint: endpointTargetSchema,
      body: z.record(z.unknown()).optional(),
    })
    .strict()
    .optional(),
  /** Actions fired when this step becomes active. */
  onEnter: z.union([actionSchema, z.array(actionSchema)]).optional(),
  /** Actions fired before leaving this step. */
  onLeave: z.union([actionSchema, z.array(actionSchema)]).optional(),
  slots: slotsSchema([
    "step",
    "stepMarker",
    "stepBody",
    "stepLabel",
    "stepDescription",
    "stepConnector",
    "panel",
    "header",
    "title",
    "description",
    "submitError",
  ]).optional(),
});

/**
 * Zod schema for the Wizard component configuration.
 *
 * A multi-step form flow. Each step collects fields independently.
 * On the final step, all accumulated data is submitted to `submitEndpoint`
 * (if set) and published to the page context via `id`.
 */
export const wizardSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("wizard"),
    /** Ordered list of wizard steps. */
    steps: z.array(wizardStepSchema).min(1),
    /** Endpoint to POST all accumulated data to on final step submission. */
    submitEndpoint: endpointTargetSchema.optional(),
    /** Label for the final submit button (when no per-step override is set). */
    submitLabel: z.union([z.string(), fromRefSchema]).default("Submit"),
    /** Action to execute after successful completion. */
    onComplete: actionSchema.optional(),
    /** Allow users to skip optional steps (steps with no required fields). */
    allowSkip: z.boolean().default(false),
    slots: slotsSchema(wizardSlotNames).optional(),
  })
  .strict();
