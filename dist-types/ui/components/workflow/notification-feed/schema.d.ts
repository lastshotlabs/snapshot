import { z } from "zod";
export declare const notificationFeedSlotNames: readonly ["root", "header", "headerContent", "title", "unreadBadge", "markAllButton", "list", "loadingState", "loadingItem", "loadingIcon", "loadingTitle", "loadingMessage", "errorState", "item", "itemBody", "itemIcon", "itemTitle", "itemMessage", "itemTimestamp", "emptyState"];
/**
 * Zod config schema for the NotificationFeed component.
 *
 * Renders a scrollable list of notifications with read/unread states,
 * type-based icons, relative timestamps, and mark-as-read actions.
 */
export declare const notificationFeedConfigSchema: z.ZodType<Record<string, any>>;
