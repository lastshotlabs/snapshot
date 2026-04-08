import { z } from "zod";
import {
  fromRefSchema,
  componentConfigSchema,
} from "../../../manifest/schema";
import { dataSourceSchema } from "../../_base/types";
import { actionSchema } from "../../../actions/types";

/**
 * Schema for a single timeline item.
 */
export const timelineItemSchema = z.object({
  /** Title text for this event. */
  title: z.string(),
  /** Optional description text. */
  description: z.string().optional(),
  /** Date/time string for display. */
  date: z.string().optional(),
  /** Lucide icon name. */
  icon: z.string().optional(),
  /** Semantic color for the dot. */
  color: z
    .enum([
      "primary",
      "secondary",
      "success",
      "warning",
      "destructive",
      "info",
      "muted",
    ])
    .optional(),
  /** Child components rendered inside this item. */
  content: z.array(componentConfigSchema).optional(),
});

/**
 * Zod config schema for the Timeline component.
 *
 * Defines all manifest-settable fields for a vertical timeline of events.
 *
 * @example
 * ```json
 * {
 *   "type": "timeline",
 *   "items": [
 *     { "title": "Order placed", "date": "2024-01-15", "color": "primary" },
 *     { "title": "Shipped", "date": "2024-01-17", "color": "success" }
 *   ]
 * }
 * ```
 */
export const timelineConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("timeline"),
    /** API endpoint to fetch timeline data. */
    data: dataSourceSchema.optional(),
    /** Static timeline items. */
    items: z.array(timelineItemSchema).optional(),
    /** Field name for date when using API data. */
    dateField: z.string().optional(),
    /** Field name for title when using API data. */
    titleField: z.string().optional(),
    /** Field name for description when using API data. */
    descriptionField: z.string().optional(),
    /** Visual variant. Default: "default". */
    variant: z.enum(["default", "alternating", "compact"]).optional(),
    /** Show vertical connector line. Default: true. */
    showConnector: z.boolean().optional(),
    /** Click action dispatched when an item is clicked. */
    action: actionSchema.optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
