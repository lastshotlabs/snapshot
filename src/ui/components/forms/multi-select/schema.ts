import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/** Schema for a single option in the multi-select dropdown. */
const optionSchema = z.object({
  /** Display label for the option. */
  label: z.string(),
  /** Value submitted when the option is selected. */
  value: z.string(),
  /** Optional icon name displayed before the label. */
  icon: z.string().optional(),
  /** Whether this specific option is disabled. */
  disabled: z.boolean().optional(),
});

/**
 * Zod config schema for the MultiSelect component.
 *
 * Defines a dropdown with checkboxes for selecting multiple values,
 * with optional search filtering and pill display.
 *
 * @example
 * ```json
 * {
 *   "type": "multi-select",
 *   "id": "tags",
 *   "label": "Tags",
 *   "placeholder": "Select tags...",
 *   "options": [
 *     { "label": "Bug", "value": "bug", "icon": "bug" },
 *     { "label": "Feature", "value": "feature", "icon": "star" },
 *     { "label": "Docs", "value": "docs", "icon": "file-text" }
 *   ],
 *   "maxSelected": 5,
 *   "searchable": true
 * }
 * ```
 */
export const multiSelectConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("multi-select"),
    /** Label text displayed above the select. */
    label: z.string().optional(),
    /** Placeholder text when nothing is selected. Default: "Select...". */
    placeholder: z.string().optional(),
    /** Static list of options. */
    options: z.array(optionSchema).optional(),
    /** API endpoint string or FromRef for loading options dynamically. */
    data: dataSourceSchema.optional(),
    /** Field name in API response objects to use as the display label. Default: "label". */
    labelField: z.string().optional(),
    /** Field name in API response objects to use as the value. Default: "value". */
    valueField: z.string().optional(),
    /** Initial selected values. Can be a FromRef. */
    value: z.union([z.array(z.string()), fromRefSchema]).optional(),
    /** Maximum number of selections allowed. */
    maxSelected: z.number().optional(),
    /** Whether the dropdown includes a search input. Default: true. */
    searchable: z.boolean().optional(),
    /** Disabled state. Can be a FromRef. */
    disabled: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Action to execute when the selection changes. */
    changeAction: actionSchema.optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
    /** Inline styles. */
    style: z.record(z.string()).optional(),
  })
  .strict();
