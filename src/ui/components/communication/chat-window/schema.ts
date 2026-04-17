import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the ChatWindow component.
 *
 * A full chat interface composing a message thread, rich input,
 * and typing indicator into a single component.
 *
 * @example
 * ```json
 * {
 *   "type": "chat-window",
 *   "title": "#general",
 *   "data": "GET /api/channels/general/messages",
 *   "sendAction": {
 *     "type": "api",
 *     "method": "POST",
 *     "endpoint": "/api/channels/general/messages"
 *   },
 *   "height": "600px"
 * }
 * ```
 */
export const chatWindowConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("chat-window"),
    /** API endpoint for message data. */
    data: dataSourceSchema,
    /** Field name for message content. Default: "content". */
    contentField: z.string().optional(),
    /** Field name for author display name. Default: "author.name". */
    authorNameField: z.string().optional(),
    /** Field name for author avatar URL. Default: "author.avatar". */
    authorAvatarField: z.string().optional(),
    /** Field name for timestamp. Default: "timestamp". */
    timestampField: z.string().optional(),
    /** Chat window title (channel name). Can be a FromRef. */
    title: z.union([z.string(), fromRefSchema]).optional(),
    /** Subtitle text. Can be a FromRef. */
    subtitle: z.union([z.string(), fromRefSchema]).optional(),
    /** Show the header bar. Default: true. */
    showHeader: z.boolean().optional(),
    /** Placeholder for the message input. */
    inputPlaceholder: z.union([z.string(), fromRefSchema]).optional(),
    /** Features enabled in the message input. */
    inputFeatures: z.array(z.string()).optional(),
    /** API endpoint for @mention user data. */
    mentionData: dataSourceSchema.optional(),
    /** Action dispatched when sending a message. */
    sendAction: actionSchema.optional(),
    /** Show typing indicator area. Default: true. */
    showTypingIndicator: z.boolean().optional(),
    /** Show reactions on messages. Default: true. */
    showReactions: z.boolean().optional(),
    /** Total height of the chat window. Default: "500px". */
    height: z.string().optional(),
    slots: slotsSchema([
      "root",
      "header",
      "headerIcon",
      "titleGroup",
      "title",
      "subtitle",
      "threadArea",
      "typingArea",
      "inputArea",
    ]).optional(),
  })
  .strict();
