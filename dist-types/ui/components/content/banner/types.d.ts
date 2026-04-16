import type { z } from "zod";
import type { bannerConfigSchema } from "./schema";
/** Inferred config type from the Banner Zod schema. */
export type BannerConfig = z.input<typeof bannerConfigSchema>;
