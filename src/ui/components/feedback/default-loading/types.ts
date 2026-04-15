import type { z } from "zod";
import type { spinnerConfigSchema } from "./schema";

/** Inferred config type from the default loading schema. */
export type SpinnerConfig = z.input<typeof spinnerConfigSchema>;
