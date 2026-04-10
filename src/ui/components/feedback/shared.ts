import { z } from "zod";

/**
 * Base config shape shared by feedback components.
 *
 * Feedback components are small manifest-driven views that may still accept the
 * common component wrapper props used elsewhere in the UI system.
 */
export const feedbackBaseConfigSchema = z
  .object({
    type: z.string(),
    className: z.string().optional(),
    style: z.record(z.union([z.string(), z.number()])).optional(),
  })
  .strict();

/** Shared config shape for the built-in feedback components. */
export type FeedbackBaseConfig = z.infer<typeof feedbackBaseConfigSchema>;
