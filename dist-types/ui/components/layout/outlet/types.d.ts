import type { z } from "zod";
import type { outletComponentSchema } from "./schema";
export type OutletConfig = z.infer<typeof outletComponentSchema>;
