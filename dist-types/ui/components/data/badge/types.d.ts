import type { z } from "zod";
import type { badgeConfigSchema } from "./schema";
/** Inferred config type from the Badge Zod schema. */
export type BadgeConfig = z.input<typeof badgeConfigSchema>;
