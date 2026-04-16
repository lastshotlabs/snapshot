import type { z } from "zod";
import type { spacerConfigSchema } from "./schema";
export type SpacerConfig = z.input<typeof spacerConfigSchema>;
