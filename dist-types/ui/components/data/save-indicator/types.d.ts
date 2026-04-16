import type { z } from "zod";
import type { saveIndicatorConfigSchema } from "./schema";
/** Inferred config type from the SaveIndicator Zod schema. */
export type SaveIndicatorConfig = z.input<typeof saveIndicatorConfigSchema>;
