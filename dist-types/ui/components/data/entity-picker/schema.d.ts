import { z } from "zod";
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
export declare const entityPickerConfigSchema: z.ZodType<Record<string, any>>;
