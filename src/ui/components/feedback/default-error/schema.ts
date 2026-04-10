import { z } from "zod";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default error state.
 */
export const errorPageConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("error-page"),
  title: z.string().optional(),
  description: z.string().optional(),
  showRetry: z.boolean().optional(),
  retryLabel: z.string().optional(),
});

/** Config for the default error feedback component. */
export type ErrorPageConfig = z.infer<typeof errorPageConfigSchema>;
