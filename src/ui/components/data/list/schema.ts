import { z } from "zod";
import {
  clientFilterSchema,
  clientSortSchema,
  emptyStateConfigSchema,
  errorStateConfigSchema,
  liveConfigSchema,
  loadingConfigSchema,
} from "../../../manifest/schema";
import { dataSourceSchema } from "../../../manifest/resources";
import { pollConfigSchema } from "../../_base/types";
import { actionSchema } from "../../../actions/types";
import { contextMenuItemSchema } from "../../overlay/context-menu/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const listSlotNames = [
  "root",
  "list",
  "item",
  "itemBody",
  "itemLink",
  "itemTitle",
  "itemDescription",
  "itemIcon",
  "itemBadge",
  "divider",
  "liveBanner",
  "liveText",
  "emptyState",
  "loadingState",
  "loadingItem",
  "loadingIcon",
  "loadingBody",
  "loadingTitle",
  "loadingDescription",
  "errorState",
] as const;

export const listItemSlotNames = [
  "item",
  "itemBody",
  "itemLink",
  "itemTitle",
  "itemDescription",
  "itemIcon",
  "itemBadge",
  "divider",
] as const;

/**
 * Schema for a static list item.
 */
export const listItemSchema = z.object({
  /** Stable item identity for reordering and cross-component drag-and-drop. */
  id: z.string().optional(),
  /** Primary text for the item. */
  title: z.union([z.string(), fromRefSchema]),
  /** Secondary description text. */
  description: z.union([z.string(), fromRefSchema]).optional(),
  /** Icon name displayed at the start. */
  icon: z.string().optional(),
  /** Badge text displayed inline. */
  badge: z.union([z.string(), fromRefSchema]).optional(),
  /** Semantic color for the badge. */
  badgeColor: z
    .enum(["primary", "secondary", "success", "warning", "destructive", "info"])
    .optional(),
  /** Action dispatched on item click. */
  action: actionSchema.optional(),
  /** Link href for the item. */
  href: z.string().optional(),
  slots: slotsSchema(listItemSlotNames).optional(),
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
export const listConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
  /** Component type discriminator. */
  type: z.literal("list"),
  /** API endpoint to fetch list data. Supports FromRef for dependent data. */
  data: dataSourceSchema.optional(),
  /** Static list items (used when no data endpoint is provided). */
  items: z.array(listItemSchema).optional(),
  /** Response field name to use as item title when using data endpoint. */
  titleField: z.string().optional(),
  /** Response field name to use as item description when using data endpoint. */
  descriptionField: z.string().optional(),
  /** Response field name to use as item icon when using data endpoint. */
  iconField: z.string().optional(),
  /** Optional item limit for endpoint-backed lists. */
  limit: z.number().int().positive().optional(),
  /** Visual variant. */
  variant: z.enum(["default", "bordered", "card"]).optional(),
  /** Show dividers between items. */
  divider: z.boolean().optional(),
  /** Whether items are selectable/clickable. */
  selectable: z.boolean().optional(),
  /** Enable drag-and-drop reordering. Default: false. */
  sortable: z.boolean().optional(),
  /** Canonical drag-and-drop toggle. */
  draggable: z.boolean().optional(),
  /** Action dispatched when items are reordered via drag-and-drop. */
  reorderAction: actionSchema.optional(),
  /** Canonical reorder action. */
  onReorder: actionSchema.optional(),
  /** Named drag group for cross-component moves. */
  dragGroup: z.string().optional(),
  /** Accepted external drop targets. */
  dropTargets: z.array(z.string()).optional(),
  /** Action fired when an external item is dropped. */
  onDrop: actionSchema.optional(),
  /** Row context-menu items. */
  contextMenu: z.array(contextMenuItemSchema).optional(),
  /** Polling behavior for endpoint-backed lists. */
  poll: pollConfigSchema.optional(),
  /** In-memory filters applied after fetch. */
  clientFilter: z.array(clientFilterSchema).optional(),
  /** In-memory sorts applied after fetch. */
  clientSort: z.array(clientSortSchema).optional(),
  /** Live refresh configuration driven by realtime events. */
  live: liveConfigSchema.optional(),
  /** Automatic loading placeholder config. */
  loading: loadingConfigSchema.optional(),
  /** Rich empty state config. */
  empty: emptyStateConfigSchema.optional(),
  /** Virtualized rendering for large datasets. */
  virtualize: z
    .union([
      z.boolean(),
      z
        .object({
          itemHeight: z.number().positive().default(48),
          overscan: z.number().int().nonnegative().default(5),
        })
        .strict(),
    ])
    .optional(),
  /** Message shown when no items are available. */
  emptyMessage: z.union([z.string(), fromRefSchema]).optional(),
  /** Error state config. */
  error: errorStateConfigSchema.optional(),
  slots: slotsSchema(listSlotNames).optional(),
});
