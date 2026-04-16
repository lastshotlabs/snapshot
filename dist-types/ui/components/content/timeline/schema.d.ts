import { z } from "zod";
export declare const timelineSlotNames: readonly ["root", "loadingState", "loadingItem", "loadingMarker", "loadingBody", "loadingTitle", "loadingMeta", "errorState", "emptyState", "item", "markerColumn", "marker", "connector", "body", "header", "titleGroup", "itemIcon", "title", "description", "meta", "content"];
export declare const timelineItemSlotNames: readonly ["item", "markerColumn", "marker", "connector", "body", "header", "titleGroup", "itemIcon", "title", "description", "meta", "content"];
/**
 * Schema for a single timeline item.
 */
export declare const timelineItemSchema: z.ZodType<Record<string, any>>;
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
export declare const timelineConfigSchema: z.ZodType<Record<string, any>>;
