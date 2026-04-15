import { z } from "zod";
import { slotsSchema } from "../../_base/schema";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default loading spinner.
 */
export const spinnerConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("spinner"),
  size: z.enum(["sm", "md", "lg"]).optional(),
  label: z.string().optional(),
  slots: slotsSchema(["root", "spinner", "label"]).optional(),
});

/** Config for the default loading feedback component. */
export type SpinnerConfig = z.infer<typeof spinnerConfigSchema>;
