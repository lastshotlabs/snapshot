import type { z } from "zod";
import type { rowConfigSchema } from "./schema";
export type RowConfig = z.input<typeof rowConfigSchema>;
