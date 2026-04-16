import type { z } from "zod";
import type { reactionBarConfigSchema } from "./schema";
/** Inferred config type from the ReactionBar Zod schema. */
export type ReactionBarConfig = z.input<typeof reactionBarConfigSchema>;
