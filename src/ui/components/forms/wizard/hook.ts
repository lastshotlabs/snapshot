import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePublish } from "../../../context/hooks";
import { useEvaluateExpression } from "../../../expressions/use-expression";
import { useActionExecutor } from "../../../actions/executor";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { useApiClient } from "../../../state";
import type { FieldConfig } from "../auto-form/types";
import type { WizardConfig, UseWizardResult } from "./types";

const STEP_ANIMATION_DURATION = 200;

function validateField(field: FieldConfig, value: unknown): string | undefined {
  const validation = field.validate ?? field.validation;
  const required = typeof field.required === "boolean" ? field.required : false;

  if (required && (value == null || value === "" || value === false)) {
    return `${field.label ?? field.name} is required`;
  }
  if (validation) {
    const str = typeof value === "string" ? value : String(value ?? "");
    if (
      validation.minLength !== undefined &&
      str.length < validation.minLength
    ) {
      return validation.message ?? `Minimum length is ${validation.minLength}`;
    }
    if (
      validation.maxLength !== undefined &&
      str.length > validation.maxLength
    ) {
      return validation.message ?? `Maximum length is ${validation.maxLength}`;
    }
    if (
      validation.min !== undefined &&
      typeof value === "number" &&
      value < validation.min
    ) {
      return validation.message ?? `Minimum value is ${validation.min}`;
    }
    if (
      validation.max !== undefined &&
      typeof value === "number" &&
      value > validation.max
    ) {
      return validation.message ?? `Maximum value is ${validation.max}`;
    }
    if (validation.equals !== undefined && str !== validation.equals) {
      return validation.message ?? `Value must equal ${validation.equals}`;
    }
    if (validation.pattern !== undefined) {
      try {
        const patternValue =
          typeof validation.pattern === "string"
            ? validation.pattern
            : validation.pattern.value;
        if (!new RegExp(patternValue).test(str)) {
          return validation.message ?? "Invalid format";
        }
      } catch {
        return validation.message ?? "Invalid format";
      }
    }
  }
  return undefined;
}

function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((error) => error != null);
}

function isPromiseLike<T>(value: T | Promise<T> | void): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * Manage wizard step state, validation, submission, and transition flow.
 */
export function useWizard(config: WizardConfig): UseWizardResult {
  const api = useApiClient();
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const runtime = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<
    Record<number, Record<string, unknown>>
  >({});
  const [errorsByStep, setErrorsByStep] = useState<
    Record<number, Record<string, string | undefined>>
  >({});
  const [touchedByStep, setTouchedByStep] = useState<
    Record<number, Record<string, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousStepRef = useRef<number | null>(null);

  const totalSteps = config.steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepConfig = config.steps[currentStep];
  const skipExpression =
    currentStepConfig?.skip && typeof currentStepConfig.skip !== "boolean"
      ? currentStepConfig.skip.expr
      : undefined;
  const skipExpressionResult = useEvaluateExpression(skipExpression);

  const accumulatedData = useMemo(
    () =>
      Object.keys(stepData)
        .map((key) => Number(key))
        .sort((left, right) => left - right)
        .reduce<Record<string, unknown>>(
          (result, index) => ({ ...result, ...(stepData[index] ?? {}) }),
          {},
        ),
    [stepData],
  );
  const stepValues = stepData[currentStep] ?? {};
  const stepErrors = errorsByStep[currentStep] ?? {};
  const stepTouched = touchedByStep[currentStep] ?? {};

  const canSkip = useMemo(() => {
    if (isLastStep) {
      return false;
    }
    if (typeof currentStepConfig?.skip === "boolean") {
      return currentStepConfig.skip;
    }
    if (currentStepConfig?.skip) {
      return skipExpressionResult;
    }
    return (
      config.allowSkip &&
      Boolean(
        currentStepConfig?.fields.every((field: FieldConfig) => !field.required),
      )
    );
  }, [config.allowSkip, currentStepConfig, isLastStep, skipExpressionResult]);

  const transitionTo = useCallback((nextIndex: number) => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    setIsAnimating(true);
    transitionTimerRef.current = setTimeout(() => {
      setCurrentStep(nextIndex);
      setIsAnimating(false);
      transitionTimerRef.current = null;
    }, STEP_ANIMATION_DURATION);
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!publish) {
      return;
    }
    publish({
      ...accumulatedData,
      ...stepValues,
      _step: currentStep,
      _complete: isComplete,
    });
  }, [accumulatedData, currentStep, isComplete, publish, stepValues]);

  useEffect(() => {
    if (!currentStepConfig?.onEnter) {
      previousStepRef.current = currentStep;
      return;
    }

    const previousStep = previousStepRef.current;
    previousStepRef.current = currentStep;
    if (previousStep === currentStep) {
      return;
    }

    void execute(currentStepConfig.onEnter, {
      step: currentStep,
      values: { ...accumulatedData, ...stepValues },
    });
  }, [
    accumulatedData,
    currentStep,
    currentStepConfig?.onEnter,
    execute,
    stepValues,
  ]);

  const setStepValue = useCallback(
    (name: string, value: unknown) => {
      setStepData((currentData) => ({
        ...currentData,
        [currentStep]: {
          ...(currentData[currentStep] ?? {}),
          [name]: value,
        },
      }));
      setErrorsByStep((currentErrors) => ({
        ...currentErrors,
        [currentStep]: {
          ...(currentErrors[currentStep] ?? {}),
          [name]: undefined,
        },
      }));
    },
    [currentStep],
  );

  const touchField = useCallback(
    (name: string) => {
      setTouchedByStep((currentTouched) => ({
        ...currentTouched,
        [currentStep]: {
          ...(currentTouched[currentStep] ?? {}),
          [name]: true,
        },
      }));
    },
    [currentStep],
  );

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string | undefined> = {};
    const fields = currentStepConfig?.fields ?? [];
    for (const field of fields) {
      const error = validateField(field, stepValues[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    }

    for (const rule of currentStepConfig?.validate ?? []) {
      const fieldValue = stepValues[rule.field];
      const pseudoField = {
        name: rule.field,
        type: "text",
        validate: rule.rule,
      } as unknown as FieldConfig;
      const error = validateField(pseudoField, fieldValue);
      if (error) {
        errors[rule.field] = error;
      }
    }

    setErrorsByStep((currentErrors) => ({
      ...currentErrors,
      [currentStep]: errors,
    }));
    setTouchedByStep((currentTouched) => ({
      ...currentTouched,
      [currentStep]: Object.fromEntries(
        fields.map((field: FieldConfig) => [field.name, true]),
      ) as Record<string, boolean>,
    }));
    return errors;
  }, [currentStep, currentStepConfig, stepValues]);

  const runStepLeave = useCallback(() => {
    if (!currentStepConfig?.onLeave) {
      return;
    }
    return execute(currentStepConfig.onLeave, {
      step: currentStep,
      values: { ...accumulatedData, ...stepValues },
    });
  }, [
    accumulatedData,
    currentStep,
    currentStepConfig?.onLeave,
    execute,
    stepValues,
  ]);

  const runAsyncValidation = useCallback(
    async (values: Record<string, unknown>): Promise<boolean> => {
      if (!currentStepConfig?.asyncValidate || !api) {
        return true;
      }

      const request = resolveEndpointTarget(
        currentStepConfig.asyncValidate.endpoint,
        runtime?.resources,
        undefined,
        "POST",
      );
      const url = buildRequestUrl(request.endpoint, request.params);
      const payload = {
        ...values,
        ...(currentStepConfig.asyncValidate.body ?? {}),
      };
      const result = await api.post(url, payload);
      const record = (result ?? {}) as Record<string, unknown>;
      if (record.valid === false) {
        const asyncErrors =
          record.errors && typeof record.errors === "object"
            ? (record.errors as Record<string, string>)
            : {};
        setErrorsByStep((currentErrors) => ({
          ...currentErrors,
          [currentStep]: {
            ...(currentErrors[currentStep] ?? {}),
            ...asyncErrors,
          },
        }));
        setTouchedByStep((currentTouched) => ({
          ...currentTouched,
          [currentStep]: {
            ...(currentTouched[currentStep] ?? {}),
            ...Object.fromEntries(
              Object.keys(asyncErrors).map((key) => [key, true]),
            ),
          },
        }));
        return false;
      }
      return true;
    },
    [api, currentStep, currentStepConfig?.asyncValidate, runtime?.resources],
  );

  const nextStep = useCallback((): boolean | Promise<boolean> => {
    if (!currentStepConfig) {
      return false;
    }

    const proceedAfterLeave = (): boolean | Promise<boolean> => {
      const errors = validateCurrentStep();
      if (hasErrors(errors)) {
        return false;
      }

      const nextValues = {
        ...accumulatedData,
        ...stepValues,
      };

      const finishTransition = (): boolean | Promise<boolean> => {
        if (isLastStep) {
          setIsSubmitting(true);
          setSubmitError(null);

          const submitFlow = async (): Promise<boolean> => {
            try {
              if (config.submitEndpoint && api) {
                const request = resolveEndpointTarget(
                  config.submitEndpoint,
                  runtime?.resources,
                  undefined,
                  "POST",
                );
                const url = buildRequestUrl(request.endpoint, request.params);
                switch (request.method) {
                  case "PUT":
                    await api.put(url, nextValues);
                    break;
                  case "PATCH":
                    await api.patch(url, nextValues);
                    break;
                  default:
                    await api.post(url, nextValues);
                    break;
                }
              }
              if (config.onComplete) {
                await execute(config.onComplete, {
                  data: nextValues,
                  route: {
                    id: routeRuntime?.currentRoute?.id,
                    path: routeRuntime?.currentPath,
                  },
                });
              }
              setIsComplete(true);
              return true;
            } catch (error) {
              setSubmitError(
                error instanceof Error ? error : new Error("Submission failed"),
              );
              return false;
            } finally {
              setIsSubmitting(false);
            }
          };

          return submitFlow();
        }

        transitionTo(currentStep + 1);
        return true;
      };

      if (currentStepConfig.asyncValidate && api) {
        return runAsyncValidation(nextValues).then((asyncValid) => {
          if (!asyncValid) {
            return false;
          }
          return finishTransition();
        });
      }

      return finishTransition();
    };

    const leaveResult = runStepLeave();
    if (isPromiseLike(leaveResult)) {
      return leaveResult.then(() => proceedAfterLeave());
    }

    return proceedAfterLeave();
  }, [
    accumulatedData,
    api,
    config.onComplete,
    config.submitEndpoint,
    currentStep,
    currentStepConfig,
    execute,
    isLastStep,
    routeRuntime?.currentPath,
    routeRuntime?.currentRoute?.id,
    runAsyncValidation,
    runStepLeave,
    runtime?.resources,
    stepValues,
    transitionTo,
    validateCurrentStep,
  ]);

  const prevStep = useCallback((): void | Promise<void> => {
    if (isFirstStep) {
      return;
    }

    const leaveResult = runStepLeave();
    if (isPromiseLike(leaveResult)) {
      return leaveResult.then(() => {
        transitionTo(currentStep - 1);
      });
    }

    transitionTo(currentStep - 1);
  }, [currentStep, isFirstStep, runStepLeave, transitionTo]);

  const skipStep = useCallback((): void | Promise<void> => {
    if (!canSkip) {
      return;
    }

    const leaveResult = runStepLeave();
    if (isPromiseLike(leaveResult)) {
      return leaveResult.then(() => {
        transitionTo(currentStep + 1);
      });
    }

    transitionTo(currentStep + 1);
  }, [canSkip, currentStep, runStepLeave, transitionTo]);

  const resetWizard = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setCurrentStep(0);
    setStepData({});
    setErrorsByStep({});
    setTouchedByStep({});
    setIsSubmitting(false);
    setSubmitError(null);
    setIsComplete(false);
    setIsAnimating(false);
    if (publish) {
      publish(null);
    }
  }, [publish]);

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
    canSkip,
    nextStep,
    prevStep,
    skipStep,
    resetWizard,
    isSubmitting,
    submitError,
    isComplete,
    isAnimating,
  };
}
