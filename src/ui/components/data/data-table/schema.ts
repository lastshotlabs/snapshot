import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  clientFilterSchema,
  clientSortSchema,
  emptyStateConfigSchema,
  liveConfigSchema,
  loadingConfigSchema,
  urlSyncConfigSchema,
  fromRefSchema,
} from "../../../manifest/schema";
import { dataSourceSchema } from "../../../manifest/resources";
import { pollConfigSchema } from "../../_base/types";
import { contextMenuItemSchema } from "../../overlay/context-menu/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const dataTableSlotNames = [
  "root",
  "toolbar",
  "headerRow",
  "headerCell",
  "row",
  "cell",
  "actionsCell",
  "bulkActions",
  "emptyState",
  "loadingState",
  "errorState",
  "pagination",
] as const;

export const dataTableRowSlotNames = [
  "row",
  "cell",
  "actionsCell",
] as const;

/**
 * Schema for badge color mapping. Maps values to semantic color names.
 */
const badgeColorsSchema = z.record(z.string());

/**
 * Schema for filter option (label + value pair).
 */
const filterOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

/**
 * Schema for column filter configuration.
 */
const columnFilterSchema = z
  .object({
    /** Filter input type. */
    type: z.enum(["select", "text", "date-range"]),
    /** Options for select filter. 'auto' derives from unique column values. */
    options: z
      .union([z.literal("auto"), z.array(filterOptionSchema)])
      .optional(),
  })
  .strict();

/**
 * Schema for individual column configuration.
 */
export const columnConfigSchema = z
  .object({
    /** Field name from the data object. */
    field: z.string(),
    /** Display label. Defaults to humanized field name. */
    label: z.string().optional(),
    /** Whether the column is sortable. */
    sortable: z.boolean().optional(),
    /** Display format. */
    format: z
      .enum([
        "date",
        "number",
        "currency",
        "badge",
        "boolean",
        "avatar",
        "progress",
        "link",
        "code",
      ])
      .optional(),
    /** Color mapping for badge format. Maps field values to semantic colors. */
    badgeColors: badgeColorsSchema.optional(),
    /** Field to use as avatar image src (when format is "avatar"). */
    avatarField: z.string().optional(),
    /** Field to use as link text (when format is "link"). */
    linkTextField: z.string().optional(),
    /** Prefix text for the cell value. */
    prefix: z.string().optional(),
    /** Suffix text for the cell value. */
    suffix: z.string().optional(),
    /** Filter configuration for this column. */
    filter: columnFilterSchema.optional(),
    /** Column width (CSS value, e.g. '200px', '20%'). */
    width: z.string().optional(),
    /** Text alignment within the column. */
    align: z.enum(["left", "center", "right"]).optional(),
  })
  .strict();

/**
 * Schema for a per-row action button.
 */
export const rowActionSchema = z
  .object({
    /** Button label text. */
    label: z.string(),
    /** Icon identifier. */
    icon: z.string().optional(),
    /** Action(s) to execute when clicked. Row data is available in action context. */
    action: z.union([actionSchema, z.array(actionSchema)]),
    /** Controls visibility. Can be a static boolean or a FromRef. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
  })
  .strict();

/**
 * Schema for a bulk action on selected rows.
 */
export const bulkActionSchema = z
  .object({
    /** Button label text. `{count}` interpolates to selected row count. */
    label: z.string(),
    /** Icon identifier. */
    icon: z.string().optional(),
    /** Action(s) to execute. Selected rows available in action context. */
    action: z.union([actionSchema, z.array(actionSchema)]),
    slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
  })
  .strict();

/**
 * Schema for pagination configuration.
 */
const paginationConfigSchema = z
  .object({
    /** Pagination strategy. "infinite" appends rows on scroll instead of paginating. */
    type: z.enum(["offset", "cursor", "infinite"]),
    /** Number of rows per page. Defaults to 10. */
    pageSize: z.number().int().min(1).optional(),
    /** Alias for enabling infinite-scroll mode. */
    infinite: z.boolean().optional(),
    /** Threshold in pixels before loading the next page. */
    infiniteThreshold: z.number().positive().optional(),
  })
  .strict();

/**
 * Schema for search configuration.
 */
const searchConfigSchema = z
  .object({
    /** Placeholder text for the search input. */
    placeholder: z.string().optional(),
    /** Fields to search across. Defaults to all string fields. */
    fields: z.array(z.string()).optional(),
  })
  .strict();

/**
 * Zod schema for the DataTable component configuration.
 *
 * Defines a config-driven data table with sorting, pagination, filtering,
 * selection, search, row actions, and bulk actions.
 *
 * @example
 * ```json
 * {
 *   "type": "data-table",
 *   "id": "users-table",
 *   "data": "GET /api/users",
 *   "columns": [
 *     { "field": "name", "sortable": true },
 *     { "field": "email" },
 *     { "field": "status", "format": "badge", "badgeColors": { "active": "success", "inactive": "muted" } }
 *   ],
 *   "pagination": { "type": "offset", "pageSize": 20 },
 *   "selectable": true,
 *   "searchable": true
 * }
 * ```
 */
export const dataTableConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("data-table"),
    /** Grid column span (1-12). */
    span: z.number().int().min(1).max(12).optional(),
    /** Data source endpoint (e.g. "GET /api/users") or a FromRef. */
    data: dataSourceSchema,
    /** Query parameters for the data endpoint. Values can be static or FromRefs. */
    params: z.record(z.union([z.unknown(), fromRefSchema])).optional(),
    /** Column configuration. 'auto' derives columns from response data keys. */
    columns: z.union([z.literal("auto"), z.array(columnConfigSchema)]),
    /** Pagination configuration. Set to false to disable pagination. */
    pagination: z.union([paginationConfigSchema, z.literal(false)]).optional(),
    /** Enable row selection checkboxes. */
    selectable: z.boolean().optional(),
    /** Enable search bar. Can be true for defaults or an object with options. */
    searchable: z.union([z.boolean(), searchConfigSchema]).optional(),
    /** Per-row action buttons. */
    actions: z.array(rowActionSchema).optional(),
    /** Bulk actions shown when rows are selected. */
    bulkActions: z.array(bulkActionSchema).optional(),
    /** Enable row drag-and-drop. */
    draggable: z.boolean().optional(),
    /** Action fired after row reorder. */
    onReorder: actionSchema.optional(),
    /** Legacy reorder alias. */
    reorderAction: actionSchema.optional(),
    /** Named drag group for cross-component moves. */
    dragGroup: z.string().optional(),
    /** Accepted external drop targets. */
    dropTargets: z.array(z.string()).optional(),
    /** Action fired on external drop. */
    onDrop: actionSchema.optional(),
    /** Context-menu entries for each row. */
    contextMenu: z.array(contextMenuItemSchema).optional(),
    /** Polling behavior for endpoint-backed tables. */
    poll: pollConfigSchema.optional(),
    /** Sync table state into URL query params. */
    urlSync: urlSyncConfigSchema.optional(),
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
    /** Message shown when there is no data. */
    emptyMessage: z.string().optional(),
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
    /** Enable expandable row detail. */
    expandable: z.boolean().optional(),
    /** Child components rendered in the expanded row area. Row data is available via from-ref. */
    expandedContent: z.array(z.record(z.unknown())).optional(),
    /** Action dispatched when a row is clicked. */
    rowClickAction: actionSchema.optional(),
    /** Table density. Affects row padding. */
    density: z.enum(["compact", "default", "comfortable"]).optional(),
    /** Toolbar buttons rendered in the table card header, right-aligned. */
    toolbar: z
      .array(
        z.object({
          label: z.string(),
          icon: z.string().optional(),
          variant: z
            .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
            .optional(),
          action: actionSchema,
          disabled: z.union([z.boolean(), fromRefSchema]).optional(),
          slots: slotsSchema(["item", "itemLabel", "itemIcon"]).optional(),
        }).strict(),
      )
      .optional(),
    slots: slotsSchema(dataTableSlotNames).optional(),
})
  .strict();
