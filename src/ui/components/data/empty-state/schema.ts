import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

/**
 * Zod config schema for the EmptyState component.
 *
 * Defines all manifest-settable fields for a placeholder shown
 * when there is no data to display.
 *
 * @example
 * ```json
 * {
 *   "type": "empty-state",
 *   "title": "No results found",
 *   "description": "Try adjusting your search or filters.",
 *   "icon": "search",
 *   "actionLabel": "Clear filters",
 *   "action": { "type": "set-value", "target": "filters", "value": {} }
 * }
 * ```
 */
export const emptyStateConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("empty-state"),
    /** Heading text. */
    title: z.string(),
    /** Explanatory body text. */
    description: z.string().optional(),
    /** Icon rendered above the title (string name, rendered as text for now). */
    icon: z.string().optional(),
    /** CTA button action. */
    action: actionSchema.optional(),
    /** CTA button label. */
    actionLabel: z.string().optional(),
    /** Size variant. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Icon color token name (e.g., "primary", "info"). */
    iconColor: z.string().optional(),
    slots: slotsSchema([
      "root",
      "icon",
      "title",
      "description",
      "action",
    ]).optional(),
  })
  .strict();
