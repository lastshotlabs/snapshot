import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the RichInput component.
 *
 * A TipTap-based WYSIWYG editor for chat messages, comments, and posts.
 * Users see formatted text as they type (bold, italic, mentions, etc.)
 * rather than raw markdown.
 *
 * @example
 * ```json
 * {
 *   "type": "rich-input",
 *   "id": "chat-input",
 *   "placeholder": "Type a message...",
 *   "sendOnEnter": true,
 *   "features": ["bold", "italic", "mention", "emoji", "code"],
 *   "sendAction": {
 *     "type": "api",
 *     "method": "POST",
 *     "endpoint": "/api/channels/general/messages",
 *     "body": { "from": "chat-input" }
 *   }
 * }
 * ```
 */
export const richInputConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("rich-input"),
    /** Placeholder text shown when the editor is empty. */
    placeholder: z.string().optional(),
    /** Enabled formatting features. Default: all enabled. */
    features: z
      .array(
        z.enum([
          "bold",
          "italic",
          "underline",
          "strike",
          "code",
          "code-block",
          "link",
          "bullet-list",
          "ordered-list",
          "mention",
          "emoji",
        ]),
      )
      .optional(),
    /** API endpoint for @mention user suggestions. */
    mentionData: dataSourceSchema.optional(),
    /** Field name for mention display text. Default: "name". */
    mentionDisplayField: z.string().optional(),
    /** Field name for mention value. Default: "id". */
    mentionValueField: z.string().optional(),
    /** Action dispatched when user presses Enter (or clicks send). */
    sendAction: actionSchema.optional(),
    /** Whether Enter submits (true) or inserts newline (false). Default: true. */
    sendOnEnter: z.boolean().optional(),
    /** Maximum character count. */
    maxLength: z.number().optional(),
    /** Minimum editor height. CSS value. */
    minHeight: z.string().optional(),
    /** Maximum editor height (scrolls after). CSS value. */
    maxHeight: z.string().optional(),
    /** Whether the editor is read-only. */
    readonly: z.union([z.boolean(), fromRefSchema]).optional(),
    slots: slotsSchema([
      "root",
      "editorArea",
      "editorContent",
      "placeholder",
      "linkBar",
      "linkIcon",
      "linkInput",
      "linkCloseButton",
      "toolbar",
      "formattingGroup",
      "toolbarButton",
      "statusGroup",
      "counter",
      "sendButton",
    ]).optional(),
  })
  .strict();
