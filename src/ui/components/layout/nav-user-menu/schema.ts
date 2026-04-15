import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { actionSchema } from "../../../actions/types";
import { tRefSchema } from "../../../i18n/schema";

export const navUserMenuSlotNames = [
  "root",
  "trigger",
  "triggerLabel",
  "triggerIcon",
  "avatar",
  "avatarImage",
  "email",
  "panel",
  "item",
  "itemLabel",
  "itemIcon",
  "separator",
  "label",
] as const;

export const navUserMenuConfigSchema = extendComponentSchema({
  type: z.literal("nav-user-menu"),
  showAvatar: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showName: z.boolean().optional(),
  mode: z.enum(["full", "compact"]).optional(),
  items: z
    .array(
      z
        .object({
          label: z.union([z.string(), tRefSchema]),
          icon: z.string().optional(),
          action: actionSchema,
          roles: z.array(z.string()).optional(),
          slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
        })
        .strict(),
    )
    .optional(),
  slots: slotsSchema(navUserMenuSlotNames).optional(),
}).strict();
