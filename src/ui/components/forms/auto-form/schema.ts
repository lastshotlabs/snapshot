import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  dataSourceSchema,
  endpointTargetSchema,
  fromRefSchema,
} from "../../_base/types";

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
 * Schema for conditional field visibility based on another field's value.
 */
const dependsOnSchema = z.object({
  /** Name of the field to watch. */
  field: z.string(),
  /** Show this field when the watched field equals this value. */
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  /** Show this field when the watched field is NOT equal to this value. */
  notValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  /** Show this field when the watched field is truthy (non-empty). */
  filled: z.boolean().optional(),
});

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
    options: z.union([z.array(fieldOptionSchema), dataSourceSchema]).optional(),
    /** Default value for the field. */
    default: z.unknown().optional(),
    /** Whether the field is disabled. */
    disabled: z.boolean().optional(),
    /** Helper text shown below the field. */
    helperText: z.string().optional(),
    /** Column span in a multi-column layout (1-12). Default: full width. */
    span: z.number().int().min(1).max(12).optional(),
    /** Conditional visibility — show this field only when condition is met. */
    dependsOn: dependsOnSchema.optional(),
    /** Static visibility toggle. */
    visible: z.boolean().optional(),
  })
  .strict();

/**
 * Schema for a field section/group with a heading.
 */
export const fieldSectionSchema = z.object({
  /** Section title. */
  title: z.string(),
  /** Optional description below the title. */
  description: z.string().optional(),
  /** Fields in this section. */
  fields: z.array(fieldConfigSchema),
  /** Whether the section is collapsible. */
  collapsible: z.boolean().optional(),
  /** Whether the section starts collapsed. */
  defaultCollapsed: z.boolean().optional(),
});

/**
 * Zod schema for the AutoForm component config.
 *
 * Defines a config-driven form that auto-generates fields from config
 * or OpenAPI schema. Supports validation, submission, action chaining,
 * multi-column layout, conditional field visibility, and field grouping.
 *
 * @example
 * ```json
 * {
 *   "type": "form",
 *   "submit": "/api/users",
 *   "method": "POST",
 *   "columns": 2,
 *   "fields": [
 *     { "name": "firstName", "type": "text", "required": true, "span": 1 },
 *     { "name": "lastName", "type": "text", "required": true, "span": 1 },
 *     { "name": "email", "type": "email", "required": true },
 *     { "name": "role", "type": "select", "options": [
 *       { "label": "Admin", "value": "admin" },
 *       { "label": "User", "value": "user" }
 *     ]},
 *     { "name": "notes", "type": "textarea", "dependsOn": { "field": "role", "value": "admin" } }
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
    data: dataSourceSchema.optional(),
    /** Endpoint to submit form data to. */
    submit: endpointTargetSchema,
    /** HTTP method for submission. Defaults to POST. */
    method: z.enum(["POST", "PUT", "PATCH"]).optional(),
    /** Field definitions. 'auto' derives from the submit endpoint schema. */
    fields: z.union([z.literal("auto"), z.array(fieldConfigSchema)]),
    /**
     * Field sections for grouped layout. When provided, fields are organized
     * into named sections with headings. Cannot be used with flat `fields`.
     */
    sections: z.array(fieldSectionSchema).optional(),
    /** Number of columns for the form grid layout (1-4). Default: 1. */
    columns: z.number().int().min(1).max(4).optional(),
    /** Gap between fields. Default: "md". */
    gap: z.enum(["xs", "sm", "md", "lg"]).optional(),
    /** Label for the submit button. Defaults to "Submit". */
    submitLabel: z.string().optional(),
    /** Whether to reset the form after successful submission. */
    resetOnSubmit: z.boolean().optional(),
    /** Visibility toggle. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Actions to execute after a successful submission. */
    onSuccess: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Actions to execute when submission fails. */
    onError: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
