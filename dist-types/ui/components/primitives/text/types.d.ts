import type { z } from "zod";
import type { textConfigSchema } from "./schema";
export type TextConfig = z.infer<typeof textConfigSchema>;
