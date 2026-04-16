import type { z } from "zod";
import type { errorPageConfigSchema } from "./schema";
/** Inferred config type from the default error schema. */
export type ErrorPageConfig = z.input<typeof errorPageConfigSchema>;
