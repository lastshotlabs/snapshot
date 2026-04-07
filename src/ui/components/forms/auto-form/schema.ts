import { z } from "zod";
import { actionSchema } from "../../../actions/types";

/**
 * Schema for a FromRef value — a reference to another component's published value.
 */
const fromRefSchema = z.object({
  from: z.string(),
});

/**
 * Schema for select/radio option entries.
 */
const fieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

/**
 * Schema for per-field validation rules.
 */
const fieldValidationSchema = z
  .object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  })
  .strict();

/**
 * Schema for an individual field configuration.
 */
export const fieldConfigSchema = z
  .object({
    /** Field name — maps to the key in the submitted values object. */
    name: z.string(),
    /** Input type to render. */
    type: z.enum([
      "text",
      "email",
      "password",
      "number",
      "textarea",
      "select",
      "checkbox",
      "date",
      "file",
    ]),
    /** Human-readable label. Defaults to the field name. */
    label: z.string().optional(),
    /** Placeholder text for text-like inputs. */
    placeholder: z.string().optional(),
    /** Whether the field is required. */
    required: z.boolean().optional(),
    /** Client-side validation rules. */
    validation: fieldValidationSchema.optional(),
    /** Options for select fields. Array of {label, value} or a string endpoint. */
    options: z.union([z.array(fieldOptionSchema), z.string()]).optional(),
    /** Default value for the field. */
    default: z.unknown().optional(),
  })
  .strict();

/**
 * Zod schema for the AutoForm component config.
 *
 * Defines a config-driven form that auto-generates fields from config
 * or OpenAPI schema. Supports validation, submission, and action chaining
 * on success/error.
 *
 * @example
 * ```json
 * {
 *   "type": "form",
 *   "submit": "/api/users",
 *   "method": "POST",
 *   "fields": [
 *     { "name": "email", "type": "email", "required": true },
 *     { "name": "name", "type": "text", "label": "Full Name" }
 *   ],
 *   "submitLabel": "Create User",
 *   "onSuccess": { "type": "toast", "message": "User created!", "variant": "success" }
 * }
 * ```
 */
export const autoFormConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("form"),
    /** Optional component id for publishing form state to the page context. */
    id: z.string().optional(),
    /** Endpoint to load initial values from (for edit forms). */
    data: z.union([z.string(), fromRefSchema]).optional(),
    /** Endpoint to submit form data to. */
    submit: z.string(),
    /** HTTP method for submission. Defaults to POST. */
    method: z.enum(["POST", "PUT", "PATCH"]).optional(),
    /** Field definitions. 'auto' derives from the submit endpoint schema (stub for now). */
    fields: z.union([z.literal("auto"), z.array(fieldConfigSchema)]),
    /** Label for the submit button. Defaults to "Submit". */
    submitLabel: z.string().optional(),
    /** Whether to reset the form after successful submission. */
    resetOnSubmit: z.boolean().optional(),
    /** Actions to execute after a successful submission. */
    onSuccess: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Actions to execute when submission fails. */
    onError: z.union([actionSchema, z.array(actionSchema)]).optional(),
  })
  .strict();
