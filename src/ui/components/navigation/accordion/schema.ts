import { z } from "zod";
import {
  baseComponentConfigSchema,
  componentConfigSchema,
} from "../../../manifest/schema";

/**
 * Schema for a single accordion item.
 */
export const accordionItemSchema = z.object({
  /** Display title for the accordion header. */
  title: z.string(),
  /** Child components rendered inside the collapsible panel. */
  content: z.array(componentConfigSchema),
  /** Optional icon name displayed before the title. */
  icon: z.string().optional(),
  /** Whether this item is disabled (not expandable). */
  disabled: z.boolean().optional(),
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
export const accordionConfigSchema = baseComponentConfigSchema.extend({
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
  /** Inline style overrides. */
  style: z.record(z.union([z.string(), z.number()])).optional(),
  /** Additional CSS class name. */
  className: z.string().optional(),
});
