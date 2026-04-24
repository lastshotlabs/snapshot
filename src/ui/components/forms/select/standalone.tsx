'use client';

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { SelectControl } from "./control";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface SelectFieldProps {
  /** Unique identifier. */
  id?: string;
  /** Label text. */
  label?: string;
  /** Placeholder text shown as disabled first option. */
  placeholder?: string;
  /** Controlled value. */
  value?: string;
  /** Default value (uncontrolled). */
  defaultValue?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Helper text below the select. */
  helperText?: string;
  /** Error message -- overrides helper text. */
  errorText?: string;
  /** Static options to display. */
  options?: Array<{ label: string; value: string }>;
  /** Whether options are currently loading. */
  loading?: boolean;

  // ── Callbacks ────────────────────────────────────────────────────────────
  /** Called when the selected value changes. */
  onChange?: (value: string) => void;
  /** Called when the select loses focus. */
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  /** Called when the select gains focus. */
  onFocus?: FocusEventHandler<HTMLSelectElement>;
  /** Called when the select is clicked. */
  onClick?: MouseEventHandler<HTMLSelectElement>;
  /** Called on keydown events within the select. */
  onKeyDown?: KeyboardEventHandler<HTMLSelectElement>;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone SelectField -- a complete select form field with label, options,
 * helper/error text, and required indicator. No manifest context required.
 *
 * @example
 * ```tsx
 * <SelectField
 *   label="Country"
 *   placeholder="Choose a country"
 *   options={[{ label: "USA", value: "us" }, { label: "Canada", value: "ca" }]}
 *   onChange={(val) => setCountry(val)}
 * />
 * ```
 */
export function SelectField({
  id,
  label,
  placeholder,
  value: controlledValue,
  defaultValue = "",
  required,
  disabled = false,
  helperText,
  errorText,
  options = [],
  loading = false,
  onChange,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  className,
  style,
  slots,
}: SelectFieldProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? defaultValue);
  const value = controlledValue ?? internalValue;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue);
      onChange?.(nextValue);
    },
    [onChange],
  );

  const rootId = id ?? "select";
  const fieldId = id ? `sn-select-${id}` : undefined;
  const errorMessage = errorText;
  const helperId = fieldId
    ? errorMessage
      ? `${fieldId}-error`
      : helperText
        ? `${fieldId}-helper`
        : undefined
    : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      width: "100%",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "sm",
      fontWeight: "medium",
    },
    componentSurface: slots?.label,
  });
  const requiredIndicatorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-required-indicator`,
    implementationBase: {
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: slots?.requiredIndicator,
  });
  const helperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-helper`,
    implementationBase: {
      color: errorMessage
        ? "var(--sn-color-destructive, #ef4444)"
        : "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
    },
    componentSurface: slots?.helper,
  });

  return (
    <div
      data-snapshot-component="select"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {label ? (
        <label
          htmlFor={fieldId}
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
          {required ? (
            <span
              data-snapshot-id={`${rootId}-required-indicator`}
              className={requiredIndicatorSurface.className}
              style={requiredIndicatorSurface.style}
            >
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <SelectControl
        selectId={fieldId}
        value={value}
        disabled={disabled}
        required={required}
        ariaLabel={label ?? placeholder ?? "Select"}
        onChangeValue={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
        onKeyDown={onKeyDown}
        surfaceId={`${rootId}-control`}
        surfaceConfig={slots?.control}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {loading ? (
          <option value="" disabled>
            Loading...
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectControl>

      {helperText || errorMessage ? (
        <span
          id={helperId}
          role={errorMessage ? "alert" : undefined}
          data-snapshot-id={`${rootId}-helper`}
          className={helperSurface.className}
          style={helperSurface.style}
        >
          {errorMessage ?? helperText}
        </span>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={requiredIndicatorSurface.scopedCss} />
      <SurfaceStyles css={helperSurface.scopedCss} />
    </div>
  );
}
