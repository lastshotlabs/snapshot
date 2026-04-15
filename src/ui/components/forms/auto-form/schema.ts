import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  dataSourceSchema,
  endpointTargetSchema,
  fromRefSchema,
} from "../../_base/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const autoFormSlotNames = [
  "root",
  "section",
  "sectionHeader",
  "sectionToggle",
  "sectionTitle",
  "sectionDescription",
  "field",
  "label",
  "description",
  "inputWrapper",
  "input",
  "options",
  "option",
  "optionLabel",
  "helper",
  "error",
  "requiredIndicator",
  "inlineAction",
  "passwordToggle",
  "actions",
  "submitButton",
] as const;

export const autoFormFieldSlotNames = [
  "field",
  "label",
  "description",
  "inputWrapper",
  "input",
  "options",
  "option",
  "optionLabel",
  "helper",
  "error",
  "requiredIndicator",
  "inlineAction",
  "passwordToggle",
] as const;

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
const validationPatternSchema = z.union([
  z.string(),
  z
    .object({
      value: z.string(),
      message: z.string().optional(),
    })
    .strict(),
]);

export const fieldValidationSchema = z
  .object({
    required: z.boolean().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: validationPatternSchema.optional(),
    equals: z.string().optional(),
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
      "time",
      "datetime",
      "radio-group",
      "switch",
      "slider",
      "color",
      "combobox",
      "tag-input",
    ]),
    /** Human-readable label. Defaults to the field name. */
    label: z.string().optional(),
    /** Placeholder text for text-like inputs. */
    placeholder: z.string().optional(),
    /** Whether the field is required. */
    required: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Client-side validation rules. */
    validation: fieldValidationSchema.optional(),
    /** Canonical validation alias. */
    validate: fieldValidationSchema.optional(),
    /** Options for select fields. Array of {label, value} or a string endpoint. */
    options: z.union([z.array(fieldOptionSchema), dataSourceSchema]).optional(),
    /** Field to use as the option label when options come from an endpoint. */
    labelField: z.string().optional(),
    /** Field to use as the option value when options come from an endpoint. */
    valueField: z.string().optional(),
    /** Default value for the field. */
    default: z.unknown().optional(),
    /** Whether the field is disabled. */
    disabled: z.boolean().optional(),
    /** Helper text shown below the field. */
    helperText: z.string().optional(),
    description: z.string().optional(),
    /** Column span in a multi-column layout (1-12). Default: full width. */
    span: z.number().int().min(1).max(12).optional(),
    /** Conditional visibility — show this field only when condition is met. */
    dependsOn: dependsOnSchema.optional(),
    /** Static visibility toggle. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    autoComplete: z.string().optional(),
    visibleWhen: z.string().optional(),
    inlineAction: z
      .object({
        label: z.string(),
        to: z.string(),
      })
      .strict()
      .optional(),
    readOnly: z.boolean().optional(),
    slots: slotsSchema(autoFormFieldSlotNames).optional(),
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
  slots: slotsSchema([
    "section",
    "sectionHeader",
    "sectionToggle",
    "sectionTitle",
    "sectionDescription",
  ]).optional(),
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
export const autoFormConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.enum(["form", "auto-form"]),
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
    submitLoadingLabel: z.string().optional(),
    /** Whether to reset the form after successful submission. */
    resetOnSubmit: z.boolean().optional(),
    /** Actions to execute after a successful submission. */
    onSuccess: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Actions to execute when submission fails. */
    onError: z.union([actionSchema, z.array(actionSchema)]).optional(),
    /** Workflow lifecycle hooks for submit execution. */
    on: z
      .object({
        /** Runs before submit; may return a halt signal to cancel submission. */
        beforeSubmit: z.string().optional(),
        /** Runs after a successful submit. */
        afterSubmit: z.string().optional(),
        /** Runs when submit fails. */
        error: z.string().optional(),
        /** Inline action chain for a successful submit. */
        success: z.array(actionSchema).optional(),
        /** Inline action chain for a failed submit. */
        failure: z.array(actionSchema).optional(),
      })
      .strict()
      .optional(),
    autoSubmit: z.boolean().optional(),
    autoSubmitWhen: z.string().optional(),
    autoSubmitDelay: z.number().int().nonnegative().optional(),
    layout: z.enum(["vertical", "horizontal", "grid"]).default("vertical"),
    slots: slotsSchema(autoFormSlotNames).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (typeof value.submit !== "string") {
      return;
    }

    if (value.fields === "auto" || !Array.isArray(value.fields)) {
      return;
    }

    const fieldNames = new Set(value.fields.map((field) => field.name));
    const placeholders = [...value.submit.matchAll(/\{(\w+)\}/g)].map(
      (match) => match[1]!,
    );

    for (const placeholder of placeholders) {
      if (!fieldNames.has(placeholder)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["submit"],
          message: `Submit path placeholder "{${placeholder}}" must match a declared field name.`,
        });
      }
    }
  });
