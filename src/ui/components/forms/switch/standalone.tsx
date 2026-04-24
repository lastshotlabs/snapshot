'use client';

import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SwitchFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed beside the switch. */
  label?: string;
  /** Description text displayed below the label. */
  description?: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state (uncontrolled). */
  defaultChecked?: boolean;
  /** Whether the switch is disabled. */
  disabled?: boolean;
  /** Size of the switch track and thumb. */
  size?: "sm" | "md" | "lg";
  /** Token color name for the active track (e.g. "primary", "success"). */
  color?: string;
  /** Called when the switch is toggled. */
  onChange?: (checked: boolean) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

const SIZE_MAP = {
  sm: { trackW: 32, trackH: 18, thumb: 14 },
  md: { trackW: 44, trackH: 24, thumb: 20 },
  lg: { trackW: 56, trackH: 30, thumb: 26 },
} as const;

/**
 * Standalone SwitchField -- a toggle switch with label, description, and
 * configurable size and color. No manifest context required.
 *
 * @example
 * ```tsx
 * <SwitchField
 *   label="Dark Mode"
 *   description="Enable dark theme across the app"
 *   checked={isDark}
 *   onChange={(on) => setDark(on)}
 * />
 * ```
 */
export function SwitchField({
  id,
  label,
  description,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  size: sizeProp = "md",
  color = "primary",
  onChange,
  className,
  style,
  slots,
}: SwitchFieldProps) {
  const [internalChecked, setInternalChecked] = useState(controlledChecked ?? defaultChecked);
  const checked = controlledChecked ?? internalChecked;
  const dims = SIZE_MAP[sizeProp];

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const nextChecked = !checked;
    setInternalChecked(nextChecked);
    onChange?.(nextChecked);
  }, [checked, disabled, onChange]);

  const thumbOffset = 2;
  const thumbTranslate = checked
    ? dims.trackW - dims.thumb - thumbOffset * 2
    : 0;
  const rootId = id ?? "switch";
  const states = [
    ...(checked ? (["selected"] as const) : []),
    ...(disabled ? (["disabled"] as const) : []),
  ];
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "auto",
      minHeight: "auto",
      padding: 0,
      gap: "var(--sn-spacing-sm, 0.5rem)",
      cursor: disabled ? "not-allowed" : "pointer",
      style: {
        justifyContent: "flex-start",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: states,
  });

  const trackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-track`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "full",
      style: {
        position: "relative",
        width: dims.trackW,
        height: dims.trackH,
        flexShrink: 0,
        backgroundColor: checked
          ? `var(--sn-color-${color}, #2563eb)`
          : "var(--sn-color-secondary, #e5e7eb)",
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
      },
    },
    componentSurface: slots?.track,
    activeStates: states,
  });
  const thumbSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-thumb`,
    implementationBase: {
      borderRadius: "full",
      style: {
        position: "absolute",
        top: thumbOffset,
        left: thumbOffset,
        width: dims.thumb,
        height: dims.thumb,
        backgroundColor: "var(--sn-color-card, #ffffff)",
        boxShadow: "var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.2))",
        transform: `translateX(${thumbTranslate}px)`,
        transition:
          "transform var(--sn-duration-fast, 150ms) var(--sn-ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))",
      },
    },
    componentSurface: slots?.thumb,
    activeStates: states,
  });
  const labelGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label-group`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      style: {
        textAlign: "left",
      },
    },
    componentSurface: slots?.labelGroup,
    activeStates: states,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "sm",
      fontWeight: "medium",
    },
    componentSurface: slots?.label,
    activeStates: states,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
    },
    componentSurface: slots?.description,
    activeStates: states,
  });

  return (
    <div data-snapshot-component="switch">
      <ButtonControl
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={handleToggle}
        surfaceId={rootId}
        surfaceConfig={rootSurface.resolvedConfigForWrapper}
        activeStates={states}
        ariaLabel={label ?? description ?? "Toggle"}
        ariaChecked={checked}
        role="switch"
        testId="switch"
      >
        <span
          data-snapshot-id={`${rootId}-track`}
          className={trackSurface.className}
          style={trackSurface.style}
        >
          <span
            data-snapshot-id={`${rootId}-thumb`}
            className={thumbSurface.className}
            style={thumbSurface.style}
          />
        </span>
        {label || description ? (
          <span
            data-snapshot-id={`${rootId}-label-group`}
            className={labelGroupSurface.className}
            style={labelGroupSurface.style}
          >
            {label ? (
              <span
                data-snapshot-id={`${rootId}-label`}
                className={labelSurface.className}
                style={labelSurface.style}
              >
                {label}
              </span>
            ) : null}
            {description ? (
              <span
                data-snapshot-id={`${rootId}-description`}
                className={descriptionSurface.className}
                style={descriptionSurface.style}
              >
                {description}
              </span>
            ) : null}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={trackSurface.scopedCss} />
      <SurfaceStyles css={thumbSurface.scopedCss} />
      <SurfaceStyles css={labelGroupSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
