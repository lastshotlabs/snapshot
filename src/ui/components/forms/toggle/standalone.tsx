'use client';

import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ToggleFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed inside the toggle button. */
  label?: string;
  /** Icon name rendered beside the label. */
  icon?: string;
  /** Visual variant of the toggle button. */
  variant?: "outline" | "default";
  /** Size of the toggle button. */
  size?: "sm" | "md" | "lg";
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Initial pressed state (uncontrolled). */
  defaultPressed?: boolean;
  /** Whether the toggle is disabled. */
  disabled?: boolean;
  /** Called when the toggle is pressed or released. */
  onChange?: (pressed: boolean) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

const SIZE_MAP = {
  sm: { size: "sm" as const, iconSize: 14 },
  md: { size: "md" as const, iconSize: 16 },
  lg: { size: "lg" as const, iconSize: 20 },
} as const;

/**
 * Standalone ToggleField -- a pressable toggle button with optional icon and label.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <ToggleField
 *   icon="bold"
 *   label="Bold"
 *   variant="outline"
 *   pressed={isBold}
 *   onChange={(on) => setBold(on)}
 * />
 * ```
 */
export function ToggleField({
  id,
  label,
  icon,
  variant: variantProp = "default",
  size: sizeProp = "md",
  pressed: controlledPressed,
  defaultPressed = false,
  disabled = false,
  onChange,
  className,
  style,
  slots,
}: ToggleFieldProps) {
  const [internalPressed, setInternalPressed] = useState(controlledPressed ?? defaultPressed);
  const pressed = controlledPressed ?? internalPressed;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const nextPressed = !pressed;
    setInternalPressed(nextPressed);
    onChange?.(nextPressed);
  }, [disabled, onChange, pressed]);

  const size = SIZE_MAP[sizeProp];
  const states = [
    ...(pressed ? (["selected"] as const) : []),
    ...(disabled ? (["disabled"] as const) : []),
  ];
  const variant = variantProp === "outline" ? "outline" : "secondary";
  const rootId = id ?? "toggle";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      states: {
        selected: {
          style: {
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            borderColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #ffffff)",
          },
        },
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: states,
  });

  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: slots?.icon,
    activeStates: states,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: slots?.label,
    activeStates: states,
  });

  return (
    <div data-snapshot-component="toggle">
      <ButtonControl
        type="button"
        variant={variant}
        size={size.size}
        disabled={disabled}
        onClick={handleToggle}
        surfaceId={rootId}
        surfaceConfig={rootSurface.resolvedConfigForWrapper}
        activeStates={states}
        ariaPressed={pressed}
        testId="toggle"
      >
        {icon ? (
          <span
            data-snapshot-id={`${rootId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            <Icon name={icon} size={size.iconSize} />
          </span>
        ) : null}
        {label ? (
          <span
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
