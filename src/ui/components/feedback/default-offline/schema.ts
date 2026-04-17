import { z } from "zod";
import { slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default offline state.
 */
export const offlineBannerConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("offline-banner"),
  title: z.union([z.string(), fromRefSchema]).optional(),
  description: z.union([z.string(), fromRefSchema]).optional(),
  slots: slotsSchema(["root", "title", "description"]).optional(),
});

/** Config for the default offline feedback component. */
export type OfflineBannerConfig = z.input<typeof offlineBannerConfigSchema>;
