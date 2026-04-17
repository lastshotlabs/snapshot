import type { z } from "zod";
import type { popoverConfigSchema } from "./schema";

/** Inferred config type for the Popover component. */
export type PopoverConfig = z.input<typeof popoverConfigSchema>;
