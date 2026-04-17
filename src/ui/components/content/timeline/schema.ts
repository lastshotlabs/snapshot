import { z } from "zod";
import {
  errorStateConfigSchema,
  componentConfigSchema,
} from "../../../manifest/schema";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

export const timelineSlotNames = [
  "root",
  "loadingState",
  "loadingItem",
  "loadingMarker",
  "loadingBody",
  "loadingTitle",
  "loadingMeta",
  "errorState",
  "emptyState",
  "item",
  "markerColumn",
  "marker",
  "connector",
  "body",
  "header",
  "titleGroup",
  "itemIcon",
  "title",
  "description",
  "meta",
  "content",
] as const;

export const timelineItemSlotNames = [
  "item",
  "markerColumn",
  "marker",
  "connector",
  "body",
  "header",
  "titleGroup",
  "itemIcon",
  "title",
  "description",
  "meta",
  "content",
] as const;

/**
 * Schema for a single timeline item.
 */
export const timelineItemSchema: z.ZodType<Record<string, any>> = z
  .object({
    /** Title text for this event. */
    title: z.union([z.string(), fromRefSchema]),
    /** Optional description text. */
    description: z.union([z.string(), fromRefSchema]).optional(),
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
    /** Per-item slot overrides for visible timeline surfaces. */
    slots: slotsSchema(timelineItemSlotNames).optional(),
  })
  .strict();

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
export const timelineConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
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
  /** Error state config. */
  error: errorStateConfigSchema.optional(),
  /** Canonical slot contract for visible timeline surfaces. */
  slots: slotsSchema(timelineSlotNames).optional(),
}).strict();
