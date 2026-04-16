import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  emptyStateConfigSchema,
  liveConfigSchema,
  loadingConfigSchema,
} from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema } from "../../_base/types";

/**
 * Zod schema for the Feed component configuration.
 *
 * Renders a scrollable activity/event stream from an endpoint or from-ref.
 * Supports avatar, title, description, timestamp, badge fields, pagination,
 * and publishes the selected item to the page context when `id` is set.
 *
 * @example
 * ```json
 * {
 *   "type": "feed",
 *   "id": "activity-feed",
 *   "data": "GET /api/activity",
 *   "itemKey": "id",
 *   "title": "message",
 *   "description": "detail",
 *   "timestamp": "createdAt",
 *   "avatar": "avatarUrl",
 *   "badge": { "field": "type", "colorMap": { "error": "destructive", "info": "info" } },
 *   "pageSize": 10
 * }
 * ```
 */
export const feedSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("feed"),
    /** Data source: endpoint string (e.g. "GET /api/events") or a FromRef. */
    data: dataSourceSchema,
    /** Field in each item used as the React key. Defaults to "id". */
    itemKey: z.string().default("id"),
    /** Field path for the avatar image URL (optional). */
    avatar: z.string().optional(),
    /** Field path for the item title. */
    title: z.string(),
    /** Field path for the item description (optional). */
    description: z.string().optional(),
    /** Field path for the ISO timestamp (optional). */
    timestamp: z.string().optional(),
    /** Badge configuration — field + optional color map. */
    badge: z
      .object({
        /** Field path for the badge value. */
        field: z.string(),
        /** Maps field values to semantic color names (e.g. { "error": "destructive" }). */
        colorMap: z.record(z.string()).optional(),
      })
      .optional(),
    /** Message shown when there are no items. */
    emptyMessage: z.string().default("No activity yet"),
    /** Number of items per page. */
    pageSize: z.number().int().min(1).default(20),
    /** Infinite scroll toggle. */
    infinite: z.boolean().optional(),
    /** Render timestamps as relative time labels. */
    relativeTime: z.boolean().default(false),
    /** Group feed items by a time bucket. */
    groupBy: z.enum(["date", "week", "month"]).optional(),
    /** Per-item action buttons rendered inline. */
    itemActions: z
      .array(
        z
          .object({
            label: z.string(),
            icon: z.string().optional(),
            action: z.union([actionSchema, z.array(actionSchema)]),
            variant: z.enum(["default", "destructive"]).optional(),
          })
          .strict(),
      )
      .optional(),
    /** Automatic loading placeholder config. */
    loading: loadingConfigSchema.optional(),
    /** Rich empty state config. */
    empty: emptyStateConfigSchema.optional(),
    /** Live refresh configuration driven by realtime events. */
    live: liveConfigSchema.optional(),
    slots: slotsSchema([
      "root",
      "liveBanner",
      "liveText",
      "liveButton",
      "loadingState",
      "errorState",
      "emptyState",
      "list",
      "groupLabel",
      "item",
      "avatarImage",
      "avatarFallback",
      "content",
      "headerRow",
      "title",
      "badge",
      "description",
      "timestamp",
      "actions",
      "itemAction",
      "pagination",
      "loadMoreButton",
    ]).optional(),
  })
  .strict();
