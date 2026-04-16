import type { z } from "zod";
import type { avatarGroupConfigSchema } from "./schema";
/** Inferred config type from the AvatarGroup Zod schema. */
export type AvatarGroupConfig = z.infer<typeof avatarGroupConfigSchema>;
