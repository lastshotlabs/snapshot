import { z } from "zod";
import { actionSchema } from "../../../actions/types";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

/** Schema for a single filter option (label + value pair). */
const filterOptionSchema = z.object({
  /** Display label for the option. */
  label: z.string(),
  /** Value submitted when this option is selected. */
  value: z.string(),
});

/** Schema for a single filter definition (dropdown). */
const filterDefinitionSchema = z.object({
  /** Unique key used in the published filter state object. */
  key: z.string(),
  /** Display label for the filter dropdown button. */
  label: z.string(),
  /** Available options in the dropdown. */
  options: z.array(filterOptionSchema),
  /** When true, allows selecting multiple options. */
  multiple: z.boolean().optional(),
});

/**
 * Zod config schema for the FilterBar component.
 *
 * Renders a search input + filter dropdowns + active filter pills.
 * Publishes `{ search, filters }` to the page context.
 *
 * @example
 * ```json
 * {
 *   "type": "filter-bar",
 *   "id": "user-filters",
 *   "searchPlaceholder": "Search users...",
 *   "filters": [
 *     {
 *       "key": "role",
 *       "label": "Role",
 *       "options": [
 *         { "label": "Admin", "value": "admin" },
 *         { "label": "User", "value": "user" }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export const filterBarConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("filter-bar"),
    /** Placeholder text for the search input. Default: "Search...". */
    searchPlaceholder: z.string().optional(),
    /** Whether to show the search input. Default: true. */
    showSearch: z.boolean().optional(),
    /** Filter definitions — each renders a dropdown button. */
    filters: z.array(filterDefinitionSchema).optional(),
    /** Action dispatched when any filter value changes. */
    changeAction: actionSchema.optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
