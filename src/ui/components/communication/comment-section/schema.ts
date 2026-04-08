import { z } from "zod";
import { actionSchema } from "../../../actions/types";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

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
export const commentSectionConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("comment-section"),
    /** API endpoint for comments data. */
    data: z.union([z.string(), fromRefSchema]),
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
    inputFeatures: z
      .array(z.string())
      .optional(),
    /** Action dispatched when posting a new comment. */
    submitAction: actionSchema.optional(),
    /** Action dispatched when deleting a comment. */
    deleteAction: actionSchema.optional(),
    /** Sort order for comments. Default: "newest". */
    sortOrder: z.enum(["newest", "oldest"]).optional(),
    /** Empty state message. Default: "No comments yet". */
    emptyMessage: z.string().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
