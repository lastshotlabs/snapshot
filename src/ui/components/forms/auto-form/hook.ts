import { useState, useCallback, useRef, useMemo, useEffect } from "react";
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
  values: Record<string, unknown> = {},
): string | undefined {
  const validation = field.validate ?? field.validation;
  const fieldLabel = typeof field.label === "string" ? field.label : undefined;
  const strValue = typeof value === "string" ? value : "";
  const isEmptyArray = Array.isArray(value) && value.length === 0;
  const isRequired =
    field.required === true ||
    (field.required &&
      typeof field.required === "object" &&
      "from" in field.required &&
      Boolean(values[field.required.from]));

  // Required check
  if (isRequired || validation?.required) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      isEmptyArray
    ) {
      return (
        validation?.message ?? `${fieldLabel ?? field.name} is required`
      );
    }
  }

  // Skip further validation if empty and not required
  if (value === undefined || value === null || value === "" || isEmptyArray) {
    return undefined;
  }

  const v = validation;
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
    const patternValue =
      typeof v.pattern === "string" ? v.pattern : v.pattern.value;
    const regex = new RegExp(patternValue);
    if (!regex.test(strValue)) {
      return (
        (typeof v.pattern === "object" ? v.pattern.message : undefined) ??
        v.message ??
        `Invalid format`
      );
    }
  }

  if (v.equals !== undefined && value !== values[v.equals]) {
    return v.message ?? `Must match ${v.equals}`;
  }

  return undefined;
}

function isFieldVisible(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.visible === false) {
    return false;
  }

  if (
    field.visible &&
    typeof field.visible === "object" &&
    "from" in field.visible
  ) {
    return Boolean(values[field.visible.from]);
  }

  if (!field.dependsOn) {
    return true;
  }

  const watchedValue = values[field.dependsOn.field];
  if (field.dependsOn.value !== undefined) {
    return watchedValue === field.dependsOn.value;
  }
  if (field.dependsOn.notValue !== undefined) {
    return watchedValue !== field.dependsOn.notValue;
  }
  if (field.dependsOn.filled) {
    return Boolean(watchedValue);
  }
  return true;
}

/**
 * Build the initial values record from field configs.
 */
function buildInitialValues(fields: FieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      values[field.name] = field.default;
    } else if (field.type === "checkbox" || field.type === "switch") {
      values[field.name] = false;
    } else if (field.type === "number") {
      values[field.name] = "";
    } else if (field.type === "tag-input" || field.type === "multi-select") {
      values[field.name] = [];
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
  const [pristineValues, setPristineValues] =
    useState<Record<string, unknown>>(initialValues);
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
      if (!isFieldVisible(field, values)) {
        continue;
      }
      const error = validateField(field, values[field.name], values);
      if (error) newErrors[field.name] = error;
    }
    return newErrors;
  }, [values]);

  const validateSingle = useCallback(
    (name: string): string | undefined => {
      const field = fieldsRef.current.find((f) => f.name === name);
      if (!field) return undefined;
      if (!isFieldVisible(field, values)) {
        return undefined;
      }
      return validateField(field, values[name], values);
    },
    [values],
  );

  const setValue = useCallback((name: string, value: unknown) => {
    setValuesState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const markPristine = useCallback((nextValues?: Record<string, unknown>) => {
    setPristineValues(nextValues ?? values);
  }, [values]);

  const setMultipleValues = useCallback(
    (
      newValues: Record<string, unknown>,
      options?: { markPristine?: boolean },
    ) => {
      setValuesState((prev) => {
        const next = { ...prev, ...newValues };
        if (options?.markPristine) {
          setPristineValues(next);
        }
        return next;
      });
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
    setValuesState(pristineValues);
    setErrors({});
    setTouched({});
  }, [pristineValues]);

  const isValid = useMemo(() => {
    const allErrors = validateAll();
    return !Object.values(allErrors).some((e) => e !== undefined);
  }, [validateAll]);

  const isDirty = useMemo(() => {
    for (const field of fields) {
      if (values[field.name] !== pristineValues[field.name]) return true;
    }
    return false;
  }, [values, pristineValues, fields]);

  useEffect(() => {
    setValuesState(initialValues);
    setPristineValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

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
    markPristine,
  };
}
