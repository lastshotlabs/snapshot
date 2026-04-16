import type { z } from "zod";
import type { notificationFeedConfigSchema } from "./schema";
/** Inferred config type from the NotificationFeed Zod schema. */
export type NotificationFeedConfig = z.input<typeof notificationFeedConfigSchema>;
