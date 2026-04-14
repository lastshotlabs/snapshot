import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import {
  primitiveDisplayValueSchema,
  primitiveStringValueSchema,
  primitiveTextValueSchema,
} from "../schema-helpers";

export const linkSlotNames = ["root", "label", "icon", "badge"] as const;

export const linkConfigSchema = extendComponentSchema({
  type: z.literal("link"),
  text: primitiveTextValueSchema,
  to: primitiveStringValueSchema,
  icon: z.string().optional(),
  badge: primitiveDisplayValueSchema.optional(),
  external: z.boolean().default(false),
  disabled: z.boolean().optional(),
  current: z.boolean().optional(),
  matchChildren: z.boolean().default(true),
  align: z.enum(["left", "center", "right"]).default("left"),
  variant: z.enum(["default", "muted", "button", "navigation"]).default("default"),
  slots: slotsSchema(linkSlotNames).optional(),
}).strict();
