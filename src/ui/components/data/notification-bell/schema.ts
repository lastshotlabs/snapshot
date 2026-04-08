import { z } from "zod";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the NotificationBell component.
 *
 * Defines all manifest-settable fields for a bell icon with
 * an unread count badge.
 *
 * @example
 * ```json
 * {
 *   "type": "notification-bell",
 *   "count": 5,
 *   "max": 99,
 *   "clickAction": { "type": "navigate", "to": "/notifications" }
 * }
 * ```
 */
export const notificationBellConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("notification-bell"),
    /** Unread notification count. Supports FromRef. */
    count: z.union([z.number(), fromRefSchema]).optional(),
    /** Maximum display count. Shows "{max}+" when exceeded. Default: 99. */
    max: z.number().optional(),
    /** Icon size. Default: "md". */
    size: z.enum(["sm", "md", "lg"]).optional(),
    /** Action dispatched when bell is clicked. */
    clickAction: z.lazy(() => z.record(z.unknown()).pipe(z.any())).optional(),
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
