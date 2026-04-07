import { useCallback, useContext, useEffect } from "react";
import { usePublish } from "../../../context/hooks";
import {
  useActionExecutor,
  SnapshotApiContext,
} from "../../../actions/executor";
import { useAutoForm } from "./hook";
import type { AutoFormConfig, FieldConfig } from "./types";
import type { ApiClient } from "../../../../api/client";

/**
 * Resolve the fields array from config.
 * When `fields` is `'auto'`, returns an empty array (auto-derivation from OpenAPI
 * is handled by the CLI sync phase — not available at runtime yet).
 */
function resolveFields(fields: AutoFormConfig["fields"]): FieldConfig[] {
  if (fields === "auto") return [];
  return fields;
}

/**
 * Render a single form field based on its type configuration.
 */
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

  const commonProps = {
    id: fieldId,
    name: field.name,
    onBlur,
    "aria-invalid": showError && !!error,
    "aria-describedby": showError && error ? `${fieldId}-error` : undefined,
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
        />
      );
      break;

    case "select":
      input = (
        <select
          {...commonProps}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
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
        />
      );
      break;

    default:
      // text, email, password, date
      input = (
        <input
          {...commonProps}
          type={field.type}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
  }

  return (
    <div data-sn-field={field.name}>
      {field.type === "checkbox" ? (
        <label htmlFor={fieldId}>
          {input}
          <span>{label}</span>
        </label>
      ) : (
        <>
          <label htmlFor={fieldId}>{label}</label>
          {input}
        </>
      )}
      {showError && error && (
        <span id={`${fieldId}-error`} role="alert" data-sn-field-error>
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Submit form values to the configured API endpoint.
 */
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

/**
 * Config-driven form component that auto-generates fields from config.
 *
 * Supports client-side validation, submission to an API endpoint,
 * and action chaining on success/error. Publishes form state to
 * the page context when an `id` is configured.
 *
 * @param props - Component props containing the form config
 *
 * @example
 * ```tsx
 * <AutoForm config={{
 *   type: 'form',
 *   submit: '/api/users',
 *   fields: [
 *     { name: 'email', type: 'email', required: true },
 *     { name: 'name', type: 'text' },
 *   ],
 *   onSuccess: { type: 'toast', message: 'Created!', variant: 'success' },
 * }} />
 * ```
 */
export function AutoForm({ config }: { config: AutoFormConfig }) {
  const api = useContext(SnapshotApiContext);
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id ?? "");

  const fields = resolveFields(config.fields);
  const method = config.method ?? "POST";
  const submitLabel = config.submitLabel ?? "Submit";

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
    [
      api,
      config.submit,
      config.onSuccess,
      config.onError,
      method,
      executeAction,
    ],
  );

  const form = useAutoForm(fields, onSubmit);

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
  }, [
    config.id,
    publish,
    form.values,
    form.isDirty,
    form.isValid,
    form.errors,
  ]);

  // Reset on successful submit if configured
  const handleSubmit = useCallback(async () => {
    const valuesBefore = { ...form.values };
    await form.handleSubmit();
    // If submission succeeded (not submitting anymore) and resetOnSubmit is set
    if (config.resetOnSubmit && !form.isSubmitting) {
      // Check if the values changed (indicating the submit callback ran)
      const submitted = Object.keys(valuesBefore).length > 0 && form.isValid;
      if (submitted) {
        form.reset();
      }
    }
  }, [form, config.resetOnSubmit]);

  return (
    <form
      data-snapshot-component="form"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      noValidate
    >
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={form.values[field.name]}
          error={form.errors[field.name]}
          showError={!!form.touched[field.name]}
          onChange={(value) => form.setValue(field.name, value)}
          onBlur={() => form.touchField(field.name)}
        />
      ))}
      <button type="submit" disabled={form.isSubmitting} data-sn-submit>
        {form.isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
