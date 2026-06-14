'use client';

import type { CSSProperties } from "react";
import { setDomRef } from "../../_base/dom-ref";
import { BUTTON_INTERACTIVE_CSS, getButtonStyle } from "../../_base/button-styles";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ButtonControlProps } from "./types";

function normalizeButtonStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return undefined;
  }

  const next = { ...style };

  if (next.background !== undefined) {
    delete next.backgroundColor;
    delete next.backgroundImage;
  }

  if (next.border !== undefined) {
    delete next.borderColor;
    delete next.borderStyle;
    delete next.borderWidth;
  }

  return next;
}

function omitButtonInteractionOverrides(
  config: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!config) {
    return undefined;
  }

  const {
    hover: _hover,
    focus: _focus,
    active: _active,
    states,
    ...rest
  } = config;

  if (!states || typeof states !== "object" || Array.isArray(states)) {
    return rest;
  }

  const cleanedStates = Object.fromEntries(
    Object.entries(states as Record<string, unknown>).map(([state, value]) => [
      state,
      value && typeof value === "object" && !Array.isArray(value)
        ? omitButtonInteractionOverrides(value as Record<string, unknown>)
        : value,
    ]),
  );

  return {
    ...rest,
    states: cleanedStates,
  };
}

/**
 * Low-level styled button element with surface resolution and accessibility attributes.
 * Used internally by ButtonBase and other components that need a styled `<button>`.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <ButtonControl variant="default" size="sm" onClick={handleClick}>
 *   Save
 * </ButtonControl>
 * ```
 */
export function ButtonControl({
  id,
  children,
  type = "button",
  variant = "default",
  size = "sm",
  disabled,
  fullWidth,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  onTouchStart,
  onTouchEnd,
  className,
  style,
  buttonRef,
  surfaceId,
  surfaceConfig,
  itemSurfaceConfig,
  testId,
  ariaLabel,
  ariaDescribedBy,
  ariaInvalid,
  ariaLive,
  ariaPressed,
  ariaChecked,
  ariaCurrent,
  ariaSelected,
  ariaExpanded,
  ariaHasPopup,
  ariaControls,
  role,
  tabIndex,
  title,
  activeStates,
}: ButtonControlProps) {
  const minHeightBySize: Record<string, string> = {
    sm: "2.25rem",
    md: "2.5rem",
    lg: "2.875rem",
    icon: "2.5rem",
  };
  const requestedStates = new Set(activeStates ?? []);
  const isDisabled = Boolean(disabled || requestedStates.has("disabled"));
  const resolvedStates = new Set([
    ...requestedStates,
    ...(isDisabled ? (["disabled"] as const) : []),
  ]);
  const resolvedItemSurfaceConfig =
    className || style
      ? {
          ...(itemSurfaceConfig ?? {}),
          className: [
            typeof itemSurfaceConfig?.className === "string"
              ? itemSurfaceConfig.className
              : undefined,
            className,
          ]
            .filter(Boolean)
            .join(" ") || undefined,
          style: {
            ...((itemSurfaceConfig?.style as Record<string, unknown> | undefined) ?? {}),
            ...(style ?? {}),
          },
      }
      : itemSurfaceConfig;
  const normalizedSurfaceConfig = omitButtonInteractionOverrides(surfaceConfig);
  const normalizedItemSurfaceConfig = omitButtonInteractionOverrides(
    resolvedItemSurfaceConfig,
  );
  const rootSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: {
      ...getButtonStyle(variant, size, isDisabled),
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: size === "icon" ? 0 : "var(--sn-spacing-xs, 0.5rem)",
      width: fullWidth ? "100%" : "auto",
      minHeight: minHeightBySize[size] ?? minHeightBySize.sm,
      appearance: "none",
      textAlign: "center",
      minWidth: 0,
      overflowWrap: "anywhere",
      whiteSpace: size === "icon" ? "nowrap" : "normal",
    },
    componentSurface: normalizedSurfaceConfig,
    itemSurface: normalizedItemSurfaceConfig,
    activeStates: Array.from(resolvedStates),
  });

  return (
    <>
      <button
        ref={(instance) => setDomRef(buttonRef, instance)}
        id={id}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        data-sn-button=""
        data-variant={variant}
        data-size={size}
        data-snapshot-id={surfaceId}
        data-testid={testId}
        data-state={Array.from(resolvedStates).join(" ") || undefined}
        data-open={resolvedStates.has("open") ? "true" : undefined}
        data-selected={resolvedStates.has("selected") ? "true" : undefined}
        data-current={resolvedStates.has("current") ? "true" : undefined}
        data-active={resolvedStates.has("active") ? "true" : undefined}
        data-hover={resolvedStates.has("hover") ? "true" : undefined}
        data-focus={resolvedStates.has("focus") ? "true" : undefined}
        data-completed={resolvedStates.has("completed") ? "true" : undefined}
        data-invalid={resolvedStates.has("invalid") ? "true" : undefined}
        data-disabled={resolvedStates.has("disabled") ? "true" : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid ?? (resolvedStates.has("invalid") || undefined)}
        aria-live={ariaLive}
        aria-pressed={ariaPressed}
        aria-checked={ariaChecked}
        aria-current={ariaCurrent}
        aria-selected={ariaSelected}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        aria-controls={ariaControls}
        aria-disabled={isDisabled || undefined}
        role={role}
        tabIndex={tabIndex}
        title={title}
        className={rootSurface.className}
        style={normalizeButtonStyle(rootSurface.style)}
      >
        {children}
      </button>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={BUTTON_INTERACTIVE_CSS} />
    </>
  );
}
