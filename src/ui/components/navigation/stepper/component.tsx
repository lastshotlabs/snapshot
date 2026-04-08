import { useState, useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import type { StepperConfig } from "./types";

/**
 * Stepper component — a multi-step progress indicator that shows
 * completed, active, and upcoming steps with connectors.
 *
 * Supports horizontal/vertical orientation, multiple visual variants,
 * and optional step content rendering via ComponentRenderer.
 *
 * @param props - Component props containing the stepper configuration
 *
 * @example
 * ```json
 * {
 *   "type": "stepper",
 *   "steps": [
 *     { "title": "Account", "description": "Create your account" },
 *     { "title": "Profile", "description": "Fill in details" },
 *     { "title": "Review", "description": "Confirm everything" }
 *   ],
 *   "activeStep": 1
 * }
 * ```
 */
export function Stepper({ config }: { config: StepperConfig }) {
  const resolvedActiveStep = useSubscribe(config.activeStep ?? 0);
  const initialStep =
    typeof resolvedActiveStep === "number" ? resolvedActiveStep : 0;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  // Sync with external activeStep changes
  useEffect(() => {
    if (typeof resolvedActiveStep === "number") {
      setCurrentStep(resolvedActiveStep);
    }
  }, [resolvedActiveStep]);

  // Publish current step
  useEffect(() => {
    if (publish) {
      publish({
        activeStep: currentStep,
        title: config.steps[currentStep]?.title,
        isFirst: currentStep === 0,
        isLast: currentStep === config.steps.length - 1,
      });
    }
  }, [publish, currentStep, config.steps]);

  const orientation = config.orientation ?? "horizontal";
  const variant = config.variant ?? "default";
  const clickable = config.clickable ?? false;
  const isHorizontal = orientation === "horizontal";

  const handleStepClick = (index: number) => {
    if (!clickable) return;
    setCurrentStep(index);
  };

  // Active step content
  const activeStepContent = config.steps[currentStep]?.content;

  return (
    <div
      data-snapshot-component="stepper"
      data-testid="stepper"
      className={config.className}
    >
      {/* Step indicators */}
      <div
        data-testid="stepper-track"
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: isHorizontal ? "flex-start" : "stretch",
          gap: variant === "dots" ? "var(--sn-spacing-sm, 0.5rem)" : undefined,
        }}
      >
        {config.steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isUpcoming = index > currentStep;

          if (variant === "simple") {
            return (
              <div
                key={index}
                data-testid="stepper-step"
                data-step-state={
                  isCompleted ? "completed" : isActive ? "active" : "upcoming"
                }
                onClick={() => handleStepClick(index)}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleStepClick(index);
                      }
                    : undefined
                }
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                style={{
                  flex: isHorizontal ? 1 : undefined,
                  padding: "var(--sn-spacing-sm, 0.5rem)",
                  cursor: clickable ? "pointer" : undefined,
                  textAlign: isHorizontal ? "center" : undefined,
                  borderBottom: isHorizontal
                    ? `2px solid ${
                        isActive
                          ? "var(--sn-color-primary, #2563eb)"
                          : isCompleted
                            ? "var(--sn-color-success, #16a34a)"
                            : "var(--sn-color-border, #e5e7eb)"
                      }`
                    : undefined,
                  borderLeft: !isHorizontal
                    ? `2px solid ${
                        isActive
                          ? "var(--sn-color-primary, #2563eb)"
                          : isCompleted
                            ? "var(--sn-color-success, #16a34a)"
                            : "var(--sn-color-border, #e5e7eb)"
                      }`
                    : undefined,
                }}
              >
                <span
                  style={{
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    fontWeight: isActive
                      ? "var(--sn-font-weight-semibold, 600)"
                      : undefined,
                    color: isActive
                      ? "var(--sn-color-primary, #2563eb)"
                      : isCompleted
                        ? "var(--sn-color-foreground, #111827)"
                        : "var(--sn-color-muted-foreground, #6b7280)",
                  }}
                >
                  {step.title}
                </span>
              </div>
            );
          }

          if (variant === "dots") {
            return (
              <div
                key={index}
                data-testid="stepper-step"
                data-step-state={
                  isCompleted ? "completed" : isActive ? "active" : "upcoming"
                }
                onClick={() => handleStepClick(index)}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleStepClick(index);
                      }
                    : undefined
                }
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                style={{
                  display: "flex",
                  flexDirection: isHorizontal ? "column" : "row",
                  alignItems: "center",
                  gap: "var(--sn-spacing-xs, 0.25rem)",
                  cursor: clickable ? "pointer" : undefined,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    backgroundColor: isCompleted
                      ? "var(--sn-color-success, #16a34a)"
                      : isActive
                        ? "var(--sn-color-primary, #2563eb)"
                        : "var(--sn-color-secondary, #f1f5f9)",
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          }

          // Default variant: numbered circles with connectors
          return (
            <div
              key={index}
              data-testid="stepper-step"
              data-step-state={
                isCompleted ? "completed" : isActive ? "active" : "upcoming"
              }
              style={{
                display: "flex",
                flexDirection: isHorizontal ? "column" : "row",
                alignItems: isHorizontal ? "center" : "flex-start",
                flex: isHorizontal ? 1 : undefined,
                gap: isHorizontal ? undefined : "var(--sn-spacing-md, 1rem)",
              }}
            >
              {/* Circle + connector row */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isHorizontal ? "row" : "column",
                  alignItems: "center",
                  ...(isHorizontal ? { width: "100%" } : {}),
                }}
              >
                {/* Leading connector (not for first step) */}
                {index > 0 && (
                  <div
                    data-testid="stepper-connector"
                    style={{
                      ...(isHorizontal
                        ? { flex: 1, height: 2 }
                        : { width: 2, height: "var(--sn-spacing-lg, 1.5rem)" }),
                      backgroundColor: isCompleted
                        ? "var(--sn-color-success, #16a34a)"
                        : "var(--sn-color-border, #e5e7eb)",
                      ...(isUpcoming
                        ? {
                            backgroundImage: `repeating-linear-gradient(
                              ${isHorizontal ? "to right" : "to bottom"},
                              var(--sn-color-border, #e5e7eb) 0px,
                              var(--sn-color-border, #e5e7eb) 4px,
                              transparent 4px,
                              transparent 8px
                            )`,
                            backgroundColor: "transparent",
                          }
                        : {}),
                    }}
                  />
                )}

                {/* Step circle */}
                <div
                  onClick={() => handleStepClick(index)}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ")
                            handleStepClick(index);
                        }
                      : undefined
                  }
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    fontWeight: "var(--sn-font-weight-semibold, 600)",
                    flexShrink: 0,
                    cursor: clickable ? "pointer" : undefined,
                    backgroundColor: isCompleted
                      ? "var(--sn-color-success, #16a34a)"
                      : isActive
                        ? "var(--sn-color-primary, #2563eb)"
                        : "var(--sn-color-secondary, #f1f5f9)",
                    color: isCompleted
                      ? "var(--sn-color-success-foreground, #ffffff)"
                      : isActive
                        ? "var(--sn-color-primary-foreground, #ffffff)"
                        : "var(--sn-color-secondary-foreground, #374151)",
                  }}
                >
                  {isCompleted
                    ? "\u2713"
                    : step.icon
                      ? step.icon
                      : index + 1}
                </div>

                {/* Trailing connector (not for last step) */}
                {index < config.steps.length - 1 && (
                  <div
                    data-testid="stepper-connector"
                    style={{
                      ...(isHorizontal
                        ? { flex: 1, height: 2 }
                        : { width: 2, height: "var(--sn-spacing-lg, 1.5rem)" }),
                      backgroundColor:
                        index < currentStep
                          ? "var(--sn-color-success, #16a34a)"
                          : "var(--sn-color-border, #e5e7eb)",
                      ...(index >= currentStep
                        ? {
                            backgroundImage: `repeating-linear-gradient(
                              ${isHorizontal ? "to right" : "to bottom"},
                              var(--sn-color-border, #e5e7eb) 0px,
                              var(--sn-color-border, #e5e7eb) 4px,
                              transparent 4px,
                              transparent 8px
                            )`,
                            backgroundColor: "transparent",
                          }
                        : {}),
                    }}
                  />
                )}
              </div>

              {/* Title + description */}
              <div
                style={{
                  textAlign: isHorizontal ? "center" : undefined,
                  marginTop: isHorizontal
                    ? "var(--sn-spacing-xs, 0.25rem)"
                    : undefined,
                  paddingBottom: !isHorizontal
                    ? "var(--sn-spacing-sm, 0.5rem)"
                    : undefined,
                }}
              >
                <div
                  data-testid="stepper-step-title"
                  style={{
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    fontWeight: isActive
                      ? "var(--sn-font-weight-semibold, 600)"
                      : undefined,
                    color: isUpcoming
                      ? "var(--sn-color-muted-foreground, #6b7280)"
                      : "var(--sn-color-foreground, #111827)",
                  }}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div
                    data-testid="stepper-step-description"
                    style={{
                      fontSize: "var(--sn-font-size-xs, 0.75rem)",
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                      marginTop: "var(--sn-spacing-xs, 0.25rem)",
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active step content */}
      {activeStepContent && activeStepContent.length > 0 && (
        <div
          data-testid="stepper-content"
          style={{
            marginTop: "var(--sn-spacing-lg, 1.5rem)",
          }}
        >
          {activeStepContent.map((child, childIndex) => (
            <ComponentRenderer
              key={
                (child as ComponentConfig).id ??
                `stepper-${currentStep}-child-${childIndex}`
              }
              config={child as ComponentConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}
