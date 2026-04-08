import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the EmojiPicker component.
 *
 * Renders a searchable grid of emojis organized by category.
 *
 * @example
 * ```json
 * {
 *   "type": "emoji-picker",
 *   "id": "emoji",
 *   "perRow": 8,
 *   "maxHeight": "300px"
 * }
 * ```
 */
export const emojiPickerConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("emoji-picker"),
    /** Which emoji categories to show. Default: all. */
    categories: z
      .array(
        z.enum([
          "smileys",
          "people",
          "animals",
          "food",
          "travel",
          "activities",
          "objects",
          "symbols",
          "flags",
        ]),
      )
      .optional(),
    /** Number of emojis per row. Default: 8. */
    perRow: z.number().optional(),
    /** Max height of the scrollable grid. Default: "300px". */
    maxHeight: z.string().optional(),
    /** Static custom emoji data (image-based emojis). */
    customEmojis: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          shortcode: z.string(),
          url: z.string(),
          category: z.string().optional(),
          animated: z.boolean().optional(),
        }),
      )
      .optional(),
    /** API endpoint for loading custom emojis. */
    customEmojiData: dataSourceSchema.optional(),
    /** Field name for emoji image URL in API results. Default: "url". */
    emojiUrlField: z.string().optional(),
    /** URL prefix for resolving uploadKey to full URL (e.g., "https://cdn.example.com/emojis/"). */
    emojiUrlPrefix: z.string().optional(),
    /** Action dispatched when an emoji is selected. */
    selectAction: actionSchema.optional(),
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
