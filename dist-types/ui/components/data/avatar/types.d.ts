import type { z } from "zod";
import type { avatarConfigSchema } from "./schema";
/** Inferred config type from the Avatar Zod schema. */
export type AvatarConfig = z.infer<typeof avatarConfigSchema>;
