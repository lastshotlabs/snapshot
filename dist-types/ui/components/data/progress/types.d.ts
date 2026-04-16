import type { z } from "zod";
import type { progressConfigSchema } from "./schema";
/** Inferred config type from the Progress Zod schema. */
export type ProgressConfig = z.input<typeof progressConfigSchema>;
