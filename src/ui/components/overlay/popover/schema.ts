import { z } from "zod";
// Canonical fromRefSchema source is _base/types.ts
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Popover component.
 *
 * A floating content container that appears when the trigger button is clicked.
 * Positions itself relative to the trigger and closes on outside click.
 *
 * @example
 * ```json
 * {
 *   "type": "popover",
 *   "trigger": "Options",
 *   "triggerIcon": "settings",
 *   "placement": "bottom",
 *   "content": [
 *     { "type": "heading", "text": "Settings", "level": 3 }
 *   ]
 * }
 * ```
 */
export const popoverConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("popover"),
    /** Trigger button text. Supports FromRef for dynamic text. */
    trigger: z.union([z.string(), fromRefSchema]),
    /** Optional icon name for the trigger button. */
    triggerIcon: z.string().optional(),
    /** Trigger button visual variant. Default: "outline". */
    triggerVariant: z.enum(["default", "outline", "ghost"]).optional(),
    /** Child components rendered inside the popover body. */
    content: z.array(z.any()).optional(),
    /** Popover placement relative to trigger. Default: "bottom". */
    placement: z.enum(["top", "bottom", "left", "right"]).optional(),
    /** Popover width. Default: "auto". */
    width: z.string().optional(),
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
