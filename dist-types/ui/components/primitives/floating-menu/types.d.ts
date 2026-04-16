import type { z } from "zod";
import type { floatingMenuConfigSchema, floatingMenuEntrySchema } from "./schema";
export type FloatingMenuConfig = z.input<typeof floatingMenuConfigSchema>;
export type FloatingMenuEntry = z.input<typeof floatingMenuEntrySchema>;
