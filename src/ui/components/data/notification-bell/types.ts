import type { z } from "zod";
import type { notificationBellConfigSchema } from "./schema";

/** Inferred config type from the NotificationBell Zod schema. */
export type NotificationBellConfig = z.infer<typeof notificationBellConfigSchema>;
