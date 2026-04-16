import type { filterBarConfigSchema } from "./schema";
import type { z } from "zod";
/** Inferred config type for the FilterBar component. */
export type FilterBarConfig = z.infer<typeof filterBarConfigSchema>;
