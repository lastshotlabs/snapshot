import type { z } from "zod";
import type { gridConfigSchema } from "./schema";
export type GridConfig = z.input<typeof gridConfigSchema>;
