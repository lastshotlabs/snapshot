import type { scrollAreaConfigSchema } from "./schema";
import type { z } from "zod";

/** Inferred config type for the ScrollArea component. */
export type ScrollAreaConfig = z.infer<typeof scrollAreaConfigSchema>;
