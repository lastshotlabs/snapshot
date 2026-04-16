import type { z } from "zod";
import type { linkEmbedConfigSchema } from "./schema";
/** Inferred config type from the LinkEmbed Zod schema. */
export type LinkEmbedConfig = z.input<typeof linkEmbedConfigSchema>;
