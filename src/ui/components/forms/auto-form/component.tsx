'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import { Icon } from "../../../icons/index";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
  type EndpointTarget,
  type ResourceMap,
} from "../../../manifest/resources";
import {
  useManifestResourceCache,
  useManifestRuntime,
} from "../../../manifest/runtime";
import { useRouteRuntime } from "../../../manifest/runtime";
import { executeEventAction } from "../../_base/events";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { SelectControl } from "../select";
import { TextareaControl } from "../textarea";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useEvaluateExpression } from "../../../expressions/use-expression";
import { resolveTemplateValue } from "../../../expressions/template";
import { useAutoForm } from "./hook";
import { useApiClient } from "../../../state";
import type { AutoFormConfig, FieldConfig, FieldSectionConfig } from "./types";
import type { ApiClient } from "../../../../api/client";

// ── Gap map ───────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNormalizedString(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (isRecord(value)) {
    const nested =
      value["value"] ?? value["id"] ?? value["key"] ?? value["name"] ?? "";
    return nested === undefined || nested === null ? "" : String(nested);
  }

  return String(value);
}

function toDateInputValue(value: unknown): string {
  if (typeof value === "string") {
    const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (directMatch?.[1]) {
      return directMatch[1];
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return toNormalizedString(value);
}

function toDateTimeInputValue(value: unknown): string {
  if (typeof value === "string") {
    const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
    if (directMatch?.[1] && directMatch[2]) {
      return `${directMatch[1]}T${directMatch[2]}`;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 16);
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 16);
  }

  return toNormalizedString(value);
}

function toNumericValue(value: unknown, divisor?: number): number | "" {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  if (divisor && divisor !== 1) {
    return numericValue / divisor;
  }

  return numericValue;
}

function normalizeFieldValue(field: FieldConfig, value: unknown): unknown {
  switch (field.type) {
    case "date":
      return toDateInputValue(value);
    case "datetime":
      return toDateTimeInputValue(value);
    case "number":
      return toNumericValue(value, field.divisor);
    case "select":
    case "radio-group":
    case "combobox":
      return toNormalizedString(value);
    case "multi-select":
      if (Array.isArray(value)) {
        return value.map((item) => toNormalizedString(item)).filter(Boolean);
      }
      return value === undefined || value === null || value === ""
        ? []
        : [toNormalizedString(value)];
    case "tag-input":
      if (Array.isArray(value)) {
        return value.map((item) => toNormalizedString(item)).filter(Boolean);
      }
      return typeof value === "string"
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
    default:
      return value;
  }
}

function normalizeFormValues(
  fields: FieldConfig[],
  data: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const field of fields) {
    if (!(field.name in data)) {
      continue;
    }
    normalized[field.name] = normalizeFieldValue(field, data[field.name]);
  }

  return normalized;
}

function serializeFieldValue(field: FieldConfig, value: unknown): unknown {
  switch (field.type) {
    case "number": {
      if (value === undefined || value === null || value === "") {
        return value;
      }

      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numericValue)) {
        return value;
      }

      if (field.divisor && field.divisor !== 1) {
        return Math.round(numericValue * field.divisor);
      }

      return numericValue;
    }
    case "multi-select":
      return Array.isArray(value)
        ? value.map((item) => toNormalizedString(item)).filter(Boolean)
        : [];
    case "select":
    case "radio-group":
    case "combobox":
      return toNormalizedString(value);
    default:
      return value;
  }
}

function serializeFormValues(
  fields: FieldConfig[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const field of fields) {
    if (!(field.name in values)) {
      continue;
    }
    serialized[field.name] = serializeFieldValue(field, values[field.name]);
  }

  return serialized;
}

function isHaltSignal(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return value["halt"] === true;
}

export function toFieldOptions(
  data: unknown,
  labelField = "name",
  valueField = "id",
) {
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const label =
          record["label"] ?? record[labelField] ?? record["name"] ?? record["title"];
        const value =
          record["value"] ?? record[valueField] ?? record["id"] ?? record["key"];
        if (label == null || value == null) return null;
        return { label: String(label), value: String(value) };
      })
      .filter(
        (item): item is { label: string; value: string } => item !== null,
      );
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as Record<string, unknown>)["data"])
  ) {
    return toFieldOptions(
      (data as Record<string, unknown>)["data"],
      labelField,
      valueField,
    );
  }

  return [];
}

// ── Conditional visibility ────────────────────────────────────────────────

function isFieldVisible(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.visible === false) return false;

  if (
    field.visible &&
    typeof field.visible === "object" &&
    "from" in field.visible
  ) {
    return Boolean(values[field.visible.from]);
  }

  if (field.dependsOn) {
    const dep = field.dependsOn;
    const watchedValue = values[dep.field];

    if (dep.value !== undefined) {
      return watchedValue === dep.value;
    }
    if (dep.notValue !== undefined) {
      return watchedValue !== dep.notValue;
    }
    if (dep.filled) {
      return (
        watchedValue !== undefined &&
        watchedValue !== null &&
        watchedValue !== "" &&
        watchedValue !== false
      );
    }
  }

  return true;
}

function isFieldRequired(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.required === true) {
    return true;
  }

  return Boolean(
    field.required &&
      typeof field.required === "object" &&
      "from" in field.required &&
      values[field.required.from],
  );
}

// ── Resolve fields ────────────────────────────────────────────────────────

function resolveFields(config: AutoFormConfig): FieldConfig[] {
  if (config.sections) {
    return config.sections.flatMap((s: FieldSectionConfig) => s.fields);
  }
  if (config.fields === "auto") return [];
  return config.fields;
}

function resolveText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function resolveStaticFieldOptions(field: FieldConfig) {
  if (!Array.isArray(field.options)) {
    return field.options;
  }

  return field.options.map((option) => ({
    ...option,
    label: resolveText(option.label) ?? option.value,
  }));
}

// ── Field renderer ────────────────────────────────────────────────────────

function FieldRenderer({
  rootId,
  field,
  value,
  required,
  error,
  showError,
  onChange,
  onBlur,
  slots,
}: {
  rootId: string;
  field: FieldConfig;
  value: unknown;
  required: boolean;
  error: string | undefined;
  showError: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  slots?: AutoFormConfig["slots"];
}) {
  const executeAction = useActionExecutor();
  const showByExpression = useEvaluateExpression(field.visibleWhen);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const label = resolveText(field.label) ?? field.name;
  const placeholder = resolveText(field.placeholder);
  const helperText = resolveText(field.helperText);
  const description = resolveText(field.description);
  const inlineActionLabel = resolveText(field.inlineAction?.label);
  const inlineActionTarget = resolveText(field.inlineAction?.to);
  const staticFieldOptions = resolveStaticFieldOptions(field);
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
      display: "block",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: "var(--sn-font-weight-medium, 500)",
      color: "var(--sn-color-foreground, #111827)",
    } as Record<string, unknown>,
    componentSurface: slots?.label,
    itemSurface: field.slots?.label,
    activeStates,
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
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input-${field.name}`,
    implementationBase: {
      focus: {
        ring: true,
      },
      states: {
        invalid: {
          borderColor: "var(--sn-color-destructive, #ef4444)",
        },
      },
    },
    componentSurface: slots?.input,
    itemSurface: field.slots?.input,
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

  const optionsResult = useComponentData(
    !Array.isArray(staticFieldOptions) && staticFieldOptions
      ? staticFieldOptions
      : "",
  );
  let input: React.ReactNode;

  if (!showByExpression) {
    return null;
  }

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
      const fieldOptions = Array.isArray(staticFieldOptions)
        ? staticFieldOptions
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );

      input = (
        <SelectControl
          selectId={fieldId}
          name={field.name}
          value={toNormalizedString(value)}
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
          {!value && !field.default ? (
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
      const fieldOptions = Array.isArray(staticFieldOptions)
        ? staticFieldOptions
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );
      const selectedValues = Array.isArray(value)
        ? value.map((item) => toNormalizedString(item)).filter(Boolean)
        : [];

      input = (
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
          className={inputSurface.className}
          style={{
            width: "100%",
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            lineHeight: "var(--sn-leading-normal, 1.5)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-background, #ffffff)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition:
              "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
            ...(inputStyle ?? {}),
            minHeight: `${Math.min(fieldOptions.length + 0.5, 8) * 1.75}rem`,
            paddingRight: "var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          {fieldOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

      input = (
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
          className={inputSurface.className}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            padding: 0,
            border: "none",
            background: "none",
            cursor: field.disabled ? "not-allowed" : "pointer",
            opacity: field.disabled ? 0.5 : undefined,
            ...(inputSurface.style as React.CSSProperties),
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              width: switchTrackW,
              height: switchTrackH,
              flexShrink: 0,
              borderRadius: "9999px",
              backgroundColor: switchChecked
                ? "var(--sn-color-primary, #2563eb)"
                : "var(--sn-color-secondary, #e5e7eb)",
              transition:
                "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: switchThumbOffset,
                left: switchThumbOffset,
                width: switchThumb,
                height: switchThumb,
                borderRadius: "9999px",
                backgroundColor: "var(--sn-color-card, #ffffff)",
                boxShadow:
                  "var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.2))",
                transform: `translateX(${switchThumbTranslate}px)`,
                transition:
                  "transform var(--sn-duration-fast, 150ms) cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </span>
        </button>
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
      const fieldOptions = Array.isArray(staticFieldOptions)
        ? staticFieldOptions
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );

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
          min={field.validation?.min != null ? String(field.validation.min) : undefined}
          max={field.validation?.max != null ? String(field.validation.max) : undefined}
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
      const fieldOptions = Array.isArray(staticFieldOptions)
        ? staticFieldOptions
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );
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

    case "tag-input":
      input = (
        <InputControl
          inputId={fieldId}
          name={field.name}
          type="text"
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          disabled={field.disabled}
          readOnly={field.readOnly}
          required={required}
          ariaInvalid={hasError}
          ariaDescribedBy={describedBy}
          ariaLabel={label}
          placeholder={placeholder}
          onChangeText={(nextValue) =>
            onChange(
              nextValue
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          onBlur={onBlur}
          surfaceId={`${rootId}-input-${field.name}`}
          className={inputSurface.className}
          style={inputStyle}
        />
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
            style={{
              ...(inputStyle ?? {}),
              paddingRight:
                field.type === "password"
                  ? "var(--sn-spacing-2xl, 2.5rem)"
                  : inputStyle?.paddingRight,
            }}
          />
          {field.type === "password" ? (
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
          ) : null}
        </>
      );
      break;
  }

  // Checkbox has label inline
  if (field.type === "checkbox") {
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
            display: "inline-flex",
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
        {hasError && (
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
        )}
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
        style={{
          display: inlineActionLabel && inlineActionTarget ? "flex" : "block",
          justifyContent:
            inlineActionLabel && inlineActionTarget ? "space-between" : undefined,
          alignItems:
            inlineActionLabel && inlineActionTarget ? "baseline" : undefined,
          ...(labelSurface.style as React.CSSProperties),
        }}
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
          <ButtonControl
            type="button"
            onClick={() => {
              void executeAction({ type: "navigate", to: inlineActionTarget } as never);
            }}
            variant="ghost"
            size="sm"
            surfaceId={`${rootId}-inline-action-${field.name}`}
            surfaceConfig={inlineActionSurface.resolvedConfigForWrapper}
          >
            {inlineActionLabel}
          </ButtonControl>
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
      {hasError && (
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
      )}
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

function buildTemplateContext(
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): Record<string, unknown> {
  return {
    app: runtime?.app ?? {},
    auth: {
      ...(runtime?.raw.auth ?? {}),
      ...(runtime?.auth ?? {}),
    },
    route: {
      ...(routeRuntime?.currentRoute ?? {}),
      path: routeRuntime?.currentPath,
      params: routeRuntime?.params,
      query: routeRuntime?.query,
    },
  };
}

function resolveMaybeTemplate(
  value: unknown,
  locale: string | undefined,
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): unknown {
  return resolveTemplateValue(
    value,
    buildTemplateContext(runtime, routeRuntime),
    {
      locale,
      i18n: runtime?.raw.i18n,
    },
  );
}

function resolveEndpointTemplates<T>(
  value: T,
  locale: string | undefined,
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): T {
  if (typeof value === "string") {
    return resolveMaybeTemplate(value, locale, runtime, routeRuntime) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveEndpointTemplates(item, locale, runtime, routeRuntime),
    ) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveEndpointTemplates(nested, locale, runtime, routeRuntime),
      ]),
    ) as T;
  }

  return value;
}

// ── Section renderer ──────────────────────────────────────────────────────

function SectionRenderer({
  rootId,
  section,
  form,
  columns,
  gap,
  slots,
}: {
  rootId: string;
  section: FieldSectionConfig;
  form: ReturnType<typeof useAutoForm>;
  columns: number;
  gap: string;
  slots?: AutoFormConfig["slots"];
}) {
  const [collapsed, setCollapsed] = useState(section.defaultCollapsed ?? false);
  const sectionTitle = resolveText(section.title) ?? "section";
  const sectionDescription = resolveText(section.description);
  const sectionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-${sectionTitle}`,
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
    surfaceId: `${rootId}-section-header-${sectionTitle}`,
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
    surfaceId: `${rootId}-section-toggle-${sectionTitle}`,
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
    surfaceId: `${rootId}-section-title-${sectionTitle}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-md, 1rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-foreground, #111827)",
    } as Record<string, unknown>,
    componentSurface: slots?.sectionTitle,
    itemSurface: section.slots?.sectionTitle,
  });
  const sectionDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-description-${sectionTitle}`,
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
      data-snapshot-id={`${rootId}-section-${sectionTitle}`}
      className={sectionSurface.className}
      style={sectionSurface.style}
    >
      {/* Section header */}
      <div
        data-snapshot-id={`${rootId}-section-header-${sectionTitle}`}
        className={sectionHeaderSurface.className}
        style={sectionHeaderSurface.style}
        onClick={
          section.collapsible ? () => setCollapsed(!collapsed) : undefined
        }
      >
        {section.collapsible && (
          <span
            data-snapshot-id={`${rootId}-section-toggle-${sectionTitle}`}
            className={sectionToggleSurface.className}
            style={sectionToggleSurface.style}
          >
            <Icon name="chevron-right" size={16} />
          </span>
        )}
        <div>
          <div
            data-snapshot-id={`${rootId}-section-title-${sectionTitle}`}
            className={sectionTitleSurface.className}
            style={sectionTitleSurface.style}
          >
            {sectionTitle}
          </div>
          {sectionDescription && (
            <div
              data-snapshot-id={`${rootId}-section-description-${sectionTitle}`}
              className={sectionDescriptionSurface.className}
              style={sectionDescriptionSurface.style}
            >
              {sectionDescription}
            </div>
          )}
        </div>
      </div>

      {/* Section fields */}
      {!collapsed && (
        <FieldGrid
          rootId={rootId}
          fields={section.fields}
          form={form}
          columns={columns}
          gap={gap}
          slots={slots}
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

// ── Field grid ────────────────────────────────────────────────────────────

function FieldGrid({
  rootId,
  fields,
  form,
  columns,
  gap,
  slots,
}: {
  rootId: string;
  fields: FieldConfig[];
  form: ReturnType<typeof useAutoForm>;
  columns: number;
  gap: string;
  slots?: AutoFormConfig["slots"];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {fields.map((field) => {
        if (!isFieldVisible(field, form.values)) return null;

        return (
          <div
            key={field.name}
            style={{
              gridColumn: field.span
                ? `span ${Math.min(field.span, columns)}`
                : `span ${columns}`,
            }}
          >
            <FieldRenderer
              rootId={rootId}
              field={field}
              value={form.values[field.name]}
              required={isFieldRequired(field, form.values)}
              error={form.errors[field.name]}
              showError={!!form.touched[field.name]}
              onChange={(value) => form.setValue(field.name, value)}
              onBlur={() => form.touchField(field.name)}
              slots={slots}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Submit helper ─────────────────────────────────────────────────────────

async function submitToApi(
  api: ApiClient,
  target: EndpointTarget,
  resources: ResourceMap | undefined,
  fallbackMethod: "POST" | "PUT" | "PATCH",
  values: Record<string, unknown>,
): Promise<unknown> {
  const request = resolveEndpointTarget(
    target,
    resources,
    undefined,
    fallbackMethod,
  );
  const endpoint = buildRequestUrl(
    request.endpoint,
    request.params,
    { ...request.params, ...values },
  );
  switch (request.method) {
    case "PUT":
      return api.put(endpoint, values);
    case "PATCH":
      return api.patch(endpoint, values);
    default:
      return api.post(endpoint, values);
  }
}

// ── Main component ────────────────────────────────────────────────────────

/**
 * Config-driven form component with multi-column layout, conditional
 * field visibility, and section grouping.
 *
 * Supports client-side validation, submission to an API endpoint,
 * manifest-aware resource mutation (invalidation + optimistic handling),
 * workflow lifecycle hooks (`beforeSubmit`, `afterSubmit`, `error`),
 * and action chaining on success/error. Publishes form state to the
 * page context when an `id` is configured.
 *
 * @param props - Component props containing the form config
 */
export function AutoForm({ config }: { config: AutoFormConfig }) {
  const api = useApiClient();
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const runtime = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const resourceCache = useManifestResourceCache();
  const localeState = useSubscribe({ from: "global.locale" });
  const autoSubmitAllowed = useEvaluateExpression(config.autoSubmitWhen);
  const lastAutoSubmitRef = useRef<string | null>(null);
  const lastPublishedStateRef = useRef<string | null>(null);
  const lastInitialDataRef = useRef<string | null>(null);
  const formRef = useRef<ReturnType<typeof useAutoForm> | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const activeLocale = resolveRuntimeLocale(runtime?.raw.i18n, localeState);
  const resolvedDataTarget = useMemo(
    () =>
      resolveEndpointTemplates(
        config.data ?? "",
        activeLocale,
        runtime,
        routeRuntime,
      ),
    [activeLocale, config.data, routeRuntime, runtime],
  );
  const resolvedSubmitTarget = useMemo(
    () =>
      resolveEndpointTemplates(
        config.submit,
        activeLocale,
        runtime,
        routeRuntime,
      ),
    [activeLocale, config.submit, routeRuntime, runtime],
  );
  const initialData = useComponentData(resolvedDataTarget);

  const allFields = useMemo(() => resolveFields(config), [config]);
  const fieldRefValues = useResolveFrom({ fields: allFields });
  const sectionRefValues = useResolveFrom({ sections: config.sections });
  const formCopyRefValues = useResolveFrom({
    submitLabel: config.submitLabel,
    submitLoadingLabel: config.submitLoadingLabel,
  });
  const fieldRefSignature = JSON.stringify(fieldRefValues.fields ?? allFields);
  const sectionRefSignature = JSON.stringify(
    sectionRefValues.sections ?? config.sections ?? null,
  );
  const fieldsWithRefs = useMemo(
    () => (fieldRefValues.fields as FieldConfig[] | undefined) ?? allFields,
    [allFields, fieldRefSignature],
  );
  const sectionsWithRefs = useMemo(
    () =>
      (sectionRefValues.sections as FieldSectionConfig[] | undefined) ??
      config.sections,
    [config.sections, sectionRefSignature],
  );
  const resolvedFields = useMemo(
    () =>
      fieldsWithRefs.map((field) => ({
        ...field,
        label:
          resolveText(
            resolveMaybeTemplate(
              field.label,
              activeLocale,
              runtime,
              routeRuntime,
            ),
          ) ??
          resolveText(field.label) ??
          field.name,
        placeholder:
          resolveText(
            resolveMaybeTemplate(
              field.placeholder,
              activeLocale,
              runtime,
              routeRuntime,
            ),
          ) ?? resolveText(field.placeholder),
        helperText:
          resolveText(
            resolveMaybeTemplate(
              field.helperText,
              activeLocale,
              runtime,
              routeRuntime,
            ),
          ) ?? resolveText(field.helperText),
        description:
          resolveText(
            resolveMaybeTemplate(
              field.description,
              activeLocale,
              runtime,
              routeRuntime,
            ),
          ) ?? resolveText(field.description),
        default: resolveMaybeTemplate(
          field.default,
          activeLocale,
          runtime,
          routeRuntime,
        ),
        options: Array.isArray(field.options)
          ? field.options.map((option) => ({
              ...option,
              label:
                resolveText(
                  resolveMaybeTemplate(
                    option.label,
                    activeLocale,
                    runtime,
                    routeRuntime,
                  ),
                ) ??
                resolveText(option.label) ??
                option.value,
            }))
          : resolveEndpointTemplates(
              field.options,
              activeLocale,
              runtime,
              routeRuntime,
            ),
        inlineAction: field.inlineAction
          ? {
              ...field.inlineAction,
              label:
                resolveText(
                  resolveMaybeTemplate(
                    field.inlineAction.label,
                    activeLocale,
                    runtime,
                    routeRuntime,
                  ),
                ) ??
                resolveText(field.inlineAction.label) ??
                "",
              to:
                resolveText(
                  resolveMaybeTemplate(
                    field.inlineAction.to,
                    activeLocale,
                    runtime,
                    routeRuntime,
                  ),
                ) ??
                resolveText(field.inlineAction.to) ??
                "",
            }
          : undefined,
      })),
    [
      activeLocale,
      fieldsWithRefs,
      routeRuntime,
      runtime?.app,
      runtime?.auth,
      runtime?.raw.i18n,
    ],
  );
  const resolvedFieldMap = useMemo(
    () => new Map(resolvedFields.map((field) => [field.name, field])),
    [resolvedFields],
  );
  const resolvedSections = useMemo(
    () =>
      sectionsWithRefs?.map((section: FieldSectionConfig) => ({
        ...section,
        title:
          resolveText(
            resolveMaybeTemplate(
              section.title,
              activeLocale,
              runtime,
              routeRuntime,
            ),
          ) ??
          resolveText(section.title) ??
          "section",
        description:
          resolveText(
            resolveMaybeTemplate(
              section.description,
              activeLocale,
              runtime,
              routeRuntime,
            ),
          ) ?? resolveText(section.description),
        fields: section.fields.map(
          (field: FieldConfig) => resolvedFieldMap.get(field.name) ?? field,
        ),
      })),
    [activeLocale, resolvedFieldMap, routeRuntime, runtime, sectionsWithRefs],
  );
  const method = config.method ?? "POST";
  const submitLabel =
    resolveText(
      resolveMaybeTemplate(
        formCopyRefValues.submitLabel ?? config.submitLabel ?? "Submit",
        activeLocale,
        runtime,
        routeRuntime,
      ),
    ) ?? "Submit";
  const submitLoadingLabel =
    resolveText(
      resolveMaybeTemplate(
        formCopyRefValues.submitLoadingLabel ??
          config.submitLoadingLabel ??
          "Submitting...",
        activeLocale,
        runtime,
        routeRuntime,
      ),
    ) ?? "Submitting...";
  const columns = config.columns ?? 1;
  const gap = GAP_MAP[config.gap ?? "md"] ?? GAP_MAP.md!;
  const rootId = config.id ?? "auto-form";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap,
      alignItems: config.layout === "horizontal" ? "stretch" : undefined,
    } as Record<string, unknown>,
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actions`,
    componentSurface: config.slots?.actions,
  });

  const onSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!api) {
        throw new Error(
          "AutoForm: API client not provided. " +
            "Provide it through the app state runtime.",
        );
      }

      const runWorkflow = async (
        workflow: string,
        context: Record<string, unknown>,
      ): Promise<unknown> =>
        (
          executeAction as unknown as (
            action: { type: "run-workflow"; workflow: string },
            context?: Record<string, unknown>,
          ) => Promise<unknown>
        )({ type: "run-workflow", workflow }, context);

      try {
        const serializedValues = serializeFormValues(resolvedFields, values);

        if (config.on?.beforeSubmit) {
          const beforeSubmitResult = await runWorkflow(config.on.beforeSubmit, {
            form: {
              values,
            },
          });
          if (isHaltSignal(beforeSubmitResult)) {
            return;
          }
        }

        await executeEventAction(executeAction, config.on?.submit, {
          id: config.id,
          values,
          serializedValues,
        });

        setSaveStatus("saving");
        const result =
          resourceCache && isResourceRef(resolvedSubmitTarget)
            ? await resourceCache.mutateTarget(resolvedSubmitTarget, {
                method,
                payload: serializedValues,
                pathParams: serializedValues,
              })
            : await submitToApi(
                api,
                resolvedSubmitTarget,
                runtime?.resources,
                method,
                serializedValues,
              );

        await executeEventAction(executeAction, config.on?.success, {
          id: config.id,
          values,
          result,
        });
        if (config.on?.afterSubmit) {
          await runWorkflow(config.on.afterSubmit, {
            form: {
              values,
            },
            result,
          });
        }
        if (!config.resetOnSubmit) {
          formRef.current?.markPristine(values);
        }
        lastAutoSubmitRef.current = JSON.stringify(values);
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
        let handled = false;
        if (config.on?.error) {
          await executeEventAction(executeAction, config.on.error, {
            id: config.id,
            values,
            error,
          });
          handled = true;
        }
        if (!handled) {
          throw error;
        }
      }
    },
    [
      api,
      config.on?.afterSubmit,
      config.on?.beforeSubmit,
      config.on?.error,
      config.on?.submit,
      config.on?.success,
      config.id,
      method,
      executeAction,
      config.resetOnSubmit,
      resourceCache,
      resolvedSubmitTarget,
      runtime?.resources,
    ],
  );

  const form = useAutoForm(resolvedFields, onSubmit);
  formRef.current = form;

  useEffect(() => {
    if (
      !initialData.data ||
      typeof initialData.data !== "object" ||
      Array.isArray(initialData.data)
    ) {
      return;
    }

    const serializedInitialData = JSON.stringify(initialData.data);
    if (lastInitialDataRef.current === serializedInitialData) {
      return;
    }

    form.setValues(normalizeFormValues(
      resolvedFields,
      initialData.data as Record<string, unknown>,
    ), {
      markPristine: true,
    });
    lastInitialDataRef.current = serializedInitialData;
    lastAutoSubmitRef.current = null;
    setSaveStatus("idle");
  }, [form.setValues, initialData.data, resolvedFields]);

  // Publish form state when id is set
  useEffect(() => {
    if (config.id) {
      const nextPublishedState = {
        values: form.values,
        isDirty: form.isDirty,
        isValid: form.isValid,
        isSubmitting: form.isSubmitting,
        saveStatus,
        errors: form.errors,
      };
      const nextSerialized = JSON.stringify(nextPublishedState);
      if (lastPublishedStateRef.current === nextSerialized) {
        return;
      }

      lastPublishedStateRef.current = nextSerialized;
      publish(nextPublishedState);
    }
  }, [
    config.id,
    publish,
    form.values,
    form.isDirty,
    form.isValid,
    form.isSubmitting,
    saveStatus,
    form.errors,
  ]);

  const handleSubmit = useCallback(async () => {
    const valuesBefore = { ...form.values };
    await form.handleSubmit();
    if (config.resetOnSubmit && !form.isSubmitting) {
      const submitted = Object.keys(valuesBefore).length > 0 && form.isValid;
      if (submitted) {
        form.reset();
      }
    }
  }, [form, config.resetOnSubmit]);

  useEffect(() => {
    if (!config.id) {
      return;
    }

    const onSubmitEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId === config.id) {
        void handleSubmit();
      }
    };

    const onResetEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId === config.id) {
        form.reset();
      }
    };

    window.addEventListener("snapshot:submit-form", onSubmitEvent);
    window.addEventListener("snapshot:reset-form", onResetEvent);
    return () => {
      window.removeEventListener("snapshot:submit-form", onSubmitEvent);
      window.removeEventListener("snapshot:reset-form", onResetEvent);
    };
  }, [config.id, form, handleSubmit]);

  useEffect(() => {
    const allowPristineAutoSubmit =
      typeof config.autoSubmitWhen === "string" &&
      lastAutoSubmitRef.current === null;

    if (
      !config.autoSubmit ||
      !autoSubmitAllowed ||
      (!form.isDirty && !allowPristineAutoSubmit) ||
      !form.isValid ||
      form.isSubmitting
    ) {
      return;
    }

    const serializedValues = JSON.stringify(form.values);
    if (lastAutoSubmitRef.current === serializedValues) {
      return;
    }

    const timer = window.setTimeout(() => {
      void handleSubmit();
    }, config.autoSubmitDelay ?? 800);

    return () => window.clearTimeout(timer);
  }, [
    autoSubmitAllowed,
    config.autoSubmit,
    config.autoSubmitDelay,
    form.isDirty,
    form.isSubmitting,
    form.isValid,
    form.values,
    handleSubmit,
  ]);

  useEffect(() => {
    if (!config.autoSubmit || !form.isDirty || form.isSubmitting) {
      return;
    }

    if (saveStatus !== "idle") {
      setSaveStatus("idle");
    }
  }, [config.autoSubmit, form.isDirty, form.isSubmitting, saveStatus]);

  if (visible === false) return null;

  return (
    <form
      data-snapshot-component="form"
      data-testid="form"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      noValidate
      style={rootSurface.style}
    >
      {/* Sections mode */}
      {resolvedSections ? (
        resolvedSections.map((section: FieldSectionConfig, index: number) => (
          <SectionRenderer
            key={`${resolveText(section.title) ?? "section"}-${index}`}
            rootId={rootId}
            section={section}
            form={form}
            columns={columns}
            gap={gap}
            slots={config.slots}
          />
        ))
      ) : (
        /* Flat fields mode */
        <FieldGrid
          rootId={rootId}
          fields={resolvedFields}
          form={form}
          columns={columns}
          gap={gap}
          slots={config.slots}
        />
      )}

      {/* Submit button */}
      <div
        data-snapshot-id={`${rootId}-actions`}
        className={actionsSurface.className}
        style={actionsSurface.style}
      >
        <ButtonControl
          type="submit"
          disabled={form.isSubmitting || !form.isValid}
          variant={config.submitVariant ?? "default"}
          size={config.submitSize ?? "sm"}
          fullWidth={config.submitFullWidth}
          surfaceId={`${rootId}-submit`}
          surfaceConfig={config.slots?.submitButton}
          activeStates={form.isSubmitting || !form.isValid ? ["disabled"] : []}
        >
          {config.submitIcon ? (
            <Icon name={config.submitIcon} size={16} />
          ) : null}
          {form.isSubmitting ? submitLoadingLabel : submitLabel}
        </ButtonControl>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
    </form>
  );
}
