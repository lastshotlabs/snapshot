import { z } from "zod";
/**
 * Zod config schema for the MessageThread component.
 *
 * Renders a scrollable message list with avatars, timestamps,
 * message grouping, date separators, and optional reactions/threading.
 *
 * @example
 * ```json
 * {
 *   "type": "message-thread",
 *   "data": "GET /api/channels/general/messages",
 *   "showReactions": true,
 *   "groupByDate": true,
 *   "maxHeight": "500px"
 * }
 * ```
 */
export declare const messageThreadConfigSchema: z.ZodType<Record<string, any>>;
