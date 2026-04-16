import type { z } from "zod";
import type { typingIndicatorConfigSchema } from "./schema";
/** Inferred config type from the TypingIndicator Zod schema. */
export type TypingIndicatorConfig = z.infer<typeof typingIndicatorConfigSchema>;
