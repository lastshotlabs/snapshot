import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const tooltipSlotNames = ["root", "content", "arrow"] as const;

/**
 * Zod config schema for the Tooltip component.
 *
 * Wraps child components and shows a tooltip on hover with
 * configurable placement and delay.
 *
 * @example
 * ```json
 * {
 *   "type": "tooltip",
 *   "text": "Click to view details",
 *   "placement": "top",
 *   "content": [{ "type": "button", "label": "View", "action": { "type": "navigate", "to": "/details" } }]
 * }
 * ```
 */
export const tooltipConfigSchema = extendComponentSchema({
  /** Component type discriminator. */
  type: z.literal("tooltip"),
  /** Tooltip text content. Supports FromRef for dynamic text. */
  text: z.union([z.string(), fromRefSchema]),
  /** Child components wrapped by the tooltip trigger. */
  content: z.array(componentConfigSchema).min(1),
  /** Position of the tooltip relative to the trigger. */
  placement: z.enum(["top", "bottom", "left", "right"]).optional(),
  /** Show delay in milliseconds. */
  delay: z.number().optional(),
  /** Canonical slot overrides for the wrapper, bubble, and arrow. */
  slots: slotsSchema(tooltipSlotNames).optional(),
}).strict();
