import { useState, useCallback, useRef, useMemo } from "react";
import type {
  FieldConfig,
  FieldErrors,
  TouchedFields,
  UseAutoFormResult,
} from "./types";

/**
 * Validate a single field value against its FieldConfig validation rules.
 *
 * @param field - The field configuration
 * @param value - The current field value
 * @returns An error message string, or undefined if valid
 */
export function validateField(
  field: FieldConfig,
  value: unknown,
): string | undefined {
  const strValue = typeof value === "string" ? value : "";

  // Required check
  if (field.required) {
    if (value === undefined || value === null || value === "") {
      return (
        field.validation?.message ?? `${field.label ?? field.name} is required`
      );
    }
  }

  // Skip further validation if empty and not required
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const v = field.validation;
  if (!v) return undefined;

  if (v.minLength !== undefined && strValue.length < v.minLength) {
    return v.message ?? `Must be at least ${v.minLength} characters`;
  }

  if (v.maxLength !== undefined && strValue.length > v.maxLength) {
    return v.message ?? `Must be at most ${v.maxLength} characters`;
  }

  if (v.min !== undefined && typeof value === "number" && value < v.min) {
    return v.message ?? `Must be at least ${v.min}`;
  }

  if (v.max !== undefined && typeof value === "number" && value > v.max) {
    return v.message ?? `Must be at most ${v.max}`;
  }

  if (v.pattern !== undefined) {
    const regex = new RegExp(v.pattern);
    if (!regex.test(strValue)) {
      return v.message ?? `Invalid format`;
    }
  }

  return undefined;
}

/**
 * Build the initial values record from field configs.
 */
function buildInitialValues(fields: FieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      values[field.name] = field.default;
    } else if (field.type === "checkbox") {
      values[field.name] = false;
    } else if (field.type === "number") {
      values[field.name] = "";
    } else {
      values[field.name] = "";
    }
  }
  return values;
}

/**
 * Headless hook for form state management.
 *
 * Tracks field values, validation errors, and touched state.
 * Validates on blur (per-field) and on submit (all fields).
 *
 * @param fields - Array of field configurations
 * @param onSubmit - Async callback invoked with form values when validation passes
 * @returns Form state and handlers
 *
 * @example
 * ```tsx
 * const form = useAutoForm(fields, async (values) => {
 *   await api.post('/api/users', values)
 * })
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
 *     <input
 *       value={form.values.name as string}
 *       onChange={(e) => form.setValue('name', e.target.value)}
 *       onBlur={() => form.touchField('name')}
 *     />
 *     {form.touched.name && form.errors.name && <span>{form.errors.name}</span>}
 *     <button disabled={form.isSubmitting}>Submit</button>
 *   </form>
 * )
 * ```
 */
export function useAutoForm(
  fields: FieldConfig[],
  onSubmit: (values: Record<string, unknown>) => Promise<void>,
): UseAutoFormResult {
  const initialValues = useMemo(() => buildInitialValues(fields), [fields]);
  const [values, setValuesState] =
    useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use ref so the onSubmit callback is always current
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  const validateAll = useCallback((): FieldErrors => {
    const newErrors: FieldErrors = {};
    for (const field of fieldsRef.current) {
      const error = validateField(field, values[field.name]);
      if (error) newErrors[field.name] = error;
    }
    return newErrors;
  }, [values]);

  const validateSingle = useCallback(
    (name: string): string | undefined => {
      const field = fieldsRef.current.find((f) => f.name === name);
      if (!field) return undefined;
      return validateField(field, values[name]);
    },
    [values],
  );

  const setValue = useCallback((name: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setMultipleValues = useCallback(
    (newValues: Record<string, unknown>) => {
      setValuesState((prev) => ({ ...prev, ...newValues }));
    },
    [],
  );

  const touchField = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateSingle(name);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateSingle],
  );

  const handleSubmit = useCallback(async () => {
    // Touch all fields
    const allTouched: TouchedFields = {};
    for (const field of fieldsRef.current) {
      allTouched[field.name] = true;
    }
    setTouched(allTouched);

    // Validate all
    const allErrors = validateAll();
    setErrors(allErrors);

    const hasErrors = Object.values(allErrors).some((e) => e !== undefined);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      await onSubmitRef.current(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll]);

  const reset = useCallback(() => {
    setValuesState(buildInitialValues(fieldsRef.current));
    setErrors({});
    setTouched({});
  }, []);

  const isValid = useMemo(() => {
    const allErrors = validateAll();
    return !Object.values(allErrors).some((e) => e !== undefined);
  }, [validateAll]);

  const isDirty = useMemo(() => {
    for (const field of fields) {
      if (values[field.name] !== initialValues[field.name]) return true;
    }
    return false;
  }, [values, initialValues, fields]);

  return {
    values,
    errors,
    touched,
    setValue,
    setValues: setMultipleValues,
    handleSubmit,
    isSubmitting,
    isValid,
    reset,
    isDirty,
    touchField,
  };
}
