import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the HighlightedText component.
 *
 * Renders text with search query highlighting. Matching portions are
 * wrapped in `<mark>` elements with a configurable highlight color.
 *
 * @example
 * ```json
 * {
 *   "type": "highlighted-text",
 *   "text": "The quick brown fox jumps over the lazy dog",
 *   "highlight": "fox"
 * }
 * ```
 */
export const highlightedTextConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("highlighted-text"),
    /** The full text to display. Supports FromRef for dynamic text. */
    text: z.union([z.string(), fromRefSchema]),
    /** The search query to highlight within the text. Supports FromRef. */
    highlight: z.union([z.string(), fromRefSchema]).optional(),
    /** CSS color for the highlight background. Default uses `--sn-color-warning`. */
    highlightColor: z.string().optional(),
    /** Whether highlight matching is case-sensitive. Default: false. */
    caseSensitive: z.boolean().optional(),
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
