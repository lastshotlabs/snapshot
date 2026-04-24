'use client';

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { StepperBase } from "./standalone";
import type { StepperBaseStep } from "./standalone";
import type { StepConfig, StepperConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, publishes state, and renders
 * manifest children in step content, delegates layout to StepperBase.
 */
export function Stepper({ config }: { config: StepperConfig }) {
  const resolvedActiveStep = useSubscribe(config.activeStep ?? 0);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ steps: config.steps });
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const initialStep =
    typeof resolvedActiveStep === "number" ? resolvedActiveStep : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    if (typeof resolvedActiveStep === "number") {
      setCurrentStep(resolvedActiveStep);
    }
  }, [resolvedActiveStep]);

  const resolvedSteps = useMemo<StepperBaseStep[]>(
    () =>
      (((resolvedConfig.steps as StepperConfig["steps"] | undefined) ??
        config.steps) as StepConfig[]).map((step) => ({
        title:
          resolveOptionalPrimitiveValue(step.title, primitiveOptions) ?? "",
        description: resolveOptionalPrimitiveValue(
          step.description,
          primitiveOptions,
        ),
        icon: step.icon,
        disabled: step.disabled,
        content: step.content?.length ? (
          <>
            {step.content.map((child: ComponentConfig, childIndex: number) => (
              <ComponentRenderer
                key={
                  (child as ComponentConfig).id ??
                  `stepper-child-${childIndex}`
                }
                config={child as ComponentConfig}
              />
            ))}
          </>
        ) : undefined,
        slots: step.slots as Record<string, Record<string, unknown>>,
      })),
    [config.steps, primitiveOptions, resolvedConfig.steps],
  );

  useEffect(() => {
    if (!publish) {
      return;
    }

    publish({
      activeStep: currentStep,
      title: resolvedSteps[currentStep]?.title,
      isFirst: currentStep === 0,
      isLast: currentStep === resolvedSteps.length - 1,
    });
  }, [currentStep, publish, resolvedSteps]);

  if (visible === false) {
    return null;
  }

  const handleStepChange = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <StepperBase
      id={config.id}
      steps={resolvedSteps}
      activeStep={currentStep}
      orientation={config.orientation}
      variant={config.variant}
      clickable={config.clickable}
      onStepChange={handleStepChange}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
