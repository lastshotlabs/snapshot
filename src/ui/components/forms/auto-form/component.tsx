import React, { useCallback, useContext, useEffect, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import {
  useActionExecutor,
  SnapshotApiContext,
} from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { useAutoForm } from "./hook";
import type {
  AutoFormConfig,
  FieldConfig,
  FieldSectionConfig,
} from "./types";
import type { ApiClient } from "../../../../api/client";

// ── Gap map ───────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
};

// ── Conditional visibility ────────────────────────────────────────────────

function isFieldVisible(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.visible === false) return false;

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
  field,
  value,
  error,
  showError,
  onChange,
  onBlur,
}: {
  field: FieldConfig;
  value: unknown;
  error: string | undefined;
  showError: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}) {
  const label = field.label ?? field.name;
  const fieldId = `sn-field-${field.name}`;
  const hasError = showError && !!error;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--sn-spacing-sm, 0.5rem)",
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
    color: "var(--sn-color-foreground, #111827)",
    backgroundColor: field.disabled
      ? "var(--sn-color-secondary, #f3f4f6)"
      : "var(--sn-color-card, #ffffff)",
    border: `1px solid ${hasError ? "var(--sn-color-destructive, #ef4444)" : "var(--sn-color-border, #e5e7eb)"}`,
    borderRadius: "var(--sn-radius-md, 0.375rem)",
    outline: "none",
    transition:
      "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
    boxSizing: "border-box" as const,
  };

  const commonProps = {
    id: fieldId,
    name: field.name,
    onBlur,
    disabled: field.disabled,
    "aria-invalid": hasError,
    "aria-describedby": hasError ? `${fieldId}-error` : field.helperText ? `${fieldId}-helper` : undefined,
  };

  let input: React.ReactNode;

  switch (field.type) {
    case "textarea":
      input = (
        <textarea
          {...commonProps}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      );
      break;

    case "select":
      input = (
        <select
          {...commonProps}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">{field.placeholder ?? "Select..."}</option>
          {Array.isArray(field.options) &&
            field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      );
      break;

    case "checkbox":
      input = (
        <input
          {...commonProps}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            width: "16px",
            height: "16px",
            accentColor: "var(--sn-color-primary, #2563eb)",
          }}
        />
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
          style={inputStyle}
        />
      );
      break;

    default:
      input = (
        <input
          {...commonProps}
          type={field.type}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      );
      break;
  }

  // Checkbox has label inline
  if (field.type === "checkbox") {
    return (
      <div data-sn-field={field.name}>
        <label
          htmlFor={fieldId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            cursor: field.disabled ? "not-allowed" : "pointer",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {input}
          <span>{label}</span>
        </label>
        {field.helperText && !hasError && (
          <div
            id={`${fieldId}-helper`}
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
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
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-destructive, #ef4444)",
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-sn-field={field.name}>
      <label
        htmlFor={fieldId}
        style={{
          display: "block",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          fontWeight:
            "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
          color: "var(--sn-color-foreground, #111827)",
          marginBottom: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {label}
        {field.required && (
          <span
            style={{
              color: "var(--sn-color-destructive, #ef4444)",
              marginLeft: "2px",
            }}
          >
            *
          </span>
        )}
      </label>
      {input}
      {field.helperText && !hasError && (
        <div
          id={`${fieldId}-helper`}
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
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
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-destructive, #ef4444)",
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ── Section renderer ──────────────────────────────────────────────────────

function SectionRenderer({
  section,
  form,
  columns,
  gap,
}: {
  section: FieldSectionConfig;
  form: ReturnType<typeof useAutoForm>;
  columns: number;
  gap: string;
}) {
  const [collapsed, setCollapsed] = useState(
    section.defaultCollapsed ?? false,
  );

  return (
    <fieldset
      data-sn-section={section.title}
      style={{
        border: "none",
        padding: 0,
        margin: 0,
        marginBottom: gap,
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
          section.collapsible
            ? () => setCollapsed(!collapsed)
            : undefined
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
            style={{
              fontSize: "var(--sn-font-size-md, 1rem)",
              fontWeight:
                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
              color: "var(--sn-color-foreground, #111827)",
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
          fields={section.fields}
          form={form}
          columns={columns}
          gap={gap}
        />
      )}
    </fieldset>
  );
}

// ── Field grid ────────────────────────────────────────────────────────────

function FieldGrid({
  fields,
  form,
  columns,
  gap,
}: {
  fields: FieldConfig[];
  form: ReturnType<typeof useAutoForm>;
  columns: number;
  gap: string;
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
              field={field}
              value={form.values[field.name]}
              error={form.errors[field.name]}
              showError={!!form.touched[field.name]}
              onChange={(value) => form.setValue(field.name, value)}
              onBlur={() => form.touchField(field.name)}
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
  endpoint: string,
  method: string,
  values: Record<string, unknown>,
): Promise<unknown> {
  switch (method) {
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
 * and action chaining on success/error. Publishes form state to
 * the page context when an `id` is configured.
 *
 * @param props - Component props containing the form config
 */
export function AutoForm({ config }: { config: AutoFormConfig }) {
  const api = useContext(SnapshotApiContext);
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);

  const allFields = resolveFields(config);
  const method = config.method ?? "POST";
  const submitLabel = config.submitLabel ?? "Submit";
  const columns = config.columns ?? 1;
  const gap = GAP_MAP[config.gap ?? "md"] ?? GAP_MAP.md!;

  const onSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!api) {
        throw new Error(
          "AutoForm: SnapshotApiContext not provided. " +
            "Wrap your app in <SnapshotApiContext.Provider value={apiClient}>.",
        );
      }

      try {
        const result = await submitToApi(api, config.submit, method, values);

        if (config.onSuccess) {
          await executeAction(config.onSuccess, { result });
        }
      } catch (error) {
        if (config.onError) {
          await executeAction(config.onError, { error });
        } else {
          throw error;
        }
      }
    },
    [api, config.submit, config.onSuccess, config.onError, method, executeAction],
  );

  const form = useAutoForm(allFields, onSubmit);

  // Publish form state when id is set
  useEffect(() => {
    if (config.id) {
      publish({
        values: form.values,
        isDirty: form.isDirty,
        isValid: form.isValid,
        errors: form.errors,
      });
    }
  }, [config.id, publish, form.values, form.isDirty, form.isValid, form.errors]);

  // Reset on successful submit if configured
  const handleSubmit = useCallback(async () => {
    const valuesBefore = { ...form.values };
    await form.handleSubmit();
    if (config.resetOnSubmit && !form.isSubmitting) {
      const submitted =
        Object.keys(valuesBefore).length > 0 && form.isValid;
      if (submitted) {
        form.reset();
      }
    }
  }, [form, config.resetOnSubmit]);

  if (visible === false) return null;

  return (
    <form
      data-snapshot-component="form"
      data-testid="form"
      className={config.className}
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      noValidate
      style={{
        display: "flex",
        flexDirection: "column",
        gap,
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Sections mode */}
      {config.sections
        ? config.sections.map((section) => (
            <SectionRenderer
              key={section.title}
              section={section}
              form={form}
              columns={columns}
              gap={gap}
            />
          ))
        : /* Flat fields mode */
          <FieldGrid
            fields={allFields}
            form={form}
            columns={columns}
            gap={gap}
          />
      }

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={form.isSubmitting}
          data-sn-submit
          style={{
            padding:
              "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-lg, 1.5rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight:
              "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #ffffff)",
            border: "none",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            cursor: form.isSubmitting ? "not-allowed" : "pointer",
            opacity: form.isSubmitting ? 0.7 : 1,
            transition:
              "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
          }}
        >
          {form.isSubmitting ? "Submitting..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
