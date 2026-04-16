import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema } from "../../_base/types";

export const notificationFeedSlotNames = [
  "root",
  "header",
  "headerContent",
  "title",
  "unreadBadge",
  "markAllButton",
  "list",
  "loadingState",
  "loadingItem",
  "loadingIcon",
  "loadingTitle",
  "loadingMessage",
  "errorState",
  "item",
  "itemBody",
  "itemIcon",
  "itemTitle",
  "itemMessage",
  "itemTimestamp",
  "emptyState",
] as const;

/**
 * Zod config schema for the NotificationFeed component.
 *
 * Renders a scrollable list of notifications with read/unread states,
 * type-based icons, relative timestamps, and mark-as-read actions.
 */
export const notificationFeedConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
  /** Component type discriminator. */
  type: z.literal("notification-feed"),
  /** API endpoint for notifications. Supports FromRef. */
  data: dataSourceSchema,
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
  /** Canonical slot contract for visible feed surfaces. */
  slots: slotsSchema(notificationFeedSlotNames).optional(),
}).strict();
