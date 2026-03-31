import { useCallback, useState } from "react";
import type { ApiClient } from "../../api/client";
import { token } from "../../tokens/utils";
import { type ActionContext, executeAction } from "../actions";
import { useMutationSource } from "../data-binding";
import type { FormConfig, FormFieldConfig } from "./form.schema";

interface FormProps {
  config: FormConfig;
  api: ApiClient;
  actionContext: ActionContext;
  id?: string;
}

/**
 * Config-driven form — generates fields from config or auto-detects from
 * the endpoint's request body schema.
 *
 * Submits to the specified endpoint. Executes onSuccess/onError actions
 * from the action vocabulary.
 */
export function Form({ config, api, actionContext }: FormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutateAsync, isLoading } = useMutationSource(api, {
    source: config.data,
  });

  const fields: FormFieldConfig[] = config.fields && config.fields !== "auto" ? config.fields : [];

  const cols = config.columns ?? 1;

  const handleChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const val = values[field.name];
      if (field.required && (val == null || val === "")) {
        newErrors[field.name] = `${field.label ?? field.name} is required`;
      }
      if (field.minLength && typeof val === "string" && val.length < field.minLength) {
        newErrors[field.name] = `Minimum ${field.minLength} characters`;
      }
      if (field.maxLength && typeof val === "string" && val.length > field.maxLength) {
        newErrors[field.name] = `Maximum ${field.maxLength} characters`;
      }
      if (field.pattern && typeof val === "string" && !new RegExp(field.pattern).test(val)) {
        newErrors[field.name] = "Invalid format";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        await mutateAsync(values);
        if (config.onSuccess) {
          await executeAction(config.onSuccess, actionContext);
        }
      } catch {
        if (config.onError) {
          await executeAction(config.onError, actionContext);
        }
      }
    },
    [values, validate, mutateAsync, config.onSuccess, config.onError, actionContext],
  );

  const isFieldVisible = (field: FormFieldConfig): boolean => {
    if (field.visible === false) return false;
    if (field.visible === true || field.visible == null) return true;
    if (typeof field.visible === "object" && "when" in field.visible) {
      return values[field.visible.when] === field.visible.equals;
    }
    return true;
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: `${token("spacing.2")} ${token("spacing.3")}`,
    fontSize: token("typography.fontSize.sm"),
    borderRadius: token("radius.md"),
    border: `1px solid ${token("colors.input")}`,
    backgroundColor: token("colors.background"),
    color: token("colors.foreground"),
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: token("typography.fontSize.sm"),
    fontWeight: token("typography.fontWeight.medium"),
    color: token("colors.foreground"),
    marginBottom: token("spacing.1.5"),
  };

  const errorStyle: React.CSSProperties = {
    fontSize: token("typography.fontSize.xs"),
    color: token("colors.destructive"),
    marginTop: token("spacing.1"),
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={config.className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: token("spacing.4"),
      }}
    >
      {fields.filter(isFieldVisible).map((field) => (
        <div
          key={field.name}
          style={{
            gridColumn: field.span ? `span ${field.span}` : undefined,
          }}
        >
          {field.type !== "hidden" && (
            <label style={labelStyle}>
              {field.label ?? field.name}
              {field.required && <span style={{ color: token("colors.destructive") }}> *</span>}
            </label>
          )}

          {renderField(field, values[field.name], handleChange, inputStyle)}

          {errors[field.name] && <div style={errorStyle}>{errors[field.name]}</div>}
        </div>
      ))}

      <div
        style={{
          gridColumn: `span ${cols}`,
          display: "flex",
          gap: token("spacing.3"),
          justifyContent: "flex-end",
        }}
      >
        {config.resetLabel && (
          <button
            type="reset"
            onClick={() => {
              setValues({});
              setErrors({});
            }}
            style={{
              padding: `${token("spacing.2")} ${token("spacing.4")}`,
              fontSize: token("typography.fontSize.sm"),
              borderRadius: token("radius.md"),
              border: `1px solid ${token("colors.border")}`,
              backgroundColor: token("colors.background"),
              color: token("colors.foreground"),
              cursor: "pointer",
            }}
          >
            {config.resetLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: `${token("spacing.2")} ${token("spacing.4")}`,
            fontSize: token("typography.fontSize.sm"),
            fontWeight: token("typography.fontWeight.medium"),
            borderRadius: token("radius.md"),
            border: "none",
            backgroundColor: token("colors.primary"),
            color: token("colors.primary-foreground"),
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Submitting..." : (config.submitLabel ?? "Submit")}
        </button>
      </div>
    </form>
  );
}

function renderField(
  field: FormFieldConfig,
  value: unknown,
  onChange: (name: string, value: unknown) => void,
  inputStyle: React.CSSProperties,
) {
  const val = value ?? field.defaultValue ?? "";

  switch (field.type ?? "text") {
    case "textarea":
      return (
        <textarea
          name={field.name}
          value={String(val)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          required={field.required}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );

    case "select":
      return (
        <select
          name={field.name}
          value={String(val)}
          disabled={field.disabled}
          required={field.required}
          style={inputStyle}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          <option value="">{field.placeholder ?? "Select..."}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "checkbox":
    case "toggle":
      return (
        <input
          type="checkbox"
          name={field.name}
          checked={!!val}
          disabled={field.disabled}
          onChange={(e) => onChange(field.name, e.target.checked)}
        />
      );

    case "number":
      return (
        <input
          type="number"
          name={field.name}
          value={val === "" ? "" : Number(val)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          required={field.required}
          min={field.min}
          max={field.max}
          style={inputStyle}
          onChange={(e) => onChange(field.name, e.target.valueAsNumber)}
        />
      );

    case "hidden":
      return <input type="hidden" name={field.name} value={String(val)} />;

    default:
      return (
        <input
          type={field.type ?? "text"}
          name={field.name}
          value={String(val)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          required={field.required}
          minLength={field.minLength}
          maxLength={field.maxLength}
          style={inputStyle}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );
  }
}
