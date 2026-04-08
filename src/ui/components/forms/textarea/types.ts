import type { z } from "zod";
import type { textareaConfigSchema } from "./schema";

/** Inferred config type from the Textarea Zod schema. */
export type TextareaConfig = z.infer<typeof textareaConfigSchema>;
