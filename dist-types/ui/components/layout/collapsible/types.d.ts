import type { z } from "zod";
import type { collapsibleConfigSchema } from "./schema";
export type CollapsibleConfig = z.input<typeof collapsibleConfigSchema>;
