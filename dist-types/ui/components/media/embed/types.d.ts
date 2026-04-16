import type { z } from "zod";
import type { embedConfigSchema } from "./schema";
/** Inferred config type from the Embed Zod schema. */
export type EmbedSchemaConfig = z.input<typeof embedConfigSchema>;
