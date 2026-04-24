import type { z } from "zod";
import type { notFoundConfigSchema } from "./schema";
/** Inferred config type from the default not-found schema. */
export type NotFoundConfig = z.input<typeof notFoundConfigSchema>;
