import type { z } from "zod";
import type { navLogoConfigSchema } from "./schema";
export type NavLogoConfig = z.input<typeof navLogoConfigSchema>;
