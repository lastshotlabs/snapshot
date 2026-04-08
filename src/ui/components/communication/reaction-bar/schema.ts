import { z } from "zod";
import { actionSchema } from "../../../actions/types";

/** Schema for a FromRef value — `{ from: "component-id.field" }`. */
const fromRefSchema = z.object({ from: z.string() });

/**
 * Zod config schema for the ReactionBar component.
 *
 * Displays emoji reactions with counts and an add button.
 *
 * @example
 * ```json
 * {
 *   "type": "reaction-bar",
 *   "reactions": [
 *     { "emoji": "\ud83d\udc4d", "count": 5, "active": true },
 *     { "emoji": "\u2764\ufe0f", "count": 3 },
 *     { "emoji": "\ud83d\ude02", "count": 2 }
 *   ]
 * }
 * ```
 */
export const reactionBarConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("reaction-bar"),
    /** Static reactions array. */
    reactions: z
      .array(
        z.object({
          /** Emoji character. */
          emoji: z.string(),
          /** Number of reactions. */
          count: z.number(),
          /** Whether the current user reacted. */
          active: z.boolean().optional(),
        }),
      )
      .optional(),
    /** API endpoint for reaction data. */
    data: z.union([z.string(), fromRefSchema]).optional(),
    /** Action dispatched when adding a reaction. */
    addAction: actionSchema.optional(),
    /** Action dispatched when removing a reaction. */
    removeAction: actionSchema.optional(),
    /** Show the "+" button to add reactions. Default: true. */
    showAddButton: z.boolean().optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Visibility toggle. Can be a FromRef for conditional display. */
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
