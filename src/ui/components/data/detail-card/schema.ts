import { z } from "zod";
import {
  baseComponentConfigSchema,
  fromRefSchema,
  orFromRef,
} from "../../_base/types";
import { actionSchema } from "../../../actions/types";

/**
 * Supported field format types for detail card fields.
 * Controls how the field value is rendered.
 */
export const detailFieldFormatSchema = z.enum([
  "text",
  "date",
  "datetime",
  "number",
  "currency",
  "badge",
  "boolean",
  "email",
  "url",
  "image",
  "link",
  "list",
]);

/**
 * Configuration for a single field in the detail card.
 */
export const detailFieldConfigSchema = z.object({
  /** The field key to read from the data object. */
  field: z.string(),
  /** Display label. Defaults to a humanized version of the field name. */
  label: z.string().optional(),
  /** How to format/render the value. Defaults to 'text'. */
  format: detailFieldFormatSchema.optional(),
  /** Whether to show a copy-to-clipboard button next to the value. */
  copyable: z.boolean().optional(),
});

/**
 * Action button configuration for the detail card header.
 */
export const detailCardActionSchema = z.object({
  /** Button label text. */
  label: z.string(),
  /** Optional icon identifier. */
  icon: z.string().optional(),
  /** Action(s) to execute when clicked. */
  action: z.union([actionSchema, z.array(actionSchema)]),
});

/**
 * Zod schema for DetailCard component configuration.
 *
 * The detail card displays a single record's fields in a key-value layout.
 * Used in drawers, modals, and detail pages.
 *
 * @example
 * ```json
 * {
 *   "type": "detail-card",
 *   "id": "user-detail",
 *   "data": { "from": "users-table.selected" },
 *   "title": "User Details",
 *   "fields": [
 *     { "field": "name", "label": "Full Name" },
 *     { "field": "email", "format": "email", "copyable": true },
 *     { "field": "role", "format": "badge" },
 *     { "field": "createdAt", "format": "date" }
 *   ],
 *   "actions": [
 *     { "label": "Edit", "action": { "type": "open-modal", "modal": "edit-user" } }
 *   ]
 * }
 * ```
 */
export const detailCardConfigSchema = baseComponentConfigSchema.extend({
  /** Component type discriminator. */
  type: z.literal("detail-card"),
  /** Endpoint string (e.g. "GET /api/users/1") or FromRef to get the record data. */
  data: orFromRef(z.string()),
  /** URL params for the endpoint. Values can be FromRefs for dynamic params. */
  params: z.record(z.union([z.unknown(), fromRefSchema])).optional(),
  /** Card title. Can be a static string or a FromRef. */
  title: orFromRef(z.string()).optional(),
  /** Field configuration. 'auto' shows all fields; explicit array controls which fields appear. */
  fields: z
    .union([z.literal("auto"), z.array(detailFieldConfigSchema)])
    .optional()
    .default("auto"),
  /** Action buttons rendered in the card header. */
  actions: z.array(detailCardActionSchema).optional(),
  /** Message shown when data is null/undefined (e.g. no row selected). */
  emptyState: z.string().optional(),
});

/** DetailCard configuration type inferred from the schema. */
export type DetailCardConfig = z.infer<typeof detailCardConfigSchema>;

/** Single field configuration type inferred from the schema. */
export type DetailFieldConfig = z.infer<typeof detailFieldConfigSchema>;

/** Detail card action type inferred from the schema. */
export type DetailCardAction = z.infer<typeof detailCardActionSchema>;

/** Field format type. */
export type DetailFieldFormat = z.infer<typeof detailFieldFormatSchema>;
