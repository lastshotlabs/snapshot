import type { z } from "zod";
import type { snapshotImageSchema } from "./schema";

/**
 * Inferred config type from the SnapshotImage Zod schema.
 *
 * This is the single source of truth for what props the `<SnapshotImage>`
 * component accepts. Never define this type manually.
 */
export type SnapshotImageConfig = z.infer<typeof snapshotImageSchema>;
export type SnapshotImageConfigInput = z.input<typeof snapshotImageSchema>;
