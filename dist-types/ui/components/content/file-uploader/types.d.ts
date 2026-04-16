import type { z } from "zod";
import type { fileUploaderConfigSchema } from "./schema";
/** Inferred config type from the FileUploader Zod schema. */
export type FileUploaderConfig = z.input<typeof fileUploaderConfigSchema>;
/** Internal state for a file in the upload queue. */
export interface UploadFileEntry {
    /** The native File object. */
    file: File;
    /** Unique identifier for this entry. */
    id: string;
    /** Upload status. */
    status: "pending" | "uploading" | "completed" | "error";
    /** Upload progress percentage (0-100). */
    progress: number;
    /** Error message if upload failed. */
    errorMessage?: string;
}
