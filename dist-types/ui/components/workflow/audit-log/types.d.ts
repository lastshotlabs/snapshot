import type { z } from "zod";
import type { auditLogConfigSchema, auditLogFilterSchema } from "./schema";
/** Inferred config type from the AuditLog Zod schema. */
export type AuditLogConfig = z.input<typeof auditLogConfigSchema>;
/** Inferred filter configuration type. */
export type AuditLogFilterConfig = z.infer<typeof auditLogFilterSchema>;
