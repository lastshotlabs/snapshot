import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";

/**
 * Base nav item schema (without recursive children).
 */
const navItemBaseSchema = z
  .object({
    /** Display label for the nav item. */
    label: z.string(),
    /** Route path to navigate to when clicked. */
    path: z.string().optional(),
    /** Icon name (rendered as a placeholder span; full icon integration comes later). */
    icon: z.string().optional(),
    /** Badge count or FromRef to resolve badge dynamically. */
    badge: z.union([z.number(), fromRefSchema]).optional(),
    /** Roles that can see this item. If omitted, visible to all. */
    roles: z.array(z.string()).optional(),
  })
  .strict();

/** Nav item config type (with optional recursive children). */
export interface NavItemConfig extends z.infer<typeof navItemBaseSchema> {
  /** Nested sub-items for grouped navigation. */
  children?: NavItemConfig[];
}

/**
 * Zod schema for a single nav item (with recursive children support).
 */
export const navItemSchema: z.ZodType<NavItemConfig> = navItemBaseSchema
  .extend({
    children: z.lazy(() => z.array(navItemSchema)).optional(),
  })
  .strict();

/**
 * Zod schema for user menu item (additional items beyond the defaults).
 */
const userMenuItemSchema = z
  .object({
    /** Menu item label. */
    label: z.string(),
    /** Icon name. */
    icon: z.string().optional(),
    /** Action to execute when clicked. */
    action: actionSchema,
  })
  .strict();

/**
 * Zod schema for the user menu configuration.
 */
const userMenuConfigSchema = z
  .object({
    /** Show user avatar. Default: true. */
    showAvatar: z.boolean().optional(),
    /** Show user email. Default: false. */
    showEmail: z.boolean().optional(),
    /** Additional menu items. */
    items: z.array(userMenuItemSchema).optional(),
  })
  .strict();

/**
 * Zod schema for the logo/brand configuration.
 */
const logoConfigSchema = z
  .object({
    /** Logo image source URL. */
    src: z.string().optional(),
    /** Text to display as brand name. */
    text: z.string().optional(),
    /** Path to navigate when logo is clicked. */
    path: z.string().optional(),
  })
  .strict();

/**
 * Zod schema for the full Nav component configuration.
 */
export const navConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("nav"),
    /** Optional component id for context publishing. */
    id: z.string().optional(),
    /** Navigation items. */
    items: z.array(navItemSchema),
    /** Whether the sidebar is collapsible on mobile. Default: true. */
    collapsible: z.boolean().optional(),
    /** Show user menu. `true` uses defaults; object allows customization. */
    userMenu: z.union([z.boolean(), userMenuConfigSchema]).optional(),
    /** Logo / brand element. */
    logo: logoConfigSchema.optional(),
    /** Optional inline styles applied to the root nav element. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
  })
  .strict();

/** Inferred nav config type from the Zod schema. */
export type NavConfig = z.infer<typeof navConfigSchema>;
