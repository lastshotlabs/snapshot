import type { inlineEditConfigSchema } from "./schema";
import type { z } from "zod";
/** Inferred config type for the InlineEdit component. */
export type InlineEditConfig = z.infer<typeof inlineEditConfigSchema>;
