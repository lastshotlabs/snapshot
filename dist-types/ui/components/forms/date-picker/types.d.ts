import type { z } from "zod";
import type { datePickerConfigSchema } from "./schema";
/** Config for the manifest-driven date picker component. */
export type DatePickerConfig = z.input<typeof datePickerConfigSchema>;
