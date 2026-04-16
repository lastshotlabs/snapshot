'use client';

import React, { useEffect, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { StepConfig, StepperConfig } from "./types";

function getStepStates(
  step: StepConfig,
  isActive: boolean,
  isCompleted: boolean,
) {
  return [
    ...(isActive ? (["selected", "current"] as const) : []),
    ...(isCompleted ? (["completed"] as const) : []),
    ...(step.disabled ? (["disabled"] as const) : []),
  ];
}

export function Stepper({ config }: { config: StepperConfig }) {
  const resolvedActiveStep = useSubscribe(config.activeStep ?? 0);
  const initialStep =
    typeof resolvedActiveStep === "number" ? resolvedActiveStep : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);

  useEffect(() => {
    if (typeof resolvedActiveStep === "number") {
      setCurrentStep(resolvedActiveStep);
    }
  }, [resolvedActiveStep]);

  useEffect(() => {
    if (!publish) {
      return;
    }

    publish({
      activeStep: currentStep,
      title: config.steps[currentStep]?.title,
      isFirst: currentStep === 0,
      isLast: currentStep === config.steps.length - 1,
    });
  }, [config.steps, currentStep, publish]);

  if (visible === false) {
    return null;
  }

  const orientation = config.orientation ?? "horizontal";
  const variant = config.variant ?? "default";
  const clickable = config.clickable ?? false;
  const isHorizontal = orientation === "horizontal";
  const rootId = config.id ?? "stepper";
  const activeStepContent = config.steps[currentStep]?.content;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      marginTop: "var(--sn-spacing-lg, 1.5rem)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-md, 1rem)",
    } as Record<string, unknown>,
    componentSurface: config.slots?.content,
    itemSurface: config.steps[currentStep]?.slots?.content,
    activeStates: activeStepContent?.length ? ["active"] : [],
  });

  const handleStepClick = (index: number) => {
    const step = config.steps[index];
    if (!clickable || step?.disabled) {
      return;
    }

    setCurrentStep(index);
  };

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
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: isHorizontal ? "stretch" : "flex-start",
          gap:
            variant === "dots"
              ? "var(--sn-spacing-sm, 0.5rem)"
              : "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {config.steps.map((step: StepConfig, index: number) => {
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
            componentSurface: config.slots?.item,
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
            componentSurface: config.slots?.marker,
            itemSurface: step.slots?.marker,
            activeStates: stepStates,
          });
          const labelSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-label-${index}`,
            implementationBase: {
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
            componentSurface: config.slots?.label,
            itemSurface: step.slots?.label,
            activeStates: stepStates,
          });
          const descriptionSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-description-${index}`,
            implementationBase: {
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              marginTop:
                variant === "default"
                  ? "var(--sn-spacing-xs, 0.25rem)"
                  : undefined,
            } as Record<string, unknown>,
            componentSurface: config.slots?.description,
            itemSurface: step.slots?.description,
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
            componentSurface: config.slots?.connector,
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
                    <span style={{ minWidth: 0 }}>
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
                          style={{
                            display: "block",
                            ...(descriptionSurface.style as React.CSSProperties),
                          }}
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
                    style={{
                      display: "block",
                      ...(labelSurface.style as React.CSSProperties),
                    }}
                  >
                    {step.title}
                  </span>
                )}
              </StepTag>
              {index < config.steps.length - 1 ? (
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
              <SurfaceStyles css={connectorSurface.scopedCss} />
            </React.Fragment>
          );
        })}
      </div>

      {activeStepContent?.length ? (
        <div
          data-testid="stepper-content"
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {activeStepContent.map((child: ComponentConfig, childIndex: number) => (
            <ComponentRenderer
              key={
                (child as ComponentConfig).id ??
                `stepper-${currentStep}-child-${childIndex}`
              }
              config={child as ComponentConfig}
            />
          ))}
        </div>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
