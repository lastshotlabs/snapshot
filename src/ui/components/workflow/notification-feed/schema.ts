import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the NotificationFeed component.
 *
 * Renders a scrollable list of notifications with read/unread states,
 * type-based icons, relative timestamps, and mark-as-read actions.
 *
 * @example
 * ```json
 * {
 *   "type": "notification-feed",
 *   "data": "GET /api/notifications",
 *   "markReadAction": {
 *     "type": "api",
 *     "method": "PATCH",
 *     "endpoint": "/api/notifications/{id}/read"
 *   },
 *   "itemAction": { "type": "navigate", "to": "/notifications/{id}" },
 *   "maxHeight": "400px"
 * }
 * ```
 */
export const notificationFeedConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("notification-feed"),
    /** API endpoint for notifications. Supports FromRef. */
    data: z.union([z.string(), fromRefSchema]),
    /** Field for notification title. Default: "title". */
    titleField: z.string().optional(),
    /** Field for notification message body. Default: "message". */
    messageField: z.string().optional(),
    /** Field for timestamp. Default: "timestamp". */
    timestampField: z.string().optional(),
    /** Field for read status (boolean). Default: "read". */
    readField: z.string().optional(),
    /** Field for notification type (info/success/warning/error). Default: "type". */
    typeField: z.string().optional(),
    /** Action dispatched to mark a notification as read. */
    markReadAction: actionSchema.optional(),
    /** Action dispatched when a notification is clicked. */
    itemAction: actionSchema.optional(),
    /** Show "Mark all read" button in header. Default: true. */
    showMarkAllRead: z.boolean().optional(),
    /** Empty state message. Default: "No notifications". */
    emptyMessage: z.string().optional(),
    /** Max height for the scrollable container (CSS value). */
    maxHeight: z.string().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
