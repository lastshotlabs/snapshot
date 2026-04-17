import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the CompareView component.
 *
 * Defines all manifest-settable fields for a side-by-side content
 * comparison view with diff highlighting.
 *
 * @example
 * ```json
 * {
 *   "type": "compare-view",
 *   "left": "Original text content",
 *   "right": "Modified text content",
 *   "leftLabel": "Before",
 *   "rightLabel": "After"
 * }
 * ```
 */
export const compareViewConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("compare-view"),
    /** Left (original) content text. Supports FromRef. */
    left: z.union([z.string(), fromRefSchema]),
    /** Right (modified) content text. Supports FromRef. */
    right: z.union([z.string(), fromRefSchema]),
    /** Label for the left pane. Default: "Original". */
    leftLabel: z.union([z.string(), fromRefSchema]).optional(),
    /** Label for the right pane. Default: "Modified". */
    rightLabel: z.union([z.string(), fromRefSchema]).optional(),
    /** Maximum height of the diff area. Default: "400px". */
    maxHeight: z.string().optional(),
    /** Whether to show line numbers. Default: true. */
    showLineNumbers: z.boolean().optional(),
    slots: slotsSchema([
      "root",
      "header",
      "leftLabel",
      "rightLabel",
      "divider",
      "panes",
      "pane",
      "line",
      "lineNumber",
      "prefix",
      "text",
    ]).optional(),
  }).strict();
