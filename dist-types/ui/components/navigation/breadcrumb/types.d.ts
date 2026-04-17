import type { z } from "zod";
import type { breadcrumbConfigSchema, breadcrumbItemSchema } from "./schema";
/** Inferred config type from the Breadcrumb Zod schema. */
export type BreadcrumbConfig = z.input<typeof breadcrumbConfigSchema>;
/** Inferred type for a single breadcrumb item. */
export type BreadcrumbItemConfig = z.input<typeof breadcrumbItemSchema>;
