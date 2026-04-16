import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { errorStateConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the EntityPicker component.
 *
 * A searchable dropdown for selecting entities (users, documents, items)
 * from an API endpoint. Supports single and multi-select.
 *
 * @example
 * ```json
 * {
 *   "type": "entity-picker",
 *   "id": "user-picker",
 *   "label": "Assign to...",
 *   "data": "GET /api/users",
 *   "labelField": "name",
 *   "valueField": "id",
 *   "descriptionField": "email",
 *   "avatarField": "avatar_url",
 *   "multiple": true
 * }
 * ```
 */
export const entityPickerConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("entity-picker"),
    /** Trigger button label. Default: "Select...". */
    label: z.string().optional(),
    /** API endpoint to fetch entities. Example: "GET /api/users". */
    data: dataSourceSchema,
    /** Field name for display label. Default: "name". */
    labelField: z.string().optional(),
    /** Field name for value/id. Default: "id". */
    valueField: z.string().optional(),
    /** Field name for secondary text. */
    descriptionField: z.string().optional(),
    /** Field name for icon identifier. */
    iconField: z.string().optional(),
    /** Field name for avatar URL. */
    avatarField: z.string().optional(),
    /** Enable search filtering. Default: true. */
    searchable: z.boolean().optional(),
    /** Allow multiple selection. Default: false. */
    multiple: z.boolean().optional(),
    /** Currently selected value(s). Supports FromRef. */
    value: z.union([z.string(), z.array(z.string()), fromRefSchema]).optional(),
    /** Action dispatched when selection changes. */
    changeAction: actionSchema.optional(),
    /** Max height for the dropdown list. Default: "300px". */
    maxHeight: z.string().optional(),
    /** Error state config. */
    error: errorStateConfigSchema.optional(),
    slots: slotsSchema([
      "root",
      "trigger",
      "triggerLabel",
      "triggerIcon",
      "dropdown",
      "searchContainer",
      "searchInput",
      "list",
      "loading",
      "error",
      "empty",
      "item",
      "itemSelection",
      "itemAvatar",
      "itemIcon",
      "itemContent",
      "itemLabel",
      "itemDescription",
      "itemCheck",
    ]).optional(),
  }).strict();
