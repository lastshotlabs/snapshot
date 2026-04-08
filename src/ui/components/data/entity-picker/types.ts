import type { z } from "zod";
import type { entityPickerConfigSchema } from "./schema";

/** Inferred config type from the EntityPicker Zod schema. */
export type EntityPickerConfig = z.infer<typeof entityPickerConfigSchema>;
