import type { z } from "zod";
import type { navSectionConfigSchema } from "./schema";
export type NavSectionConfig = z.input<typeof navSectionConfigSchema>;
