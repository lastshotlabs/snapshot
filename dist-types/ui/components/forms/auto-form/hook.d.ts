import type { FieldConfig, UseAutoFormResult } from "./types";
/**
 * Validate a single field value against its FieldConfig validation rules.
 *
 * @param field - The field configuration
 * @param value - The current field value
 * @returns An error message string, or undefined if valid
 */
export declare function validateField(field: FieldConfig, value: unknown, values?: Record<string, unknown>): string | undefined;
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
export declare function useAutoForm(fields: FieldConfig[], onSubmit: (values: Record<string, unknown>) => Promise<void>): UseAutoFormResult;
