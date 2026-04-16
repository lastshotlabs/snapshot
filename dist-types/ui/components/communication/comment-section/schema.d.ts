import { z } from "zod";
/**
 * Zod config schema for the CommentSection component.
 *
 * Renders a comment list with nested replies and an embedded rich input
 * for posting new comments.
 *
 * @example
 * ```json
 * {
 *   "type": "comment-section",
 *   "data": "GET /api/posts/123/comments",
 *   "inputPlaceholder": "Write a comment...",
 *   "submitAction": {
 *     "type": "api",
 *     "method": "POST",
 *     "endpoint": "/api/posts/123/comments"
 *   }
 * }
 * ```
 */
export declare const commentSectionConfigSchema: z.ZodType<Record<string, any>>;
