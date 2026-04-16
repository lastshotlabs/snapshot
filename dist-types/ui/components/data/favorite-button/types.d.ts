import type { z } from "zod";
import type { favoriteButtonConfigSchema } from "./schema";
/** Inferred config type from the FavoriteButton Zod schema. */
export type FavoriteButtonConfig = z.input<typeof favoriteButtonConfigSchema>;
