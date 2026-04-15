import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the FavoriteButton component.
 *
 * Defines all manifest-settable fields for a star toggle button
 * used to mark items as favorites.
 *
 * @example
 * ```json
 * {
 *   "type": "favorite-button",
 *   "active": false,
 *   "size": "md",
 *   "toggleAction": { "type": "api", "method": "POST", "endpoint": "/api/favorites" }
 * }
 * ```
 */
export const favoriteButtonConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("favorite-button"),
    /** Whether the favorite is active. Supports FromRef. Default: false. */
    active: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Icon size. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Action dispatched on toggle. */
    toggleAction: actionSchema.optional(),
    slots: slotsSchema(["root", "icon"]).optional(),
  })
  .strict();
