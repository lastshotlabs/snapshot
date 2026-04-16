import type { z } from "zod";
import type { richTextEditorConfigSchema } from "./schema";
/** Inferred config type from the RichTextEditor Zod schema. */
export type RichTextEditorConfig = z.input<typeof richTextEditorConfigSchema>;
