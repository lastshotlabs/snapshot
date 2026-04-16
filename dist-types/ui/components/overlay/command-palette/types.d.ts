import type { z } from "zod";
import type { commandPaletteConfigSchema } from "./schema";
/** Inferred config type for the CommandPalette component. */
export type CommandPaletteConfig = z.infer<typeof commandPaletteConfigSchema>;
