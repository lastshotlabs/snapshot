import type { z } from "zod";
import type { accordionConfigSchema, accordionItemSchema } from "./schema";
/** Inferred config type from the Accordion Zod schema. */
export type AccordionConfig = z.infer<typeof accordionConfigSchema>;
/** Inferred type for a single accordion item. */
export type AccordionItemConfig = z.infer<typeof accordionItemSchema>;
