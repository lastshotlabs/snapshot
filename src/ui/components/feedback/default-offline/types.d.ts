import type { z } from "zod";
import type { offlineBannerConfigSchema } from "./schema";
/** Inferred config type from the default offline schema. */
export type OfflineBannerConfig = z.input<typeof offlineBannerConfigSchema>;
