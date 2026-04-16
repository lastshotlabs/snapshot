import type { z } from "zod";
import type { markdownConfigSchema } from "./schema";
/** Inferred config type from the Markdown Zod schema. */
export type MarkdownConfig = z.input<typeof markdownConfigSchema>;
