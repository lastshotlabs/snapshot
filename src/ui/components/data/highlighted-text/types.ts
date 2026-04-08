import type { z } from "zod";
import type { highlightedTextConfigSchema } from "./schema";

/** Inferred config type from the HighlightedText Zod schema. */
export type HighlightedTextConfig = z.infer<typeof highlightedTextConfigSchema>;
