import type { z } from "zod";
import type { presenceIndicatorConfigSchema } from "./schema";
/** Inferred config type from the PresenceIndicator Zod schema. */
export type PresenceIndicatorConfig = z.infer<typeof presenceIndicatorConfigSchema>;
