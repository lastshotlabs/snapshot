import { z } from "zod";
import { slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";
import { feedbackBaseConfigSchema } from "../shared";

/**
 * Manifest config for the default loading spinner.
 */
export const spinnerConfigSchema = feedbackBaseConfigSchema.extend({
  type: z.literal("spinner"),
  size: z.enum(["sm", "md", "lg"]).optional(),
  label: z.union([z.string(), fromRefSchema]).optional(),
  slots: slotsSchema(["root", "spinner", "label"]).optional(),
});
