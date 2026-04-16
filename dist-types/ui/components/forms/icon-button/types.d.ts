import type { z } from "zod";
import type { iconButtonConfigSchema } from "./schema";
export type IconButtonConfig = z.input<typeof iconButtonConfigSchema>;
