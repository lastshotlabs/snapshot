import type { z } from "zod";
import type { splitPaneConfigSchema } from "./schema";

export type SplitPaneConfig = z.infer<typeof splitPaneConfigSchema>;
