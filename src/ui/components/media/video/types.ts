import type { z } from "zod";
import type { videoConfigSchema } from "./schema";

/** Inferred config type from the Video Zod schema. */
export type VideoSchemaConfig = z.input<typeof videoConfigSchema>;
