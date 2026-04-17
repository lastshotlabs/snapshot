import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

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
export const messageThreadConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("message-thread"),
    /** API endpoint for message data, or static data via FromRef. */
    data: dataSourceSchema,
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
    emptyMessage: z.union([z.string(), fromRefSchema]).optional(),
    slots: slotsSchema([
      "root",
      "scrollArea",
      "loadingItem",
      "loadingAvatar",
      "loadingTitle",
      "loadingBody",
      "errorState",
      "emptyState",
      "dateSeparator",
      "dateRule",
      "dateLabel",
      "messageItem",
      "avatarImage",
      "avatarFallback",
      "contentColumn",
      "header",
      "authorName",
      "timestamp",
      "body",
      "embeds",
    ]).optional(),
  })
  .strict();
