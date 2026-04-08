import { z } from "zod";
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
export const favoriteButtonConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("favorite-button"),
    /** Whether the favorite is active. Supports FromRef. Default: false. */
    active: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Icon size. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Action dispatched on toggle. */
    toggleAction: z.lazy(() => z.record(z.unknown()).pipe(z.any())).optional(),
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
