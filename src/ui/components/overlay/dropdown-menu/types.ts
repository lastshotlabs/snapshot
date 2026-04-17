import type { z } from "zod";
import type { dropdownMenuConfigSchema } from "./schema";

/** Inferred config type from the DropdownMenu Zod schema. */
export type DropdownMenuConfig = z.input<typeof dropdownMenuConfigSchema>;
