"use client";

import React from "react";
import { useWizard } from "./hook";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import { SelectControl } from "../select";
import { TextareaControl } from "../textarea";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { WizardConfig, WizardStepConfig } from "./types";
import type { FieldConfig } from "../auto-form/types";

const ANIMATION_DURATION_VAR = "var(--sn-duration-normal, 200ms)";
const ANIMATION_EASE_VAR = "var(--sn-ease-default, ease)";

function resolveFieldSurface(
  rootId: string,
  stepIndex: number,
  field: FieldConfig,
  slotName:
    | "field"
    | "label"
    | "description"
    | "input"
    | "helper"
    | "error"
    | "requiredIndicator",
  activeStates: Array<"invalid" | "disabled">,
) {
  return resolveSurfacePresentation({
    surfaceId: `${rootId}-${slotName}-${stepIndex}-${field.name}`,
    componentSurface: field.slots?.[slotName],
    activeStates,
  });
}

function WizardFieldRenderer({
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
  field: FieldConfig;
  value: unknown;
  error: string | undefined;
  showError: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}) {
  const label = field.label ?? field.name;
  const fieldId = `sn-wizard-field-${stepIndex}-${field.name}`;
  const hasError = showError && Boolean(error);
  const activeStates = [
    ...(hasError ? (["invalid"] as const) : []),
    ...(field.disabled ? (["disabled"] as const) : []),
  ];
  const fieldSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "field",
    activeStates,
  );
  const labelSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "label",
    activeStates,
  );
  const descriptionSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "description",
    [],
  );
  const inputSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "input",
    activeStates,
  );
  const helperSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "helper",
    [],
  );
  const errorSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "error",
    hasError ? ["invalid"] : [],
  );
  const requiredIndicatorSurface = resolveFieldSurface(
    rootId,
    stepIndex,
    field,
    "requiredIndicator",
    [],
  );

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
          ariaDescribedBy={[
            field.description ? `${fieldId}-description` : null,
            field.helperText ? `${fieldId}-helper` : null,
            hasError && error ? `${fieldId}-error` : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined}
          ariaLabel={label}
          placeholder={field.placeholder}
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
          ariaDescribedBy={[
            field.description ? `${fieldId}-description` : null,
            field.helperText ? `${fieldId}-helper` : null,
            hasError && error ? `${fieldId}-error` : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined}
          ariaLabel={label}
          onChangeValue={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${stepIndex}-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        >
          <option value="">{field.placeholder ?? "Select..."}</option>
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
          ariaDescribedBy={[
            field.description ? `${fieldId}-description` : null,
            field.helperText ? `${fieldId}-helper` : null,
            hasError && error ? `${fieldId}-error` : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined}
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
          ariaDescribedBy={[
            field.description ? `${fieldId}-description` : null,
            field.helperText ? `${fieldId}-helper` : null,
            hasError && error ? `${fieldId}-error` : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined}
          ariaLabel={label}
          placeholder={field.placeholder}
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
          ariaDescribedBy={[
            field.description ? `${fieldId}-description` : null,
            field.helperText ? `${fieldId}-helper` : null,
            hasError && error ? `${fieldId}-error` : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined}
          ariaLabel={label}
          placeholder={field.placeholder}
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
        {field.description ? (
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
            {field.description}
          </div>
        ) : null}
        {field.helperText ? (
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
            {field.helperText}
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
      {field.description ? (
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
          {field.description}
        </div>
      ) : null}
      {input}
      {field.helperText ? (
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
          {field.helperText}
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

function WizardProgress({
  rootId,
  currentStep,
  totalSteps,
  steps,
  slots,
}: {
  rootId: string;
  currentStep: number;
  totalSteps: number;
  steps: WizardStepConfig[];
  slots?: WizardConfig["slots"];
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
                  {step.title}
                </span>
                {step.description && totalSteps <= 4 ? (
                  <span
                    data-snapshot-id={`${rootId}-stepDescription-${index}`}
                    className={descriptionSurface.className}
                    style={{
                      display: "block",
                      ...(descriptionSurface.style as React.CSSProperties),
                    }}
                  >
                    {step.description}
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
 * Render a multi-step form wizard with built-in validation, step state, and slot-aware styling.
 */
export function Wizard({ config }: { config: WizardConfig }) {
  const wizard = useWizard(config);
  const currentStepConfig = config.steps[wizard.currentStep];
  const submitLabel =
    currentStepConfig?.submitLabel ??
    (wizard.isLastStep ? config.submitLabel : "Next");
  const isSkippable = wizard.canSkip;
  const rootId = config.id ?? "wizard";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      borderRadius: "var(--sn-radius-md, 6px)",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      backgroundColor: "var(--sn-color-card, #fff)",
      overflow: "hidden",
    } as Record<string, unknown>,
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      padding: "var(--sn-spacing-lg, 16px)",
      opacity: wizard.isAnimating ? 0 : 1,
      transform: wizard.isAnimating ? "translateX(8px)" : "translateX(0)",
      transition: `opacity ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}, transform ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
    } as Record<string, unknown>,
    componentSurface: config.slots?.panel,
    itemSurface: currentStepConfig?.slots?.panel,
    activeStates: wizard.isAnimating ? ["active"] : [],
  });
  const progressSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-progress`,
    implementationBase: {
      padding: "var(--sn-spacing-md, 12px) var(--sn-spacing-lg, 16px)",
      borderBottom:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.progress,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 4px)",
      marginBottom: "var(--sn-spacing-md, 12px)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.header,
    itemSurface: currentStepConfig?.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      margin: 0,
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-foreground, #111827)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.title,
    itemSurface: currentStepConfig?.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      margin: 0,
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.description,
    itemSurface: currentStepConfig?.slots?.description,
  });
  const completionStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-completionState`,
    implementationBase: {
      textAlign: "center",
    } as Record<string, unknown>,
    componentSurface: config.slots?.completionState,
  });
  const completionTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-completionTitle`,
    implementationBase: {
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-success, #16a34a)",
      marginBottom: "var(--sn-spacing-sm, 8px)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.completionTitle,
  });
  const completionDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-completionDescription`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      marginBottom: "var(--sn-spacing-md, 12px)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.completionDescription,
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
    componentSurface: config.slots?.submitError,
    itemSurface: currentStepConfig?.slots?.submitError,
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
    componentSurface: config.slots?.actions,
  });
  const actionGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actionGroup`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-sm, 8px)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.actionGroup,
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
              surfaceConfig={config.slots?.submitButton}
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
        <WizardProgress
          rootId={rootId}
          currentStep={wizard.currentStep}
          totalSteps={wizard.totalSteps}
          steps={config.steps}
          slots={config.slots}
        />
      </div>

      <div
        data-wizard-step-content=""
        data-snapshot-id={`${rootId}-panel`}
        className={panelSurface.className}
        style={panelSurface.style}
      >
        {currentStepConfig ? (
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
              {currentStepConfig.title}
            </h3>
            {currentStepConfig.description ? (
              <p
                data-wizard-step-description=""
                data-snapshot-id={`${rootId}-description`}
                className={descriptionSurface.className}
                style={descriptionSurface.style}
              >
                {currentStepConfig.description}
              </p>
            ) : null}
          </div>
        ) : null}

        {currentStepConfig?.fields.map((field: FieldConfig) => (
          <WizardFieldRenderer
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
          surfaceConfig={config.slots?.backButton}
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
              surfaceConfig={config.slots?.nextButton}
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
                ? config.slots?.submitButton
                : config.slots?.nextButton
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
