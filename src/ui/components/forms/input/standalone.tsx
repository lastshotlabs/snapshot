'use client';

import { useCallback, useState } from "react";
import type { CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation, extractSurfaceConfig } from "../../_base/style-surfaces";
import { InputControl } from "./control";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface InputFieldProps {
  /** Unique identifier for the field. Used for htmlFor, aria, and surface scoping. */
  id?: string;
  /** Label text displayed above the input. */
  label?: string;
  /** Placeholder text inside the input. */
  placeholder?: string;
  /** Controlled value. */
  value?: string;
  /** HTML input type. Default: "text". */
  type?: "text" | "email" | "password" | "number" | "url" | "tel" | "search";
  /** Whether the field is required. */
  required?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Read-only state. */
  readOnly?: boolean;
  /** Maximum character length. */
  maxLength?: number;
  /** Regex validation pattern. */
  pattern?: string;
  /** Helper text displayed below the input. */
  helperText?: string;
  /** Error message — overrides validation and helper text. */
  errorText?: string;
  /** Left icon name. */
  icon?: string;

  // ── Callbacks ────────────────────────────────────────────────────────────
  /** Called with the new string value on every change. */
  onChange?: (value: string) => void;
  /** Standard blur handler. */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Standard focus handler. */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /** Standard click handler. */
  onClick?: MouseEventHandler<HTMLInputElement>;
  /** Standard keydown handler. */
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, label, field, control, icon, helper, requiredIndicator). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone InputField — a complete form field (label + input + helper/error)
 * that works with plain React props. No manifest context required.
 *
 * @example
 * ```tsx
 * <InputField
 *   id="email"
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 *   helperText="We'll never share your email"
 *   onChange={(val) => setEmail(val)}
 * />
 * ```
 */
export function InputField({
  id,
  label,
  placeholder,
  value: controlledValue,
  type = "text",
  required,
  disabled = false,
  readOnly = false,
  maxLength,
  pattern,
  helperText,
  errorText,
  icon,
  onChange,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  className,
  style,
  slots,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const [validationError, setValidationError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  // Use controlled value if provided, otherwise internal
  const value = controlledValue ?? internalValue;

  const validate = useCallback(
    (nextValue: string): string | undefined => {
      if (required && !nextValue.trim()) {
        return "This field is required";
      }
      if (maxLength && nextValue.length > maxLength) {
        return `Maximum ${maxLength} characters`;
      }
      if (pattern) {
        try {
          const matcher = new RegExp(pattern);
          if (!matcher.test(nextValue)) {
            return "Invalid format";
          }
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
    [maxLength, pattern, required],
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue);
      if (touched) {
        setValidationError(validate(nextValue));
      }
      onChange?.(nextValue);
    },
    [onChange, touched, validate],
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (event) => {
      setTouched(true);
      setValidationError(validate(value));
      onBlur?.(event);
    },
    [onBlur, validate, value],
  );

  const rootId = id ?? "input";
  const fieldId = id ? `sn-input-${id}` : undefined;
  const errorMessage = errorText ?? (touched ? validationError : undefined);
  const helperId = fieldId
    ? errorMessage
      ? `${fieldId}-error`
      : helperText
        ? `${fieldId}-helper`
        : undefined
    : undefined;
  const resolvedStates = [
    ...(errorMessage ? (["invalid"] as const) : []),
    ...(disabled ? (["disabled"] as const) : []),
  ];

  // ── Surface resolution (pure CSS computation — no manifest) ──────────────

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: resolvedStates,
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
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field`,
    implementationBase: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "100%",
    },
    componentSurface: slots?.field,
    activeStates: resolvedStates,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      position: "absolute",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      inset: "0 auto 0 var(--sn-spacing-sm, 0.5rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        pointerEvents: "none",
      },
    },
    componentSurface: slots?.icon,
    activeStates: resolvedStates,
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
    activeStates: resolvedStates,
  });

  return (
    <div
      data-snapshot-component="input"
      data-testid="input"
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

      <div
        data-snapshot-id={`${rootId}-field`}
        className={fieldSurface.className}
        style={fieldSurface.style}
      >
        {icon ? (
          <span
            data-snapshot-id={`${rootId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            <Icon name={icon} size={16} />
          </span>
        ) : null}
        <InputControl
          inputId={fieldId}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          pattern={pattern}
          required={required}
          ariaInvalid={Boolean(errorMessage)}
          ariaDescribedBy={helperId}
          ariaLabel={label ?? placeholder}
          onChangeText={handleChange}
          onBlur={handleBlur}
          onFocus={onFocus}
          onClick={onClick}
          onKeyDown={onKeyDown}
          surfaceId={`${rootId}-control`}
          surfaceConfig={slots?.control}
          activeStates={resolvedStates}
          style={
            icon
              ? { paddingLeft: "var(--sn-spacing-2xl, 2.25rem)" }
              : undefined
          }
          testId="input-control"
        />
      </div>

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
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={helperSurface.scopedCss} />
    </div>
  );
}
