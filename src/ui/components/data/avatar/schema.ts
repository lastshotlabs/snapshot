import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
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
export const avatarConfigSchema = extendComponentSchema({
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
    slots: slotsSchema([
      "root",
      "image",
      "initials",
      "icon",
      "fallback",
      "status",
    ]).optional(),
  }).strict();
