import type { z } from "zod";
import type { stepperConfigSchema, stepConfigSchema } from "./schema";
/** Inferred config type from the Stepper Zod schema. */
export type StepperConfig = z.infer<typeof stepperConfigSchema>;
/** Inferred type for a single step config. */
export type StepConfig = z.infer<typeof stepConfigSchema>;
