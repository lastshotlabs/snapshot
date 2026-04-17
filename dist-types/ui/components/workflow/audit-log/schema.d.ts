import { z } from "zod";
/**
 * Schema for a filter dropdown configuration.
 */
export declare const auditLogFilterSchema: z.ZodObject<{
    /** Data field to filter on. */
    field: z.ZodString;
    /** Display label for the filter dropdown. */
    label: z.ZodUnion<[z.ZodString, z.ZodObject<{
        from: z.ZodString;
        transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
        transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    }, "strict", z.ZodTypeAny, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }>]>;
    /** Available filter options. */
    options: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        from: z.ZodString;
        transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
        transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    }, "strict", z.ZodTypeAny, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }>]>, "many">;
}, "strict", z.ZodTypeAny, {
    options: (string | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    })[];
    label: string | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    };
    field: string;
}, {
    options: (string | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    })[];
    label: string | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    };
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
