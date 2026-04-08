import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Schema for a Kanban board column definition.
 */
export const kanbanColumnSchema = z
  .object({
    /** Unique key matching the value in the column field. */
    key: z.string(),
    /** Display title for the column header. */
    title: z.string(),
    /** Semantic color for the column header accent. */
    color: z
      .enum([
        "primary",
        "secondary",
        "success",
        "warning",
        "destructive",
        "info",
        "muted",
      ])
      .optional(),
    /** Maximum number of cards allowed in this column. */
    limit: z.number().int().min(1).optional(),
  })
  .strict();

/**
 * Zod config schema for the Kanban board component.
 *
 * Renders a column-based card board driven by data from an API endpoint.
 * Cards are placed into columns based on a configurable status/column field.
 *
 * @example
 * ```json
 * {
 *   "type": "kanban",
 *   "data": "GET /api/tasks",
 *   "columns": [
 *     { "key": "todo", "title": "To Do", "color": "info" },
 *     { "key": "in-progress", "title": "In Progress", "color": "warning", "limit": 5 },
 *     { "key": "done", "title": "Done", "color": "success" }
 *   ],
 *   "columnField": "status",
 *   "titleField": "title",
 *   "descriptionField": "description"
 * }
 * ```
 */
export const kanbanConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("kanban"),
    /** API endpoint returning items with a status/column field. Supports FromRef. */
    data: dataSourceSchema.optional(),
    /** Column definitions for the board. */
    columns: z.array(kanbanColumnSchema),
    /** Which data field determines column placement. Default: "status". */
    columnField: z.string().optional(),
    /** Card title field. Default: "title". */
    titleField: z.string().optional(),
    /** Card description field. */
    descriptionField: z.string().optional(),
    /** Card assignee field (shows avatar initials). */
    assigneeField: z.string().optional(),
    /** Card priority field (shows colored dot). */
    priorityField: z.string().optional(),
    /** Action dispatched when a card is clicked. */
    cardAction: actionSchema.optional(),
    /** Enable drag-and-drop reordering of cards between columns. Default: false. */
    sortable: z.boolean().optional(),
    /** Action dispatched when a card is moved via drag-and-drop. */
    reorderAction: actionSchema.optional(),
    /** Message shown when a column has no cards. */
    emptyMessage: z.string().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
