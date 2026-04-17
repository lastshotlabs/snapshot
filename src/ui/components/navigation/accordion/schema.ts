import { z } from "zod";
import {
  componentConfigSchema,
} from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const accordionSlotNames = [
  "root",
  "item",
  "trigger",
  "triggerLabel",
  "triggerIcon",
  "content",
] as const;

/**
 * Schema for a single accordion item.
 */
export const accordionItemSchema = z.object({
  /** Display title for the accordion header. */
  title: z.union([z.string(), fromRefSchema]),
  /** Child components rendered inside the collapsible panel. */
  content: z.array(componentConfigSchema),
  /** Optional icon name displayed before the title. */
  icon: z.string().optional(),
  /** Whether this item is disabled (not expandable). */
  disabled: z.boolean().optional(),
  slots: slotsSchema(["item", "trigger", "triggerLabel", "triggerIcon", "content"]).optional(),
});

/**
 * Zod config schema for the Accordion component.
 *
 * Renders a list of expandable/collapsible content sections.
 * Supports single-open and multi-open modes, visual variants,
 * and nested component content via ComponentRenderer.
 *
 * @example
 * ```json
 * {
 *   "type": "accordion",
 *   "mode": "single",
 *   "variant": "bordered",
 *   "items": [
 *     { "title": "Section 1", "content": [{ "type": "heading", "text": "Hello" }] },
 *     { "title": "Section 2", "content": [{ "type": "heading", "text": "World" }] }
 *   ]
 * }
 * ```
 */
export const accordionConfigSchema = extendComponentSchema({
  /** Component type discriminator. */
  type: z.literal("accordion"),
  /** Array of accordion item definitions. */
  items: z.array(accordionItemSchema).min(1),
  /** Expansion mode: single allows only one open, multiple allows any combo. */
  mode: z.enum(["single", "multiple"]).optional(),
  /** Indices of initially open items. */
  defaultOpen: z.union([z.number(), z.array(z.number())]).optional(),
  /** Visual variant. */
  variant: z.enum(["default", "bordered", "separated"]).optional(),
  /** Position of the chevron icon. */
  iconPosition: z.enum(["left", "right"]).optional(),
  slots: slotsSchema(accordionSlotNames).optional(),
});
