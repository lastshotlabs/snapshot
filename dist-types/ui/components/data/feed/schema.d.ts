import { z } from "zod";
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
export declare const feedSchema: z.ZodType<Record<string, any>>;
