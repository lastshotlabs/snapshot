import { z } from "zod";
import { slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default not-found state.
 */
export const notFoundConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("not-found"),
  title: z.union([z.string(), fromRefSchema]).optional(),
  description: z.union([z.string(), fromRefSchema]).optional(),
  homeLabel: z.union([z.string(), fromRefSchema]).optional(),
  slots: slotsSchema(["root", "eyebrow", "title", "description"]).optional(),
});

/** Config for the default not-found feedback component. */
export type NotFoundConfig = z.input<typeof notFoundConfigSchema>;
