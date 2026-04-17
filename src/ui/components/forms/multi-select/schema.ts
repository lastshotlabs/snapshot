import { z } from "zod";
import { controlEventActionsSchema } from "../../_base/events";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/** Schema for a single option in the multi-select dropdown. */
const optionSchema = z.object({
  /** Display label for the option. */
  label: z.union([z.string(), fromRefSchema]),
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
export const multiSelectConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("multi-select"),
    /** Label text displayed above the select. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Placeholder text when nothing is selected. Default: "Select...". */
    placeholder: z.union([z.string(), fromRefSchema]).optional(),
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
    /** Tiered event action hooks for multi-select interactions. */
    on: controlEventActionsSchema.optional(),
    slots: slotsSchema([
      "root",
      "label",
      "trigger",
      "placeholder",
      "pill",
      "pillLabel",
      "pillRemove",
      "chevron",
      "dropdown",
      "searchContainer",
      "searchInput",
      "loading",
      "error",
      "errorMessage",
      "retryButton",
      "empty",
      "option",
      "optionIndicator",
      "optionIcon",
      "optionLabel",
    ]).optional(),
  }).strict();
