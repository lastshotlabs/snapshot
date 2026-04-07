import type { z } from "zod";
import type { autoFormConfigSchema, fieldConfigSchema } from "./schema";

/**
 * Inferred type for a single field configuration.
 */
export type FieldConfig = z.infer<typeof fieldConfigSchema>;

/**
 * Inferred type for the AutoForm component config.
 */
export type AutoFormConfig = z.infer<typeof autoFormConfigSchema>;

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
  setValues: (values: Record<string, unknown>) => void;
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
}
