import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePublish } from "../../../context/hooks";
import {
  useActionExecutor,
  SnapshotApiContext,
} from "../../../actions/executor";
import type { FieldConfig } from "../auto-form/types";
import type { WizardConfig, UseWizardResult } from "./types";

const STEP_ANIMATION_DURATION = 200;

// ── Validation helpers ────────────────────────────────────────────────────────

function validateField(field: FieldConfig, value: unknown): string | undefined {
  if (field.required && (value == null || value === "" || value === false)) {
    return `${field.label ?? field.name} is required`;
  }
  if (field.validation) {
    const v = field.validation;
    const str = typeof value === "string" ? value : String(value ?? "");
    if (v.minLength !== undefined && str.length < v.minLength) {
      return v.message ?? `Minimum length is ${v.minLength}`;
    }
    if (v.maxLength !== undefined && str.length > v.maxLength) {
      return v.message ?? `Maximum length is ${v.maxLength}`;
    }
    if (v.min !== undefined && typeof value === "number" && value < v.min) {
      return v.message ?? `Minimum value is ${v.min}`;
    }
    if (v.max !== undefined && typeof value === "number" && value > v.max) {
      return v.message ?? `Maximum value is ${v.max}`;
    }
    if (v.pattern !== undefined) {
      try {
        if (!new RegExp(v.pattern).test(str)) {
          return v.message ?? `Invalid format`;
        }
      } catch {
        // ignore bad regex
      }
    }
  }
  return undefined;
}

function validateStep(
  fields: FieldConfig[],
  values: Record<string, unknown>,
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  for (const field of fields) {
    const err = validateField(field, values[field.name]);
    if (err) errors[field.name] = err;
  }
  return errors;
}

function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((e) => e != null);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Headless hook for managing wizard (multi-step form) state.
 *
 * Provides step navigation, per-step validation, accumulated data collection,
 * and final submission. Publishes accumulated data to the page context when
 * the wizard's `id` is set.
 *
 * Step transitions include an animation state flag (`isAnimating`) that can
 * be used to drive CSS transitions.
 *
 * @param config - The wizard configuration (from the Zod schema)
 * @returns All state and handlers needed to render a wizard
 *
 * @example
 * ```tsx
 * const wizard = useWizard(config)
 *
 * // wizard.currentStep — 0-based index
 * // wizard.stepValues  — current step field values
 * // wizard.nextStep()  — validates then advances
 * // wizard.prevStep()  — goes back without validation
 * // wizard.isComplete  — true after final submission
 * ```
 */
export function useWizard(config: WizardConfig): UseWizardResult {
  const api = useContext(SnapshotApiContext);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [currentStep, setCurrentStep] = useState(0);
  const [stepValues, setStepValues] = useState<Record<string, unknown>>({});
  const [stepErrors, setStepErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [stepTouched, setStepTouched] = useState<Record<string, boolean>>({});
  // Accumulated data across all steps
  const [accumulatedData, setAccumulatedData] = useState<
    Record<string, unknown>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSteps = config.steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Transition to a new step with animation
  const transitionTo = useCallback((nextIndex: number) => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setCurrentStep(nextIndex);
      setStepValues({});
      setStepErrors({});
      setStepTouched({});
      setIsAnimating(false);
    }, STEP_ANIMATION_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const setStepValue = useCallback((name: string, value: unknown) => {
    setStepValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user changes the value
    setStepErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const touchField = useCallback((name: string) => {
    setStepTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const nextStep = useCallback((): boolean => {
    const step = config.steps[currentStep];
    if (!step) return false;

    // Validate current step
    const errors = validateStep(step.fields, stepValues);
    if (hasErrors(errors)) {
      setStepErrors(errors);
      // Touch all fields to show errors
      const allTouched: Record<string, boolean> = {};
      for (const field of step.fields) {
        allTouched[field.name] = true;
      }
      setStepTouched(allTouched);
      return false;
    }

    // Merge current step values into accumulated data
    const newAccumulated = { ...accumulatedData, ...stepValues };
    setAccumulatedData(newAccumulated);

    if (publish) {
      publish({ ...newAccumulated, _step: currentStep });
    }

    if (isLastStep) {
      // Submit
      void (async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
          if (config.submitEndpoint && api) {
            await api.post(config.submitEndpoint, newAccumulated);
          }
          if (config.onComplete) {
            await execute(config.onComplete, { data: newAccumulated });
          }
          setIsComplete(true);
          if (publish) {
            publish({ ...newAccumulated, _complete: true });
          }
        } catch (err) {
          setSubmitError(
            err instanceof Error ? err : new Error("Submission failed"),
          );
        } finally {
          setIsSubmitting(false);
        }
      })();
      return true;
    }

    transitionTo(currentStep + 1);
    return true;
  }, [
    config,
    currentStep,
    stepValues,
    accumulatedData,
    isLastStep,
    publish,
    api,
    execute,
    transitionTo,
  ]);

  const prevStep = useCallback(() => {
    if (isFirstStep) return;
    transitionTo(currentStep - 1);
  }, [currentStep, isFirstStep, transitionTo]);

  const skipStep = useCallback(() => {
    if (!config.allowSkip || isLastStep) return;
    transitionTo(currentStep + 1);
  }, [config.allowSkip, currentStep, isLastStep, transitionTo]);

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    accumulatedData,
    stepValues,
    stepErrors,
    stepTouched,
    setStepValue,
    touchField,
    nextStep,
    prevStep,
    skipStep,
    isSubmitting,
    submitError,
    isComplete,
    isAnimating,
  };
}
