import type { z } from "zod";
import type { messageThreadConfigSchema } from "./schema";
/** Inferred config type from the MessageThread Zod schema. */
export type MessageThreadConfig = z.input<typeof messageThreadConfigSchema>;
