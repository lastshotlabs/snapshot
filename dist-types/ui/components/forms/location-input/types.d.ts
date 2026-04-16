import type { z } from "zod";
import type { locationInputConfigSchema } from "./schema";
/** Config for the manifest-driven location input component. */
export type LocationInputConfig = z.input<typeof locationInputConfigSchema>;
