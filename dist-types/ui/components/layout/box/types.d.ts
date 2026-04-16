import type { z } from "zod";
import type { boxConfigSchema } from "./schema";
export type BoxConfig = z.input<typeof boxConfigSchema>;
