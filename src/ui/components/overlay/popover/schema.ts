import { z } from "zod";
import { fromRefSchema } from "../../_base/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const popoverSlotNames = [
  "root",
  "trigger",
  "triggerLabel",
  "triggerIcon",
  "panel",
  "content",
  "header",
  "title",
  "description",
  "footer",
  "closeButton",
] as const;

/**
 * Zod schema for the Popover component.
 *
 * Defines a trigger-driven floating panel with optional title, description, footer content, width,
 * placement, and canonical slot-based styling for the trigger and panel sub-surfaces.
 */
export const popoverConfigSchema = extendComponentSchema({
  type: z.literal("popover"),
  trigger: z.union([z.string(), fromRefSchema]),
  triggerIcon: z.string().optional(),
  triggerVariant: z
    .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
    .optional(),
  title: z.union([z.string(), fromRefSchema]).optional(),
  description: z.union([z.string(), fromRefSchema]).optional(),
  content: z.array(z.any()).optional(),
  footer: z.array(z.any()).optional(),
  placement: z.enum(["top", "bottom"]).optional(),
  width: z.string().optional(),
  slots: slotsSchema(popoverSlotNames).optional(),
}).strict();
