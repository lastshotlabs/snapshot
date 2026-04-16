import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema } from "../../_base/types";

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
export const commentSectionConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("comment-section"),
    /** API endpoint for comments data. */
    data: dataSourceSchema,
    /** Field name for comment content (HTML). Default: "content". */
    contentField: z.string().optional(),
    /** Field name for author display name. Default: "author.name". */
    authorNameField: z.string().optional(),
    /** Field name for author avatar URL. Default: "author.avatar". */
    authorAvatarField: z.string().optional(),
    /** Field name for timestamp. Default: "timestamp". */
    timestampField: z.string().optional(),
    /** Placeholder for the comment input. Default: "Write a comment...". */
    inputPlaceholder: z.string().optional(),
    /** Features enabled in the comment input. */
    inputFeatures: z.array(z.string()).optional(),
    /** Action dispatched when posting a new comment. */
    submitAction: actionSchema.optional(),
    /** Action dispatched when deleting a comment. */
    deleteAction: actionSchema.optional(),
    /** Sort order for comments. Default: "newest". */
    sortOrder: z.enum(["newest", "oldest"]).optional(),
    /** Empty state message. Default: "No comments yet". */
    emptyMessage: z.string().optional(),
    slots: slotsSchema([
      "root",
      "header",
      "headerIcon",
      "headerTitle",
      "headerCount",
      "list",
      "loadingItem",
      "loadingAvatar",
      "loadingTitle",
      "loadingBody",
      "errorState",
      "emptyState",
      "commentWrapper",
      "commentItem",
      "avatarImage",
      "avatarFallback",
      "contentColumn",
      "commentHeader",
      "authorName",
      "timestamp",
      "deleteButton",
      "body",
      "inputArea",
    ]).optional(),
  })
  .strict();
