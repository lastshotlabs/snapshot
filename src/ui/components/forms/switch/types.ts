import type { z } from "zod";
import type { switchConfigSchema } from "./schema";

/** Inferred config type from the Switch Zod schema. */
export type SwitchConfig = z.input<typeof switchConfigSchema>;
