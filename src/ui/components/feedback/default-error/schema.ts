import { z } from "zod";
import { slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default error state.
 */
export const errorPageConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("error-page"),
  title: z.union([z.string(), fromRefSchema]).optional(),
  description: z.union([z.string(), fromRefSchema]).optional(),
  showRetry: z.boolean().optional(),
  retryLabel: z.union([z.string(), fromRefSchema]).optional(),
  slots: slotsSchema(["root", "title", "description", "action"]).optional(),
});
