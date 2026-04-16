import type { z } from "zod";
import type { sectionConfigSchema } from "./schema";
export type SectionConfig = z.input<typeof sectionConfigSchema>;
