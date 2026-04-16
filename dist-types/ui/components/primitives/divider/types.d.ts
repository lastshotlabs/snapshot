import type { z } from "zod";
import type { dividerConfigSchema } from "./schema";
export type DividerConfig = z.infer<typeof dividerConfigSchema>;
