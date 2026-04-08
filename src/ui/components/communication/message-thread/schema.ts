import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";

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
export const messageThreadConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("message-thread"),
    /** API endpoint for message data, or static data via FromRef. */
    data: z.union([z.string(), fromRefSchema]),
    /** Field name for message HTML content. Default: "content". */
    contentField: z.string().optional(),
    /** Field name for author object. Default: "author". */
    authorField: z.string().optional(),
    /** Field name for author display name. Default: "author.name". */
    authorNameField: z.string().optional(),
    /** Field name for author avatar URL. Default: "author.avatar". */
    authorAvatarField: z.string().optional(),
    /** Field name for message timestamp. Default: "timestamp". */
    timestampField: z.string().optional(),
    /** Field name for reactions array. Default: "reactions". */
    reactionsField: z.string().optional(),
    /** Field name for embeds array on each message. Default: "embeds". */
    embedsField: z.string().optional(),
    /** Show link embeds (YouTube, Twitter, etc.) below messages. Default: true. */
    showEmbeds: z.boolean().optional(),
    /** Show reactions on messages. Default: true. */
    showReactions: z.boolean().optional(),
    /** Show timestamps on messages. Default: true. */
    showTimestamps: z.boolean().optional(),
    /** Group messages by date with separators. Default: true. */
    groupByDate: z.boolean().optional(),
    /** Action when a message is clicked. */
    messageAction: actionSchema.optional(),
    /** Max height for the scrollable container. */
    maxHeight: z.string().optional(),
    /** Message to show when there are no messages. */
    emptyMessage: z.string().optional(),
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
