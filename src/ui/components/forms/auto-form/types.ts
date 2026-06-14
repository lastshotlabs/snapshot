
/**
 * Inferred type for a single field configuration.
 */
export type FieldConfig = Record<string, unknown>;

/**
 * Inferred type for the AutoForm component config.
 */
export type AutoFormConfig = Record<string, unknown>;

/**
 * Inferred type for a field section configuration.
 */
export type FieldSectionConfig = Record<string, unknown>;

/**
 * Per-field validation error.
 */
export type FieldErrors = Record<string, string | undefined>;

/**
 * Tracks which fields have been interacted with.
 */
export type TouchedFields = Record<string, boolean>;

/**
 * Return type for the useAutoForm headless hook.
 */
export interface UseAutoFormResult {
  /** Current field values keyed by field name. */
  values: Record<string, unknown>;
  /** Current validation errors keyed by field name. */
  errors: FieldErrors;
  /** Which fields have been touched (blurred). */
  touched: TouchedFields;
  /** Set a single field value. */
  setValue: (name: string, value: unknown) => void;
  /** Set multiple field values at once. */
  setValues: (
    values: Record<string, unknown>,
    options?: { markPristine?: boolean },
  ) => void;
  /** Submit handler — validates all fields, then calls onSubmit if valid. */
  handleSubmit: () => Promise<void>;
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** Whether all fields pass validation. */
  isValid: boolean;
  /** Reset the form to initial values. */
  reset: () => void;
  /** Whether any field has been modified from its initial value. */
  isDirty: boolean;
  /** Mark a field as touched (triggers validation display). */
  touchField: (name: string) => void;
  /** Mark the current values, or the provided values, as the clean baseline. */
  markPristine: (values?: Record<string, unknown>) => void;
}
