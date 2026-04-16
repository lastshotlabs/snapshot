import type { z } from "zod";
import type { hoverCardConfigSchema } from "./schema";
export type HoverCardConfig = z.input<typeof hoverCardConfigSchema>;
