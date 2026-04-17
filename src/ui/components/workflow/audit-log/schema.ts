import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Schema for a filter dropdown configuration.
 */
export const auditLogFilterSchema = z
  .object({
    /** Data field to filter on. */
    field: z.string(),
    /** Display label for the filter dropdown. */
    label: z.union([z.string(), fromRefSchema]),
    /** Available filter options. */
    options: z.array(z.union([z.string(), fromRefSchema])),
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
export const auditLogConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("audit-log"),
    /** API endpoint returning log entries. Supports FromRef. */
    data: dataSourceSchema,
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
    slots: slotsSchema([
      "root",
      "filters",
      "filterSelect",
      "loadingItem",
      "loadingAvatar",
      "loadingTitle",
      "loadingBody",
      "errorState",
      "emptyState",
      "entries",
      "entry",
      "avatar",
      "content",
      "actionText",
      "userName",
      "timestamp",
      "toggleButton",
      "details",
      "detailsRow",
      "detailsKey",
      "detailsValue",
      "changesOld",
      "changesNew",
      "loadMoreWrapper",
      "loadMoreButton",
    ]).optional(),
  }).strict();
