import type { z } from "zod";
import type { passkeyButtonConfigSchema } from "./schema";
export type PasskeyButtonConfig = z.infer<typeof passkeyButtonConfigSchema>;
