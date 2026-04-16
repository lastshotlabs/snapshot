'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { setDomRef } from "../../_base/dom-ref";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import type { TextareaConfig, TextareaControlProps } from "./types";

export function TextareaControl({
  textareaRef,
  textareaId,
  name,
  value,
  rows = 3,
  placeholder,
  disabled,
  readOnly,
  maxLength,
  required,
  resize = "vertical",
  ariaInvalid,
  ariaDescribedBy,
  ariaLabel,
  onChangeText,
  onBlur,
  className,
  style,
  surfaceId,
  surfaceConfig,
  itemSurfaceConfig,
  activeStates,
  testId,
}: TextareaControlProps) {
  const resolvedStates = new Set([
    ...(activeStates ?? []),
    ...(disabled ? (["disabled"] as const) : []),
    ...(ariaInvalid ? (["invalid"] as const) : []),
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
        resize,
        fontFamily: "inherit",
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
    itemSurface: resolvedItemSurfaceConfig,
    activeStates: Array.from(resolvedStates),
  });

  return (
    <>
      <textarea
        ref={(instance) => setDomRef(textareaRef, instance)}
        id={textareaId}
        name={name}
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        data-testid={testId}
        data-snapshot-id={surfaceId}
        className={controlSurface.className}
        style={controlSurface.style}
        onChange={(event) => onChangeText?.(event.target.value)}
        onBlur={onBlur}
      />
      <SurfaceStyles css={controlSurface.scopedCss} />
    </>
  );
}

export function Textarea({ config }: { config: TextareaConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedPlaceholder = useSubscribe(config.placeholder) as
    | string
    | undefined;
  const resolvedValue = useSubscribe(config.value) as string | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const resolvedHelperText = useSubscribe(config.helperText) as
    | string
    | undefined;
  const resolvedErrorText = useSubscribe(config.errorText) as
    | string
    | undefined;

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
      return undefined;
    },
    [config.maxLength, config.required],
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      if (config.maxLength && nextValue.length > config.maxLength) {
        return;
      }

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
    [config.changeAction, config.maxLength, execute, touched, validate],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setValidationError(validate(value));
  }, [validate, value]);

  if (visible === false) {
    return null;
  }

  const rootId = config.id ?? "textarea";
  const fieldId = config.id ? `sn-textarea-${config.id}` : undefined;
  const errorMessage =
    resolvedErrorText ?? (touched ? validationError : undefined);
  const helperId = fieldId
    ? errorMessage
      ? `${fieldId}-error`
      : resolvedHelperText
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
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
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
  const metaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-meta`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
    componentSurface: config.slots?.meta,
    activeStates: resolvedStates,
  });
  const counterSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-counter`,
    implementationBase: {
      color:
        config.maxLength !== undefined && value.length >= config.maxLength
          ? "var(--sn-color-destructive, #ef4444)"
          : "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
      style: {
        marginLeft: "auto",
      },
    },
    componentSurface: config.slots?.counter,
    activeStates: [
      ...resolvedStates,
      ...(config.maxLength !== undefined && value.length >= config.maxLength
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
      {resolvedLabel ? (
        <label
          htmlFor={fieldId}
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {resolvedLabel}
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

      <TextareaControl
        textareaId={fieldId}
        value={value}
        rows={config.rows ?? 3}
        placeholder={resolvedPlaceholder}
        disabled={resolvedDisabled}
        readOnly={resolvedReadonly}
        maxLength={config.maxLength}
        required={config.required}
        resize={config.resize ?? "vertical"}
        ariaInvalid={Boolean(errorMessage)}
        ariaDescribedBy={helperId}
        ariaLabel={resolvedLabel ?? resolvedPlaceholder}
        onChangeText={handleChange}
        onBlur={handleBlur}
        surfaceId={`${rootId}-control`}
        surfaceConfig={config.slots?.control}
        activeStates={resolvedStates}
      />

      {(resolvedHelperText || errorMessage || config.maxLength !== undefined) ? (
        <div
          data-snapshot-id={`${rootId}-meta`}
          className={metaSurface.className}
          style={metaSurface.style}
        >
          {resolvedHelperText || errorMessage ? (
            <span
              id={helperId}
              role={errorMessage ? "alert" : undefined}
              data-snapshot-id={`${rootId}-helper`}
              className={helperSurface.className}
              style={helperSurface.style}
            >
              {errorMessage ?? resolvedHelperText}
            </span>
          ) : null}
          {config.maxLength !== undefined ? (
            <span
              data-snapshot-id={`${rootId}-counter`}
              className={counterSurface.className}
              style={counterSurface.style}
            >
              {value.length}/{config.maxLength}
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
