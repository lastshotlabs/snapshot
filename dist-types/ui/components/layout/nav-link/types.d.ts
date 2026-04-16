import type { z } from "zod";
import type { navLinkConfigSchema } from "./schema";
export type NavLinkConfig = z.input<typeof navLinkConfigSchema>;
