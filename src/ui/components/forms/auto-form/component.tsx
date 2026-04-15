'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
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
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../button";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
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
    return config.sections.flatMap((s) => s.fields);
  }
  if (config.fields === "auto") return [];
  return config.fields;
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
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const showByExpression = useEvaluateExpression(field.visibleWhen);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const label = field.label ?? field.name;
  const fieldId = `sn-field-${field.name}`;
  const hasError = showError && !!error;
  const activeStates = [
    ...(hasError ? ["invalid"] : []),
    ...(field.disabled ? ["disabled"] : []),
  ] as Array<"invalid" | "disabled">;
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-${field.name}`,
    componentSurface: slots?.field,
    itemSurface: field.slots?.field,
    activeStates,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label-${field.name}`,
    componentSurface: slots?.label,
    itemSurface: field.slots?.label,
    activeStates,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description-${field.name}`,
    componentSurface: slots?.description,
    itemSurface: field.slots?.description,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input-${field.name}`,
    componentSurface: slots?.input,
    itemSurface: field.slots?.input,
    activeStates,
  });
  const helperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-helper-${field.name}`,
    componentSurface: slots?.helper,
    itemSurface: field.slots?.helper,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error-${field.name}`,
    componentSurface: slots?.error,
    itemSurface: field.slots?.error,
    activeStates: hasError ? ["invalid"] : [],
  });
  const requiredIndicatorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-required-${field.name}`,
    componentSurface: slots?.requiredIndicator,
    itemSurface: field.slots?.requiredIndicator,
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--sn-spacing-sm, 0.5rem)",
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
    color: "var(--sn-color-foreground, #111827)",
    backgroundColor: field.disabled
      ? "var(--sn-color-secondary, #f3f4f6)"
      : "var(--sn-color-card, #ffffff)",
    border: `var(--sn-border-default, 1px) solid ${hasError ? "var(--sn-color-destructive, #ef4444)" : "var(--sn-color-border, #e5e7eb)"}`,
    borderRadius: "var(--sn-radius-md, 0.375rem)",
    outline: "none",
    transition:
      "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
    boxSizing: "border-box" as const,
    ...(inputSurface.style as React.CSSProperties),
  };

  const commonProps = {
    id: fieldId,
    name: field.name,
    onBlur,
    disabled: field.disabled,
    readOnly: field.readOnly,
    required,
    "aria-invalid": hasError,
    "aria-describedby": hasError
      ? `${fieldId}-error`
      : field.helperText
        ? `${fieldId}-helper`
        : undefined,
  };

  const optionsResult = useComponentData(
    !Array.isArray(field.options) && field.options ? field.options : "",
  );
  let input: React.ReactNode;

  if (!showByExpression) {
    return null;
  }

  switch (field.type) {
    case "textarea":
      input = (
        <textarea
          {...commonProps}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputSurface.className}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      );
      break;

    case "select": {
      const fieldOptions = Array.isArray(field.options)
        ? field.options
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );

      input = (
        <select
          {...commonProps}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputSurface.className}
          style={inputStyle}
        >
          <option value="">{field.placeholder ?? "Select..."}</option>
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
        <input
          {...commonProps}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className={inputSurface.className}
          style={{
            width: "16px",
            height: "16px",
            accentColor: "var(--sn-color-primary, #2563eb)",
            ...(inputSurface.style as React.CSSProperties),
          }}
        />
      );
      break;

    case "switch":
      input = (
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            cursor: field.disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            {...commonProps}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className={inputSurface.className}
            style={{
              width: "2.5rem",
              height: "1.25rem",
              accentColor: "var(--sn-color-primary, #2563eb)",
              ...(inputSurface.style as React.CSSProperties),
            }}
          />
          <span style={{ fontSize: "var(--sn-font-size-sm, 0.875rem)" }}>
            {label}
          </span>
        </label>
      );
      break;

    case "number":
      input = (
        <input
          {...commonProps}
          type="number"
          value={
            value === "" || value === undefined || value === null
              ? ""
              : String(value)
          }
          placeholder={field.placeholder}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : Number(v));
          }}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "file":
      input = (
        <input
          {...commonProps}
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            onChange(files && files.length > 0 ? files[0] : null);
          }}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "radio-group": {
      const fieldOptions = Array.isArray(field.options)
        ? field.options
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );

      input = (
        <div
          role="radiogroup"
          aria-labelledby={`${fieldId}-legend`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {fieldOptions.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sn-spacing-sm, 0.5rem)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
              }}
            >
              <input
                {...commonProps}
                type="radio"
                value={opt.value}
                checked={String(value ?? "") === opt.value}
                onChange={() => onChange(opt.value)}
                className={inputSurface.className}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
      break;
    }

    case "slider":
      input = (
        <input
          {...commonProps}
          type="range"
          value={
            value === "" || value === undefined || value === null
              ? 0
              : Number(value)
          }
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    case "color":
      input = (
        <input
          {...commonProps}
          type="color"
          value={typeof value === "string" && value ? value : "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          className={inputSurface.className}
          style={{
            ...inputStyle,
            minHeight: "2.75rem",
            padding: "var(--sn-spacing-xs, 0.25rem)",
          }}
        />
      );
      break;

    case "combobox": {
      const fieldOptions = Array.isArray(field.options)
        ? field.options
        : toFieldOptions(
            optionsResult.data,
            field.labelField,
            field.valueField,
          );
      const listId = `${fieldId}-list`;

      input = (
        <>
          <input
            {...commonProps}
            list={listId}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
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
        <input
          {...commonProps}
          type="text"
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          className={inputSurface.className}
          style={inputStyle}
        />
      );
      break;

    default:
      input = (
        <div style={field.type === "password" ? { position: "relative" } : undefined}>
          <input
            {...commonProps}
            type={
              field.type === "password"
                ? (passwordVisible ? "text" : "password")
                : field.type === "datetime"
                  ? "datetime-local"
                  : field.type
            }
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            onChange={(e) => onChange(e.target.value)}
            className={inputSurface.className}
            style={{
              ...inputStyle,
              paddingRight:
                field.type === "password"
                  ? "var(--sn-spacing-2xl, 2.5rem)"
                  : inputStyle.paddingRight,
            }}
          />
          {field.type === "password" ? (
            <button
              type="button"
              onClick={() => setPasswordVisible((current) => !current)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "var(--sn-spacing-sm, 0.5rem)",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--sn-color-muted-foreground)",
                padding: "var(--sn-spacing-xs, 0.25rem)",
              }}
            >
              <Icon name={passwordVisible ? "eye-off" : "eye"} size={16} />
            </button>
          ) : null}
        </div>
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
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            cursor: field.disabled ? "not-allowed" : "pointer",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            ...(labelSurface.style as React.CSSProperties),
          }}
        >
          {input}
          <span>{label}</span>
        </label>
        {field.helperText && !hasError && (
          <div
            id={`${fieldId}-helper`}
            data-snapshot-id={`${rootId}-helper-${field.name}`}
            className={helperSurface.className}
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
              ...(helperSurface.style as React.CSSProperties),
            }}
          >
            {field.helperText}
          </div>
        )}
        {hasError && (
          <div
            id={`${fieldId}-error`}
            role="alert"
            data-sn-field-error
            data-snapshot-id={`${rootId}-error-${field.name}`}
            className={errorSurface.className}
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-destructive, #ef4444)",
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
              ...(errorSurface.style as React.CSSProperties),
            }}
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
          display: field.inlineAction ? "flex" : "block",
          justifyContent: field.inlineAction ? "space-between" : undefined,
          alignItems: field.inlineAction ? "baseline" : undefined,
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          fontWeight:
            "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
          color: "var(--sn-color-foreground, #111827)",
          marginBottom: "var(--sn-spacing-xs, 0.25rem)",
          ...(labelSurface.style as React.CSSProperties),
        }}
      >
          <span>
            {label}
            {required && (
            <span
              data-snapshot-id={`${rootId}-required-${field.name}`}
              className={requiredIndicatorSurface.className}
              style={{
                color: "var(--sn-color-destructive, #ef4444)",
                marginLeft: "var(--sn-spacing-2xs, 2px)",
                ...(requiredIndicatorSurface.style as React.CSSProperties),
              }}
            >
              *
            </span>
          )}
        </span>
        {field.inlineAction ? (
          <button
            type="button"
            onClick={() => {
              void executeAction({ type: "navigate", to: field.inlineAction!.to } as never);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--sn-color-primary)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              padding: 0,
            }}
          >
            {field.inlineAction.label}
          </button>
        ) : null}
      </label>
      {input}
      {field.description && (
        <div
          data-snapshot-id={`${rootId}-description-${field.name}`}
          className={descriptionSurface.className}
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            ...(descriptionSurface.style as React.CSSProperties),
          }}
        >
          {field.description}
        </div>
      )}
      {field.helperText && !hasError && (
        <div
          id={`${fieldId}-helper`}
          data-snapshot-id={`${rootId}-helper-${field.name}`}
          className={helperSurface.className}
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            ...(helperSurface.style as React.CSSProperties),
          }}
        >
          {field.helperText}
        </div>
      )}
      {hasError && (
        <div
          id={`${fieldId}-error`}
          role="alert"
          data-sn-field-error
          data-snapshot-id={`${rootId}-error-${field.name}`}
          className={errorSurface.className}
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-destructive, #ef4444)",
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            ...(errorSurface.style as React.CSSProperties),
          }}
        >
          {error}
        </div>
      )}
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
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
  const sectionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-${section.title}`,
    componentSurface: slots?.section,
    itemSurface: section.slots?.section,
  });
  const sectionTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-section-title-${section.title}`,
    componentSurface: slots?.sectionTitle,
    itemSurface: section.slots?.sectionTitle,
  });

  return (
    <fieldset
      data-sn-section={section.title}
      data-snapshot-id={`${rootId}-section-${section.title}`}
      className={sectionSurface.className}
      style={{
        border: "none",
        padding: 0,
        margin: 0,
        marginBottom: gap,
        ...(sectionSurface.style as React.CSSProperties),
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          marginBottom: collapsed ? 0 : gap,
          cursor: section.collapsible ? "pointer" : undefined,
        }}
        onClick={
          section.collapsible ? () => setCollapsed(!collapsed) : undefined
        }
      >
        {section.collapsible && (
          <span
            style={{
              display: "inline-flex",
              transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
              transition:
                "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
            }}
          >
            <Icon name="chevron-right" size={16} />
          </span>
        )}
        <div>
          <div
            data-snapshot-id={`${rootId}-section-title-${section.title}`}
            className={sectionTitleSurface.className}
            style={{
              fontSize: "var(--sn-font-size-md, 1rem)",
              fontWeight:
                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
              color: "var(--sn-color-foreground, #111827)",
              ...(sectionTitleSurface.style as React.CSSProperties),
            }}
          >
            {section.title}
          </div>
          {section.description && (
            <div
              style={{
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              {section.description}
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
      <SurfaceStyles css={sectionTitleSurface.scopedCss} />
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
  const resolvedFields = useMemo(
    () =>
      allFields.map((field) => ({
        ...field,
        label: resolveMaybeTemplate(
          field.label,
          activeLocale,
          runtime,
          routeRuntime,
        ) as
          | string
          | undefined,
        placeholder: resolveMaybeTemplate(
          field.placeholder,
          activeLocale,
          runtime,
          routeRuntime,
        ) as string | undefined,
        helperText: resolveMaybeTemplate(
          field.helperText,
          activeLocale,
          runtime,
          routeRuntime,
        ) as
          | string
          | undefined,
        description: resolveMaybeTemplate(
          field.description,
          activeLocale,
          runtime,
          routeRuntime,
        ) as string | undefined,
        default: resolveMaybeTemplate(
          field.default,
          activeLocale,
          runtime,
          routeRuntime,
        ),
        inlineAction: field.inlineAction
          ? {
              ...field.inlineAction,
              label: String(
                resolveMaybeTemplate(
                  field.inlineAction.label,
                  activeLocale,
                  runtime,
                  routeRuntime,
                ) ?? field.inlineAction.label,
              ),
              to: String(
                resolveMaybeTemplate(
                  field.inlineAction.to,
                  activeLocale,
                  runtime,
                  routeRuntime,
                ) ?? field.inlineAction.to,
              ),
            }
          : undefined,
      })),
    [
      activeLocale,
      allFields,
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
      config.sections?.map((section) => ({
        ...section,
        title: String(
          resolveMaybeTemplate(
            section.title,
            activeLocale,
            runtime,
            routeRuntime,
          ) ?? section.title,
        ),
        description: resolveMaybeTemplate(
          section.description,
          activeLocale,
          runtime,
          routeRuntime,
        ) as string | undefined,
        fields: section.fields.map(
          (field) => resolvedFieldMap.get(field.name) ?? field,
        ),
      })),
    [activeLocale, config.sections, resolvedFieldMap, routeRuntime, runtime],
  );
  const method = config.method ?? "POST";
  const submitLabel = String(
    resolveMaybeTemplate(
      config.submitLabel ?? "Submit",
      activeLocale,
      runtime,
      routeRuntime,
    ) ??
      "Submit",
  );
  const submitLoadingLabel = String(
    resolveMaybeTemplate(
      config.submitLoadingLabel ?? "Submitting...",
      activeLocale,
      runtime,
      routeRuntime,
    ) ?? "Submitting...",
  );
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
    componentSurface: config,
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
          "AutoForm: SnapshotApiContext not provided. " +
            "Wrap your app in <SnapshotApiContext.Provider value={apiClient}>.",
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

        setSaveStatus("saving");
        const result =
          resourceCache && isResourceRef(resolvedSubmitTarget)
            ? await resourceCache.mutateTarget(resolvedSubmitTarget, {
                method,
                payload: values,
                pathParams: values,
              })
            : await submitToApi(
                api,
                resolvedSubmitTarget,
                runtime?.resources,
                method,
                values,
              );

        if (config.onSuccess) {
          await executeAction(config.onSuccess, { result });
        }
        if (config.on?.success) {
          await executeAction(config.on.success as Parameters<typeof executeAction>[0], {
            result,
          });
        }
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
        if (config.onError) {
          await executeAction(config.onError, { error });
          handled = true;
        }
        if (config.on?.failure) {
          await executeAction(config.on.failure as Parameters<typeof executeAction>[0], {
            error,
          });
          handled = true;
        }
        if (config.on?.error) {
          await runWorkflow(config.on.error, {
            form: {
              values,
            },
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
      config.onSuccess,
      config.onError,
      config.on?.afterSubmit,
      config.on?.beforeSubmit,
      config.on?.error,
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

    form.setValues(initialData.data as Record<string, unknown>, {
      markPristine: true,
    });
    lastInitialDataRef.current = serializedInitialData;
    lastAutoSubmitRef.current = null;
    setSaveStatus("idle");
  }, [form.setValues, initialData.data]);

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
        resolvedSections.map((section) => (
          <SectionRenderer
            key={section.title}
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
          disabled={form.isSubmitting}
          variant="default"
          surfaceId={`${rootId}-submit`}
          surfaceConfig={config.slots?.submitButton}
          activeStates={form.isSubmitting ? ["disabled"] : []}
        >
          {form.isSubmitting ? submitLoadingLabel : submitLabel}
        </ButtonControl>
      </div>
      <style>{`
        [data-snapshot-component="form"] input:focus,
        [data-snapshot-component="form"] textarea:focus,
        [data-snapshot-component="form"] select:focus {
          outline: none;
          border-color: var(--sn-color-primary, #2563eb);
          box-shadow: 0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent);
        }
        [data-snapshot-component="form"] input:focus-visible,
        [data-snapshot-component="form"] textarea:focus-visible,
        [data-snapshot-component="form"] select:focus-visible {
          outline: none;
          border-color: var(--sn-color-primary, #2563eb);
          box-shadow: 0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent);
        }
        ${BUTTON_INTERACTIVE_CSS}
      `}</style>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
    </form>
  );
}
