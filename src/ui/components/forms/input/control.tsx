'use client';

import { setDomRef } from "../../_base/dom-ref";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { InputControlProps } from "./types";

/**
 * Low-level styled input element with surface resolution and state management.
 * Used internally by InputField and other components that need a styled `<input>`.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <InputControl
 *   surfaceId="email-input"
 *   type="email"
 *   placeholder="you@example.com"
 *   onChangeText={(val) => setEmail(val)}
 * />
 * ```
 */
export function InputControl({
  inputRef,
  inputId,
  name,
  type = "text",
  value,
  checked,
  placeholder,
  autoComplete,
  autoFocus,
  disabled,
  readOnly,
  accept,
  multiple,
  list,
  min,
  max,
  step,
  maxLength,
  pattern,
  required,
  ariaInvalid,
  ariaDescribedBy,
  ariaLabel,
  onChangeText,
  onChangeChecked,
  onChangeFiles,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onPointerDown,
  onPointerUp,
  onTouchStart,
  onTouchEnd,
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
      <input
        ref={(instance) => setDomRef(inputRef, instance)}
        id={inputId}
        name={name}
        type={type}
        value={value}
        checked={checked}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        readOnly={readOnly}
        accept={accept}
        multiple={multiple}
        list={list}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        data-testid={testId}
        data-snapshot-id={surfaceId}
        className={controlSurface.className}
        style={controlSurface.style}
        onChange={(event) => {
          if (type === "checkbox" || type === "radio") {
            onChangeChecked?.(event.target.checked);
            return;
          }
          if (type === "file") {
            onChangeFiles?.(event.target.files);
            return;
          }
          onChangeText?.(event.target.value);
        }}
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
      <SurfaceStyles css={controlSurface.scopedCss} />
    </>
  );
}
