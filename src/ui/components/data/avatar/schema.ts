import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the Avatar component.
 *
 * Defines all manifest-settable fields for a user/entity avatar
 * with image, initials, or icon fallback and optional status dot.
 *
 * @example
 * ```json
 * {
 *   "type": "avatar",
 *   "src": "https://example.com/photo.jpg",
 *   "name": "Jane Doe",
 *   "size": "lg",
 *   "status": "online"
 * }
 * ```
 */
export const avatarConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("avatar"),
    /** Image URL. Supports FromRef for dynamic sources. */
    src: z.union([z.string(), fromRefSchema]).optional(),
    /** Alt text for the image. */
    alt: z.string().optional(),
    /** Name used for initials fallback. Supports FromRef. */
    name: z.union([z.string(), fromRefSchema]).optional(),
    /** Icon fallback (rendered as text placeholder). */
    icon: z.string().optional(),
    /** Size. Default: "md". */
    size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
    /** Shape. Default: "circle". */
    shape: z.enum(["circle", "square"]).optional(),
    /** Status indicator dot. */
    status: z.enum(["online", "offline", "busy", "away"]).optional(),
    /** Background color for initials. Default: "primary". */
    color: z.enum(["primary", "secondary", "muted", "accent"]).optional(),
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
