import type { z } from "zod";
import type { columnConfigSchema } from "./schema";
/** Inferred config type for the Column layout component. */
export type ColumnConfig = z.input<typeof columnConfigSchema>;
