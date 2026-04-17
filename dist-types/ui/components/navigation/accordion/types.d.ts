import type { z } from "zod";
import type { accordionConfigSchema, accordionItemSchema } from "./schema";
/** Inferred config type from the Accordion Zod schema. */
export type AccordionConfig = z.input<typeof accordionConfigSchema>;
/** Inferred type for a single accordion item. */
export type AccordionItemConfig = z.input<typeof accordionItemSchema>;
