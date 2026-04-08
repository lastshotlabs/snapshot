import { z } from "zod";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

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
export const compareViewConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("compare-view"),
    /** Left (original) content text. Supports FromRef. */
    left: z.union([z.string(), fromRefSchema]),
    /** Right (modified) content text. Supports FromRef. */
    right: z.union([z.string(), fromRefSchema]),
    /** Label for the left pane. Default: "Original". */
    leftLabel: z.string().optional(),
    /** Label for the right pane. Default: "Modified". */
    rightLabel: z.string().optional(),
    /** Maximum height of the diff area. Default: "400px". */
    maxHeight: z.string().optional(),
    /** Whether to show line numbers. Default: true. */
    showLineNumbers: z.boolean().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
