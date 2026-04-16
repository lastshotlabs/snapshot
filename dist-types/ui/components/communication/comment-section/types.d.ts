import type { z } from "zod";
import type { commentSectionConfigSchema } from "./schema";
/** Inferred config type from the CommentSection Zod schema. */
export type CommentSectionConfig = z.input<typeof commentSectionConfigSchema>;
