import { z } from "zod";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default not-found state.
 */
export const notFoundConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("not-found"),
  title: z.string().optional(),
  description: z.string().optional(),
  homeLabel: z.string().optional(),
});

/** Config for the default not-found feedback component. */
export type NotFoundConfig = z.infer<typeof notFoundConfigSchema>;
