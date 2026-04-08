import { z } from "zod";
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
export const markdownConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("markdown"),
    /** Markdown content string. Supports FromRef for dynamic content. */
    content: z.union([z.string(), fromRefSchema]),
    /** Max height before scrolling. Example: "400px". */
    maxHeight: z.string().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
    /** Inline styles. */
    style: z.record(z.string()).optional(),
  })
  .strict();
