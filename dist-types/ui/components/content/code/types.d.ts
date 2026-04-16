import type { z } from "zod";
import type { codeConfigSchema } from "./schema";
/** Inferred config type for the Code component. */
export type CodeConfig = z.infer<typeof codeConfigSchema>;
