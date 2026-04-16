import { z } from "zod";
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
export declare const multiSelectConfigSchema: z.ZodType<Record<string, any>>;
