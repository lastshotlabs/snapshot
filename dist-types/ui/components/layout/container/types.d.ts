import type { z } from "zod";
import type { containerConfigSchema } from "./schema";
export type ContainerConfig = z.input<typeof containerConfigSchema>;
