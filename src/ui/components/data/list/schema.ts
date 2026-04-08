import { z } from "zod";
import {
  baseComponentConfigSchema,
  fromRefSchema,
} from "../../../manifest/schema";
import { actionSchema } from "../../../actions/types";

/**
 * Schema for a static list item.
 */
export const listItemSchema = z.object({
  /** Primary text for the item. */
  title: z.string(),
  /** Secondary description text. */
  description: z.string().optional(),
  /** Icon name displayed at the start. */
  icon: z.string().optional(),
  /** Badge text displayed inline. */
  badge: z.string().optional(),
  /** Semantic color for the badge. */
  badgeColor: z
    .enum(["primary", "secondary", "success", "warning", "destructive", "info"])
    .optional(),
  /** Action dispatched on item click. */
  action: actionSchema.optional(),
  /** Link href for the item. */
  href: z.string().optional(),
});

/**
 * Zod config schema for the List component.
 *
 * Renders a vertical list of items with optional icons, descriptions,
 * badges, and click actions. Supports both static items and data-fetched items.
 *
 * @example
 * ```json
 * {
 *   "type": "list",
 *   "variant": "bordered",
 *   "items": [
 *     { "title": "Users", "description": "Manage user accounts", "icon": "users", "badge": "12", "badgeColor": "primary" },
 *     { "title": "Settings", "description": "App configuration", "icon": "settings" }
 *   ]
 * }
 * ```
 */
export const listConfigSchema = baseComponentConfigSchema.extend({
  /** Component type discriminator. */
  type: z.literal("list"),
  /** API endpoint to fetch list data. Supports FromRef for dependent data. */
  data: z.union([z.string(), fromRefSchema]).optional(),
  /** Static list items (used when no data endpoint is provided). */
  items: z.array(listItemSchema).optional(),
  /** Response field name to use as item title when using data endpoint. */
  titleField: z.string().optional(),
  /** Response field name to use as item description when using data endpoint. */
  descriptionField: z.string().optional(),
  /** Response field name to use as item icon when using data endpoint. */
  iconField: z.string().optional(),
  /** Visual variant. */
  variant: z.enum(["default", "bordered", "card"]).optional(),
  /** Show dividers between items. */
  divider: z.boolean().optional(),
  /** Whether items are selectable/clickable. */
  selectable: z.boolean().optional(),
  /** Enable drag-and-drop reordering. Default: false. */
  sortable: z.boolean().optional(),
  /** Action dispatched when items are reordered via drag-and-drop. */
  reorderAction: actionSchema.optional(),
  /** Message shown when no items are available. */
  emptyMessage: z.string().optional(),
  /** Custom error message. Default: "Failed to load items". */
  errorMessage: z.string().optional(),
  /** Inline style overrides. */
  style: z.record(z.union([z.string(), z.number()])).optional(),
  /** Additional CSS class name. */
  className: z.string().optional(),
});
