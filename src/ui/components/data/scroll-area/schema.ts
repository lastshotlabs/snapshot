import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the ScrollArea component.
 *
 * A scrollable container with custom-styled thin scrollbars
 * that respect the design token system.
 *
 * @example
 * ```json
 * {
 *   "type": "scroll-area",
 *   "maxHeight": "300px",
 *   "orientation": "vertical",
 *   "showScrollbar": "hover",
 *   "content": [
 *     { "type": "heading", "text": "Long list..." }
 *   ]
 * }
 * ```
 */
export const scrollAreaConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("scroll-area"),
    /** Maximum height of the scroll area. Default: "400px". */
    maxHeight: z.string().optional(),
    /** Maximum width of the scroll area. */
    maxWidth: z.string().optional(),
    /** Scroll direction. Default: "vertical". */
    orientation: z.enum(["vertical", "horizontal", "both"]).optional(),
    /** When to show the scrollbar. Default: "auto". */
    showScrollbar: z.enum(["always", "hover", "auto"]).optional(),
    /** Child components rendered inside the scroll area. */
    content: z.array(z.record(z.unknown())).optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
  })
  .strict();
