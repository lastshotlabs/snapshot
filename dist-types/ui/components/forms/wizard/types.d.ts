import type { z } from "zod";
import type { wizardSchema, wizardStepSchema } from "./schema";
/**
 * Inferred type for the Wizard component configuration.
 */
export type WizardConfig = z.infer<typeof wizardSchema>;
/**
 * Inferred type for a single wizard step configuration.
 */
export type WizardStepConfig = z.infer<typeof wizardStepSchema>;
/**
 * Return type of the useWizard headless hook.
 */
export interface UseWizardResult {
    /** Zero-based index of the current step. */
    currentStep: number;
    /** Total number of steps. */
    totalSteps: number;
    /** Whether this is the first step. */
    isFirstStep: boolean;
    /** Whether this is the last step. */
    isLastStep: boolean;
    /** Accumulated data from all steps so far. */
    accumulatedData: Record<string, unknown>;
    /** Values for the current step fields. */
    stepValues: Record<string, unknown>;
    /** Validation errors for the current step fields. */
    stepErrors: Record<string, string | undefined>;
    /** Tracks which fields on the current step have been touched. */
    stepTouched: Record<string, boolean>;
    /** Set a field value on the current step. */
    setStepValue: (name: string, value: unknown) => void;
    /** Mark a field as touched (triggers validation display). */
    touchField: (name: string) => void;
    /** Whether the current step can be skipped. */
    canSkip: boolean;
    /** Advance to the next step (validates current step first). Returns true on success. */
    nextStep: () => boolean | Promise<boolean>;
    /** Go back to the previous step (no validation). */
    prevStep: () => void | Promise<void>;
    /** Skip the current step (only if allowSkip is true). */
    skipStep: () => void | Promise<void>;
    /** Reset the wizard to the first step and clear collected values. */
    resetWizard: () => void;
    /** Whether submission is in progress. */
    isSubmitting: boolean;
    /** Error from the last submission attempt, or null. */
    submitError: Error | null;
    /** Whether the wizard has been completed. */
    isComplete: boolean;
    /** Whether step transition animation is in progress. */
    isAnimating: boolean;
}
