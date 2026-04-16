import type { z } from "zod";
import type { tooltipConfigSchema } from "./schema";
/** Inferred config type from the Tooltip Zod schema. */
export type TooltipConfig = z.infer<typeof tooltipConfigSchema>;
