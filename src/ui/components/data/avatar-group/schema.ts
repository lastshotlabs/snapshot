import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema, fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the AvatarGroup component.
 *
 * Displays a row of overlapping avatars with an optional "+N" overflow
 * count. Commonly used for showing team members, assignees, or participants.
 *
 * @example
 * ```json
 * {
 *   "type": "avatar-group",
 *   "avatars": [
 *     { "name": "Alice", "src": "/avatars/alice.jpg" },
 *     { "name": "Bob" },
 *     { "name": "Charlie", "src": "/avatars/charlie.jpg" },
 *     { "name": "Diana" },
 *     { "name": "Eve" }
 *   ],
 *   "max": 3,
 *   "size": "md"
 * }
 * ```
 */
export const avatarGroupConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("avatar-group"),
    /** Static avatar list. */
    avatars: z
      .array(
        z.object({
          /** Display name (used for initials fallback and tooltip). */
          name: z.string(),
          /** Image URL. */
          src: z.string().optional(),
        }),
      )
      .optional(),
    /** API endpoint for avatar data. */
    data: dataSourceSchema.optional(),
    /** Field name for the name in API results. Default: "name". */
    nameField: z.string().optional(),
    /** Field name for the avatar image URL. Default: "avatar". */
    srcField: z.string().optional(),
    /** Maximum avatars to show before "+N" overflow. Default: 5. */
    max: z.number().optional(),
    /** Size variant. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Overlap amount in pixels. Negative margin between avatars. Default: auto. */
    overlap: z.number().optional(),
    slots: slotsSchema(["root", "item", "image", "initials", "overflow"]).optional(),
  }).strict();
