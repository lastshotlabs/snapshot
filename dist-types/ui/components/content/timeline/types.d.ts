import type { z } from "zod";
import type { timelineConfigSchema, timelineItemSchema } from "./schema";
/** Inferred config type from the Timeline Zod schema. */
export type TimelineConfig = z.input<typeof timelineConfigSchema>;
/** Inferred type for a single timeline item. */
export type TimelineItem = z.input<typeof timelineItemSchema>;
