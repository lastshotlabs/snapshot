import type { z } from "zod";
import type { inputConfigSchema } from "./schema";

/** Inferred config type from the Input Zod schema. */
export type InputConfig = z.infer<typeof inputConfigSchema>;
