import type { z } from "zod";
import type { stackConfigSchema } from "./schema";
export type StackConfig = z.infer<typeof stackConfigSchema>;
