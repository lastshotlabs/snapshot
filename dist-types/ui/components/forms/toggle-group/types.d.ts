import type { z } from "zod";
import type { toggleGroupConfigSchema } from "./schema";
export type ToggleGroupConfig = z.input<typeof toggleGroupConfigSchema>;
