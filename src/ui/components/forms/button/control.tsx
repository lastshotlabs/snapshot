'use client';

import { setDomRef } from "../../_base/dom-ref";
import { BUTTON_INTERACTIVE_CSS, getButtonStyle } from "../../_base/button-styles";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ButtonControlProps } from "./types";

/**
 * Low-level styled button element with surface resolution and accessibility attributes.
 * Used internally by ButtonBase and other components that need a styled `<button>`.
 * No manifest context required.
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
  ariaLive,
  ariaPressed,
  ariaChecked,
  ariaCurrent,
  ariaSelected,
  ariaExpanded,
  ariaHasPopup,
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
  const resolvedStates = new Set([
    ...(activeStates ?? []),
    ...(disabled ? (["disabled"] as const) : []),
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
  const rootSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: {
      ...getButtonStyle(variant, size, disabled),
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--sn-spacing-xs, 0.5rem)",
      width: fullWidth ? "100%" : "auto",
      minHeight: minHeightBySize[size] ?? minHeightBySize.sm,
      appearance: "none",
      textAlign: "center",
      whiteSpace: "nowrap",
    },
    componentSurface: surfaceConfig,
    itemSurface: resolvedItemSurfaceConfig,
    activeStates: Array.from(resolvedStates),
  });

  return (
    <>
      <button
        ref={(instance) => setDomRef(buttonRef, instance)}
        id={id}
        type={type}
        disabled={disabled}
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
        data-snapshot-id={surfaceId}
        data-testid={testId}
        data-open={resolvedStates.has("open") ? "true" : undefined}
        data-selected={resolvedStates.has("selected") ? "true" : undefined}
        data-current={resolvedStates.has("current") ? "true" : undefined}
        data-active={resolvedStates.has("active") ? "true" : undefined}
        data-disabled={resolvedStates.has("disabled") ? "true" : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-live={ariaLive}
        aria-pressed={ariaPressed}
        aria-checked={ariaChecked}
        aria-current={ariaCurrent}
        aria-selected={ariaSelected}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        aria-disabled={disabled || undefined}
        role={role}
        tabIndex={tabIndex}
        title={title}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {children}
      </button>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={BUTTON_INTERACTIVE_CSS} />
    </>
  );
}
