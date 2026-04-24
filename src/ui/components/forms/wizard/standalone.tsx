"use client";

import React from "react";
import type { CSSProperties } from "react";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import { SelectControl } from "../select";
import { TextareaControl } from "../textarea";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface WizardFieldConfig {
  /** Field name used as the key in step values, errors, and touched maps. */
  name: string;
  /** Input type (e.g. "text", "email", "select", "textarea", "checkbox", "number"). */
  type: string;
  /** Label text displayed above the field. */
  label?: string;
  /** Descriptive text displayed between the label and the input. */
  description?: string;
  /** Helper text displayed below the field when there is no error. */
  helperText?: string;
  /** Placeholder text shown inside the input. */
  placeholder?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Available options for select fields. */
  options?: Array<{ label: string; value: string }>;
  /** Validation rules applied to the field value. */
  validate?: {
    /** Minimum character length for text fields. */
    minLength?: number;
    /** Maximum character length for text fields. */
    maxLength?: number;
    /** Minimum numeric value. */
    min?: number;
    /** Maximum numeric value. */
    max?: number;
    /** Regex pattern for validation. */
    pattern?: string;
    /** Value that this field must match. */
    equals?: string;
    /** Custom validation error message. */
    message?: string;
  };
  /** Alias for validate -- validation rules applied to the field value. */
  validation?: {
    /** Minimum character length for text fields. */
    minLength?: number;
    /** Maximum character length for text fields. */
    maxLength?: number;
    /** Minimum numeric value. */
    min?: number;
    /** Maximum numeric value. */
    max?: number;
    /** Regex pattern for validation. */
    pattern?: string;
    /** Value that this field must match. */
    equals?: string;
    /** Custom validation error message. */
    message?: string;
  };
  /** Slot overrides for sub-elements (field, label, input, helper, error). */
  slots?: Record<string, Record<string, unknown>>;
}

export interface WizardStepDef {
  /** Step heading displayed in the panel header. */
  title?: string;
  /** Descriptive text displayed below the step title. */
  description?: string;
  /** Custom label for the step's "Next" or "Submit" button. */
  submitLabel?: string;
  /** Whether this step can be skipped. */
  allowSkip?: boolean;
  /** Field configurations rendered inside this step. */
  fields: WizardFieldConfig[];
  /** Slot overrides for sub-elements (panel, header, title, stepMarker). */
  slots?: Record<string, Record<string, unknown>>;
}

export interface WizardState {
  /** Zero-based index of the current step. */
  currentStep: number;
  /** Total number of steps in the wizard. */
  totalSteps: number;
  /** Whether the current step is the first step. */
  isFirstStep: boolean;
  /** Whether the current step is the last step. */
  isLastStep: boolean;
  /** Current field values for the active step. */
  stepValues: Record<string, unknown>;
  /** Validation errors for the active step keyed by field name. */
  stepErrors: Record<string, string | undefined>;
  /** Map of field names to whether they have been touched/blurred. */
  stepTouched: Record<string, boolean>;
  /** Sets a field value in the current step. */
  setStepValue: (name: string, value: unknown) => void;
  /** Marks a field as touched in the current step. */
  touchField: (name: string) => void;
  /** Whether the current step can be skipped. */
  canSkip: boolean;
  /** Advances to the next step after validation. Returns false if blocked. */
  nextStep: () => boolean | Promise<boolean>;
  /** Returns to the previous step. */
  prevStep: () => void | Promise<void>;
  /** Skips the current step without validation. */
  skipStep: () => void | Promise<void>;
  /** Resets the wizard to the first step and clears all values. */
  resetWizard: () => void;
  /** Whether the wizard is currently submitting on the final step. */
  isSubmitting: boolean;
  /** Error returned from the final step submission, if any. */
  submitError: Error | null;
  /** Whether the wizard has completed all steps successfully. */
  isComplete: boolean;
  /** Whether a step transition animation is in progress. */
  isAnimating: boolean;
}

export interface WizardBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Array of step definitions with fields and metadata. */
  steps: WizardStepDef[];
  /** Wizard state object (from useWizard hook or custom implementation). */
  state: WizardState;
  /** Label for the final submit button on the last step. */
  submitLabel?: string;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

const ANIMATION_DURATION_VAR = "var(--sn-duration-normal, 200ms)";
const ANIMATION_EASE_VAR = "var(--sn-ease-default, ease)";

function resolveFieldSurface(
  rootId: string,
  stepIndex: number,
  field: WizardFieldConfig,
  slotName: string,
  activeStates: Array<"invalid" | "disabled">,
) {
  return resolveSurfacePresentation({
    surfaceId: `${rootId}-${slotName}-${stepIndex}-${field.name}`,
    componentSurface: field.slots?.[slotName],
    activeStates,
  });
}

function StandaloneWizardFieldRenderer({
  rootId,
  stepIndex,
  field,
  value,
  error,
  showError,
  onChange,
  onBlur,
}: {
  rootId: string;
  stepIndex: number;
  field: WizardFieldConfig;
  value: unknown;
  error: string | undefined;
  showError: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}) {
  const label = field.label ?? field.name;
  const description = field.description;
  const helperText = field.helperText;
  const placeholder = field.placeholder;
  const fieldId = `sn-wizard-field-${stepIndex}-${field.name}`;
  const hasError = showError && Boolean(error);
  const describedBy = [
    description ? `${fieldId}-description` : null,
    helperText ? `${fieldId}-helper` : null,
    hasError && error ? `${fieldId}-error` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;
  const activeStates = [
    ...(hasError ? (["invalid"] as const) : []),
    ...(field.disabled ? (["disabled"] as const) : []),
  ];
  const fieldSurface = resolveFieldSurface(rootId, stepIndex, field, "field", activeStates);
  const labelSurface = resolveFieldSurface(rootId, stepIndex, field, "label", activeStates);
  const descriptionSurface = resolveFieldSurface(rootId, stepIndex, field, "description", []);
  const inputSurface = resolveFieldSurface(rootId, stepIndex, field, "input", activeStates);
  const helperSurface = resolveFieldSurface(rootId, stepIndex, field, "helper", []);
  const errorSurface = resolveFieldSurface(rootId, stepIndex, field, "error", hasError ? ["invalid"] : []);
  const requiredIndicatorSurface = resolveFieldSurface(rootId, stepIndex, field, "requiredIndicator", []);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--sn-spacing-sm, 0.5rem)",
    borderRadius: "var(--sn-radius-md, 0.375rem)",
    border: `var(--sn-border-default, 1px) solid ${hasError ? "var(--sn-color-destructive, #ef4444)" : "var(--sn-color-border, #e5e7eb)"}`,
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
    color: "var(--sn-color-foreground, #111827)",
    backgroundColor: field.disabled
      ? "var(--sn-color-secondary, #f3f4f6)"
      : "var(--sn-color-card, #ffffff)",
    boxSizing: "border-box",
    ...(inputSurface.style as React.CSSProperties),
  };

  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = (
        <TextareaControl
          textareaId={fieldId}
          name={field.name}
          value={(value as string) ?? ""}
          disabled={field.disabled}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          placeholder={placeholder}
          onChangeText={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${stepIndex}-${field.name}`}
          className={inputSurface.className}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      );
      break;
    case "select":
      input = (
        <SelectControl
          selectId={fieldId}
          name={field.name}
          value={(value as string) ?? ""}
          disabled={field.disabled}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeValue={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${stepIndex}-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        >
          <option value="">{placeholder ?? "Select..."}</option>
          {Array.isArray(field.options)
            ? field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : null}
        </SelectControl>
      );
      break;
    case "checkbox":
    case "switch":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          disabled={field.disabled}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeChecked={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${stepIndex}-${field.name}`}
          className={inputSurface.className}
          style={{
            width: field.type === "switch" ? "2.5rem" : "16px",
            height: field.type === "switch" ? "1.25rem" : "16px",
            accentColor: "var(--sn-color-primary, #2563eb)",
            ...(inputSurface.style as React.CSSProperties),
          }}
        />
      );
      break;
    case "number":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="number"
          value={
            value === "" || value === undefined || value === null
              ? ""
              : String(value)
          }
          disabled={field.disabled}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          placeholder={placeholder}
          onChangeText={(nextValue) => {
            onChange(nextValue === "" ? "" : Number(nextValue));
          }}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${stepIndex}-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;
    default:
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type={(field.type === "datetime" ? "datetime-local" : field.type) as Parameters<typeof InputControl>[0]["type"]}
          value={(value as string) ?? ""}
          disabled={field.disabled}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          placeholder={placeholder}
          onChangeText={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${stepIndex}-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;
  }

  if (field.type === "checkbox" || field.type === "switch") {
    return (
      <div
        data-sn-field={field.name}
        data-snapshot-id={`${rootId}-field-${stepIndex}-${field.name}`}
        className={fieldSurface.className}
        style={{
          marginBottom: "var(--sn-spacing-md, 0.75rem)",
          ...(fieldSurface.style as React.CSSProperties),
        }}
      >
        <label
          htmlFor={fieldId}
          data-snapshot-id={`${rootId}-label-${stepIndex}-${field.name}`}
          className={labelSurface.className}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            cursor: field.disabled ? "not-allowed" : "pointer",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            ...(labelSurface.style as React.CSSProperties),
          }}
        >
          {input}
          <span>{label}</span>
        </label>
        {description ? (
          <div
            id={`${fieldId}-description`}
            data-snapshot-id={`${rootId}-description-${stepIndex}-${field.name}`}
            className={descriptionSurface.className}
            style={{
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              ...(descriptionSurface.style as React.CSSProperties),
            }}
          >
            {description}
          </div>
        ) : null}
        {helperText ? (
          <div
            id={`${fieldId}-helper`}
            data-snapshot-id={`${rootId}-helper-${stepIndex}-${field.name}`}
            className={helperSurface.className}
            style={{
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              ...(helperSurface.style as React.CSSProperties),
            }}
          >
            {helperText}
          </div>
        ) : null}
        {hasError && error ? (
          <div
            id={`${fieldId}-error`}
            role="alert"
            data-snapshot-id={`${rootId}-error-${stepIndex}-${field.name}`}
            className={errorSurface.className}
            style={{
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-destructive, #ef4444)",
              ...(errorSurface.style as React.CSSProperties),
            }}
          >
            {error}
          </div>
        ) : null}
        <SurfaceStyles css={fieldSurface.scopedCss} />
        <SurfaceStyles css={labelSurface.scopedCss} />
        <SurfaceStyles css={descriptionSurface.scopedCss} />
        <SurfaceStyles css={inputSurface.scopedCss} />
        <SurfaceStyles css={helperSurface.scopedCss} />
        <SurfaceStyles css={errorSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div
      data-sn-field={field.name}
      data-snapshot-id={`${rootId}-field-${stepIndex}-${field.name}`}
      className={fieldSurface.className}
      style={{
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        ...(fieldSurface.style as React.CSSProperties),
      }}
    >
      <label
        htmlFor={fieldId}
        data-snapshot-id={`${rootId}-label-${stepIndex}-${field.name}`}
        className={labelSurface.className}
        style={{
          display: "block",
          marginBottom: "var(--sn-spacing-xs, 0.25rem)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          fontWeight: "var(--sn-font-weight-medium, 500)",
          color: "var(--sn-color-foreground, #111827)",
          ...(labelSurface.style as React.CSSProperties),
        }}
      >
        {label}
        {field.required ? (
          <span
            aria-hidden="true"
            data-snapshot-id={`${rootId}-requiredIndicator-${stepIndex}-${field.name}`}
            className={requiredIndicatorSurface.className}
            style={{
              color: "var(--sn-color-destructive, #ef4444)",
              marginLeft: "var(--sn-spacing-2xs, 2px)",
              ...(requiredIndicatorSurface.style as React.CSSProperties),
            }}
          >
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <div
          id={`${fieldId}-description`}
          data-snapshot-id={`${rootId}-description-${stepIndex}-${field.name}`}
          className={descriptionSurface.className}
          style={{
            marginBottom: "var(--sn-spacing-xs, 0.25rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            ...(descriptionSurface.style as React.CSSProperties),
          }}
        >
          {description}
        </div>
      ) : null}
      {input}
      {helperText ? (
        <div
          id={`${fieldId}-helper`}
          data-snapshot-id={`${rootId}-helper-${stepIndex}-${field.name}`}
          className={helperSurface.className}
          style={{
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            ...(helperSurface.style as React.CSSProperties),
          }}
        >
          {helperText}
        </div>
      ) : null}
      {hasError && error ? (
        <div
          id={`${fieldId}-error`}
          role="alert"
          data-snapshot-id={`${rootId}-error-${stepIndex}-${field.name}`}
          className={errorSurface.className}
          style={{
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-destructive, #ef4444)",
            ...(errorSurface.style as React.CSSProperties),
          }}
        >
          {error}
        </div>
      ) : null}
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={helperSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={requiredIndicatorSurface.scopedCss} />
    </div>
  );
}

function StandaloneWizardProgress({
  rootId,
  currentStep,
  totalSteps,
  steps,
  slots,
}: {
  rootId: string;
  currentStep: number;
  totalSteps: number;
  steps: WizardStepDef[];
  slots?: Record<string, Record<string, unknown>>;
}) {
  const stepsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-steps`,
    implementationBase: {
      display: "flex",
      alignItems: "stretch",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    } as Record<string, unknown>,
    componentSurface: slots?.steps,
  });

  return (
    <div
      data-wizard-progress=""
      data-snapshot-id={`${rootId}-steps`}
      className={stepsSurface.className}
      style={stepsSurface.style}
    >
      {steps.map((step, index) => {
        const stepTitle = step.title ?? `Step ${index + 1}`;
        const stepDescription = step.description;
        const isCurrent = index === currentStep;
        const isCompleted = index < currentStep;
        const stepStates = [
          ...(isCurrent ? (["selected", "current"] as const) : []),
          ...(isCompleted ? (["completed"] as const) : []),
        ];
        const stepSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-step-${index}`,
          implementationBase: {
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            minWidth: 0,
          } as Record<string, unknown>,
          componentSurface: slots?.step,
          itemSurface: step.slots?.step,
          activeStates: stepStates,
        });
        const markerSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-stepMarker-${index}`,
          implementationBase: {
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "var(--sn-radius-full, 9999px)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)",
            backgroundColor:
              index <= currentStep
                ? "var(--sn-color-primary, #111827)"
                : "var(--sn-color-muted, #f3f4f6)",
            color:
              index <= currentStep
                ? "var(--sn-color-primary-foreground, #ffffff)"
                : "var(--sn-color-muted-foreground, #6b7280)",
            transition: `background-color ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
            flexShrink: 0,
          } as Record<string, unknown>,
          componentSurface: slots?.stepMarker,
          itemSurface: step.slots?.stepMarker,
          activeStates: stepStates,
        });
        const labelSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-stepLabel-${index}`,
          implementationBase: {
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: isCurrent
              ? "var(--sn-color-foreground, #111827)"
              : "var(--sn-color-muted-foreground, #6b7280)",
          } as Record<string, unknown>,
          componentSurface: slots?.stepLabel,
          itemSurface: step.slots?.stepLabel,
          activeStates: stepStates,
        });
        const stepBodySurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-stepBody-${index}`,
          implementationBase: {
            minWidth: 0,
          } as Record<string, unknown>,
          componentSurface: slots?.stepBody,
          itemSurface: step.slots?.stepBody,
          activeStates: stepStates,
        });
        const descriptionSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-stepDescription-${index}`,
          implementationBase: {
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          } as Record<string, unknown>,
          componentSurface: slots?.stepDescription,
          itemSurface: step.slots?.stepDescription,
          activeStates: stepStates,
        });
        const connectorSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-stepConnector-${index}`,
          implementationBase: {
            flex: 1,
            height: "1px",
            backgroundColor:
              index < currentStep
                ? "var(--sn-color-primary, #111827)"
                : "var(--sn-color-border, #e5e7eb)",
            transition: `background-color ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
            alignSelf: "center",
          } as Record<string, unknown>,
          componentSurface: slots?.stepConnector,
          itemSurface: step.slots?.stepConnector,
          activeStates: [
            ...(index < currentStep ? (["completed"] as const) : []),
            ...(index === currentStep ? (["active"] as const) : []),
          ],
        });

        return (
          <React.Fragment key={index}>
            <div
              data-snapshot-id={`${rootId}-step-${index}`}
              className={stepSurface.className}
              style={stepSurface.style}
            >
              <span
                data-wizard-step-indicator=""
                data-snapshot-id={`${rootId}-stepMarker-${index}`}
                className={markerSurface.className}
                style={markerSurface.style}
              >
                {isCompleted ? "\u2713" : index + 1}
              </span>
              <span
                data-snapshot-id={`${rootId}-stepBody-${index}`}
                className={stepBodySurface.className}
                style={stepBodySurface.style}
              >
                <span
                  data-snapshot-id={`${rootId}-stepLabel-${index}`}
                  className={labelSurface.className}
                  style={labelSurface.style}
                >
                  {stepTitle}
                </span>
                {stepDescription && totalSteps <= 4 ? (
                  <span
                    data-snapshot-id={`${rootId}-stepDescription-${index}`}
                    className={descriptionSurface.className}
                    style={{
                      display: "block",
                      ...(descriptionSurface.style as React.CSSProperties),
                    }}
                  >
                    {stepDescription}
                  </span>
                ) : null}
              </span>
            </div>
            {index < totalSteps - 1 ? (
              <div
                data-snapshot-id={`${rootId}-stepConnector-${index}`}
                className={connectorSurface.className}
                style={connectorSurface.style}
              />
            ) : null}
            <SurfaceStyles css={stepSurface.scopedCss} />
            <SurfaceStyles css={markerSurface.scopedCss} />
            <SurfaceStyles css={stepBodySurface.scopedCss} />
            <SurfaceStyles css={labelSurface.scopedCss} />
            <SurfaceStyles css={descriptionSurface.scopedCss} />
            <SurfaceStyles css={connectorSurface.scopedCss} />
          </React.Fragment>
        );
      })}
      <SurfaceStyles css={stepsSurface.scopedCss} />
    </div>
  );
}

/**
 * Standalone WizardBase -- a multi-step form wizard with progress indicator,
 * step navigation, field validation, and completion state. No manifest context required.
 *
 * @example
 * ```tsx
 * <WizardBase
 *   steps={[
 *     { title: "Account", fields: [{ name: "email", type: "email", required: true }] },
 *     { title: "Profile", fields: [{ name: "name", type: "text" }] },
 *   ]}
 *   state={wizardState}
 *   submitLabel="Create Account"
 * />
 * ```
 */
export function WizardBase({
  id,
  steps,
  state: wizard,
  submitLabel: submitLabelProp,
  className,
  style,
  slots,
}: WizardBaseProps) {
  const rootId = id ?? "wizard";
  const currentStep = steps[wizard.currentStep];
  const resolvedSubmitLabel = submitLabelProp ?? "Submit";
  const currentStepTitle = currentStep?.title ?? "";
  const currentStepDescription = currentStep?.description;
  const submitLabel =
    currentStep?.submitLabel ??
    (wizard.isLastStep ? resolvedSubmitLabel : "Next");
  const isSkippable = wizard.canSkip;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      borderRadius: "var(--sn-radius-md, 6px)",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      backgroundColor: "var(--sn-color-card, #fff)",
      overflow: "hidden",
    } as Record<string, unknown>,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      padding: "var(--sn-spacing-lg, 16px)",
      opacity: wizard.isAnimating ? 0 : 1,
      transform: wizard.isAnimating ? "translateX(8px)" : "translateX(0)",
      transition: `opacity ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}, transform ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
    } as Record<string, unknown>,
    componentSurface: slots?.panel,
    itemSurface: currentStep?.slots?.panel,
    activeStates: wizard.isAnimating ? ["active"] : [],
  });
  const progressSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-progress`,
    implementationBase: {
      padding: "var(--sn-spacing-md, 12px) var(--sn-spacing-lg, 16px)",
      borderBottom:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
    } as Record<string, unknown>,
    componentSurface: slots?.progress,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 4px)",
      marginBottom: "var(--sn-spacing-md, 12px)",
    } as Record<string, unknown>,
    componentSurface: slots?.header,
    itemSurface: currentStep?.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      margin: 0,
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-foreground, #111827)",
    } as Record<string, unknown>,
    componentSurface: slots?.title,
    itemSurface: currentStep?.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      margin: 0,
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: slots?.description,
    itemSurface: currentStep?.slots?.description,
  });
  const completionStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-completionState`,
    implementationBase: {
      textAlign: "center",
    } as Record<string, unknown>,
    componentSurface: slots?.completionState,
  });
  const completionTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-completionTitle`,
    implementationBase: {
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-success, #16a34a)",
      marginBottom: "var(--sn-spacing-sm, 8px)",
    } as Record<string, unknown>,
    componentSurface: slots?.completionTitle,
  });
  const completionDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-completionDescription`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      marginBottom: "var(--sn-spacing-md, 12px)",
    } as Record<string, unknown>,
    componentSurface: slots?.completionDescription,
  });
  const submitErrorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-submitError`,
    implementationBase: {
      padding: "var(--sn-spacing-sm, 8px)",
      marginTop: "var(--sn-spacing-md, 12px)",
      borderRadius: "var(--sn-radius-md, 6px)",
      backgroundColor: "var(--sn-color-destructive, #ef4444)",
      color: "var(--sn-color-destructive-foreground, #fff)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
    } as Record<string, unknown>,
    componentSurface: slots?.submitError,
    itemSurface: currentStep?.slots?.submitError,
    activeStates: wizard.submitError ? ["invalid"] : [],
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actions`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "var(--sn-spacing-md, 12px) var(--sn-spacing-lg, 16px)",
      borderTop:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      gap: "var(--sn-spacing-sm, 8px)",
    } as Record<string, unknown>,
    componentSurface: slots?.actions,
  });
  const actionGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actionGroup`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-sm, 8px)",
    } as Record<string, unknown>,
    componentSurface: slots?.actionGroup,
  });

  if (wizard.isComplete) {
    return (
      <div
        data-snapshot-component="wizard"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-panel`}
          className={panelSurface.className}
          style={panelSurface.style}
        >
          <div
            data-snapshot-id={`${rootId}-completionState`}
            className={completionStateSurface.className}
            style={completionStateSurface.style}
          >
            <div
              data-snapshot-id={`${rootId}-completionTitle`}
              className={completionTitleSurface.className}
              style={completionTitleSurface.style}
            >
              {"\u2713"} Complete
            </div>
            <div
              data-snapshot-id={`${rootId}-completionDescription`}
              className={completionDescriptionSurface.className}
              style={completionDescriptionSurface.style}
            >
              Your submission was successful.
            </div>
            <ButtonControl
              type="button"
              variant="outline"
              size="sm"
              onClick={wizard.resetWizard}
              surfaceId={`${rootId}-submitButton`}
              surfaceConfig={slots?.submitButton}
            >
              Reset
            </ButtonControl>
          </div>
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={panelSurface.scopedCss} />
        <SurfaceStyles css={completionStateSurface.scopedCss} />
        <SurfaceStyles css={completionTitleSurface.scopedCss} />
        <SurfaceStyles css={completionDescriptionSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="wizard"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-progress`}
        className={progressSurface.className}
        style={progressSurface.style}
      >
        <StandaloneWizardProgress
          rootId={rootId}
          currentStep={wizard.currentStep}
          totalSteps={wizard.totalSteps}
          steps={steps}
          slots={slots}
        />
      </div>

      <div
        data-wizard-step-content=""
        data-snapshot-id={`${rootId}-panel`}
        className={panelSurface.className}
        style={panelSurface.style}
      >
        {currentStep ? (
          <div
            data-snapshot-id={`${rootId}-header`}
            className={headerSurface.className}
            style={headerSurface.style}
          >
            <h3
              data-wizard-step-title=""
              data-snapshot-id={`${rootId}-title`}
              className={titleSurface.className}
              style={titleSurface.style}
            >
              {currentStepTitle}
            </h3>
            {currentStepDescription ? (
              <p
                data-wizard-step-description=""
                data-snapshot-id={`${rootId}-description`}
                className={descriptionSurface.className}
                style={descriptionSurface.style}
              >
                {currentStepDescription}
              </p>
            ) : null}
          </div>
        ) : null}

        {currentStep?.fields.map((field: WizardFieldConfig) => (
          <StandaloneWizardFieldRenderer
            key={field.name}
            rootId={rootId}
            stepIndex={wizard.currentStep}
            field={field}
            value={wizard.stepValues[field.name]}
            error={wizard.stepErrors[field.name]}
            showError={Boolean(wizard.stepTouched[field.name])}
            onChange={(value) => wizard.setStepValue(field.name, value)}
            onBlur={() => wizard.touchField(field.name)}
          />
        ))}

        {wizard.submitError ? (
          <div
            role="alert"
            data-wizard-submit-error=""
            data-snapshot-id={`${rootId}-submitError`}
            className={submitErrorSurface.className}
            style={submitErrorSurface.style}
          >
            {wizard.submitError.message}
          </div>
        ) : null}
      </div>

      <div
        data-wizard-nav=""
        data-snapshot-id={`${rootId}-actions`}
        className={actionsSurface.className}
        style={actionsSurface.style}
      >
        <ButtonControl
          type="button"
          variant="outline"
          size="sm"
          disabled={wizard.isFirstStep || wizard.isAnimating}
          onClick={() => {
            void wizard.prevStep();
          }}
          surfaceId={`${rootId}-backButton`}
          surfaceConfig={slots?.backButton}
          activeStates={
            wizard.isFirstStep || wizard.isAnimating ? ["disabled"] : []
          }
        >
          Back
        </ButtonControl>

        <div
          data-snapshot-id={`${rootId}-actionGroup`}
          className={actionGroupSurface.className}
          style={actionGroupSurface.style}
        >
          {isSkippable ? (
            <ButtonControl
              type="button"
              variant="ghost"
              size="sm"
              disabled={wizard.isAnimating}
              onClick={() => {
                void wizard.skipStep();
              }}
              surfaceId={`${rootId}-nextButton-skip`}
              surfaceConfig={slots?.nextButton}
              activeStates={wizard.isAnimating ? ["disabled"] : []}
            >
              Skip
            </ButtonControl>
          ) : null}

          <ButtonControl
            type="button"
            variant="default"
            size="sm"
            disabled={wizard.isSubmitting || wizard.isAnimating}
            onClick={() => {
              void wizard.nextStep();
            }}
            surfaceId={`${rootId}-${wizard.isLastStep ? "submitButton" : "nextButton"}`}
            surfaceConfig={
              wizard.isLastStep
                ? slots?.submitButton
                : slots?.nextButton
            }
            activeStates={
              wizard.isSubmitting || wizard.isAnimating ? ["disabled"] : []
            }
          >
            {wizard.isSubmitting ? "Submitting..." : submitLabel}
          </ButtonControl>
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={progressSurface.scopedCss} />
      <SurfaceStyles css={panelSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={submitErrorSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
      <SurfaceStyles css={actionGroupSurface.scopedCss} />
    </div>
  );
}
