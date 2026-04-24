"use client";

import type { CSSProperties } from "react";
import { useResolveFrom } from "../../../context/hooks";
import { useWizard } from "./hook";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { WizardBase } from "./standalone";
import type { WizardStepDef, WizardFieldConfig } from "./standalone";
import type { WizardConfig, WizardStepConfig } from "./types";
import type { PrimitiveValueOptions } from "../../primitives/resolve-value";

function resolveText(
  value: unknown,
  primitiveOptions: PrimitiveValueOptions,
): string | undefined {
  return resolveOptionalPrimitiveValue(value, primitiveOptions);
}

function resolveStaticFieldOptions(
  field: { options?: unknown[] },
  primitiveOptions: PrimitiveValueOptions,
) {
  if (!Array.isArray(field.options)) {
    return field.options;
  }

  return (field.options as Record<string, unknown>[]).map((option) => ({
    ...option,
    label: resolveText(option.label, primitiveOptions) ?? (option.value as string),
  }));
}

function resolveSteps(
  steps: WizardStepConfig[],
  primitiveOptions: PrimitiveValueOptions,
): WizardStepDef[] {
  return steps.map((step) => ({
    title: resolveText(step.title, primitiveOptions),
    description: resolveText(step.description, primitiveOptions),
    submitLabel: resolveText(step.submitLabel, primitiveOptions),
    allowSkip: step.allowSkip,
    fields: step.fields.map((field: Record<string, unknown> & { name: string; type: string }): WizardFieldConfig => ({
      name: field.name,
      type: field.type,
      label: resolveText(field.label, primitiveOptions) ?? field.name,
      description: resolveText(field.description, primitiveOptions),
      helperText: resolveText(field.helperText, primitiveOptions),
      placeholder: resolveText(field.placeholder, primitiveOptions),
      required: typeof field.required === "boolean" ? field.required : undefined,
      disabled: field.disabled as boolean | undefined,
      options: resolveStaticFieldOptions(field as { options?: unknown[] }, primitiveOptions) as Array<{ label: string; value: string }> | undefined,
      validate: field.validate as WizardFieldConfig["validate"],
      validation: field.validation as WizardFieldConfig["validation"],
      slots: field.slots as Record<string, Record<string, unknown>> | undefined,
    })),
    slots: step.slots,
  }));
}

/**
 * Render a multi-step form wizard with built-in validation, step state, and slot-aware styling.
 */
export function Wizard({ config }: { config: WizardConfig }) {
  const wizard = useWizard(config);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    submitLabel: config.submitLabel,
    steps: config.steps,
  });
  const resolvedSteps =
    (resolvedConfig.steps as WizardStepConfig[] | undefined) ?? config.steps;
  const resolvedSubmitLabel =
    resolveText(resolvedConfig.submitLabel, primitiveOptions) ?? "Submit";

  const steps = resolveSteps(resolvedSteps, primitiveOptions);
  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <WizardBase
      id={config.id}
      steps={steps}
      state={wizard}
      submitLabel={resolvedSubmitLabel}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
