import type { z } from "zod";
import type { listConfigSchema, listItemSchema } from "./schema";
/** Inferred config type from the List Zod schema. */
export type ListConfig = z.input<typeof listConfigSchema>;
/** Inferred type for a single static list item. */
export type ListItemConfig = z.input<typeof listItemSchema>;
