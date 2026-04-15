import type { z } from "zod";
import type { alertConfigSchema } from "./schema";

/** Inferred config type from the Alert Zod schema. */
export type AlertConfig = z.input<typeof alertConfigSchema>;
