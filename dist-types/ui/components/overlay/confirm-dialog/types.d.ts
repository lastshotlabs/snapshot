import type { z } from "zod";
import type { confirmDialogConfigSchema } from "./schema";
/** Input config type for the ConfirmDialog component. */
export type ConfirmDialogConfig = z.input<typeof confirmDialogConfigSchema>;
