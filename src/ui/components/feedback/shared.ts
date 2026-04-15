import { z } from "zod";
import { extendComponentSchema } from "../_base/schema";

/**
 * Base config shape shared by feedback components.
 *
 * Feedback components are small manifest-driven views that may still accept the
 * common component wrapper props used elsewhere in the UI system.
 */
export const feedbackBaseConfigSchema = extendComponentSchema({
  type: z.string(),
}).strict();

/** Shared config shape for the built-in feedback components. */
export type FeedbackBaseConfig = z.infer<typeof feedbackBaseConfigSchema>;
