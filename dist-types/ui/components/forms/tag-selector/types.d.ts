import type { z } from "zod";
import type { tagSelectorConfigSchema } from "./schema";
/** Inferred config type from the TagSelector Zod schema. */
export type TagSelectorConfig = z.input<typeof tagSelectorConfigSchema>;
