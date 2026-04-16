import type { z } from "zod";
import type { navSearchConfigSchema } from "./schema";
export type NavSearchConfig = z.input<typeof navSearchConfigSchema>;
