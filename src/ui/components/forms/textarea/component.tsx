import { useState, useEffect, useCallback, useRef } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import type { TextareaConfig } from "./types";

/**
 * Config-driven Textarea component — a multi-line text input with label,
 * character count, validation, and configurable resize.
 *
 * Publishes `{ value: string }` to the page context when an `id` is set.
 * Shows a character count indicator when `maxLength` is configured.
 *
 * @param props - Component props containing the textarea config
 *
 * @example
 * ```json
 * {
 *   "type": "textarea",
 *   "id": "notes",
 *   "label": "Notes",
 *   "rows": 5,
 *   "maxLength": 500,
 *   "placeholder": "Add your notes..."
 * }
 * ```
 */
export function Textarea({ config }: { config: TextareaConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  // Resolve from-refs
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const resolvedValue = useSubscribe(config.value) as string | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const resolvedErrorText = useSubscribe(config.errorText) as
    | string
    | undefined;

  const rows = config.rows ?? 3;
  const resize = config.resize ?? "vertical";

  const [value, setValue] = useState(resolvedValue ?? "");
  const [validationError, setValidationError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external value changes
  useEffect(() => {
    if (resolvedValue !== undefined) {
      setValue(resolvedValue);
    }
  }, [resolvedValue]);

  // Publish value changes
  useEffect(() => {
    if (publish) {
      publish({ value });
    }
  }, [publish, value]);

  const validate = useCallback(
    (val: string): string | undefined => {
      if (config.required && !val.trim()) {
        return "This field is required";
      }
      if (config.maxLength && val.length > config.maxLength) {
        return `Maximum ${config.maxLength} characters`;
      }
      return undefined;
    },
    [config.required, config.maxLength],
  );

  const handleChange = useCallback(
    (newValue: string) => {
      // Enforce maxLength if set
      if (config.maxLength && newValue.length > config.maxLength) {
        return;
      }
      setValue(newValue);
      if (touched) {
        setValidationError(validate(newValue));
      }

      // Debounced action execution
      if (config.changeAction) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          void execute(config.changeAction!, { value: newValue });
        }, 300);
      }
    },
    [touched, validate, config.changeAction, config.maxLength, execute],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setValidationError(validate(value));
  }, [validate, value]);

  const errorMessage = resolvedErrorText ?? (touched ? validationError : undefined);
  const hasError = !!errorMessage;
  const fieldId = config.id ? `sn-textarea-${config.id}` : undefined;

  return (
    <div
      data-snapshot-component="textarea"
      data-testid="textarea"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        ...config.style,
      }}
    >
      {config.label && (
        <label
          htmlFor={fieldId}
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-medium, 500)" as unknown as number,
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {config.label}
          {config.required && (
            <span
              style={{
                color: "var(--sn-color-destructive, #ef4444)",
                marginLeft: "var(--sn-spacing-2xs, 0.125rem)",
              }}
            >
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={fieldId}
        value={value}
        rows={rows}
        placeholder={config.placeholder}
        disabled={resolvedDisabled}
        readOnly={resolvedReadonly}
        maxLength={config.maxLength}
        required={config.required}
        aria-invalid={hasError}
        aria-describedby={
          hasError && fieldId
            ? `${fieldId}-error`
            : config.helperText && fieldId
              ? `${fieldId}-helper`
              : undefined
        }
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        style={{
          width: "100%",
          padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          lineHeight: "var(--sn-leading-normal, 1.5)",
          color: "var(--sn-color-foreground, #111827)",
          backgroundColor: "var(--sn-color-background, #ffffff)",
          border: `var(--sn-border-default, 1px) solid ${
            hasError
              ? "var(--sn-color-destructive, #ef4444)"
              : "var(--sn-color-border, #d1d5db)"
          }`,
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          outline: "none",
          resize,
          fontFamily: "inherit",
          transition:
            "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
          opacity: resolvedDisabled
            ? "var(--sn-opacity-disabled, 0.5)"
            : undefined,
          cursor: resolvedDisabled ? "not-allowed" : undefined,
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = hasError
            ? "var(--sn-color-destructive, #ef4444)"
            : "var(--sn-color-ring, #2563eb)";
          e.currentTarget.style.boxShadow = `0 0 0 var(--sn-ring-width, 2px) ${
            hasError
              ? "var(--sn-color-destructive, #ef4444)"
              : "var(--sn-color-ring, #2563eb)"
          }20`;
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = hasError
            ? "var(--sn-color-destructive, #ef4444)"
            : "var(--sn-color-border, #d1d5db)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {(config.helperText || errorMessage) && (
          <span
            id={
              errorMessage && fieldId
                ? `${fieldId}-error`
                : config.helperText && fieldId
                  ? `${fieldId}-helper`
                  : undefined
            }
            role={errorMessage ? "alert" : undefined}
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: errorMessage
                ? "var(--sn-color-destructive, #ef4444)"
                : "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {errorMessage ?? config.helperText}
          </span>
        )}

        {config.maxLength !== undefined && (
          <span
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color:
                value.length >= config.maxLength
                  ? "var(--sn-color-destructive, #ef4444)"
                  : "var(--sn-color-muted-foreground, #6b7280)",
              marginLeft: "auto",
            }}
          >
            {value.length}/{config.maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
