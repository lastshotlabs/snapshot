import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Markdown component.
 *
 * Renders markdown content with full GFM support and syntax highlighting.
 *
 * @example
 * ```json
 * {
 *   "type": "markdown",
 *   "content": "# Hello\n\nSome **bold** text and a [link](https://example.com)."
 * }
 * ```
 */
export const markdownConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("markdown"),
    /** Markdown content string. Supports FromRef for dynamic content. */
    content: z.union([z.string(), fromRefSchema]),
    /** Max height before scrolling. Example: "400px". */
    maxHeight: z.string().optional(),
    slots: slotsSchema([
      "root",
      "heading1",
      "heading2",
      "heading3",
      "heading4",
      "heading5",
      "heading6",
      "paragraph",
      "link",
      "unorderedList",
      "orderedList",
      "listItem",
      "blockquote",
      "pre",
      "inlineCode",
      "blockCode",
      "table",
      "tableHead",
      "tableHeader",
      "tableCell",
      "rule",
      "image",
    ]).optional(),
  }).strict();
