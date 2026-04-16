import type { z } from "zod";
import type { emptyStateConfigSchema } from "./schema";
/** Inferred config type from the EmptyState Zod schema. */
export type EmptyStateConfig = z.infer<typeof emptyStateConfigSchema>;
