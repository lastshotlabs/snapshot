import type { contextMenuConfigSchema } from "./schema";
import type { z } from "zod";

/** Inferred config type for the ContextMenu component. */
export type ContextMenuConfig = z.input<typeof contextMenuConfigSchema>;
