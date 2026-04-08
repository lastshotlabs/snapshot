import type { z } from "zod";
import type { chatWindowConfigSchema } from "./schema";

/** Inferred config type from the ChatWindow Zod schema. */
export type ChatWindowConfig = z.infer<typeof chatWindowConfigSchema>;
