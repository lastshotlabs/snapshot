'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { InputConfig, InputControlProps } from "./types";

export function InputControl({
  inputRef,
  inputId,
  type = "text",
  value,
  placeholder,
  autoComplete,
  autoFocus,
  disabled,
  readOnly,
  min,
  max,
  maxLength,
  pattern,
  required,
  ariaInvalid,
  ariaDescribedBy,
  ariaLabel,
  onChangeText,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  className,
  style,
  surfaceId,
  surfaceConfig,
  itemSurfaceConfig,
  activeStates,
  testId,
}: InputControlProps) {
  const resolvedStates = new Set([
    ...(activeStates ?? []),
    ...(disabled ? (["disabled"] as const) : []),
    ...(ariaInvalid ? (["invalid"] as const) : []),
  ]);
  const controlSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: {
      width: "100%",
      style: {
        appearance: "none",
        boxSizing: "border-box",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        color: "var(--sn-color-foreground, #111827)",
        backgroundColor: "var(--sn-color-background, #ffffff)",
        border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        outline: "none",
        transition:
          "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
      },
      states: {
        focus: {
          style: {
            borderColor: "var(--sn-color-primary, #2563eb)",
            boxShadow:
              "0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent)",
          },
        },
        invalid: {
          style: {
            borderColor: "var(--sn-color-destructive, #ef4444)",
          },
          states: {
            focus: {
              style: {
                borderColor: "var(--sn-color-destructive, #ef4444)",
                boxShadow:
                  "0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-destructive, #ef4444) 25%, transparent)",
              },
            },
          },
        },
        disabled: {
          opacity: 0.5,
          cursor: "not-allowed",
        },
      },
    },
    componentSurface: surfaceConfig,
    itemSurface: itemSurfaceConfig,
    activeStates: Array.from(resolvedStates),
  });

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        data-testid={testId}
        data-snapshot-id={surfaceId}
        className={[className, controlSurface.className].filter(Boolean).join(" ") || undefined}
        style={{
          ...(controlSurface.style ?? {}),
          ...(style ?? {}),
        }}
        onChange={(event) => onChangeText?.(event.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
        onKeyDown={onKeyDown}
      />
      <SurfaceStyles css={controlSurface.scopedCss} />
    </>
  );
}

export function Input({ config }: { config: InputConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value) as string | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const resolvedErrorText = useSubscribe(config.errorText) as
    | string
    | undefined;

  const inputType = config.inputType ?? "text";
  const [value, setValue] = useState(resolvedValue ?? "");
  const [validationError, setValidationError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (resolvedValue !== undefined) {
      setValue(resolvedValue);
    }
  }, [resolvedValue]);

  useEffect(() => {
    publish?.({ value });
  }, [publish, value]);

  const validate = useCallback(
    (nextValue: string): string | undefined => {
      if (config.required && !nextValue.trim()) {
        return "This field is required";
      }
      if (config.maxLength && nextValue.length > config.maxLength) {
        return `Maximum ${config.maxLength} characters`;
      }
      if (config.pattern) {
        try {
          const matcher = new RegExp(config.pattern);
          if (!matcher.test(nextValue)) {
            return "Invalid format";
          }
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
    [config.maxLength, config.pattern, config.required],
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      if (touched) {
        setValidationError(validate(nextValue));
      }

      if (config.changeAction) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          void execute(config.changeAction!, { value: nextValue });
        }, 300);
      }
    },
    [config.changeAction, execute, touched, validate],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setValidationError(validate(value));
  }, [validate, value]);

  if (visible === false) {
    return null;
  }

  const rootId = config.id ?? "input";
  const fieldId = config.id ? `sn-input-${config.id}` : undefined;
  const errorMessage =
    resolvedErrorText ?? (touched ? validationError : undefined);
  const helperId = fieldId
    ? errorMessage
      ? `${fieldId}-error`
      : config.helperText
        ? `${fieldId}-helper`
        : undefined
    : undefined;
  const resolvedStates = [
    ...(errorMessage ? (["invalid"] as const) : []),
    ...(resolvedDisabled ? (["disabled"] as const) : []),
  ];

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: config.slots?.root,
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
    componentSurface: config.slots?.label,
  });
  const requiredIndicatorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-required-indicator`,
    implementationBase: {
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: config.slots?.requiredIndicator,
  });
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field`,
    implementationBase: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "100%",
    },
    componentSurface: config.slots?.field,
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
    componentSurface: config.slots?.icon,
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
    componentSurface: config.slots?.helper,
    activeStates: resolvedStates,
  });

  return (
    <div
      data-snapshot-component="input"
      data-testid="input"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      {config.label ? (
        <label
          htmlFor={fieldId}
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {config.label}
          {config.required ? (
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
        {config.icon ? (
          <span
            data-snapshot-id={`${rootId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            <Icon name={config.icon} size={16} />
          </span>
        ) : null}
        <InputControl
          inputId={fieldId}
          type={inputType}
          value={value}
          placeholder={config.placeholder}
          disabled={resolvedDisabled}
          readOnly={resolvedReadonly}
          maxLength={config.maxLength}
          pattern={config.pattern}
          required={config.required}
          ariaInvalid={Boolean(errorMessage)}
          ariaDescribedBy={helperId}
          ariaLabel={config.label ?? config.placeholder}
          onChangeText={handleChange}
          onBlur={handleBlur}
          surfaceId={`${rootId}-control`}
          surfaceConfig={config.slots?.control}
          activeStates={resolvedStates}
          style={
            config.icon
              ? { paddingLeft: "var(--sn-spacing-2xl, 2.25rem)" }
              : undefined
          }
          testId="input-control"
        />
      </div>

      {config.helperText || errorMessage ? (
        <span
          id={helperId}
          role={errorMessage ? "alert" : undefined}
          data-snapshot-id={`${rootId}-helper`}
          className={helperSurface.className}
          style={helperSurface.style}
        >
          {errorMessage ?? config.helperText}
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
