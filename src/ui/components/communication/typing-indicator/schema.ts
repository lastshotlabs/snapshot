import { z } from "zod";
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
export const typingIndicatorConfigSchema = z
  .object({
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
