import type { z } from "zod";
import type { quickAddConfigSchema } from "./schema";

/** Inferred config type from the QuickAdd Zod schema. */
export type QuickAddConfig = z.infer<typeof quickAddConfigSchema>;
