import type { z } from "zod";
import type { colorPickerConfigSchema } from "./schema";
/** Config for the manifest-driven color picker component. */
export type ColorPickerConfig = z.input<typeof colorPickerConfigSchema>;
