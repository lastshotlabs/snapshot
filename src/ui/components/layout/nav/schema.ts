import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { tRefSchema } from "../../../i18n/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const navSlotNames = [
  "root",
  "brand",
  "brandIcon",
  "brandLabel",
  "toggle",
  "list",
  "item",
  "itemLabel",
  "itemIcon",
  "itemBadge",
  "dropdown",
  "dropdownItem",
  "dropdownItemLabel",
  "dropdownItemIcon",
  "dropdownItemBadge",
  "userMenu",
  "userMenuTrigger",
  "userMenuItem",
  "userAvatar",
] as const;

const navItemSlotNames = [
  "item",
  "itemLabel",
  "itemIcon",
  "itemBadge",
  "dropdownItem",
  "dropdownItemLabel",
  "dropdownItemIcon",
  "dropdownItemBadge",
] as const;

const navTextSchema = z.union([z.string(), tRefSchema]);

const userMenuItemSchema = z
  .object({
    label: navTextSchema,
    icon: z.string().optional(),
    action: actionSchema,
    roles: z.array(z.string()).optional(),
    slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
  })
  .strict();

const userMenuConfigSchema = z
  .object({
    showAvatar: z.boolean().optional(),
    showEmail: z.boolean().optional(),
    items: z.array(userMenuItemSchema).optional(),
  })
  .strict();

const logoConfigSchema = z
  .object({
    src: z.string().optional(),
    text: navTextSchema.optional(),
    path: z.string().optional(),
  })
  .strict();

const templateComponentSchema: z.ZodType = z.lazy(() =>
  z.object({ type: z.string() }).passthrough(),
);

const navItemBaseSchema = z
  .object({
    label: navTextSchema,
    path: z.string().optional(),
    icon: z.string().optional(),
    badge: z.union([z.number(), fromRefSchema]).optional(),
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    authenticated: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
    slots: slotsSchema(navItemSlotNames).optional(),
  })
  .strict();

/** Schema for a recursive navigation item used by grouped `navigation.items`. */
export const navItemSchema: z.ZodType = z.lazy(() =>
  navItemBaseSchema.extend({
    children: z.array(navItemSchema).optional(),
  }).strict(),
);

/** Runtime config type for a grouped nav item, including optional child items and per-item slots. */
export type NavItemConfig = z.infer<typeof navItemSchema>;

/**
 * Zod schema for the grouped Nav component.
 *
 * Supports either `items`-driven navigation or template composition, optional logo and user menu
 * configuration, collapsible sidebar behavior, and canonical slot-based surface styling.
 */
export const navConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
  type: z.literal("nav"),
  items: z.array(navItemSchema).optional(),
  template: z.array(templateComponentSchema).optional(),
  collapsible: z.boolean().optional(),
  userMenu: z.union([z.boolean(), userMenuConfigSchema]).optional(),
  logo: logoConfigSchema.optional(),
  slots: slotsSchema(navSlotNames).optional(),
}).strict();

/** Runtime config type for the Nav component. */
export type NavConfig = z.infer<typeof navConfigSchema>;
