import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";

/**
 * Schema for base component config fields shared across all config-driven components.
 */
const baseComponentConfigSchema = z.object({
  /** Component identifier for publishing state and cross-component references. */
  id: z.string().optional(),
  /** Controls visibility. Can be a static boolean or a FromRef. */
  visible: z.union([z.boolean(), fromRefSchema]).optional(),
  /** Additional CSS class names. */
  className: z.string().optional(),
  /** Grid column span (1-12). */
  span: z.number().int().min(1).max(12).optional(),
});

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
  })
  .strict();

/**
 * Schema for pagination configuration.
 */
const paginationConfigSchema = z
  .object({
    /** Pagination strategy. */
    type: z.enum(["offset", "cursor"]),
    /** Number of rows per page. Defaults to 10. */
    pageSize: z.number().int().min(1).optional(),
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
export const dataTableConfigSchema = baseComponentConfigSchema
  .extend({
    /** Component type discriminator. */
    type: z.literal("data-table"),
    /** Data source endpoint (e.g. "GET /api/users") or a FromRef. */
    data: z.union([z.string(), fromRefSchema]),
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
    /** Message shown when there is no data. */
    emptyMessage: z.string().optional(),
    /** Enable expandable row detail. */
    expandable: z.boolean().optional(),
    /** Child components rendered in the expanded row area. Row data is available via from-ref. */
    expandedContent: z.array(z.record(z.unknown())).optional(),
    /** Action dispatched when a row is clicked. */
    rowClickAction: actionSchema.optional(),
    /** Table density. Affects row padding. */
    density: z.enum(["compact", "default", "comfortable"]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
