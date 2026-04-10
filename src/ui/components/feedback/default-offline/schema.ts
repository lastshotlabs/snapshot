import { z } from "zod";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default offline state.
 */
export const offlineBannerConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("offline-banner"),
  title: z.string().optional(),
  description: z.string().optional(),
});

/** Config for the default offline feedback component. */
export type OfflineBannerConfig = z.infer<typeof offlineBannerConfigSchema>;
