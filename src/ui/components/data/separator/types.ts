import type { z } from "zod";
import type { separatorConfigSchema } from "./schema";

/** Inferred config type for the Separator component. */
export type SeparatorConfig = z.input<typeof separatorConfigSchema>;
