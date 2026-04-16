import { z } from "zod";
/**
 * Schema for a filter dropdown configuration.
 */
export declare const auditLogFilterSchema: z.ZodObject<{
    /** Data field to filter on. */
    field: z.ZodString;
    /** Display label for the filter dropdown. */
    label: z.ZodString;
    /** Available filter options. */
    options: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    options: string[];
    label: string;
    field: string;
}, {
    options: string[];
    label: string;
    field: string;
}>;
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
export declare const auditLogConfigSchema: z.ZodType<Record<string, any>>;
