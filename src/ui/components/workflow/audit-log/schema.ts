import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Schema for a filter dropdown configuration.
 */
export const auditLogFilterSchema = z
  .object({
    /** Data field to filter on. */
    field: z.string(),
    /** Display label for the filter dropdown. */
    label: z.string(),
    /** Available filter options. */
    options: z.array(z.string()),
  })
  .strict();

/**
 * Zod config schema for the AuditLog component.
 *
 * Renders a vertical timeline of log entries with user avatars, relative
 * timestamps, expandable details, and optional filter/pagination controls.
 *
 * @example
 * ```json
 * {
 *   "type": "audit-log",
 *   "data": "GET /api/audit-log",
 *   "userField": "actor",
 *   "actionField": "description",
 *   "timestampField": "createdAt",
 *   "detailsField": "changes",
 *   "pagination": { "pageSize": 25 }
 * }
 * ```
 */
export const auditLogConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("audit-log"),
    /** API endpoint returning log entries. Supports FromRef. */
    data: z.union([z.string(), fromRefSchema]),
    /** Field for user name. Default: "user". */
    userField: z.string().optional(),
    /** Field for action text. Default: "action". */
    actionField: z.string().optional(),
    /** Field for timestamp. Default: "timestamp". */
    timestampField: z.string().optional(),
    /** Field for details/changes object. */
    detailsField: z.string().optional(),
    /** Field for action icon identifier. */
    iconField: z.string().optional(),
    /** Pagination configuration. Default: page of 20 entries. */
    pagination: z
      .union([
        z.boolean(),
        z.object({ pageSize: z.number().int().min(1) }).strict(),
      ])
      .optional(),
    /** Filter dropdown configurations. */
    filters: z.array(auditLogFilterSchema).optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
