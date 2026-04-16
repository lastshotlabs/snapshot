import type { z } from "zod";
import type { oauthButtonsConfigSchema } from "./schema";
export type OAuthButtonsConfig = z.infer<typeof oauthButtonsConfigSchema>;
