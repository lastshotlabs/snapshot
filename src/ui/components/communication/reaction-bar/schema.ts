import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { dataSourceSchema } from "../../_base/types";

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
export const reactionBarConfigSchema = extendComponentSchema({
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
    data: dataSourceSchema.optional(),
    /** Action dispatched when adding a reaction. */
    addAction: actionSchema.optional(),
    /** Action dispatched when removing a reaction. */
    removeAction: actionSchema.optional(),
    /** Show the "+" button to add reactions. Default: true. */
    showAddButton: z.boolean().optional(),
    slots: slotsSchema([
      "root",
      "reaction",
      "emoji",
      "count",
      "addWrapper",
      "addButton",
      "picker",
    ]).optional(),
  }).strict();
