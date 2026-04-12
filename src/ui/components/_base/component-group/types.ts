import type { z } from "zod";
import type { componentGroupConfigSchema } from "./schema";

export type ComponentGroupConfig = z.input<typeof componentGroupConfigSchema>;
