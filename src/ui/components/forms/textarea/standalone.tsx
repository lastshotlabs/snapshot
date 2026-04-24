'use client';

import { useCallback, useState } from "react";
import type { CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { TextareaControl } from "./control";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface TextareaFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the textarea. */
  label?: string;
  /** Placeholder text shown inside the textarea. */
  placeholder?: string;
  /** Controlled value of the textarea. */
  value?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
  /** Whether the textarea is read-only. */
  readOnly?: boolean;
  /** Maximum character length with counter display. */
  maxLength?: number;
  /** Number of visible text rows. */
  rows?: number;
  /** CSS resize behavior of the textarea. */
  resize?: "none" | "vertical" | "horizontal" | "both";
  /** Helper text displayed below the textarea when there is no error. */
  helperText?: string;
  /** Error message displayed below the textarea, replacing helper text. */
  errorText?: string;

  /** Called when the textarea value changes. */
  onChange?: (value: string) => void;
  /** Called when the textarea loses focus. */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  /** Called when the textarea gains focus. */
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  /** Called when the textarea is clicked. */
  onClick?: MouseEventHandler<HTMLTextAreaElement>;
  /** Called on keydown events within the textarea. */
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

/**
 * Standalone TextareaField -- a complete textarea form field with label,
 * character counter, validation, and helper/error text. No manifest context required.
 *
 * @example
 * ```tsx
 * <TextareaField
 *   label="Bio"
 *   placeholder="Tell us about yourself..."
 *   maxLength={500}
 *   rows={5}
 *   onChange={(text) => setBio(text)}
 * />
 * ```
 */
export function TextareaField({
  id,
  label,
  placeholder,
  value: controlledValue,
  required,
  disabled = false,
  readOnly = false,
  maxLength,
  rows = 3,
  resize = "vertical",
  helperText,
  errorText,
  onChange,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  className,
  style,
  slots,
}: TextareaFieldProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const [validationError, setValidationError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const value = controlledValue ?? internalValue;

  const validate = useCallback(
    (nextValue: string): string | undefined => {
      if (required && !nextValue.trim()) {
        return "This field is required";
      }
      if (maxLength && nextValue.length > maxLength) {
        return `Maximum ${maxLength} characters`;
      }
      return undefined;
    },
    [maxLength, required],
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      if (maxLength && nextValue.length > maxLength) {
        return;
      }
      setInternalValue(nextValue);
      if (touched) {
        setValidationError(validate(nextValue));
      }
      onChange?.(nextValue);
    },
    [maxLength, onChange, touched, validate],
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLTextAreaElement>>(
    (event) => {
      setTouched(true);
      setValidationError(validate(value));
      onBlur?.(event);
    },
    [onBlur, validate, value],
  );

  const rootId = id ?? "textarea";
  const fieldId = id ? `sn-textarea-${id}` : undefined;
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
  const metaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-meta`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
    componentSurface: slots?.meta,
    activeStates: resolvedStates,
  });
  const counterSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-counter`,
    implementationBase: {
      color:
        maxLength !== undefined && value.length >= maxLength
          ? "var(--sn-color-destructive, #ef4444)"
          : "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
      style: {
        marginLeft: "auto",
      },
    },
    componentSurface: slots?.counter,
    activeStates: [
      ...resolvedStates,
      ...(maxLength !== undefined && value.length >= maxLength
        ? (["invalid"] as const)
        : []),
    ],
  });

  return (
    <div
      data-snapshot-component="textarea"
      data-testid="textarea"
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

      <TextareaControl
        textareaId={fieldId}
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        required={required}
        resize={resize}
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
      />

      {(helperText || errorMessage || maxLength !== undefined) ? (
        <div
          data-snapshot-id={`${rootId}-meta`}
          className={metaSurface.className}
          style={metaSurface.style}
        >
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
          {maxLength !== undefined ? (
            <span
              data-snapshot-id={`${rootId}-counter`}
              className={counterSurface.className}
              style={counterSurface.style}
            >
              {value.length}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={requiredIndicatorSurface.scopedCss} />
      <SurfaceStyles css={helperSurface.scopedCss} />
      <SurfaceStyles css={metaSurface.scopedCss} />
      <SurfaceStyles css={counterSurface.scopedCss} />
    </div>
  );
}
