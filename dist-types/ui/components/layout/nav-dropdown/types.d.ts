import type { z } from "zod";
import type { navDropdownConfigSchema } from "./schema";
export type NavDropdownConfig = z.input<typeof navDropdownConfigSchema>;
