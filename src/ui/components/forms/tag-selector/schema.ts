import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the TagSelector component.
 *
 * A tag input that allows selecting from predefined tags or creating new ones.
 * Tags display as colored pills with remove buttons.
 *
 * @example
 * ```json
 * {
 *   "type": "tag-selector",
 *   "id": "topic-tags",
 *   "label": "Topics",
 *   "tags": [
 *     { "label": "React", "value": "react", "color": "#61dafb" },
 *     { "label": "TypeScript", "value": "ts", "color": "#3178c6" }
 *   ],
 *   "allowCreate": true,
 *   "maxTags": 5
 * }
 * ```
 */
export const tagSelectorConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("tag-selector"),
    /** Label displayed above the input. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Predefined available tags. */
    tags: z
      .array(
        z.object({
          /** Display label for the tag. */
          label: z.string(),
          /** Value identifier for the tag. */
          value: z.string(),
          /** CSS color for the tag pill. */
          color: z.string().optional(),
        }),
      )
      .optional(),
    /** API endpoint to fetch tags from. Example: "GET /api/tags". */
    data: dataSourceSchema.optional(),
    /** Field name in API response for the tag label. Default: "label". */
    labelField: z.string().optional(),
    /** Field name in API response for the tag value. Default: "value". */
    valueField: z.string().optional(),
    /** Field name in API response for the tag color. Default: "color". */
    colorField: z.string().optional(),
    /** Currently selected tag values. Supports FromRef. */
    value: z.union([z.array(z.string()), fromRefSchema]).optional(),
    /** Allow creating new tags by typing. Default: false. */
    allowCreate: z.boolean().optional(),
    /** Action dispatched when a new tag is created. */
    createAction: actionSchema.optional(),
    /** Action dispatched when selection changes. */
    changeAction: actionSchema.optional(),
    /** Maximum number of selectable tags. */
    maxTags: z.number().optional(),
    slots: slotsSchema([
      "root",
      "label",
      "field",
      "pill",
      "pillLabel",
      "removeButton",
      "input",
      "dropdown",
      "loading",
      "error",
      "errorMessage",
      "retryButton",
      "option",
      "optionSwatch",
      "optionLabel",
      "createOption",
      "createOptionLabel",
    ]).optional(),
  }).strict();
