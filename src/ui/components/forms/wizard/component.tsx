import React from "react";
import { useWizard } from "./hook";
import type { WizardConfig, WizardStepConfig } from "./types";
import type { FieldConfig } from "../auto-form/types";

/** Animation duration token (matches --sn-duration-normal). */
const ANIMATION_DURATION_VAR = "var(--sn-duration-normal, 200ms)";
const ANIMATION_EASE_VAR = "var(--sn-ease-default, ease)";

// ── Field renderer (same logic as AutoForm) ───────────────────────────────────

function WizardFieldRenderer({
  field,
  value,
  error,
  showError,
  onChange,
  onBlur,
}: {
  field: FieldConfig;
  value: unknown;
  error: string | undefined;
  showError: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}) {
  const label = field.label ?? field.name;
  const fieldId = `sn-wizard-field-${field.name}`;

  const commonProps = {
    id: fieldId,
    name: field.name,
    onBlur,
    "aria-invalid": showError && !!error ? true : undefined,
    "aria-describedby": showError && error ? `${fieldId}-error` : undefined,
  };

  let input: React.ReactNode;

  switch (field.type) {
    case "textarea":
      input = (
        <textarea
          {...commonProps}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "var(--sn-spacing-sm, 8px)",
            borderRadius: "var(--sn-radius-md, 6px)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            boxSizing: "border-box" as const,
          }}
        />
      );
      break;

    case "select":
      input = (
        <select
          {...commonProps}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "var(--sn-spacing-sm, 8px)",
            borderRadius: "var(--sn-radius-md, 6px)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            boxSizing: "border-box" as const,
          }}
        >
          <option value="">{field.placeholder ?? "Select..."}</option>
          {Array.isArray(field.options) &&
            field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      );
      break;

    case "checkbox":
      input = (
        <input
          {...commonProps}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
      break;

    case "number":
      input = (
        <input
          {...commonProps}
          type="number"
          value={
            value === "" || value === undefined || value === null
              ? ""
              : String(value)
          }
          placeholder={field.placeholder}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : Number(v));
          }}
          style={{
            width: "100%",
            padding: "var(--sn-spacing-sm, 8px)",
            borderRadius: "var(--sn-radius-md, 6px)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            boxSizing: "border-box" as const,
          }}
        />
      );
      break;

    default:
      input = (
        <input
          {...commonProps}
          type={field.type}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "var(--sn-spacing-sm, 8px)",
            borderRadius: "var(--sn-radius-md, 6px)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            boxSizing: "border-box" as const,
          }}
        />
      );
      break;
  }

  return (
    <div
      data-sn-field={field.name}
      style={{ marginBottom: "var(--sn-spacing-md, 12px)" }}
    >
      {field.type === "checkbox" ? (
        <label
          htmlFor={fieldId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 8px)",
            cursor: "pointer",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {input}
          <span>{label}</span>
        </label>
      ) : (
        <>
          <label
            htmlFor={fieldId}
            style={{
              display: "block",
              marginBottom: "var(--sn-spacing-xs, 4px)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: "var(--sn-font-weight-medium, 500)",
              color: "var(--sn-color-foreground, #111)",
            }}
          >
            {label}
            {field.required && (
              <span
                aria-hidden="true"
                style={{
                  color:
                    "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
                  marginLeft: "var(--sn-spacing-2xs, 2px)",
                }}
              >
                *
              </span>
            )}
          </label>
          {input}
        </>
      )}
      {showError && error && (
        <span
          id={`${fieldId}-error`}
          role="alert"
          data-sn-field-error
          style={{
            display: "block",
            marginTop: "var(--sn-spacing-xs, 4px)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

// ── Step progress indicator ───────────────────────────────────────────────────

function WizardProgress({
  currentStep,
  totalSteps,
  steps,
}: {
  currentStep: number;
  totalSteps: number;
  steps: WizardStepConfig[];
}) {
  return (
    <div
      data-wizard-progress
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-sm, 8px)",
        marginBottom: "var(--sn-spacing-lg, 16px)",
      }}
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-xs, 4px)",
            }}
          >
            <div
              data-wizard-step-indicator
              data-active={i === currentStep ? "" : undefined}
              data-complete={i < currentStep ? "" : undefined}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "var(--sn-radius-full, 9999px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
                backgroundColor:
                  i <= currentStep
                    ? "var(--sn-color-primary, oklch(0.205 0 0))"
                    : "var(--sn-color-muted, oklch(0.97 0 0))",
                color:
                  i <= currentStep
                    ? "var(--sn-color-primary-foreground, #fff)"
                    : "var(--sn-color-muted-foreground, #6b7280)",
                transition: `background-color ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
              }}
            >
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color:
                  i === currentStep
                    ? "var(--sn-color-foreground, #111)"
                    : "var(--sn-color-muted-foreground, #6b7280)",
                display: totalSteps > 4 ? "none" : undefined,
              }}
            >
              {step.title}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div
              style={{
                flex: 1,
                height: "1px",
                backgroundColor:
                  i < currentStep
                    ? "var(--sn-color-primary, oklch(0.205 0 0))"
                    : "var(--sn-color-border, #e5e7eb)",
                transition: `background-color ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Config-driven Wizard component.
 *
 * Renders a multi-step form flow with step indicators, per-step validation,
 * and animated transitions. On final step, submits accumulated data to
 * `submitEndpoint` and publishes via page context `id`.
 *
 * @param props.config - Wizard configuration from the Zod schema
 *
 * @example
 * ```tsx
 * <Wizard config={{
 *   id: 'onboarding',
 *   steps: [
 *     { title: 'Account', fields: [{ name: 'email', type: 'email', required: true }] },
 *     { title: 'Profile', fields: [{ name: 'name', type: 'text' }] },
 *   ],
 *   submitEndpoint: 'POST /api/onboard',
 * }} />
 * ```
 */
export function Wizard({ config }: { config: WizardConfig }) {
  const wizard = useWizard(config);

  const currentStepConfig = config.steps[wizard.currentStep];
  const submitLabel =
    currentStepConfig?.submitLabel ??
    (wizard.isLastStep ? config.submitLabel : "Next");

  // Determine if current step is skippable
  const isSkippable =
    config.allowSkip &&
    !wizard.isLastStep &&
    currentStepConfig?.fields.every((f) => !f.required);

  // Completed state
  if (wizard.isComplete) {
    return (
      <div
        data-snapshot-component="wizard"
        className={config.className}
        data-wizard-complete
        style={{
          padding: "var(--sn-spacing-lg, 16px)",
          textAlign: "center",
          borderRadius: "var(--sn-radius-md, 6px)",
          border:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          backgroundColor: "var(--sn-color-card, #fff)",
        }}
      >
        <div
          style={{
            fontSize: "var(--sn-font-size-lg, 1.125rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)",
            color: "var(--sn-color-success, oklch(0.586 0.209 145.071))",
            marginBottom: "var(--sn-spacing-sm, 8px)",
          }}
        >
          ✓ Complete
        </div>
        <div
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          Your submission was successful.
        </div>
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="wizard"
      className={config.className}
      style={{
        borderRadius: "var(--sn-radius-md, 6px)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        backgroundColor: "var(--sn-color-card, #fff)",
        overflow: "hidden",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Hover/focus styles */}
      <style>{`
[data-snapshot-component="wizard"] [data-wizard-step-indicator]:focus {
  outline: none;
}
[data-snapshot-component="wizard"] [data-wizard-back]:hover:not(:disabled) {
  background-color: var(--sn-color-secondary, #f3f4f6);
}
[data-snapshot-component="wizard"] [data-wizard-back]:focus {
  outline: none;
}
[data-snapshot-component="wizard"] [data-wizard-back]:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
[data-snapshot-component="wizard"] [data-wizard-skip]:hover {
  background-color: var(--sn-color-secondary, #f3f4f6);
}
[data-snapshot-component="wizard"] [data-wizard-skip]:focus {
  outline: none;
}
[data-snapshot-component="wizard"] [data-wizard-skip]:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
[data-snapshot-component="wizard"] [data-wizard-next]:hover:not(:disabled) {
  opacity: var(--sn-opacity-hover, 0.85);
}
[data-snapshot-component="wizard"] [data-wizard-next]:focus {
  outline: none;
}
[data-snapshot-component="wizard"] [data-wizard-next]:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
`}</style>
      {/* Progress bar */}
      <div
        style={{
          padding: "var(--sn-spacing-md, 12px) var(--sn-spacing-lg, 16px)",
          borderBottom:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <WizardProgress
          currentStep={wizard.currentStep}
          totalSteps={wizard.totalSteps}
          steps={config.steps}
        />
      </div>

      {/* Step content */}
      <div
        data-wizard-step-content
        style={{
          padding: "var(--sn-spacing-lg, 16px)",
          opacity: wizard.isAnimating ? 0 : 1,
          transform: wizard.isAnimating ? "translateX(8px)" : "translateX(0)",
          transition: `opacity ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}, transform ${ANIMATION_DURATION_VAR} ${ANIMATION_EASE_VAR}`,
        }}
      >
        {/* Step header */}
        {currentStepConfig && (
          <>
            <h3
              data-wizard-step-title
              style={{
                margin: "0 0 var(--sn-spacing-xs, 4px)",
                fontSize: "var(--sn-font-size-lg, 1.125rem)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
                color: "var(--sn-color-foreground, #111)",
              }}
            >
              {currentStepConfig.title}
            </h3>
            {currentStepConfig.description && (
              <p
                data-wizard-step-description
                style={{
                  margin: "0 0 var(--sn-spacing-md, 12px)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                }}
              >
                {currentStepConfig.description}
              </p>
            )}
          </>
        )}

        {/* Fields */}
        {currentStepConfig?.fields.map((field) => (
          <WizardFieldRenderer
            key={field.name}
            field={field}
            value={wizard.stepValues[field.name]}
            error={wizard.stepErrors[field.name]}
            showError={!!wizard.stepTouched[field.name]}
            onChange={(value) => wizard.setStepValue(field.name, value)}
            onBlur={() => wizard.touchField(field.name)}
          />
        ))}

        {/* Submit error */}
        {wizard.submitError && (
          <div
            role="alert"
            data-wizard-submit-error
            style={{
              padding: "var(--sn-spacing-sm, 8px)",
              marginBottom: "var(--sn-spacing-md, 12px)",
              borderRadius: "var(--sn-radius-md, 6px)",
              backgroundColor:
                "var(--sn-color-destructive, oklch(0.577 0.245 27.325))",
              color: "var(--sn-color-destructive-foreground, #fff)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            {wizard.submitError.message}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        data-wizard-nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--sn-spacing-md, 12px) var(--sn-spacing-lg, 16px)",
          borderTop:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          gap: "var(--sn-spacing-sm, 8px)",
        }}
      >
        {/* Back button */}
        <button
          type="button"
          data-wizard-back
          onClick={wizard.prevStep}
          disabled={wizard.isFirstStep || wizard.isAnimating}
          style={{
            padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
            borderRadius: "var(--sn-radius-md, 6px)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            backgroundColor: "transparent",
            color: wizard.isFirstStep
              ? "var(--sn-color-muted-foreground, #6b7280)"
              : "var(--sn-color-foreground, #111)",
            cursor: wizard.isFirstStep ? "not-allowed" : "pointer",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            opacity: wizard.isFirstStep ? "var(--sn-opacity-disabled, 0.5)" : 1,
          }}
        >
          Back
        </button>

        <div
          style={{
            display: "flex",
            gap: "var(--sn-spacing-sm, 8px)",
          }}
        >
          {/* Skip button */}
          {isSkippable && (
            <button
              type="button"
              data-wizard-skip
              onClick={wizard.skipStep}
              disabled={wizard.isAnimating}
              style={{
                padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
                borderRadius: "var(--sn-radius-md, 6px)",
                border:
                  "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                backgroundColor: "transparent",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                cursor: "pointer",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
              }}
            >
              Skip
            </button>
          )}

          {/* Next / Submit button */}
          <button
            type="button"
            data-wizard-next
            onClick={() => wizard.nextStep()}
            disabled={wizard.isSubmitting || wizard.isAnimating}
            style={{
              padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-md, 12px)",
              borderRadius: "var(--sn-radius-md, 6px)",
              border: "none",
              backgroundColor: "var(--sn-color-primary, oklch(0.205 0 0))",
              color: "var(--sn-color-primary-foreground, #fff)",
              cursor: wizard.isSubmitting ? "not-allowed" : "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: "var(--sn-font-weight-medium, 500)",
              opacity: wizard.isSubmitting
                ? "var(--sn-opacity-disabled, 0.5)"
                : 1,
            }}
          >
            {wizard.isSubmitting ? "Submitting…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
