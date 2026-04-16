import type { z } from "zod";
import type { skeletonConfigSchema } from "./schema";
/** Inferred config type from the Skeleton Zod schema. */
export type SkeletonConfig = z.input<typeof skeletonConfigSchema>;
