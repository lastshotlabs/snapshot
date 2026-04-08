import type { z } from "zod";
import type { toggleConfigSchema } from "./schema";

/** Inferred config type from the Toggle Zod schema. */
export type ToggleConfig = z.infer<typeof toggleConfigSchema>;
