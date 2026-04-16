import type { z } from "zod";
import type { sliderConfigSchema } from "./schema";
/** Config for the manifest-driven slider component. */
export type SliderConfig = z.input<typeof sliderConfigSchema>;
