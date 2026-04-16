import type { z } from "zod";
import type { navUserMenuConfigSchema } from "./schema";
export type NavUserMenuConfig = z.input<typeof navUserMenuConfigSchema>;
