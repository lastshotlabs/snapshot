'use client';

import React, { useCallback, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface StepperBaseStep {
  /** Step title. */
  title: string;
  /** Step description. */
  description?: string;
  /** Icon or text rendered inside the marker for "default" variant. */
  icon?: string | number;
  /** Whether this step is disabled. */
  disabled?: boolean;
  /** Content rendered when this step is active. */
  content?: ReactNode;
  /** Per-step slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface StepperBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Steps to display. */
  steps: StepperBaseStep[];
  /** Index of the currently active step. */
  activeStep?: number;
  /** Layout direction. */
  orientation?: "horizontal" | "vertical";
  /** Visual variant. */
  variant?: "default" | "dots" | "simple";
  /** Whether steps are clickable. */
  clickable?: boolean;
  /** Callback when the active step changes. */
  onStepChange?: (index: number) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStepStates(
  step: StepperBaseStep,
  isActive: boolean,
  isCompleted: boolean,
) {
  return [
    ...(isActive ? (["selected", "current"] as const) : []),
    ...(isCompleted ? (["completed"] as const) : []),
    ...(step.disabled ? (["disabled"] as const) : []),
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Stepper — a multi-step progress indicator with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <StepperBase
 *   steps={[
 *     { title: "Account", content: <AccountForm /> },
 *     { title: "Profile", content: <ProfileForm /> },
 *     { title: "Review", content: <ReviewPanel /> },
 *   ]}
 *   activeStep={1}
 * />
 * ```
 */
export function StepperBase({
  id,
  steps,
  activeStep: controlledStep,
  orientation = "horizontal",
  variant = "default",
  clickable = false,
  onStepChange,
  className,
  style,
  slots,
}: StepperBaseProps) {
  const [internalStep, setInternalStep] = useState(controlledStep ?? 0);
  const currentStep = controlledStep ?? internalStep;

  const isHorizontal = orientation === "horizontal";
  const rootId = id ?? "stepper";
  const activeStepContent = steps[currentStep]?.content;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      marginTop: "var(--sn-spacing-lg, 1.5rem)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-md, 1rem)",
    } as Record<string, unknown>,
    componentSurface: slots?.content,
    itemSurface: steps[currentStep]?.slots?.content,
    activeStates: activeStepContent ? ["active"] : [],
  });
  const trackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-track`,
    implementationBase: {
      display: "flex",
      flexDirection: isHorizontal ? "row" : "column",
      alignItems: isHorizontal ? "stretch" : "start",
      gap:
        variant === "dots"
          ? "var(--sn-spacing-sm, 0.5rem)"
          : "var(--sn-spacing-xs, 0.25rem)",
    } as Record<string, unknown>,
    componentSurface: slots?.track,
  });

  const handleStepClick = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!clickable || step?.disabled) {
        return;
      }

      setInternalStep(index);
      onStepChange?.(index);
    },
    [clickable, onStepChange, steps],
  );

  return (
    <div
      data-snapshot-component="stepper"
      data-testid="stepper"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-testid="stepper-track"
        data-snapshot-id={`${rootId}-track`}
        className={trackSurface.className}
        style={trackSurface.style}
      >
        {steps.map((step: StepperBaseStep, index: number) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const stepStates = getStepStates(step, isActive, isCompleted);
          const itemSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-item-${index}`,
            implementationBase: {
              display: "flex",
              flexDirection:
                variant === "default"
                  ? isHorizontal
                    ? "column"
                    : "row"
                  : isHorizontal
                    ? "column"
                    : "row",
              alignItems: isHorizontal ? "center" : "flex-start",
              justifyContent: "flex-start",
              gap:
                variant === "default"
                  ? isHorizontal
                    ? "var(--sn-spacing-xs, 0.25rem)"
                    : "var(--sn-spacing-md, 1rem)"
                  : "var(--sn-spacing-xs, 0.25rem)",
              flex: isHorizontal ? 1 : undefined,
              width: isHorizontal ? undefined : "100%",
              padding:
                variant === "simple"
                  ? "var(--sn-spacing-sm, 0.5rem)"
                  : "0",
              textAlign: isHorizontal ? "center" : undefined,
              cursor:
                clickable && !step.disabled ? "pointer" : "default",
              appearance: "none",
              background: "none",
              border: "none",
              outline: "none",
              minWidth: 0,
            } as Record<string, unknown>,
            componentSurface: slots?.item,
            itemSurface: step.slots?.item,
            activeStates: stepStates,
          });
          const markerSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-marker-${index}`,
            implementationBase:
              variant === "dots"
                ? {
                    width: 8,
                    height: 8,
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    backgroundColor: isCompleted
                      ? "var(--sn-color-success, #16a34a)"
                      : isActive
                        ? "var(--sn-color-primary, #2563eb)"
                        : "var(--sn-color-secondary, #f1f5f9)",
                  }
                : {
                    width: 24,
                    height: 24,
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    fontWeight: "var(--sn-font-weight-semibold, 600)",
                    backgroundColor:
                      variant === "simple"
                        ? "transparent"
                        : isCompleted
                          ? "var(--sn-color-success, #16a34a)"
                          : isActive
                            ? "var(--sn-color-primary, #2563eb)"
                            : "var(--sn-color-secondary, #f1f5f9)",
                    color:
                      variant === "simple"
                        ? isActive
                          ? "var(--sn-color-primary, #2563eb)"
                          : isCompleted
                            ? "var(--sn-color-foreground, #111827)"
                            : "var(--sn-color-muted-foreground, #6b7280)"
                        : isCompleted
                          ? "var(--sn-color-success-foreground, #ffffff)"
                          : isActive
                            ? "var(--sn-color-primary-foreground, #ffffff)"
                            : "var(--sn-color-secondary-foreground, #374151)",
                  },
            componentSurface: slots?.marker,
            itemSurface: step.slots?.marker,
            activeStates: stepStates,
          });
          const labelSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-label-${index}`,
            implementationBase: {
              display: variant === "simple" ? "block" : undefined,
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: isActive
                ? "var(--sn-font-weight-semibold, 600)"
                : "var(--sn-font-weight-medium, 500)",
              color: isActive
                ? "var(--sn-color-primary, #2563eb)"
                : isCompleted
                  ? "var(--sn-color-foreground, #111827)"
                  : "var(--sn-color-muted-foreground, #6b7280)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            } as Record<string, unknown>,
            componentSurface: slots?.label,
            itemSurface: step.slots?.label,
            activeStates: stepStates,
          });
          const descriptionSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-description-${index}`,
            implementationBase: {
              display: "block",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              marginTop:
                variant === "default"
                  ? "var(--sn-spacing-xs, 0.25rem)"
                  : undefined,
            } as Record<string, unknown>,
            componentSurface: slots?.description,
            itemSurface: step.slots?.description,
          });
          const textGroupSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-text-group-${index}`,
            implementationBase: {
              minWidth: 0,
            },
            componentSurface: slots?.textGroup,
            itemSurface: step.slots?.textGroup,
          });
          const connectorSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-connector-${index}`,
            implementationBase: {
              flex: isHorizontal ? 1 : undefined,
              width: isHorizontal
                ? undefined
                : "var(--sn-border-thin, 1px)",
              minWidth: isHorizontal
                ? "var(--sn-spacing-lg, 1.5rem)"
                : undefined,
              height: isHorizontal
                ? "var(--sn-border-thin, 1px)"
                : "var(--sn-spacing-lg, 1.5rem)",
              marginInline:
                variant === "dots" && isHorizontal
                  ? "var(--sn-spacing-xs, 0.25rem)"
                  : undefined,
              marginLeft: !isHorizontal
                ? "11px"
                : undefined,
              backgroundColor:
                index < currentStep
                  ? "var(--sn-color-success, #16a34a)"
                  : index === currentStep
                    ? "var(--sn-color-primary, #2563eb)"
                    : "var(--sn-color-border, #e5e7eb)",
            } as Record<string, unknown>,
            componentSurface: slots?.connector,
            itemSurface: step.slots?.connector,
            activeStates: [
              ...(index < currentStep ? (["completed"] as const) : []),
              ...(index === currentStep ? (["active"] as const) : []),
              ...(step.disabled ? (["disabled"] as const) : []),
            ],
          });

          const StepTag =
            clickable && !step.disabled ? "button" : "div";

          return (
            <React.Fragment key={index}>
              <StepTag
                type={StepTag === "button" ? "button" : undefined}
                data-testid="stepper-step"
                data-step-state={
                  isCompleted ? "completed" : isActive ? "active" : "upcoming"
                }
                data-snapshot-id={`${rootId}-item-${index}`}
                className={itemSurface.className}
                style={itemSurface.style}
                onClick={() => handleStepClick(index)}
                onKeyDown={
                  StepTag === "button"
                    ? undefined
                    : clickable
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleStepClick(index);
                          }
                        }
                      : undefined
                }
                role={StepTag === "div" && clickable ? "button" : undefined}
                tabIndex={StepTag === "div" && clickable ? 0 : undefined}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={step.disabled || undefined}
              >
                {variant === "default" ? (
                  <>
                    <span
                      data-testid="stepper-marker"
                      data-snapshot-id={`${rootId}-marker-${index}`}
                      className={markerSurface.className}
                      style={markerSurface.style}
                    >
                      {isCompleted ? "\u2713" : step.icon ?? index + 1}
                    </span>
                    <span
                      data-snapshot-id={`${rootId}-text-group-${index}`}
                      className={textGroupSurface.className}
                      style={textGroupSurface.style}
                    >
                      <span
                        data-testid="stepper-step-title"
                        data-snapshot-id={`${rootId}-label-${index}`}
                        className={labelSurface.className}
                        style={labelSurface.style}
                      >
                        {step.title}
                      </span>
                      {step.description ? (
                        <span
                          data-testid="stepper-step-description"
                          data-snapshot-id={`${rootId}-description-${index}`}
                          className={descriptionSurface.className}
                          style={descriptionSurface.style}
                        >
                          {step.description}
                        </span>
                      ) : null}
                    </span>
                  </>
                ) : variant === "dots" ? (
                  <span
                    data-testid="stepper-marker"
                    data-snapshot-id={`${rootId}-marker-${index}`}
                    className={markerSurface.className}
                    style={markerSurface.style}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    data-testid="stepper-step-title"
                    data-snapshot-id={`${rootId}-label-${index}`}
                    className={labelSurface.className}
                    style={labelSurface.style}
                  >
                    {step.title}
                  </span>
                )}
              </StepTag>
              {index < steps.length - 1 ? (
                <div
                  data-testid="stepper-connector"
                  data-snapshot-id={`${rootId}-connector-${index}`}
                  className={connectorSurface.className}
                  style={connectorSurface.style}
                  aria-hidden="true"
                />
              ) : null}
              <SurfaceStyles css={itemSurface.scopedCss} />
              <SurfaceStyles css={markerSurface.scopedCss} />
              <SurfaceStyles css={labelSurface.scopedCss} />
              <SurfaceStyles css={descriptionSurface.scopedCss} />
              <SurfaceStyles css={textGroupSurface.scopedCss} />
              <SurfaceStyles css={connectorSurface.scopedCss} />
            </React.Fragment>
          );
        })}
      </div>

      {activeStepContent ? (
        <div
          data-testid="stepper-content"
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {activeStepContent}
        </div>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={trackSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
