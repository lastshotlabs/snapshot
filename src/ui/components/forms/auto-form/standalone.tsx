"use client";

import React, { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import { SelectControl } from "../select";
import { TextareaControl } from "../textarea";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface AutoFormFieldOption {
  /** Display text for the option. */
  label: string;
  /** Form value submitted when this option is selected. */
  value: string;
}

export interface AutoFormFieldValidation {
  /** Minimum character length for text fields. */
  minLength?: number;
  /** Maximum character length for text fields. */
  maxLength?: number;
  /** Minimum numeric value for number/range fields. */
  min?: number;
  /** Maximum numeric value for number/range fields. */
  max?: number;
  /** Regex pattern or pattern object with custom message for validation. */
  pattern?: string | { value: string; message?: string };
  /** Value that this field must match (e.g. confirm password). */
  equals?: string;
  /** Custom validation error message. */
  message?: string;
  /** Whether the field must have a value. */
  required?: boolean;
}

export interface AutoFormFieldConfig {
  /** Field name used as the key in form values, errors, and touched maps. */
  name: string;
  /** Input type (e.g. "text", "email", "select", "textarea", "checkbox", "switch", "number"). */
  type: string;
  /** Label text displayed above the field. */
  label?: string;
  /** Placeholder text shown inside the input. */
  placeholder?: string;
  /** Helper text displayed below the field when there is no error. */
  helperText?: string;
  /** Descriptive text displayed between the label and the input. */
  description?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Whether the field is read-only. */
  readOnly?: boolean;
  /** Whether the field is visually hidden from the form. */
  hidden?: boolean;
  /** Default value for the field. */
  defaultValue?: unknown;
  /** Available options for select, multi-select, radio-group, and combobox fields. */
  options?: AutoFormFieldOption[];
  /** Validation rules applied to the field value. */
  validate?: AutoFormFieldValidation;
  /** Alias for validate -- validation rules applied to the field value. */
  validation?: AutoFormFieldValidation;
  /** Prefix text displayed before the input. */
  prefix?: string;
  /** Suffix text displayed after the input. */
  suffix?: string;
  /** Divisor applied to numeric values for display. */
  divisor?: number;
  /** Inline action link rendered beside the label (e.g. "Forgot password?"). */
  inlineAction?: { label?: string; to?: string };
  /** Slot overrides for sub-elements (field, label, input, helper, error). */
  slots?: Record<string, Record<string, unknown>>;
  /** HTML autocomplete attribute for the input. */
  autoComplete?: string;
  /** Number of grid columns this field should span. */
  span?: number;
  /** Label field key when options come from objects. */
  labelField?: string;
  /** Value field key when options come from objects. */
  valueField?: string;
}

export interface AutoFormSectionConfig {
  /** Section heading displayed above its fields. */
  title?: string;
  /** Descriptive text displayed below the section title. */
  description?: string;
  /** Field configurations rendered inside this section. */
  fields: AutoFormFieldConfig[];
  /** Slot overrides for sub-elements (section, sectionHeader, sectionTitle). */
  slots?: Record<string, Record<string, unknown>>;
  /** Whether the section can be collapsed. */
  collapsible?: boolean;
  /** Whether the section starts collapsed. */
  defaultCollapsed?: boolean;
}

export interface AutoFormBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Flat list of field configurations (use when not grouping into sections). */
  fields?: AutoFormFieldConfig[];
  /** Grouped sections, each containing its own fields. */
  sections?: AutoFormSectionConfig[];
  /** Current form values keyed by field name. */
  values: Record<string, unknown>;
  /** Current validation errors keyed by field name. */
  errors: Record<string, string | undefined>;
  /** Map of field names to whether they have been touched/blurred. */
  touched: Record<string, boolean>;
  /** Whether the form is currently submitting. */
  isSubmitting?: boolean;
  /** Whether the form values differ from their initial state. */
  isDirty?: boolean;
  /** Whether all fields pass validation. Used to disable the submit button. */
  isValid?: boolean;
  /** Label text for the submit button. */
  submitLabel?: string;
  /** Label shown on the submit button while the form is submitting. */
  submitLoadingLabel?: string;
  /** Label text for the reset button. */
  resetLabel?: string;
  /** Whether to display the reset button. */
  showReset?: boolean;
  /** Layout mode for arranging fields. */
  layout?: "vertical" | "horizontal" | "grid";
  /** Spacing between fields. */
  gap?: "xs" | "sm" | "md" | "lg";
  /** Number of grid columns for the field layout. Overrides `layout` when > 1. */
  columns?: number;
  /** Called when a field value changes. */
  onFieldChange: (name: string, value: unknown) => void;
  /** Called when a field loses focus. */
  onFieldBlur: (name: string) => void;
  /** Called when the form is submitted. */
  onSubmit: () => void;
  /** Called when the reset button is clicked. */
  onReset?: () => void;
  /** Callback for inline field actions (e.g. "Forgot password?" links). */
  onInlineAction?: (fieldName: string, to: string) => void;

  /** Variant for the submit button. */
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Size for the submit button. */
  submitSize?: "sm" | "md" | "lg" | "icon";
  /** Whether the submit button spans the full width. */
  submitFullWidth?: boolean;
  /** Icon name to show before the submit button label. */
  submitIcon?: string;

  /** Override the `data-snapshot-component` attribute on the form element. */
  dataComponent?: string;
  /** Override the `data-testid` attribute on the form element. */
  dataTestId?: string;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Gap map ───────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
};

// ── Tag input sub-component ──────────────────────────────────────────────

function StandaloneTagInput({
  fieldId,
  fieldName,
  tags,
  disabled,
  readOnly,
  required,
  hasError,
  describedBy,
  label,
  placeholder,
  onChange,
  onBlur,
  rootId,
  inputSurface,
}: {
  fieldId: string;
  fieldName: string;
  tags: string[];
  disabled?: boolean;
  readOnly?: boolean;
  required: boolean;
  hasError: boolean;
  describedBy: string | undefined;
  label: string | undefined;
  placeholder: string | undefined;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  rootId: string;
  inputSurface: { className?: string };
}) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const addTag = useCallback(
    (text: string) => {
      const trimmed = text.trim().toLowerCase().replace(/,/g, "");
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
      }
      setInputText("");
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  return (
    <div
      data-snapshot-id={`${rootId}-input-${fieldName}`}
      className={inputSurface.className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.375rem",
        cursor: disabled ? "not-allowed" : "text",
        width: "100%",
        minHeight: "var(--sn-input-height, 2.5rem)",
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
        border: `var(--sn-border-thin, 1px) solid ${focused ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-border, #e5e7eb)"}`,
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        background: "var(--sn-color-background, #ffffff)",
        color: "var(--sn-color-foreground, #111827)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        boxShadow: focused
          ? "0 0 0 1px var(--sn-color-primary, #2563eb)"
          : "none",
        transition:
          "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        boxSizing: "border-box",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.125rem 0.5rem",
            borderRadius: "var(--sn-radius-full, 9999px)",
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #ffffff)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            lineHeight: "1.5",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
          {!disabled && !readOnly ? (
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                fontSize: "1rem",
                lineHeight: 1,
                opacity: 0.7,
              }}
            >
              {"\u00d7"}
            </button>
          ) : null}
        </span>
      ))}
      <input
        ref={inputRef}
        id={fieldId}
        type="text"
        value={inputText}
        disabled={disabled}
        readOnly={readOnly}
        required={required && tags.length === 0}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        aria-label={label}
        placeholder={placeholder ?? "Type and press Enter..."}
        onChange={(e) => setInputText(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (
            (e.key === "Enter" || e.key === "," || e.key === " ") &&
            inputText.trim()
          ) {
            e.preventDefault();
            addTag(inputText);
          }
          if (e.key === "Backspace" && inputText === "" && tags.length > 0) {
            removeTag(tags.length - 1);
          }
        }}
        onBlur={() => {
          if (inputText.trim()) addTag(inputText);
          setFocused(false);
          onBlur();
        }}
        style={{
          flex: 1,
          minWidth: "10rem",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "inherit",
          fontFamily: "inherit",
          color: "inherit",
          padding: "0.25rem 0",
          minHeight: "auto",
          borderRadius: 0,
          boxShadow: "none",
        }}
      />
    </div>
  );
}

// ── Field renderer ───────────────────────────────────────────────────────

function StandaloneFieldRenderer({
  rootId,
  field,
  value,
  error,
  showError,
  onChange,
  onBlur,
  slots,
  onInlineAction,
}: {
  rootId: string;
  field: AutoFormFieldConfig;
  value: unknown;
  error: string | undefined;
  showError: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  slots?: Record<string, Record<string, unknown>>;
  onInlineAction?: (fieldName: string, to: string) => void;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const label = field.label ?? field.name;
  const placeholder = field.placeholder;
  const helperText = field.helperText;
  const description = field.description;
  const required = field.required === true;
  const validation = field.validate ?? field.validation;
  const fieldId = `sn-field-${field.name}`;
  const hasError = showError && !!error;
  const describedBy = hasError
    ? `${fieldId}-error`
    : helperText
      ? `${fieldId}-helper`
      : undefined;
  const activeStates = [
    ...(hasError ? ["invalid"] : []),
    ...(field.disabled ? ["disabled"] : []),
  ] as Array<"invalid" | "disabled">;

  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-${field.name}`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    } as Record<string, unknown>,
    componentSurface: slots?.field,
    itemSurface: field.slots?.field,
    activeStates,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label-${field.name}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: "var(--sn-font-weight-medium, 500)",
      color: "var(--sn-color-foreground, #111827)",
    } as Record<string, unknown>,
    componentSurface: slots?.label,
    itemSurface: field.slots?.label,
    activeStates,
  });
  const requiredIndicatorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-required-${field.name}`,
    implementationBase: {
      color: "var(--sn-color-destructive, #ef4444)",
      style: {
        marginLeft: "var(--sn-spacing-2xs, 2px)",
      },
    } as Record<string, unknown>,
    componentSurface: slots?.requiredIndicator,
    itemSurface: field.slots?.requiredIndicator,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input-${field.name}`,
    implementationBase: {} as Record<string, unknown>,
    componentSurface: slots?.input,
    itemSurface: field.slots?.input,
    activeStates,
  });
  const helperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-helper-${field.name}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: slots?.helper,
    itemSurface: field.slots?.helper,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error-${field.name}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-destructive, #ef4444)",
    } as Record<string, unknown>,
    componentSurface: slots?.error,
    itemSurface: field.slots?.error,
    activeStates: hasError ? ["invalid"] : [],
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description-${field.name}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: slots?.description,
    itemSurface: field.slots?.description,
  });

  if (field.hidden) {
    return null;
  }

  const inputWrapperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputWrapper-${field.name}`,
    implementationBase:
      ({
        width: "100%",
        ...(field.type === "password" ? { position: "relative" } : {}),
      } as Record<string, unknown>),
    componentSurface: slots?.inputWrapper,
    itemSurface: field.slots?.inputWrapper,
    activeStates,
  });
  const optionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-options-${field.name}`,
    implementationBase:
      field.type === "radio-group"
        ? ({
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          } as Record<string, unknown>)
        : undefined,
    componentSurface: slots?.options,
    itemSurface: field.slots?.options,
    activeStates,
  });
  const inlineActionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inlineAction-${field.name}`,
    implementationBase: {
      bg: "transparent",
      color: "var(--sn-color-primary, #2563eb)",
      hover: {
        color: "var(--sn-color-primary, #2563eb)",
        textDecoration: "underline",
      },
      focus: {
        ring: true,
      },
      style: {
        minHeight: "auto",
        padding: 0,
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        fontWeight: "var(--sn-font-weight-medium, 500)",
      },
    } as Record<string, unknown>,
    componentSurface: slots?.inlineAction,
    itemSurface: field.slots?.inlineAction,
  });
  const passwordToggleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-passwordToggle-${field.name}`,
    implementationBase: {
      bg: "transparent",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      hover: {
        color: "var(--sn-color-foreground, #111827)",
      },
      focus: {
        ring: true,
      },
      style: {
        position: "absolute",
        right: "var(--sn-spacing-sm, 0.5rem)",
        top: "50%",
        transform: "translateY(-50%)",
        minHeight: "2rem",
        minWidth: "2rem",
        padding: "var(--sn-spacing-xs, 0.25rem)",
      },
    } as Record<string, unknown>,
    componentSurface: slots?.passwordToggle,
    itemSurface: field.slots?.passwordToggle,
  });

  const inputStyle = inputSurface.style as React.CSSProperties | undefined;

  const inlineActionLabel = field.inlineAction?.label;
  const inlineActionTarget = field.inlineAction?.to;

  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = (
        <TextareaControl
          textareaId={fieldId}
          name={field.name}
          value={(value as string) ?? ""}
          disabled={field.disabled}
          readOnly={field.readOnly}
          required={required}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          placeholder={placeholder}
          maxLength={validation?.maxLength}
          onChangeText={onChange}
          onBlur={onBlur}
          rows={3}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "select": {
      const fieldOptions = Array.isArray(field.options) ? field.options : [];
      input = (
        <SelectControl
          selectId={fieldId}
          name={field.name}
          value={typeof value === "string" ? value : String(value ?? "")}
          disabled={field.disabled}
          required={required}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeValue={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        >
          {!value && !field.defaultValue ? (
            <option value="">{placeholder ?? "Select..."}</option>
          ) : null}
          {fieldOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectControl>
      );
      break;
    }

    case "multi-select": {
      const fieldOptions = Array.isArray(field.options) ? field.options : [];
      const selectedValues = Array.isArray(value)
        ? (value as string[]).filter(Boolean)
        : [];
      const multiSelectSurface = resolveSurfacePresentation({
        surfaceId: `${rootId}-input-${field.name}`,
        implementationBase: {
          width: "100%",
          minHeight: `${Math.min(fieldOptions.length + 0.5, 8) * 1.75}rem`,
          cursor: field.disabled ? "not-allowed" : "pointer",
          style: {
            appearance: "none",
            boxSizing: "border-box",
            padding:
              "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            paddingRight: "var(--sn-spacing-sm, 0.5rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            lineHeight: "var(--sn-leading-normal, 1.5)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-background, #ffffff)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            outline: "none",
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
            },
            disabled: {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          },
        },
        componentSurface: slots?.input,
        itemSurface: field.slots?.input,
        activeStates,
      });

      input = (
        <>
          <select
            id={fieldId}
            name={field.name}
            multiple
            disabled={field.disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            aria-label={label}
            value={selectedValues}
            onChange={(event) =>
              onChange(
                Array.from(event.currentTarget.selectedOptions).map(
                  (option) => option.value,
                ),
              )
            }
            onBlur={onBlur}
            data-snapshot-id={`${rootId}-input-${field.name}`}
            className={multiSelectSurface.className}
            style={multiSelectSurface.style}
          >
            {fieldOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <SurfaceStyles css={multiSelectSurface.scopedCss} />
        </>
      );
      break;
    }

    case "checkbox":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="checkbox"
          checked={!!value}
          disabled={field.disabled}
          readOnly={field.readOnly}
          required={required}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeChecked={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={{
            width: "16px",
            height: "16px",
            accentColor: "var(--sn-color-primary, #2563eb)",
            ...(inputStyle ?? {}),
          }}
        />
      );
      break;

    case "switch": {
      const switchChecked = !!value;
      const switchTrackW = 44;
      const switchTrackH = 24;
      const switchThumb = 20;
      const switchThumbOffset = 2;
      const switchThumbTranslate = switchChecked
        ? switchTrackW - switchThumb - switchThumbOffset * 2
        : 0;
      const switchStates = [
        ...(switchChecked ? (["active"] as const) : []),
        ...(field.disabled ? (["disabled"] as const) : []),
      ];
      const switchButtonSurface = resolveSurfacePresentation({
        surfaceId: `${rootId}-input-${field.name}`,
        implementationBase: {
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          padding: 0,
          border: "none",
          bg: "transparent",
          cursor: field.disabled ? "not-allowed" : "pointer",
          style: {
            appearance: "none",
          },
          states: {
            disabled: {
              opacity: 0.5,
            },
          },
        },
        componentSurface: slots?.input,
        itemSurface: field.slots?.input,
        activeStates: switchStates,
      });
      const switchTrackSurface = resolveSurfacePresentation({
        surfaceId: `${rootId}-switch-track-${field.name}`,
        implementationBase: {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          width: `${switchTrackW}px`,
          height: `${switchTrackH}px`,
          borderRadius: "9999px",
          bg: "var(--sn-color-secondary, #e5e7eb)",
          style: {
            flexShrink: 0,
          },
          transition:
            "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
          states: {
            active: {
              bg: "var(--sn-color-primary, #2563eb)",
            },
          },
        },
        componentSurface: slots?.switchTrack,
        itemSurface: field.slots?.switchTrack,
        activeStates: switchStates,
      });
      const switchThumbSurface = resolveSurfacePresentation({
        surfaceId: `${rootId}-switch-thumb-${field.name}`,
        implementationBase: {
          position: "absolute",
          width: `${switchThumb}px`,
          height: `${switchThumb}px`,
          borderRadius: "9999px",
          bg: "var(--sn-color-card, #ffffff)",
          transform: "translateX(0px)",
          style: {
            top: `${switchThumbOffset}px`,
            left: `${switchThumbOffset}px`,
            boxShadow: "var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.2))",
          },
          transition:
            "transform var(--sn-duration-fast, 150ms) cubic-bezier(0.34, 1.56, 0.64, 1)",
          states: {
            active: {
              transform: `translateX(${switchThumbTranslate}px)`,
            },
          },
        },
        componentSurface: slots?.switchThumb,
        itemSurface: field.slots?.switchThumb,
        activeStates: switchStates,
      });

      input = (
        <>
          <button
            type="button"
            id={fieldId}
            role="switch"
            aria-checked={switchChecked}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            aria-label={label}
            disabled={field.disabled}
            onClick={() => onChange(!switchChecked)}
            onBlur={onBlur}
            data-snapshot-id={`${rootId}-input-${field.name}`}
            className={switchButtonSurface.className}
            style={switchButtonSurface.style}
          >
            <span
              data-snapshot-id={`${rootId}-switch-track-${field.name}`}
              className={switchTrackSurface.className}
              style={switchTrackSurface.style}
            >
              <span
                data-snapshot-id={`${rootId}-switch-thumb-${field.name}`}
                className={switchThumbSurface.className}
                style={switchThumbSurface.style}
              />
            </span>
          </button>
          <SurfaceStyles css={switchButtonSurface.scopedCss} />
          <SurfaceStyles css={switchTrackSurface.scopedCss} />
          <SurfaceStyles css={switchThumbSurface.scopedCss} />
        </>
      );
      break;
    }

    case "tag-input": {
      const tags = Array.isArray(value) ? (value as string[]).filter(Boolean) : [];
      input = (
        <StandaloneTagInput
          fieldId={fieldId}
          fieldName={field.name}
          tags={tags}
          disabled={field.disabled}
          readOnly={field.readOnly}
          required={required}
          hasError={hasError}
          describedBy={describedBy}
          label={label}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          rootId={rootId}
          inputSurface={inputSurface}
        />
      );
      break;
    }

    case "number":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="number"
          value={
            value === "" || value === undefined || value === null
              ? ""
              : String(value)
          }
          disabled={field.disabled}
          readOnly={field.readOnly}
          required={required}
          min={validation?.min != null ? String(validation.min) : undefined}
          max={validation?.max != null ? String(validation.max) : undefined}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          placeholder={placeholder}
          onChangeText={(v) => {
            onChange(v === "" ? "" : Number(v));
          }}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "file":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="file"
          disabled={field.disabled}
          required={required}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeFiles={(files) => {
            onChange(files && files.length > 0 ? files[0] : null);
          }}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "radio-group": {
      const fieldOptions = Array.isArray(field.options) ? field.options : [];
      input = (
        <div
          role="radiogroup"
          aria-labelledby={`${fieldId}-legend`}
          data-snapshot-id={`${rootId}-options-${field.name}`}
          className={optionsSurface.className}
          style={optionsSurface.style}
        >
          {fieldOptions.map((opt) => {
            const isSelected = String(value ?? "") === opt.value;
            const optionActiveStates = [
              ...(isSelected ? (["selected"] as const) : []),
              ...(field.disabled ? (["disabled"] as const) : []),
            ];
            const optionSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-option-${field.name}-${opt.value}`,
              implementationBase: {
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sn-spacing-sm, 0.5rem)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
              } as Record<string, unknown>,
              componentSurface: slots?.option,
              itemSurface: field.slots?.option,
              activeStates: optionActiveStates,
            });
            const optionLabelSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-optionLabel-${field.name}-${opt.value}`,
              componentSurface: slots?.optionLabel,
              itemSurface: field.slots?.optionLabel,
              activeStates: optionActiveStates,
            });

            return (
              <label
                key={opt.value}
                data-snapshot-id={`${rootId}-option-${field.name}-${opt.value}`}
                className={optionSurface.className}
                style={optionSurface.style}
              >
                <InputControl
                  type="radio"
                  inputId={`${fieldId}-${opt.value}`}
                  name={field.name}
                  checked={isSelected}
                  disabled={field.disabled}
                  required={required}
                  ariaInvalid={hasError}
                  ariaDescribedBy={describedBy}
                  ariaLabel={opt.label}
                  onChangeChecked={(checked) => {
                    if (checked) {
                      onChange(opt.value);
                    }
                  }}
                  onBlur={onBlur}
                  surfaceId={`${rootId}-input-${field.name}-${opt.value}`}
                  className={inputSurface.className}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--sn-color-primary, #2563eb)",
                    ...(inputStyle ?? {}),
                  }}
                />
                <span
                  data-snapshot-id={`${rootId}-optionLabel-${field.name}-${opt.value}`}
                  className={optionLabelSurface.className}
                  style={optionLabelSurface.style}
                >
                  {opt.label}
                </span>
                <SurfaceStyles css={optionSurface.scopedCss} />
                <SurfaceStyles css={optionLabelSurface.scopedCss} />
              </label>
            );
          })}
          <SurfaceStyles css={optionsSurface.scopedCss} />
        </div>
      );
      break;
    }

    case "slider":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="range"
          value={
            value === "" || value === undefined || value === null
              ? "0"
              : String(Number(value))
          }
          disabled={field.disabled}
          required={required}
          min={validation?.min != null ? String(validation.min) : undefined}
          max={validation?.max != null ? String(validation.max) : undefined}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeText={(nextValue) => onChange(Number(nextValue))}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "color":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="color"
          value={typeof value === "string" && value ? value : "#2563eb"}
          disabled={field.disabled}
          required={required}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          onChangeText={onChange}
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={{
            ...(inputStyle ?? {}),
            minHeight: "2.75rem",
            padding: "var(--sn-spacing-xs, 0.25rem)",
          }}
        />
      );
      break;

    case "combobox": {
      const fieldOptions = Array.isArray(field.options) ? field.options : [];
      const listId = `${fieldId}-list`;
      input = (
        <>
          <InputControl
            inputId={fieldId}
            name={field.name}
            list={listId}
            value={(value as string) ?? ""}
            disabled={field.disabled}
            readOnly={field.readOnly}
            required={required}
            ariaInvalid={hasError}
            ariaDescribedBy={describedBy}
            ariaLabel={label}
            placeholder={placeholder}
            onChangeText={onChange}
            onBlur={onBlur}
            surfaceId={`${rootId}-input-${field.name}`}
            className={inputSurface.className}
            style={inputStyle}
          />
          <datalist id={listId}>
            {fieldOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </datalist>
        </>
      );
      break;
    }

    case "password":
      input = (
        <>
          <InputControl
            inputId={fieldId}
            name={field.name}
            type={passwordVisible ? "text" : "password"}
            value={(value as string) ?? ""}
            disabled={field.disabled}
            readOnly={field.readOnly}
            required={required}
            ariaInvalid={hasError}
            ariaDescribedBy={describedBy}
            ariaLabel={label}
            placeholder={placeholder}
            autoComplete={field.autoComplete}
            onChangeText={onChange}
            onBlur={onBlur}
            surfaceId={`${rootId}-input-${field.name}`}
            className={inputSurface.className}
            style={{
              ...(inputStyle ?? {}),
              paddingRight: "var(--sn-spacing-2xl, 2.5rem)",
            }}
          />
          <ButtonControl
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setPasswordVisible((current) => !current)}
            ariaLabel={passwordVisible ? "Hide password" : "Show password"}
            surfaceId={`${rootId}-password-toggle-${field.name}`}
            surfaceConfig={passwordToggleSurface.resolvedConfigForWrapper}
          >
            <Icon name={passwordVisible ? "eye-off" : "eye"} size={16} />
          </ButtonControl>
        </>
      );
      break;

    default:
      input = (
        <>
          <InputControl
            inputId={fieldId}
            name={field.name}
            type={(
              field.type === "password"
                ? (passwordVisible ? "text" : "password")
                : field.type === "datetime"
                  ? "datetime-local"
                  : field.type
            ) as Parameters<typeof InputControl>[0]["type"]}
            value={(value as string) ?? ""}
            disabled={field.disabled}
            readOnly={field.readOnly}
            required={required}
            ariaInvalid={hasError}
            ariaDescribedBy={describedBy}
            ariaLabel={label}
            placeholder={placeholder}
            autoComplete={field.autoComplete}
            onChangeText={onChange}
            onBlur={onBlur}
            surfaceId={`${rootId}-input-${field.name}`}
            className={inputSurface.className}
            style={inputStyle}
          />
        </>
      );
      break;
  }

  // Checkbox / switch layout — label is inline
  if (field.type === "checkbox" || field.type === "switch") {
    return (
      <div
        data-sn-field={field.name}
        data-snapshot-id={`${rootId}-field-${field.name}`}
        className={fieldSurface.className}
        style={fieldSurface.style}
      >
        <label
          htmlFor={fieldId}
          data-snapshot-id={`${rootId}-label-${field.name}`}
          className={labelSurface.className}
          style={{
            display: field.type === "checkbox" ? "inline-flex" : "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            cursor: field.disabled ? "not-allowed" : "pointer",
            ...(labelSurface.style as React.CSSProperties),
          }}
        >
          {input}
          <span>{label}</span>
        </label>
        {helperText && !hasError && (
          <div
            id={`${fieldId}-helper`}
            data-snapshot-id={`${rootId}-helper-${field.name}`}
            className={helperSurface.className}
            style={helperSurface.style}
          >
            {helperText}
          </div>
        )}
        {hasError && error ? (
          <div
            id={`${fieldId}-error`}
            role="alert"
            data-sn-field-error
            data-snapshot-id={`${rootId}-error-${field.name}`}
            className={errorSurface.className}
            style={errorSurface.style}
          >
            {error}
          </div>
        ) : null}
        <SurfaceStyles css={fieldSurface.scopedCss} />
        <SurfaceStyles css={labelSurface.scopedCss} />
        <SurfaceStyles css={inputSurface.scopedCss} />
        <SurfaceStyles css={helperSurface.scopedCss} />
        <SurfaceStyles css={errorSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div
      data-sn-field={field.name}
      data-snapshot-id={`${rootId}-field-${field.name}`}
      className={fieldSurface.className}
      style={fieldSurface.style}
    >
      <label
        htmlFor={fieldId}
        data-snapshot-id={`${rootId}-label-${field.name}`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        <span>
          {label}
          {required && (
            <span
              data-snapshot-id={`${rootId}-required-${field.name}`}
              className={requiredIndicatorSurface.className}
              style={requiredIndicatorSurface.style}
            >
              *
            </span>
          )}
        </span>
        {inlineActionLabel && inlineActionTarget ? (
          onInlineAction ? (
            <ButtonControl
              type="button"
              onClick={() => {
                onInlineAction(field.name, inlineActionTarget);
              }}
              variant="ghost"
              size="sm"
              surfaceId={`${rootId}-inline-action-${field.name}`}
              surfaceConfig={inlineActionSurface.resolvedConfigForWrapper}
            >
              {inlineActionLabel}
            </ButtonControl>
          ) : (
            <a
              href={inlineActionTarget}
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                color: "var(--sn-color-primary, #2563eb)",
                textDecoration: "none",
              }}
            >
              {inlineActionLabel}
            </a>
          )
        ) : null}
      </label>
      <div
        data-snapshot-id={`${rootId}-inputWrapper-${field.name}`}
        className={inputWrapperSurface.className}
        style={inputWrapperSurface.style}
      >
        {input}
      </div>
      {description && (
        <div
          data-snapshot-id={`${rootId}-description-${field.name}`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {description}
        </div>
      )}
      {helperText && !hasError ? (
        <div
          id={`${fieldId}-helper`}
          data-snapshot-id={`${rootId}-helper-${field.name}`}
          className={helperSurface.className}
          style={helperSurface.style}
        >
          {helperText}
        </div>
      ) : null}
      {hasError && error ? (
        <div
          id={`${fieldId}-error`}
          role="alert"
          data-sn-field-error
          data-snapshot-id={`${rootId}-error-${field.name}`}
          className={errorSurface.className}
          style={errorSurface.style}
        >
          {error}
        </div>
      ) : null}
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={inputWrapperSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={optionsSurface.scopedCss} />
      <SurfaceStyles css={helperSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={requiredIndicatorSurface.scopedCss} />
    </div>
  );
}

// ── Standalone section renderer ──────────────────────────────────────────

function StandaloneSectionRenderer({
  rootId,
  section,
  sectionKey,
  fields,
  values,
  errors,
  touched,
  columns,
  gap,
  slots,
  onFieldChange,
  onFieldBlur,
  onInlineAction,
}: {
  rootId: string;
  section: AutoFormSectionConfig;
  sectionKey: string;
  fields: AutoFormFieldConfig[];
  values: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  columns: number;
  gap: string;
  slots?: Record<string, Record<string, unknown>>;
  onFieldChange: (name: string, value: unknown) => void;
  onFieldBlur: (name: string) => void;
  onInlineAction?: (fieldName: string, to: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false);
  const sectionTitle = section.title ?? "section";
  const sectionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-${sectionKey}`,
    implementationBase: {
      border: "none",
      padding: 0,
      margin: 0,
      style: {
        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
      },
    } as Record<string, unknown>,
    componentSurface: slots?.section,
    itemSurface: section.slots?.section,
  });
  const sectionHeaderSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-header-${sectionKey}`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      cursor: section.collapsible ? "pointer" : undefined,
      style: {
        marginBottom: collapsed ? 0 : gap,
      },
    } as Record<string, unknown>,
    componentSurface: slots?.sectionHeader,
    itemSurface: section.slots?.sectionHeader,
    activeStates: section.collapsible && !collapsed ? ["open"] : undefined,
  });
  const sectionToggleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-toggle-${sectionKey}`,
    implementationBase: {
      display: "inline-flex",
      transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
      transition:
        "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
    } as Record<string, unknown>,
    componentSurface: slots?.sectionToggle,
    itemSurface: section.slots?.sectionToggle,
    activeStates: section.collapsible && !collapsed ? ["open"] : undefined,
  });
  const sectionTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-title-${sectionKey}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-md, 1rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-foreground, #111827)",
    } as Record<string, unknown>,
    componentSurface: slots?.sectionTitle,
    itemSurface: section.slots?.sectionTitle,
  });
  const sectionDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-description-${sectionKey}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: slots?.sectionDescription,
    itemSurface: section.slots?.sectionDescription,
  });

  return (
    <fieldset
      data-sn-section={sectionTitle}
      data-snapshot-id={`${rootId}-section-${sectionKey}`}
      className={sectionSurface.className}
      style={sectionSurface.style}
    >
      {/* Section header */}
      <div
        data-snapshot-id={`${rootId}-section-header-${sectionKey}`}
        className={sectionHeaderSurface.className}
        style={sectionHeaderSurface.style}
        onClick={
          section.collapsible ? () => setCollapsed(!collapsed) : undefined
        }
      >
        {section.collapsible && (
          <span
            data-snapshot-id={`${rootId}-section-toggle-${sectionKey}`}
            className={sectionToggleSurface.className}
            style={sectionToggleSurface.style}
          >
            <Icon name="chevron-right" size={16} />
          </span>
        )}
        <div>
          <div
            data-snapshot-id={`${rootId}-section-title-${sectionKey}`}
            className={sectionTitleSurface.className}
            style={sectionTitleSurface.style}
          >
            {sectionTitle}
          </div>
          {section.description && (
            <div
              data-snapshot-id={`${rootId}-section-description-${sectionKey}`}
              className={sectionDescriptionSurface.className}
              style={sectionDescriptionSurface.style}
            >
              {section.description}
            </div>
          )}
        </div>
      </div>

      {/* Section fields */}
      {!collapsed && (
        <StandaloneFieldGrid
          gridId={`${rootId}-section-fields-${sectionKey}`}
          rootId={rootId}
          fields={fields}
          values={values}
          errors={errors}
          touched={touched}
          columns={columns}
          gap={gap}
          slots={slots}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          onInlineAction={onInlineAction}
        />
      )}
      <SurfaceStyles css={sectionSurface.scopedCss} />
      <SurfaceStyles css={sectionHeaderSurface.scopedCss} />
      <SurfaceStyles css={sectionToggleSurface.scopedCss} />
      <SurfaceStyles css={sectionTitleSurface.scopedCss} />
      <SurfaceStyles css={sectionDescriptionSurface.scopedCss} />
    </fieldset>
  );
}

// ── Standalone field grid ────────────────────────────────────────────────

function StandaloneFieldGrid({
  gridId,
  rootId,
  fields,
  values,
  errors,
  touched,
  columns,
  gap,
  slots,
  onFieldChange,
  onFieldBlur,
  onInlineAction,
}: {
  gridId: string;
  rootId: string;
  fields: AutoFormFieldConfig[];
  values: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  columns: number;
  gap: string;
  slots?: Record<string, Record<string, unknown>>;
  onFieldChange: (name: string, value: unknown) => void;
  onFieldBlur: (name: string) => void;
  onInlineAction?: (fieldName: string, to: string) => void;
}) {
  const gridSurface = resolveSurfacePresentation({
    surfaceId: gridId,
    implementationBase: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap,
    },
    componentSurface: slots?.fieldGrid,
  });

  return (
    <div
      data-snapshot-id={gridId}
      className={gridSurface.className}
      style={gridSurface.style}
    >
      {fields.map((field) => {
        if (field.hidden) return null;

        const cellSurface = resolveSurfacePresentation({
          surfaceId: `${gridId}-cell-${field.name}`,
          implementationBase: {
            gridColumn: field.span
              ? `span ${Math.min(field.span, columns)}`
              : `span ${columns}`,
          },
          componentSurface: slots?.fieldCell,
          itemSurface: field.slots?.fieldCell,
        });

        return (
          <div
            key={field.name}
            data-snapshot-id={`${gridId}-cell-${field.name}`}
            className={cellSurface.className}
            style={cellSurface.style}
          >
            <StandaloneFieldRenderer
              rootId={rootId}
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              showError={Boolean(touched[field.name])}
              onChange={(value) => onFieldChange(field.name, value)}
              onBlur={() => onFieldBlur(field.name)}
              slots={slots}
              onInlineAction={onInlineAction}
            />
            <SurfaceStyles css={cellSurface.scopedCss} />
          </div>
        );
      })}
      <SurfaceStyles css={gridSurface.scopedCss} />
    </div>
  );
}

/**
 * Standalone AutoFormBase -- renders a config-driven form with fields, sections,
 * validation, and submit/reset actions. No manifest context required.
 *
 * @example
 * ```tsx
 * <AutoFormBase
 *   fields={[
 *     { name: "email", type: "email", label: "Email", required: true },
 *     { name: "password", type: "password", label: "Password", required: true },
 *   ]}
 *   values={values}
 *   errors={errors}
 *   touched={touched}
 *   onFieldChange={handleChange}
 *   onFieldBlur={handleBlur}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function AutoFormBase({
  id,
  fields,
  sections,
  values,
  errors,
  touched,
  isSubmitting = false,
  isDirty = false,
  isValid,
  submitLabel: submitLabelProp,
  submitLoadingLabel: submitLoadingLabelProp,
  resetLabel: resetLabelProp,
  showReset = false,
  layout = "vertical",
  gap = "md",
  columns: columnsProp,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  onReset,
  onInlineAction,
  submitVariant,
  submitSize,
  submitFullWidth,
  submitIcon,
  dataComponent,
  dataTestId,
  className,
  style,
  slots,
}: AutoFormBaseProps) {
  const rootId = id ?? "auto-form";
  const submitLabel = submitLabelProp ?? "Submit";
  const submitLoadingLabel = submitLoadingLabelProp ?? "Submitting...";
  const resetLabel = resetLabelProp ?? "Reset";
  const resolvedGap = GAP_MAP[gap] ?? GAP_MAP["md"]!;

  // If columns is explicitly set, use grid layout; otherwise fall back to layout prop
  const useGridLayout = columnsProp != null && columnsProp > 0;
  const columns = useGridLayout ? columnsProp : 1;

  const allFields: AutoFormFieldConfig[] = sections
    ? sections.flatMap((s) => s.fields)
    : fields ?? [];

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: resolvedGap,
      alignItems: layout === "horizontal" ? "stretch" : undefined,
    } as Record<string, unknown>,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actions`,
    componentSurface: slots?.actions,
  });

  // Determine whether submit should be disabled
  const submitDisabled =
    isSubmitting || (isValid !== undefined ? !isValid : false);

  return (
    <form
      data-snapshot-component={dataComponent ?? "auto-form"}
      data-testid={dataTestId}
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
      style={rootSurface.style}
    >
      {/* Sections mode */}
      {sections ? (
        sections.map((section, index) => {
          const sectionKey = section.title ?? `section-${index}`;
          return (
            <StandaloneSectionRenderer
              key={`${sectionKey}-${index}`}
              rootId={rootId}
              section={section}
              sectionKey={sectionKey}
              fields={section.fields}
              values={values}
              errors={errors}
              touched={touched}
              columns={columns}
              gap={resolvedGap}
              slots={slots}
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
              onInlineAction={onInlineAction}
            />
          );
        })
      ) : useGridLayout ? (
        /* Grid field layout */
        <StandaloneFieldGrid
          gridId={`${rootId}-fields`}
          rootId={rootId}
          fields={allFields}
          values={values}
          errors={errors}
          touched={touched}
          columns={columns}
          gap={resolvedGap}
          slots={slots}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
          onInlineAction={onInlineAction}
        />
      ) : (
        /* Flat fields mode (legacy flex layout) */
        (() => {
          const fieldsSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-fields`,
            implementationBase: {
              display: layout === "grid" ? "grid" : "flex",
              flexDirection: layout === "horizontal" ? "row" : "column",
              flexWrap: layout === "horizontal" ? "wrap" : undefined,
              gap: resolvedGap,
              style:
                layout === "grid"
                  ? { gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }
                  : undefined,
            } as Record<string, unknown>,
            componentSurface: slots?.fields,
          });
          return (
            <div
              data-snapshot-id={`${rootId}-fields`}
              className={fieldsSurface.className}
              style={fieldsSurface.style}
            >
              {allFields.map((field) => (
                <StandaloneFieldRenderer
                  key={field.name}
                  rootId={rootId}
                  field={field}
                  value={values[field.name]}
                  error={errors[field.name]}
                  showError={Boolean(touched[field.name])}
                  onChange={(value) => onFieldChange(field.name, value)}
                  onBlur={() => onFieldBlur(field.name)}
                  slots={slots}
                  onInlineAction={onInlineAction}
                />
              ))}
              <SurfaceStyles css={fieldsSurface.scopedCss} />
            </div>
          );
        })()
      )}

      {/* Submit button */}
      <div
        data-snapshot-id={`${rootId}-actions`}
        className={actionsSurface.className}
        style={actionsSurface.style}
      >
        {showReset && onReset ? (
          <ButtonControl
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!isDirty}
            surfaceId={`${rootId}-resetButton`}
            surfaceConfig={slots?.resetButton}
          >
            {resetLabel}
          </ButtonControl>
        ) : null}
        <ButtonControl
          type="submit"
          disabled={submitDisabled}
          variant={submitVariant ?? "default"}
          size={submitSize ?? "sm"}
          fullWidth={submitFullWidth}
          surfaceId={`${rootId}-submit`}
          surfaceConfig={slots?.submitButton}
          activeStates={submitDisabled ? ["disabled"] : []}
        >
          {submitIcon ? <Icon name={submitIcon} size={16} /> : null}
          {isSubmitting ? submitLoadingLabel : submitLabel}
        </ButtonControl>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
    </form>
  );
}
