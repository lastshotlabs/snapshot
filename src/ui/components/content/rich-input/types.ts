import type { z } from "zod";
import type { richInputConfigSchema } from "./schema";

/** Inferred config type from the RichInput Zod schema. */
export type RichInputConfig = z.input<typeof richInputConfigSchema>;
