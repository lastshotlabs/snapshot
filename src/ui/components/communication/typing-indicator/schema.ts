import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the TypingIndicator component.
 *
 * Displays an animated "User is typing..." indicator with bouncing dots.
 *
 * @example
 * ```json
 * {
 *   "type": "typing-indicator",
 *   "users": [{ "name": "Alice" }, { "name": "Bob" }]
 * }
 * ```
 */
export const typingIndicatorConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("typing-indicator"),
    /** Users currently typing. Can be a FromRef. */
    users: z
      .union([
        z.array(
          z.object({
            name: z.string(),
            avatar: z.string().optional(),
          }),
        ),
        fromRefSchema,
      ])
      .optional(),
    /** Max users to display before "and N others". Default: 3. */
    maxDisplay: z.number().optional(),
    slots: slotsSchema(["root", "dots", "dot", "text"]).optional(),
  }).strict();
