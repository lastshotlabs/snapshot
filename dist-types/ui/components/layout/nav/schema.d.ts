import { z } from "zod";
export declare const navSlotNames: readonly ["root", "brand", "brandIcon", "brandLabel", "toggle", "list", "item", "itemLabel", "itemIcon", "itemBadge", "dropdown", "dropdownItem", "dropdownItemLabel", "dropdownItemIcon", "dropdownItemBadge", "userMenu", "userMenuTrigger", "userMenuItem", "userAvatar"];
/** Schema for a recursive navigation item used by grouped `navigation.items`. */
export declare const navItemSchema: z.ZodType;
/** Runtime config type for a grouped nav item, including optional child items and per-item slots. */
export type NavItemConfig = z.infer<typeof navItemSchema>;
/**
 * Zod schema for the grouped Nav component.
 *
 * Supports either `items`-driven navigation or template composition, optional logo and user menu
 * configuration, collapsible sidebar behavior, and canonical slot-based surface styling.
 */
export declare const navConfigSchema: z.ZodType<Record<string, any>>;
/** Runtime config type for the Nav component. */
export type NavConfig = z.infer<typeof navConfigSchema>;
